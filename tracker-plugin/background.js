// ============================================================
// Tracker Watch – Background Service Worker
// Intercepts all network requests and matches against known
// tracker domains. Pushes live updates to the sidebar.
// ============================================================

const TRACKER_DB = {
  // ── Google ──────────────────────────────────────────────
  'google-analytics': {
    name: 'Google Analytics',
    category: 'Analytics',
    company: 'Google',
    color: '#4285F4',
    icon: 'G',
    domains: ['google-analytics.com', 'analytics.google.com', 'ssl.google-analytics.com'],
    description: 'Erfasst Seitenaufrufe, Sitzungen, Absprungraten und Nutzerverhalten.',
  },
  'google-tag-manager': {
    name: 'Google Tag Manager',
    category: 'Tag Manager',
    company: 'Google',
    color: '#4285F4',
    icon: 'G',
    domains: ['googletagmanager.com'],
    description: 'Lädt beliebige weitere Tracker nach – fungiert als Tor für Drittanbieter.',
  },
  'google-ads': {
    name: 'Google Ads / DoubleClick',
    category: 'Werbung',
    company: 'Google',
    color: '#FBBC04',
    icon: 'G',
    domains: [
      'googleadservices.com', 'googlesyndication.com', 'doubleclick.net',
      'adservice.google.com', 'pagead2.googlesyndication.com',
    ],
    description: 'Werbe-Konversionstracking und Retargeting für Google Ads.',
  },
  'google-fonts': {
    name: 'Google Fonts / APIs',
    category: 'CDN',
    company: 'Google',
    color: '#34A853',
    icon: 'G',
    domains: ['fonts.googleapis.com', 'fonts.gstatic.com', 'ajax.googleapis.com'],
    description: 'Schriften-CDN – überträgt IP-Adresse und Browser-Infos an Google.',
  },
  'google-recaptcha': {
    name: 'Google reCAPTCHA',
    category: 'Sicherheit / Tracking',
    company: 'Google',
    color: '#EA4335',
    icon: 'G',
    domains: ['www.google.com/recaptcha', 'recaptcha.google.com', 'recaptcha.net'],
    description: 'Bot-Schutz – sammelt dabei umfangreiche Browser-Fingerprint-Daten.',
  },

  // ── Meta / Facebook ──────────────────────────────────────
  'facebook-pixel': {
    name: 'Meta Pixel (Facebook)',
    category: 'Werbung',
    company: 'Meta',
    color: '#1877F2',
    icon: 'f',
    domains: [
      'connect.facebook.net', 'facebook.net', 'facebook.com/tr',
      'an.facebook.com', 'pixel.facebook.com',
    ],
    description: 'Konversionstracking und Aufbau von Custom Audiences für Facebook-Werbung.',
  },

  // ── X / Twitter ──────────────────────────────────────────
  'twitter-analytics': {
    name: 'X (Twitter) Tracking',
    category: 'Analytics',
    company: 'X Corp',
    color: '#000000',
    icon: 'X',
    domains: [
      'analytics.twitter.com', 'ads.twitter.com',
      'static.ads-twitter.com', 'platform.twitter.com',
    ],
    description: 'Tweet-Engagement- und Konversionstracking für X-Werbung.',
  },

  // ── LinkedIn ─────────────────────────────────────────────
  'linkedin-insight': {
    name: 'LinkedIn Insight Tag',
    category: 'Analytics',
    company: 'LinkedIn',
    color: '#0A66C2',
    icon: 'in',
    domains: ['snap.licdn.com', 'platform.linkedin.com', 'linkedin.com/insight'],
    description: 'B2B-Konversionstracking und Retargeting-Zielgruppen für LinkedIn-Anzeigen.',
  },

  // ── TikTok ───────────────────────────────────────────────
  'tiktok-pixel': {
    name: 'TikTok Pixel',
    category: 'Werbung',
    company: 'TikTok / ByteDance',
    color: '#69C9D0',
    icon: 'TT',
    domains: ['analytics.tiktok.com', 'ads.tiktok.com', 'mon.tiktok.com'],
    description: 'Konversionstracking und Audience-Building für TikTok-Anzeigen.',
  },

  // ── Snap ─────────────────────────────────────────────────
  'snapchat-pixel': {
    name: 'Snap Pixel',
    category: 'Werbung',
    company: 'Snap Inc.',
    color: '#FFFC00',
    icon: 'S',
    domains: ['sc-static.net', 'tr.snapchat.com'],
    description: 'Konversionstracking für Snapchat-Werbeanzeigen.',
  },

  // ── Pinterest ────────────────────────────────────────────
  'pinterest-tag': {
    name: 'Pinterest Tag',
    category: 'Werbung',
    company: 'Pinterest',
    color: '#E60023',
    icon: 'P',
    domains: ['ct.pinterest.com', 'log.pinterest.com'],
    description: 'Konversionstracking und Audience-Building für Pinterest-Anzeigen.',
  },

  // ── Microsoft ────────────────────────────────────────────
  'bing-ads': {
    name: 'Microsoft Advertising (Bing)',
    category: 'Werbung',
    company: 'Microsoft',
    color: '#00A4EF',
    icon: 'M',
    domains: ['bat.bing.com', 'bat.r.msn.com'],
    description: 'Bing/Microsoft Ads Konversionstracking.',
  },
  'microsoft-clarity': {
    name: 'Microsoft Clarity',
    category: 'Analytics',
    company: 'Microsoft',
    color: '#00A4EF',
    icon: 'M',
    domains: ['clarity.ms', 'www.clarity.ms'],
    description: 'Heatmaps und Session-Recordings von Microsoft.',
  },

  // ── Amazon ───────────────────────────────────────────────
  'amazon-ads': {
    name: 'Amazon Advertising',
    category: 'Werbung',
    company: 'Amazon',
    color: '#FF9900',
    icon: 'A',
    domains: ['aax.amazon.com', 'amazon-adsystem.com', 'adsystem.amazon.com'],
    description: 'Amazon Display-Werbung und Retargeting.',
  },

  // ── Criteo ───────────────────────────────────────────────
  'criteo': {
    name: 'Criteo',
    category: 'Werbung',
    company: 'Criteo',
    color: '#FF5A00',
    icon: 'Cr',
    domains: ['static.criteo.net', 'cas.criteo.com', 'bidder.criteo.com', 'gum.criteo.com'],
    description: 'Retargeting-Werbenetzwerk – verfolgt Nutzer über Websites hinweg.',
  },

  // ── Hotjar ───────────────────────────────────────────────
  'hotjar': {
    name: 'Hotjar',
    category: 'Analytics',
    company: 'Hotjar',
    color: '#FD3A5C',
    icon: 'H',
    domains: [
      'static.hotjar.com', 'script.hotjar.com',
      'vars.hotjar.com', 'metrics.hotjar.io', 'vc.hotjar.io',
    ],
    description: 'Session-Recordings, Heatmaps und Nutzerumfragen – zeichnet Maus­bewegungen auf.',
  },

  // ── FullStory ────────────────────────────────────────────
  'fullstory': {
    name: 'FullStory',
    category: 'Analytics',
    company: 'FullStory',
    color: '#1890FF',
    icon: 'FS',
    domains: ['rs.fullstory.com', 'edge.fullstory.com', 'fullstory.com'],
    description: 'Vollständige Session-Replay-Aufzeichnung inkl. aller Klicks und Eingaben.',
  },

  // ── Segment ──────────────────────────────────────────────
  'segment': {
    name: 'Segment (Twilio)',
    category: 'Analytics',
    company: 'Twilio Segment',
    color: '#52BD94',
    icon: 'Se',
    domains: ['cdn.segment.com', 'api.segment.io', 'cdn.segment.io'],
    description: 'Customer-Data-Platform – sammelt Events und leitet sie an Dutzende Tools weiter.',
  },

  // ── Mixpanel ─────────────────────────────────────────────
  'mixpanel': {
    name: 'Mixpanel',
    category: 'Analytics',
    company: 'Mixpanel',
    color: '#7856FF',
    icon: 'Mp',
    domains: ['cdn.mxpnl.com', 'api.mixpanel.com', 'cdn4.mxpnl.com'],
    description: 'Produkt-Analytics: Trichter, Kohorten, Nutzerprofile.',
  },

  // ── Amplitude ────────────────────────────────────────────
  'amplitude': {
    name: 'Amplitude',
    category: 'Analytics',
    company: 'Amplitude',
    color: '#0D68EA',
    icon: 'Am',
    domains: ['api.amplitude.com', 'cdn.amplitude.com', 'api2.amplitude.com'],
    description: 'Digitale Analytics-Plattform für Produkteinblicke.',
  },

  // ── Heap ─────────────────────────────────────────────────
  'heap': {
    name: 'Heap Analytics',
    category: 'Analytics',
    company: 'Heap',
    color: '#5733FF',
    icon: 'Hp',
    domains: ['cdn.heapanalytics.com', 'heapanalytics.com'],
    description: 'Automatisches Event-Tracking ohne manuellen Code.',
  },

  // ── Intercom ─────────────────────────────────────────────
  'intercom': {
    name: 'Intercom',
    category: 'Kundensupport',
    company: 'Intercom',
    color: '#1F8DED',
    icon: 'IC',
    domains: ['widget.intercom.io', 'js.intercomcdn.com', 'api.intercom.io'],
    description: 'Chat-Support-Widget – überträgt Nutzer­daten an Intercom-Server.',
  },

  // ── Cloudflare ───────────────────────────────────────────
  'cloudflare-insights': {
    name: 'Cloudflare Web Analytics',
    category: 'Analytics',
    company: 'Cloudflare',
    color: '#F6821F',
    icon: 'CF',
    domains: ['static.cloudflareinsights.com'],
    description: 'Datenschutzfreundlichere Analytics – überträgt dennoch Besuchsdaten.',
  },

  // ── Sentry ───────────────────────────────────────────────
  'sentry': {
    name: 'Sentry',
    category: 'Fehler-Tracking',
    company: 'Sentry',
    color: '#362D59',
    icon: 'Sr',
    domains: ['browser.sentry-cdn.com', 'sentry.io'],
    description: 'Fehler-Monitoring – sendet Stack-Traces und Browser-Infos.',
  },

  // ── Datadog ──────────────────────────────────────────────
  'datadog': {
    name: 'Datadog RUM',
    category: 'Analytics',
    company: 'Datadog',
    color: '#632CA6',
    icon: 'DD',
    domains: ['rum.browser-intake-datadoghq.com', 'browser-intake-datadoghq.com'],
    description: 'Real-User-Monitoring für Performance-Tracking.',
  },

  // ── HubSpot ──────────────────────────────────────────────
  'hubspot': {
    name: 'HubSpot Tracking',
    category: 'Marketing',
    company: 'HubSpot',
    color: '#FF7A59',
    icon: 'HS',
    domains: ['js.hs-scripts.com', 'js.hubspot.com', 'api.hubspot.com', 'track.hubspot.com'],
    description: 'Lead-Tracking und Marketing-Automation.',
  },

  // ── Salesforce / Pardot ──────────────────────────────────
  'salesforce-pardot': {
    name: 'Salesforce / Pardot',
    category: 'Marketing',
    company: 'Salesforce',
    color: '#00A1E0',
    icon: 'SF',
    domains: ['pi.pardot.com', 'go.pardot.com', 'cdn.pardot.com'],
    description: 'B2B-Marketing-Automation und Lead-Tracking.',
  },
};

