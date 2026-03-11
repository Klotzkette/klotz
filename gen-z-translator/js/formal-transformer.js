// Bildungssprache-Transformer — Reza-Methode (umgekehrt)
// Statt von oben nach unten: von unten nach oben.
// Akt I:   Der Text bekommt dezent elaboriertere Vokabeln. Ein "überaus" statt "sehr".
// Akt II:  Rechtslatein mischt sich ein. Parenthetische Kommentare der Bildungselite.
//          "Nun, (wie der Kenner weiß)" — der arrogante Jurist übernimmt.
// Akt III: Vollständige Kanzleisprache. Jeder Satz klingt wie eine Bundestagsrede
//          gekreuzt mit einer Habilitationsschrift. Quod erat demonstrandum.

/**
 * Bildungssprache-Transformer
 * Gleiche Drei-Akt-Struktur wie der Gen-Z-Transformer
 */
class FormalTransformer {
  constructor(settings) {
    this.settings = settings;
    this.baseIntensity = settings.intensity || 50;
    this.originalTexts = new WeakMap();
    this._originalNodesList = [];
    this.nodeCount = 0;
    this.totalNodes = 0;
    this.sortedDictionary = null;
  }

  getEscalatedIntensity() {
    if (this.totalNodes === 0) return this.baseIntensity;
    const progress = this.nodeCount / this.totalNodes;

    let multiplier;
    if (progress < 0.3) {
      multiplier = 0.3 + (progress / 0.3) * 0.3;
    } else if (progress < 0.7) {
      const aktProgress = (progress - 0.3) / 0.4;
      multiplier = 0.6 + aktProgress * 0.4;
    } else {
      const aktProgress = (progress - 0.7) / 0.3;
      multiplier = 1.0 + aktProgress * 0.3;
    }

    return Math.min(100, Math.round(this.baseIntensity * multiplier));
  }

