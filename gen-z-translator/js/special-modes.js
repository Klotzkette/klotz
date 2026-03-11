// Spezial-Modi: Politiker-Sprech, Adjektivkiller, Barock-Deutsch, Gender-Modi,
// Emoji-Sprinkler, Kleinschreibung, 80er-West-Slang
// Jeder Modus ist ein eigenständiger Transformer mit transformDOM/revertAll

const _SM_SKIP_TAGS = new Set(['SCRIPT','STYLE','NOSCRIPT','IFRAME','TEXTAREA','INPUT','CODE','PRE','SVG']);

// ==========================================================================
// POLITIKER-BLASEN-SPRECH
// ==========================================================================
const POLITIKER_FILLERS = {
  start: [
    'Lassen Sie mich eines ganz klar sagen: ',
    'Ich sage Ihnen ganz offen: ',
    'Die Fakten sind eindeutig: ',
    'Was wir jetzt brauchen, ist: ',
    'Ganz klar ist: ',
    'Da muss man differenziert betrachten: ',
    'Im Kern geht es um Folgendes: ',
    'Wir dürfen nicht vergessen: ',
    'Die Menschen in diesem Land erwarten: ',
    'Da bin ich ganz bei Ihnen: ',
    'Wir müssen ehrlich miteinander sein: ',
    'Die Antwort ist doch ganz einfach: ',
    'Ich will das mal ganz deutlich sagen: ',
    'Man muss das im Kontext sehen: ',
  ],
  mid: [
    ', und das sage ich ganz bewusst, ',
    ', das ist ganz wichtig, ',
    ', und zwar nachhaltig, ',
    ', wenn ich das so sagen darf, ',
    ', und da sind wir uns einig, ',
    ', um es klar zu formulieren, ',
    ', das gehört zur Wahrheit dazu, ',
    ', und das ist kein Widerspruch, ',
  ],
  end: [
    '. Das sind wir den Menschen schuldig',
    '. Da müssen wir ran',
    '. Das ist alternativlos',
    '. Punkt',
    '. Da beißt die Maus keinen Faden ab',
    '. Das sage ich hier in aller Deutlichkeit',
    '. Da gibt es nichts zu beschönigen',
    '. Da müssen alle an einem Strang ziehen',
    '. Da stehen wir in der Verantwortung',
  ],
  replacements: [
    { pattern: /\bProblem\b/gi, replacements: ['Herausforderung', 'Aufgabe'], type: 'noun' },
    { pattern: /\bProbleme\b/gi, replacements: ['Herausforderungen', 'Aufgaben'], type: 'noun' },
    { pattern: /\bKrise\b/gi, replacements: ['Herausforderung', 'Transformation'], type: 'noun' },
    { pattern: /\bSparen\b/gi, replacements: ['Haushaltskonsolidierung'] },
    { pattern: /\bKürzung\b/gi, replacements: ['Anpassungsmaßnahme', 'Effizienzsteigerung'], type: 'noun' },
    { pattern: /\bSteuer\b/gi, replacements: ['Abgabe', 'Solidarbeitrag'], type: 'noun' },
    { pattern: /\bSchuld\b/gi, replacements: ['Investition in die Zukunft'], type: 'noun' },
    { pattern: /\bFehler\b/gi, replacements: ['Optimierungspotenzial', 'Lernmoment'], type: 'noun' },
    { pattern: /\bschlecht\b/gi, replacements: ['verbesserungswürdig', 'ausbaufähig', 'suboptimal'], type: 'adj' },
    { pattern: /\bgut\b/gi, replacements: ['zukunftsfähig', 'nachhaltig', 'tragfähig'], type: 'adj' },
    { pattern: /\bteuer\b/gi, replacements: ['investitionsintensiv', 'kostenrelevant'], type: 'adj' },
    { pattern: /\bbillig\b/gi, replacements: ['wirtschaftlich', 'haushaltsneutral'], type: 'adj' },
    { pattern: /\bwichtig\b/gi, replacements: ['systemrelevant', 'von strategischer Bedeutung'], type: 'adj' },
    { pattern: /\bschnell\b/gi, replacements: ['zeitnah', 'mit Nachdruck'], type: 'adj' },
    { pattern: /\bsagen\b/gi, replacements: ['betonen', 'klarstellen', 'unterstreichen'] },
    { pattern: /\bdenken\b/gi, replacements: ['der Überzeugung sein', 'der festen Auffassung sein'] },
    { pattern: /\bmachen\b/gi, replacements: ['umsetzen', 'auf den Weg bringen', 'realisieren'] },
    { pattern: /\bändern\b/gi, replacements: ['transformieren', 'modernisieren', 'zukunftsfest machen'] },
    { pattern: /\bArbeitsplätze\b/gi, replacements: ['Beschäftigungsverhältnisse', 'Erwerbsmöglichkeiten'] },
    { pattern: /\bUmwelt\b/gi, replacements: ['Klima und Umwelt', 'Nachhaltigkeit'] },
    { pattern: /\bGeld\b/gi, replacements: ['Haushaltsmittel', 'finanzielle Ressourcen'] },
    { pattern: /\bnein\b/gi, replacements: ['das sehe ich differenzierter', 'da muss man genauer hinschauen'] },
  ],
};

