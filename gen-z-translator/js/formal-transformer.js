// Bildungssprache-Transformer
// Elaborierte Vokabeln, Rechtslatein, parenthetische Kommentare der Bildungselite.
// Kanzleisprache trifft Habilitationsschrift. Quod erat demonstrandum.

class FormalTransformer {
  constructor(settings) {
    this.settings = settings;
    this.settings.replace = true;
    this.settings.fillers = true;
    this.intensity = 100; // Immer volle Intensität
    this.originalTexts = new WeakMap();
    this._originalNodesList = [];
    this.sortedDictionary = null;
  }

  getSortedDictionary() {
    if (!this.sortedDictionary) {
      this.sortedDictionary = [...FORMAL_DICTIONARY].sort((a, b) => {
        return b.pattern.source.length - a.pattern.source.length;
      });
    }
    return this.sortedDictionary;
  }

  /**
   * Wörterbuch-Ersetzungen
   */
  applyDictionary(text, intensity) {
    if (!this.settings.replace) return text;

    let result = text;
    const sorted = this.getSortedDictionary();

    for (const entry of sorted) {
      if (Math.random() * 100 > intensity) continue;

      const replacements = entry.replacements;
      const replacement = replacements[Math.floor(Math.random() * replacements.length)];

      if (entry.type && typeof GermanGrammar !== 'undefined') {
        result = GermanGrammar.replaceWithGrammar(result, entry, replacement);
      } else {
        result = result.replace(entry.pattern, (match) => {
          if (match[0] === match[0].toUpperCase() && match[0] !== match[0].toLowerCase()) {
            return replacement.charAt(0).toUpperCase() + replacement.slice(1);
          }
          return replacement;
        });
      }
    }

    return result;
  }

  /**
   * Fügt formale Füllwörter ein
   */
  insertFillers(text, intensity) {
    if (!this.settings.fillers) return text;

    const sentences = text.split(/(?<=[.!?])\s+/);

    const result = sentences.map((sentence, idx) => {
      if (sentence.length < 10) return sentence;
      let modified = sentence;

      // Satzanfang
      if (shouldInsertFormalFiller(intensity * 0.6)) {
        const filler = getRandomFormalFiller('start', intensity);
        modified = filler + modified.charAt(0).toLowerCase() + modified.slice(1);
      }

      // Mitte-Einschübe
      if (shouldInsertFormalFiller(intensity * 0.4)) {
        const filler = getRandomFormalFiller('mid', intensity);
        const commaIdx = modified.indexOf(',');
        if (commaIdx > 5 && commaIdx < modified.length - 5) {
          modified = modified.slice(0, commaIdx + 1) + filler + modified.slice(commaIdx + 2);
        }
      }

      // Satzende
      if (shouldInsertFormalFiller(intensity * 0.5)) {
        const filler = getRandomFormalFiller('end', intensity);
        const punctMatch = modified.match(/([.!?]+)$/);
        if (punctMatch) {
          modified = modified.slice(0, -punctMatch[0].length) + filler + punctMatch[0];
        }
      }

      // Rechtslatein-Einschübe zwischen Sätzen
      if (idx > 0 && Math.random() < 0.12 * (intensity / 100)) {
        modified = getRandomFormalInterjection() + ' ' + modified;
      }

      return modified;
    });

    return result.join(' ');
  }

  /**
   * Parenthetische Kommentare — der arrogante Bildungsbürger
   */
  insertCommentary(text) {
    if (!this.settings.fillers) return text;

    const sentences = text.split(/(?<=[.!?])\s+/);
    const commented = sentences.map(sentence => {
      if (sentence.length < 20) return sentence;

      const category = this.getCommentCategory(sentence);
      const chance = 0.4; // Aggressiver kommentieren
      if (Math.random() > chance) return sentence;

      // Bei informalen Sätzen häufiger kommentieren (der Kontrast!)
      if (category === 'informal' && Math.random() < 0.5) {
        const pool = FORMAL_PARENTHETICAL.informal;
        const comment = pool[Math.floor(Math.random() * pool.length)];
        const punctMatch = sentence.match(/([.!?]+)$/);
        if (punctMatch) {
          return sentence.slice(0, -punctMatch[0].length) + comment + punctMatch[0];
        }
        return sentence + comment;
      }

      // Gelegentlich Meta-Kommentare
      if (Math.random() < 0.1) {
        const pool = FORMAL_PARENTHETICAL.meta;
        const comment = pool[Math.floor(Math.random() * pool.length)];
        const punctMatch = sentence.match(/([.!?]+)$/);
        if (punctMatch) {
          return sentence.slice(0, -punctMatch[0].length) + comment + punctMatch[0];
        }
      }

      const pool = FORMAL_PARENTHETICAL[category] || FORMAL_PARENTHETICAL.neutral;
      const comment = pool[Math.floor(Math.random() * pool.length)];
      const punctMatch = sentence.match(/([.!?]+)$/);
      if (punctMatch) {
        return sentence.slice(0, -punctMatch[0].length) + comment + punctMatch[0];
      }
      return sentence + comment;
    });

    return commented.join(' ');
  }

