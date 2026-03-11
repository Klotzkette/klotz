importScripts('trackers.js');

// Store tracker data per tab
const tabTrackers = {};

// Store cookies per tab
const tabCookies = {};

// Blocked domains set
let blockedDomains = {};

// Load blocked domains on startup
chrome.storage.local.get(['blockedDomains'], (result) => {
  if (result?.blockedDomains) {
    blockedDomains = result.blockedDomains;
    updateBlockRules();
  }
});

// Clear data when a tab navigates to a new page
chrome.webNavigation?.onBeforeNavigate?.addListener((details) => {
  if (details.frameId === 0) {
    tabTrackers[details.tabId] = {};
    tabCookies[details.tabId] = {};
  }
});

// Listen to all web requests to detect trackers
chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    const tabId = details.tabId;
    if (tabId < 0) return; // Ignore non-tab requests

    chrome.tabs.get(tabId, (tab) => {
      if (chrome.runtime.lastError || !tab?.url) return;

      const pageUrl = tab.url;
      const requestUrl = details.url;

      // Only track third-party requests
      if (!isThirdParty(requestUrl, pageUrl)) return;

      const trackerInfo = identifyTracker(requestUrl);
      const requestData = parseRequestData(requestUrl);

      // Extract cookies from request headers
      const cookieHeader = details.requestHeaders?.find(
        h => h.name.toLowerCase() === 'cookie'
      );
      const cookies = cookieHeader ? parseCookieHeader(cookieHeader.value) : {};

      // Extract other tracking-related headers
      const referer = details.requestHeaders?.find(
        h => h.name.toLowerCase() === 'referer'
      )?.value || null;

      const hostname = new URL(requestUrl).hostname;

      if (!tabTrackers[tabId]) tabTrackers[tabId] = {};

      const entry = {
        url: requestUrl,
        hostname: hostname,
        type: details.type,
        timestamp: Date.now(),
        trackerInfo: trackerInfo || {
          name: hostname,
          category: "Unbekannt",
          company: "Unbekannt",
          domain: hostname
        },
        sentData: {
          urlParams: requestData,
          cookies: cookies,
          referer: referer,
          method: details.method
        },
        requestCount: 1
      };

      // Group by hostname
      if (tabTrackers[tabId][hostname]) {
        tabTrackers[tabId][hostname].requests.push(entry);
        tabTrackers[tabId][hostname].requestCount++;
        // Merge cookies
        Object.assign(tabTrackers[tabId][hostname].allCookies, cookies);
        // Merge URL params
        Object.assign(tabTrackers[tabId][hostname].allParams, requestData);
      } else {
        tabTrackers[tabId][hostname] = {
          hostname: hostname,
          trackerInfo: entry.trackerInfo,
          requests: [entry],
          requestCount: 1,
          allCookies: { ...cookies },
          allParams: { ...requestData },
          firstSeen: Date.now()
        };
      }

      // Notify content script about the update
      chrome.tabs.sendMessage(tabId, {
        type: 'TRACKER_UPDATE',
        data: getTabSummary(tabId)
      }).catch(() => {});
    });
  },
  { urls: ["<all_urls>"] },
  ["requestHeaders"]
);

// Also capture response headers (set-cookie)
chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    const tabId = details.tabId;
    if (tabId < 0) return;

    const hostname = new URL(details.url).hostname;

    // Check for Set-Cookie headers
    const setCookies = details.responseHeaders?.filter(
      h => h.name.toLowerCase() === 'set-cookie'
    ) || [];

    if (setCookies.length > 0 && tabTrackers[tabId]?.[hostname]) {
      if (!tabTrackers[tabId][hostname].receivedCookies) {
        tabTrackers[tabId][hostname].receivedCookies = [];
      }
      for (const sc of setCookies) {
        tabTrackers[tabId][hostname].receivedCookies.push(parseSingleSetCookie(sc.value));
      }
    }
  },
  { urls: ["<all_urls>"] },
  ["responseHeaders"]
);