  getCurrentAkt() {
    if (this.totalNodes === 0) return 2;
    const progress = this.nodeCount / this.totalNodes;
    if (progress < 0.3) return 1;
    if (progress < 0.7) return 2;
    return 3;
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
   * Akt I: Nur subtile Aufwertungen (kürzere Ersetzungen bevorzugt)
   * Akt III: Volle Kanzleisprache
   */
  applyDictionary(text, intensity) {
    if (!this.settings.replace) return text;

    let result = text;
    const sorted = this.getSortedDictionary();
    const akt = this.getCurrentAkt();

    for (const entry of sorted) {
      if (Math.random() * 100 > intensity) continue;

      const replacements = entry.replacements;
      let replacement;

      if (akt === 1) {
        // Akt I: Bevorzuge die kürzeren, subtileren Varianten
        const subtle = replacements.filter(r => r.length < 20);
        replacement = subtle.length > 0
          ? subtle[Math.floor(Math.random() * subtle.length)]
          : replacements[0];
      } else if (akt === 3) {
        // Akt III: Bevorzuge die längste, elaborierteste Variante
        replacement = replacements.reduce((a, b) => b.length > a.length ? b : a);
      } else {
        replacement = replacements[Math.floor(Math.random() * replacements.length)];
      }

      // Grammar-aware Ersetzung: Endungen erkennen und übertragen
      if (entry.type && typeof GermanGrammar !== 'undefined') {
        result = GermanGrammar.replaceWithGrammar(result, entry, replacement, akt);
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

    const akt = this.getCurrentAkt();
    const sentences = text.split(/(?<=[.!?])\s+/);

    const result = sentences.map((sentence, idx) => {
      if (sentence.length < 10) return sentence;
      let modified = sentence;

      // === AKT I: Nur gelegentlich ein "wohlgemerkt" oder "versteht sich" ===
      if (akt === 1) {
        if (Math.random() < (intensity / 100) * 0.15) {
          const subtleEnd = [', versteht sich', ', wohlgemerkt', ', ohne Frage'];
          const filler = subtleEnd[Math.floor(Math.random() * subtleEnd.length)];
          const punctMatch = modified.match(/([.!?]+)$/);
          if (punctMatch) {
            modified = modified.slice(0, -punctMatch[0].length) + filler + punctMatch[0];
          }
        }
        return modified;
      }

      // === AKT II: Anfangs- und Ende-Füllwörter ===
      if (akt === 2) {
        if (shouldInsertFormalFiller(intensity * 0.5)) {
          const filler = getRandomFormalFiller('start', intensity);
          modified = filler + modified.charAt(0).toLowerCase() + modified.slice(1);
        }

        if (shouldInsertFormalFiller(intensity * 0.4)) {
          const filler = getRandomFormalFiller('end', intensity);
          const punctMatch = modified.match(/([.!?]+)$/);
          if (punctMatch) {
            modified = modified.slice(0, -punctMatch[0].length) + filler + punctMatch[0];
          }
        }

        return modified;
      }

      // === AKT III: Volle Kanzlei ===
      if (shouldInsertFormalFiller(intensity)) {
        const filler = getRandomFormalFiller('start', intensity);
        modified = filler + modified.charAt(0).toLowerCase() + modified.slice(1);
      }

      // Mitte-Einschübe
      if (shouldInsertFormalFiller(intensity * 0.5)) {
        const filler = getRandomFormalFiller('mid', intensity);
        const commaIdx = modified.indexOf(',');
        if (commaIdx > 5 && commaIdx < modified.length - 5) {
          modified = modified.slice(0, commaIdx + 1) + filler + modified.slice(commaIdx + 2);
        }
      }

      if (shouldInsertFormalFiller(intensity * 0.7)) {
        const filler = getRandomFormalFiller('end', intensity);
        const punctMatch = modified.match(/([.!?]+)$/);
        if (punctMatch) {
          modified = modified.slice(0, -punctMatch[0].length) + filler + punctMatch[0];
        }
      }

      // Rechtslatein-Einschübe zwischen Sätzen
      if (idx > 0 && Math.random() < 0.2) {
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
    const akt = this.getCurrentAkt();
    if (akt === 1) return text;

    const sentences = text.split(/(?<=[.!?])\s+/);
    const commented = sentences.map(sentence => {
      if (sentence.length < 20) return sentence;

      const category = this.getCommentCategory(sentence);
      const chance = akt === 2 ? 0.15 : 0.3;
      if (Math.random() > chance) return sentence;

      // Im Akt II bei informalen Sätzen häufiger kommentieren (der Kontrast!)
      if (akt === 2 && category === 'informal' && Math.random() < 0.5) {
        const pool = FORMAL_PARENTHETICAL.informal;
        const comment = pool[Math.floor(Math.random() * pool.length)];
        const punctMatch = sentence.match(/([.!?]+)$/);
        if (punctMatch) {
          return sentence.slice(0, -punctMatch[0].length) + comment + punctMatch[0];
        }
        return sentence + comment;
      }

      // Meta-Kommentare nur im Akt III
      if (akt === 3 && Math.random() < 0.1) {
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
   * "cool (oder wie man in gebildeten Kreisen sagt: formidabel)"
   */
  insertJuxtapositions(text) {
    const akt = this.getCurrentAkt();
    if (akt === 1) return text;

    let result = text;
    const chance = akt === 2 ? 0.12 : 0.25;

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

    const intensity = this.getEscalatedIntensity();
    let result = text;

    result = this.insertJuxtapositions(result);
    result = this.applyDictionary(result, intensity);
    result = this.insertFillers(result, intensity);
    result = this.insertCommentary(result);

    return result;
  }

  transformDOM(rootElement) {
    const root = rootElement || document.body;
    const textNodes = this._collectTextNodes(root);
    this.totalNodes = textNodes.length;
    this.nodeCount = 0;

    for (const textNode of textNodes) {
      const original = textNode.textContent;
      const transformed = this.transform(original);

      if (transformed !== original) {
        this.originalTexts.set(textNode, original);
        this._originalNodesList.push(textNode);
        textNode.textContent = transformed;
        if (textNode.parentElement) {
          textNode.parentElement.dataset.genzTransformed = 'true';
        }
      }
      this.nodeCount++;
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
