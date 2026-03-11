// Popup controller
const $ = (id) => document.getElementById(id);

const intensitySlider = $('intensity');
const intensityLabel = $('intensityLabel');
const transformBtn = $('transformBtn');
const revertBtn = $('revertBtn');

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
  if (data.genzActive) {
    transformBtn.style.display = 'none';
    revertBtn.style.display = 'block';
  }
});

intensitySlider.addEventListener('input', () => {
  intensityLabel.textContent = intensitySlider.value + '%';
});

function getSettings() {
  return {
    replace: $('toggleReplace').checked,
    fillers: $('toggleFillers').checked,
    emojis: $('toggleEmojis').checked,
    intensity: parseInt(intensitySlider.value)
  };
}

function saveSettings(settings) {
  chrome.storage.local.set({ genzSettings: settings });
}

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

// Save settings on any toggle change
document.querySelectorAll('input[type="checkbox"], input[type="range"]').forEach(el => {
  el.addEventListener('change', () => saveSettings(getSettings()));
});
