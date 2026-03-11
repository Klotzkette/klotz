// Zusätzliche Modi: Emoji-Sprinkler, Kleinschreibung, 80er-West-Slang,
// DDR-Parteisprech, Lutherbibel-Orthographie, Bürokrat, Adjektiv-Überschwemmer

// ==========================================================================
// EMOJI-SPRINKLER — Kontextuelle Emojis über den Text streuen
// ==========================================================================
const EMOJI_KEYWORD_MAP = [
  { keywords: ['lieb', 'herz', 'liebe', 'verliebt', 'romantik', 'küss', 'umar'], emojis: ['❤️', '💕', '🥰', '💖', '💗', '😍'] },
  { keywords: ['lach', 'lustig', 'witzig', 'humor', 'spaß', 'komisch', 'witz'], emojis: ['😂', '🤣', '😄', '😆', '😹'] },
  { keywords: ['traurig', 'wein', 'schluchz', 'traur', 'leid', 'schmerz', 'verlust'], emojis: ['😢', '😭', '💔', '🥺'] },
  { keywords: ['wütend', 'ärger', 'zorn', 'sauer', 'aggress', 'hass'], emojis: ['😤', '😠', '🤬', '💢'] },
  { keywords: ['angst', 'furcht', 'schock', 'erschreck', 'panik', 'grusel'], emojis: ['😱', '😨', '😰', '🫣'] },
  { keywords: ['essen', 'koch', 'lecker', 'hunger', 'restaurant', 'küche', 'mahl', 'speise', 'kuchen', 'brot'], emojis: ['🍕', '🍔', '🍰', '😋', '🍽️', '🧁'] },
  { keywords: ['trink', 'wein', 'bier', 'kaffee', 'tee', 'wasser', 'durst'], emojis: ['☕', '🍺', '🍷', '🥤', '🧃'] },
  { keywords: ['musik', 'sing', 'lied', 'konzert', 'band', 'gitarr', 'klavier', 'tanz'], emojis: ['🎵', '🎶', '🎸', '🎤', '💃'] },
  { keywords: ['sport', 'fußball', 'lauf', 'fitness', 'training', 'spiel', 'tor'], emojis: ['⚽', '🏃', '💪', '🏆', '🎯'] },
  { keywords: ['sonn', 'warm', 'sommer', 'strand', 'urlaub', 'meer'], emojis: ['☀️', '🌞', '🏖️', '🌊', '🌴'] },
  { keywords: ['regen', 'kalt', 'winter', 'schnee', 'eis', 'frost'], emojis: ['🌧️', '❄️', '⛄', '🥶'] },
  { keywords: ['blume', 'garten', 'natur', 'baum', 'pflanz', 'grün', 'frühling'], emojis: ['🌸', '🌻', '🌿', '🌺', '🌳'] },
  { keywords: ['arbeit', 'büro', 'job', 'projekt', 'meeting', 'deadline'], emojis: ['💼', '📊', '💻', '📋'] },
  { keywords: ['geld', 'teur', 'billig', 'preis', 'kauf', 'bezahl', 'kosten'], emojis: ['💰', '💸', '🤑', '💳'] },
  { keywords: ['feier', 'party', 'geburtstag', 'fest', 'silvester', 'jubiläum'], emojis: ['🎉', '🥳', '🎊', '🎂', '🪅'] },
  { keywords: ['kind', 'baby', 'geburt', 'familie', 'eltern', 'mama', 'papa'], emojis: ['👶', '👨‍👩‍👧', '🍼', '🧸'] },
  { keywords: ['tier', 'hund', 'katze', 'pferd', 'vogel', 'hamster'], emojis: ['🐕', '🐈', '🐴', '🐦', '🐹'] },
  { keywords: ['reis', 'flug', 'zug', 'auto', 'fahr', 'flugzeug', 'bahn'], emojis: ['✈️', '🚗', '🚂', '🗺️', '🧳'] },
  { keywords: ['buch', 'les', 'schreib', 'text', 'roman', 'gedicht', 'literatur'], emojis: ['📚', '📖', '✍️', '📝'] },
  { keywords: ['computer', 'internet', 'digital', 'app', 'software', 'program'], emojis: ['💻', '📱', '🖥️', '⌨️'] },
  { keywords: ['stark', 'kraft', 'power', 'mutig', 'held', 'sieger'], emojis: ['💪', '🦸', '⭐', '🏅'] },
  { keywords: ['schlaf', 'müde', 'bett', 'nacht', 'traum', 'gähn'], emojis: ['😴', '🛏️', '🌙', '💤'] },
  { keywords: ['denk', 'idee', 'klug', 'intelligent', 'wissen', 'gehirn', 'schau'], emojis: ['🤔', '💡', '🧠', '👀'] },
  { keywords: ['geschenk', 'überrasch', 'freude', 'glück', 'gewinn'], emojis: ['🎁', '🎊', '✨', '🌟'] },
  { keywords: ['haus', 'wohn', 'zuhause', 'heim', 'zimmer'], emojis: ['🏠', '🏡', '🔑', '🛋️'] },
  { keywords: ['zeit', 'uhr', 'stunde', 'wart', 'schnell', 'spät'], emojis: ['⏰', '⌛', '🕐', '⏳'] },
  { keywords: ['gut', 'super', 'toll', 'perfekt', 'großartig', 'wunderbar', 'erfolg', 'korrekt'], emojis: ['👍', '✅', '👏', '🙌', '✨'] },
  { keywords: ['schlecht', 'mist', 'scheiss', 'dumm', 'fehler', 'problem'], emojis: ['👎', '❌', '😬', '🙈'] },
];

const GENERAL_SPRINKLE_EMOJIS = ['✨', '💫', '🌟', '⭐', '🔸', '🔹', '💠', '🌈'];

class EmojiSprinklerTransformer {
  constructor(settings) {
    this.settings = settings;
    this.baseIntensity = settings.intensity || 50;
    this.originalTexts = new Map();
    this.nodeCount = 0;
    this.totalNodes = 0;
  }

  getEscalatedIntensity() {
    if (this.totalNodes === 0) return this.baseIntensity;
    const p = this.nodeCount / this.totalNodes;
    let m = p < 0.3 ? 0.4 + (p / 0.3) * 0.3 : p < 0.7 ? 0.7 + ((p - 0.3) / 0.4) * 0.3 : 1.0;
    return Math.min(100, Math.round(this.baseIntensity * m));
  }

