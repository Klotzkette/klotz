// Extra-Modi: Adjektivkiller, Kleinschreibung, Vokalentferner
// Plus: Shared helper functions für einfache Transformer

// ==========================================================================
// ADJEKTIVKILLER — Streicht alle Adjektive zuverlässig
// ==========================================================================

// Umfangreiche Liste häufiger deutscher Adjektive
const COMMON_ADJECTIVES = [
  'gut', 'schlecht', 'schön', 'hübsch', 'groß', 'klein', 'alt', 'neu', 'jung',
  'lang', 'kurz', 'schnell', 'langsam', 'hoch', 'tief', 'breit', 'schmal',
  'dick', 'dünn', 'schwer', 'leicht', 'hell', 'dunkel', 'warm', 'kalt', 'heiß',
  'nass', 'trocken', 'laut', 'leise', 'stark', 'schwach', 'hart', 'weich',
  'voll', 'leer', 'reich', 'arm', 'teuer', 'billig', 'einfach', 'schwierig',
  'wichtig', 'richtig', 'falsch', 'wahr', 'möglich', 'nötig', 'fertig', 'bereit',
  'frei', 'offen', 'geschlossen', 'sicher', 'klar', 'deutlich', 'genau',
  'toll', 'super', 'wunderbar', 'großartig', 'fantastisch', 'perfekt',
  'schrecklich', 'furchtbar', 'schlimm', 'böse', 'gemein', 'nett', 'lieb', 'freundlich',
  'lustig', 'witzig', 'traurig', 'glücklich', 'zufrieden', 'stolz', 'mutig',
  'dumm', 'klug', 'intelligent', 'interessant', 'langweilig', 'spannend',
  'peinlich', 'komisch', 'seltsam', 'merkwürdig', 'verrückt', 'normal',
  'besonder', 'verschieden', 'gleich', 'ander', 'einzig', 'gesamt', 'ganz',
  'erst', 'letzt', 'nächst', 'vorig', 'früh', 'spät',
  'rot', 'blau', 'grün', 'gelb', 'weiß', 'schwarz', 'braun', 'grau',
  'rund', 'eckig', 'flach', 'glatt', 'rau', 'spitz', 'stumpf',
  'frisch', 'modern', 'klassisch', 'typisch', 'echt', 'wirklich',
  'politisch', 'wirtschaftlich', 'sozial', 'öffentlich', 'privat',
  'europäisch', 'deutsch', 'international', 'national', 'digital',
  'riesig', 'winzig', 'enorm', 'gewaltig', 'mächtig', 'dringend',
  'aktuell', 'ehemalig', 'künftig', 'bisherig', 'damalig', 'jetzig',
  'scharf', 'mild', 'süß', 'sauer', 'bitter', 'salzig',
  'faul', 'fleißig', 'brav', 'frech', 'still', 'ruhig', 'wild',
  'müde', 'wach', 'gesund', 'krank', 'fit', 'schlank',
  'dicht', 'locker', 'eng', 'weit', 'nah', 'fern', 'fremd',
  'einzeln', 'gemeinsam', 'gegenseitig', 'ähnlich', 'unterschiedlich',
];

// Adjektiv-Suffixe die auch unbekannte Adjektive erkennen
const ADJ_SUFFIX_PATTERNS = /\b[a-zäöüß]+(ig|lich|isch|sam|bar|haft|los|voll|reich|arm|mäßig|artig|förmig|wertig)(e[mnrs]?|er|es)?\b/gi;

class AdjektivkillerTransformer {
  constructor(settings) {
    this.settings = settings;
    this.originalTexts = new Map();
    this._buildPatterns();
  }

  _buildPatterns() {
    // Alle bekannten Adjektive + optionale Flexionsendungen
    const endings = '(?:e[mnrs]?|er|es)?';
    this.knownAdjPattern = new RegExp(
      '\\b(' + COMMON_ADJECTIVES.join('|') + ')' + endings + '\\b',
      'gi'
    );
  }

