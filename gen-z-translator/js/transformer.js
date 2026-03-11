// Text-Transformer Engine — Gen-Z / Gen Alpha
// Kontrast-Komik: Formelle Struktur trifft auf Jugendsprache.
// Der Text WEISS noch, dass er seriös sein wollte.

/**
 * Parenthetische Kommentare — Gen-Z-Chor kommentiert das Geschehen.
 */
const PARENTHETICAL_COMMENTS = {
  // Reaktionen auf sachliche/langweilige Aussagen
  neutral: [
    ' (real talk)',
    ' (okay wow)',
    ' (noted)',
    ' (wer hat das geschrieben)',
    ' (stay with me hier)',
    ' (ja gut, weiter)',
    ' (muss man erstmal sacken lassen)',
    ' (das war jetzt sehr Powerpoint-Folie-3)',
    ' (stell dir vor das steht da wirklich)',
    ' (keiner hat danach gefragt aber okay)',
  ],
  // Reaktionen auf positive Aussagen
  positive: [
    ' (und das ist auch gut so)',
    ' (W)',
    ' (king shit)',
    ' (slay)',
    ' (ate and left no crumbs)',
    ' (wir fühlen das)',
    ' (so true bestie)',
    ' (das ist der Weg)',
    ' (Ehre genommen)',
    ' (der Satz hat verstanden)',
    ' (understood the assignment)',
    ' (endlich sagt es jemand)',
  ],
  // Reaktionen auf negative/problematische Aussagen
  negative: [
    ' (uff)',
    ' (yikes)',
    ' (L)',
    ' (das ist nicht der Vibe)',
    ' (wer hat gefragt)',
    ' (pain)',
    ' (das tut weh ngl)',
    ' (bruh moment)',
    ' (red flag übrigens)',
    ' (okay DAS war unnötig)',
    ' (ich würde jetzt gerne woanders sein)',
    ' (der Vibe ist jetzt im Keller)',
  ],
  // Reaktionen auf formelle/steife Sprache — der Reza-Kern
  formal: [
    ' (so würde das ein Alman sagen)',
    ' (klingt wie mein Lehrer am Montag)',
    ' (diese Formulierung hat mich kurz shook)',
    ' (wer redet so im echten Leben)',
    ' (Alman-Energy at its finest)',
    ' (corporate speech detected 🚨)',
    ' (irgendwie cute wie ernst das klingt)',
    ' (das hat NPC-Energie und ich bin hier für)',
    ' (der Satz hat sich selbst ernst genommen)',
    ' (jemand hatte einen Duden und hat ihn auch benutzt)',
    ' (ich höre förmlich die Krawatte)',
    ' (LinkedIn-Energy)',
    ' (das klingt wie eine E-Mail die mit "Sehr geehrte" anfängt)',
    ' (der Satz läuft auf Lederschuhen)',
  ],
  // Reaktionen auf Zahlen/Statistik-Aussagen
  data: [
    ' (Mathe-Nerds aufgepasst)',
    ' (ich vertraue einfach mal)',
    ' (Zahlen sind auch nur Meinungen)',
    ' (Quelle: trust me bro)',
    ' (der Excel-Satz)',
    ' (klingt wissenschaftlich also stimmt das wohl)',
  ],
  // Meta-Kommentare über die Verwandlung selbst
  meta: [
    ' (was passiert gerade mit diesem Text)',
    ' (stell dir vor das steht da jetzt wirklich)',
    ' (es hat begonnen)',
    ' (die Verwandlung schreitet voran)',
    ' (kein Zurück mehr)',
    ' (wir sind jetzt hier)',
    ' (der Originalautor würde weinen)',
    ' (der Text hat die Kontrolle verloren und das ist okay)',
    ' (wir sind im Endgame jetzt)',
  ],
};

/**
 * Formale Konnektoren bleiben bewusst stehen — für den Kontrast
 * "Nichtsdestotrotz" neben "fr fr" ist Comedy-Gold
 */
const FORMAL_CONNECTORS_TO_KEEP = [
  'nichtsdestotrotz', 'selbstverständlich', 'dementsprechend',
  'infolgedessen', 'hinsichtlich', 'diesbezüglich', 'demzufolge',
  'gewissermaßen', 'beziehungsweise', 'gegebenenfalls',
  'dahingehend', 'grundsätzlich', 'im Wesentlichen',
];

/**
 * Hauptklasse für die Gen-Z Text-Transformation
 */