class PolitikerTransformer {
  constructor(settings) {
    this.settings = settings;
    this.baseIntensity = settings.intensity || 50;
    this.originalTexts = new Map();
    this.nodeCount = 0;
    this.totalNodes = 0;
  }

  getEscalatedIntensity() {
    if (this.totalNodes === 0) return this.baseIntensity;
    const progress = this.nodeCount / this.totalNodes;
    let m;
    if (progress < 0.3) m = 0.3 + (progress / 0.3) * 0.3;
    else if (progress < 0.7) m = 0.6 + ((progress - 0.3) / 0.4) * 0.4;
    else m = 1.0 + ((progress - 0.7) / 0.3) * 0.3;
    return Math.min(100, Math.round(this.baseIntensity * m));
  }

  getCurrentAkt() {
    if (this.totalNodes === 0) return 2;
    const p = this.nodeCount / this.totalNodes;
    return p < 0.3 ? 1 : p < 0.7 ? 2 : 3;
  }

  transform(text) {
    if (!text || text.trim().length < 3) return text;
    const intensity = this.getEscalatedIntensity();
    const akt = this.getCurrentAkt();
    let result = text;

    // Wort-Ersetzungen
    if (this.settings.replace) {
      for (const entry of POLITIKER_FILLERS.replacements) {
        if (Math.random() * 100 > intensity) continue;
        const repl = entry.replacements[Math.floor(Math.random() * entry.replacements.length)];
        if (entry.type && typeof GermanGrammar !== 'undefined') {
          result = GermanGrammar.replaceWithGrammar(result, entry, repl, akt);
        } else {
          result = result.replace(entry.pattern, (match) => {
            if (match[0] === match[0].toUpperCase()) return repl.charAt(0).toUpperCase() + repl.slice(1);
            return repl;
          });
        }
      }
    }

    // Füllwörter
    if (this.settings.fillers) {
      const sentences = result.split(/(?<=[.!?])\s+/);
      result = sentences.map((s) => {
        if (s.length < 15) return s;
        let mod = s;

        // Satzanfang
        if (akt >= 2 && Math.random() < (intensity / 100) * 0.4) {
          const f = POLITIKER_FILLERS.start[Math.floor(Math.random() * POLITIKER_FILLERS.start.length)];
          mod = f + mod.charAt(0).toLowerCase() + mod.slice(1);
        }
        // Mitte
        if (akt >= 2 && Math.random() < (intensity / 100) * 0.2) {
          const f = POLITIKER_FILLERS.mid[Math.floor(Math.random() * POLITIKER_FILLERS.mid.length)];
          const ci = mod.indexOf(',');
          if (ci > 5 && ci < mod.length - 5) {
            mod = mod.slice(0, ci + 1) + f + mod.slice(ci + 2);
          }
        }
        // Satzende
        if (akt === 3 && Math.random() < (intensity / 100) * 0.3) {
          const f = POLITIKER_FILLERS.end[Math.floor(Math.random() * POLITIKER_FILLERS.end.length)];
          const pm = mod.match(/([.!?]+)$/);
          if (pm) mod = mod.slice(0, -pm[0].length) + f + pm[0];
        }
        return mod;
      }).join(' ');
    }

    return result;
  }

  transformDOM(rootElement) {
    const root = rootElement || document.body;
    const textNodes = this._collectTextNodes(root);
    this.totalNodes = textNodes.length;
    this.nodeCount = 0;
    for (const n of textNodes) {
      const orig = n.textContent;
      const t = this.transform(orig);
      if (t !== orig) { this.originalTexts.set(n, orig); n.textContent = t; if (n.parentElement) n.parentElement.dataset.genzTransformed = 'true'; }
      this.nodeCount++;
    }
    return textNodes.length;
  }