// ─────────────────────────────────────────────────────────────
// Per-Tab storage  { [tabId]: { trackers: {}, totalRequests: 0 } }
// ─────────────────────────────────────────────────────────────
const tabData = {};

function initTab(tabId) {
  if (!tabData[tabId]) {
    tabData[tabId] = { trackers: {}, totalRequests: 0 };
  }
}

// ─────────────────────────────────────────────────────────────
// URL → Tracker matching
// ─────────────────────────────────────────────────────────────
function matchTracker(url) {
  let hostname, pathname;
  try {
    const u = new URL(url);
    hostname = u.hostname.toLowerCase();
    pathname = u.pathname.toLowerCase();
  } catch {
    return null;
  }

  for (const [trackerId, tracker] of Object.entries(TRACKER_DB)) {
    for (const pattern of tracker.domains) {
      const lp = pattern.toLowerCase();
      if (lp.includes('/')) {
        // path-based pattern e.g. "facebook.com/tr"
        const [domainPart, ...pathParts] = lp.split('/');
        const pathPart = '/' + pathParts.join('/');
        if (
          (hostname === domainPart || hostname.endsWith('.' + domainPart)) &&
          pathname.startsWith(pathPart)
        ) {
          return { trackerId, tracker };
        }
      } else {
        if (hostname === lp || hostname.endsWith('.' + lp)) {
          return { trackerId, tracker };
        }
      }
    }
  }
  return null;
}

