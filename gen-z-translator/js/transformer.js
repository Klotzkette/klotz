// Text-Transformer Engine — Yasmina-Reza-Methode
// Die Verwandlung geschieht nicht plump, sondern wie in einem Reza-Stück:
// Akt I:   Fast noch normal. Ein "halt" hier, ein "lowkey" da. Man merkt kaum etwas.
// Akt II:  Die Fassade bröckelt. Slang mischt sich ins Hochdeutsche. Parenthetische
//          Kommentare erscheinen, als würde jemand den Text von der Seite kommentieren.
// Akt III: Kontrollverlust. Emojis, Brainrot, die Sprache kippt endgültig.
//
// Der Witz entsteht — wie bei Reza — durch den KONTRAST: formelle Struktur trifft
// auf Jugendsprache. Der Text WEISS noch, dass er seriös sein wollte.

/**
 * Parenthetische Kommentare im Reza-Stil.
 * Als würde ein Gen-Z-Chor das Geschehen kommentieren.
 */
const PARENTHETICAL_COMMENTS = {
  // Reaktionen auf sachliche/langweilige Aussagen
  neutral: [
    ' (real talk)',
    ' (spannend, weiter)',
    ' (okay wow)',
    ' (noted)',
    ' (aha)',
    ' (wer hat das geschrieben)',
    ' (stay with me hier)',
    ' (ja gut)',
  ],
  // Reaktionen auf positive Aussagen
  positive: [
    ' (und das ist auch gut so)',
    ' (W)',
    ' (king shit)',
    ' (slay)',
    ' (ate)',
    ' (wir fühlen das)',
    ' (so true bestie)',
    ' (das ist der Weg)',
    ' (Ehre)',
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
    ' (red flag)',
  ],
  // Reaktionen auf formelle/steife Sprache — der Reza-Kern
  formal: [
    ' (so würde das ein Alman sagen)',
    ' (sehr förmlich, Respekt)',
    ' (klingt wie mein Lehrer)',
    ' (okay Boomer)',
    ' (diese Formulierung hat mich kurz shook)',
    ' (wer redet so)',
    ' (Alman-Energy)',
    ' (corporate speech detected)',
    ' (irgendwie cute wie ernst das klingt)',
    ' (das hat NPC-Energie)',
    ' (der Satz hat sich selbst ernst genommen)',
    ' (jemand hatte einen Duden)',
  ],
  // Meta-Kommentare über die Verwandlung selbst
  meta: [
    ' (was passiert gerade mit diesem Text)',
    ' (der Text weiß noch nicht was ihm bevorsteht)',
    ' (es hat begonnen)',
    ' (die Verwandlung schreitet voran)',
    ' (kein Zurück mehr)',
    ' (wir sind jetzt hier)',
    ' (der Originalautor würde weinen)',
  ],
};

/**
 * Formale Konnektoren die im Akt I stehen bleiben — bewusst, für den Kontrast
 * "Nichtsdestotrotz" neben "fr fr" ist Comedy-Gold
 */
const FORMAL_CONNECTORS_TO_KEEP = [
  'nichtsdestotrotz', 'selbstverständlich', 'dementsprechend',
  'infolgedessen', 'hinsichtlich', 'diesbezüglich', 'demzufolge',
  'gewissermaßen', 'beziehungsweise', 'gegebenenfalls',
  'dahingehend', 'grundsätzlich', 'im Wesentlichen',
];

/**
 * Hauptklasse für die Text-Transformation — Reza-Methode
 */
class GenZTransformer {
  constructor(settings) {
    this.settings = settings;
    this.baseIntensity = settings.intensity || 50;
    this.originalTexts = new WeakMap();
    this._originalNodesList = []; // Für revertAll() — WeakMap ist nicht iterierbar
    this.nodeCount = 0;       // Zählt verarbeitete Nodes
    this.totalNodes = 0;      // Gesamtzahl der Nodes (für Eskalationsberechnung)
    this.sortedDictionary = null; // Cache
  }

