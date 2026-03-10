// Text-Transformer Engine
// Verarbeitet Text-Nodes im DOM und wendet alle Transformationen an

/**
 * Hauptklasse für die Text-Transformation
 */
class GenZTransformer {
  constructor(settings) {
    this.settings = settings;
    this.intensity = settings.intensity || 50;
    this.originalTexts = new Map(); // Speichert Originaltexte für Rückgängig
  }

  /**
   * Wendet Wörterbuch-Ersetzungen auf einen Text an
   */
  applyDictionary(text) {
    if (!this.settings.replace) return text;

    let result = text;
    // Sortiere nach Länge des Patterns (längere zuerst), damit spezifischere Matches Vorrang haben
    const sorted = [...GENZ_DICTIONARY].sort((a, b) => {
      return b.pattern.source.length - a.pattern.source.length;
    });

    for (const entry of sorted) {
      // Intensitätsbasierte Chance ob ersetzt wird
      if (Math.random() * 100 > this.intensity) continue;

      const replacement = entry.replacements[Math.floor(Math.random() * entry.replacements.length)];

      result = result.replace(entry.pattern, (match) => {
        // Großschreibung beibehalten wenn Original groß war
        if (match[0] === match[0].toUpperCase() && match[0] !== match[0].toLowerCase()) {
          return replacement.charAt(0).toUpperCase() + replacement.slice(1);
        }
        return replacement;
      });
    }

    return result;
  }

  /**
   * Fügt Füllwörter in einen Satz ein
   */
  insertFillers(text) {
    if (!this.settings.fillers) return text;

    // Teile in Sätze auf
    const sentences = text.split(/(?<=[.!?])\s+/);
    const result = sentences.map(sentence => {
      if (sentence.length < 10) return sentence; // Zu kurze Sätze überspringen

      let modified = sentence;

      // Füllwort am Anfang
      if (shouldInsertFiller(this.intensity)) {
        const filler = getRandomFiller('start', this.intensity);
        // Ersten Buchstaben des Originalsatzes klein machen wenn Füllwort davor
        if (modified.length > 0) {
          modified = filler + modified.charAt(0).toLowerCase() + modified.slice(1);
        }
      }

      // Füllwort am Ende (vor dem Satzzeichen)
      if (shouldInsertFiller(this.intensity)) {
        const filler = getRandomFiller('end', this.intensity);
        const punctMatch = modified.match(/([.!?]+)$/);
        if (punctMatch) {
          modified = modified.slice(0, -punctMatch[0].length) + filler + punctMatch[0];
        } else {
          modified = modified + filler;
        }
      }

      return modified;
    });

    return result.join(' ');
  }

  /**
   * Fügt Emoji-Ketten nach Sätzen ein
   */
  insertEmojis(text) {
    if (!this.settings.emojis) return text;

    // Nach Satzzeichen Emojis einfügen
    return text.replace(/([.!?]+)(\s|$)/g, (match, punct, space) => {
      if (Math.random() * 100 > this.intensity) return match;

      // Kontext aus dem vorhergehenden Text extrahieren
      const beforePunct = text.substring(
        Math.max(0, text.indexOf(match) - 50),
        text.indexOf(match)
      );

      const emoji = getContextualEmoji(beforePunct);
      return punct + ' ' + emoji + (space || ' ');
    });
  }

  /**
   * Wendet alle Transformationen auf einen Text an
   */
  transform(text) {
    if (!text || text.trim().length < 3) return text;

    let result = text;

    // 1. Wörterbuch-Ersetzungen
    result = this.applyDictionary(result);

    // 2. Füllwörter einfügen
    result = this.insertFillers(result);

    // 3. Emoji-Ketten einfügen
    result = this.insertEmojis(result);

    return result;
  }

  /**
   * Durchläuft den DOM und transformiert alle Text-Nodes
   */
  transformDOM(rootElement) {
    const walker = document.createTreeWalker(
      rootElement || document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // Überspringe Script, Style, und andere nicht-sichtbare Elemente
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;

          const tag = parent.tagName;
          if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'TEXTAREA', 'INPUT', 'CODE', 'PRE', 'SVG'].includes(tag)) {
            return NodeFilter.FILTER_REJECT;
          }

          // Überspringe bereits transformierte Nodes
          if (parent.dataset && parent.dataset.genzTransformed) {
            return NodeFilter.FILTER_REJECT;
          }

          // Nur Nodes mit sichtbarem Text
          if (node.textContent.trim().length < 3) {
            return NodeFilter.FILTER_REJECT;
          }

          // Überspringe versteckte Elemente
          const style = window.getComputedStyle(parent);
          if (style.display === 'none' || style.visibility === 'hidden') {
            return NodeFilter.FILTER_REJECT;
          }

          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }

    // Transformiere die gesammelten Text-Nodes
    for (const textNode of textNodes) {
      const original = textNode.textContent;
      const transformed = this.transform(original);

      if (transformed !== original) {
        // Speichere Original für Rückgängig-Funktion
        this.originalTexts.set(textNode, original);
        textNode.textContent = transformed;

        // Markiere Parent als transformiert
        if (textNode.parentElement) {
          textNode.parentElement.dataset.genzTransformed = 'true';
        }
      }
    }

    return textNodes.length;
  }

  /**
   * Macht alle Transformationen rückgängig
   */
  revertAll() {
    for (const [node, original] of this.originalTexts) {
      try {
        node.textContent = original;
        if (node.parentElement) {
          delete node.parentElement.dataset.genzTransformed;
        }
      } catch (e) {
        // Node wurde möglicherweise aus dem DOM entfernt
      }
    }
    this.originalTexts.clear();
  }
}
