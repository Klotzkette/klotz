// Content Script - Einstiegspunkt
// Empfängt Nachrichten vom Popup und steuert die Transformation
// Unterstützt alle Modi: Gen-Z, Bildungssprache, Dialekte, Spezial-Modi

let transformer = null;

// Dialekt-Modi → DIALECTS key
const DIALECT_MODES = {
  berlinerisch: 'berlinerisch',
  saechsisch: 'saechsisch',
  fraenkisch: 'fraenkisch',
  bairisch: 'bairisch',
  schwaebisch: 'schwaebisch',
  ruhrpott: 'ruhrpott',
  norddeutsch: 'norddeutsch',
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
  // Erst rückgängig machen falls schon transformiert
  if (transformer) {
    transformer.revertAll();
  }

  const mode = settings.mode || 'genz';

  // === Transformer erstellen je nach Modus ===
  if (mode === 'formal') {
    transformer = new FormalTransformer(settings);
  } else if (mode === 'genz') {
    transformer = new GenZTransformer(settings);
  } else if (DIALECT_MODES[mode]) {
    // Dialekt-Modus
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
  } else if (mode === 'adjektivkiller') {
    transformer = new AdjektivkillerTransformer(settings);
  } else if (mode.startsWith('gender_')) {
    settings.genderMode = mode.replace('gender_', '');
    transformer = new GenderTransformer(settings);
  } else {
    // Fallback: Gen-Z
    transformer = new GenZTransformer(settings);
  }

  // Transformation durchführen
  const count = transformer.transformDOM(document.body);

  // Visuelles Feedback
  const modeNames = {
    genz: '🔥 Gen-Z', formal: '📜 Bildungssprache', politiker: '🏛️ Politiker',
    barock: '🏰 Barock', adjektivkiller: '✂️ Adjektivkiller',
    berlinerisch: '🐻 Berlinern', saechsisch: '🎻 Sächseln',
    fraenkisch: '🌭 Fränkisch', bairisch: '🥨 Bairisch',
    schwaebisch: '🏠 Schwäbisch', ruhrpott: '⚒️ Ruhrpott',
    norddeutsch: '⚓ Norddeutsch',
    gender_star: '⭐ Gendern (*)', gender_colon: '✳️ Gendern (:)',
    gender_explicit: '📝 Gendern', gender_participle: '🔄 Partizip',
    gender_maskulinum: '♂️ Maskulinum',
  };
  const modeName = modeNames[mode] || mode;
  showNotification(`${modeName}: ${count} Texte transformiert 🎭`);
}

/**
 * Macht die Transformation rückgängig
 */
function doRevert() {
  if (transformer) {
    transformer.revertAll();
    transformer = null;
    showNotification('Zurückgesetzt ↩️');
  }
}

/**
 * Zeigt eine kurze Benachrichtigung an
 */
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
