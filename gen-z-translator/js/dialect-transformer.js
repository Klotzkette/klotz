// Dialect-Transformer — Generisches System für deutsche Dialekte
// Jeder Dialekt wird über ein Konfig-Objekt definiert (siehe dialects.js)
// Transformationen: phonetische Regeln, Wort-Ersetzungen, Füllwörter

class DialectTransformer {
  constructor(settings, dialectConfig) {
    this.settings = settings;
    this.dialect = dialectConfig;
    this.intensity = settings.intensity || 50;
    this.originalTexts = new WeakMap();
    this._originalNodesList = [];
  }

  /**
   * Phonetische Regeln anwenden (Kernstück der Dialekt-Transformation)
   * Regeln: { pattern: RegExp, replacement: string|function, chance?: number }
   */
  applyPhonetics(text, intensity) {
    if (!this.dialect.phonetics) return text;
    let result = text;

    for (const rule of this.dialect.phonetics) {
      const chance = rule.chance || 1.0;

      result = result.replace(rule.pattern, (match, ...args) => {
        if (Math.random() > chance * (intensity / 100)) return match;
        if (typeof rule.replacement === 'function') {
          return rule.replacement(match, ...args);
        }
        // Großschreibung beibehalten
        if (match[0] === match[0].toUpperCase() && match[0] !== match[0].toLowerCase()) {
          return rule.replacement.charAt(0).toUpperCase() + rule.replacement.slice(1);
        }
        return rule.replacement;
      });
    }
    return result;
  }

  /**
   * Dialekt-Wortschatz anwenden
   */
  applyVocabulary(text, intensity) {
    if (!this.dialect.vocabulary) return text;
    let result = text;

    for (const entry of this.dialect.vocabulary) {
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
   * Dialekt-Füllwörter einfügen
   */
  insertFillers(text, intensity) {
    if (!this.settings.fillers || !this.dialect.fillers) return text;
    const fillers = this.dialect.fillers;
    const sentences = text.split(/(?<=[.!?])\s+/);

    const result = sentences.map((sentence, idx) => {
      if (sentence.length < 10) return sentence;
      let modified = sentence;

      // Satzanfang
      if (fillers.start && Math.random() < 0.25 * (intensity / 100)) {
        const filler = fillers.start[Math.floor(Math.random() * fillers.start.length)];
        modified = filler + modified.charAt(0).toLowerCase() + modified.slice(1);
      }

      // Satzende
      if (fillers.end && Math.random() < 0.2 * (intensity / 100)) {
        const filler = fillers.end[Math.floor(Math.random() * fillers.end.length)];
        const punctMatch = modified.match(/([.!?]+)$/);
        if (punctMatch) {
          modified = modified.slice(0, -punctMatch[0].length) + filler + punctMatch[0];
        }
      }

      // Einschübe zwischen Sätzen
      if (fillers.interjections && idx > 0 && Math.random() < 0.12 * (intensity / 100)) {
        const interj = fillers.interjections[Math.floor(Math.random() * fillers.interjections.length)];
        modified = interj + ' ' + modified;
      }

      return modified;
    });

    return result.join(' ');
  }

  /**
   * Alle Transformationen in Reihenfolge
   */
  transform(text) {
    if (!text || text.trim().length < 3) return text;
    const intensity = this.intensity;
    let result = text;

    result = this.applyVocabulary(result, intensity);
    result = this.applyPhonetics(result, intensity);
    result = this.insertFillers(result, intensity);

    return result;
  }

  _looksGerman(text) {
    if (text.length < 20) return true;
    const sample = text.toLowerCase().substring(0, 200);
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

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
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
    });
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