  /**
   * Berechnet die effektive Intensität basierend auf Position im Dokument.
   * Akt I (0-30%):   baseIntensity * 0.3  — fast noch normal
   * Akt II (30-70%): baseIntensity * 0.7  — die Fassade bröckelt
   * Akt III (70%+):  baseIntensity * 1.2  — Kontrollverlust (max 100)
   */
  getEscalatedIntensity() {
    if (this.totalNodes === 0) return this.baseIntensity;

    const progress = this.nodeCount / this.totalNodes; // 0.0 bis 1.0

    let multiplier;
    if (progress < 0.3) {
      // Akt I — Exposition: fast noch zivilisiert
      multiplier = 0.3 + (progress / 0.3) * 0.3; // 0.3 → 0.6
    } else if (progress < 0.7) {
      // Akt II — Konfrontation: die Fassade bröckelt
      const aktProgress = (progress - 0.3) / 0.4;
      multiplier = 0.6 + aktProgress * 0.4; // 0.6 → 1.0
    } else {
      // Akt III — Auflösung: Kontrollverlust
      const aktProgress = (progress - 0.7) / 0.3;
      multiplier = 1.0 + aktProgress * 0.3; // 1.0 → 1.3
    }

    return Math.min(100, Math.round(this.baseIntensity * multiplier));
  }