  _collectTextNodes(root) {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => {
        const p = n.parentElement; if (!p) return NodeFilter.FILTER_REJECT;
        if (_SM_SKIP_TAGS.has(p.tagName)) return NodeFilter.FILTER_REJECT;
        if (p.dataset && p.dataset.genzTransformed) return NodeFilter.FILTER_REJECT;
        if (n.textContent.trim().length < 3) return NodeFilter.FILTER_REJECT;
        if (!p.offsetParent && p !== document.body && p.tagName !== 'BODY') {
          if (p.style && p.style.display === 'none') return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }); const nodes = []; let node; while (node = w.nextNode()) nodes.push(node); return nodes;
  }

  revertAll() { for (const [n, o] of this.originalTexts) { try { n.textContent = o; if (n.parentElement) delete n.parentElement.dataset.genzTransformed; } catch(e) {} } this.originalTexts.clear(); }
}

// ==========================================================================
// ADJEKTIVKILLER — Streicht alle Adjektive
// ==========================================================================
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
  'frisch', 'alt', 'modern', 'klassisch', 'typisch', 'echt', 'wirklich',
  'politisch', 'wirtschaftlich', 'sozial', 'öffentlich', 'privat',
  'europäisch', 'deutsch', 'international', 'national', 'digital',
];

// Adjektiv-Suffixe die auch unbekannte Adjektive erkennen
const ADJ_SUFFIX_PATTERNS = /\b\w+(ig|lich|isch|sam|bar|haft|los|voll|reich|arm|mäßig|artig|förmig|wertig)\b/gi;

class AdjektivkillerTransformer {
  constructor(settings) {
    this.settings = settings;
    this.baseIntensity = settings.intensity || 50;
    this.originalTexts = new Map();
    this.nodeCount = 0;
    this.totalNodes = 0;
    this._buildPatterns();
  }

  _buildPatterns() {
    // Baue Regex für bekannte Adjektive (mit Endungen)
    const endings = '(?:e[mnrs]?|er|es)?';
    this.knownAdjPattern = new RegExp(
      '\\b(' + COMMON_ADJECTIVES.join('|') + ')' + endings + '\\b',
      'gi'
    );
  }

  getEscalatedIntensity() {
    if (this.totalNodes === 0) return this.baseIntensity;
    const p = this.nodeCount / this.totalNodes;
    let m;
    if (p < 0.3) m = 0.3 + (p / 0.3) * 0.3;
    else if (p < 0.7) m = 0.6 + ((p - 0.3) / 0.4) * 0.4;
    else m = 1.0 + ((p - 0.7) / 0.3) * 0.3;
    return Math.min(100, Math.round(this.baseIntensity * m));
  }

  transform(text) {
    if (!text || text.trim().length < 3) return text;
    const intensity = this.getEscalatedIntensity();
    let result = text;

    // Bekannte Adjektive entfernen
    result = result.replace(this.knownAdjPattern, (match) => {
      if (Math.random() * 100 > intensity) return match;
      return '';
    });

    // Unbekannte Adjektive via Suffix erkennen und entfernen
    if (intensity > 40) {
      result = result.replace(ADJ_SUFFIX_PATTERNS, (match) => {
        // Nicht entfernen wenn es ein Substantiv sein könnte (Großbuchstabe)
        if (match[0] === match[0].toUpperCase()) return match;
        if (Math.random() * 100 > intensity * 0.7) return match;
        return '';
      });
    }

    // Doppelte Leerzeichen bereinigen
    result = result.replace(/  +/g, ' ').replace(/ ([,.])/g, '$1');

    return result;
  }

  transformDOM(rootElement) {
    const root = rootElement || document.body;
    const textNodes = this._collectTextNodes(root);
    this.totalNodes = textNodes.length;
    this.nodeCount = 0;
    for (const n of textNodes) {
      const orig = n.textContent;
      const t = this.transform(orig);
      if (t !== orig) { this.originalTexts.set(n, orig); n.textContent = t; if (n.parentElement) n.parentElement.dataset.genzTransformed = 'true'; }
      this.nodeCount++;
    }
    return textNodes.length;
  }

  _collectTextNodes(root) {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => {
        const p = n.parentElement; if (!p) return NodeFilter.FILTER_REJECT;
        if (_SM_SKIP_TAGS.has(p.tagName)) return NodeFilter.FILTER_REJECT;
        if (p.dataset && p.dataset.genzTransformed) return NodeFilter.FILTER_REJECT;
        if (n.textContent.trim().length < 3) return NodeFilter.FILTER_REJECT;
        if (!p.offsetParent && p !== document.body && p.tagName !== 'BODY') {
          if (p.style && p.style.display === 'none') return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }); const nodes = []; let node; while (node = w.nextNode()) nodes.push(node); return nodes;
  }

