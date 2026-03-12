// Gen-Z Translator — Popup: An/Aus Toggle

const toggle = document.getElementById('mainToggle');
const status = document.getElementById('status');

toggle.addEventListener('change', async () => {
  const isOn = toggle.checked;

  if (isOn) {
    status.textContent = 'Aktiv';
    status.classList.add('active');

    const settings = { mode: 'genz', replace: true, fillers: true, emojis: true, intensity: 100 };
    chrome.storage.local.set({ genzSettings: settings, genzActive: true });

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, { action: 'transform', settings });
  } else {
    status.textContent = 'Aus';
    status.classList.remove('active');

    chrome.storage.local.set({ genzActive: false });

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, { action: 'revert' });
  }
});

// Restore state on popup open
chrome.storage.local.get(['genzActive'], (data) => {
  if (data.genzActive) {
    toggle.checked = true;
    status.textContent = 'Aktiv';
    status.classList.add('active');
  }
});
