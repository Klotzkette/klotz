// Popup controller — mit Modus-Auswahl
const $ = (id) => document.getElementById(id);

const intensitySlider = $('intensity');
const intensityLabel = $('intensityLabel');
const transformBtn = $('transformBtn');
const revertBtn = $('revertBtn');
const modeGenz = $('modeGenz');
const modeFormal = $('modeFormal');

let currentMode = 'genz';

// === Modus-Auswahl ===
function setMode(mode) {
  currentMode = mode;
  document.body.className = 'mode-' + mode;

  // Aktive Klasse
  modeGenz.classList.toggle('active', mode === 'genz');
  modeFormal.classList.toggle('active', mode === 'formal');

  // UI-Texte anpassen
  if (mode === 'genz') {
    $('headerTitle').textContent = 'Gen-Z Transformer 💀🔥';
    $('headerSubtitle').textContent = 'Drei Akte der Jugendsprache-Verwandlung';
    $('descReplace').textContent = 'Normale Wörter durch Slang ersetzen';
    $('labelFillers').textContent = 'Füllwörter & Kommentare';
    $('descFillers').textContent = 'Digga, lowkey + Gen-Z-Kommentare';
    $('aktLabel1').textContent = 'Akt I: Subtil';
    $('aktLabel2').textContent = 'Akt II: Kontrast';
    $('aktLabel3').textContent = 'Akt III: Brainrot';
    transformBtn.textContent = 'SEITE TRANSFORMIEREN 🔥';
    $('footerText').textContent = 'no cap, fr fr — v2.0';
  } else {
    $('headerTitle').textContent = 'Bildungssprache 📜⚖️';
    $('headerSubtitle').textContent = 'Drei Akte der sprachlichen Veredelung';
    $('descReplace').textContent = 'Wörter durch elaborierte Synonyme ersetzen';
    $('labelFillers').textContent = 'Floskeln & Rechtslatein';
    $('descFillers').textContent = 'Nota bene, quod erat demonstrandum';
    $('aktLabel1').textContent = 'Akt I: Dezent';
    $('aktLabel2').textContent = 'Akt II: Gelehrt';
    $('aktLabel3').textContent = 'Akt III: Kanzlei';
    transformBtn.textContent = 'SEITE VEREDELN 📜';
    $('footerText').textContent = 'Quod erat demonstrandum — v2.0';
  }

  saveSettings(getSettings());
}

modeGenz.addEventListener('click', () => setMode('genz'));
modeFormal.addEventListener('click', () => setMode('formal'));

// === Settings ===
function getSettings() {
  return {
    mode: currentMode,
    replace: $('toggleReplace').checked,
    fillers: $('toggleFillers').checked,
    emojis: $('toggleEmojis').checked,
    intensity: parseInt(intensitySlider.value)
  };
}

function saveSettings(settings) {
  chrome.storage.local.set({ genzSettings: settings });
}

// Load saved settings
chrome.storage.local.get(['genzSettings', 'genzActive'], (data) => {
  const s = data.genzSettings || {};
  if (s.replace !== undefined) $('toggleReplace').checked = s.replace;
  if (s.fillers !== undefined) $('toggleFillers').checked = s.fillers;
  if (s.emojis !== undefined) $('toggleEmojis').checked = s.emojis;
  if (s.intensity !== undefined) {
    intensitySlider.value = s.intensity;
    intensityLabel.textContent = s.intensity + '%';
  }
  if (s.mode) {
    setMode(s.mode);
  }
  if (data.genzActive) {
    transformBtn.style.display = 'none';
    revertBtn.style.display = 'block';
  }
});

intensitySlider.addEventListener('input', () => {
  intensityLabel.textContent = intensitySlider.value + '%';
});

// === Transform / Revert ===
transformBtn.addEventListener('click', async () => {
  const settings = getSettings();
  saveSettings(settings);

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, {
    action: 'transform',
    settings: settings
  });

  chrome.storage.local.set({ genzActive: true });
  transformBtn.style.display = 'none';
  revertBtn.style.display = 'block';
});

revertBtn.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, { action: 'revert' });

  chrome.storage.local.set({ genzActive: false });
  revertBtn.style.display = 'none';
  transformBtn.style.display = 'block';
});

// Save on any toggle change
document.querySelectorAll('input[type="checkbox"], input[type="range"]').forEach(el => {
  el.addEventListener('change', () => saveSettings(getSettings()));
});