// ─────────────────────────────────────────────────────────────
// Extract meaningful data from a request
// ─────────────────────────────────────────────────────────────
function extractRequestData(details) {
  const entry = {
    url: details.url,
    method: details.method || 'GET',
    timestamp: Date.now(),
    cookies: [],
    sentHeaders: {},
    urlParams: {},
    type: details.type || 'other',
  };

  // Headers we care about
  const INTERESTING_HEADERS = [
    'cookie', 'referer', 'origin', 'user-agent',
    'accept-language', 'x-forwarded-for',
  ];

  if (details.requestHeaders) {
    for (const h of details.requestHeaders) {
      const name = h.name.toLowerCase();
      if (name === 'cookie') {
        // Parse individual cookies
        entry.cookies = h.value
          .split(';')
          .map(c => c.trim())
          .filter(Boolean)
          .map(c => {
            const idx = c.indexOf('=');
            return idx > -1
              ? { name: c.slice(0, idx).trim(), value: c.slice(idx + 1).trim() }
              : { name: c, value: '' };
          });
      } else if (INTERESTING_HEADERS.includes(name)) {
        entry.sentHeaders[h.name] = h.value;
      }
    }
  }

  // URL query parameters (often contain tracking IDs)
  try {
    const u = new URL(details.url);
    for (const [k, v] of u.searchParams) {
      entry.urlParams[k] = v;
    }
  } catch { /* ignore */ }

  return entry;
}

