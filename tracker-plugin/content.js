// ============================================================
// Tracker Watch – Content Script
// Injects a live sidebar using Shadow DOM (style-isolated).
// ============================================================

const SIDEBAR_WIDTH = 340;

let shadowHost = null;
let shadow = null;
let currentData = { trackers: {}, totalRequests: 0 };
let isCollapsed = false;
let expandedTrackers = new Set();

// ─────────────────────────────────────────────────────────────
// Bootstrap: request initial data, then build the sidebar
// ─────────────────────────────────────────────────────────────
(function init() {
  chrome.runtime.sendMessage({ type: 'GET_TRACKER_DATA' }, (data) => {
    if (chrome.runtime.lastError) return;
    currentData = data || { trackers: {}, totalRequests: 0 };
    buildSidebar();
  });
})();

// ─────────────────────────────────────────────────────────────
// Listen for live updates from the background worker
// ─────────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'TRACKER_UPDATE') {
    currentData = msg.data;
    renderTrackerList();
  }
  if (msg.type === 'CLEAR_TRACKERS') {
    currentData = { trackers: {}, totalRequests: 0 };
    expandedTrackers.clear();
    renderTrackerList();
  }
});

// ─────────────────────────────────────────────────────────────
// Build the entire sidebar DOM (once)
// ─────────────────────────────────────────────────────────────
function buildSidebar() {
  if (shadowHost) return;

  // Host element (outside shadow, anchors the sidebar to the page)
  shadowHost = document.createElement('div');
  shadowHost.id = '__tracker-watch-host__';
  applyHostStyles(shadowHost, false);

  // Shadow root for full style isolation
  shadow = shadowHost.attachShadow({ mode: 'closed' });

  // Inject styles
  const styleEl = document.createElement('style');
  styleEl.textContent = getSidebarCSS();
  shadow.appendChild(styleEl);

  // Sidebar wrapper
  const sidebar = document.createElement('div');
  sidebar.id = 'tw-sidebar';
  sidebar.innerHTML = `
    <div id="tw-header">
      <div id="tw-title">
        <span id="tw-shield">🔍</span>
        <span id="tw-name">Tracker Watch</span>
      </div>
      <div id="tw-header-right">
        <span id="tw-badge">0</span>
        <button id="tw-toggle" title="Sidebar ein-/ausblenden">◀</button>
      </div>
    </div>
    <div id="tw-body">
      <div id="tw-summary"></div>
      <div id="tw-list"></div>
    </div>
  `;
  shadow.appendChild(sidebar);

  document.documentElement.appendChild(shadowHost);

  // Wire toggle button
  shadow.getElementById('tw-toggle').addEventListener('click', toggleCollapse);

  renderTrackerList();
  nudgePageLayout(false);
}

// ─────────────────────────────────────────────────────────────
// Re-render the tracker list (called on every update)
// ─────────────────────────────────────────────────────────────
function renderTrackerList() {
  if (!shadow) return;

  const trackers = Object.values(currentData.trackers || {});
  const badge = shadow.getElementById('tw-badge');
  const summary = shadow.getElementById('tw-summary');
  const list = shadow.getElementById('tw-list');

  if (badge) badge.textContent = trackers.length;

  // Summary bar
  const categories = {};
  trackers.forEach(t => {
    categories[t.category] = (categories[t.category] || 0) + 1;
  });
  const catHtml = Object.entries(categories)
    .map(([cat, n]) => `<span class="tw-cat-pill">${cat} <strong>${n}</strong></span>`)
    .join('');
  summary.innerHTML = trackers.length === 0
    ? '<span class="tw-empty">Keine Tracker erkannt.</span>'
    : `<div class="tw-cat-row">${catHtml}</div>
       <div class="tw-total">Anfragen gesamt: <strong>${currentData.totalRequests}</strong></div>`;

  // Tracker cards
  list.innerHTML = '';
  if (trackers.length === 0) return;

  trackers
    .sort((a, b) => b.requests.length - a.requests.length)
    .forEach(tracker => {
      list.appendChild(buildTrackerCard(tracker));
    });
}

