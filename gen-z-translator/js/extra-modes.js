// Altertümliches Deutsch — Merge aus Barock + Luther + erweiterte bildungssprachliche Formeln
// Plus: Shared helper functions für einfache Transformer

// ==========================================================================
// ALTERTÜMLICHES DEUTSCH — Vereinigung von Barock und Luther mit Erweiterungen
// ==========================================================================
const ALTERTUEMLICH_CONFIG = {
  name: 'Altertümliches Deutsch',
  phonetics: [
    // === Luther-typisch ===
    // u → v am Wortanfang: und → vnd, um → vm
    { pattern: /\bund\b/gi, replacement: 'vnd', chance: 0.8 },
    { pattern: /\bum\b/gi, replacement: 'vm', chance: 0.65 },
    { pattern: /\buns\b/gi, replacement: 'vns', chance: 0.65 },
    { pattern: /\bunser\b/gi, replacement: 'vnser', chance: 0.65 },
    { pattern: /\büber\b/gi, replacement: 'vber', chance: 0.6 },
    { pattern: /\bunter\b/gi, replacement: 'vnter', chance: 0.6 },

    // ß → ſſ (Langes s)
    { pattern: /ß/g, replacement: 'ſſ', chance: 0.5 },

    // t → th (barocke Schreibung): Tat → That, Tür → Thür
    { pattern: /\b([Tt])([aeiouäöü])/g, replacement: (m, t, v) => t + 'h' + v, chance: 0.4 },

    // rt → rth am Wortende: wert → werth, Art → Arth, Ort → Orth
    { pattern: /([Ww])ert\b/g, replacement: '$1erth', chance: 0.75 },
    { pattern: /([Aa])rt\b/g, replacement: '$1rth', chance: 0.55 },
    { pattern: /([Oo])rt\b/g, replacement: '$1rth', chance: 0.55 },

    // nk → nck: Dank → Danck, denken → dencken
    { pattern: /nk/g, replacement: 'nck', chance: 0.65 },

    // nd → ndt am Wortende: Tugend → Tugendt, Freund → Freundt
    { pattern: /nd\b/g, replacement: 'ndt', chance: 0.6 },

    // Dativ-e: dem Mann → dem Manne
    { pattern: /\b(dem|vom|zum|beim|im)\s+([A-ZÄÖÜ][a-zäöü]{2,}[bcdfgklmnprst])\b/g,
      replacement: (m, prep, noun) => prep + ' ' + noun + 'e', chance: 0.7 },

    // ey statt ei (Luther-typisch)
    { pattern: /ei([nmt])/g, replacement: 'ey$1', chance: 0.45 },
    { pattern: /ei\b/g, replacement: 'ey', chance: 0.4 },

    // c/k → ck (Verdopplung typisch Barock)
    { pattern: /\b([A-ZÄÖÜ][a-zäöü]*?)k([aeiouäöü])/g, replacement: '$1ck$2', chance: 0.35 },

    // auff statt auf
    { pattern: /\b([Aa])uf\b/g, replacement: '$1uff', chance: 0.45 },

    // mb statt m am Wortende: darum → darumb
    { pattern: /\bdarum\b/gi, replacement: 'darumb', chance: 0.7 },
    { pattern: /\bwarum\b/gi, replacement: 'warumb', chance: 0.7 },

    // dt statt t: wird → wirdt, sind → sindt
    { pattern: /\bwird\b/gi, replacement: 'wirdt', chance: 0.45 },
    { pattern: /\bsind\b/gi, replacement: 'sindt', chance: 0.45 },

    // ä → e (Luther): hätte → hette, wäre → were
    { pattern: /\bhätte\b/gi, replacement: 'hette', chance: 0.45 },
    { pattern: /\bwäre\b/gi, replacement: 'were', chance: 0.45 },

    // i → ie (Dehnung, Barock)
    { pattern: /\b([A-Za-z])i([rnlm]\b)/g, replacement: '$1ie$2', chance: 0.25 },

    // y statt i: Christ → Chryst
    { pattern: /\bChrist/g, replacement: 'Chryst', chance: 0.4 },
  ],
  vocabulary: [
    // === Konjunktionen & Adverbien ===
    { pattern: /\bdeshalb\b/gi, replacements: ['derohalben', 'dero Ursach halber', 'darumb'] },
    { pattern: /\bweil\b/gi, replacements: ['sintemalen', 'dieweil', 'alldieweil', 'sintemal'] },
    { pattern: /\bauch\b/gi, replacements: ['ingleichen', 'desgleichen'] },
    { pattern: /\baber\b/gi, replacements: ['allein', 'jedoch', 'indeß', 'doch'] },
    { pattern: /\bsofort\b/gi, replacements: ['alsobald', 'stracks', 'alsogleich'] },
    { pattern: /\bbesonders\b/gi, replacements: ['absonderlich', 'zumal', 'sonderlich'] },
    { pattern: /\bvielleicht\b/gi, replacements: ['allenfalls', 'etwa', 'gar wohl', 'villeicht'] },
    { pattern: /\btrotzdem\b/gi, replacements: ['nichtsdestominder', 'dessen ungeachtet'] },
    { pattern: /\bsehr\b/gi, replacements: ['gar sehr', 'überaus', 'höchlich', 'seer'] },
    { pattern: /\bjetzt\b/gi, replacements: ['itzt', 'nunmehr', 'jetzo'] },
    { pattern: /\bheute\b/gi, replacements: ['heutiges Tages', 'am heutigen Thage'] },
    { pattern: /\bnicht\b/gi, replacements: ['nicht', 'nit'] },
    { pattern: /\bnämlich\b/gi, replacements: ['nemblich', 'nemlich'] },
    { pattern: /\bvorwärts\b/gi, replacements: ['fürbaß', 'voran'] },
    { pattern: /\bdarüber\b/gi, replacements: ['darob', 'darüber hinaus'] },
    { pattern: /\bimmer\b/gi, replacements: ['allzeit', 'stets', 'alleweile'] },
    { pattern: /\bnoch\b/gi, replacements: ['annoch', 'noch'] },
    { pattern: /\bdort\b/gi, replacements: ['alldort', 'daselbst'] },
    { pattern: /\bhier\b/gi, replacements: ['allhier', 'alhier'] },
    { pattern: /\bdanach\b/gi, replacements: ['hernach', 'alsdann'] },
    { pattern: /\bvorher\b/gi, replacements: ['zuvor', 'ehedem', 'vormals'] },
    { pattern: /\boft\b/gi, replacements: ['oftmalen', 'gar oft'] },
    { pattern: /\bniemals\b/gi, replacements: ['nimmermehr', 'zu keiner Frist'] },
    { pattern: /\bgenug\b/gi, replacements: ['gnugsam', 'genugsam'] },
    { pattern: /\bungefähr\b/gi, replacements: ['ohngefähr', 'beyläufig'] },
    { pattern: /\bwährend\b/gi, replacements: ['derweil', 'indessen', 'mittlerweile'] },
    { pattern: /\bobwohl\b/gi, replacements: ['obzwar', 'obschon', 'wiewohl'] },
    { pattern: /\bbevor\b/gi, replacements: ['ehe denn', 'bevor daß'] },

    // === Adjektive ===
    { pattern: /\bgut\b/gi, replacements: ['trefflich', 'löblich', 'fürnehm', 'wohlgefällig'], type: 'adj' },
    { pattern: /\bschlecht\b/gi, replacements: ['übel', 'jämmerlich', 'erbärmlich', 'elendlich'], type: 'adj' },
    { pattern: /\bschön\b/gi, replacements: ['holdselig', 'liebreich', 'anmuthig', 'holdseelig'], type: 'adj' },
    { pattern: /\bgroß\b/gi, replacements: ['gewaltig', 'mächtig', 'stattlich'], type: 'adj' },
    { pattern: /\bklein\b/gi, replacements: ['gering', 'winzig', 'ein Weniges'], type: 'adj' },
    { pattern: /\bschnell\b/gi, replacements: ['hurtig', 'behend', 'fürbaß'], type: 'adj' },
    { pattern: /\bwichtig\b/gi, replacements: ['von Belang', 'erheblich', 'bedeutsam'], type: 'adj' },
    { pattern: /\bwert\b/gi, replacements: ['werth'], type: 'adj' },
    { pattern: /\bstark\b/gi, replacements: ['starck', 'kräfftig', 'gewaltig'], type: 'adj' },
    { pattern: /\bfreundlich\b/gi, replacements: ['freundtlich', 'holdseelig'], type: 'adj' },
    { pattern: /\bklug\b/gi, replacements: ['klug', 'sinnreich', 'gescheidt'], type: 'adj' },
    { pattern: /\bmutig\b/gi, replacements: ['tapffer', 'behertzt', 'unverzagt'], type: 'adj' },
    { pattern: /\btraurig\b/gi, replacements: ['betrübt', 'schwermüthig', 'wehmüthig'], type: 'adj' },
    { pattern: /\bglücklich\b/gi, replacements: ['beglückt', 'hocherfreut', 'wohlgemuth'], type: 'adj' },
    { pattern: /\balt\b/gi, replacements: ['betagt', 'hochbetagt', 'greisenhafft'], type: 'adj' },
    { pattern: /\bjung\b/gi, replacements: ['jung an Jahren', 'in jungen Tagen'], type: 'adj' },
    { pattern: /\breich\b/gi, replacements: ['wohlhabend', 'begütert', 'von Stand'], type: 'adj' },
    { pattern: /\barm\b/gi, replacements: ['darbend', 'elend', 'ohnvermögend'], type: 'adj' },
    { pattern: /\bfremd\b/gi, replacements: ['frembdt', 'nicht von hier', 'auswärtig'], type: 'adj' },
    { pattern: /\bschlimm\b/gi, replacements: ['arg', 'gar übel', 'gottsjämmerlich'], type: 'adj' },
    { pattern: /\bverrückt\b/gi, replacements: ['von Sinnen', 'des Verstandes beraubt', 'irrsinnig'], type: 'adj' },
    { pattern: /\bberühmt\b/gi, replacements: ['hochberühmt', 'wohlbekannt', 'weithin gerühmt'], type: 'adj' },

    // === Verben ===
    { pattern: /\bsagen\b/gi, replacements: ['kundthun', 'vermelden', 'sprechen'] },
    { pattern: /\bdenken\b/gi, replacements: ['bedüncken', 'erachten', 'sinnen'] },
    { pattern: /\bglauben\b/gi, replacements: ['dafürhalten', 'vermeinen'] },
    { pattern: /\bsehen\b/gi, replacements: ['erblicken', 'gewahren', 'ansichtig werden', 'schawen'] },
    { pattern: /\bgehen\b/gi, replacements: ['sich verfügen', 'schreiten', 'wandeln'] },
    { pattern: /\bmachen\b/gi, replacements: ['verfertigen', 'vollbringen', 'ins Werck setzen'] },
    { pattern: /\bbekommen\b/gi, replacements: ['erlangen', 'zutheil werden'] },
    { pattern: /\bgeben\b/gi, replacements: ['geben', 'darreichen'] },
    { pattern: /\bnehmen\b/gi, replacements: ['nemen', 'an sich nemen'] },
    { pattern: /\bkommen\b/gi, replacements: ['komen', 'eintreffen'] },
    { pattern: /\bhelfen\b/gi, replacements: ['helffen', 'Beystand leisten'] },
    { pattern: /\bleben\b/gi, replacements: ['wandeln', 'seinen Lebenswandel führen'] },
    { pattern: /\bsterben\b/gi, replacements: ['das Zeitliche segnen', 'dahinfahren', 'verscheiden'] },
    { pattern: /\bwissen\b/gi, replacements: ['wiſſen', 'Kundschaft haben von'] },
    { pattern: /\bsprechen\b/gi, replacements: ['reden', 'ein Wortt thun'] },
    { pattern: /\bschreiben\b/gi, replacements: ['zu Papier bringen', 'niederschreiben'] },
    { pattern: /\blesen\b/gi, replacements: ['zur Kenntniß nehmen', 'durchlesen'] },
    { pattern: /\bargumentieren\b/gi, replacements: ['disputiren', 'Gründe anführen'] },
    { pattern: /\bstreiten\b/gi, replacements: ['hadern', 'sich befehden'] },
    { pattern: /\blieben\b/gi, replacements: ['lieb haben', 'minnen', 'ins Hertze schließen'] },
    { pattern: /\bhassen\b/gi, replacements: ['verabscheuen', 'gram sein'] },
    { pattern: /\bbeginnen\b/gi, replacements: ['anheben', 'den Anfang machen'] },
    { pattern: /\bfinden\b/gi, replacements: ['finden', 'antreffen', 'gewahr werden'] },
    { pattern: /\bessen\b/gi, replacements: ['speisen', 'zu Tische sitzen'] },
    { pattern: /\btrinken\b/gi, replacements: ['trincken', 'den Becher erheben'] },
    { pattern: /\bschlafen\b/gi, replacements: ['der Ruhe pflegen', 'sich zur Ruhe begeben'] },
    { pattern: /\barbeiten\b/gi, replacements: ['sein Tagwerck verrichten', 'sich mühen'] },

    // === Nomen ===
    { pattern: /\bFreund\b/g, replacements: ['Gefährte', 'Weggefährte', 'Kamerade'], type: 'noun' },
    { pattern: /\bFrau\b/g, replacements: ['Weib', 'Frauenzimmer', 'die Dame'], type: 'noun' },
    { pattern: /\bMann\b/g, replacements: ['Kerl', 'der Herr', 'Mannes-Person'], type: 'noun' },
    { pattern: /\bKind\b/g, replacements: ['Knäblein', 'Mägdlein', 'Sprößling'], type: 'noun' },
    { pattern: /\bHaus\b/g, replacements: ['Behausung', 'Gemach', 'Losament'], type: 'noun' },
    { pattern: /\bGeld\b/gi, replacements: ['Münze', 'Thaler', 'Ducaten', 'Goldt'] },
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
    { pattern: /\bWahrheit\b/gi, replacements: ['Warheyt', 'Wahrheyt'], type: 'noun' },
    { pattern: /\bFreude\b/gi, replacements: ['Frewde', 'Frewd'], type: 'noun' },
    { pattern: /\bSeele\b/gi, replacements: ['Seele', 'Seel'], type: 'noun' },
    { pattern: /\bGott\b/g, replacements: ['GOtt', 'der HErr'] },
    { pattern: /\bHerr\b/g, replacements: ['HErr', 'der Herr'] },
    { pattern: /\bKönig\b/g, replacements: ['König', 'der König'], type: 'noun' },
    { pattern: /\bWort\b/g, replacements: ['Wortt', 'das Wortt'], type: 'noun' },
    { pattern: /\bBrief\b/g, replacements: ['Schreiben', 'Epistel', 'Sendtbrief'], type: 'noun' },
    { pattern: /\bBuch\b/g, replacements: ['Buech', 'Tractatus', 'Schrifft'], type: 'noun' },
    { pattern: /\bStadt\b/g, replacements: ['Stadt', 'Weichbild'], type: 'noun' },
    { pattern: /\bDorf\b/g, replacements: ['Weiler', 'Flecken'], type: 'noun' },
    { pattern: /\bSchule\b/gi, replacements: ['Lehranstalt', 'Schul'], type: 'noun' },
    { pattern: /\bArzt\b/g, replacements: ['Medicus', 'Doktor'], type: 'noun' },
    { pattern: /\bRichter\b/g, replacements: ['Richter', 'Gerichtsherr'], type: 'noun' },
    { pattern: /\bSoldat\b/g, replacements: ['Landsknecht', 'Kriegsknecht'], type: 'noun' },
    { pattern: /\bReise\b/gi, replacements: ['Reyse', 'Fahrt', 'Pilgerfahrt'], type: 'noun' },
    { pattern: /\bFeind\b/g, replacements: ['Feyndt', 'Widersacher'], type: 'noun' },
    { pattern: /\bGefahr\b/gi, replacements: ['Gefahr', 'Fährnuß', 'Bedrohniß'], type: 'noun' },
    { pattern: /\bGesetz\b/gi, replacements: ['Gesetz', 'Ordnung', 'Satzung'], type: 'noun' },
    { pattern: /\bGericht\b/gi, replacements: ['Gericht', 'Thing', 'Gerichtsbarkeit'], type: 'noun' },
    { pattern: /\bStrafe\b/gi, replacements: ['Straffe', 'Züchtigung'], type: 'noun' },
    { pattern: /\bEhre\b/gi, replacements: ['Ehr', 'Ehre'], type: 'noun' },
    { pattern: /\bRechtsanwalt\b/g, replacements: ['Advokatus', 'Sachwalter', 'Rechtsbeystand'], type: 'noun' },
    { pattern: /\bRechtsanwältin\b/g, replacements: ['Advokatin', 'Sachwalterin'], type: 'noun' },

    // === Phrasen ===
    { pattern: /\bich denke\b/gi, replacements: ['mir deucht', 'mich dünckt', 'meines Erachtens'] },
    { pattern: /\bich glaube\b/gi, replacements: ['mir ist, als ob', 'ich halte dafür'] },
    { pattern: /\bja\b/gi, replacements: ['fürwahr', 'wahrlich', 'gewiß', 'so sey es'] },
    { pattern: /\bnein\b/gi, replacements: ['mitnichten', 'keineswegs', 'mit Verlaub, nein', 'nimmermehr'] },
    { pattern: /\bdanke\b/gi, replacements: ['hab Danck', 'Gott vergelt\'s', 'gelobet sey\'s'] },
    { pattern: /\bhallo\b/gi, replacements: ['Gott grüße Euch', 'Gehabt Euch wohl', 'Gelobt sey Jesus Christus'] },
    { pattern: /\btschüss\b/gi, replacements: ['Gehabt Euch wohl', 'Gott befohlen', 'Behüt Euch Gott'] },
    { pattern: /\bich\b/g, replacements: ['Jch'] },
    { pattern: /\bgibt\b/gi, replacements: ['giebt'] },
  ],
  fillers: {
    start: [
      'Wohlan, ', 'So höret, ', 'Fürwahr, ', 'Nun denn, ',
      'Es begab sich, daß ', 'Wisset, ', 'Sihe, ', 'Warlich, ',
      'Vnd es begab sich, ', 'Also ', 'Vnd es geschah, daſſ ',
      'Vernehmet, ', 'Wohl gemerket, ', 'So wisset denn, ',
      'Höret vnd staunet: ', 'In Wahrheyt, ',
    ],
    end: [
      ', so Gott will', ', wie es sich geziemt', ', das sey euch gesagt',
      ', auf Ehr und Gewissen', ', spricht der HErr',
      ', also geschah es', ', vnd ward also',
      ', auff daſſ ihr wiſſet', ', so stehet es geschrieben',
      ', bey meiner Seel', ', vnd also sey es',
    ],
    interjections: [
      'Potz Blitz!', 'Bei meiner Seel!', 'Gott sey\'s geklagt!',
      'O tempora, o mores!', 'Sapperment!',
      'Amen.', 'Sihe!', 'Warlich, warlich!', 'Halleluja!',
      'Gelobet sey GOtt!', 'Nun wohlan!', 'Gott steh uns bey!',
      'Himmel, Arsch vnd Zwirn!',
    ],
  }
};

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
