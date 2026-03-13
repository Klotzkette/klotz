// Emoji-Ketten für verschiedene Kontexte
// Basierend auf dem Jugendsprache-Glossar 2026
// Werden regelbasiert nach Satzende oder bei bestimmten Schlüsselwörtern eingefügt

const EMOJI_CHAINS = {
  // Lachen / extrem lustig
  funny: [
    '💀💀💀', '😭😭😭', '💀😭💀', '😂💀', '🤣💀💀', '😭✋',
    '💀🫠', 'LMAO 💀', '💀💀', '😂😂😂',
    '💀💀💀💀💀', '😭😂😭', '😂😂😂😂', 'HELP 💀💀',
    'I CAN\'T 😭', 'LMFAO 💀💀💀', '☠️☠️☠️', 'BRO 😭😭',
    '😭😭😭😭😭', '💀☠️💀', 'stop it 😂💀', 'AYO 💀💀',
  ],

  // Positiv / Gut / Fire / Erfolg
  positive: [
    '🔥🔥🔥', '✨✨✨', '💯🔥', '🫡🔥', '😤🔥', '💪🔥',
    '👑✨', '🙌🔥✨', '🔥🔥', '💅✨', '🏆🔥',
    '🔥🔥🔥🔥🔥', '✨🔥✨🔥✨', '💯💯💯', 'W 🔥🔥',
    '🫡🫡🫡', '😤😤🔥🔥', '👏🔥👏🔥', '🙏✨🔥',
    'absolute W 🏆', '🌟🌟🌟', '⭐🔥⭐',
  ],

  // Negativ / Schlecht / Frustration
  negative: [
    '💀', '😬😬', '🫠🫠', '😐😐😐', '🤡🤡', '❌❌', '👎💀',
    '😩😩', '😤😤', '💀💀',
    '🥀🥀🥀🥀🥀', '💀💀💀💀💀', '😐😐😐😐', '🫠💀🫠',
    'yikes 😬💀', '❌💀❌', '🤡💀🤡', 'RIP 💀🥀',
    '🪦🪦🪦', '😩💀😩', 'absolute L 💀',
  ],

  // Überraschung / Schock (verwirrt, überrascht)
  shock: [
    '😳😳😳', '🤯🤯', '😱💀', '👀👀👀', '😳💀', '🫨🫨',
    'BRO 😳', '💀👀', '🙃🙃',
    '😳😳😳😳', '🤯🤯🤯', 'WHAT 😱', '👀💀👀', 'AYO 😳😳',
    'HUH 😳💀', '⁉️⁉️', '❓❓❓', 'excuse me WHAT 😳',
    '🫨💀🫨', '😱😱😱',
  ],

  // Traurig / Emotional (zu lustig oder traurig)
  sad: [
    '😢😢', '😭😭😭', '💔💔', '🥺🥺', '😭💔', '😿😿',
    '😭😭', '🥺💔',
    '🥀🥀🥀🥀🥀', '😭😭😭😭😭', '💔💔💔', '🥺😭🥺', 'pain 💔😭',
    '😢🥀😢', 'crying rn 😭', '💔🥀💔', '😿💔😿', '🥀😭🥀',
  ],

  // Liebe / Cute / Attraktiv
  love: [
    '🥰🥰', '❤️‍🔥❤️‍🔥', '😍😍😍', '💕💕', '🫶🫶', '❤️✨',
    '🥹🫶', '😍😍', '💗💗',
    '😍😍😍😍', '❤️‍🔥❤️‍🔥❤️‍🔥', '🫶🫶🫶', '💕💕💕', '🥰😍🥰',
    '💘💘💘', '❤️🔥❤️', '🥹💕🥹', '🫶✨🫶',
  ],

  // Zustimmung / Facts / komplett richtig
  agree: [
    '💯💯', '🫡🫡', '📠📠', 'FACTS 📠', '✅✅', '🤝🤝',
    '💯🔥', '✅💯', '💯💯💯',
    '📠📠📠', '🫡🫡🫡', 'REAL 💯', 'BIG FACTS 📠🔥', '✅✅✅',
    'BASED 🫡💯', 'true true 💯', 'THIS ☝️💯', '🤝💯🤝',
  ],

  // Ablehnung / Cringe / peinlich
  cringe: [
    '🤢🤢', '💀💀', '🤡🤡🤡', '😬💀', '🫠🫠🫠', 'CRINGE 💀',
    '💀🤡', '😬😬😬',
    '🤢🤢🤢', '🤡🤡🤡🤡', 'YIKES 😬💀', '💀💀💀💀💀', '🫣🫣',
    'ew 🤢💀', '🚩🚩🚩', '😬😬😬😬', 'ICK 🤢', '🫠💀🫠',
  ],

  // Flex / Angeben / selbstbewusst, stark
  flex: [
    '💪💪', '😤💪', '👑👑', '💰💰', '🏆🏆', '😎😎',
    '💪😤🔥', '👑💪', '😤😤💪',
    '💪💪💪💪', '👑👑👑', '😤🔥💪🔥', '🏆👑🏆', '💪🔥💪🔥',
    'FLEX 💪😤', '💰💪💰', '😎😤💪',
  ],

  // Selbstbewusst / professionell
  confident: [
    '😎🔥', '💅💅', '👑😎', '🫡😤', '💪😎', '🔥😎',
    '💅💅💅', '😎😎😎', '👑🔥👑', '🫡🔥🫡', '💅✨💅',
    '😎✨🔥', 'period 💅✨',
  ],

  // Dankbar / gesegnet / wertschätzend
  grateful: [
    '🙏✨', '🙏🙏', '🥹🙏', '✨🙏✨', '🫶🙏',
    '🙏🙏🙏', '🥹✨🙏', '🫶✨🫶', '🙏💯🙏', 'blessed 🙏✨',
  ],

  // Schüchtern / höfliche Anfrage
  shy: [
    '🥺👉👈', '👉👈🥺', '🥺🥺', '😳👉👈',
    '🥺🥺🥺', '👉👈👉👈', '😳🥺😳', 'pls 🥺👉👈',
  ],

  // Keine Lüge / wahrheitsgemäß
  nocap: [
    '🧢❌', '🚫🧢', 'no cap 🧢❌', '💯🚫🧢',
    '🧢❌🧢❌', '🚫🧢💯', 'NO CAP 🧢❌❌', 'fr fr 🚫🧢',
  ],

  // Erfolg / Geld / Geschäftserfolg
  money: [
    '💰💰💰', '🤑🤑', '💸💸', '💵💵💵', '🏦💰',
    '📈📈📈', '💰🔥', '💸💰💸',
    '💰💰💰💰💰', '🤑🤑🤑', '💸💸💸💸', '📈🔥📈', '💰📈💰',
    'STONKS 📈📈📈', '🏦💰🏦', '💵🔥💵',
  ],

  // Vereinbarung / Partnerschaft
  deal: [
    '🤝🤝', '🤝💯', '✅🤝', '🤝🔥',
    '🤝🤝🤝', '✅🤝✅', '🤝💯🤝', '🤝🔥✅',
  ],

  // Aura / Charisma / Ausstrahlung
  aura: [
    '✨✨✨', '👑✨', '😎✨', '⚡✨', '🔮✨', '✨👑✨',
    'Aura +100 ✨', '✨🫡', '😤✨',
    '✨✨✨✨✨', '⚡✨⚡', '🔮✨🔮', 'Aura +1000 ✨✨', '👑⚡👑',
    '✨😎✨😎', '🌟✨🌟', '⚡⚡⚡',
  ],

  // Cooked / Erledigt / Erschöpft
  cooked: [
    '🍳💀', '💀🍳', '😵💀', '🫠🫠', '💀💀💀', '🍳🍳',
    'cooked 🍳💀', '😵‍💫💀',
    '🍳💀🍳💀', '🫠🫠🫠🫠', '💀🍳💀🍳💀', 'COOKED 🍳💀💀',
    '😵😵💀', '🍳🍳🍳', 'well done 🍳💀',
  ],

  // Allgemein / Random (für Satzenden)
  general: [
    '💀', '😭', '🔥', '✨', '💯', '👀', '😤', '🫡', '🗿',
    'fr fr 💀', 'no cap 🔥', 'ngl 😭', 'ong 💯', 'real 🫡',
    '💀💀', '😭😭', '🔥🔥', '✨✨', '😳', '💅', '👑',
    // v6 massive Erweiterung
    '💀💀💀💀💀', '🥀🥀🥀🥀🥀', '🔥🔥🔥🔥🔥', '😭😭😭😭😭',
    '✨✨✨✨✨', '💯💯💯', '👀👀', '😤😤', '🫡🫡',
    '🗿🗿🗿', '☠️☠️☠️', '🥀💀🥀', '🔥💀🔥', '✨💀✨',
    '😳😳', '💅💅', '👑👑', '⚡⚡', '🫠', '🤡',
    '🚩🚩🚩', '💀🥀💀🥀💀', '😭🔥😭', '💯🔥💯',
    'lol 💀', 'omg 😭', 'yikes 😬', 'sheesh 😤', 'oof 🫠',
    '🪦', '🫣', '🤌', '🤌🤌', '🐐', '🐐🐐',
  ],

  // Essen
  food: [
    '🍕🍕', '😋😋', '🤤🤤', '🍔🔥', '😩🍕', '😋🔥',
    '🍕🍔🌮', '😋😋😋', '🤤🤤🤤', 'bussin 😋🔥', '🍕🔥🍕',
  ],

  // Musik
  music: [
    '🎵🎵', '🔊🔊🔊', '🎶🔥', '🎧🎧',
    '🎵🎵🎵', '🔊🔊🔊🔊', '🎶🎶🔥', '🎧🎧🎧', '🎤🔥🎤',
  ],

  // Sport / Gewinn
  win: [
    '🏆🏆🏆', 'W 🔥', '💪😤', '👑🏆', 'DUB 🔥',
    '🏆🏆🏆🏆', 'massive W 🏆🔥', '💪💪💪', 'GOATED 🐐🏆',
    '🏅🏅🏅', '👑🏆👑',
  ],

  // Tod / Verlust / Drama (NEU)
  death: [
    '💀💀💀💀💀', '🥀🥀🥀🥀🥀', '☠️☠️☠️☠️☠️', '🪦🪦🪦',
    '💀🥀💀🥀💀', 'RIP 🪦💀', '☠️💀☠️', '🥀💀🥀',
  ],

  // Red Flag / Warnung (NEU)
  warning: [
    '🚩🚩🚩', '🚩🚩🚩🚩🚩', '⚠️⚠️⚠️', '🚩💀🚩',
    '❌🚩❌', 'ICK 🚩💀', '🚩🚩🚩🚩', 'NOPE 🚩❌',
  ],

  // Chaos / Wild (NEU)
  chaos: [
    '🤯🔥💀', '😳💀🔥', '🫨🫨🫨', '💀🔥💀🔥💀',
    '🤪🤪🤪', '😵‍💫😵‍💫', 'WILD 🤯💀', '🌪️🌪️🌪️',
  ],
};

