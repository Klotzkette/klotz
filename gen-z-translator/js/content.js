// Gen-Z Translator — Content Script
// Nur Gen-Z, an/aus, fertig.

let transformer = null;
let _lastSettings = null;

// Auto-apply on page load if active
chrome.storage.local.get(['genzSettings', 'genzActive'], (data) => {
  if (data.genzActive && data.genzSettings) {
    if (document.readyState === 'complete') {
      doTransform(data.genzSettings);
    } else {
      window.addEventListener('load', () => doTransform(data.genzSettings), { once: true });
    }
  }
});

// Messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'transform') {
    doTransform(message.settings);
    sendResponse({ success: true });
  } else if (message.action === 'revert') {
    doRevert();
    sendResponse({ success: true });
  }
  return true;
});

function doTransform(settings) {
  if (transformer) {
    transformer.revertAll();
  }

  _lastSettings = settings;
  settings.intensity = 100;
  settings.replace = true;
  settings.fillers = true;
  settings.emojis = true;

  transformer = new GenZTransformer(settings);
  const count = transformer.transformDOM(document.body);

  startSPAObserver();
  showNotification(`Gen-Z: ${count} Texte transformiert`);
}

function doRevert() {
  stopSPAObserver();
  if (transformer) {
    transformer.revertAll();
    transformer = null;
    _lastSettings = null;
  }
}

// SPA observer for dynamic content
let spaObserver = null;
let spaDebounceTimer = null;
let _spaIsTransforming = false;

function startSPAObserver() {
  if (spaObserver) spaObserver.disconnect();

  spaObserver = new MutationObserver((mutations) => {
    if (!transformer || _spaIsTransforming) return;

    let hasNewNodes = false;
    for (const m of mutations) {
      if (m.addedNodes.length > 0) { hasNewNodes = true; break; }
    }
    if (!hasNewNodes) return;

    if (spaDebounceTimer) clearTimeout(spaDebounceTimer);
    spaDebounceTimer = setTimeout(() => {
      _spaIsTransforming = true;
      try { transformer.transformDOM(document.body); } catch (e) {}
      _spaIsTransforming = false;
    }, 400);
  });

  spaObserver.observe(document.body, { childList: true, subtree: true });

  if (!window._genzPopstateRegistered) {
    window._genzPopstateRegistered = true;
    const origPush = history.pushState;
    const origReplace = history.replaceState;
    history.pushState = function() { origPush.apply(this, arguments); _onSPANav(); };
    history.replaceState = function() { origReplace.apply(this, arguments); _onSPANav(); };
    window.addEventListener('popstate', _onSPANav);
  }
}

function _onSPANav() {
  if (!transformer || !_lastSettings) return;
  setTimeout(() => {
    if (transformer) {
      try { transformer.transformDOM(document.body); } catch(e) {}
    }
  }, 800);
}

function stopSPAObserver() {
  if (spaObserver) { spaObserver.disconnect(); spaObserver = null; }
  if (spaDebounceTimer) { clearTimeout(spaDebounceTimer); spaDebounceTimer = null; }
}

function showNotification(text) {
  const existing = document.getElementById('genz-notification');
  if (existing) existing.remove();

  const n = document.createElement('div');
  n.id = 'genz-notification';
  n.textContent = text;
  n.className = 'genz-notification';
  document.body.appendChild(n);

  requestAnimationFrame(() => n.classList.add('genz-notification-show'));
  setTimeout(() => {
    n.classList.add('genz-notification-hide');
    setTimeout(() => n.remove(), 500);
  }, 2500);
}