// ─────────────────────────────────────────────────────────────
// Build a single tracker card (collapsed or expanded)
// ─────────────────────────────────────────────────────────────
function buildTrackerCard(tracker) {
  const isOpen = expandedTrackers.has(tracker.id);
  const card = document.createElement('div');
  card.className = 'tw-card' + (isOpen ? ' tw-card--open' : '');
  card.setAttribute('data-tracker-id', tracker.id);

  const reqCount = tracker.requests.length;
  const cookieCount = tracker.requests.reduce((s, r) => s + r.cookies.length, 0);

  card.innerHTML = `
    <div class="tw-card-header" data-id="${tracker.id}">
      <div class="tw-card-icon" style="background:${tracker.color}">${tracker.icon}</div>
      <div class="tw-card-info">
        <div class="tw-card-name">${esc(tracker.name)}</div>
        <div class="tw-card-meta">
          <span class="tw-tag">${esc(tracker.category)}</span>
          <span class="tw-tag tw-tag--req">${reqCount} Anfragen</span>
          ${cookieCount > 0 ? `<span class="tw-tag tw-tag--cookie">🍪 ${cookieCount} Cookies</span>` : ''}
        </div>
      </div>
      <div class="tw-chevron">${isOpen ? '▲' : '▼'}</div>
    </div>
    ${isOpen ? buildTrackerDetail(tracker) : ''}
  `;

  card.querySelector('.tw-card-header').addEventListener('click', () => {
    if (expandedTrackers.has(tracker.id)) {
      expandedTrackers.delete(tracker.id);
    } else {
      expandedTrackers.add(tracker.id);
    }
    renderTrackerList();
  });

  return card;
}

// ─────────────────────────────────────────────────────────────
// Detail panel shown when a tracker card is expanded
// ─────────────────────────────────────────────────────────────
function buildTrackerDetail(tracker) {
  const reqs = tracker.requests;

  let html = `
    <div class="tw-detail">
      <p class="tw-desc">${esc(tracker.description)}</p>
      <div class="tw-company">Anbieter: <strong>${esc(tracker.company)}</strong></div>
      <div class="tw-section-title">Gesendete Anfragen (${reqs.length})</div>
  `;

  reqs.slice(-5).reverse().forEach((req, i) => {
    const time = new Date(req.timestamp).toLocaleTimeString('de-DE');
    const shortUrl = shortenUrl(req.url);
    const hasCookies = req.cookies.length > 0;
    const hasParams = Object.keys(req.urlParams).length > 0;
    const hasHeaders = Object.keys(req.sentHeaders).length > 0;

    html += `
      <div class="tw-req">
        <div class="tw-req-top">
          <span class="tw-req-method tw-method-${req.method.toLowerCase()}">${esc(req.method)}</span>
          <span class="tw-req-time">${time}</span>
          <span class="tw-req-type">${esc(req.type)}</span>
        </div>
        <div class="tw-req-url" title="${esc(req.url)}">${esc(shortUrl)}</div>

        ${hasCookies ? `
          <div class="tw-sub-title">🍪 Mitgesendete Cookies (${req.cookies.length})</div>
          <div class="tw-kv-list">
            ${req.cookies.map(c =>
              `<div class="tw-kv">
                <span class="tw-kv-key" title="${esc(c.name)}">${esc(truncate(c.name, 24))}</span>
                <span class="tw-kv-val" title="${esc(c.value)}">${esc(truncate(c.value, 32))}</span>
              </div>`
            ).join('')}
          </div>` : ''}

        ${hasParams ? `
          <div class="tw-sub-title">📡 URL-Parameter (Tracking-Daten)</div>
          <div class="tw-kv-list">
            ${Object.entries(req.urlParams).slice(0, 12).map(([k, v]) =>
              `<div class="tw-kv">
                <span class="tw-kv-key" title="${esc(k)}">${esc(truncate(k, 22))}</span>
                <span class="tw-kv-val" title="${esc(v)}">${esc(truncate(v, 34))}</span>
              </div>`
            ).join('')}
          </div>` : ''}

        ${hasHeaders ? `
          <div class="tw-sub-title">📋 Gesendete Header</div>
          <div class="tw-kv-list">
            ${Object.entries(req.sentHeaders).map(([k, v]) =>
              `<div class="tw-kv">
                <span class="tw-kv-key">${esc(truncate(k, 22))}</span>
                <span class="tw-kv-val" title="${esc(v)}">${esc(truncate(v, 34))}</span>
              </div>`
            ).join('')}
          </div>` : ''}
      </div>
    `;
  });

  if (reqs.length > 5) {
    html += `<div class="tw-more">… und ${reqs.length - 5} weitere Anfragen</div>`;
  }

  html += '</div>';
  return html;
}

