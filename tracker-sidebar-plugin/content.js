/**
 * Wer trackt wen warum wozu - Content Script
 *
 * DATENSCHUTZ: Dieses Script arbeitet ausschließlich lokal.
 * Es werden keine Daten an externe Server übermittelt.
 * Alle Informationen verbleiben im Browser des Nutzers.
 */
(function () {
  'use strict';

  // Avoid double-injection
  if (document.getElementById('tracker-sidebar-container')) return;

  // Category colors — muted, elegant palette
  const CATEGORY_COLORS = {
    "Analytics": "#6b9dc2",
    "Werbung": "#d97556",
    "Social Tracking": "#7b8fb8",
    "Tag Manager": "#c9a84c",
    "Einbettung": "#9b7db8",
    "CDN": "#8a9baa",
    "Consent": "#6aab8e",
    "Chat/Support": "#5ea8b5",
    "Marketing": "#d4955a",
    "Affiliate": "#9e8878",
    "Social Sharing": "#c47a8e",
    "Sicherheit": "#5a9a6e",
    "Performance": "#7585b5",
    "Fehlertracking": "#cd6f55",
    "Unbekannt": "#a0aab4"
  };

  let currentData = null;
  let sidebarVisible = false;
  let blockedDomains = {};
  let renderPending = false;
  let openDetails = new Set(); // Track which tracker details are open (by hostname)

  // Load blocked domains and sidebar state from storage
  chrome.storage?.local?.get(['blockedDomains', 'sidebarVisible'], (result) => {
    if (result?.blockedDomains) blockedDomains = result.blockedDomains;
    if (result?.sidebarVisible) {
      sidebarVisible = true;
      sidebar.classList.remove('hidden');
      toggleBtn.classList.add('sidebar-open');
      if (currentData) renderSidebar(currentData);
    }
  });

  // ============================================================
  // DOM Setup
  // ============================================================
  const toggleBtn = document.createElement('div');
  toggleBtn.id = 'tracker-sidebar-toggle';
  toggleBtn.innerHTML = '<span class="ts-toggle-count">0</span>';
  toggleBtn.addEventListener('click', () => toggleSidebar());
  document.documentElement.appendChild(toggleBtn);

  const sidebar = document.createElement('div');
  sidebar.id = 'tracker-sidebar-container';
  sidebar.classList.add('hidden');
  document.documentElement.appendChild(sidebar);

  // ============================================================
  // Toggle
  // ============================================================
  function toggleSidebar() {
    sidebarVisible = !sidebarVisible;
    sidebar.classList.toggle('hidden', !sidebarVisible);
    toggleBtn.classList.toggle('sidebar-open', sidebarVisible);
    // Persist sidebar state
    chrome.storage?.local?.set({ sidebarVisible });
    if (sidebarVisible && currentData) renderSidebar(currentData);
  }

  // ============================================================
  // Blocking (with stealth - tracker gets fake data, not an error)
  // ============================================================
  function saveBlockedDomains() {
    chrome.storage?.local?.set({ blockedDomains });
  }

  function gracefulReload() {
    setTimeout(() => {
      try { location.reload(); } catch { window.location.href = window.location.href; }
    }, 500);
  }

  function blockDomain(hostname) {
    blockedDomains[hostname] = true;
    saveBlockedDomains();
    chrome.runtime.sendMessage({ type: 'UPDATE_BLOCK_RULES', blockedDomains }, () => gracefulReload());
  }

  function unblockDomain(hostname) {
    delete blockedDomains[hostname];
    saveBlockedDomains();
    chrome.runtime.sendMessage({ type: 'UPDATE_BLOCK_RULES', blockedDomains }, () => gracefulReload());
  }

  function blockAll(trackers) {
    for (const t of trackers) blockedDomains[t.hostname] = true;
    saveBlockedDomains();
    chrome.runtime.sendMessage({ type: 'UPDATE_BLOCK_RULES', blockedDomains }, () => gracefulReload());
  }

  function unblockAll() {
    blockedDomains = {};
    saveBlockedDomains();
    chrome.runtime.sendMessage({ type: 'UPDATE_BLOCK_RULES', blockedDomains }, () => gracefulReload());
  }

  // ============================================================
  // Summary text generation
  // ============================================================
  function generateSummaryText(data) {
    const date = new Date().toLocaleString('de-DE');
    const blockedCount = Object.keys(blockedDomains).length;
    const lines = [
      '=== WER TRACKT WEN WARUM WOZU ===',
      `Website: ${location.href}`,
      `Datum: ${date}`,
      `Aktive Tracker: ${data.totalTrackers}`,
      `Anfragen: ${data.totalRequests}`,
    ];
    if (blockedCount > 0) lines.push(`Tracking unterbunden: ${blockedCount}`);
    lines.push('', '--- Tracker-Liste ---', '');

    for (const tracker of data.trackers) {
      const isBlocked = blockedDomains[tracker.hostname];
      lines.push(`${tracker.name}${isBlocked ? ' [Tracking unterbunden]' : ''}`);
      lines.push(`  Firma: ${tracker.company}`);
      lines.push(`  Domain: ${tracker.hostname}`);
      lines.push(`  Kategorie: ${tracker.category}`);
      lines.push(`  Requests: ${tracker.requestCount}`);

      const cookieCount = Object.keys(tracker.allCookies || {}).length;
      if (cookieCount > 0) lines.push(`  Gesendete Cookies (${cookieCount}): ${Object.keys(tracker.allCookies).join(', ')}`);

      const receivedCount = (tracker.receivedCookies || []).length;
      if (receivedCount > 0) lines.push(`  Empfangene Cookies (${receivedCount}): ${tracker.receivedCookies.map(c => c.name).join(', ')}`);

      const paramCount = Object.keys(tracker.allParams || {}).length;
      if (paramCount > 0) lines.push(`  URL-Parameter (${paramCount}): ${Object.keys(tracker.allParams).join(', ')}`);

      if (isBlocked) lines.push(`  Status: Tracking nicht zugelassen`);
      lines.push('');
    }

    const currentHostnames = new Set(data.trackers.map(t => t.hostname));
    for (const hostname of Object.keys(blockedDomains)) {
      if (!currentHostnames.has(hostname)) {
        lines.push(`${hostname} [Tracking unterbunden]`);
        lines.push('');
      }
    }

    lines.push('=== ENDE ===');
    return lines.join('\n');
  }

  function showSummaryOverlay(data) {
    const existing = document.getElementById('ts-summary-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'ts-summary-overlay';
    overlay.innerHTML = `
      <div class="ts-summary-backdrop"></div>
      <div class="ts-summary-modal">
        <div class="ts-summary-header">
          <span>Zusammenfassung</span>
          <button class="ts-summary-close" id="ts-summary-close">&#10005;</button>
        </div>
        <textarea class="ts-summary-text" readonly id="ts-summary-textarea">${esc(generateSummaryText(data))}</textarea>
        <div class="ts-summary-actions">
          <button class="ts-summary-copy" id="ts-summary-copy">Kopieren</button>
          <span class="ts-summary-copied" id="ts-summary-copied" style="display:none">Kopiert</span>
        </div>
      </div>
    `;
    document.documentElement.appendChild(overlay);

    overlay.querySelector('#ts-summary-close').addEventListener('click', () => overlay.remove());
    overlay.querySelector('.ts-summary-backdrop').addEventListener('click', () => overlay.remove());
    overlay.querySelector('#ts-summary-copy').addEventListener('click', () => {
      const ta = overlay.querySelector('#ts-summary-textarea');
      ta.select();
      navigator.clipboard.writeText(ta.value).then(() => {
        const label = overlay.querySelector('#ts-summary-copied');
        label.style.display = 'inline';
        setTimeout(() => { label.style.display = 'none'; }, 2000);
      });
    });
    overlay.querySelector('#ts-summary-textarea').addEventListener('focus', (e) => e.target.select());
  }

  // ============================================================
  // Utilities
  // ============================================================
  function esc(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function trunc(str, max = 60) {
    if (!str) return '';
    const s = String(str);
    return s.length > max ? s.substring(0, max) + '\u2026' : s;
  }

  // ============================================================
  // Render (throttled via requestAnimationFrame)
  // ============================================================
  function requestRender() {
    if (renderPending) return;
    renderPending = true;
    requestAnimationFrame(() => {
      renderPending = false;
      if (sidebarVisible && currentData) renderSidebar(currentData);
    });
  }

  function renderSidebar(data) {
    // Save which details are currently open before re-render
    sidebar.querySelectorAll('.ts-data-details.open').forEach(el => {
      const hostname = el.closest('.ts-tracker-item')?.dataset.hostname;
      if (hostname) openDetails.add(hostname);
    });
    sidebar.querySelectorAll('.ts-data-details:not(.open)').forEach(el => {
      const hostname = el.closest('.ts-tracker-item')?.dataset.hostname;
      if (hostname) openDetails.delete(hostname);
    });

    const blockedCount = Object.keys(blockedDomains).length;
    const hasBlockedAny = blockedCount > 0;

    let html = `
      <div class="ts-header">
        <div class="ts-header-top">
          <div class="ts-title">Wer trackt wen warum wozu</div>
          <button class="ts-close-btn" id="ts-close">&#10005;</button>
        </div>
        <div class="ts-stats">
          <span class="ts-stat"><span class="ts-stat-number">${data.totalTrackers}</span> Tracker</span>
          <span class="ts-stat"><span class="ts-stat-number">${data.totalRequests}</span> Anfragen</span>
          ${blockedCount > 0 ? `<span class="ts-stat ts-stat-blocked"><span class="ts-stat-number">${blockedCount}</span> unterbunden</span>` : ''}
        </div>
      </div>

      <div class="ts-action-bar">
        <button class="ts-action-btn ts-action-block" id="ts-block-all">Tracken nicht zulassen</button>
        ${hasBlockedAny ? `<button class="ts-action-btn ts-action-unblock" id="ts-unblock-all">Alle wieder zulassen</button>` : ''}
        <button class="ts-action-btn ts-action-summary" id="ts-show-summary">Zusammenfassung</button>
      </div>

      ${hasBlockedAny ? `
        <div class="ts-banner">
          ${blockedCount} Tracker d&uuml;rfen hier nicht tracken
        </div>
      ` : ''}
    `;

    // Category badges
    if (data.categories && Object.keys(data.categories).length > 0) {
      html += '<div class="ts-categories">';
      for (const [cat, count] of Object.entries(data.categories)) {
        const color = CATEGORY_COLORS[cat] || '#a0aab4';
        html += `<span class="ts-cat" style="background:${color}">${esc(cat)} ${count}</span>`;
      }
      html += '</div>';
    }

    // Tracker list
    html += '<div class="ts-list">';

    if (data.trackers.length === 0 && blockedCount === 0) {
      html += `
        <div class="ts-empty">
          <div class="ts-empty-text">Keine Tracker auf dieser Seite</div>
        </div>
      `;
    } else {
      const currentHostnames = new Set(data.trackers.map(t => t.hostname));
      for (const tracker of data.trackers) {
        html += renderTrackerItem(tracker, !!blockedDomains[tracker.hostname]);
      }
      for (const hostname of Object.keys(blockedDomains)) {
        if (!currentHostnames.has(hostname)) {
          html += renderBlockedPlaceholder(hostname);
        }
      }
    }

    html += '</div>';
    sidebar.innerHTML = html;
    attachEventListeners(data);
  }

  function renderTrackerItem(tracker, isBlocked) {
    const color = CATEGORY_COLORS[tracker.category] || '#a0aab4';
    const cookieCount = Object.keys(tracker.allCookies || {}).length;
    const paramCount = Object.keys(tracker.allParams || {}).length;
    const receivedCookieCount = (tracker.receivedCookies || []).length;
    const isOpen = openDetails.has(tracker.hostname);

    // Build data details HTML
    const dataSections = [];

    if (cookieCount > 0) {
      let rows = '';
      for (const [name, value] of Object.entries(tracker.allCookies)) {
        rows += `<tr><td title="${esc(name)}">${esc(trunc(name, 30))}</td><td title="${esc(value)}">${esc(trunc(value))}</td></tr>`;
      }
      dataSections.push(`<div class="ts-detail-section"><div class="ts-detail-label">Cookies gesendet (${cookieCount})</div><table class="ts-detail-table">${rows}</table></div>`);
    }

    if (receivedCookieCount > 0) {
      let rows = '';
      for (const cookie of tracker.receivedCookies) {
        const attrs = Object.keys(cookie.attributes || {}).join(', ');
        rows += `<tr><td title="${esc(cookie.name)}">${esc(trunc(cookie.name, 30))}</td><td title="${esc(cookie.value)}">${esc(trunc(cookie.value))}${attrs ? ` <span class="ts-detail-attr">(${esc(attrs)})</span>` : ''}</td></tr>`;
      }
      dataSections.push(`<div class="ts-detail-section"><div class="ts-detail-label">Cookies empfangen (${receivedCookieCount})</div><table class="ts-detail-table">${rows}</table></div>`);
    }

    if (paramCount > 0) {
      let rows = '';
      for (const [name, value] of Object.entries(tracker.allParams)) {
        rows += `<tr><td title="${esc(name)}">${esc(trunc(name, 30))}</td><td title="${esc(value)}">${esc(trunc(value))}</td></tr>`;
      }
      dataSections.push(`<div class="ts-detail-section"><div class="ts-detail-label">Daten in der URL (${paramCount})</div><table class="ts-detail-table">${rows}</table></div>`);
    }

    if (tracker.requests?.length > 0) {
      const types = {};
      for (const r of tracker.requests) types[r.type] = (types[r.type] || 0) + 1;
      let badges = '';
      for (const [type, count] of Object.entries(types)) {
        badges += `<span class="ts-type-badge">${esc(type)} (${count})</span>`;
      }
      dataSections.push(`<div class="ts-detail-section"><div class="ts-detail-label">Art der Anfragen</div><div>${badges}</div></div>`);
    }

    if (tracker.requests?.some(r => r.sentData?.referer)) {
      const referer = tracker.requests.find(r => r.sentData?.referer)?.sentData.referer;
      dataSections.push(`<div class="ts-detail-section"><div class="ts-detail-label">Herkunft mitgeteilt</div><div class="ts-detail-referer">${esc(referer)}</div></div>`);
    }

    const dataHtml = dataSections.join('');
    const trackerUrl = `https://${tracker.hostname}`;

    return `
      <div class="ts-item ${isBlocked ? 'ts-item-blocked' : ''}" data-hostname="${esc(tracker.hostname)}">
        <div class="ts-item-header">
          <div class="ts-item-info">
            <div class="ts-item-name">${esc(tracker.name)}</div>
            <div class="ts-item-meta">
              ${esc(tracker.company)} &mdash;
              <a href="${esc(trackerUrl)}" target="_blank" rel="noopener noreferrer" class="ts-item-link">${esc(tracker.hostname)}</a>
            </div>
          </div>
          <div class="ts-item-controls">
            <span class="ts-item-cat" style="background:${color}">${esc(tracker.category)}</span>
            <span class="ts-item-count">${tracker.requestCount}x</span>
            <label class="ts-toggle" title="${isBlocked ? 'Tracking unterbunden \u2013 klicken zum Zulassen' : 'Trackt dich \u2013 klicken zum Unterbinden'}">
              <input type="checkbox" class="ts-toggle-input" data-hostname="${esc(tracker.hostname)}" ${isBlocked ? 'checked' : ''}>
              <span class="ts-toggle-slider"></span>
            </label>
          </div>
        </div>
        ${isBlocked ? '<div class="ts-item-status">Tracking nicht zugelassen</div>' : ''}
        ${dataHtml ? `
          <div class="ts-item-data">
            <button class="ts-expand-btn">${isOpen ? '\u25BE Ausblenden' : '\u25B8 Was wird gesendet?'}</button>
            <div class="ts-expand-panel ${isOpen ? 'open' : ''}">${dataHtml}</div>
          </div>
        ` : ''}
      </div>
    `;
  }

  function renderBlockedPlaceholder(hostname) {
    const trackerUrl = `https://${hostname}`;
    return `
      <div class="ts-item ts-item-blocked" data-hostname="${esc(hostname)}">
        <div class="ts-item-header">
          <div class="ts-item-info">
            <div class="ts-item-name">
              <a href="${esc(trackerUrl)}" target="_blank" rel="noopener noreferrer" class="ts-item-link">${esc(hostname)}</a>
            </div>
            <div class="ts-item-meta">Tracking unterbunden</div>
          </div>
          <div class="ts-item-controls">
            <span class="ts-item-cat" style="background:#d97556">Unterbunden</span>
            <label class="ts-toggle" title="Tracking unterbunden \u2013 klicken zum Zulassen">
              <input type="checkbox" class="ts-toggle-input" data-hostname="${esc(hostname)}" checked>
              <span class="ts-toggle-slider"></span>
            </label>
          </div>
        </div>
        <div class="ts-item-status">Tracking nicht zugelassen</div>
      </div>
    `;
  }

  // ============================================================
  // Event listeners (attached after render)
  // ============================================================
  function attachEventListeners(data) {
    sidebar.querySelector('#ts-close')?.addEventListener('click', () => toggleSidebar());
    sidebar.querySelector('#ts-block-all')?.addEventListener('click', () => blockAll(data.trackers));
    sidebar.querySelector('#ts-unblock-all')?.addEventListener('click', () => unblockAll());
    sidebar.querySelector('#ts-show-summary')?.addEventListener('click', () => showSummaryOverlay(data));

    sidebar.querySelectorAll('.ts-expand-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const panel = btn.nextElementSibling;
        if (panel) {
          const isOpen = panel.classList.toggle('open');
          btn.textContent = isOpen ? '\u25BE Ausblenden' : '\u25B8 Was wird gesendet?';
          // Track open state by hostname
          const hostname = btn.closest('.ts-item')?.dataset.hostname;
          if (hostname) {
            if (isOpen) openDetails.add(hostname);
            else openDetails.delete(hostname);
          }
        }
      });
    });

    sidebar.querySelectorAll('.ts-toggle-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const hostname = e.target.dataset.hostname;
        if (e.target.checked) blockDomain(hostname);
        else unblockDomain(hostname);
      });
    });

    // Prevent link clicks from bubbling to toggle
    sidebar.querySelectorAll('.ts-item-link').forEach(link => {
      link.addEventListener('click', (e) => e.stopPropagation());
    });
  }

  // ============================================================
  // Message handling
  // ============================================================
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'TOGGLE_SIDEBAR') {
      toggleSidebar();
      return;
    }
    if (message.type === 'TRACKER_UPDATE') {
      currentData = message.data;
      if (message.data.blockedDomains) blockedDomains = message.data.blockedDomains;
      const blockedCount = Object.keys(blockedDomains).length;
      const trackerCount = currentData.totalTrackers;
      toggleBtn.innerHTML = `<span class="ts-toggle-count">${trackerCount + blockedCount}</span>`;
      if (sidebarVisible) requestRender();
    }
  });

  // Initial data fetch
  chrome.runtime.sendMessage({ type: 'GET_TRACKER_DATA' }, (response) => {
    if (response) {
      currentData = response;
      if (response.blockedDomains) blockedDomains = response.blockedDomains;
      const blockedCount = Object.keys(blockedDomains).length;
      toggleBtn.innerHTML = `<span class="ts-toggle-count">${response.totalTrackers + blockedCount}</span>`;
      if (sidebarVisible) renderSidebar(response);
    }
  });
})();
