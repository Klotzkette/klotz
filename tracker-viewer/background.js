/**
 * Tracker Viewer - Background Service Worker
 *
 * DATENSCHUTZ-HINWEIS:
 * Dieses Plugin arbeitet zu 100% lokal im Browser.
 * Es werden KEINE Daten an externe Server, Dritte oder den Entwickler gesendet.
 * Alle Tracker-Analysen und Cookie-Auswertungen finden
 * ausschließlich lokal auf dem Gerät des Nutzers statt.
 */
importScripts('trackers.js');

// ============================================================
// State
// ============================================================
const tabTrackers = {};   // tabId -> { hostname -> trackerData }
const tabUrls = {};       // tabId -> pageUrl
const pendingUpdates = {}; // tabId -> timeoutId
let shieldActive = false;
let blockedCount = 0;

// Restore shield state on startup
chrome.storage.local.get(['shieldActive', 'blockedCount'], (result) => {
  shieldActive = result.shieldActive || false;
  blockedCount = result.blockedCount || 0;
  if (shieldActive) {
    applyBlockingRules();
  }
});

// ============================================================
// Schutzschirm: Block all tracker domains via declarativeNetRequest
// Tracker bekommen generische Fake-Null-Daten zurueck
// ============================================================

// Verschiedene Fake-Antworten je nach Request-Typ:
// Scripts bekommen leeres JS, Bilder ein 1x1 Pixel, XHR bekommt Fake-JSON
const FAKE_RESPONSES = {
  // Leeres JavaScript — Tracker-Script laeuft ins Leere
  script: "data:text/javascript;base64," + btoa('void(0);/*N/A*/'),
  // 1x1 transparentes GIF — Tracking-Pixel sieht "Erfolg", kriegt aber nichts
  image: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  // Fake JSON mit Null-Daten — Analytics-Endpunkte bekommen "Antwort"
  xhr: "data:application/json;base64," + btoa(JSON.stringify({
    status: "ok", data: null, results: [], count: 0, id: "00000000",
    client_id: "N/A", session_id: "N/A", user_id: "N/A",
    tracking: false, consent: false, opted_out: true
  })),
  // Leeres HTML fuer iframes
  frame: "data:text/html;base64," + btoa('<html><head></head><body></body></html>'),
  // Leeres CSS
  style: "data:text/css;base64," + btoa('/* N/A */'),
  // Generischer Fallback
  other: "data:text/plain;base64," + btoa('N/A')
};

function buildBlockingRules() {
  const domains = Object.keys(TRACKER_DATABASE);
  const rules = [];
  let ruleId = 1;

  for (const domain of domains) {
    // Script-Requests -> leeres JS
    rules.push({
      id: ruleId++,
      priority: 1,
      action: { type: "redirect", redirect: { url: FAKE_RESPONSES.script } },
      condition: { requestDomains: [domain], resourceTypes: ["script"] }
    });
    // Bild-Requests -> 1x1 Pixel
    rules.push({
      id: ruleId++,
      priority: 1,
      action: { type: "redirect", redirect: { url: FAKE_RESPONSES.image } },
      condition: { requestDomains: [domain], resourceTypes: ["image"] }
    });
    // XHR/Fetch -> Fake-JSON
    rules.push({
      id: ruleId++,
      priority: 1,
      action: { type: "redirect", redirect: { url: FAKE_RESPONSES.xhr } },
      condition: { requestDomains: [domain], resourceTypes: ["xmlhttprequest"] }
    });
    // iframes -> leeres HTML
    rules.push({
      id: ruleId++,
      priority: 1,
      action: { type: "redirect", redirect: { url: FAKE_RESPONSES.frame } },
      condition: { requestDomains: [domain], resourceTypes: ["sub_frame"] }
    });
    // CSS -> leeres Stylesheet
    rules.push({
      id: ruleId++,
      priority: 1,
      action: { type: "redirect", redirect: { url: FAKE_RESPONSES.style } },
      condition: { requestDomains: [domain], resourceTypes: ["stylesheet"] }
    });
    // Alles andere -> Fallback
    rules.push({
      id: ruleId++,
      priority: 1,
      action: { type: "redirect", redirect: { url: FAKE_RESPONSES.other } },
      condition: { requestDomains: [domain], resourceTypes: ["font", "media", "ping", "other"] }
    });
  }

  return rules;
}

