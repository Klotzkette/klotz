// Content Script - Einstiegspunkt
// Empfängt Nachrichten vom Popup und steuert die Transformation

let transformer = null;

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

  transformer = new GenZTransformer(settings);

  // Alle sichtbaren Frames/Container durchgehen
  // Das funktioniert auch mit Spalten-Layouts, Grids, Flexbox etc.
  const count = transformer.transformDOM(document.body);

  // Visuelles Feedback
  showNotification(`Sheesh! ${count} Texte transformiert 🔥💀`);
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
  // Entferne vorherige Benachrichtigung
  const existing = document.getElementById('genz-notification');
  if (existing) existing.remove();

  const notification = document.createElement('div');
  notification.id = 'genz-notification';
  notification.textContent = text;
  notification.className = 'genz-notification';
  document.body.appendChild(notification);

  // Animation starten
  requestAnimationFrame(() => {
    notification.classList.add('genz-notification-show');
  });

  // Nach 2.5 Sekunden ausblenden
  setTimeout(() => {
    notification.classList.add('genz-notification-hide');
    setTimeout(() => notification.remove(), 500);
  }, 2500);
}