// ─────────────────────────────────────────────────────────────
// Notify the content script of the current tab
// ─────────────────────────────────────────────────────────────
function notifyTab(tabId) {
  chrome.tabs.sendMessage(tabId, {
    type: 'TRACKER_UPDATE',
    data: tabData[tabId] || { trackers: {}, totalRequests: 0 },
  }).catch(() => { /* content script not yet ready */ });
}

// ─────────────────────────────────────────────────────────────
// Intercept all outgoing requests
// ─────────────────────────────────────────────────────────────
chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    if (details.tabId < 0) return; // background / browser requests

    const match = matchTracker(details.url);
    if (!match) return;

    const { trackerId, tracker } = match;
    initTab(details.tabId);

    const td = tabData[details.tabId];
    td.totalRequests++;

    if (!td.trackers[trackerId]) {
      td.trackers[trackerId] = {
        id: trackerId,
        name: tracker.name,
        category: tracker.category,
        company: tracker.company,
        color: tracker.color,
        icon: tracker.icon,
        description: tracker.description,
        requests: [],
        firstSeen: Date.now(),
        lastSeen: Date.now(),
      };
    }

    const req = extractRequestData(details);
    td.trackers[trackerId].requests.push(req);
    td.trackers[trackerId].lastSeen = Date.now();

    // Keep at most 20 requests per tracker (memory guard)
    if (td.trackers[trackerId].requests.length > 20) {
      td.trackers[trackerId].requests.shift();
    }

    notifyTab(details.tabId);
  },
  { urls: ['<all_urls>'] },
  ['requestHeaders', 'extraHeaders'],
);

// ─────────────────────────────────────────────────────────────
// Clear tracker data on main-frame navigation
// ─────────────────────────────────────────────────────────────
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId !== 0) return;
  tabData[details.tabId] = { trackers: {}, totalRequests: 0 };
  chrome.tabs.sendMessage(details.tabId, { type: 'CLEAR_TRACKERS' }).catch(() => {});
});

// Cleanup closed tabs
chrome.tabs.onRemoved.addListener((tabId) => {
  delete tabData[tabId];
});

// ─────────────────────────────────────────────────────────────
// Messages from content script or popup
// ─────────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_TRACKER_DATA') {
    const tabId = sender.tab?.id ?? message.tabId;
    sendResponse(tabData[tabId] || { trackers: {}, totalRequests: 0 });
    return true;
  }
  if (message.type === 'GET_ALL_TAB_DATA') {
    sendResponse(tabData);
    return true;
  }
});
