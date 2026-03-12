// Popup Controller — Click-to-Apply
// Klick auf Modus -> sofort anwenden. Nochmal klicken -> deaktivieren.

let activeMode = null;

// === Mode Button Handling ===
document.querySelectorAll('.mode-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const mode = btn.dataset.mode;

    if (activeMode === mode) {
      // Gleichen Modus nochmal geklickt -> deaktivieren
      await revertCurrentMode();
      setInactive();
      return;
    }

    // Neuen Modus aktivieren
    activeMode = mode;

    // UI aktualisieren
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Settings zusammenbauen
    const settings = {
      mode: mode,
      replace: true,
      fillers: true,
      emojis: true,
      intensity: 100,
    };

    if (mode.startsWith('gender_')) {
      settings.genderMode = mode.replace('gender_', '');
    }

    // Speichern und an Content-Script senden
    chrome.storage.local.set({ genzSettings: settings, genzActive: true });

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, {
      action: 'transform',
      settings: settings
    });
  });
});

async function revertCurrentMode() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, { action: 'revert' });
  chrome.storage.local.set({ genzActive: false });
}

function setInactive() {
  activeMode = null;
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
}

// === Restore saved state on popup open ===
chrome.storage.local.get(['genzSettings', 'genzActive'], (data) => {
  if (data.genzActive && data.genzSettings) {
    const mode = data.genzSettings.mode;
    activeMode = mode;

    const btn = document.querySelector(`.mode-btn[data-mode="${mode}"]`);
    if (btn) btn.classList.add('active');
  }
});