// Parse Cookie header string into object
function parseCookieHeader(cookieStr) {
  const cookies = {};
  if (!cookieStr) return cookies;
  cookieStr.split(';').forEach(pair => {
    const [name, ...rest] = pair.trim().split('=');
    if (name) {
      cookies[name.trim()] = rest.join('=').trim();
    }
  });
  return cookies;
}

// Parse a single Set-Cookie header
function parseSingleSetCookie(value) {
  const parts = value.split(';');
  const [name, ...rest] = parts[0].split('=');
  const cookie = {
    name: name?.trim() || '',
    value: rest.join('=').trim(),
    attributes: {}
  };
  for (let i = 1; i < parts.length; i++) {
    const [attrName, ...attrRest] = parts[i].trim().split('=');
    cookie.attributes[attrName.trim().toLowerCase()] = attrRest.join('=').trim() || true;
  }
  return cookie;
}

// Get summary data for a tab
function getTabSummary(tabId) {
  const trackers = tabTrackers[tabId] || {};
  const trackerList = Object.values(trackers).map(t => ({
    hostname: t.hostname,
    name: t.trackerInfo.name,
    category: t.trackerInfo.category,
    company: t.trackerInfo.company,
    requestCount: t.requestCount,
    allCookies: t.allCookies,
    allParams: t.allParams,
    receivedCookies: t.receivedCookies || [],
    requests: t.requests.map(r => ({
      url: r.url,
      type: r.type,
      method: r.sentData.method,
      timestamp: r.timestamp,
      sentData: r.sentData
    }))
  }));

  // Sort: known trackers first, then by request count
  trackerList.sort((a, b) => {
    if (a.category !== 'Unbekannt' && b.category === 'Unbekannt') return -1;
    if (a.category === 'Unbekannt' && b.category !== 'Unbekannt') return 1;
    return b.requestCount - a.requestCount;
  });

  return {
    totalTrackers: trackerList.length,
    totalRequests: trackerList.reduce((sum, t) => sum + t.requestCount, 0),
    trackers: trackerList,
    categories: countCategories(trackerList)
  };
}

function countCategories(trackerList) {
  const cats = {};
  for (const t of trackerList) {
    cats[t.category] = (cats[t.category] || 0) + 1;
  }
  return cats;
}

// --- Blocking functionality using declarativeNetRequest ---

async function updateBlockRules() {
  try {
    // Get existing dynamic rules
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const removeRuleIds = existingRules.map(r => r.id);

    // Create new rules from blocked domains
    const domains = Object.keys(blockedDomains);
    const addRules = domains.map((domain, index) => ({
      id: index + 1,
      priority: 1,
      action: { type: 'block' },
      condition: {
        urlFilter: `||${domain}`,
        resourceTypes: [
          'script', 'image', 'stylesheet', 'font', 'xmlhttprequest',
          'ping', 'media', 'websocket', 'sub_frame', 'other'
        ]
      }
    }));

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: removeRuleIds,
      addRules: addRules
    });
  } catch (err) {
    console.error('Error updating block rules:', err);
  }
}

// Listen for messages from content script / popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_TRACKER_DATA') {
    const tabId = message.tabId || sender.tab?.id;
    if (tabId) {
      sendResponse(getTabSummary(tabId));
    } else {
      sendResponse({ totalTrackers: 0, totalRequests: 0, trackers: [], categories: {} });
    }
    return true;
  }

  if (message.type === 'GET_COOKIES_FOR_TAB') {
    const tabId = message.tabId || sender.tab?.id;
    if (tabId) {
      chrome.tabs.get(tabId, (tab) => {
        if (chrome.runtime.lastError || !tab?.url) {
          sendResponse([]);
          return;
        }
        chrome.cookies.getAll({ url: tab.url }, (cookies) => {
          sendResponse(cookies || []);
        });
      });
      return true;
    }
  }

  if (message.type === 'UPDATE_BLOCK_RULES') {
    blockedDomains = message.blockedDomains || {};
    chrome.storage.local.set({ blockedDomains });
    updateBlockRules().then(() => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// Clean up when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  delete tabTrackers[tabId];
  delete tabCookies[tabId];
});