  transform(text) {
    if (!text || text.trim().length < 3) return text;
    const intensity = this.getEscalatedIntensity();
    const sentences = text.split(/(?<=[.!?])\s+/);

    return sentences.map(sentence => {
      if (sentence.length < 8 || Math.random() * 100 > intensity) return sentence;

      const lower = sentence.toLowerCase();
      let emoji = null;

      for (const mapping of EMOJI_KEYWORD_MAP) {
        if (mapping.keywords.some(kw => lower.includes(kw))) {
          emoji = mapping.emojis[Math.floor(Math.random() * mapping.emojis.length)];
          break;
        }
      }

      if (!emoji) {
        if (Math.random() * 100 > intensity * 0.5) return sentence;
        emoji = GENERAL_SPRINKLE_EMOJIS[Math.floor(Math.random() * GENERAL_SPRINKLE_EMOJIS.length)];
      }

      let emojiStr = ' ' + emoji;
      if (intensity > 70 && Math.random() < 0.3) {
        const pool = EMOJI_KEYWORD_MAP.find(m => m.keywords.some(kw => lower.includes(kw)));
        if (pool) { const e2 = pool.emojis[Math.floor(Math.random() * pool.emojis.length)]; if (e2 !== emoji) emojiStr += e2; }
      }

      const pm = sentence.match(/([.!?]+)$/);
      return pm ? sentence.slice(0, -pm[0].length) + emojiStr + pm[0] : sentence + emojiStr;
    }).join(' ');
  }

  transformDOM(root) { return _sharedTransformDOM(this, root); }
  _collectTextNodes(root) { return _sharedCollectTextNodes(root); }
  revertAll() { _sharedRevert(this); }
}

// ==========================================================================
// KLEINSCHREIBUNG — alles klein
// ==========================================================================
class KleinschreibungTransformer {
  constructor(settings) { this.settings = settings; this.originalTexts = new Map(); }

  transform(text) {
    if (!text || text.trim().length < 3) return text;
    return text.toLowerCase();
  }

  transformDOM(root) { return _sharedTransformDOM(this, root); }
  _collectTextNodes(root) { return _sharedCollectTextNodes(root); }
  revertAll() { _sharedRevert(this); }
}

// ==========================================================================
// WESTDEUTSCHER 80er-SLANG (Generation X)
// ==========================================================================
const ACHTZIGER_CONFIG = {
  name: '80er West-Slang',
  phonetics: [],
  vocabulary: [
    { pattern: /\bgut\b/gi, replacements: ['dufte', 'prima', 'knorke', 'astrein'], type: 'adj' },
    { pattern: /\btoll\b/gi, replacements: ['geil', 'irre', 'affengeil', 'obercool'], type: 'adj' },
    { pattern: /\bsuper\b/gi, replacements: ['affengeil', 'oberstark', 'sahne'], type: 'adj' },
    { pattern: /\bgroßartig\b/gi, replacements: ['megastark', 'der Hammer', 'affenstark'], type: 'adj' },
    { pattern: /\bschön\b/gi, replacements: ['dufte', 'schnieke', 'fesch'], type: 'adj' },
    { pattern: /\bschlecht\b/gi, replacements: ['ätzend', 'mies', 'voll daneben', 'zum Kotzen'], type: 'adj' },
    { pattern: /\blangweilig\b/gi, replacements: ['öde', 'stinklangweilig', 'lahm'], type: 'adj' },
    { pattern: /\bcool\b/gi, replacements: ['lässig', 'easy', 'locker'], type: 'adj' },
    { pattern: /\bhübsch\b/gi, replacements: ['schnieke', 'fesch', 'ne Wucht'], type: 'adj' },
    { pattern: /\bpeinlich\b/gi, replacements: ['voll peinlich', 'oberpeinlich'], type: 'adj' },
    { pattern: /\bverrückt\b/gi, replacements: ['irre', 'total meschugge', 'bekloppt'], type: 'adj' },
    { pattern: /\bunglaublich\b/gi, replacements: ['irre', 'nicht zu fassen', 'der Wahnsinn'], type: 'adj' },
    { pattern: /\bschnell\b/gi, replacements: ['rasant', 'in null Komma nix'], type: 'adj' },
    { pattern: /\bstark\b/gi, replacements: ['bärenstark', 'oberstark'], type: 'adj' },
    { pattern: /\bteuer\b/gi, replacements: ['happig', 'gesalzen'], type: 'adj' },
    { pattern: /\bdumm\b/gi, replacements: ['doof', 'blöd', 'bescheuert'], type: 'adj' },
    { pattern: /\bklug\b/gi, replacements: ['helle', 'nicht auf den Kopf gefallen'], type: 'adj' },
    { pattern: /\bwütend\b/gi, replacements: ['stinksauer', 'auf hundertachtzig'], type: 'adj' },
    { pattern: /\bmüde\b/gi, replacements: ['fix und fertig', 'platt'], type: 'adj' },

    { pattern: /\bFreund\b/g, replacements: ['Kumpel', 'Alter', 'Macker'], type: 'noun' },
    { pattern: /\bFreundin\b/g, replacements: ['Tussi', 'Schnitte', 'Braut'], type: 'noun' },
    { pattern: /\bFreunde\b/g, replacements: ['Kumpels', 'die Clique'], type: 'noun' },
    { pattern: /\bMann\b/g, replacements: ['Typ', 'Macker', 'Kerl'], type: 'noun' },
    { pattern: /\bFrau\b/g, replacements: ['Tussi', 'Schnitte'], type: 'noun' },
    { pattern: /\bGeld\b/gi, replacements: ['Kohle', 'Knete', 'Kröten', 'Mäuse'], type: 'noun' },
    { pattern: /\bAuto\b/g, replacements: ['Karre', 'Schlitten', 'Mühle'], type: 'noun' },
    { pattern: /\bFernseher\b/gi, replacements: ['Glotze', 'Röhre', 'Flimmerkiste'], type: 'noun' },
    { pattern: /\bPolizei\b/gi, replacements: ['Bullen', 'Schmier'], type: 'noun' },
    { pattern: /\bSchule\b/gi, replacements: ['Penne'], type: 'noun' },
    { pattern: /\bParty\b/gi, replacements: ['Fete', 'Sause'], type: 'noun' },
    { pattern: /\bMusik\b/gi, replacements: ['Sound', 'Mucke'], type: 'noun' },
    { pattern: /\bArbeit\b/g, replacements: ['Maloche', 'der Job'], type: 'noun' },
    { pattern: /\bUnsinn\b/gi, replacements: ['Quatsch', 'Kokolores', 'Mumpitz'], type: 'noun' },
    { pattern: /\bProblem\b/gi, replacements: ['Stress', 'Schlamassel'], type: 'noun' },
    { pattern: /\bStreit\b/gi, replacements: ['Zoff', 'Stunk', 'Krach'], type: 'noun' },
    { pattern: /\bAngst\b/gi, replacements: ['Schiss', 'Bammel', 'Muffensausen'], type: 'noun' },
    { pattern: /\bKleidung\b/gi, replacements: ['Klamotten', 'Fummel'], type: 'noun' },
    { pattern: /\bWohnung\b/gi, replacements: ['Bude', 'Hütte'], type: 'noun' },

    { pattern: /\bessen\b/gi, replacements: ['futtern', 'mampfen', 'reinhauen'] },
    { pattern: /\btrinken\b/gi, replacements: ['saufen', 'bechern'] },
    { pattern: /\bschlafen\b/gi, replacements: ['pennen', 'ratzen'] },
    { pattern: /\breden\b/gi, replacements: ['quatschen', 'labern'] },
    { pattern: /\barbeiten\b/gi, replacements: ['malochen', 'schuften', 'ackern'] },
    { pattern: /\bgehen\b/gi, replacements: ['düsen', 'abdüsen'] },
    { pattern: /\bverstehen\b/gi, replacements: ['raffen', 'kapieren', 'checken'] },
    { pattern: /\bfeiern\b/gi, replacements: ['eine Sause machen', 'die Sau rauslassen'] },
    { pattern: /\bsehr\b/gi, replacements: ['voll', 'total', 'irre', 'echt'] },
    { pattern: /\bwirklich\b/gi, replacements: ['echt', 'voll'] },
    { pattern: /\bWow\b/gi, replacements: ['Boah!', 'Alter!', 'Wahnsinn!'] },
    { pattern: /\bJa\b/g, replacements: ['Klar', 'Logo', 'Na sicher'] },
    { pattern: /\bNein\b/g, replacements: ['Nee', 'Vergiss es', 'Null Bock'] },
    { pattern: /\bOkay\b/gi, replacements: ['Gebongt', 'Geht klar'] },
    { pattern: /\bHallo\b/gi, replacements: ['Hey', 'Mensch', 'Na du'] },
    { pattern: /\bTschüss\b/gi, replacements: ['Tschö', 'Bis die Tage', 'Mach\'s gut'] },
  ],
  fillers: {
    start: ['Ey, ', 'Mensch, ', 'Boah, ', 'Alter, ', 'Mann, ', 'Sag mal, ', 'Du, '],
    end: [', ey', ', Alter', ', echt jetzt', ', voll krass', ', Mann', ', oder was'],
    interjections: ['Boah ey!', 'Alter Schwede!', 'Hammer!', 'Wahnsinn!', 'Irre!', 'Null Problemo.'],
  }
};