  transform(text) {
    if (!text || text.trim().length < 3) return text;
    let result = text;

    // Bekannte Adjektive entfernen — sehr aggressiv
    result = result.replace(this.knownAdjPattern, (match) => {
      // Großgeschriebene am Satzanfang: Check ob es ein Nomen sein könnte
      // Adjektive am Satzanfang sind aber auch großgeschrieben → entfernen
      return '';
    });

    // Unbekannte Adjektive via Suffix-Muster erkennen und entfernen
    result = result.replace(ADJ_SUFFIX_PATTERNS, (match) => {
      // Nicht entfernen wenn es ein Substantiv sein könnte (Großbuchstabe + nicht am Satzanfang)
      if (match[0] === match[0].toUpperCase()) return match;
      return '';
    });

    // Bereinigung: doppelte Leerzeichen, Leerzeichen vor Komma/Punkt
    result = result.replace(/  +/g, ' ').replace(/ ([,.:;])/g, '$1').replace(/^ /gm, '');

    return result;
  }

  transformDOM(root) { return _sharedTransformDOM(this, root); }
  _collectTextNodes(root) { return _sharedCollectTextNodes(root); }
  revertAll() { _sharedRevert(this); }
}

// ==========================================================================
// KLEINSCHREIBUNG — alles klein
// ==========================================================================
class KleinschreibungTransformer {
  constructor(settings) { this.settings = settings; this.originalTexts = new Map(); }

  transform(text) {
    if (!text || text.trim().length < 3) return text;
    return text.toLowerCase();
  }

  transformDOM(root) { return _sharedTransformDOM(this, root); }
  _collectTextNodes(root) { return _sharedCollectTextNodes(root); }
  revertAll() { _sharedRevert(this); }
}

// ==========================================================================
// VOKALENTFERNER — Alle Vokale (a, e, i, o, u, ä, ö, ü) entfernen
// ==========================================================================
class VokalentfernerTransformer {
  constructor(settings) {
    this.settings = settings;
    this.originalTexts = new Map();
  }

  transform(text) {
    if (!text || text.trim().length < 3) return text;

    // Wortweise: Vokale entfernen
    return text.replace(/\b[A-Za-zÄÖÜäöüß]+\b/g, (word) => {
      if (word.length < 2) return word;
      const stripped = word.replace(/[aeiouäöüAEIOUÄÖÜ]/g, '');
      // Wenn alles Vokale waren (z.B. "au"), mindestens ersten Buchstaben behalten
      return stripped.length > 0 ? stripped : word[0];
    });
  }

  transformDOM(root) { return _sharedTransformDOM(this, root); }
  _collectTextNodes(root) { return _sharedCollectTextNodes(root); }
  revertAll() { _sharedRevert(this); }
}

// ==========================================================================
// Shared helper functions (DRY für einfache Transformer)
// ==========================================================================
const _SHARED_SKIP_TAGS = new Set(['SCRIPT','STYLE','NOSCRIPT','IFRAME','TEXTAREA','INPUT','CODE','PRE','SVG']);

function _sharedCollectTextNodes(root) {
  const w = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => {
      const p = n.parentElement; if (!p) return NodeFilter.FILTER_REJECT;
      if (_SHARED_SKIP_TAGS.has(p.tagName)) return NodeFilter.FILTER_REJECT;
      if (p.dataset && p.dataset.genzTransformed) return NodeFilter.FILTER_REJECT;
      if (n.textContent.trim().length < 3) return NodeFilter.FILTER_REJECT;
      if (!p.offsetParent && p !== document.body && p.tagName !== 'BODY') {
        if (p.style && p.style.display === 'none') return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const nodes = []; let node; while (node = w.nextNode()) nodes.push(node);
  return nodes;
}

function _sharedTransformDOM(transformer, rootElement) {
  const root = rootElement || document.body;
  const textNodes = _sharedCollectTextNodes(root);
  for (const n of textNodes) {
    const orig = n.textContent;
    const t = transformer.transform(orig);
    if (t !== orig) {
      transformer.originalTexts.set(n, orig);
      n.textContent = t;
      if (n.parentElement) n.parentElement.dataset.genzTransformed = 'true';
    }
  }
  return textNodes.length;
}

function _sharedRevert(transformer) {
  for (const [n, o] of transformer.originalTexts) {
    try { n.textContent = o; if (n.parentElement) delete n.parentElement.dataset.genzTransformed; } catch(e) {}
  }
  transformer.originalTexts.clear();
}
