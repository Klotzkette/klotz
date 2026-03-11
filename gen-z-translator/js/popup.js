// Popup Controller — Multi-Mode
const $ = (id) => document.getElementById(id);

const modeSelect = $('modeSelect');
const intensitySlider = $('intensity');
const intensityLabel = $('intensityLabel');
const transformBtn = $('transformBtn');
const revertBtn = $('revertBtn');

// Modus-Konfiguration: Theme, Titel, Beschreibungen
const MODE_CONFIG = {
  genz: {
    theme: 'theme-genz', title: 'Gen-Z Transformer 💀🔥',
    subtitle: 'Drei Akte der Jugendsprache-Verwandlung',
    replace: 'Normale Wörter durch Slang ersetzen',
    fillers: 'Digga, lowkey + Gen-Z-Kommentare',
    fillersLabel: 'Füllwörter & Kommentare',
    akt: ['Akt I: Subtil', 'Akt II: Kontrast', 'Akt III: Brainrot'],
    btn: 'SEITE TRANSFORMIEREN 🔥', footer: 'no cap, fr fr — v3.0',
    hasAkt: true,
  },
  formal: {
    theme: 'theme-formal', title: 'Bildungssprache 📜⚖️',
    subtitle: 'Drei Akte der sprachlichen Veredelung',
    replace: 'Wörter durch elaborierte Synonyme ersetzen',
    fillers: 'Nota bene, quod erat demonstrandum',
    fillersLabel: 'Floskeln & Rechtslatein',
    akt: ['Akt I: Dezent', 'Akt II: Gelehrt', 'Akt III: Kanzlei'],
    btn: 'SEITE VEREDELN 📜', footer: 'Quod erat demonstrandum — v3.0',
    hasAkt: true,
  },
  politiker: {
    theme: 'theme-special', title: 'Politiker-Sprech 🏛️',
    subtitle: 'Phrasen, Floskeln und Maßnahmenpakete',
    replace: 'Probleme → Herausforderungen', fillers: 'Leere Worthülsen einfügen',
    fillersLabel: 'Phrasen & Worthülsen',
    akt: ['Akt I: Diplomatisch', 'Akt II: Ausweichend', 'Akt III: Reine Worthülsen'],
    btn: 'SEITE POLITISIEREN 🏛️', footer: 'Das ist alternativlos — v3.0',
    hasAkt: true,
  },
  barock: {
    theme: 'theme-barock', title: 'Barock-Deutsch 🏰',
    subtitle: 'Mir deucht, ein Wandel nahet',
    replace: 'Wörter durch anachronistische Begriffe ersetzen',
    fillers: 'Fürwahr, sintemalen und derohalben',
    fillersLabel: 'Barocke Floskeln',
    akt: ['Akt I: Leicht alterthümlich', 'Akt II: Barockisiert', 'Akt III: Vollständig anno 1700'],
    btn: 'SEITE BAROCKISIEREN 🏰', footer: 'Sapperment! — v3.0',
    hasAkt: true,
  },
  berlinerisch: {
    theme: 'theme-dialect', title: 'Berlinerisch 🐻',
    subtitle: 'Ick bin een Berlina!',
    replace: 'dit → das, ick → ich, jut → gut',
    fillers: 'Wa?, Ick sach ma, Kieka',
    fillersLabel: 'Berliner Füllwörter',
    akt: ['Akt I: Leichta Akzent', 'Akt II: Kiez-Sprache', 'Akt III: Volle Schnauze'],
    btn: 'SEITE BERLINERN 🐻', footer: 'Dit is Berlin, wa? — v3.0',
    hasAkt: true,
  },
  saechsisch: {
    theme: 'theme-dialect', title: 'Sächsisch 🎻',
    subtitle: 'Nu guck ma eener an!',
    replace: 'Konsonanten-Verschiebung & Vokaländerungen',
    fillers: 'Nu, Gelle, Na',
    fillersLabel: 'Sächsische Füllwörter',
    akt: ['Akt I: Leichter Tonfall', 'Akt II: Sachsen hört man', 'Akt III: Voll sächsisch'],
    btn: 'SEITE SÄCHSELN 🎻', footer: 'Nu guck! — v3.0',
    hasAkt: true,
  },
  fraenkisch: {
    theme: 'theme-dialect', title: 'Fränkisch 🌭',
    subtitle: 'Bassd scho, gell?',
    replace: 'ned, fei, -la statt -chen',
    fillers: 'Fei, Gell, Freilich',
    fillersLabel: 'Fränkische Füllwörter',
    akt: ['Akt I: Leicht fränkisch', 'Akt II: Franken merkt man', 'Akt III: Voll fränkisch'],
    btn: 'SEITE FRANKISIEREN 🌭', footer: 'Bassd scho! — v3.0',
    hasAkt: true,
  },
  bairisch: {
    theme: 'theme-dialect', title: 'Bairisch 🥨',
    subtitle: 'Ja mei, des passt scho!',
    replace: 'ned, i, mia, -erl statt -chen',
    fillers: 'Ja mei, Sakra, Gell',
    fillersLabel: 'Bairische Füllwörter',
    akt: ['Akt I: Leichter Dialekt', 'Akt II: Bayerisch', 'Akt III: Voll bairisch'],
    btn: 'SEITE BAIRISCH MACHEN 🥨', footer: 'Habedieehre! — v3.0',
    hasAkt: true,
  },
  schwaebisch: {
    theme: 'theme-dialect', title: 'Schwäbisch 🏠',
    subtitle: 'I sag\'s, wie\'s isch!',
    replace: 'net, isch, -le statt -chen',
    fillers: 'Ha, Gell, Weisch',
    fillersLabel: 'Schwäbische Füllwörter',
    akt: ['Akt I: Leicht schwäbisch', 'Akt II: Schwaben hört man', 'Akt III: Voll schwäbisch'],
    btn: 'SEITE SCHWÄBELN 🏠', footer: 'Ha noi! — v3.0',
    hasAkt: true,
  },
  ruhrpott: {
    theme: 'theme-dialect', title: 'Ruhrpott ⚒️',
    subtitle: 'Hömma, dat is hier so!',
    replace: 'dat, wat, et, nich',
    fillers: 'Ey, Hömma, Woll',
    fillersLabel: 'Ruhrpott-Füllwörter',
    akt: ['Akt I: Leichter Pott', 'Akt II: Ruhrgebiet', 'Akt III: Voll Ruhrpott'],
    btn: 'SEITE VERPOTTEN ⚒️', footer: 'Hömma! — v3.0',
    hasAkt: true,
  },
  norddeutsch: {
    theme: 'theme-dialect', title: 'Norddeutsch ⚓',
    subtitle: 'Moin. Nich so viel schnacken.',
    replace: 'Understatement & norddeutsche Vokabeln',
    fillers: 'Moin, Tja, Nech',
    fillersLabel: 'Norddeutsche Füllwörter',
    akt: ['Akt I: Leicht nordisch', 'Akt II: Küstennah', 'Akt III: Voll norddeutsch'],
    btn: 'SEITE NORDISCH MACHEN ⚓', footer: 'Butter bei die Fische — v3.0',
    hasAkt: true,
  },
  gender_star: {
    theme: 'theme-gender', title: 'Gendern (Stern) ⭐',
    subtitle: 'Lehrer → Lehrer*innen',
    replace: 'Nomen mit Genderstern versehen', fillers: '—',
    fillersLabel: 'Füllwörter', btn: 'TEXT GENDERN ⭐',
    footer: 'Inklusiv — v3.0', hasAkt: false,
  },
  gender_colon: {
    theme: 'theme-gender', title: 'Gendern (Doppelpunkt) ✳️',
    subtitle: 'Lehrer → Lehrer:innen',
    replace: 'Nomen mit Gender-Doppelpunkt versehen', fillers: '—',
    fillersLabel: 'Füllwörter', btn: 'TEXT GENDERN ✳️',
    footer: 'Inklusiv — v3.0', hasAkt: false,
  },
  gender_explicit: {
    theme: 'theme-gender', title: 'Gendern (ausgeschrieben) 📝',
    subtitle: 'Lehrer → Lehrerinnen und Lehrer',
    replace: 'Beidnennung ausschreiben', fillers: '—',
    fillersLabel: 'Füllwörter', btn: 'TEXT GENDERN 📝',
    footer: 'Inklusiv — v3.0', hasAkt: false,
  },
  gender_participle: {
    theme: 'theme-gender', title: 'Gendern (Partizip) 🔄',
    subtitle: 'Studenten → Studierende',
    replace: 'Partizip-Formen verwenden', fillers: '—',
    fillersLabel: 'Füllwörter', btn: 'TEXT GENDERN 🔄',
    footer: 'Inklusiv — v3.0', hasAkt: false,
  },
  gender_maskulinum: {
    theme: 'theme-gender', title: 'Generisches Maskulinum ♂️',
    subtitle: 'Studierende → Studenten',
    replace: 'Gender-Formen durch Maskulinum ersetzen', fillers: '—',
    fillersLabel: 'Füllwörter', btn: 'GENERISCHES MASKULINUM ♂️',
    footer: 'Klassisch — v3.0', hasAkt: false,
  },
  adjektivkiller: {
    theme: 'theme-special', title: 'Adjektivkiller ✂️',
    subtitle: 'Alle Adjektive raus!',
    replace: 'Adjektive aus dem Text streichen', fillers: '—',
    fillersLabel: 'Füllwörter', btn: 'ADJEKTIVE ELIMINIEREN ✂️',
    footer: 'Weniger ist mehr — v3.0', hasAkt: true,
  },
  adjektivflut: {
    theme: 'theme-special', title: 'Adjektiv-Überschwemmer 🌊',
    subtitle: 'Die schönsten Adjektive der deutschen Sprache',
    replace: 'Wunderschöne Adjektive überall einfügen', fillers: '—',
    fillersLabel: 'Füllwörter', btn: 'TEXT VERSCHÖNERN 🌊',
    footer: 'Alles wird wunderbar — v3.0', hasAkt: true,
  },
  achtziger: {
    theme: 'theme-special', title: '80er West-Slang 📼',
    subtitle: 'Boah ey, voll krass, Alter!',
    replace: 'Wörter durch 80er-Slang ersetzen',
    fillers: 'Ey, Alter, Boah, Mann',
    fillersLabel: '80er-Füllwörter',
    akt: ['Akt I: Leicht retro', 'Akt II: Voll achtziger', 'Akt III: Alter Schwede!'],
    btn: 'SEITE VOLL KRASS MACHEN 📼', footer: 'Boah ey! — v3.0',
    hasAkt: true,
  },
  ddr: {
    theme: 'theme-special', title: 'DDR-Parteisprech ☭',
    subtitle: 'Genossinnen und Genossen!',
    replace: 'Wörter durch sozialistischen Jargon ersetzen',
    fillers: 'Im Sinne des Sozialismus',
    fillersLabel: 'Partei-Floskeln',
    akt: ['Akt I: Plangemäß', 'Akt II: Parteitag', 'Akt III: Zentralkomitee'],
    btn: 'SEITE SOZIALISTISCH MACHEN ☭', footer: 'Vorwärts immer! — v3.0',
    hasAkt: true,
  },
  luther: {
    theme: 'theme-barock', title: 'Lutherbibel-Orthographie ✝️',
    subtitle: 'Vnd es begab sich...',
    replace: 'Frühneuhochdeutsche Schreibung anwenden',
    fillers: 'Sihe, Warlich, Amen',
    fillersLabel: 'Biblische Floskeln',
    akt: ['Akt I: Leicht altertümlich', 'Akt II: Anno 1534', 'Akt III: Voll Luther'],
    btn: 'SEITE REFORMIEREN ✝️', footer: 'Warlich! — v3.0',
    hasAkt: true,
  },
  burokrat: {
    theme: 'theme-special', title: 'Der Bürokrat 🏢',
    subtitle: 'Eine Durchführung wird veranlasst',
    replace: 'Verben → Substantivierungen, Amtsdeutsch',
    fillers: 'Bezug nehmend, vorbehaltlich',
    fillersLabel: 'Amtsfloskeln',
    akt: ['Akt I: Sachlich', 'Akt II: Amtlich', 'Akt III: Kafka'],
    btn: 'SEITE BÜROKRATISIEREN 🏢', footer: 'Es wird um Kenntnisnahme gebeten — v3.0',
    hasAkt: true,
  },
  emoji: {
    theme: 'theme-genz', title: 'Emoji-Sprinkler 😊',
    subtitle: 'Kontextuelle Emojis streuen',
    replace: 'Passende Emojis nach Sätzen einfügen', fillers: '—',
    fillersLabel: 'Füllwörter', btn: 'EMOJIS STREUEN 😊',
    footer: '✨ Emojis überall ✨ — v3.0', hasAkt: true,
  },
  kleinschreibung: {
    theme: 'theme-special', title: 'alles kleinschreiben 🔡',
    subtitle: 'großbuchstaben sind überbewertet',
    replace: 'alle großbuchstaben durch kleine ersetzen', fillers: '—',
    fillersLabel: 'Füllwörter', btn: 'ALLES KLEIN MACHEN 🔡',
    footer: 'alles klein — v3.0', hasAkt: false,
  },
  vokalentferner: {
    theme: 'theme-special', title: 'Vklntfrnr 🕳️',
    subtitle: 'Ll Vkl rflgn!',
    replace: 'Alle Vokale und Umlaute entfernen', fillers: '—',
    fillersLabel: 'Füllwörter', btn: 'VKLE NTFRNN 🕳️',
    footer: 'Knsnntn rgrn — v3.0', hasAkt: true,
  },
  wienerisch: {
    theme: 'theme-dialect', title: 'Wienerisch 🎡',
    subtitle: 'Geh bitte, des is ur leiwand!',
    replace: 'Wienerische Vokabeln & Phonetik',
    fillers: 'Geh, Oida, Bittschön',
    fillersLabel: 'Wiener Füllwörter',
    akt: ['Akt I: Leicht wienerisch', 'Akt II: Am Naschmarkt', 'Akt III: Ur-Wienerisch'],
    btn: 'SEITE WEANERISCH MACHEN 🎡', footer: 'Servas! — v3.0',
    hasAkt: true,
  },
  schweizerdeutsch: {
    theme: 'theme-dialect', title: 'Schweizerdeutsch 🏔️',
    subtitle: 'Grüezi mitenand!',
    replace: 'Schweizer Ausdrücke & Phonetik',
    fillers: 'Grüezi, Gäll, Äuä',
    fillersLabel: 'Schweizer Füllwörter',
    akt: ['Akt I: Leicht schwiizerisch', 'Akt II: Berner Oberland', 'Akt III: Voll Schwyzerdütsch'],
    btn: 'SEITE SCHWIIZERISCH MACHEN 🏔️', footer: 'Grüezi! — v3.0',
    hasAkt: true,
  },
};