  revertAll() { for (const [n, o] of this.originalTexts) { try { n.textContent = o; if (n.parentElement) delete n.parentElement.dataset.genzTransformed; } catch(e) {} } this.originalTexts.clear(); }
}

// ==========================================================================
// BAROCK-DEUTSCH
// ==========================================================================
const BAROCK_CONFIG = {
  name: 'Barock-Deutsch',
  phonetics: [
    // c/k → ck (Verdopplung typisch Barock)
    { pattern: /\b([A-ZÄÖÜ][a-zäöü]*?)k([aeiouäöü])/g, replacement: '$1ck$2', chance: 0.5 },
    // t → th (barocke Schreibung): Tat → That, Tür → Thür
    { pattern: /\b([Tt])([aeiouäöü])/g, replacement: (m, t, v) => t + 'h' + v, chance: 0.4 },
    // rt → rth: wert → werth, Wort → Worth, Art → Arth
    { pattern: /([Ww])ert\b/g, replacement: '$1erth', chance: 0.7 },
    { pattern: /([Aa])rt\b/g, replacement: '$1rth', chance: 0.5 },
    // nk → nck: Dank → Danck, denken → dencken, Trunk → Trunck
    { pattern: /nk/g, replacement: 'nck', chance: 0.6 },
    // nd → ndt am Wortende: Tugend → Tugendt, Freund → Freundt, Feind → Feindt
    { pattern: /nd\b/g, replacement: 'ndt', chance: 0.55 },
    // Dativ-e: dem Mann → dem Manne, dem Kind → dem Kinde, dem Haus → dem Hause
    { pattern: /\b(dem|vom|zum|beim|im)\s+([A-ZÄÖÜ][a-zäöü]{2,}[bcdfgklmnprst])\b/g,
      replacement: (m, prep, noun) => prep + ' ' + noun + 'e', chance: 0.65 },
    // i → ie (Dehnung)
    { pattern: /\b([A-Za-z])i([rnlm]\b)/g, replacement: '$1ie$2', chance: 0.3 },
    // y statt i in Fremdwörtern
    { pattern: /\bPhilosoph/g, replacement: 'Philosophus', chance: 0.5 },
    // ß → ſſ (Langes s)
    { pattern: /ß/g, replacement: 'ſſ', chance: 0.35 },
    // ey statt ei (selten im Barock, häufiger bei Luther)
    { pattern: /ei\b/g, replacement: 'ey', chance: 0.25 },
  ],
  vocabulary: [
    { pattern: /\bdeshalb\b/gi, replacements: ['derohalben', 'dero Ursach halber'] },
    { pattern: /\bweil\b/gi, replacements: ['sintemalen', 'dieweil', 'alldieweil'] },
    { pattern: /\bauch\b/gi, replacements: ['ingleichen', 'desgleichen'] },
    { pattern: /\baber\b/gi, replacements: ['allein', 'jedoch', 'indeß'] },
    { pattern: /\bsofort\b/gi, replacements: ['alsobald', 'stracks', 'alsogleich'] },
    { pattern: /\bbesonders\b/gi, replacements: ['absonderlich', 'zumal', 'sonderlich'] },
    { pattern: /\bvielleicht\b/gi, replacements: ['allenfalls', 'etwa', 'gar wohl'] },
    { pattern: /\btrotzdem\b/gi, replacements: ['nichtsdestominder', 'dessen ungeachtet'] },
    { pattern: /\bsehr\b/gi, replacements: ['gar sehr', 'überaus', 'höchlich'] },
    { pattern: /\bgut\b/gi, replacements: ['trefflich', 'löblich', 'fürnehm'], type: 'adj' },
    { pattern: /\bschlecht\b/gi, replacements: ['übel', 'jämmerlich', 'erbärmlich'], type: 'adj' },
    { pattern: /\bschön\b/gi, replacements: ['holdselig', 'liebreich', 'anmuthig'], type: 'adj' },
    { pattern: /\bgroß\b/gi, replacements: ['gewaltig', 'mächtig', 'stattlich'], type: 'adj' },
    { pattern: /\bklein\b/gi, replacements: ['gering', 'winzig', 'ein Weniges'], type: 'adj' },
    { pattern: /\bschnell\b/gi, replacements: ['hurtig', 'behend', 'fürbaß'], type: 'adj' },
    { pattern: /\bsagen\b/gi, replacements: ['kundthun', 'vermelden', 'sprechen'] },
    { pattern: /\bdenken\b/gi, replacements: ['bedüncken', 'erachten', 'sinnen'] },
    { pattern: /\bglauben\b/gi, replacements: ['dafürhalten', 'vermeinen'] },
    { pattern: /\bsehen\b/gi, replacements: ['erblicken', 'gewahren', 'ansichtig werden'] },
    { pattern: /\bgehen\b/gi, replacements: ['sich verfügen', 'schreiten', 'wandeln'] },
    { pattern: /\bmachen\b/gi, replacements: ['verfertigen', 'vollbringen', 'ins Werck setzen'] },
    { pattern: /\bbekommen\b/gi, replacements: ['erlangen', 'zutheil werden'] },
    { pattern: /\bFreund\b/g, replacements: ['Gefährte', 'Weggefährte', 'Kamerade'], type: 'noun' },
    { pattern: /\bFrau\b/g, replacements: ['Weib', 'Frauenzimmer', 'die Dame'], type: 'noun' },
    { pattern: /\bMann\b/g, replacements: ['Kerl', 'der Herr', 'Mannes-Person'], type: 'noun' },
    { pattern: /\bKind\b/g, replacements: ['Knäblein', 'Mägdlein', 'Sprößling'], type: 'noun' },
    { pattern: /\bHaus\b/g, replacements: ['Behausung', 'Gemach', 'Losament'], type: 'noun' },
    { pattern: /\bGeld\b/gi, replacements: ['Münze', 'Thaler', 'Ducaten'] },
    { pattern: /\bArbeit\b/g, replacements: ['Tagwerck', 'Mühewalten', 'Verrichtung'], type: 'noun' },
    { pattern: /\bTugend\b/gi, replacements: ['Tugendt'], type: 'noun' },
    { pattern: /\bJugend\b/gi, replacements: ['Jugendt'], type: 'noun' },
    { pattern: /\bDank\b/g, replacements: ['Danck'], type: 'noun' },
    { pattern: /\bWerk\b/g, replacements: ['Werck'], type: 'noun' },
    { pattern: /\bVolk\b/g, replacements: ['Volck'], type: 'noun' },
    { pattern: /\bHerz\b/g, replacements: ['Hertz', 'Hertze'], type: 'noun' },
    { pattern: /\bKraft\b/gi, replacements: ['Krafft'], type: 'noun' },
    { pattern: /\bHilfe\b/gi, replacements: ['Hülffe', 'Beystandt'], type: 'noun' },
    { pattern: /\bKrieg\b/gi, replacements: ['Krieg', 'Krieges-Noth'], type: 'noun' },
    { pattern: /\bFriede\b/gi, replacements: ['Friede', 'Frieden'], type: 'noun' },
    { pattern: /\bLeben\b/g, replacements: ['Leben', 'Lebens-Wandel'], type: 'noun' },
    { pattern: /\bTod\b/g, replacements: ['Todt', 'das Zeitliche'], type: 'noun' },
    { pattern: /\bwert\b/gi, replacements: ['werth'], type: 'adj' },
    { pattern: /\bstark\b/gi, replacements: ['starck', 'kräfftig', 'gewaltig'], type: 'adj' },
    { pattern: /\bfreundlich\b/gi, replacements: ['freundtlich', 'holdseelig'], type: 'adj' },
    { pattern: /\bklug\b/gi, replacements: ['klug', 'sinnreich', 'weyland'], type: 'adj' },
    { pattern: /\bich denke\b/gi, replacements: ['mir deucht', 'mich dünckt', 'meines Erachtens'] },
    { pattern: /\bich glaube\b/gi, replacements: ['mir ist, als ob', 'ich halte dafür'] },
    { pattern: /\bdarüber\b/gi, replacements: ['darob', 'darüber hinaus'] },
    { pattern: /\bvorwärts\b/gi, replacements: ['fürbaß', 'voran'] },
    { pattern: /\bnämlich\b/gi, replacements: ['nemblich', 'nemlich'] },
    { pattern: /\bja\b/gi, replacements: ['fürwahr', 'wahrlich', 'gewiß'] },
    { pattern: /\bnein\b/gi, replacements: ['mitnichten', 'keineswegs', 'mit Verlaub, nein'] },
  ],
  fillers: {
    start: ['Wohlan, ', 'So höret, ', 'Fürwahr, ', 'Nun denn, ', 'Es begab sich, daß ', 'Wisset, '],
    end: [', so Gott will', ', wie es sich geziemt', ', das sey euch gesagt', ', auf Ehr und Gewissen'],
    interjections: ['Potz Blitz!', 'Bei meiner Seel!', 'Gott sey\'s geklagt!', 'O tempora, o mores!', 'Sapperment!'],
  }
};

