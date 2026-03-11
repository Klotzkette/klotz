/**
 * Tracker Viewer - Content Script
 *
 * DATENSCHUTZ: Dieses Script arbeitet ausschließlich lokal.
 * Es werden keine Daten an externe Server übermittelt.
 * Alle Informationen verbleiben im Browser des Nutzers.
 */
(function () {
  'use strict';

  if (document.getElementById('tracker-sidebar-container')) return;

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
  let renderPending = false;
  let openDetails = new Set();

  // Load sidebar state from storage
  chrome.storage?.local?.get(['sidebarVisible'], (result) => {
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
    chrome.storage?.local?.set({ sidebarVisible });
    if (sidebarVisible && currentData) renderSidebar(currentData);
  }

  // ============================================================
  // Summary text generation
  // ============================================================
  function generateSummaryText(data) {
    const date = new Date().toLocaleString('de-DE');
    const lines = [
      '=== TRACKER VIEWER ===',
      `Website: ${location.href}`,
      `Datum: ${date}`,
      `Aktive Tracker: ${data.totalTrackers}`,
      `Anfragen: ${data.totalRequests}`,
      '', '--- Tracker-Liste ---', ''
    ];

    for (const tracker of data.trackers) {
      lines.push(tracker.name);
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

      lines.push('');
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
  // Render
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
    // Preserve open details across re-renders
    sidebar.querySelectorAll('.ts-expand-panel.open').forEach(el => {
      const hostname = el.closest('.ts-item')?.dataset.hostname;
      if (hostname) openDetails.add(hostname);
    });
    sidebar.querySelectorAll('.ts-expand-panel:not(.open)').forEach(el => {
      const hostname = el.closest('.ts-item')?.dataset.hostname;
      if (hostname) openDetails.delete(hostname);
    });

    let html = `
      <div class="ts-header">
        <div class="ts-header-top">
          <div class="ts-title">Tracker Viewer</div>
          <button class="ts-close-btn" id="ts-close">&#10005;</button>
        </div>
        <div class="ts-stats">
          <span class="ts-stat"><span class="ts-stat-number">${data.totalTrackers}</span> Tracker</span>
          <span class="ts-stat"><span class="ts-stat-number">${data.totalRequests}</span> Anfragen</span>
        </div>
      </div>

      <div class="ts-action-bar">
        <button class="ts-action-btn ts-action-summary" id="ts-show-summary">Zusammenfassung</button>
      </div>
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

    if (data.trackers.length === 0) {
      html += `
        <div class="ts-empty">
          <div class="ts-empty-text">Keine Tracker auf dieser Seite</div>
        </div>
      `;
    } else {
      for (const tracker of data.trackers) {
        html += renderTrackerItem(tracker);
      }
    }

    html += '</div>';
    sidebar.innerHTML = html;
    attachEventListeners(data);
  }

  function renderTrackerItem(tracker) {
    const color = CATEGORY_COLORS[tracker.category] || '#a0aab4';
    const cookieCount = Object.keys(tracker.allCookies || {}).length;
    const paramCount = Object.keys(tracker.allParams || {}).length;
    const receivedCookieCount = (tracker.receivedCookies || []).length;
    const isOpen = openDetails.has(tracker.hostname);

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
      <div class="ts-item" data-hostname="${esc(tracker.hostname)}">
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
          </div>
        </div>
        ${dataHtml ? `
          <div class="ts-item-data">
            <button class="ts-expand-btn">${isOpen ? '\u25BE Ausblenden' : '\u25B8 Was wird gesendet?'}</button>
            <div class="ts-expand-panel ${isOpen ? 'open' : ''}">${dataHtml}</div>
          </div>
        ` : ''}
      </div>
    `;
  }

  // ============================================================
  // Event listeners
  // ============================================================
  function attachEventListeners(data) {
    sidebar.querySelector('#ts-close')?.addEventListener('click', () => toggleSidebar());
    sidebar.querySelector('#ts-show-summary')?.addEventListener('click', () => showSummaryOverlay(data));

    sidebar.querySelectorAll('.ts-expand-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const panel = btn.nextElementSibling;
        if (panel) {
          const isOpen = panel.classList.toggle('open');
          btn.textContent = isOpen ? '\u25BE Ausblenden' : '\u25B8 Was wird gesendet?';
          const hostname = btn.closest('.ts-item')?.dataset.hostname;
          if (hostname) {
            if (isOpen) openDetails.add(hostname);
            else openDetails.delete(hostname);
          }
        }
      });
    });

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
      toggleBtn.innerHTML = `<span class="ts-toggle-count">${currentData.totalTrackers}</span>`;
      if (sidebarVisible) requestRender();
    }
  });

  // Initial data fetch
  chrome.runtime.sendMessage({ type: 'GET_TRACKER_DATA' }, (response) => {
    if (response) {
      currentData = response;
      toggleBtn.innerHTML = `<span class="ts-toggle-count">${response.totalTrackers}</span>`;
      if (sidebarVisible) renderSidebar(response);
    }
  });
})();
