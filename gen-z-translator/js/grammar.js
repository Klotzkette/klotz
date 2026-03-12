// German Grammar Module for Text-Transformer
// Handles inflection-aware word replacement:
// - Adjective endings (-e, -en, -em, -er, -es) werden erkannt und übertragen
// - Nomen-Endungen (-s, -n, -en, -er, -e) werden erkannt und übertragen
// - Englische/Slang-Wörter werden NICHT flektiert
// - Artikel-Anpassung bei Genuswechsel

const GermanGrammar = {

  ADJ_ENDINGS: ['en', 'em', 'er', 'es', 'e'],
  NOUN_ENDINGS: ['en', 'ern', 'ens', 'er', 'es', 'em', 'e', 'n', 's'],

  // Artikel-Tabelle als Konstante (nicht bei jedem Aufruf neu erzeugen)
  ARTICLES: {
    'der': { m: 'der', f: 'die', n: 'das' },
    'die': { m: 'der', f: 'die', n: 'das' },
    'das': { m: 'der', f: 'die', n: 'das' },
    'den': { m: 'den', f: 'die', n: 'das' },
    'dem': { m: 'dem', f: 'der', n: 'dem' },
    'des': { m: 'des', f: 'der', n: 'des' },
    'ein':   { m: 'ein',   f: 'eine',  n: 'ein' },
    'eine':  { m: 'ein',   f: 'eine',  n: 'ein' },
    'einem': { m: 'einem', f: 'einer', n: 'einem' },
    'einen': { m: 'einen', f: 'eine',  n: 'ein' },
    'einer': { m: 'eines', f: 'einer', n: 'eines' },
    'eines': { m: 'eines', f: 'einer', n: 'eines' },
    'kein':   { m: 'kein',   f: 'keine',  n: 'kein' },
    'keine':  { m: 'kein',   f: 'keine',  n: 'kein' },
    'keinem': { m: 'keinem', f: 'keiner', n: 'keinem' },
    'keinen': { m: 'keinen', f: 'keine',  n: 'kein' },
  },

  // Cache für erweiterte Patterns (vermeidet ständiges Regex-Neukompilieren)
  _patternCache: new Map(),

  // Wörter die KEINE deutschen Endungen bekommen
  UNINFLECTABLE: new Set([
    // English adjectives/slang
    'lit', 'fire', 'nice', 'cool', 'mid', 'sus', 'cringe', 'trash', 'wild',
    'valid', 'fly', 'fresh', 'huge', 'massive', 'easy', 'chill', 'based',
    'shook', 'salty', 'toxic', 'edgy', 'extra', 'basic', 'funny', 'cute',
    'bold', 'dead', 'fake', 'real', 'soft', 'hot', 'big', 'low', 'high',
    'top', 'hard', 'slow', 'boring', 'wrong', 'viral', 'hyped', 'clean',
    'dope', 'wack', 'lame', 'thicc', 'goated', 'blessed', 'cursed',
    // English/slang nouns
    'bro', 'bestie', 'homie', 'dude', 'boy', 'girl', 'girlie',
    'king', 'queen', 'bae', 'babo', 'squad', 'fam', 'gang',
    'drip', 'fit', 'vibe', 'hype', 'tea', 'cash', 'bag',
    'grind', 'hustle', 'crib', 'ride', 'whip', 'flex', 'diss',
    'fix', 'move', 'win', 'fail', 'flop', 'scam', 'beef', 'drama',
    'issue', 'struggle', 'content', 'reel', 'mood', 'energy',
    'look', 'take', 'facts', 'cap', 'npc', 'goat', 'simp',
    'snack', 'vlog', 'meme', 'stan', 'clout', 'slay',
    // Formal replacements that are already phrases
    'causa', 'remedur', 'divertissement',
  ]),

  /**
   * Erweitert ein Regex-Pattern um optionale Flexionsendungen.
   * \bgut\b → \bgut(en|em|er|es|e)?\b
   */
  extendPattern(pattern, type) {
    // Cache-Lookup: vermeidet Regex-Neukompilierung pro Textknoten
    const cacheKey = pattern.source + '|' + pattern.flags + '|' + type;
    if (this._patternCache.has(cacheKey)) return this._patternCache.get(cacheKey);

    const src = pattern.source;
    const flags = pattern.flags;

    if (!src.endsWith('\\b')) {
      const result = { regex: pattern, extended: false };
      this._patternCache.set(cacheKey, result);
      return result;
    }

    const endings = type === 'adj' ? this.ADJ_ENDINGS : this.NOUN_ENDINGS;
    const base = src.slice(0, -2); // Remove trailing \b
    const group = '(' + endings.join('|') + ')?';
    const result = {
      regex: new RegExp(base + group + '\\b', flags),
      extended: true
    };
    this._patternCache.set(cacheKey, result);
    return result;
  },

  /**
   * Prüft ob ein Wort nicht flektiert werden soll
   */
  isUninflectable(word) {
    const clean = word.replace(/[\s\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}\u{1F900}-\u{1FA9F}\u{1FA00}-\u{1FAFF}]+$/u, '').trim();
    if (this.UNINFLECTABLE.has(clean.toLowerCase())) return true;
    if (/^[A-Z]{2,}$/.test(clean)) return true; // Akronyme: OMG, NPC
    if (clean.includes(' ')) return true; // Mehrwort-Ausdrücke
    if (clean.includes('-') && /[a-z]/.test(clean)) return true; // Bindestrich-Komposita wie "lowkey-mäßig"
    // Typisch englische Suffixe
    if (/(?:ing|tion|ly|ous|ive|ful|less|ness|ment|able)$/i.test(clean)) return true;
    return false;
  },

  /**
   * Wendet eine deutsche Flexionsendung auf ein Ersetzungswort an.
   * "trefflich" + "en" → "trefflichen"
   * "lit" + "en" → "lit" (uninflectable)
   */
  applyEnding(replacement, ending, type) {
    if (!ending) return replacement;

    // Emoji-Suffix abtrennen und nachher wieder anhängen
    const emojiMatch = replacement.match(/([\s]*[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}\u{1F900}-\u{1FA9F}\u{1FA00}-\u{1FAFF}].*)$/u);
    const word = emojiMatch ? replacement.slice(0, replacement.length - emojiMatch[0].length) : replacement;
    const emoji = emojiMatch ? emojiMatch[0] : '';

    if (this.isUninflectable(word)) return replacement;

    const inflected = this._addSuffix(word, ending, type);
    return inflected + emoji;
  },

  /**
   * Morphologische Regeln für Suffix-Anfügung
   */
  _addSuffix(word, suffix, type) {
    // Adjektive auf -el: "edel" + "e" → "edle" (Vokalausfall)
    if (type === 'adj' && word.endsWith('el') && suffix.startsWith('e')) {
      return word.slice(0, -2) + 'l' + suffix;
    }
    // Adjektive auf -er mit Vokalausfall: "teuer" → "teure"
    if (type === 'adj' && /[aeiouäöü]er$/i.test(word) && suffix.startsWith('e')) {
      return word.slice(0, -2) + 'r' + suffix;
    }
    // Adjektive auf -en: "trocken" → "trockne"
    if (type === 'adj' && /[^e]en$/i.test(word) && suffix.startsWith('e')) {
      return word.slice(0, -2) + 'n' + suffix;
    }
    // Adjektive auf -e: "leise" + "n" → "leisen" (kein doppeltes e)
    if (word.endsWith('e') && suffix.startsWith('e')) {
      return word + suffix.slice(1);
    }
    // Nomen auf -e + n: "Straße" + "n" → "Straßen"
    if (type === 'noun' && word.endsWith('e') && suffix === 'n') {
      return word + 'n';
    }
    // Nomen auf -er + n: "Lehrer" + "n" → "Lehrern"
    if (type === 'noun' && word.endsWith('er') && suffix === 'n') {
      return word + 'n';
    }
    // Nomen: Wort endet auf Konsonant + "s": "Erfolg" + "s" → "Erfolgs"
    if (type === 'noun' && suffix === 's' && /[bcdfgklmnpqrstvwxz]$/.test(word)) {
      return word + 's';
    }
    return word + suffix;
  },

  /**
   * Artikel-Anpassung bei Genuswechsel.
   * Sucht vor der Ersetzungsposition nach einem Artikel und passt ihn an.
   * Gibt den modifizierten Text zurück.
   */
  adjustArticle(textBefore, fromGender, toGender) {
    if (!fromGender || !toGender || fromGender === toGender) return textBefore;

    // Suche nach dem letzten Artikel in den letzten 30 Zeichen
    const match = textBefore.match(/\b(der|die|das|den|dem|des|eine[mnrs]?|keine?[mnrs]?)\s+$/i);
    if (!match) return textBefore;

    const originalArticle = match[1];
    const mapping = this.ARTICLES[originalArticle.toLowerCase()];
    if (!mapping) return textBefore;

    let newArticle = mapping[toGender];
    if (!newArticle || newArticle === originalArticle.toLowerCase()) return textBefore;

    // Großschreibung beibehalten
    if (originalArticle[0] === originalArticle[0].toUpperCase()) {
      newArticle = newArticle.charAt(0).toUpperCase() + newArticle.slice(1);
    }

    const pos = textBefore.lastIndexOf(originalArticle);
    return textBefore.substring(0, pos) + newArticle + textBefore.substring(pos + originalArticle.length);
  },

  /**
   * Grammar-aware replacement for applyDictionary.
   * Erweitert den Match um Flexionsendungen und überträgt sie auf die Ersetzung.
   */
  replaceWithGrammar(text, entry, replacement) {
    if (!entry.type) {
      // Kein Typ → Standard-Ersetzung wie bisher
      return text.replace(entry.pattern, (match) => {
        return this._preserveCase(match, replacement);
      });
    }

    // Erweiterte Pattern mit Endungs-Capture
    const { regex, extended } = this.extendPattern(entry.pattern, entry.type);

    return text.replace(regex, (match, capturedEnding) => {
      const ending = extended ? (capturedEnding || '') : '';
      let result = replacement;

      // Endung auf Ersetzung anwenden
      if (ending) {
        result = this.applyEnding(replacement, ending, entry.type);
      }

      // Großschreibung beibehalten
      result = this._preserveCase(match, result);

      return result;
    });
  },

  /**
   * Großschreibung vom Original auf die Ersetzung übertragen
   */
  _preserveCase(original, replacement) {
    // ALL-CAPS: "SEHR" → "LIT"
    if (original.length > 1 && original === original.toUpperCase() && original !== original.toLowerCase()) {
      return replacement.toUpperCase();
    }
    // Title case: "Sehr" → "Lit"
    if (original[0] === original[0].toUpperCase() && original[0] !== original[0].toLowerCase()) {
      return replacement.charAt(0).toUpperCase() + replacement.slice(1);
    }
    return replacement;
  }
};