// ==========================================================================
// GENDER-MODI
// ==========================================================================

// Bekannte gendered Nomen: { maskulin, feminin, neutral_stem }
const GENDERED_NOUNS = [
  { m: 'Lehrer', f: 'Lehrerin', pl: 'Lehrer', stem: 'Lehrer', fpl: 'Lehrerinnen' },
  { m: 'Schüler', f: 'Schülerin', pl: 'Schüler', stem: 'Schüler', fpl: 'Schülerinnen' },
  { m: 'Student', f: 'Studentin', pl: 'Studenten', stem: 'Student', fpl: 'Studentinnen', participle: 'Studierende' },
  { m: 'Mitarbeiter', f: 'Mitarbeiterin', pl: 'Mitarbeiter', stem: 'Mitarbeiter', fpl: 'Mitarbeiterinnen', participle: 'Mitarbeitende' },
  { m: 'Arzt', f: 'Ärztin', pl: 'Ärzte', stem: 'Arzt', fpl: 'Ärztinnen' },
  { m: 'Kunde', f: 'Kundin', pl: 'Kunden', stem: 'Kund', fpl: 'Kundinnen' },
  { m: 'Bürger', f: 'Bürgerin', pl: 'Bürger', stem: 'Bürger', fpl: 'Bürgerinnen' },
  { m: 'Politiker', f: 'Politikerin', pl: 'Politiker', stem: 'Politiker', fpl: 'Politikerinnen' },
  { m: 'Kollege', f: 'Kollegin', pl: 'Kollegen', stem: 'Kolleg', fpl: 'Kolleginnen' },
  { m: 'Freund', f: 'Freundin', pl: 'Freunde', stem: 'Freund', fpl: 'Freundinnen' },
  { m: 'Nachbar', f: 'Nachbarin', pl: 'Nachbarn', stem: 'Nachbar', fpl: 'Nachbarinnen' },
  { m: 'Fahrer', f: 'Fahrerin', pl: 'Fahrer', stem: 'Fahrer', fpl: 'Fahrerinnen', participle: 'Fahrende' },
  { m: 'Besucher', f: 'Besucherin', pl: 'Besucher', stem: 'Besucher', fpl: 'Besucherinnen', participle: 'Besuchende' },
  { m: 'Teilnehmer', f: 'Teilnehmerin', pl: 'Teilnehmer', stem: 'Teilnehmer', fpl: 'Teilnehmerinnen', participle: 'Teilnehmende' },
  { m: 'Wähler', f: 'Wählerin', pl: 'Wähler', stem: 'Wähler', fpl: 'Wählerinnen', participle: 'Wählende' },
  { m: 'Nutzer', f: 'Nutzerin', pl: 'Nutzer', stem: 'Nutzer', fpl: 'Nutzerinnen', participle: 'Nutzende' },
  { m: 'Spieler', f: 'Spielerin', pl: 'Spieler', stem: 'Spieler', fpl: 'Spielerinnen', participle: 'Spielende' },
  { m: 'Leser', f: 'Leserin', pl: 'Leser', stem: 'Leser', fpl: 'Leserinnen', participle: 'Lesende' },
  { m: 'Autor', f: 'Autorin', pl: 'Autoren', stem: 'Autor', fpl: 'Autorinnen' },
  { m: 'Professor', f: 'Professorin', pl: 'Professoren', stem: 'Professor', fpl: 'Professorinnen' },
  { m: 'Chef', f: 'Chefin', pl: 'Chefs', stem: 'Chef', fpl: 'Chefinnen' },
  { m: 'Käufer', f: 'Käuferin', pl: 'Käufer', stem: 'Käufer', fpl: 'Käuferinnen', participle: 'Kaufende' },
  { m: 'Verkäufer', f: 'Verkäuferin', pl: 'Verkäufer', stem: 'Verkäufer', fpl: 'Verkäuferinnen', participle: 'Verkaufende' },
  { m: 'Experte', f: 'Expertin', pl: 'Experten', stem: 'Expert', fpl: 'Expertinnen' },
  { m: 'Bäcker', f: 'Bäckerin', pl: 'Bäcker', stem: 'Bäcker', fpl: 'Bäckerinnen' },
  { m: 'Anwalt', f: 'Anwältin', pl: 'Anwälte', stem: 'Anwalt', fpl: 'Anwältinnen' },
  { m: 'Richter', f: 'Richterin', pl: 'Richter', stem: 'Richter', fpl: 'Richterinnen' },
  { m: 'Forscher', f: 'Forscherin', pl: 'Forscher', stem: 'Forscher', fpl: 'Forscherinnen', participle: 'Forschende' },
  { m: 'Bewohner', f: 'Bewohnerin', pl: 'Bewohner', stem: 'Bewohner', fpl: 'Bewohnerinnen', participle: 'Bewohnende' },
  { m: 'Berater', f: 'Beraterin', pl: 'Berater', stem: 'Berater', fpl: 'Beraterinnen', participle: 'Beratende' },
  { m: 'Zuhörer', f: 'Zuhörerin', pl: 'Zuhörer', stem: 'Zuhörer', fpl: 'Zuhörerinnen', participle: 'Zuhörende' },
  { m: 'Einwohner', f: 'Einwohnerin', pl: 'Einwohner', stem: 'Einwohner', fpl: 'Einwohnerinnen' },
  { m: 'Trainer', f: 'Trainerin', pl: 'Trainer', stem: 'Trainer', fpl: 'Trainerinnen' },
  { m: 'Redner', f: 'Rednerin', pl: 'Redner', stem: 'Redner', fpl: 'Rednerinnen', participle: 'Redende' },
  { m: 'Helfer', f: 'Helferin', pl: 'Helfer', stem: 'Helfer', fpl: 'Helferinnen', participle: 'Helfende' },
  { m: 'Gründer', f: 'Gründerin', pl: 'Gründer', stem: 'Gründer', fpl: 'Gründerinnen', participle: 'Gründende' },
];

