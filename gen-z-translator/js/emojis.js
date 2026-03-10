// Emoji-Ketten für verschiedene Kontexte
// Werden regelbasiert nach Satzende oder bei bestimmten Schlüsselwörtern eingefügt

const EMOJI_CHAINS = {
  // Lachen / Lustig
  funny: ['💀💀💀', '😭😭😭', '💀😭💀', '😂💀', '🤣💀💀', '😭✋', '💀🫠', 'LMAO 💀'],

  // Positiv / Gut / Fire
  positive: ['🔥🔥🔥', '✨✨✨', '💯🔥', '🫡🔥', '😤🔥', '💪🔥', '👑✨', '🙌🔥✨'],

  // Negativ / Schlecht
  negative: ['💀', '😬😬', '🫠🫠', '😐😐😐', '🤡🤡', '❌❌', '👎💀'],

  // Überraschung / Schock
  shock: ['😳😳😳', '🤯🤯', '😱💀', '👀👀👀', '😳💀', '🫨🫨', 'BRO 😳'],

  // Traurig / Emotional
  sad: ['😢😢', '😭😭😭', '💔💔', '🥺🥺', '😭💔', '😿😿'],

  // Liebe / Cute
  love: ['🥰🥰', '❤️‍🔥❤️‍🔥', '😍😍😍', '💕💕', '🫶🫶', '❤️✨', '🥹🫶'],

  // Zustimmung / Facts
  agree: ['💯💯', '🫡🫡', '📠📠', 'FACTS 📠', '✅✅', '🤝🤝', '💯🔥'],

  // Ablehnung / Cringe
  cringe: ['🤢🤢', '💀💀', '🤡🤡🤡', '😬💀', '🫠🫠🫠', 'CRINGE 💀'],

  // Flex / Angeben
  flex: ['💪💪', '😤💪', '👑👑', '💰💰', '🏆🏆', '😎😎'],

  // Allgemein / Random (für Satzenden)
  general: [
    '💀', '😭', '🔥', '✨', '💯', '👀', '😤', '🫡', '🗿',
    'fr fr 💀', 'no cap 🔥', 'ngl 😭', 'ong 💯', 'real 🫡',
    '💀💀', '😭😭', '🔥🔥', '✨✨'
  ],

  // Essen
  food: ['🍕🍕', '😋😋', '🤤🤤', '🍔🔥', '😩🍕'],

  // Geld
  money: ['💰💰💰', '🤑🤑', '💸💸', '💵💵💵', '🏦💰'],

  // Musik
  music: ['🎵🎵', '🔊🔊🔊', '🎶🔥', '🎧🎧'],

  // Sport / Gewinn
  win: ['🏆🏆🏆', 'W 🔥', '💪😤', '👑🏆', 'DUB 🔥'],
};

// Schlüsselwort-zu-Emoji-Kategorie Mapping
const EMOJI_KEYWORD_MAP = [
  { keywords: ['lach', 'lol', 'haha', 'witzig', 'lustig', 'funny', 'lmao', 'comedy'], category: 'funny' },
  { keywords: ['gut', 'super', 'toll', 'geil', 'nice', 'fire', 'lit', 'krass', 'stark', 'best'], category: 'positive' },
  { keywords: ['schlecht', 'schlimm', 'mist', 'kacke', 'trash', 'müll', 'fail'], category: 'negative' },
  { keywords: ['wow', 'krass', 'alter', 'boah', 'sheesh', 'omg', 'überrasch'], category: 'shock' },
  { keywords: ['traurig', 'sad', 'wein', 'schluchz', 'vermiss', 'allein', 'einsam'], category: 'sad' },
  { keywords: ['lieb', 'herz', 'cute', 'süß', 'love', 'schatz', 'bae', 'crush', 'hübsch'], category: 'love' },
  { keywords: ['stimmt', 'richtig', 'wahr', 'genau', 'recht', 'facts', 'true', 'based'], category: 'agree' },
  { keywords: ['peinlich', 'cringe', 'awkward', 'fremdschäm', 'weird', 'komisch'], category: 'cringe' },
  { keywords: ['flex', 'angeb', 'stolz', 'reich', 'teuer', 'luxus', 'gönnung'], category: 'flex' },
  { keywords: ['essen', 'food', 'hunger', 'lecker', 'kochen', 'restaurant', 'pizza'], category: 'food' },
  { keywords: ['geld', 'euro', 'dollar', 'cash', 'gehalt', 'verdien', 'kost', 'preis'], category: 'money' },
  { keywords: ['musik', 'song', 'lied', 'hör', 'spotify', 'beat', 'rap'], category: 'music' },
  { keywords: ['gewinn', 'sieg', 'champion', 'erst', 'best', 'gold', 'medaille'], category: 'win' },
];

/**
 * Bestimmt die passende Emoji-Kategorie für einen Text
 */
function getEmojiCategory(text) {
  const lower = text.toLowerCase();
  for (const mapping of EMOJI_KEYWORD_MAP) {
    for (const keyword of mapping.keywords) {
      if (lower.includes(keyword)) {
        return mapping.category;
      }
    }
  }
  return 'general';
}

/**
 * Gibt eine zufällige Emoji-Kette für eine Kategorie zurück
 */
function getRandomEmoji(category) {
  const chains = EMOJI_CHAINS[category] || EMOJI_CHAINS.general;
  return chains[Math.floor(Math.random() * chains.length)];
}

/**
 * Gibt eine zufällige Emoji-Kette basierend auf dem Textinhalt zurück
 */
function getContextualEmoji(text) {
  const category = getEmojiCategory(text);
  return getRandomEmoji(category);
}