  /**
   * Bestimmt die Kommentar-Kategorie
   */
  getCommentCategory(sentence) {
    const lower = sentence.toLowerCase();
    if (isInformalSentence(sentence)) return 'informal';
    const posWords = ['gut', 'schön', 'freude', 'erfolg', 'gelungen', 'hervorragend', 'vorzüglich'];
    const negWords = ['schlecht', 'problem', 'schwierig', 'fehler', 'mangel', 'leider'];
    if (posWords.some(w => lower.includes(w))) return 'positive';
    if (negWords.some(w => lower.includes(w))) return 'negative';
    return 'neutral';
  }

  /**
   * Informal-Formal-Juxtaposition: Bewusst umgangssprachliche Wörter
   * stehen lassen und mit einem formalen Kommentar versehen.
   */
  insertJuxtapositions(text) {
    let result = text;
    const chance = 0.45;

    const juxtapositions = [
      { find: /\bcool\b/gi, formal: ['– wenn ich es einmal so umgangssprachlich formulieren darf –', ', um es salopp auszudrücken,'] },
      { find: /\becht\b/gi, formal: [', im wahrsten Sinne des Wortes,', ' – wahrhaftig –'] },
      { find: /\bkrass\b/gi, formal: [' (man verzeihe die Wortwahl)', ', wenn man es so nennen möchte,'] },
      { find: /\bHammer\b/gi, formal: [', bildlich gesprochen,', ' – metaphorisch gesprochen –'] },
      { find: /\bDing\b/g, formal: [', wenn man es so bezeichnen möchte,', ' – sit venia verbo –'] },
      { find: /\bStuff\b/gi, formal: [', um es einmal auf Neudeutsch zu sagen,'] },
      { find: /\bokay\b/gi, formal: [', wenn ich diesen Anglizismus gebrauchen darf,'] },
    ];

    for (const jux of juxtapositions) {
      if (Math.random() > chance) continue;
      const formalChoice = jux.formal[Math.floor(Math.random() * jux.formal.length)];
      result = result.replace(jux.find, (match) => match + formalChoice);
    }

    return result;
  }

  /**
   * Transformation in korrekter Reihenfolge
   */
  transform(text) {
    if (!text || text.trim().length < 3) return text;

    const intensity = this.intensity;
    let result = text;

    result = this.insertJuxtapositions(result);
    result = this.applyDictionary(result, intensity);
    result = this.insertFillers(result, intensity);
    result = this.insertCommentary(result);

    return result;
  }

  _looksGerman(text) {
    if (text.length < 20) return true;
    const lower = text.toLowerCase();
    const sample = lower.substring(0, 200);
    const matches = sample.match(/\b(und|der|die|das|ist|ein|eine|von|mit|für|auf|den|dem|des|sich|nicht|auch|werden|wird|sind|hat|bei|nach|nur|wie|noch|oder|aber|wenn|über|kann|mehr|schon|seit|dass)\b/g);
    return matches && matches.length >= 2;
  }

  transformDOM(rootElement) {
    const root = rootElement || document.body;
    const textNodes = this._collectTextNodes(root);

    for (const textNode of textNodes) {
      const original = textNode.textContent;
      if (original.length > 30 && !this._looksGerman(original)) continue;
      const transformed = this.transform(original);

      if (transformed !== original) {
        this.originalTexts.set(textNode, original);
        this._originalNodesList.push(textNode);
        textNode.textContent = transformed;
        if (textNode.parentElement) {
          textNode.parentElement.dataset.genzTransformed = 'true';
        }
      }
    }

    return textNodes.length;
  }

  _collectTextNodes(root) {
    const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'TEXTAREA', 'INPUT', 'CODE', 'PRE', 'SVG']);

    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          if (SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
          if (parent.dataset && parent.dataset.genzTransformed) return NodeFilter.FILTER_REJECT;
          if (node.textContent.trim().length < 3) return NodeFilter.FILTER_REJECT;
          if (!parent.offsetParent && parent !== document.body && parent.tagName !== 'BODY') {
            if (parent.style && parent.style.display === 'none') return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const nodes = [];
    let node;
    while (node = walker.nextNode()) nodes.push(node);
    return nodes;
  }

  revertAll() {
    for (const node of this._originalNodesList) {
      try {
        const original = this.originalTexts.get(node);
        if (original !== undefined) {
          node.textContent = original;
          if (node.parentElement) delete node.parentElement.dataset.genzTransformed;
        }
      } catch (e) {}
    }
    this.originalTexts = new WeakMap();
    this._originalNodesList = [];
  }
}