class GenderTransformer {
  constructor(settings) {
    this.settings = settings;
    this.mode = settings.genderMode || 'star'; // star, colon, explicit, participle, maskulinum
    this.baseIntensity = settings.intensity || 50;
    this.originalTexts = new Map();
    this.nodeCount = 0;
    this.totalNodes = 0;
  }

  getEscalatedIntensity() {
    if (this.totalNodes === 0) return this.baseIntensity;
    const p = this.nodeCount / this.totalNodes;
    let m;
    if (p < 0.3) m = 0.5 + (p / 0.3) * 0.3;
    else if (p < 0.7) m = 0.8 + ((p - 0.3) / 0.4) * 0.2;
    else m = 1.0;
    return Math.min(100, Math.round(this.baseIntensity * m));
  }

  transform(text) {
    if (!text || text.trim().length < 3) return text;
    const intensity = this.getEscalatedIntensity();
    let result = text;

    for (const noun of GENDERED_NOUNS) {
      if (Math.random() * 100 > intensity) continue;

      switch (this.mode) {
        case 'star':
          result = this._genderWithSymbol(result, noun, '*');
          break;
        case 'colon':
          result = this._genderWithSymbol(result, noun, ':');
          break;
        case 'explicit':
          result = this._genderExplicit(result, noun);
          break;
        case 'participle':
          result = this._genderParticiple(result, noun);
          break;
        case 'maskulinum':
          result = this._degender(result, noun);
          break;
      }
    }

    return result;
  }