// ==========================================================================
// DDR-PARTEISPRECH (Sozialistischer Realismus)
// ==========================================================================
const DDR_CONFIG = {
  name: 'DDR-Parteisprech',
  phonetics: [],
  vocabulary: [
    // Nomen
    { pattern: /\bBürger\b/gi, replacements: ['Werktätige', 'Bürger unserer Republik'], type: 'noun' },
    { pattern: /\bMenschen\b/gi, replacements: ['Werktätige', 'Bürgerinnen und Bürger unserer Republik'], type: 'noun' },
    { pattern: /\bLeute\b/gi, replacements: ['Werktätige', 'Genossinnen und Genossen'], type: 'noun' },
    { pattern: /\bArbeiter\b/gi, replacements: ['Werktätige', 'Angehörige der Arbeiterklasse'], type: 'noun' },
    { pattern: /\bRegierung\b/gi, replacements: ['Partei- und Staatsführung', 'das Zentralkomitee'], type: 'noun' },
    { pattern: /\bStaat\b/g, replacements: ['Arbeiter- und Bauernstaat', 'unsere sozialistische Republik'], type: 'noun' },
    { pattern: /\bDeutschland\b/gi, replacements: ['die Deutsche Demokratische Republik', 'unser sozialistisches Vaterland'] },
    { pattern: /\bWesten\b/gi, replacements: ['das imperialistische Ausland', 'der Klassenfeind'] },
    { pattern: /\bFirma\b/gi, replacements: ['Volkseigener Betrieb', 'VEB', 'Kombinat'], type: 'noun' },
    { pattern: /\bUnternehmen\b/gi, replacements: ['Volkseigener Betrieb', 'Kombinat'], type: 'noun' },
    { pattern: /\bChef\b/g, replacements: ['Betriebsleiter', 'Genosse Direktor', 'Parteisekretär'], type: 'noun' },
    { pattern: /\bKollegen\b/gi, replacements: ['Genossinnen und Genossen', 'das Kollektiv'], type: 'noun' },
    { pattern: /\bKollege\b/gi, replacements: ['Genosse', 'Werktätiger'], type: 'noun' },
    { pattern: /\bGeld\b/gi, replacements: ['Mittel', 'volkswirtschaftliche Ressourcen'], type: 'noun' },
    { pattern: /\bProblem\b/gi, replacements: ['noch zu lösende Aufgabe', 'Schwierigkeit auf dem Weg zum Sozialismus'], type: 'noun' },
    { pattern: /\bProbleme\b/gi, replacements: ['noch zu lösende Aufgaben', 'zeitweilige Schwierigkeiten'], type: 'noun' },
    { pattern: /\bFehler\b/gi, replacements: ['Unzulänglichkeit', 'noch zu überwindende Schwäche'], type: 'noun' },
    { pattern: /\bErfolg\b/gi, replacements: ['Errungenschaft des Sozialismus', 'Planübererfüllung'], type: 'noun' },
    { pattern: /\bSchule\b/gi, replacements: ['Polytechnische Oberschule', 'sozialistische Bildungseinrichtung'], type: 'noun' },
    { pattern: /\bUniversität\b/gi, replacements: ['Hochschule', 'sozialistische Bildungsstätte'], type: 'noun' },
    { pattern: /\bZukunft\b/gi, replacements: ['lichte Zukunft des Sozialismus', 'kommunistische Zukunft'], type: 'noun' },
    { pattern: /\bFortschritt\b/gi, replacements: ['Aufbau des Sozialismus', 'gesellschaftlicher Fortschritt'], type: 'noun' },
    { pattern: /\bFreiheit\b/gi, replacements: ['sozialistische Errungenschaften', 'Freiheit der Werktätigen'], type: 'noun' },
    { pattern: /\bDemokratie\b/gi, replacements: ['sozialistische Demokratie', 'demokratischer Zentralismus'], type: 'noun' },
    { pattern: /\bWirtschaft\b/gi, replacements: ['Planwirtschaft', 'sozialistische Volkswirtschaft'], type: 'noun' },
    { pattern: /\bArbeit\b/g, replacements: ['gesellschaftlich nützliche Tätigkeit', 'Planerfüllung'], type: 'noun' },

    // Adjektive
    { pattern: /\bgut\b/gi, replacements: ['plangemäß', 'im Sinne des Sozialismus', 'vorbildlich'], type: 'adj' },
    { pattern: /\bschlecht\b/gi, replacements: ['nicht den sozialistischen Normen entsprechend', 'konterrevolutionär'], type: 'adj' },
    { pattern: /\bwichtig\b/gi, replacements: ['von gesamtgesellschaftlicher Bedeutung', 'für den Aufbau des Sozialismus entscheidend'], type: 'adj' },
    { pattern: /\bmodern\b/gi, replacements: ['sozialistisch', 'fortschrittlich'], type: 'adj' },
    { pattern: /\berfolgreich\b/gi, replacements: ['planübererfüllend', 'vorbildlich im sozialistischen Wettbewerb'], type: 'adj' },
    { pattern: /\bneu\b/gi, replacements: ['sozialistisch erneuert', 'im Geiste des Sozialismus'], type: 'adj' },
    { pattern: /\bfrei\b/gi, replacements: ['befreit von kapitalistischer Ausbeutung'], type: 'adj' },
    { pattern: /\bgemeinsam\b/gi, replacements: ['im Kollektiv', 'in sozialistischer Gemeinschaftsarbeit'], type: 'adj' },

    // Verben
    { pattern: /\barbeiten\b/gi, replacements: ['den Plan erfüllen', 'am Aufbau des Sozialismus mitwirken'] },
    { pattern: /\bmachen\b/gi, replacements: ['im Rahmen des Plans realisieren', 'in die Tat umsetzen'] },
    { pattern: /\bsagen\b/gi, replacements: ['klarstellen', 'im Namen des Kollektivs feststellen'] },
    { pattern: /\bdenken\b/gi, replacements: ['im Sinne der Partei erwägen', 'aus marxistisch-leninistischer Sicht beurteilen'] },
    { pattern: /\bkritisieren\b/gi, replacements: ['konstruktive Kritik und Selbstkritik üben'] },

    // Verstärker
    { pattern: /\bsehr\b/gi, replacements: ['in hohem Maße', 'im Geiste des Sozialismus'] },
    { pattern: /\bimmer\b/gi, replacements: ['stets im Sinne der Partei', 'unablässig'] },
  ],
  fillers: {
    start: [
      'Genossinnen und Genossen, ',
      'Im Sinne des Sozialismus, ',
      'Im Rahmen der Planerfüllung, ',
      'Die Partei hat festgestellt, dass ',
      'Wie der Genosse Generalsekretär betonte, ',
      'Im Geiste des Marxismus-Leninismus, ',
      'Auf der Grundlage der Beschlüsse des Parteitags, ',
    ],
    end: [
      ', im Sinne der weiteren Stärkung unserer Republik',
      ', zum Wohle der Werktätigen',
      ', wie es die Partei beschlossen hat',
      ', im Geiste des proletarischen Internationalismus',
      ', in unverbrüchlicher Treue zur Partei',
      ', für den Frieden und den Sozialismus',
    ],
    interjections: [
      'Die Partei hat immer recht.',
      'Vorwärts immer, rückwärts nimmer!',
      'Der Sozialismus siegt!',
      'Es lebe die Deutsche Demokratische Republik!',
      'Von der Sowjetunion lernen heißt siegen lernen.',
    ],
  }
};