// Cache rule IDs for fast removal
let activeRuleCount = 0;

function applyBlockingRules() {
  const rules = buildBlockingRules();
  activeRuleCount = rules.length;
  const ruleIds = rules.map(r => r.id);
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: ruleIds,
    addRules: rules
  }, () => {
    if (chrome.runtime.lastError) {
      console.warn('Schutzschirm Fehler:', chrome.runtime.lastError.message);
    }
  });
}

function removeBlockingRules() {
  const ruleIds = [];
  for (let i = 1; i <= activeRuleCount; i++) ruleIds.push(i);
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: ruleIds
  }, () => {
    if (chrome.runtime.lastError) {
      console.warn('Schutzschirm Fehler:', chrome.runtime.lastError.message);
    }
  });
}

function toggleShield() {
  shieldActive = !shieldActive;
  if (shieldActive) {
    applyBlockingRules();
  } else {
    removeBlockingRules();
  }
  chrome.storage.local.set({ shieldActive });
  // Notify all tabs about shield state change
  chrome.tabs.query({}, (tabs) => {
    for (const tab of tabs) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'SHIELD_STATE',
        active: shieldActive,
        blockedCount
      }).catch(() => {});
    }
  });
  return shieldActive;
}

// ============================================================
// Tab URL tracking
// ============================================================
chrome.webNavigation.onCommitted.addListener((details) => {
  if (details.frameId === 0) {
    tabUrls[details.tabId] = details.url;
    tabTrackers[details.tabId] = {};
    scheduleUIUpdate(details.tabId);
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url) tabUrls[tabId] = changeInfo.url;
});

chrome.tabs.onRemoved.addListener((tabId) => {
  delete tabTrackers[tabId];
  delete tabUrls[tabId];
  if (pendingUpdates[tabId]) {
    clearTimeout(pendingUpdates[tabId]);
    delete pendingUpdates[tabId];
  }
});

// ============================================================
// Request interception: detect & record third-party trackers
// ============================================================
chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    const tabId = details.tabId;
    if (tabId < 0) return;

    const pageUrl = tabUrls[tabId];
    if (!pageUrl) return;

    const requestUrl = details.url;
    if (!isThirdParty(requestUrl, pageUrl)) return;

    let hostname;
    try { hostname = new URL(requestUrl).hostname; } catch { return; }

    const trackerInfo = identifyTracker(requestUrl);
    const requestData = parseRequestData(requestUrl);

    const cookieHeader = details.requestHeaders?.find(
      h => h.name.toLowerCase() === 'cookie'
    );
    const cookies = cookieHeader ? parseCookieHeader(cookieHeader.value) : {};

    const referer = details.requestHeaders?.find(
      h => h.name.toLowerCase() === 'referer'
    )?.value || null;

    if (!tabTrackers[tabId]) tabTrackers[tabId] = {};

    // Count blocked requests when shield is active
    if (shieldActive && trackerInfo) {
      blockedCount++;
      chrome.storage.local.set({ blockedCount });
    }

    const entry = {
      url: requestUrl,
      hostname,
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
        cookies,
        referer,
        method: details.method
      },
      blocked: shieldActive && !!trackerInfo
    };

    const existing = tabTrackers[tabId][hostname];
    if (existing) {
      existing.requests.push(entry);
      existing.requestCount++;
      Object.assign(existing.allCookies, cookies);
      Object.assign(existing.allParams, requestData);
    } else {
      tabTrackers[tabId][hostname] = {
        hostname,
        trackerInfo: entry.trackerInfo,
        requests: [entry],
        requestCount: 1,
        allCookies: { ...cookies },
        allParams: { ...requestData },
        receivedCookies: [],
        firstSeen: Date.now()
      };
    }

    scheduleUIUpdate(tabId);
  },
  { urls: ["<all_urls>"] },
  ["requestHeaders"]
);

