// Gen-Z / Gen-Alpha Füllwörter und Einschübe 2026
// Erweitert mit allen Begriffen aus dem Jugendsprache-Glossar

const FILLER_WORDS = {
  // Füllwörter die am Satzanfang stehen können
  start: [
    'Digga, ',
    'Bro, ',
    'Bruder, ',
    'Alter, ',
    'Ey, ',
    'Yo, ',
    'No cap, ',
    'Fr fr, ',
    'Real talk, ',
    'Ngl, ',
    'Lowkey, ',
    'Okay but like, ',
    'Wait, ',
    'Ong, ',
    'Bestie, ',
    'Slay, ',
    'Bruh, ',
    'Sheesh, ',
    'Wallah, ',
    'Mois, ',
    'Habibi, ',
    'King, ',
    'Queen, ',
    'Ahnma, ',
    'Leude, ',
    'Fam, ',
  ],

  // Füllwörter die in der Mitte eines Satzes stehen können
  mid: [
    ' lowkey ',
    ' highkey ',
    ' literally ',
    ' fr ',
    ' ngl ',
    ' no cap ',
    ' halt ',
    ' irgendwie ',
    ', digga, ',
    ', bro, ',
    ', alter, ',
    ' ong ',
    ' deadass ',
    ' straight up ',
    ', und so, ',
    ' oder so ',
    ' safe ',
    ' real talk ',
    ', mois, ',
    ' unironisch ',
    ' on god ',
    ' periodt ',
  ],

  // Füllwörter die am Satzende stehen können
  end: [
    ' fr',
    ' ngl',
    ' no cap',
    ', digga',
    ', bro',
    ', alter',
    ', ehrlich jetzt',
    ', kein Ding',
    ', real talk',
    ' ong',
    ', weißte',
    ', verstehste',
    ', safe',
    ', on god',
    ', und so',
    ', oder so',
    ', wallah',
    ' tbh',
    ' istg',
    ', ich schwör',
    ', periodt',
    ', Mashallah',
    ' fr fr',
    ', Habibi',
    ', no cap fr',
  ],
};

// Gen-Alpha spezifische Einschübe (TikTok / Roblox / Fortnite / 2026 Trends)
const GEN_ALPHA_EXTRAS = [
  'Skibidi ',
  'Rizz-mäßig ',
  'Sigma ',
  'Ohio-mäßig ',
  'Gyatt ',
  'Fanum tax ',
  'Literally so ',
  'Sus ',
  'Bussin ',
  'Slay ',
  'Periodt ',
  'Its giving ',
  'Main character energy ',
  'Understood the assignment ',
  'Ate and left no crumbs ',
  'Rent free ',
  'Locked in ',
  'Delulu ',
  'Its giving Era ',
  'Vibe check: ',
  'No cap fr fr ',
  'POV: ',
];

// Satz-Einschübe die zwischen Sätzen eingefügt werden (bei hoher Intensität)
const SENTENCE_INTERJECTIONS = [
  'Sheesh.',
  'No cap.',
  'Fr fr.',
  'Wild.',
  'Ong.',
  'Slay.',
  'Periodt.',
  'Real.',
  'Facts.',
  'Based.',
  'Respekt.',
  'Ehre.',
  'W.',
  'Mood.',
  'Vibe.',
  'Das crazy.',
  'Bruh.',
];

/**
 * Gibt ein zufälliges Füllwort für die angegebene Position zurück
 * @param {'start'|'mid'|'end'} position
 * @param {number} intensity 10-100
 */
function getRandomFiller(position, intensity) {
  const pool = FILLER_WORDS[position];
  if (!pool) return '';

  // Bei höherer Intensität auch Gen-Alpha Extras einstreuen
  if (intensity > 60 && position === 'start' && Math.random() < 0.3) {
    const extra = GEN_ALPHA_EXTRAS[Math.floor(Math.random() * GEN_ALPHA_EXTRAS.length)];
    return extra;
  }

  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Gibt einen zufälligen Satz-Einschub zurück
 */
function getRandomInterjection() {
  return SENTENCE_INTERJECTIONS[Math.floor(Math.random() * SENTENCE_INTERJECTIONS.length)];
}

/**
 * Entscheidet ob ein Füllwort eingefügt werden soll basierend auf Intensität
 * @param {number} intensity 10-100
 */
function shouldInsertFiller(intensity) {
  // Bei 100% Intensität: 60% Chance, bei 10%: 6% Chance
  return Math.random() < (intensity / 100) * 0.6;
}