// ==========================================================================
// LUTHERBIBEL-ORTHOGRAPHIE (Frühneuhochdeutsch ~1534)
// ==========================================================================
const LUTHER_CONFIG = {
  name: 'Luther-Orthographie',
  phonetics: [
    // u → v am Wortanfang (typisch Lutherbibel): und → vnd, um → vm
    { pattern: /\bund\b/gi, replacement: 'vnd', chance: 0.85 },
    { pattern: /\bum\b/gi, replacement: 'vm', chance: 0.7 },
    { pattern: /\buns\b/gi, replacement: 'vns', chance: 0.7 },
    { pattern: /\bunser\b/gi, replacement: 'vnser', chance: 0.7 },
    { pattern: /\büber\b/gi, replacement: 'vber', chance: 0.65 },
    { pattern: /\bunter\b/gi, replacement: 'vnter', chance: 0.65 },

    // ß → ſſ (Langes s)
    { pattern: /ß/g, replacement: 'ſſ', chance: 0.7 },

    // th statt t in bestimmten Positionen: Tat → That, Tür → Thür
    { pattern: /\b([Tt])([aeiou])/g, replacement: (m, t, v) => t + 'h' + v, chance: 0.45 },

    // rt → rth am Wortende: wert → werth, Art → Arth, Ort → Orth
    { pattern: /([Ww])ert\b/g, replacement: '$1erth', chance: 0.8 },
    { pattern: /([Aa])rt\b/g, replacement: '$1rth', chance: 0.6 },
    { pattern: /([Oo])rt\b/g, replacement: '$1rth', chance: 0.6 },

    // nk → nck: Dank → Danck, trinken → trincken
    { pattern: /nk/g, replacement: 'nck', chance: 0.7 },

    // nd → ndt am Wortende: Tugend → Tugendt, Freund → Freundt, Land → Landt
    { pattern: /nd\b/g, replacement: 'ndt', chance: 0.65 },

    // Dativ-e: dem Mann → dem Manne, dem Kind → dem Kinde, dem Haus → dem Hause
    { pattern: /\b(dem|vom|zum|beim|im)\s+([A-ZÄÖÜ][a-zäöü]{2,}[bcdfgklmnprst])\b/g,
      replacement: (m, prep, noun) => prep + ' ' + noun + 'e', chance: 0.75 },

    // y statt i in griechischen/lateinischen Wörtern
    { pattern: /\bChrist/g, replacement: 'Chryst', chance: 0.5 },

    // ey statt ei (sehr typisch Luther)
    { pattern: /ei([nmt])/g, replacement: 'ey$1', chance: 0.5 },
    { pattern: /ei\b/g, replacement: 'ey', chance: 0.5 },
    { pattern: /\b([Kk])ein/g, replacement: '$1eyn', chance: 0.45 },

    // ü → v in manchen Positionen: Fürst → Fvrst
    { pattern: /\b([A-Z][a-z]*)ü/g, replacement: (m, pre) => pre + 'v', chance: 0.25 },

    // auff statt auf
    { pattern: /\b([Aa])uf\b/g, replacement: '$1uff', chance: 0.5 },

    // mb statt m am Wortende: darum → darumb, warum → warumb
    { pattern: /\bdarum\b/gi, replacement: 'darumb', chance: 0.8 },
    { pattern: /\bwarum\b/gi, replacement: 'warumb', chance: 0.8 },

    // dt statt t am Wortende bei einsilbigen Wörtern: wird → wirdt, und → vndt (schon vnd)
    { pattern: /\bwird\b/gi, replacement: 'wirdt', chance: 0.5 },
    { pattern: /\bsind\b/gi, replacement: 'sindt', chance: 0.5 },

    // nn → n manchmal: dann → dan, wenn → wen
    { pattern: /\bdann\b/gi, replacement: 'dan', chance: 0.4 },
    { pattern: /\bwenn\b/gi, replacement: 'wen', chance: 0.3 },

    // ä → e (Luther schrieb oft e statt ä): hätte → hette, wäre → were
    { pattern: /\bhätte\b/gi, replacement: 'hette', chance: 0.5 },
    { pattern: /\bwäre\b/gi, replacement: 'were', chance: 0.5 },
  ],
  vocabulary: [
    { pattern: /\baber\b/gi, replacements: ['aber', 'allein', 'doch'] },
    { pattern: /\bweil\b/gi, replacements: ['denn', 'sintemal', 'dieweil'] },
    { pattern: /\bdeshalb\b/gi, replacements: ['darumb', 'derohalben'] },
    { pattern: /\bauch\b/gi, replacements: ['auch', 'desgleichen'] },
    { pattern: /\bsehr\b/gi, replacements: ['gar', 'gar sehr', 'seer'] },
    { pattern: /\bjetzt\b/gi, replacements: ['itzt', 'jtzt', 'nu'] },
    { pattern: /\bheute\b/gi, replacements: ['heutiges Tages', 'am heutigen Thage'] },
    { pattern: /\bvielleicht\b/gi, replacements: ['villeicht', 'etwan'] },
    { pattern: /\bnicht\b/gi, replacements: ['nicht', 'nit'] },
    { pattern: /\bgibt\b/gi, replacements: ['giebt'] },
    { pattern: /\bkommen\b/gi, replacements: ['komen'] },
    { pattern: /\bnehmen\b/gi, replacements: ['nemen'] },
    { pattern: /\bsagen\b/gi, replacements: ['sagen', 'sprechen'] },
    { pattern: /\bsehen\b/gi, replacements: ['sehen', 'schawen'] },
    { pattern: /\bhelfen\b/gi, replacements: ['helffen'] },
    { pattern: /\bleben\b/gi, replacements: ['leben', 'wandeln'] },
    { pattern: /\bsterben\b/gi, replacements: ['verderben', 'dahinfahren'] },
    { pattern: /\bgeben\b/gi, replacements: ['geben', 'darreichen'] },
    { pattern: /\bwissen\b/gi, replacements: ['wiſſen'] },
    { pattern: /\bMensch\b/g, replacements: ['Mensch', 'Menschenkind'], type: 'noun' },
    { pattern: /\bGott\b/g, replacements: ['GOtt', 'der HErr'] },
    { pattern: /\bHerr\b/g, replacements: ['HErr'] },
    { pattern: /\bKönig\b/g, replacements: ['König', 'der König'], type: 'noun' },
    { pattern: /\bWort\b/g, replacements: ['Wortt', 'das Wortt'], type: 'noun' },
    { pattern: /\bWahrheit\b/gi, replacements: ['Warheyt', 'Wahrheyt'], type: 'noun' },
    { pattern: /\bFreude\b/gi, replacements: ['Frewde'], type: 'noun' },
    { pattern: /\bHerz\b/g, replacements: ['Hertz', 'Hertze'], type: 'noun' },
    { pattern: /\bSeele\b/gi, replacements: ['Seele', 'Seel'], type: 'noun' },
    { pattern: /\bKraft\b/gi, replacements: ['Krafft', 'Krafft'], type: 'noun' },
    { pattern: /\bHilfe\b/gi, replacements: ['Hülffe', 'Beystand'], type: 'noun' },
    { pattern: /\bTugend\b/gi, replacements: ['Tugendt'], type: 'noun' },
    { pattern: /\bJugend\b/gi, replacements: ['Jugendt'], type: 'noun' },
    { pattern: /\bDank\b/g, replacements: ['Danck'], type: 'noun' },
    { pattern: /\bWerk\b/g, replacements: ['Werck'], type: 'noun' },
    { pattern: /\bStück\b/g, replacements: ['Stück', 'Stücke'], type: 'noun' },
    { pattern: /\bVolk\b/g, replacements: ['Volck'], type: 'noun' },
    { pattern: /\bich\b/g, replacements: ['Jch'] },
    { pattern: /\bdiese\b/gi, replacements: ['dise', 'diese'] },
  ],
  fillers: {
    start: ['Vnd es begab sich, ', 'Sihe, ', 'Warlich, ', 'Vnd ', 'Da sprach er: ', 'Also ', 'Vnd es geschah, daſſ '],
    end: [', spricht der HErr', ', also geschah es', ', vnd ward also', ', das sey euch gesagt', ', auff daſſ ihr wiſſet'],
    interjections: ['Amen.', 'Sihe!', 'Warlich, warlich!', 'Halleluja!', 'Gelobet sey GOtt!'],
  }
};

