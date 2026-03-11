// Content Script - Einstiegspunkt
// Empfängt Nachrichten vom Popup und steuert die Transformation
// Unterstützt zwei Modi: Gen-Z und Bildungssprache

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

  const mode = settings.mode || 'genz';

  if (mode === 'formal') {
    transformer = new FormalTransformer(settings);
  } else {
    transformer = new GenZTransformer(settings);
  }

  // Alle sichtbaren Frames/Container durchgehen
  const count = transformer.transformDOM(document.body);

  // Visuelles Feedback — passend zum Modus
  if (mode === 'formal') {
    showNotification(`Akt I → II → III: ${count} Texte veredelt 🎭📜`);
  } else {
    showNotification(`Akt I → II → III: ${count} Texte verwandelt 🎭🔥`);
  }
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
