// Tracker Watch – Popup Script

document.addEventListener('DOMContentLoaded', async () => {
  // Get the active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;

  // Request tracker data from background
  chrome.runtime.sendMessage(
    { type: 'GET_TRACKER_DATA', tabId: tab.id },
    (data) => {
      if (chrome.runtime.lastError || !data) return;
      renderPopup(data);
    }
  );

  // "Show sidebar" button – injects / reveals the sidebar on the active tab
  document.getElementById('open-sidebar').addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js'],
      });
    } catch (err) {
      // Already injected – just show
    }
    window.close();
  });
});

function renderPopup(data) {
  const trackers = Object.values(data.trackers || {});
  const totalCookies = trackers.reduce(
    (sum, t) => sum + t.requests.reduce((s, r) => s + r.cookies.length, 0),
    0
  );

  document.getElementById('stat-trackers').textContent = trackers.length;
  document.getElementById('stat-requests').textContent = data.totalRequests;
  document.getElementById('stat-cookies').textContent = totalCookies;

  const content = document.getElementById('content');

  if (trackers.length === 0) {
    content.innerHTML = `
      <div class="empty-msg">
        <div class="empty-icon">✅</div>
        Keine bekannten Tracker auf dieser Seite erkannt.
      </div>`;
    return;
  }

  // Group by category
  const byCategory = {};
  trackers.forEach(t => {
    if (!byCategory[t.category]) byCategory[t.category] = [];
    byCategory[t.category].push(t);
  });

  let html = '';
  for (const [cat, list] of Object.entries(byCategory)) {
    html += `<div class="section"><div class="section-title">${esc(cat)}</div>`;
    list
      .sort((a, b) => b.requests.length - a.requests.length)
      .forEach(t => {
        html += `
          <div class="tracker-row">
            <div class="tracker-dot" style="background:${esc(t.color)}"></div>
            <div class="tracker-popup-name">${esc(t.name)}</div>
            <div class="tracker-popup-count">${t.requests.length}×</div>
          </div>`;
      });
    html += '</div>';
  }

  content.innerHTML = html;
}

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
