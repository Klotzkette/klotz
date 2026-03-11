// Content Script - Einstiegspunkt
// Empfängt Nachrichten vom Popup und steuert die Transformation
// Modi: Gen-Z, Bildungssprache, Fränkisch, Altertümliches Deutsch, Gender-Varianten

let transformer = null;
let _lastSettings = null;

// Beim Laden: prüfe ob ein aktiver Modus gespeichert ist → automatisch anwenden
chrome.storage.local.get(['genzSettings', 'genzActive'], (data) => {
  if (data.genzActive && data.genzSettings) {
    // Kurz warten bis die Seite fertig geladen ist
    if (document.readyState === 'complete') {
      doTransform(data.genzSettings);
    } else {
      window.addEventListener('load', () => doTransform(data.genzSettings), { once: true });
    }
  }
});

// Nachrichten vom Popup empfangen
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

/**
 * Führt die Transformation durch
 */
function doTransform(settings) {
  if (transformer) {
    transformer.revertAll();
  }

  _lastSettings = settings;
  const mode = settings.mode || 'genz';

  // Immer volle Intensität
  settings.intensity = 100;
  settings.replace = true;
  settings.fillers = true;
  settings.emojis = true;

  if (mode === 'formal') {
    transformer = new FormalTransformer(settings);
  } else if (mode === 'genz') {
    transformer = new GenZTransformer(settings);
  } else if (mode === 'fraenkisch' || mode === 'berlinerisch' || mode === 'schwaebisch') {
    const dialectConfig = DIALECTS[mode];
    transformer = new DialectTransformer(settings, dialectConfig);
  } else if (mode.startsWith('gender_')) {
    settings.genderMode = mode.replace('gender_', '');
    transformer = new GenderTransformer(settings);
  } else if (mode === 'adjektivkiller') {
    transformer = new AdjektivkillerTransformer(settings);
  } else if (mode === 'kleinschreibung') {
    transformer = new KleinschreibungTransformer(settings);
  } else if (mode === 'vokalentferner') {
    transformer = new VokalentfernerTransformer(settings);
  } else {
    transformer = new GenZTransformer(settings);
  }

  const count = transformer.transformDOM(document.body);

  // SPA-Observer starten: Bei dynamisch nachgeladenen Inhalten auch transformieren
  startSPAObserver();

  const modeNames = {
    genz: '🔥 Gen-Z', formal: '📜 Bildungssprache',
    fraenkisch: '🌭 Fränkisch', berlinerisch: '🐻 Berlinerisch',
    schwaebisch: '🏠 Schwäbisch',
    gender_star: '⭐ Gendern (*)', gender_colon: '✳️ Gendern (:)',
    gender_participle: '🔄 Partizip', gender_maskulinum: '♂️ Maskulinum',
    adjektivkiller: '✂️ Adjektivkiller', kleinschreibung: '🔡 kleinschreibung',
    vokalentferner: '🕳️ Vokalentferner',
  };
  const modeName = modeNames[mode] || mode;
  showNotification(`${modeName}: ${count} Texte transformiert`);
}

function doRevert() {
  stopSPAObserver();
  if (transformer) {
    transformer.revertAll();
    transformer = null;
    _lastSettings = null;
  }
}

// ==========================================================================
// SPA-Navigation: MutationObserver für dynamisch nachgeladene Inhalte
// ==========================================================================
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
      try {
        transformer.transformDOM(document.body);
      } catch (e) {}
      _spaIsTransforming = false;
    }, 400);
  });

  spaObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Auch auf URL-Änderungen (pushState) reagieren — für SPAs
  if (!window._genzPopstateRegistered) {
    window._genzPopstateRegistered = true;
    const origPushState = history.pushState;
    const origReplaceState = history.replaceState;
    history.pushState = function() {
      origPushState.apply(this, arguments);
      _onSPANavigation();
    };
    history.replaceState = function() {
      origReplaceState.apply(this, arguments);
      _onSPANavigation();
    };
    window.addEventListener('popstate', _onSPANavigation);
  }
}

function _onSPANavigation() {
  if (!transformer || !_lastSettings) return;
  setTimeout(() => {
    if (transformer) {
      try { transformer.transformDOM(document.body); } catch(e) {}
    }
  }, 800);
}

function stopSPAObserver() {
  if (spaObserver) {
    spaObserver.disconnect();
    spaObserver = null;
  }
  if (spaDebounceTimer) {
    clearTimeout(spaDebounceTimer);
    spaDebounceTimer = null;
  }
}

function showNotification(text) {
  const existing = document.getElementById('genz-notification');
  if (existing) existing.remove();

  const notification = document.createElement('div');
  notification.id = 'genz-notification';
  notification.textContent = text;
  notification.className = 'genz-notification';
  document.body.appendChild(notification);

  requestAnimationFrame(() => {
    notification.classList.add('genz-notification-show');
  });

  setTimeout(() => {
    notification.classList.add('genz-notification-hide');
    setTimeout(() => notification.remove(), 500);
  }, 2500);
}
