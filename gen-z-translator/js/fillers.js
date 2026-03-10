// Gen-Z / Gen-Alpha Füllwörter und Einschübe
// Werden zufällig in Sätze eingefügt

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
    'Vallah, ',
    'Wallah, ',
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
  ],
};

// Gen-Alpha spezifische Einschübe (TikTok / Roblox / Fortnite)
const GEN_ALPHA_EXTRAS = [
  'skibidi ',
  'rizz-mäßig ',
  'sigma ',
  'ohio-mäßig ',
  'gyatt ',
  'fanum tax ',
  'literally so ',
  'sus ',
  'bussin ',
  'slay ',
  'periodt ',
  'its giving ',
  'main character energy ',
  'understood the assignment ',
  'ate and left no crumbs ',
  'rent free ',
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
 * Entscheidet ob ein Füllwort eingefügt werden soll basierend auf Intensität
 * @param {number} intensity 10-100
 */
function shouldInsertFiller(intensity) {
  // Bei 100% Intensität: 60% Chance, bei 10%: 6% Chance
  return Math.random() < (intensity / 100) * 0.6;
}
