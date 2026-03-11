/**
 * Tracker Sidebar - Content Script
 *
 * DATENSCHUTZ: Dieses Script arbeitet ausschließlich lokal.
 * Es werden keine Daten an externe Server übermittelt.
 * Alle Informationen verbleiben im Browser des Nutzers.
 */
(function () {
  'use strict';

  // Avoid double-injection
  if (document.getElementById('tracker-sidebar-container')) return;

  // Category colors (duplicated here since content scripts can't share modules with background)
  const CATEGORY_COLORS = {
    "Analytics": "#4285f4",
    "Werbung": "#ea4335",
    "Social Tracking": "#1877f2",
    "Tag Manager": "#f4b400",
    "Einbettung": "#9c27b0",
    "CDN": "#607d8b",
    "Consent": "#4caf50",
    "Chat/Support": "#00bcd4",
    "Marketing": "#ff9800",
    "Affiliate": "#795548",
    "Social Sharing": "#e91e63",
    "Sicherheit": "#2e7d32",
    "Performance": "#3f51b5",
    "Fehlertracking": "#ff5722",
    "Unbekannt": "#9e9e9e"
  };

  let currentData = null;
  let sidebarVisible = false;
  let blockedDomains = {};

  // Load blocked domains from storage
  chrome.storage?.local?.get(['blockedDomains'], (result) => {
    if (result?.blockedDomains) {
      blockedDomains = result.blockedDomains;
    }
  });

  // Create toggle button
  const toggleBtn = document.createElement('div');
  toggleBtn.id = 'tracker-sidebar-toggle';
  toggleBtn.innerHTML = '<span class="ts-toggle-count">0</span> Tracker';
  toggleBtn.addEventListener('click', () => toggleSidebar());
  document.documentElement.appendChild(toggleBtn);

  // Create sidebar container
  const sidebar = document.createElement('div');
  sidebar.id = 'tracker-sidebar-container';
  sidebar.classList.add('hidden');
  document.documentElement.appendChild(sidebar);

  function toggleSidebar() {
    sidebarVisible = !sidebarVisible;
    sidebar.classList.toggle('hidden', !sidebarVisible);
    toggleBtn.classList.toggle('sidebar-open', sidebarVisible);
    if (sidebarVisible && currentData) {
      renderSidebar(currentData);
    }
  }

  function saveBlockedDomains() {
    chrome.storage?.local?.set({ blockedDomains });
  }

  // Graceful reload: waits for block rules to be applied, then reloads
  // Uses a soft reload to avoid breaking the page state
  function gracefulReload() {
    setTimeout(() => {
      try {
        location.reload();
      } catch (e) {
        // Fallback: navigate to the same URL
        window.location.href = window.location.href;
      }
    }, 400);
  }

  function blockDomain(hostname) {
    blockedDomains[hostname] = true;
    saveBlockedDomains();
    chrome.runtime.sendMessage({
      type: 'UPDATE_BLOCK_RULES',
      blockedDomains: blockedDomains
    }, () => gracefulReload());
  }

  function unblockDomain(hostname) {
    delete blockedDomains[hostname];
    saveBlockedDomains();
    chrome.runtime.sendMessage({
      type: 'UPDATE_BLOCK_RULES',
      blockedDomains: blockedDomains
    }, () => gracefulReload());
  }

  function blockAll(trackers) {
    for (const t of trackers) {
      blockedDomains[t.hostname] = true;
    }
    saveBlockedDomains();
    chrome.runtime.sendMessage({
      type: 'UPDATE_BLOCK_RULES',
      blockedDomains: blockedDomains
    }, () => gracefulReload());
  }

  function unblockAll() {
    blockedDomains = {};
    saveBlockedDomains();
    chrome.runtime.sendMessage({
      type: 'UPDATE_BLOCK_RULES',
      blockedDomains: blockedDomains
    }, () => gracefulReload());
  }

  function generateSummaryText(data) {
    const pageUrl = location.href;
    const date = new Date().toLocaleString('de-DE');
    let lines = [];
    lines.push('=== TRACKER-ZUSAMMENFASSUNG ===');
    lines.push(`Website: ${pageUrl}`);
    lines.push(`Datum: ${date}`);
    lines.push(`Gefundene Tracker: ${data.totalTrackers}`);
    lines.push(`Gesamte Requests: ${data.totalRequests}`);
    const blockedCount = Object.keys(blockedDomains).length;
    if (blockedCount > 0) {
      lines.push(`Blockierte Domains: ${blockedCount}`);
    }
    lines.push('');
    lines.push('--- Tracker-Liste ---');
    lines.push('');

    for (const tracker of data.trackers) {
      const isBlocked = blockedDomains[tracker.hostname];
      lines.push(`${tracker.name}${isBlocked ? ' [BLOCKIERT]' : ''}`);
      lines.push(`  Firma: ${tracker.company}`);
      lines.push(`  Domain: ${tracker.hostname}`);
      lines.push(`  Kategorie: ${tracker.category}`);
      lines.push(`  Requests: ${tracker.requestCount}`);

      const cookieCount = Object.keys(tracker.allCookies || {}).length;
      if (cookieCount > 0) {
        lines.push(`  Gesendete Cookies (${cookieCount}): ${Object.keys(tracker.allCookies).join(', ')}`);
      }

      const receivedCount = (tracker.receivedCookies || []).length;
      if (receivedCount > 0) {
        lines.push(`  Empfangene Cookies (${receivedCount}): ${tracker.receivedCookies.map(c => c.name).join(', ')}`);
      }

      const paramCount = Object.keys(tracker.allParams || {}).length;
      if (paramCount > 0) {
        lines.push(`  URL-Parameter (${paramCount}): ${Object.keys(tracker.allParams).join(', ')}`);
      }

      lines.push('');
    }

    // Blocked domains not in current list
    const currentHostnames = new Set(data.trackers.map(t => t.hostname));
    for (const hostname of Object.keys(blockedDomains)) {
      if (!currentHostnames.has(hostname)) {
        lines.push(`${hostname} [BLOCKIERT - nicht geladen]`);
        lines.push('');
      }
    }

    lines.push('=== ENDE DER ZUSAMMENFASSUNG ===');
    return lines.join('\n');
  }

  function showSummaryOverlay(data) {
    // Remove existing overlay if any
    const existing = document.getElementById('ts-summary-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'ts-summary-overlay';
    overlay.innerHTML = `
      <div class="ts-summary-backdrop"></div>
      <div class="ts-summary-modal">
        <div class="ts-summary-header">
          <span>Tracker-Zusammenfassung</span>
          <button class="ts-summary-close" id="ts-summary-close">&#10005;</button>
        </div>
        <textarea class="ts-summary-text" readonly id="ts-summary-textarea">${escapeHtml(generateSummaryText(data))}</textarea>
        <div class="ts-summary-actions">
          <button class="ts-summary-copy" id="ts-summary-copy">&#128203; In Zwischenablage kopieren</button>
          <span class="ts-summary-copied" id="ts-summary-copied" style="display:none">Kopiert!</span>
        </div>
      </div>
    `;
    document.documentElement.appendChild(overlay);

    overlay.querySelector('#ts-summary-close').addEventListener('click', () => overlay.remove());
    overlay.querySelector('.ts-summary-backdrop').addEventListener('click', () => overlay.remove());
    overlay.querySelector('#ts-summary-copy').addEventListener('click', () => {
      const textarea = overlay.querySelector('#ts-summary-textarea');
      textarea.select();
      navigator.clipboard.writeText(textarea.value).then(() => {
        const copiedLabel = overlay.querySelector('#ts-summary-copied');
        copiedLabel.style.display = 'inline';
        setTimeout(() => { copiedLabel.style.display = 'none'; }, 2000);
      });
    });

    // Auto-select all text on focus
    overlay.querySelector('#ts-summary-textarea').addEventListener('focus', (e) => e.target.select());
  }

  function escapeHtml(str) {
    if (!str) return '';
    const s = String(str);
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function truncate(str, maxLen = 60) {
    if (!str) return '';
    const s = String(str);
    return s.length > maxLen ? s.substring(0, maxLen) + '...' : s;
  }

  function renderSidebar(data) {
    const blockedCount = Object.keys(blockedDomains).length;
    const hasBlockedAny = blockedCount > 0;

    let html = `
      <div class="ts-header">
        <div class="ts-header-top">
          <div class="ts-title">
            <span class="ts-title-icon">&#128737;</span>
            Tracker Sidebar
          </div>
          <button class="ts-close-btn" id="ts-close">&#10005;</button>
        </div>
        <div class="ts-stats">
          <span class="ts-stat"><span class="ts-stat-number">${data.totalTrackers}</span> Tracker</span>
          <span class="ts-stat"><span class="ts-stat-number">${data.totalRequests}</span> Requests</span>
          ${blockedCount > 0 ? `<span class="ts-stat"><span class="ts-stat-number" style="color:#e74c3c">${blockedCount}</span> Blockiert</span>` : ''}
        </div>
      </div>

      <div class="ts-block-all-bar">
        <button class="ts-block-all-btn block" id="ts-block-all">&#128683; Alle blockieren</button>
        ${hasBlockedAny ? `<button class="ts-block-all-btn unblock" id="ts-unblock-all">&#10003; Alle erlauben</button>` : ''}
        <button class="ts-block-all-btn summary" id="ts-show-summary">&#128203; Zusammenfassung</button>
      </div>
    `;

    // Category badges
    if (data.categories && Object.keys(data.categories).length > 0) {
      html += '<div class="ts-categories">';
      for (const [cat, count] of Object.entries(data.categories)) {
        const color = CATEGORY_COLORS[cat] || '#9e9e9e';
        html += `<span class="ts-category-badge" style="background:${color}">${escapeHtml(cat)} (${count})</span>`;
      }
      html += '</div>';
    }

    // Tracker list
    html += '<div class="ts-tracker-list">';

    if (data.trackers.length === 0 && blockedCount === 0) {
      html += `
        <div class="ts-empty">
          <div class="ts-empty-icon">&#9989;</div>
          <div class="ts-empty-text">Keine Tracker erkannt</div>
        </div>
      `;
    } else {
      // Show blocked domains that are not in current tracker list
      const currentHostnames = new Set(data.trackers.map(t => t.hostname));

      for (const tracker of data.trackers) {
        const isBlocked = blockedDomains[tracker.hostname];
        html += renderTrackerItem(tracker, isBlocked);
      }

      // Show blocked domains not in current data (they were blocked before load)
      for (const hostname of Object.keys(blockedDomains)) {
        if (!currentHostnames.has(hostname)) {
          html += renderBlockedPlaceholder(hostname);
        }
      }
    }

    html += '</div>';
    sidebar.innerHTML = html;

    // Attach event listeners
    sidebar.querySelector('#ts-close')?.addEventListener('click', () => toggleSidebar());

    sidebar.querySelector('#ts-block-all')?.addEventListener('click', () => {
      blockAll(data.trackers);
    });

    sidebar.querySelector('#ts-unblock-all')?.addEventListener('click', () => {
      unblockAll();
    });

    sidebar.querySelector('#ts-show-summary')?.addEventListener('click', () => {
      showSummaryOverlay(data);
    });

    // Toggle buttons for data details
    sidebar.querySelectorAll('.ts-data-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const details = btn.nextElementSibling;
        if (details) {
          details.classList.toggle('open');
          btn.textContent = details.classList.contains('open')
            ? '▾ Details ausblenden'
            : '▸ Gesendete Daten anzeigen';
        }
      });
    });

    // Block toggles
    sidebar.querySelectorAll('.ts-block-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const hostname = e.target.dataset.hostname;
        if (e.target.checked) {
          blockDomain(hostname);
        } else {
          unblockDomain(hostname);
        }
      });
    });
  }

  function renderTrackerItem(tracker, isBlocked) {
    const color = CATEGORY_COLORS[tracker.category] || '#9e9e9e';
    const cookieCount = Object.keys(tracker.allCookies || {}).length;
    const paramCount = Object.keys(tracker.allParams || {}).length;
    const receivedCookieCount = (tracker.receivedCookies || []).length;

    let dataHtml = '';

    // Sent cookies
    if (cookieCount > 0) {
      dataHtml += `
        <div class="ts-data-section">
          <div class="ts-data-section-title">&#127850; Gesendete Cookies (${cookieCount})</div>
          <table class="ts-data-table">
      `;
      for (const [name, value] of Object.entries(tracker.allCookies)) {
        dataHtml += `<tr><td title="${escapeHtml(name)}">${escapeHtml(truncate(name, 30))}</td><td title="${escapeHtml(value)}">${escapeHtml(truncate(value))}</td></tr>`;
      }
      dataHtml += '</table></div>';
    }

    // Received cookies (Set-Cookie)
    if (receivedCookieCount > 0) {
      dataHtml += `
        <div class="ts-data-section">
          <div class="ts-data-section-title">&#128229; Empfangene Cookies (${receivedCookieCount})</div>
          <table class="ts-data-table">
      `;
      for (const cookie of tracker.receivedCookies) {
        const attrs = Object.keys(cookie.attributes || {}).join(', ');
        dataHtml += `<tr><td title="${escapeHtml(cookie.name)}">${escapeHtml(truncate(cookie.name, 30))}</td><td title="${escapeHtml(cookie.value)}">${escapeHtml(truncate(cookie.value))}${attrs ? ' <span style="color:#666">(' + escapeHtml(attrs) + ')</span>' : ''}</td></tr>`;
      }
      dataHtml += '</table></div>';
    }

    // URL parameters sent
    if (paramCount > 0) {
      dataHtml += `
        <div class="ts-data-section">
          <div class="ts-data-section-title">&#128269; URL-Parameter (${paramCount})</div>
          <table class="ts-data-table">
      `;
      for (const [name, value] of Object.entries(tracker.allParams)) {
        dataHtml += `<tr><td title="${escapeHtml(name)}">${escapeHtml(truncate(name, 30))}</td><td title="${escapeHtml(value)}">${escapeHtml(truncate(value))}</td></tr>`;
      }
      dataHtml += '</table></div>';
    }

    // Request types
    if (tracker.requests && tracker.requests.length > 0) {
      const types = {};
      for (const r of tracker.requests) {
        types[r.type] = (types[r.type] || 0) + 1;
      }
      dataHtml += `
        <div class="ts-data-section">
          <div class="ts-data-section-title">&#128640; Request-Typen</div>
          <div>
      `;
      for (const [type, count] of Object.entries(types)) {
        dataHtml += `<span class="ts-request-type">${escapeHtml(type)} (${count})</span>`;
      }
      dataHtml += '</div></div>';
    }

    // Referer
    if (tracker.requests?.some(r => r.sentData?.referer)) {
      const referer = tracker.requests.find(r => r.sentData?.referer)?.sentData.referer;
      dataHtml += `
        <div class="ts-data-section">
          <div class="ts-data-section-title">&#128279; Referer</div>
          <div style="font-size:11px;color:#d0d0e0;word-break:break-all">${escapeHtml(referer)}</div>
        </div>
      `;
    }

    return `
      <div class="ts-tracker-item ${isBlocked ? 'blocked' : ''}">
        <div class="ts-tracker-header">
          <div class="ts-tracker-name-area">
            <div class="ts-tracker-name">${escapeHtml(tracker.name)}</div>
            <div class="ts-tracker-company">${escapeHtml(tracker.company)} &mdash; ${escapeHtml(tracker.hostname)}</div>
          </div>
          <div class="ts-tracker-right">
            <span class="ts-tracker-badge" style="background:${color}">${escapeHtml(tracker.category)}</span>
            <span class="ts-tracker-requests">${tracker.requestCount}x</span>
            <label class="ts-block-toggle" title="${isBlocked ? 'Blockiert - klicken zum Erlauben' : 'Erlaubt - klicken zum Blockieren'}">
              <input type="checkbox" class="ts-block-input" data-hostname="${escapeHtml(tracker.hostname)}" ${isBlocked ? 'checked' : ''}>
              <span class="ts-block-slider"></span>
            </label>
          </div>
        </div>
        ${isBlocked ? '<div class="ts-blocked-label">&#128683; BLOCKIERT</div>' : ''}
        ${dataHtml ? `
          <div class="ts-sent-data">
            <button class="ts-data-toggle">&#9654; Gesendete Daten anzeigen</button>
            <div class="ts-data-details">${dataHtml}</div>
          </div>
        ` : ''}
      </div>
    `;
  }

  function renderBlockedPlaceholder(hostname) {
    return `
      <div class="ts-tracker-item blocked">
        <div class="ts-tracker-header">
          <div class="ts-tracker-name-area">
            <div class="ts-tracker-name">${escapeHtml(hostname)}</div>
            <div class="ts-tracker-company">Blockiert</div>
          </div>
          <div class="ts-tracker-right">
            <span class="ts-tracker-badge" style="background:#e74c3c">Blockiert</span>
            <label class="ts-block-toggle" title="Blockiert - klicken zum Erlauben">
              <input type="checkbox" class="ts-block-input" data-hostname="${escapeHtml(hostname)}" checked>
              <span class="ts-block-slider"></span>
            </label>
          </div>
        </div>
        <div class="ts-blocked-label">&#128683; BLOCKIERT - wird nicht geladen</div>
      </div>
    `;
  }

  // Listen for updates from background script and popup toggle
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'TOGGLE_SIDEBAR') {
      toggleSidebar();
      return;
    }
    if (message.type === 'TRACKER_UPDATE') {
      currentData = message.data;
      // Update toggle button count
      toggleBtn.innerHTML = `<span class="ts-toggle-count">${currentData.totalTrackers}</span> Tracker`;
      // Update sidebar if visible
      if (sidebarVisible) {
        renderSidebar(currentData);
      }
    }
  });

  // Initial data fetch
  chrome.runtime.sendMessage({ type: 'GET_TRACKER_DATA' }, (response) => {
    if (response) {
      currentData = response;
      toggleBtn.innerHTML = `<span class="ts-toggle-count">${response.totalTrackers}</span> Tracker`;
      if (sidebarVisible) {
        renderSidebar(response);
      }
    }
  });
})();
