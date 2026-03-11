// Content Script - Einstiegspunkt
// Empfängt Nachrichten vom Popup und steuert die Transformation
// Unterstützt alle Modi: Gen-Z, Bildungssprache, Dialekte, Spezial-Modi

let transformer = null;
let _lastSettings = null; // Für SPA-Observer: merkt sich die Settings

// Dialekt-Modi → DIALECTS key
const DIALECT_MODES = {
  berlinerisch: 'berlinerisch',
  saechsisch: 'saechsisch',
  fraenkisch: 'fraenkisch',
  bairisch: 'bairisch',
  schwaebisch: 'schwaebisch',
  ruhrpott: 'ruhrpott',
  norddeutsch: 'norddeutsch',
  wienerisch: 'wienerisch',
  schweizerdeutsch: 'schweizerdeutsch',
  hessisch: 'hessisch',
  saarlaendisch: 'saarlaendisch',
  koelsch: 'koelsch',
};

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

  if (mode === 'formal') {
    transformer = new FormalTransformer(settings);
  } else if (mode === 'genz') {
    transformer = new GenZTransformer(settings);
  } else if (DIALECT_MODES[mode]) {
    const dialectConfig = DIALECTS[DIALECT_MODES[mode]];
    if (dialectConfig) {
      transformer = new DialectTransformer(settings, dialectConfig);
    } else {
      showNotification('Dialekt nicht gefunden: ' + mode);
      return;
    }
  } else if (mode === 'politiker') {
    transformer = new PolitikerTransformer(settings);
  } else if (mode === 'barock') {
    transformer = new DialectTransformer(settings, BAROCK_CONFIG);
  } else if (mode === 'achtziger') {
    transformer = new DialectTransformer(settings, ACHTZIGER_CONFIG);
  } else if (mode === 'ddr') {
    transformer = new DialectTransformer(settings, DDR_CONFIG);
  } else if (mode === 'luther') {
    transformer = new DialectTransformer(settings, LUTHER_CONFIG);
  } else if (mode === 'burokrat') {
    transformer = new DialectTransformer(settings, BUROKRAT_CONFIG);
  } else if (mode === 'adjektivkiller') {
    transformer = new AdjektivkillerTransformer(settings);
  } else if (mode === 'adjektivflut') {
    transformer = new AdjektivUeberschwemmerTransformer(settings);
  } else if (mode === 'emoji') {
    transformer = new EmojiSprinklerTransformer(settings);
  } else if (mode === 'kleinschreibung') {
    transformer = new KleinschreibungTransformer(settings);
  } else if (mode === 'vokalentferner') {
    transformer = new VokalentfernerTransformer(settings);
  } else if (mode.startsWith('gender_')) {
    settings.genderMode = mode.replace('gender_', '');
    transformer = new GenderTransformer(settings);
  } else {
    transformer = new GenZTransformer(settings);
  }

  const count = transformer.transformDOM(document.body);

  // SPA-Observer starten: Bei dynamisch nachgeladenen Inhalten auch transformieren
  startSPAObserver();

  const modeNames = {
    genz: '🔥 Gen-Z', formal: '📜 Bildungssprache', politiker: '🏛️ Politiker',
    barock: '🏰 Barock', adjektivkiller: '✂️ Adjektivkiller', adjektivflut: '🌊 Adjektiv-Überschwemmer',
    emoji: '😊 Emoji-Sprinkler', kleinschreibung: '🔡 Kleinschreibung', vokalentferner: '🕳️ Vokalentferner',
    achtziger: '📼 80er West', ddr: '☭ DDR-Sprech', luther: '✝️ Luther',
    burokrat: '🏢 Bürokrat',
    berlinerisch: '🐻 Berlinern', saechsisch: '🎻 Sächseln',
    fraenkisch: '🌭 Fränkisch', bairisch: '🥨 Bairisch',
    schwaebisch: '🏠 Schwäbisch', ruhrpott: '⚒️ Ruhrpott',
    norddeutsch: '⚓ Norddeutsch', wienerisch: '🎡 Wienerisch',
    schweizerdeutsch: '🏔️ Schweizerdeutsch',
    hessisch: '🍎 Hessisch', saarlaendisch: '🥨 Saarländisch',
    koelsch: '🍺 Kölsch',
    gender_star: '⭐ Gendern (*)', gender_colon: '✳️ Gendern (:)',
    gender_explicit: '📝 Gendern', gender_participle: '🔄 Partizip',
    gender_maskulinum: '♂️ Maskulinum',
  };
  const modeName = modeNames[mode] || mode;
  showNotification(`${modeName}: ${count} Texte transformiert 🎭`);
}

function doRevert() {
  stopSPAObserver();
  if (transformer) {
    transformer.revertAll();
    transformer = null;
    _lastSettings = null;
    showNotification('Zurückgesetzt ↩️');
  }
}

// ==========================================================================
// SPA-Navigation: MutationObserver für dynamisch nachgeladene Inhalte
// Erfasst: React/Vue/Angular-SPAs, infinite scroll, AJAX-Nachladen, Google-Suche
// ==========================================================================
let spaObserver = null;
let spaDebounceTimer = null;
let _spaIsTransforming = false; // Guard gegen Re-Entranz

function startSPAObserver() {
  if (spaObserver) spaObserver.disconnect();

  spaObserver = new MutationObserver((mutations) => {
    if (!transformer || _spaIsTransforming) return;

    // Nur feuern wenn tatsächlich neue Nodes hinzugefügt wurden
    let hasNewNodes = false;
    for (const m of mutations) {
      if (m.addedNodes.length > 0) { hasNewNodes = true; break; }
    }
    if (!hasNewNodes) return;

    // Debounce: Sammle schnelle DOM-Änderungen
    if (spaDebounceTimer) clearTimeout(spaDebounceTimer);
    spaDebounceTimer = setTimeout(() => {
      _spaIsTransforming = true;
      try {
        transformer.transformDOM(document.body);
      } catch (e) {
        // Fehler ignorieren — besser als Absturz
      }
      _spaIsTransforming = false;
    }, 400);
  });

  spaObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Auch auf URL-Änderungen (pushState) reagieren — für SPAs wie Google
  if (!window._genzPopstateRegistered) {
    window._genzPopstateRegistered = true;
    // pushState/replaceState abfangen
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
  // Bei URL-Wechsel: kurz warten bis neuer Content geladen, dann transformieren
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