  /**
   * Bestimmt den aktuellen Akt (1, 2 oder 3)
   */
  getCurrentAkt() {
    if (this.totalNodes === 0) return 2;
    const progress = this.nodeCount / this.totalNodes;
    if (progress < 0.3) return 1;
    if (progress < 0.7) return 2;
    return 3;
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
   * Im Akt I: nur wenige, subtile Ersetzungen.
   * Im Akt III: aggressiv.
   */
  applyDictionary(text, intensity) {
    if (!this.settings.replace) return text;

    let result = text;
    const sorted = this.getSortedDictionary();
    const akt = this.getCurrentAkt();

    for (const entry of sorted) {
      // Intensitätsbasierte Chance — im Akt I sehr zurückhaltend
      if (Math.random() * 100 > intensity) continue;

      const replacements = entry.replacements;
      let replacement;

      if (akt === 1) {
        // Akt I: Bevorzuge subtilere Ersetzungen (ohne Emojis, kürzere)
        const subtle = replacements.filter(r => !r.match(/[\u{1F000}-\u{1FFFF}]/u) && r.length < 15);
        replacement = subtle.length > 0
          ? subtle[Math.floor(Math.random() * subtle.length)]
          : replacements[0]; // Fallback: erstes (meist das subtilste)
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
                      'hervorragend', 'gelungen', 'vorteil', 'fortschritt', 'wachstum'];
    const negWords = ['schlecht', 'problem', 'schwierig', 'verlust', 'risiko', 'gefahr',
                      'negativ', 'fehler', 'mangel', 'krise', 'rückgang', 'nachteil'];

    if (this.isFormalSentence(sentence)) return 'formal';
    if (posWords.some(w => lower.includes(w))) return 'positive';
    if (negWords.some(w => lower.includes(w))) return 'negative';
    return 'neutral';
  }

  /**
   * Wählt einen passenden parenthetischen Kommentar
   */
  getParentheticalComment(sentence) {
    const akt = this.getCurrentAkt();
    const category = this.getSentimentCategory(sentence);

    // Im Akt I: fast keine Kommentare
    if (akt === 1) return '';

    // Im Akt II: gelegentlich, vor allem bei formalen Sätzen (DAS ist der Reza-Moment)
    if (akt === 2) {
      // Formale Sätze kriegen häufiger Kommentare — DER Kontrast
      const chance = category === 'formal' ? 0.4 : 0.12;
      if (Math.random() > chance) return '';

      // Bei formalen Sätzen: bevorzuge die "formal"-Kommentare
      if (category === 'formal' && Math.random() < 0.7) {
        const pool = PARENTHETICAL_COMMENTS.formal;
        return pool[Math.floor(Math.random() * pool.length)];
      }
    }

    // Im Akt III: häufiger, wilder, auch Meta-Kommentare
    if (akt === 3) {
      if (Math.random() > 0.35) return '';

      // Meta-Kommentare nur im Akt III
      if (Math.random() < 0.15) {
        const pool = PARENTHETICAL_COMMENTS.meta;
        return pool[Math.floor(Math.random() * pool.length)];
      }
    }

    const pool = PARENTHETICAL_COMMENTS[category] || PARENTHETICAL_COMMENTS.neutral;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /**
   * Fügt Füllwörter ein — mit Reza-Timing.
   * Akt I: Nur ein dezentes "halt" oder "irgendwie" — der Leser stutzt kurz.
   * Akt II: Füllwörter werden dreister, Satzanfänge werden gekapert.
   * Akt III: Jeder zweite Satz beginnt mit "Digga," oder "Bruh,"
   */
  insertFillers(text, intensity) {
    if (!this.settings.fillers) return text;

    const akt = this.getCurrentAkt();
    const sentences = text.split(/(?<=[.!?])\s+/);

    const result = sentences.map((sentence, idx) => {
      if (sentence.length < 10) return sentence;

      let modified = sentence;

      // === AKT I: Nur Mitte-Füllwörter, sehr dezent ===
      if (akt === 1) {
        if (Math.random() < (intensity / 100) * 0.2) {
          // Nur die subtilsten Mitte-Füllwörter
          const subtleMid = [' halt ', ' irgendwie ', ' oder so ', ' so '];
          const filler = subtleMid[Math.floor(Math.random() * subtleMid.length)];
          // Füge nach dem ersten Komma oder nach ~40% des Satzes ein
          const commaIdx = modified.indexOf(',');
          if (commaIdx > 5 && commaIdx < modified.length - 5) {
            modified = modified.slice(0, commaIdx + 1) + filler + modified.slice(commaIdx + 2);
          }
        }
        return modified;
      }

      // === AKT II: Anfang oder Ende, aber noch mit Manieren ===
      if (akt === 2) {
        // Satzanfang (moderater)
        if (shouldInsertFiller(intensity * 0.6)) {
          const filler = getRandomFiller('start', intensity);
          modified = filler + modified.charAt(0).toLowerCase() + modified.slice(1);
        }

        // Satzende
        if (shouldInsertFiller(intensity * 0.4)) {
          const filler = getRandomFiller('end', intensity);
          const punctMatch = modified.match(/([.!?]+)$/);
          if (punctMatch) {
            modified = modified.slice(0, -punctMatch[0].length) + filler + punctMatch[0];
          }
        }

        return modified;
      }

      // === AKT III: Volle Breitseite ===
      // Satzanfang — aggressiv
      if (shouldInsertFiller(intensity)) {
        const filler = getRandomFiller('start', intensity);
        modified = filler + modified.charAt(0).toLowerCase() + modified.slice(1);
      }

      // Satzende — aggressiv
      if (shouldInsertFiller(intensity * 0.8)) {
        const filler = getRandomFiller('end', intensity);
        const punctMatch = modified.match(/([.!?]+)$/);
        if (punctMatch) {
          modified = modified.slice(0, -punctMatch[0].length) + filler + punctMatch[0];
        } else {
          modified = modified + filler;
        }
      }

      // Einschübe zwischen Sätzen
      if (idx > 0 && Math.random() < 0.25) {
        modified = getRandomInterjection() + ' ' + modified;
      }

      return modified;
    });

    return result.join(' ');
  }

  /**
   * Fügt parenthetische Kommentare ein — das Herzstück der Reza-Methode.
   * Der Text wird kommentiert, als säße ein Gen-Z-Publikum im Theater.
   */
  insertCommentary(text) {
    if (!this.settings.fillers) return text; // Kommentare laufen über den Filler-Toggle
    const akt = this.getCurrentAkt();
    if (akt === 1) return text; // Im Akt I: Stille. Noch.

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
   * Fügt Emoji-Ketten ein.
   * Akt I: Keine Emojis. (Die Stille vor dem Sturm.)
   * Akt II: Vereinzelt, kontextuell passend.
   * Akt III: Emoji-Ketten nach fast jedem Satz.
   */
  insertEmojis(text, intensity) {
    if (!this.settings.emojis) return text;
    const akt = this.getCurrentAkt();

    // Akt I: Keine Emojis. Der Text wahrt noch die Fassung.
    if (akt === 1) return text;

    // Emoji-Häufigkeit nach Akt
    const emojiChance = akt === 2 ? intensity * 0.5 : intensity * 1.2;

    return text.replace(/([.!?]+)(\s|$)/g, (match, punct, space, matchIndex) => {
      if (Math.random() * 100 > emojiChance) return match;

      const contextStart = Math.max(0, matchIndex - 50);
      const beforePunct = text.substring(contextStart, matchIndex);

      const emoji = getContextualEmoji(beforePunct);

      // Akt II: Nur einzelne Emojis (dezent)
      if (akt === 2) {
        // Erstes Emoji extrahieren (Unicode-sicher mit Segmenter oder Split)
        const segments = typeof Intl !== 'undefined' && Intl.Segmenter
          ? [...new Intl.Segmenter('de', { granularity: 'grapheme' }).segment(emoji)].map(s => s.segment)
          : [...emoji];
        const firstEmoji = segments[0] || emoji.charAt(0);
        return punct + ' ' + firstEmoji + (space || ' ');
      }

      // Akt III: Volle Ketten
      return punct + ' ' + emoji + (space || ' ');
    });
  }

  /**
   * Formal-Slang-Juxtaposition: Der Kern der Reza-Komik.
   * Hält bewusst formelle Wörter und stellt sie neben Slang.
   * "Nichtsdestotrotz, digga" — DIESER Moment.
   */
  insertJuxtapositions(text) {
    const akt = this.getCurrentAkt();
    // Nur ab Akt II
    if (akt === 1) return text;

    let result = text;
    const chance = akt === 2 ? 0.15 : 0.35;

    // Formale Konnektoren bewusst stehen lassen und Slang-Suffix anhängen
    const juxtapositions = [
      { find: /\bnichtsdestotrotz\b/gi, suffix: [', digga,', ', wenn man so will,', ', real talk,'] },
      { find: /\bselbstverständlich\b/gi, suffix: [' – also safe', ' (safe)', ', obviously,'] },
      { find: /\bdementsprechend\b/gi, suffix: [', also basically,', ', you know,'] },
      { find: /\bdarüber hinaus\b/gi, suffix: [' – und das ist noch nicht alles, bro –', ', plus,'] },
      { find: /\bin Anbetracht\b/gi, suffix: [', ngl,', ', wenn man das mal real betrachtet,'] },
      { find: /\bim Rahmen\b/gi, suffix: [' (oder wie auch immer man das nennt)'] },
      { find: /\bhinsichtlich\b/gi, suffix: [', also bezogen auf', ', in Sachen'] },
      { find: /\bferner\b/gi, suffix: [', und btw,', ', außerdem, no cap,'] },
      { find: /\bzudem\b/gi, suffix: [', plus,', ', und halt auch,'] },
      { find: /\bGemäß\b/g, suffix: [' – laut', ' – also laut'] },
      { find: /\bjedoch\b/gi, suffix: [', aber halt,', ', tho,'] },
      { find: /\bdennoch\b/gi, suffix: [', trotzdem tho,', ', but still,'] },
      { find: /\bsomit\b/gi, suffix: [', also basically,'] },
      { find: /\binsbesondere\b/gi, suffix: [', vor allem halt,', ', speziell,'] },
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
   * Die Reihenfolge IST die Dramaturgie:
   * 1. Juxtapositionen (formales bleibt, kriegt aber Slang-Nachbarn)
   * 2. Wörterbuch (Wörter werden ersetzt)
   * 3. Füllwörter (Slang-Einschübe)
   * 4. Kommentare (das Gen-Z-Publikum meldet sich)
   * 5. Emojis (der finale visuelle Zusammenbruch)
   */
  transform(text) {
    if (!text || text.trim().length < 3) return text;

    const intensity = this.getEscalatedIntensity();
    let result = text;

    // 1. Juxtapositionen — Kontrast-Komik aufbauen
    result = this.insertJuxtapositions(result);

    // 2. Wörterbuch-Ersetzungen
    result = this.applyDictionary(result, intensity);

    // 3. Füllwörter
    result = this.insertFillers(result, intensity);

    // 4. Parenthetische Kommentare
    result = this.insertCommentary(result);

    // 5. Emojis
    result = this.insertEmojis(result, intensity);

    return result;
  }

  /**
   * Durchläuft den DOM und transformiert alle Text-Nodes.
   * ZWEI Durchläufe: Erst zählen (für Eskalationsberechnung), dann transformieren.
   */
  transformDOM(rootElement) {
    const root = rootElement || document.body;

    // Erster Durchlauf: Nodes sammeln
    const textNodes = this._collectTextNodes(root);
    this.totalNodes = textNodes.length;
    this.nodeCount = 0;

    // Zweiter Durchlauf: Transformieren mit Eskalation
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
