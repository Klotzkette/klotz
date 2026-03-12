// Bildungssprache / Juristendeutsch Füllwörter und Einschübe
// Floskeln, Rechtslatein, Kanzleisprache, gehobene Arroganz

const FORMAL_FILLERS = {
  // Einschübe am Satzanfang
  start: [
    'Nun, ',
    'Wohlan, ',
    'Fürwahr, ',
    'In der Tat, ',
    'Wie bereits dargelegt, ',
    'Es sei angemerkt, ',
    'Bekanntlich ',
    'Nicht zuletzt ',
    'Gleichwohl ',
    'Ungeachtet dessen ',
    'Im Übrigen ',
    'Nebenbei bemerkt, ',
    'Bemerkenswert ist, dass ',
    'Wie nicht anders zu erwarten, ',
    'Es darf nicht unerwähnt bleiben, dass ',
    'Nach reiflicher Überlegung ',
    'Mit Verlaub, ',
    'Wenn ich mir die Bemerkung erlauben darf: ',
    'Man muss sich vergegenwärtigen, dass ',
  ],

  // Einschübe in der Mitte
  mid: [
    ', wenn man so will, ',
    ', wohlgemerkt, ',
    ' – und das sei ausdrücklich betont – ',
    ', nota bene, ',
    ', so darf man konstatieren, ',
    ', wie man unschwer erkennt, ',
    ' – man verzeihe die Abschweifung – ',
    ', um es einmal so zu formulieren, ',
    ', dies sei nur am Rande erwähnt, ',
    ', bei Lichte betrachtet, ',
    ', cum grano salis, ',
    ', mit Verlaub, ',
    ' – und das ist entscheidend – ',
    ', gewissermaßen, ',
    ', im eigentlichen Sinne, ',
    ', stricto sensu, ',
  ],

  // Einschübe am Satzende
  end: [
    ', wenn man es recht bedenkt',
    ', so viel steht fest',
    ', das sei hier ausdrücklich vermerkt',
    ', wie der Kenner weiß',
    ', soviel hierzu',
    ', quod erat demonstrandum',
    ', um es milde auszudrücken',
    ', das darf man wohl sagen',
    ', ohne Frage',
    ', versteht sich',
    ', wohlgemerkt',
    ', nota bene',
    ', sine ira et studio',
    ', mutatis mutandis',
    ', sit venia verbo',
    ', ex cathedra',
    ', um es auf den Punkt zu bringen',
    ', man möge mir verzeihen',
  ],
};

// Rechtslatein und Bildungssprache-Einschübe (zwischen Sätzen)
const FORMAL_INTERJECTIONS = [
  'Quod erat demonstrandum.',
  'Sic!',
  'Nota bene.',
  'Dies nur am Rande.',
  'Aber ich schweife ab.',
  'Doch zurück zur Sache.',
  'Man beachte.',
  'Sapere aude!',
  'Tempora mutantur.',
  'Cui bono?',
  'Ergo.',
  'Mithin.',
  'Gleichviel.',
  'Sed legem habemus.',
  'In dubio pro reo, gewissermaßen.',
  'Audiatur et altera pars.',
  'Volenti non fit iniuria.',
  'Pacta sunt servanda.',
  'De gustibus non est disputandum.',
  'Wo kein Kläger, da kein Richter.',
];

// Parenthetische Kommentare im Bildungssprache-Modus
const FORMAL_PARENTHETICAL = {
  neutral: [
    ' (wie man unschwer erkennen kann)',
    ' (dies sei nur am Rande erwähnt)',
    ' (der Vollständigkeit halber)',
    ' (soweit die Tatsachenlage)',
    ' (vgl. hierzu auch die einschlägige Literatur)',
  ],
  positive: [
    ' (und das ist durchaus als Lob gemeint)',
    ' (Chapeau!)',
    ' (man staune)',
    ' (höchst erfreulich)',
    ' (da freut sich der Kenner)',
  ],
  negative: [
    ' (bedauerlicherweise)',
    ' (man möge mir die Direktheit nachsehen)',
    ' (ein Jammer, fürwahr)',
    ' (da hilft auch kein Rechtslatein mehr)',
    ' (hier versagt die höfliche Umschreibung)',
  ],
  informal: [
    ' (so würde man in weniger kultivierten Kreisen sagen)',
    ' (der Volksmund würde es profaner ausdrücken)',
    ' (eine Formulierung, die man in besseren Häusern meiden würde)',
    ' (man könnte es auch einfacher sagen, aber warum sollte man)',
    ' (Anm. d. Verf.: das klang vorher besser)',
    ' (das Originalwort war hier von erfrischender Schlichtheit)',
    ' (ich übersetze einmal frei in die Sprache der Gebildeten)',
  ],
  meta: [
    ' (der aufmerksame Leser wird es bemerkt haben)',
    ' (ja, dieser Text wird gerade veredelt)',
    ' (die Verwandlung schreitet voran, nicht wahr)',
    ' (Goethe hätte es nicht besser formuliert, nun ja)',
    ' (der Originalautor möge es mir nachsehen)',
  ],
};

/**
 * Erkennt ob ein Satz umgangssprachlich/informal klingt (für Kontrast-Komik)
 */
function isInformalSentence(sentence) {
  const lower = sentence.toLowerCase();
  const informalMarkers = [
    'halt', 'irgendwie', 'echt', 'mega', 'voll', 'total',
    'krass', 'geil', 'cool', 'okay', 'ding', 'kram',
    'zeug', 'typ', 'checker', 'chillen', 'checken',
  ];
  return informalMarkers.some(m => lower.includes(m));
}

/**
 * Gibt einen Filler für die formale Transformation zurück
 */
function getRandomFormalFiller(position, intensity) {
  const pool = FORMAL_FILLERS[position];
  if (!pool) return '';
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Gibt einen Rechtslatein/Bildungsbürger-Einschub zurück
 */
function getRandomFormalInterjection() {
  return FORMAL_INTERJECTIONS[Math.floor(Math.random() * FORMAL_INTERJECTIONS.length)];
}

/**
 * Entscheidet ob ein Filler eingefügt werden soll
 */
function shouldInsertFormalFiller(intensity) {
  return Math.random() < (intensity / 100) * 0.5;
}