function setMode(mode) {
  const config = MODE_CONFIG[mode];
  if (!config) return;

  // Theme
  document.body.className = config.theme;

  // Header
  $('headerTitle').textContent = config.title;
  $('headerSubtitle').textContent = config.subtitle;

  // Controls
  $('descReplace').textContent = config.replace;
  $('labelFillers').textContent = config.fillersLabel;
  $('descFillers').textContent = config.fillers;

  // Akt-Labels
  if (config.akt) {
    $('aktLabel1').textContent = config.akt[0];
    $('aktLabel2').textContent = config.akt[1];
    $('aktLabel3').textContent = config.akt[2];
  }

  // Akt-Sichtbarkeit
  if (config.hasAkt) {
    document.body.classList.remove('no-akt');
  } else {
    document.body.classList.add('no-akt');
  }

  // Button
  transformBtn.textContent = config.btn;
  $('footerText').textContent = config.footer;

  // Select synchronisieren
  modeSelect.value = mode;

  saveSettings(getSettings());
}

// === Mode Select Handler ===
modeSelect.addEventListener('change', () => {
  setMode(modeSelect.value);
});

// === Settings ===
function getSettings() {
  const mode = modeSelect.value;
  const settings = {
    mode: mode,
    replace: $('toggleReplace').checked,
    fillers: $('toggleFillers').checked,
    emojis: $('toggleEmojis').checked,
    intensity: parseInt(intensitySlider.value),
  };

  // Gender-Submodus
  if (mode.startsWith('gender_')) {
    settings.genderMode = mode.replace('gender_', '');
  }

  return settings;
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
  if (s.mode && MODE_CONFIG[s.mode]) {
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

// Save on any toggle/slider change
document.querySelectorAll('input[type="checkbox"], input[type="range"]').forEach(el => {
  el.addEventListener('change', () => saveSettings(getSettings()));
});