  // Gendern mit Symbol: Lehrer*innen, Lehrer:innen
  _genderWithSymbol(text, noun, symbol) {
    // Plural: Lehrer → Lehrer*innen
    if (noun.pl) {
      const plRegex = new RegExp('\\b' + this._escapeRegex(noun.pl) + '\\b', 'g');
      text = text.replace(plRegex, noun.stem + symbol + 'innen');
    }
    // Femininum bereits vorhanden: Lehrerin → Lehrer*in
    if (noun.f) {
      const fRegex = new RegExp('\\b' + this._escapeRegex(noun.f) + '\\b', 'g');
      text = text.replace(fRegex, noun.stem + symbol + 'in');
    }
    if (noun.fpl) {
      const fplRegex = new RegExp('\\b' + this._escapeRegex(noun.fpl) + '\\b', 'g');
      text = text.replace(fplRegex, noun.stem + symbol + 'innen');
    }
    // Maskulinum singular: Lehrer → Lehrer*in
    const mRegex = new RegExp('\\b' + this._escapeRegex(noun.m) + '\\b', 'g');
    text = text.replace(mRegex, noun.stem + symbol + 'in');
    return text;
  }

  // Gendern explizit: Lehrerinnen und Lehrer
  _genderExplicit(text, noun) {
    if (noun.pl) {
      const plRegex = new RegExp('\\b' + this._escapeRegex(noun.pl) + '\\b', 'g');
      text = text.replace(plRegex, (noun.fpl || noun.f + 'nen') + ' und ' + noun.pl);
    }
    const mRegex = new RegExp('\\b' + this._escapeRegex(noun.m) + '\\b', 'g');
    text = text.replace(mRegex, noun.f + ' oder ' + noun.m);
    return text;
  }