// ─────────────────────────────────────────────────────────────
// Toggle collapse / expand
// ─────────────────────────────────────────────────────────────
function toggleCollapse() {
  isCollapsed = !isCollapsed;
  applyHostStyles(shadowHost, isCollapsed);
  nudgePageLayout(isCollapsed);

  const btn = shadow.getElementById('tw-toggle');
  if (btn) btn.textContent = isCollapsed ? '▶' : '◀';
  const body = shadow.getElementById('tw-body');
  if (body) body.style.display = isCollapsed ? 'none' : 'flex';
}

// ─────────────────────────────────────────────────────────────
// Push page content so the sidebar doesn't overlap it
// ─────────────────────────────────────────────────────────────
function nudgePageLayout(collapsed) {
  const w = collapsed ? 36 : SIDEBAR_WIDTH;
  document.documentElement.style.setProperty('--tracker-watch-width', w + 'px');
  // Only nudge if page isn't already doing its own layout
  const root = document.documentElement;
  if (!root.style.paddingRight || root.style.paddingRight === '0px' ||
      root.style.paddingRight === (SIDEBAR_WIDTH + 'px') ||
      root.style.paddingRight === '36px') {
    root.style.paddingRight = w + 'px';
    root.style.boxSizing = 'border-box';
  }
}

