// Deutsche Dialekte — Konfig-Objekte für den DialectTransformer
// Fränkisch, Berlinerisch, Schwäbisch

const DIALECTS = {

  // ==========================================================================
  // FRÄNKISCH — richtig krachledernes Fränkisch
  // ==========================================================================
  fraenkisch: {
    name: 'Fränkisch',
    phonetics: [
      // p → b
      { pattern: /\bp([aeiouyäöü])/gi, replacement: (m, v) => (m[0] === m[0].toUpperCase() ? 'B' : 'b') + v, chance: 0.7 },
      // t → d am Wortanfang
      { pattern: /\bt([aeiouyäöü])/gi, replacement: (m, v) => (m[0] === m[0].toUpperCase() ? 'D' : 'd') + v, chance: 0.65 },
      // nicht → ned
      { pattern: /\bnicht\b/gi, replacement: 'ned', chance: 0.95 },
      // ich → iech
      { pattern: /\bich\b/gi, replacement: 'iech', chance: 0.85 },
      // -lein → -la
      { pattern: /lein\b/g, replacement: 'la', chance: 0.95 },
      // -chen → -la
      { pattern: /chen\b/g, replacement: 'la', chance: 0.9 },
      // ein → a
      { pattern: /\bein\b/gi, replacement: 'a', chance: 0.75 },
      // eine → a
      { pattern: /\beine\b/gi, replacement: 'a', chance: 0.7 },
      // kein → kaa
      { pattern: /\bkein\b/gi, replacement: 'kaa', chance: 0.8 },
      // auch → aa
      { pattern: /\bauch\b/gi, replacement: 'aa', chance: 0.75 },
      // ist → is
      { pattern: /\bist\b/gi, replacement: 'is', chance: 0.8 },
      // das → des
      { pattern: /\bdas\b/gi, replacement: 'des', chance: 0.7 },
      // was → wos
      { pattern: /\bwas\b/gi, replacement: 'wos', chance: 0.7 },
      // mit → mid
      { pattern: /\bmit\b/gi, replacement: 'mid', chance: 0.7 },
      // auf → aaf
      { pattern: /\bauf\b/gi, replacement: 'aaf', chance: 0.65 },
      // haben → ham
      { pattern: /\bhaben\b/gi, replacement: 'ham', chance: 0.75 },
      // -en am Wortende oft → -n oder -a
      { pattern: /([bcdfgklmnprst])en\b/g, replacement: '$1n', chance: 0.55 },
      // wir → mir
      { pattern: /\bwir\b/gi, replacement: 'mir', chance: 0.7 },
      // er → ä (Frankenvokal)
      { pattern: /\ber\b/gi, replacement: 'ä', chance: 0.55 },
      // ganz → ganz (Fränkisch: gonz)
      { pattern: /\bganz\b/gi, replacement: 'gonz', chance: 0.7 },
      // schon → scho
      { pattern: /\bschon\b/gi, replacement: 'scho', chance: 0.8 },
    ],
    vocabulary: [
      { pattern: /\bBrötchen\b/gi, replacements: ['Weckla', 'Brödla'] },
      { pattern: /\bFleischer\b/gi, replacements: ['Metzger'] },
      { pattern: /\bKartoffel\b/gi, replacements: ['Grumbern', 'Erdäpfl'] },
      { pattern: /\blecker\b/gi, replacements: ['guud', 'bassd scho'], type: 'adj' },
      { pattern: /\bsprechen\b/gi, replacements: ['redd', 'schwätzen'] },
      { pattern: /\barbeiten\b/gi, replacements: ['schaffen', 'wergn'] },
      { pattern: /\bschauen\b/gi, replacements: ['guckn', 'luung'] },
      { pattern: /\bverstehen\b/gi, replacements: ['verschdeh'] },
      { pattern: /\bgut\b/gi, replacements: ['guud', 'bassd scho'], type: 'adj' },
      { pattern: /\bschnell\b/gi, replacements: ['gschwind', 'fix'], type: 'adj' },
      { pattern: /\bklein\b/gi, replacements: ['glaa', 'winzig'], type: 'adj' },
      { pattern: /\bkaputt\b/gi, replacements: ['hi', 'hie'], type: 'adj' },
      { pattern: /\bMädchen\b/gi, replacements: ['Madla'] },
      { pattern: /\bJunge\b/g, replacements: ['Bub', 'Büble'] },
      { pattern: /\bKopf\b/g, replacements: ['Grind', 'Kobbf'] },
      { pattern: /\bTüte\b/gi, replacements: ['Guudsla'] },
    ],
    fillers: {
      start: ['Fei, ', 'Also fei, ', 'Gell, ', 'Freilich, ', 'Schau, ', 'Horch amol, ', 'Bassd aaf, '],
      end: [', gell?', ', fei', ', freilich', ', oder?', ', gell fei?', ', bassd scho'],
      interjections: ['Bassd scho.', 'Fei wahr!', 'Allmächd!', 'Herrschaftszeiten!', 'Ja freilich!', 'Ach geh!'],
    }
  },

  // ==========================================================================
  // BERLINERISCH
  // ==========================================================================
  berlinerisch: {
    name: 'Berlinerisch',
    phonetics: [
      // g am Wortanfang vor Vokalen → j: gut → jut, gehen → jehen
      { pattern: /\b([Gg])([aeiouyäöü])/g, replacement: (m, g, v) => (g === 'G' ? 'J' : 'j') + v, chance: 0.85 },
      // das → det
      { pattern: /\bdas\b/gi, replacement: 'det', chance: 0.85 },
      // es → et
      { pattern: /\bes\b/gi, replacement: 'et', chance: 0.8 },
      // ich → ick
      { pattern: /\bich\b/gi, replacement: 'ick', chance: 0.9 },
      // auch → ooch
      { pattern: /\bauch\b/gi, replacement: 'ooch', chance: 0.8 },
      // nicht → nich
      { pattern: /\bnicht\b/gi, replacement: 'nich', chance: 0.9 },
      // ein → een
      { pattern: /\bein\b/gi, replacement: 'een', chance: 0.75 },
      // ist → is
      { pattern: /\bist\b/gi, replacement: 'is', chance: 0.85 },
      // nein → nee
      { pattern: /\bnein\b/gi, replacement: 'nee', chance: 0.9 },
      // mit → mit (bleibt, aber: nichts → nischt)
      { pattern: /\bnichts\b/gi, replacement: 'nischt', chance: 0.8 },
      // au → au (aber: auf → uff)
      { pattern: /\bauf\b/gi, replacement: 'uff', chance: 0.75 },
      // ei → ee manchmal
      { pattern: /\bweiß\b/gi, replacement: 'weeß', chance: 0.7 },
      // -ig am Wortende → -ich (richtig → richtich)
      { pattern: /ig\b/g, replacement: 'ich', chance: 0.75 },
      // was → wat
      { pattern: /\bwas\b/gi, replacement: 'wat', chance: 0.85 },
      // mit dem → mitm
      { pattern: /\bmit dem\b/gi, replacement: 'mitm', chance: 0.6 },
      // haben → ham
      { pattern: /\bhaben\b/gi, replacement: 'ham', chance: 0.7 },
      // wir → wa (Kurzform)
      { pattern: /\bwir\b/gi, replacement: 'wa', chance: 0.5 },
    ],
    vocabulary: [
      { pattern: /\bBrötchen\b/gi, replacements: ['Schrippe'] },
      { pattern: /\bBerliner\b/gi, replacements: ['Pfannkuchen'] },
      { pattern: /\blecker\b/gi, replacements: ['schmackhaft', 'knorke'], type: 'adj' },
      { pattern: /\bgut\b/gi, replacements: ['jut', 'knorke', 'dufte'], type: 'adj' },
      { pattern: /\bschlecht\b/gi, replacements: ['mies', 'doof'], type: 'adj' },
      { pattern: /\bschön\b/gi, replacements: ['dufte', 'knorke', 'schnieke'], type: 'adj' },
      { pattern: /\bschnell\b/gi, replacements: ['fix', 'dalli'], type: 'adj' },
      { pattern: /\bGeld\b/gi, replacements: ['Kohle', 'Kies', 'Mäuse'] },
      { pattern: /\bsprechen\b/gi, replacements: ['schnacken', 'quatschen'] },
      { pattern: /\bschauen\b/gi, replacements: ['kieken', 'kiecken'] },
      { pattern: /\bessen\b/gi, replacements: ['futtern', 'spachteln'] },
      { pattern: /\btrinken\b/gi, replacements: ['saufen', 'kippen'] },
      { pattern: /\bJunge\b/g, replacements: ['Göre', 'Bengel'] },
      { pattern: /\bMann\b/g, replacements: ['Kerl', 'Typ'] },
      { pattern: /\bKopf\b/g, replacements: ['Birne', 'Rübe'] },
      { pattern: /\bAngst\b/gi, replacements: ['Schiss', 'Bammel'] },
      { pattern: /\bPolizei\b/gi, replacements: ['Polente', 'Bullen'] },
      { pattern: /\bverrückt\b/gi, replacements: ['bekloppt', 'meschugge'], type: 'adj' },
    ],
    fillers: {
      start: ['Ick sach ma, ', 'Kieka, ', 'Na, ', 'Hör ma, ', 'Also, ', 'Mensch, ', 'Tja, '],
      end: [', wa?', ', oder wat?', ', ick sach\'s dir', ', na klar', ', versteehste?'],
      interjections: ['Na klar!', 'Dit is Berlin, wa?', 'Ick gloob, ick spinne!', 'Mensch Meier!', 'Na sowat!'],
    }
  },

  // ==========================================================================
  // SCHWÄBISCH — Jedes Adjektiv bekommt ein -le
  // ==========================================================================
  schwaebisch: {
    name: 'Schwäbisch',
    phonetics: [
      // nicht → net
      { pattern: /\bnicht\b/gi, replacement: 'net', chance: 0.9 },
      // ich → i
      { pattern: /\bich\b/gi, replacement: 'i', chance: 0.85 },
      // ist → isch
      { pattern: /\bist\b/gi, replacement: 'isch', chance: 0.8 },
      // ein → a
      { pattern: /\bein\b/gi, replacement: 'a', chance: 0.7 },
      // kein → koi
      { pattern: /\bkein\b/gi, replacement: 'koi', chance: 0.75 },
      // auch → au
      { pattern: /\bauch\b/gi, replacement: 'au', chance: 0.65 },
      // -chen → -le
      { pattern: /chen\b/g, replacement: 'le', chance: 0.95 },
      // -lein → -le
      { pattern: /lein\b/g, replacement: 'le', chance: 0.95 },
      // haben → hend
      { pattern: /\bhaben\b/gi, replacement: 'hend', chance: 0.7 },
      // wir → mir
      { pattern: /\bwir\b/gi, replacement: 'mir', chance: 0.7 },
      // auf → uf
      { pattern: /\bauf\b/gi, replacement: 'uf', chance: 0.65 },
      // -en am Wortende → -a
      { pattern: /([bcdfgklmnprst])en\b/g, replacement: '$1a', chance: 0.5 },
      // st → scht im Wortinneren
      { pattern: /st([aeiouyäöü])/g, replacement: (m, v) => 'scht' + v, chance: 0.6 },
      // sp → schp am Wortanfang
      { pattern: /\bsp/g, replacement: 'schp', chance: 0.6 },
    ],
    vocabulary: [
      { pattern: /\bBrötchen\b/gi, replacements: ['Weckle'] },
      { pattern: /\bKartoffel\b/gi, replacements: ['Grombira'] },
      { pattern: /\blecker\b/gi, replacements: ['lecker', 'guad'], type: 'adj' },
      { pattern: /\bsprechen\b/gi, replacements: ['schwätza'] },
      { pattern: /\barbeiten\b/gi, replacements: ['schaffa'] },
      { pattern: /\bschauen\b/gi, replacements: ['gucka', 'luaga'] },
      { pattern: /\bJunge\b/g, replacements: ['Bua', 'Büble'] },
      { pattern: /\bMädchen\b/gi, replacements: ['Mädle'] },
      { pattern: /\bGeld\b/gi, replacements: ['Geld', 'Knete'] },
    ],
    fillers: {
      start: ['Ha, ', 'Gell, ', 'Weisch, ', 'Also, ', 'Jo, ', 'Hano, '],
      end: [', gell?', ', oder?', ', weisch?', ', ha?'],
      interjections: ['Ha noi!', 'Leck mich am A...!', 'Heiligs Blechle!', 'Du meine Güte!'],
    },
    // Spezial-Feature: Adjektiv-Verniedlichung mit -le
    adjectiveDiminutive: true,
  },
};
