// Popup Controller — Click-to-Apply
// Klick auf Modus → sofort anwenden. Nochmal klicken → deaktivieren.
// Anderen Modus klicken → alter wird zurückgesetzt, neuer wird angewendet.

const MODE_THEMES = {
  genz: 'theme-genz',
  formal: 'theme-formal',
  fraenkisch: 'theme-dialect',
  berlinerisch: 'theme-dialect',
  schwaebisch: 'theme-dialect',
  gender_star: 'theme-gender',
  gender_colon: 'theme-gender',
  gender_participle: 'theme-gender',
  gender_maskulinum: 'theme-gender',
  adjektivkiller: 'theme-tool',
  kleinschreibung: 'theme-tool',
  vokalentferner: 'theme-tool',
};

let activeMode = null;

// === Mode Button Handling ===
document.querySelectorAll('.mode-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const mode = btn.dataset.mode;

    if (activeMode === mode) {
      // Gleichen Modus nochmal geklickt → deaktivieren
      await revertCurrentMode();
      setInactive();
      return;
    }

    // Neuen Modus aktivieren (alter wird im content.js automatisch zurückgesetzt)
    activeMode = mode;

    // UI aktualisieren
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Theme setzen
    document.body.className = MODE_THEMES[mode] || 'theme-genz';

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
  document.body.className = 'theme-genz';
}

// === Restore saved state on popup open ===
chrome.storage.local.get(['genzSettings', 'genzActive'], (data) => {
  if (data.genzActive && data.genzSettings) {
    const mode = data.genzSettings.mode;
    activeMode = mode;

    // Button als aktiv markieren
    const btn = document.querySelector(`.mode-btn[data-mode="${mode}"]`);
    if (btn) btn.classList.add('active');

    // Theme setzen
    document.body.className = MODE_THEMES[mode] || 'theme-genz';
  }
});