  // Gendern mit Partizip: Studierende, Lehrende
  _genderParticiple(text, noun) {
    if (!noun.participle) return text;
    if (noun.pl) {
      const plRegex = new RegExp('\\b' + this._escapeRegex(noun.pl) + '\\b', 'g');
      text = text.replace(plRegex, noun.participle);
    }
    // Singular mask. → Partizip
    const mRegex = new RegExp('\\b(der|ein|jeder|kein)\\s+' + this._escapeRegex(noun.m) + '\\b', 'gi');
    text = text.replace(mRegex, (match, article) => {
      // "der Lehrer" → "die lehrende Person"
      const artMap = { 'der': 'die', 'ein': 'eine', 'jeder': 'jede', 'kein': 'keine' };
      const newArt = artMap[article.toLowerCase()] || article;
      const finalArt = article[0] === article[0].toUpperCase() ? newArt.charAt(0).toUpperCase() + newArt.slice(1) : newArt;
      return finalArt + ' ' + noun.participle.charAt(0).toLowerCase() + noun.participle.slice(1) + ' Person';
    });
    return text;
  }

  // Generisches Maskulinum wiederherstellen: Lehrerinnen und Lehrer → Lehrer
  _degender(text, noun) {
    // Stern/Doppelpunkt entfernen
    const symRegex = new RegExp('\\b' + this._escapeRegex(noun.stem) + '[*:]inn?e?n?\\b', 'g');
    text = text.replace(symRegex, (match) => {
      if (match.endsWith('innen')) return noun.pl || noun.m;
      return noun.m;
    });
    // "Lehrerinnen und Lehrer" → "Lehrer"
    if (noun.fpl && noun.pl) {
      const explRegex = new RegExp('\\b' + this._escapeRegex(noun.fpl) + '\\s+und\\s+' + this._escapeRegex(noun.pl) + '\\b', 'gi');
      text = text.replace(explRegex, noun.pl);
    }
    // Partizipien zurück: "Studierende" → "Studenten"
    if (noun.participle && noun.pl) {
      const partRegex = new RegExp('\\b' + this._escapeRegex(noun.participle) + '\\b', 'g');
      text = text.replace(partRegex, noun.pl);
    }
    // Femininformen → Maskulinum (nur im Plural)
    if (noun.fpl) {
      const fplRegex = new RegExp('\\b' + this._escapeRegex(noun.fpl) + '\\b', 'g');
      text = text.replace(fplRegex, noun.pl || noun.m);
    }
    return text;
  }

  _escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  transformDOM(rootElement) {
    const root = rootElement || document.body;
    const textNodes = this._collectTextNodes(root);
    this.totalNodes = textNodes.length;
    this.nodeCount = 0;
    for (const n of textNodes) {
      const orig = n.textContent;
      const t = this.transform(orig);
      if (t !== orig) { this.originalTexts.set(n, orig); n.textContent = t; if (n.parentElement) n.parentElement.dataset.genzTransformed = 'true'; }
      this.nodeCount++;
    }
    return textNodes.length;
  }

  _collectTextNodes(root) {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => {
        const p = n.parentElement; if (!p) return NodeFilter.FILTER_REJECT;
        if (_SM_SKIP_TAGS.has(p.tagName)) return NodeFilter.FILTER_REJECT;
        if (p.dataset && p.dataset.genzTransformed) return NodeFilter.FILTER_REJECT;
        if (n.textContent.trim().length < 3) return NodeFilter.FILTER_REJECT;
        if (!p.offsetParent && p !== document.body && p.tagName !== 'BODY') {
          if (p.style && p.style.display === 'none') return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }); const nodes = []; let node; while (node = w.nextNode()) nodes.push(node); return nodes;
  }

  revertAll() { for (const [n, o] of this.originalTexts) { try { n.textContent = o; if (n.parentElement) delete n.parentElement.dataset.genzTransformed; } catch(e) {} } this.originalTexts.clear(); }
}