// Schlüsselwort-zu-Emoji-Kategorie Mapping (erweitert mit Glossar-Begriffen)
const EMOJI_KEYWORD_MAP = [
  { keywords: ['lach', 'lol', 'haha', 'witzig', 'lustig', 'funny', 'lmao', 'comedy', 'dead', 'goofy'], category: 'funny' },
  { keywords: ['gut', 'super', 'toll', 'geil', 'nice', 'fire', 'lit', 'krass', 'stark', 'best', 'goat',
               'slay', 'bussin', 'fly', 'gucci', 'peak', 'op', 'tuff', 'bike', 'six seven'], category: 'positive' },
  { keywords: ['schlecht', 'schlimm', 'mist', 'kacke', 'trash', 'müll', 'fail', 'toxic', 'zonk', 'hass',
               'frustrier', 'nerv', 'frustriert'], category: 'negative' },
  { keywords: ['wow', 'krass', 'alter', 'boah', 'sheesh', 'omg', 'überrasch', 'shook', 'wyld', 'wild',
               'crazy', 'mashallah'], category: 'shock' },
  { keywords: ['traurig', 'sad', 'wein', 'schluchz', 'vermiss', 'allein', 'einsam', 'depri'], category: 'sad' },
  { keywords: ['lieb', 'herz', 'cute', 'süß', 'love', 'schatz', 'bae', 'crush', 'hübsch', 'attraktiv',
               'snack', 'gyatt', 'ship', 'zaddy', 'rizz', 'habibi'], category: 'love' },
  { keywords: ['stimmt', 'richtig', 'wahr', 'genau', 'recht', 'facts', 'true', 'based', 'korrekt',
               'real', 'periodt', 'no cap'], category: 'agree' },
  { keywords: ['peinlich', 'cringe', 'awkward', 'fremdschäm', 'weird', 'komisch', 'augencringe', 'cheug'], category: 'cringe' },
  { keywords: ['flex', 'angeb', 'stolz', 'reich', 'teuer', 'luxus', 'gönnung', 'bratzen', 'drip',
               'ice', 'bling', 'sigma'], category: 'flex' },
  { keywords: ['danke', 'dankbar', 'gesegnet', 'segen', 'thx', 'wertschätz'], category: 'grateful' },
  { keywords: ['bitte', 'frag', 'könntest', 'würdest', 'schüchtern'], category: 'shy' },
  { keywords: ['ehrlich', 'schwör', 'wallah', 'wahrheit', 'lüge nicht', 'kein cap'], category: 'nocap' },
  { keywords: ['geld', 'euro', 'dollar', 'cash', 'gehalt', 'verdien', 'kost', 'preis', 'bread',
               'guap', 'stonks', 'aktie', 'einkommen', 'bag'], category: 'money' },
  { keywords: ['essen', 'food', 'hunger', 'lecker', 'kochen', 'restaurant', 'pizza', 'snack'], category: 'food' },
  { keywords: ['musik', 'song', 'lied', 'hör', 'spotify', 'beat', 'rap'], category: 'music' },
  { keywords: ['gewinn', 'sieg', 'champion', 'erst', 'best', 'gold', 'medaille', 'clutch', 'dub'], category: 'win' },
  { keywords: ['deal', 'vertrag', 'abmachung', 'vereinbar', 'partner'], category: 'deal' },
  { keywords: ['selbstbewusst', 'confident', 'stark', 'power', 'energy', 'alpha'], category: 'confident' },
  { keywords: ['aura', 'ausstrahlung', 'charisma', 'rizz', 'vibe check', 'präsenz'], category: 'aura' },
  { keywords: ['cooked', 'erledigt', 'erschöpft', 'fertig', 'am ende', 'done', 'kaputt', 'platt'], category: 'cooked' },
  // v6 neue Kategorien
  { keywords: ['tod', 'sterb', 'gestorb', 'tot', 'verlust', 'unfall', 'tragödie', 'katastroph', 'opfer', 'zerstör'], category: 'death' },
  { keywords: ['warnung', 'gefahr', 'vorsicht', 'achtung', 'red flag', 'alarm', 'risik', 'problem', 'bedroh'], category: 'warning' },
  { keywords: ['chaos', 'wild', 'verrückt', 'wahnsinn', 'irre', 'crazy', 'unglaublich', 'skandal', 'eskalier', 'ausrast'], category: 'chaos' },
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