class GenZTransformer {
  constructor(settings) {
    this.settings = settings;
    this.settings.replace = true;
    this.settings.fillers = true;
    this.settings.emojis = true;
    this.intensity = 100; // Immer volle Intensität
    this.originalTexts = new WeakMap();
    this._originalNodesList = []; // Für revertAll() — WeakMap ist nicht iterierbar
    this.sortedDictionary = null; // Cache
  }

  /**
   * Sortiertes Wörterbuch (gecached)
   */
  getSortedDictionary() {
    if (!this.sortedDictionary) {
      this.sortedDictionary = [...GENZ_DICTIONARY].sort((a, b) => {
        return b.pattern.source.length - a.pattern.source.length;
      });
    }
    return this.sortedDictionary;
  }

  /**
   * Wendet Wörterbuch-Ersetzungen auf einen Text an.
   */
  applyDictionary(text, intensity) {
    if (!this.settings.replace) return text;

    let result = text;
    const sorted = this.getSortedDictionary();

    for (const entry of sorted) {
      // Bei voller Intensität: nur 10% Skip-Chance (statt vorher bis zu 50%)
      if (Math.random() > 0.9) continue;

      const replacements = entry.replacements;
      const replacement = replacements[Math.floor(Math.random() * replacements.length)];

      // Grammar-aware Ersetzung: Endungen erkennen und übertragen
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
   * Erkennt ob ein Satz "formal" klingt (für Reza-Kontrast-Komik)
   */
  isFormalSentence(sentence) {
    const lower = sentence.toLowerCase();
    // Formale Marker
    const formalMarkers = [
      'darüber hinaus', 'in anbetracht', 'im rahmen', 'zudem',
      'ferner', 'hinsichtlich', 'bezüglich', 'dementsprechend',
      'grundsätzlich', 'selbstverständlich', 'nichtsdestotrotz',
      'im wesentlichen', 'diesbezüglich', 'infolgedessen',
      'gegebenenfalls', 'unter berücksichtigung', 'maßgeblich',
      'von erheblicher bedeutung', 'in diesem zusammenhang',
      'gemäß', 'seitens', 'zwecks', 'betreffend',
    ];
    return formalMarkers.some(m => lower.includes(m));
  }

  /**
   * Bestimmt die Stimmung eines Satzes für kontextuelle Kommentare
   */
  getSentimentCategory(sentence) {
    const lower = sentence.toLowerCase();
    const posWords = ['gut', 'schön', 'freude', 'erfolg', 'gewinn', 'positiv', 'wundervoll',
                      'hervorragend', 'gelungen', 'vorteil', 'fortschritt', 'wachstum',
                      'besser', 'optimal', 'übertroffen', 'gesteigert', 'gewachsen'];
    const negWords = ['schlecht', 'problem', 'schwierig', 'verlust', 'risiko', 'gefahr',
                      'negativ', 'fehler', 'mangel', 'krise', 'rückgang', 'nachteil',
                      'leider', 'bedauerlicherweise', 'verschlechtert', 'gescheitert'];

    if (this.isFormalSentence(sentence)) return 'formal';
    // Zahlen/Prozente/Statistiken erkennen
    if (/\d+[.,]?\d*\s*(%|Prozent|Euro|Milliarden|Millionen|Mio|Mrd)/i.test(sentence)) return 'data';
    if (posWords.some(w => lower.includes(w))) return 'positive';
    if (negWords.some(w => lower.includes(w))) return 'negative';
    return 'neutral';
  }

  /**
   * Wählt einen passenden parenthetischen Kommentar
   */
  getParentheticalComment(sentence) {
    const category = this.getSentimentCategory(sentence);

    // Formale Sätze kriegen häufiger Kommentare — DER Kontrast
    const chance = category === 'formal' ? 0.55 : 0.35;
    if (Math.random() > chance) return '';

    // Bei formalen Sätzen: bevorzuge die "formal"-Kommentare
    if (category === 'formal' && Math.random() < 0.7) {
      const pool = PARENTHETICAL_COMMENTS.formal;
      return pool[Math.floor(Math.random() * pool.length)];
    }

    // Gelegentlich Meta-Kommentare
    if (Math.random() < 0.1) {
      const pool = PARENTHETICAL_COMMENTS.meta;
      return pool[Math.floor(Math.random() * pool.length)];
    }

    const pool = PARENTHETICAL_COMMENTS[category] || PARENTHETICAL_COMMENTS.neutral;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /**
   * Fügt Füllwörter ein.
   */
  insertFillers(text, intensity) {
    if (!this.settings.fillers) return text;

    const sentences = text.split(/(?<=[.!?])\s+/);

    const result = sentences.map((sentence, idx) => {
      if (sentence.length < 10) return sentence;

      let modified = sentence;

      // Satzanfang
      if (shouldInsertFiller(intensity * 0.7)) {
        const filler = getRandomFiller('start', intensity);
        modified = filler + modified.charAt(0).toLowerCase() + modified.slice(1);
      }

      // Satzende
      if (shouldInsertFiller(intensity * 0.5)) {
        const filler = getRandomFiller('end', intensity);
        const punctMatch = modified.match(/([.!?]+)$/);
        if (punctMatch) {
          modified = modified.slice(0, -punctMatch[0].length) + filler + punctMatch[0];
        }
      }

      // Einschübe zwischen Sätzen
      if (idx > 0 && Math.random() < 0.15 * (intensity / 100)) {
        modified = getRandomInterjection() + ' ' + modified;
      }

      return modified;
    });

    return result.join(' ');
  }

  /**
   * Fügt parenthetische Kommentare ein.
   * Der Text wird kommentiert, als säße ein Gen-Z-Publikum im Theater.
   */
  insertCommentary(text) {
    if (!this.settings.fillers) return text;

    // Teile in Sätze und kommentiere selektiv
    const sentences = text.split(/(?<=[.!?])\s+/);
    const commented = sentences.map(sentence => {
      if (sentence.length < 20) return sentence;

      const comment = this.getParentheticalComment(sentence);
      if (!comment) return sentence;

      // Kommentar VOR dem Satzzeichen einfügen
      const punctMatch = sentence.match(/([.!?]+)$/);
      if (punctMatch) {
        return sentence.slice(0, -punctMatch[0].length) + comment + punctMatch[0];
      }
      return sentence + comment;
    });

    return commented.join(' ');
  }

  /**
   * Fügt kontextuelle Emojis ein.
   */
  insertEmojis(text, intensity) {
    if (!this.settings.emojis) return text;

    return text.replace(/([.!?]+)(\s|$)/g, (match, punct, space, matchIndex) => {
      if (Math.random() * 100 > intensity) return match;

      const contextStart = Math.max(0, matchIndex - 50);
      const beforePunct = text.substring(contextStart, matchIndex);

      const emoji = getContextualEmoji(beforePunct);
      return punct + ' ' + emoji + (space || ' ');
    });
  }

  /**
   * Formal-Slang-Juxtaposition: Der Kern der Kontrast-Komik.
   * Hält bewusst formelle Wörter und stellt sie neben Slang.
   * "Nichtsdestotrotz, digga" — DIESER Moment.
   */
  insertJuxtapositions(text) {
    let result = text;
    const chance = 0.5; // Aggressiv: 50% Chance bei formalen Konnektoren

    // Formale Konnektoren bewusst stehen lassen und Slang-Suffix anhängen
    const juxtapositions = [
      { find: /\bnichtsdestotrotz\b/gi, suffix: [', digga,', ', real talk,', ' – und ich meine das fr –'] },
      { find: /\bselbstverständlich\b/gi, suffix: [' – also safe', ' (safe)', ', no cap,'] },
      { find: /\bdementsprechend\b/gi, suffix: [', also basically,', ', you know,', ' – und damit mein ich –'] },
      { find: /\bdarüber hinaus\b/gi, suffix: [' – und das ist noch nicht alles, bro –', ', plus,', ' (wait es kommt noch mehr)'] },
      { find: /\bin Anbetracht\b/gi, suffix: [', ngl,', ', wenn man das mal real betrachtet,'] },
      { find: /\bim Rahmen\b/gi, suffix: [' (oder wie auch immer man das nennt)', ' – whatever das heißt –'] },
      { find: /\bhinsichtlich\b/gi, suffix: [', also in Sachen', ' – bezogen auf, you know,'] },
      { find: /\bferner\b/gi, suffix: [', und btw,', ', außerdem, no cap,', ', plus, on top,'] },
      { find: /\bzudem\b/gi, suffix: [', plus,', ', und halt auch,', ' – apropos –'] },
      { find: /\bGemäß\b/g, suffix: [' – laut', ' – also laut'] },
      { find: /\bjedoch\b/gi, suffix: [', aber halt,', ', tho,', ' – plot twist –'] },
      { find: /\bdennoch\b/gi, suffix: [', trotzdem tho,', ', but still,'] },
      { find: /\bsomit\b/gi, suffix: [', also basically,', ', ergo, wenn man so will,'] },
      { find: /\binsbesondere\b/gi, suffix: [', vor allem halt,', ', speziell,'] },
      { find: /\bdes Weiteren\b/gi, suffix: [' – und es geht weiter –', ', also,'] },
      { find: /\bim Übrigen\b/gi, suffix: [' – btw –', ', fun fact,'] },
      { find: /\bgleichwohl\b/gi, suffix: [', trotzdem,', ', but hear me out,'] },
      { find: /\bfolglich\b/gi, suffix: [', also logisch,', ', makes sense,'] },
      { find: /\bindes\b/gi, suffix: [', meanwhile,', ', aber so,'] },
    ];

    for (const jux of juxtapositions) {
      if (Math.random() > chance) continue;
      const suffixChoice = jux.suffix[Math.floor(Math.random() * jux.suffix.length)];
      result = result.replace(jux.find, (match) => match + suffixChoice);
    }

    return result;
  }

  /**
   * Wendet alle Transformationen in der richtigen Reihenfolge an.
   */
  transform(text) {
    if (!text || text.trim().length < 3) return text;

    const intensity = this.intensity;
    let result = text;

    result = this.insertJuxtapositions(result);
    result = this.applyDictionary(result, intensity);
    result = this.insertFillers(result, intensity);
    result = this.insertCommentary(result);
    result = this.insertEmojis(result, intensity);

    return result;
  }

  /**
   * Schneller Sprach-Check: ist der Text wahrscheinlich Deutsch?
   * Prüft auf typische deutsche Wörter um englische/fremdsprachige Texte zu skippen.
   */
  _looksGerman(text) {
    if (text.length < 20) return true; // Zu kurz zum Erkennen → transformieren
    const lower = text.toLowerCase();
    const germanMarkers = /\b(und|der|die|das|ist|ein|eine|von|mit|für|auf|den|dem|des|sich|nicht|auch|werden|wird|sind|hat|bei|nach|nur|wie|noch|oder|aber|wenn|über|kann|mehr|schon|seit|dass|diese|einem|andere|alle|aus|zum|zur|vor|dann|hier|sein|durch|als|bis|sehr|dort|wir|sie|ihr)\b/;
    // Mindestens 2 deutsche Marker in den ersten 200 Zeichen
    const sample = lower.substring(0, 200);
    const matches = sample.match(new RegExp(germanMarkers.source, 'g'));
    return matches && matches.length >= 2;
  }

  /**
   * Durchläuft den DOM und transformiert alle Text-Nodes.
   */
  transformDOM(rootElement) {
    const root = rootElement || document.body;
    const textNodes = this._collectTextNodes(root);

    for (const textNode of textNodes) {
      const original = textNode.textContent;

      // Sprach-Check: nur deutsche Texte transformieren
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

  /**
   * Sammelt alle transformierbaren Text-Nodes
   */
  _collectTextNodes(root) {
    const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'TEXTAREA', 'INPUT', 'CODE', 'PRE', 'SVG']);

    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;

          if (SKIP_TAGS.has(parent.tagName)) {
            return NodeFilter.FILTER_REJECT;
          }

          if (parent.dataset && parent.dataset.genzTransformed) {
            return NodeFilter.FILTER_REJECT;
          }

          if (node.textContent.trim().length < 3) {
            return NodeFilter.FILTER_REJECT;
          }

          // Günstiger als getComputedStyle: offsetParent ist null für hidden/display:none
          // (Ausnahme: body/fixed, die wir aber nie skippen wollen)
          if (!parent.offsetParent && parent !== document.body && parent.tagName !== 'BODY') {
            // Doppel-Check für position:fixed Elemente
            if (parent.style && parent.style.display === 'none') {
              return NodeFilter.FILTER_REJECT;
            }
          }

          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const nodes = [];
    let node;
    while (node = walker.nextNode()) {
      nodes.push(node);
    }
    return nodes;
  }

  /**
   * Macht alle Transformationen rückgängig
   */
  revertAll() {
    for (const node of this._originalNodesList) {
      try {
        const original = this.originalTexts.get(node);
        if (original !== undefined) {
          node.textContent = original;
          if (node.parentElement) {
            delete node.parentElement.dataset.genzTransformed;
          }
        }
      } catch (e) {
        // Node wurde möglicherweise aus dem DOM entfernt
      }
    }
    this.originalTexts = new WeakMap();
    this._originalNodesList = [];
  }
}