// ==========================================================================
// Shared helper functions (DRY für simple Transformer)
// ==========================================================================
function _sharedCollectTextNodes(root) {
  const w = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => {
      const p = n.parentElement; if (!p) return NodeFilter.FILTER_REJECT;
      if (['SCRIPT','STYLE','NOSCRIPT','IFRAME','TEXTAREA','INPUT','CODE','PRE','SVG'].includes(p.tagName)) return NodeFilter.FILTER_REJECT;
      if (p.dataset && p.dataset.genzTransformed) return NodeFilter.FILTER_REJECT;
      if (n.textContent.trim().length < 3) return NodeFilter.FILTER_REJECT;
      const s = window.getComputedStyle(p);
      if (s.display === 'none' || s.visibility === 'hidden') return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const nodes = []; let node; while (node = w.nextNode()) nodes.push(node);
  return nodes;
}

function _sharedTransformDOM(transformer, rootElement) {
  const root = rootElement || document.body;
  const textNodes = _sharedCollectTextNodes(root);
  if (transformer.totalNodes !== undefined) transformer.totalNodes = textNodes.length;
  if (transformer.nodeCount !== undefined) transformer.nodeCount = 0;
  for (const n of textNodes) {
    const orig = n.textContent;
    const t = transformer.transform(orig);
    if (t !== orig) {
      transformer.originalTexts.set(n, orig);
      n.textContent = t;
      if (n.parentElement) n.parentElement.dataset.genzTransformed = 'true';
    }
    if (transformer.nodeCount !== undefined) transformer.nodeCount++;
  }
  return textNodes.length;
}

function _sharedRevert(transformer) {
  for (const [n, o] of transformer.originalTexts) {
    try { n.textContent = o; if (n.parentElement) delete n.parentElement.dataset.genzTransformed; } catch(e) {}
  }
  transformer.originalTexts.clear();
}

// ==========================================================================
// DER BÜROKRAT — Verben → Substantivierungen, Passiv, Amtsdeutsch
// ==========================================================================
const BUROKRAT_CONFIG = {
  name: 'Amtsdeutsch / Bürokrat',
  phonetics: [],
  vocabulary: [
    // Verben → Substantivierungen (Kernstück!)
    { pattern: /\bentscheiden\b/gi, replacements: ['eine Entscheidung herbeiführen', 'zur Entscheidungsfindung gelangen'] },
    { pattern: /\bentscheidet\b/gi, replacements: ['führt eine Entscheidung herbei'] },
    { pattern: /\bhelfen\b/gi, replacements: ['Hilfestellung gewähren', 'Unterstützungsleistung erbringen'] },
    { pattern: /\bhilft\b/gi, replacements: ['gewährt Hilfestellung'] },
    { pattern: /\bfragen\b/gi, replacements: ['eine Anfrage stellen', 'ein Auskunftsersuchen einreichen'] },
    { pattern: /\bfragt\b/gi, replacements: ['stellt eine Anfrage'] },
    { pattern: /\bantworten\b/gi, replacements: ['Auskunft erteilen', 'eine Stellungnahme abgeben'] },
    { pattern: /\bändern\b/gi, replacements: ['eine Änderung vornehmen', 'einer Modifikation unterziehen'] },
    { pattern: /\bändert\b/gi, replacements: ['nimmt eine Änderung vor'] },
    { pattern: /\bbeginnen\b/gi, replacements: ['den Beginn einleiten', 'die Aufnahme veranlassen'] },
    { pattern: /\bbeginnt\b/gi, replacements: ['leitet den Beginn ein'] },
    { pattern: /\benden\b/gi, replacements: ['zur Beendigung gelangen', 'die Beendigung erfahren'] },
    { pattern: /\bprüfen\b/gi, replacements: ['eine Überprüfung durchführen', 'einer eingehenden Prüfung unterziehen'] },
    { pattern: /\bprüft\b/gi, replacements: ['führt eine Überprüfung durch'] },
    { pattern: /\bbezahlen\b/gi, replacements: ['eine Zahlung leisten', 'die Begleichung veranlassen'] },
    { pattern: /\bliefern\b/gi, replacements: ['eine Lieferung vornehmen', 'die Zustellung veranlassen'] },
    { pattern: /\bverhandeln\b/gi, replacements: ['in Verhandlungen eintreten', 'Verhandlungsmaßnahmen ergreifen'] },
    { pattern: /\bplanen\b/gi, replacements: ['eine Planung erstellen', 'Planungsmaßnahmen einleiten'] },
    { pattern: /\bnutzen\b/gi, replacements: ['in Nutzung nehmen', 'einer Nutzung zuführen'] },
    { pattern: /\bbauen\b/gi, replacements: ['eine Baumaßnahme durchführen', 'bauliche Maßnahmen ergreifen'] },
    { pattern: /\bwohnen\b/gi, replacements: ['seinen Wohnsitz unterhalten'] },
    { pattern: /\barbeiten\b/gi, replacements: ['einer Erwerbstätigkeit nachgehen', 'berufliche Tätigkeit ausüben'] },
    { pattern: /\bfahren\b/gi, replacements: ['ein Fahrzeug in Betrieb nehmen', 'sich fortbewegen'] },
    { pattern: /\bgehen\b/gi, replacements: ['sich fußläufig fortbewegen', 'den Fußweg antreten'] },
    { pattern: /\bsagen\b/gi, replacements: ['eine Mitteilung machen', 'Kenntnis geben'] },
    { pattern: /\bmachen\b/gi, replacements: ['eine Durchführung veranlassen', 'zur Umsetzung bringen'] },
    { pattern: /\bdenken\b/gi, replacements: ['in Erwägung ziehen', 'einer Überlegung zuführen'] },
    { pattern: /\bschreiben\b/gi, replacements: ['eine schriftliche Mitteilung verfassen', 'zu Papier bringen'] },
    { pattern: /\blesen\b/gi, replacements: ['einer Kenntnisnahme zuführen', 'in Augenschein nehmen'] },
    { pattern: /\bbeschließen\b/gi, replacements: ['einen Beschluss fassen', 'eine Beschlussfassung herbeiführen'] },
    { pattern: /\bverbieten\b/gi, replacements: ['ein Verbot aussprechen', 'die Untersagung verfügen'] },
    { pattern: /\berlauben\b/gi, replacements: ['eine Genehmigung erteilen', 'die Erlaubnis aussprechen'] },
    { pattern: /\bbestätigen\b/gi, replacements: ['eine Bestätigung aussprechen', 'die Kenntnisnahme bestätigen'] },

    // Adjektive → aufgebläht
    { pattern: /\bschnell\b/gi, replacements: ['zeitnah', 'im beschleunigten Verfahren', 'unverzüglich'], type: 'adj' },
    { pattern: /\bgut\b/gi, replacements: ['sachgerecht', 'ordnungsgemäß', 'zweckdienlich'], type: 'adj' },
    { pattern: /\bschlecht\b/gi, replacements: ['nicht ordnungsgemäß', 'mangelhaft', 'beanstandungswürdig'], type: 'adj' },
    { pattern: /\bwichtig\b/gi, replacements: ['von erheblicher Bedeutung', 'maßgeblich', 'vorrangig zu behandeln'], type: 'adj' },
    { pattern: /\bneu\b/gi, replacements: ['neuwertig', 'erstmalig in Gebrauch genommen'], type: 'adj' },
    { pattern: /\balt\b/gi, replacements: ['einer Überalterung unterliegend', 'nicht mehr dem aktuellen Stand entsprechend'], type: 'adj' },

    // Nomen → Amtsdeutsch
    { pattern: /\bBrief\b/g, replacements: ['Schreiben', 'Zuschrift', 'Schriftstück'], type: 'noun' },
    { pattern: /\bAnruf\b/gi, replacements: ['fernmündliche Kontaktaufnahme', 'telefonische Anfrage'], type: 'noun' },
    { pattern: /\bGespräch\b/gi, replacements: ['Erörterung', 'mündliche Aussprache'], type: 'noun' },
    { pattern: /\bBitte\b/gi, replacements: ['Antrag', 'Ersuchen', 'Gesuch'], type: 'noun' },
    { pattern: /\bAntwort\b/gi, replacements: ['Bescheid', 'Stellungnahme', 'Rückäußerung'], type: 'noun' },
    { pattern: /\bVorschlag\b/gi, replacements: ['Lösungsvorschlag', 'Maßnahmenempfehlung'], type: 'noun' },
    { pattern: /\bFehler\b/gi, replacements: ['Beanstandung', 'Abweichung von der Norm', 'Mangel'], type: 'noun' },
    { pattern: /\bProblem\b/gi, replacements: ['Sachverhalt', 'klärungsbedürftiger Umstand'], type: 'noun' },
    { pattern: /\bGeld\b/gi, replacements: ['Finanzmittel', 'Haushaltsmittel', 'Geldmittel'], type: 'noun' },
    { pattern: /\bGrund\b/g, replacements: ['Veranlassung', 'Sachgrund', 'Begründung'], type: 'noun' },

    // Verstärker
    { pattern: /\bsehr\b/gi, replacements: ['in erheblichem Maße', 'in nicht unerheblicher Weise'] },
    { pattern: /\bsofort\b/gi, replacements: ['unverzüglich', 'ohne schuldhaftes Zögern'] },
    { pattern: /\bnatürlich\b/gi, replacements: ['selbstverständlich', 'wie sich von selbst versteht'] },

    // Ausrufe/Floskeln
    { pattern: /\bHallo\b/gi, replacements: ['Sehr geehrte Damen und Herren'] },
    { pattern: /\bdanke\b/gi, replacements: ['für Ihre Bemühungen dankend', 'mit verbindlichem Dank'] },
    { pattern: /\bbitte\b/gi, replacements: ['wird gebeten', 'es wird ersucht'] },
  ],
  fillers: {
    start: [
      'Bezug nehmend auf das Vorstehende, ',
      'Im Rahmen der geltenden Bestimmungen, ',
      'Unter Berücksichtigung aller Umstände, ',
      'Wie bereits mitgeteilt, ',
      'Vorbehaltlich einer anderweitigen Regelung, ',
      'Nach eingehender Prüfung der Sachlage, ',
    ],
    end: [
      ', vorbehaltlich einer anderweitigen Regelung',
      ', sofern dem keine zwingenden Gründe entgegenstehen',
      ', gemäß den geltenden Bestimmungen',
      ', unter Einhaltung der vorgeschriebenen Fristen',
      ', im Rahmen der gesetzlichen Möglichkeiten',
    ],
    interjections: [
      'Der Vorgang wird geschlossen.',
      'Es wird um Kenntnisnahme gebeten.',
      'Weiteres bleibt einer gesonderten Regelung vorbehalten.',
      'Eine Wiedervorlage wird veranlasst.',
    ],
  }
};

// ==========================================================================
// ADJEKTIV-ÜBERSCHWEMMER — Fügt überall schöne deutsche Adjektive ein
// ==========================================================================

// Die schönsten Adjektive der deutschen Sprache (nur Formen ohne Stammvokaländerung)
const BEAUTIFUL_ADJECTIVES = [
  'wunderbar', 'herrlich', 'prächtig', 'bezaubernd', 'fantastisch',
  'fabelhaft', 'großartig', 'hervorragend', 'vortrefflich', 'exquisit',
  'kostbar', 'anmutig', 'zauberhaft', 'himmlisch', 'strahlend',
  'glänzend', 'leuchtend', 'atemberaubend', 'überwältigend', 'einzigartig',
  'unvergleichlich', 'majestätisch', 'prachtvoll', 'wunderschön',
  'bemerkenswert', 'außergewöhnlich', 'überragend', 'fulminant',
  'reizend', 'graziös', 'grandios', 'spektakulär', 'phänomenal',
  'brillant', 'faszinierend', 'betörend', 'hinreißend', 'entzückend',
  'sagenhaft', 'märchenhaft', 'traumhaft', 'formidabel', 'erlesen',
  'vorzüglich', 'glanzvoll', 'feinsinnig', 'meisterhaft', 'vollendet',
  'berückend', 'glorreich', 'erhaben', 'illuster', 'blendend',
];

// Artikel → Adjektiv-Endung (schwache/gemischte Deklination)
// Für eindeutige Fälle; bei Mehrdeutigkeit wird der häufigste Fall genommen.
const _ADJ_ENDING_MAP = {
  // Bestimmte Artikel (schwache Deklination: fast immer -e oder -en)
  'der': 'e', 'die': 'e', 'das': 'e',
  'den': 'en', 'dem': 'en', 'des': 'en',
  // Unbestimmte Artikel (gemischte Deklination)
  'eine': 'e', 'einen': 'en', 'einem': 'en', 'einer': 'en', 'eines': 'en',
  // kein
  'keine': 'e', 'keinen': 'en', 'keinem': 'en', 'keiner': 'en', 'keines': 'en',
  // Demonstrativa
  'dieser': 'e', 'diese': 'e', 'dieses': 'e', 'diesem': 'en', 'diesen': 'en',
  'jeder': 'e', 'jede': 'e', 'jedes': 'e', 'jedem': 'en', 'jeden': 'en',
  // Possessiva (Formen auf -e, -en, -em, -er, -es sind eindeutig)
  'meine': 'e', 'meinen': 'en', 'meinem': 'en', 'meiner': 'en',
  'seine': 'e', 'seinen': 'en', 'seinem': 'en', 'seiner': 'en',
  'ihre': 'e', 'ihren': 'en', 'ihrem': 'en', 'ihrer': 'en',
  'unsere': 'e', 'unseren': 'en', 'unserem': 'en', 'unserer': 'en',
};

// Neutrum-Suffixe für die Erkennung bei "ein/kein/mein/sein/ihr/unser"
const _NEUTER_NOUN_SUFFIXES = /(?:chen|lein|ment|tum|nis|ma|ium|um)$/;

function _getAdjEnding(article, noun) {
  const art = article.toLowerCase();

  // Direkte Zuordnung für eindeutige Formen
  if (_ADJ_ENDING_MAP[art]) return _ADJ_ENDING_MAP[art];

  // "ein", "kein", "mein", "sein", "ihr", "unser" — Endung hängt vom Genus ab
  // Neutrum-Suffixe → -es, sonst → -er (Maskulinum ist häufiger)
  if (['ein', 'kein', 'mein', 'sein', 'ihr', 'unser'].includes(art)) {
    return _NEUTER_NOUN_SUFFIXES.test(noun) ? 'es' : 'er';
  }

  return 'e'; // Fallback
}

class AdjektivUeberschwemmerTransformer {
  constructor(settings) {
    this.settings = settings;
    this.baseIntensity = settings.intensity || 50;
    this.originalTexts = new Map();
    this.nodeCount = 0;
    this.totalNodes = 0;
    this._buildPattern();
  }

  _buildPattern() {
    // Alle bekannten Artikel-Formen, sortiert nach Länge (längste zuerst)
    const articles = Object.keys(_ADJ_ENDING_MAP)
      .concat(['ein', 'kein', 'mein', 'sein', 'ihr', 'unser'])
      .sort((a, b) => b.length - a.length);
    // Deduplizieren
    const unique = [...new Set(articles)];
    // Pattern: Artikel + Leerzeichen + großgeschriebenes Nomen
    // Nicht matchen, wenn zwischen Artikel und Nomen bereits ein kleingeschriebenes
    // Wort steht (= es gibt schon ein Adjektiv)
    this._pattern = new RegExp(
      '\\b(' + unique.join('|') + ')\\s+([A-ZÄÖÜ][a-zäöüß]{2,})',
      'gi'
    );
  }

  getEscalatedIntensity() {
    if (this.totalNodes === 0) return this.baseIntensity;
    const p = this.nodeCount / this.totalNodes;
    let m = p < 0.3 ? 0.4 + (p / 0.3) * 0.3 : p < 0.7 ? 0.7 + ((p - 0.3) / 0.4) * 0.3 : 1.0;
    return Math.min(100, Math.round(this.baseIntensity * m));
  }

  _randomAdj() {
    return BEAUTIFUL_ADJECTIVES[Math.floor(Math.random() * BEAUTIFUL_ADJECTIVES.length)];
  }

  transform(text) {
    if (!text || text.trim().length < 10) return text;
    const intensity = this.getEscalatedIntensity();

    const result = text.replace(this._pattern, (match, article, noun) => {
      if (Math.random() * 100 > intensity) return match;

      // Nicht einfügen vor Eigennamen-typischen Kurzwörtern (z.B. "Die EU", "Der FC")
      if (noun.length <= 3 && noun === noun.toUpperCase()) return match;

      const ending = _getAdjEnding(article, noun);
      const adj = this._randomAdj();
      const inflected = adj + ending;

      return article + ' ' + inflected + ' ' + noun;
    });

    return result;
  }

  transformDOM(root) { return _sharedTransformDOM(this, root); }
  _collectTextNodes(root) { return _sharedCollectTextNodes(root); }
  revertAll() { _sharedRevert(this); }
}

// ==========================================================================
// VOKALENTFERNER — Alle Vokale (a, e, i, o, u, ä, ö, ü) entfernen
// ==========================================================================
class VokalentfernerTransformer {
  constructor(settings) {
    this.settings = settings;
    this.baseIntensity = settings.intensity || 50;
    this.originalTexts = new Map();
    this.nodeCount = 0;
    this.totalNodes = 0;
  }

  getEscalatedIntensity() {
    if (this.totalNodes === 0) return this.baseIntensity;
    const p = this.nodeCount / this.totalNodes;
    let m = p < 0.3 ? 0.4 + (p / 0.3) * 0.3 : p < 0.7 ? 0.7 + ((p - 0.3) / 0.4) * 0.3 : 1.0;
    return Math.min(100, Math.round(this.baseIntensity * m));
  }

  transform(text) {
    if (!text || text.trim().length < 3) return text;
    const intensity = this.getEscalatedIntensity();

    // Wortweise: bei niedriger Intensität werden manche Wörter verschont
    return text.replace(/\b[A-Za-zÄÖÜäöüß]+\b/g, (word) => {
      if (word.length < 2) return word;
      if (Math.random() * 100 > intensity) return word;
      const stripped = word.replace(/[aeiouäöüAEIOUÄÖÜ]/g, '');
      // Wenn alles Vokale waren (z.B. "au"), mindestens ersten Buchstaben behalten
      return stripped.length > 0 ? stripped : word[0];
    });
  }

  transformDOM(root) { return _sharedTransformDOM(this, root); }
  _collectTextNodes(root) { return _sharedCollectTextNodes(root); }
  revertAll() { _sharedRevert(this); }
}