function applyHostStyles(el, collapsed) {
  const w = collapsed ? 36 : SIDEBAR_WIDTH;
  el.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    right: 0 !important;
    width: ${w}px !important;
    height: 100vh !important;
    z-index: 2147483647 !important;
    pointer-events: auto !important;
    box-shadow: -4px 0 20px rgba(0,0,0,0.35) !important;
    border-left: 1px solid rgba(255,255,255,0.08) !important;
  `;
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function truncate(str, len) {
  return str.length > len ? str.slice(0, len) + '…' : str;
}

function shortenUrl(url) {
  try {
    const u = new URL(url);
    return u.hostname + u.pathname.slice(0, 40) + (u.pathname.length > 40 ? '…' : '');
  } catch {
    return truncate(url, 60);
  }
}

// ─────────────────────────────────────────────────────────────
// CSS (injected into Shadow DOM – fully isolated)
// ─────────────────────────────────────────────────────────────
function getSidebarCSS() {
  return `
    :host { all: initial; }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    #tw-sidebar {
      width: 340px;
      height: 100vh;
      background: #0f1117;
      color: #e2e8f0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      font-size: 12px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    /* ── Header ── */
    #tw-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      background: #1a1d2e;
      border-bottom: 1px solid #2d3148;
      flex-shrink: 0;
      user-select: none;
    }
    #tw-title {
      display: flex;
      align-items: center;
      gap: 7px;
      font-weight: 700;
      font-size: 13px;
      letter-spacing: 0.3px;
      color: #a5b4fc;
    }
    #tw-shield { font-size: 15px; }
    #tw-header-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    #tw-badge {
      background: #6366f1;
      color: #fff;
      border-radius: 999px;
      padding: 2px 8px;
      font-size: 11px;
      font-weight: 700;
      min-width: 22px;
      text-align: center;
    }
    #tw-toggle {
      background: #2d3148;
      border: 1px solid #3d4268;
      color: #a5b4fc;
      border-radius: 6px;
      width: 26px;
      height: 26px;
      cursor: pointer;
      font-size: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s;
    }
    #tw-toggle:hover { background: #3d4268; }

    /* ── Body ── */
    #tw-body {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0;
      scrollbar-width: thin;
      scrollbar-color: #3d4268 transparent;
    }
    #tw-body::-webkit-scrollbar { width: 5px; }
    #tw-body::-webkit-scrollbar-thumb { background: #3d4268; border-radius: 99px; }

    /* ── Summary ── */
    #tw-summary {
      padding: 10px 12px;
      background: #13162b;
      border-bottom: 1px solid #2d3148;
      flex-shrink: 0;
    }
    .tw-empty {
      color: #64748b;
      font-style: italic;
      font-size: 12px;
    }
    .tw-cat-row {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      margin-bottom: 6px;
    }
    .tw-cat-pill {
      background: #1e2140;
      border: 1px solid #3d4268;
      border-radius: 99px;
      padding: 2px 8px;
      font-size: 11px;
      color: #94a3b8;
    }
    .tw-cat-pill strong { color: #a5b4fc; }
    .tw-total {
      font-size: 11px;
      color: #64748b;
    }
    .tw-total strong { color: #94a3b8; }

    /* ── Tracker list ── */
    #tw-list {
      display: flex;
      flex-direction: column;
    }

    /* ── Tracker Card ── */
    .tw-card {
      border-bottom: 1px solid #1e2140;
      background: #0f1117;
      transition: background 0.1s;
    }
    .tw-card--open { background: #13162b; }

    .tw-card-header {
      display: flex;
      align-items: center;
      gap: 9px;
      padding: 9px 12px;
      cursor: pointer;
      user-select: none;
      transition: background 0.1s;
    }
    .tw-card-header:hover { background: #1a1d2e; }

    .tw-card-icon {
      width: 30px;
      height: 30px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 10px;
      color: #fff;
      flex-shrink: 0;
      letter-spacing: -0.5px;
      text-shadow: 0 1px 2px rgba(0,0,0,0.4);
    }

    .tw-card-info {
      flex: 1;
      min-width: 0;
    }
    .tw-card-name {
      font-weight: 600;
      font-size: 12px;
      color: #e2e8f0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .tw-card-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 3px;
    }
    .tw-tag {
      background: #1e2140;
      border: 1px solid #2d3148;
      border-radius: 99px;
      padding: 1px 6px;
      font-size: 10px;
      color: #94a3b8;
    }
    .tw-tag--req { border-color: #3d4268; color: #a5b4fc; }
    .tw-tag--cookie { border-color: #b45309; color: #fbbf24; background: #1c1507; }

    .tw-chevron {
      color: #4b5563;
      font-size: 10px;
      flex-shrink: 0;
    }

    /* ── Detail panel ── */
    .tw-detail {
      padding: 0 12px 12px;
      background: #0d1020;
      border-top: 1px solid #1e2140;
    }
    .tw-desc {
      margin-top: 10px;
      color: #64748b;
      font-size: 11px;
      line-height: 1.5;
    }
    .tw-company {
      margin-top: 6px;
      font-size: 11px;
      color: #64748b;
    }
    .tw-company strong { color: #94a3b8; }

    .tw-section-title {
      margin-top: 10px;
      font-size: 11px;
      font-weight: 700;
      color: #6366f1;
      text-transform: uppercase;
      letter-spacing: 0.6px;
    }

    /* ── Request entry ── */
    .tw-req {
      margin-top: 8px;
      background: #111425;
      border: 1px solid #1e2140;
      border-radius: 8px;
      padding: 8px 9px;
    }
    .tw-req-top {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 4px;
    }
    .tw-req-method {
      font-weight: 700;
      font-size: 10px;
      border-radius: 4px;
      padding: 1px 5px;
      text-transform: uppercase;
    }
    .tw-method-get  { background: #052e16; color: #4ade80; border: 1px solid #166534; }
    .tw-method-post { background: #1e1b4b; color: #818cf8; border: 1px solid #3730a3; }
    .tw-method-put  { background: #1c1007; color: #fb923c; border: 1px solid #9a3412; }
    .tw-req-time { color: #475569; font-size: 10px; margin-left: auto; }
    .tw-req-type {
      background: #1e2140;
      color: #64748b;
      border-radius: 4px;
      padding: 1px 5px;
      font-size: 10px;
    }
    .tw-req-url {
      font-family: 'SF Mono', 'Fira Code', monospace;
      font-size: 10px;
      color: #7dd3fc;
      word-break: break-all;
      margin-bottom: 5px;
    }

    /* ── Sub-sections ── */
    .tw-sub-title {
      margin-top: 7px;
      margin-bottom: 4px;
      font-size: 10px;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .tw-kv-list {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .tw-kv {
      display: flex;
      gap: 4px;
      font-family: 'SF Mono', 'Fira Code', monospace;
      font-size: 10px;
    }
    .tw-kv-key {
      color: #fbbf24;
      flex-shrink: 0;
      max-width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .tw-kv-val {
      color: #94a3b8;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .tw-more {
      margin-top: 6px;
      font-size: 10px;
      color: #475569;
      text-align: center;
    }
  `;
}