// ============================================================
// Response interception: capture Set-Cookie headers
// ============================================================
chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    const tabId = details.tabId;
    if (tabId < 0) return;

    let hostname;
    try { hostname = new URL(details.url).hostname; } catch { return; }

    const setCookies = details.responseHeaders?.filter(
      h => h.name.toLowerCase() === 'set-cookie'
    );
    if (!setCookies?.length) return;

    const tracker = tabTrackers[tabId]?.[hostname];
    if (!tracker) return;

    for (const sc of setCookies) {
      tracker.receivedCookies.push(parseSingleSetCookie(sc.value));
    }
  },
  { urls: ["<all_urls>"] },
  ["responseHeaders"]
);

// ============================================================
// Debounced UI updates
// ============================================================
function scheduleUIUpdate(tabId) {
  if (pendingUpdates[tabId]) return;
  pendingUpdates[tabId] = setTimeout(() => {
    delete pendingUpdates[tabId];
    const summary = getTabSummary(tabId);
    chrome.tabs.sendMessage(tabId, {
      type: 'TRACKER_UPDATE',
      data: summary
    }).catch(() => {});
  }, 300);
}

// ============================================================
// Helpers
// ============================================================
function parseCookieHeader(cookieStr) {
  const cookies = {};
  if (!cookieStr) return cookies;
  const pairs = cookieStr.split(';');
  for (let i = 0; i < pairs.length; i++) {
    const eq = pairs[i].indexOf('=');
    if (eq > 0) {
      cookies[pairs[i].substring(0, eq).trim()] = pairs[i].substring(eq + 1).trim();
    }
  }
  return cookies;
}

function parseSingleSetCookie(value) {
  const parts = value.split(';');
  const eq = parts[0].indexOf('=');
  const cookie = {
    name: eq > 0 ? parts[0].substring(0, eq).trim() : parts[0].trim(),
    value: eq > 0 ? parts[0].substring(eq + 1).trim() : '',
    attributes: {}
  };
  for (let i = 1; i < parts.length; i++) {
    const aeq = parts[i].indexOf('=');
    if (aeq > 0) {
      cookie.attributes[parts[i].substring(0, aeq).trim().toLowerCase()] = parts[i].substring(aeq + 1).trim();
    } else {
      cookie.attributes[parts[i].trim().toLowerCase()] = true;
    }
  }
  return cookie;
}

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
    receivedCookies: t.receivedCookies,
    requests: t.requests.slice(-20).map(r => ({
      url: r.url,
      type: r.type,
      method: r.sentData.method,
      timestamp: r.timestamp,
      sentData: r.sentData,
      blocked: r.blocked
    }))
  }));

  trackerList.sort((a, b) => {
    const aKnown = a.category !== 'Unbekannt' ? 1 : 0;
    const bKnown = b.category !== 'Unbekannt' ? 1 : 0;
    if (aKnown !== bKnown) return bKnown - aKnown;
    return b.requestCount - a.requestCount;
  });

  const categories = {};
  let totalRequests = 0;
  for (const t of trackerList) {
    categories[t.category] = (categories[t.category] || 0) + 1;
    totalRequests += t.requestCount;
  }

  return {
    totalTrackers: trackerList.length,
    totalRequests,
    trackers: trackerList,
    categories,
    shieldActive,
    blockedCount
  };
}

// ============================================================
// Message handling
// ============================================================
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_TRACKER_DATA') {
    const tabId = message.tabId || sender.tab?.id;
    sendResponse(tabId ? getTabSummary(tabId) : { totalTrackers: 0, totalRequests: 0, trackers: [], categories: {}, shieldActive, blockedCount });
    return true;
  }

  if (message.type === 'TOGGLE_SHIELD') {
    const newState = toggleShield();
    sendResponse({ active: newState, blockedCount });
    return true;
  }

  if (message.type === 'GET_SHIELD_STATE') {
    sendResponse({ active: shieldActive, blockedCount });
    return true;
  }

  if (message.type === 'GET_COOKIES_FOR_TAB') {
    const tabId = message.tabId || sender.tab?.id;
    if (tabId) {
      chrome.tabs.get(tabId, (tab) => {
        if (chrome.runtime.lastError || !tab?.url) { sendResponse([]); return; }
        chrome.cookies.getAll({ url: tab.url }, (cookies) => sendResponse(cookies || []));
      });
      return true;
    }
    sendResponse([]);
    return true;
  }
});
