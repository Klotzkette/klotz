// Deutsche Dialekte — Konfig-Objekte für den DialectTransformer
// Nur Fränkisch wird verwendet

const DIALECTS = {

  // ==========================================================================
  // FRÄNKISCH
  // ==========================================================================
  fraenkisch: {
    name: 'Fränkisch',
    phonetics: [
      // p → b
      { pattern: /\bp([aeiouyäöü])/gi, replacement: (m, v) => (m[0] === m[0].toUpperCase() ? 'B' : 'b') + v, chance: 0.5 },
      // t → d
      { pattern: /\bt([aeiouyäöü])/gi, replacement: (m, v) => (m[0] === m[0].toUpperCase() ? 'D' : 'd') + v, chance: 0.5 },
      // nicht → ned
      { pattern: /\bnicht\b/gi, replacement: 'ned', chance: 0.85 },
      // ich → iech
      { pattern: /\bich\b/gi, replacement: 'iech', chance: 0.7 },
      // -lein → -la
      { pattern: /lein\b/g, replacement: 'la', chance: 0.9 },
      // -chen → -la
      { pattern: /chen\b/g, replacement: 'la', chance: 0.8 },
      // ein → a
      { pattern: /\bein\b/gi, replacement: 'a', chance: 0.6 },
      // kein → kaa
      { pattern: /\bkein\b/gi, replacement: 'kaa', chance: 0.7 },
      // auch → aa
      { pattern: /\bauch\b/gi, replacement: 'aa', chance: 0.6 },
    ],
    vocabulary: [
      { pattern: /\bBrötchen\b/gi, replacements: ['Weckla', 'Brödla'] },
      { pattern: /\bFleischer\b/gi, replacements: ['Metzger'] },
      { pattern: /\bKartoffel\b/gi, replacements: ['Grumbern', 'Erdäpfl'] },
      { pattern: /\blecker\b/gi, replacements: ['guud', 'bassd scho'], type: 'adj' },
      { pattern: /\bsprechen\b/gi, replacements: ['redd', 'schwätzen'] },
      { pattern: /\barbeiten\b/gi, replacements: ['schaffen', 'wergn'] },
    ],
    fillers: {
      start: ['Fei, ', 'Also fei, ', 'Gell, ', 'Freilich, ', 'Schau, '],
      end: [', gell?', ', fei', ', freilich', ', oder?'],
      interjections: ['Bassd scho.', 'Fei wahr!', 'Allmächd!', 'Herrschaftszeiten!'],
    }
  },
};
