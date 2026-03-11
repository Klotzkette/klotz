// Deutsche Dialekte — Konfig-Objekte für den DialectTransformer
// Jeder Dialekt: { name, phonetics[], vocabulary[], fillers{} }

const DIALECTS = {

  // ==========================================================================
  // BERLINERISCH
  // ==========================================================================
  berlinerisch: {
    name: 'Berlinerisch',
    phonetics: [
      // g → j am Wortanfang (vor Vokal)
      { pattern: /\bg([aeiouyäöü])/gi, replacement: (m, v) => (m[0] === m[0].toUpperCase() ? 'J' : 'j') + v, chance: 0.85 },
      // -ig → -ick am Wortende
      { pattern: /ig\b/g, replacement: 'ick', chance: 0.8 },
      // au → oo
      { pattern: /\bau(ch|f|s)\b/gi, replacement: (m, s) => (m[0] === m[0].toUpperCase() ? 'Oo' : 'oo') + s, chance: 0.7 },
      // ei → ee
      { pattern: /ei([nmt])\b/g, replacement: 'ee$1', chance: 0.7 },
      // pf → f
      { pattern: /\bPf/g, replacement: 'F', chance: 0.6 },
      { pattern: /\bpf/g, replacement: 'f', chance: 0.6 },
      // das → dit, was → wat
      { pattern: /\bdas\b/gi, replacement: 'dit', chance: 0.8 },
      { pattern: /\bwas\b/gi, replacement: 'wat', chance: 0.8 },
      // ich → ick
      { pattern: /\bich\b/gi, replacement: 'ick', chance: 0.85 },
      // nicht → nich
      { pattern: /\bnicht\b/gi, replacement: 'nich', chance: 0.8 },
      // ein → een
      { pattern: /\bein\b/gi, replacement: 'een', chance: 0.6 },
      // -er am Ende → -a
      { pattern: /er\b/g, replacement: 'a', chance: 0.5 },
    ],
    vocabulary: [
      { pattern: /\bGeld\b/gi, replacements: ['Knete', 'Kies'] },
      { pattern: /\bKopf\b/gi, replacements: ['Birne', 'Rübe'] },
      { pattern: /\bgestern\b/gi, replacements: ['jestern'] },
      { pattern: /\bAngst\b/gi, replacements: ['Schiss', 'Bammel'] },
      { pattern: /\bschnell\b/gi, replacements: ['fix', 'dalli dalli'], type: 'adj' },
      { pattern: /\bBier\b/gi, replacements: ['Molle'] },
      { pattern: /\bBrötchen\b/gi, replacements: ['Schrippe'] },
      { pattern: /\bFleischer\b/gi, replacements: ['Schlachta'] },
      { pattern: /\bgehst\b/gi, replacements: ['jehst'] },
      { pattern: /\bgeben\b/gi, replacements: ['jeben'] },
      { pattern: /\bAuge\b/gi, replacements: ['Ooge'] },
    ],
    fillers: {
      start: ['Mensch, ', 'Ick sach ma, ', 'Na, ', 'Kiek ma, ', 'Hör ma, ', 'Naja, '],
      end: [', wa?', ', oder?', ', ick sach\'s ja', ', vastehste?', ', wa'],
      interjections: ['Na sowat!', 'Ick jloob dit nich.', 'Donnawetta!', 'Na hör ma.'],
    }
  },

  // ==========================================================================
  // SÄCHSISCH
  // ==========================================================================
  saechsisch: {
    name: 'Sächsisch',
    phonetics: [
      // t → d
      { pattern: /\bt([aeiouyäöü])/gi, replacement: (m, v) => (m[0] === m[0].toUpperCase() ? 'D' : 'd') + v, chance: 0.6 },
      // p am Anfang → b
      { pattern: /\bp([aeiouyäöü])/gi, replacement: (m, v) => (m[0] === m[0].toUpperCase() ? 'B' : 'b') + v, chance: 0.5 },
      // k → g am Anfang
      { pattern: /\bk([aeiouyäöü])/gi, replacement: (m, v) => (m[0] === m[0].toUpperCase() ? 'G' : 'g') + v, chance: 0.5 },
      // ei → ee
      { pattern: /ei/g, replacement: 'ee', chance: 0.65 },
      // nicht → nich
      { pattern: /\bnicht\b/gi, replacement: 'nich', chance: 0.8 },
      // ich → isch (in manchen sächsischen Subdialekten)
      { pattern: /\bich\b/gi, replacement: 'isch', chance: 0.4 },
      // -er → -or
      { pattern: /er\b/g, replacement: 'or', chance: 0.4 },
      // ein → een
      { pattern: /\bein\b/gi, replacement: 'een', chance: 0.6 },
    ],
    vocabulary: [
      { pattern: /\bschauen\b/gi, replacements: ['gucken', 'guggen'] },
      { pattern: /\breden\b/gi, replacements: ['labern', 'schwatzen'] },
      { pattern: /\bMädchen\b/gi, replacements: ['Mädl', 'Meedchen'] },
      { pattern: /\blecker\b/gi, replacements: ['lecker', 'gudd'], type: 'adj' },
      { pattern: /\bklein\b/gi, replacements: ['gleen', 'glään'], type: 'adj' },
      { pattern: /\bBrötchen\b/gi, replacements: ['Semmel'] },
      { pattern: /\bFleischer\b/gi, replacements: ['Fleescher'] },
    ],
    fillers: {
      start: ['Nu, ', 'Naja, ', 'Also, ', 'Guck ma, ', 'Hör ma, '],
      end: [', gelle?', ', nu?', ', oder?', ', ne?'],
      interjections: ['Nu guck!', 'Nee nee nee.', 'Ei verbibsch!'],
    }
  },

  // ==========================================================================
  // FRÄNKISCH
  // ==========================================================================
  fraenkisch: {
    name: 'Fränkisch',
    phonetics: [
      // p → b
      { pattern: /\bp([aeiouyäöü])/gi, replacement: (m, v) => (m[0] === m[0].toUpperCase() ? 'B' : 'b') + v, chance: 0.5 },
      // t → d
      { pattern: /\bt([aeiouyäöü])/gi, replacement: (m, v) => (m[0] === m[0].toUpperCase() ? 'D' : 'd') + v, chance: 0.5 },
      // nicht → ned
      { pattern: /\bnicht\b/gi, replacement: 'ned', chance: 0.85 },
      // ich → iech
      { pattern: /\bich\b/gi, replacement: 'iech', chance: 0.7 },
      // -lein → -la
      { pattern: /lein\b/g, replacement: 'la', chance: 0.9 },
      // -chen → -la
      { pattern: /chen\b/g, replacement: 'la', chance: 0.8 },
      // ein → a
      { pattern: /\bein\b/gi, replacement: 'a', chance: 0.6 },
      // kein → kaa
      { pattern: /\bkein\b/gi, replacement: 'kaa', chance: 0.7 },
      // auch → aa
      { pattern: /\bauch\b/gi, replacement: 'aa', chance: 0.6 },
    ],
    vocabulary: [
      { pattern: /\bBrötchen\b/gi, replacements: ['Weckla', 'Brödla'] },
      { pattern: /\bFleischer\b/gi, replacements: ['Metzger'] },
      { pattern: /\bKartoffel\b/gi, replacements: ['Grumbern', 'Erdäpfl'] },
      { pattern: /\blecker\b/gi, replacements: ['guud', 'bassd scho'], type: 'adj' },
      { pattern: /\bsprechen\b/gi, replacements: ['redd', 'schwätzen'] },
      { pattern: /\barbeiten\b/gi, replacements: ['schaffen', 'wergn'] },
    ],
    fillers: {
      start: ['Fei, ', 'Also fei, ', 'Gell, ', 'Freilich, ', 'Schau, '],
      end: [', gell?', ', fei', ', freilich', ', oder?'],
      interjections: ['Bassd scho.', 'Fei wahr!', 'Allmächd!', 'Herrschaftszeiten!'],
    }
  },

  // ==========================================================================
  // BAIRISCH
  // ==========================================================================
  bairisch: {
    name: 'Bairisch',
    phonetics: [
      // nicht → ned/net
      { pattern: /\bnicht\b/gi, replacement: 'ned', chance: 0.9 },
      // ich → i
      { pattern: /\bich\b/gi, replacement: 'i', chance: 0.85 },
      // ist → is
      { pattern: /\bist\b/gi, replacement: 'is', chance: 0.8 },
      // wir → mia
      { pattern: /\bwir\b/gi, replacement: 'mia', chance: 0.8 },
      // ein → a
      { pattern: /\bein\b/gi, replacement: 'a', chance: 0.7 },
      // eine → a
      { pattern: /\beine\b/gi, replacement: 'a', chance: 0.7 },
      // kein → koa
      { pattern: /\bkein\b/gi, replacement: 'koa', chance: 0.8 },
      // -lich → -li
      { pattern: /lich\b/g, replacement: 'li', chance: 0.7 },
      // -chen → -erl
      { pattern: /chen\b/g, replacement: 'erl', chance: 0.8 },
      // -lein → -l
      { pattern: /lein\b/g, replacement: 'l', chance: 0.9 },
      // haben → ham
      { pattern: /\bhaben\b/gi, replacement: 'ham', chance: 0.7 },
      // auch → aa
      { pattern: /\bauch\b/gi, replacement: 'aa', chance: 0.7 },
      // auf → auf (af)
      { pattern: /\bauf\b/gi, replacement: 'af', chance: 0.6 },
      // nein → na
      { pattern: /\bnein\b/gi, replacement: 'na', chance: 0.8 },
    ],
    vocabulary: [
      { pattern: /\bBrötchen\b/gi, replacements: ['Semmerl', 'Semmel'] },
      { pattern: /\bFleischer\b/gi, replacements: ['Metzger', 'Metzga'] },
      { pattern: /\bKartoffel\b/gi, replacements: ['Erdäpfl', 'Erdapfl'] },
      { pattern: /\bJunge\b/g, replacements: ['Bua', 'Bub'] },
      { pattern: /\bMädchen\b/gi, replacements: ['Madl', 'Deandl'] },
      { pattern: /\bBier\b/gi, replacements: ['a Bier', 'a Mass'] },
      { pattern: /\bschauen\b/gi, replacements: ['schaug', 'schaugn'] },
      { pattern: /\blecker\b/gi, replacements: ['gschmackig', 'guad'], type: 'adj' },
      { pattern: /\bschön\b/gi, replacements: ['fei', 'schee'], type: 'adj' },
      { pattern: /\bklein\b/gi, replacements: ['kloa'], type: 'adj' },
      { pattern: /\bgroß\b/gi, replacements: ['mords', 'gscheit groß'], type: 'adj' },
      { pattern: /\bArbeitsplatz\b/gi, replacements: ['Hackn'] },
      { pattern: /\bGeld\b/gi, replacements: ['Zaster', 'Kohle'] },
    ],
    fillers: {
      start: ['Ja mei, ', 'Also, ', 'Schau, ', 'Geh, ', 'Sag amol, ', 'Horch, '],
      end: [', gell?', ', oder?', ', ned?', ', sag i doch', ', moanst ned aa?'],
      interjections: ['Sakra!', 'Ja mei.', 'Himmiherrgott!', 'Kruzifix!', 'Habedieehre!'],
    }
  },

  // ==========================================================================
  // SCHWÄBISCH
  // ==========================================================================
  schwaebisch: {
    name: 'Schwäbisch',
    phonetics: [
      // nicht → net
      { pattern: /\bnicht\b/gi, replacement: 'net', chance: 0.9 },
      // ich → i
      { pattern: /\bich\b/gi, replacement: 'i', chance: 0.8 },
      // wir → mir
      { pattern: /\bwir\b/gi, replacement: 'mir', chance: 0.8 },
      // ist → isch
      { pattern: /\bist\b/gi, replacement: 'isch', chance: 0.85 },
      // st → scht (inlaut)
      { pattern: /st/g, replacement: 'scht', chance: 0.5 },
      // -chen → -le
      { pattern: /chen\b/g, replacement: 'le', chance: 0.9 },
      // -lein → -le
      { pattern: /lein\b/g, replacement: 'le', chance: 0.9 },
      // ein → a/en
      { pattern: /\bein\b/gi, replacement: 'en', chance: 0.6 },
      // kein → koi
      { pattern: /\bkein\b/gi, replacement: 'koi', chance: 0.7 },
      // haben → hend
      { pattern: /\bhaben\b/gi, replacement: 'hend', chance: 0.7 },
      // auch → au
      { pattern: /\bauch\b/gi, replacement: 'au', chance: 0.5 },
      // nein → noi
      { pattern: /\bnein\b/gi, replacement: 'noi', chance: 0.8 },
    ],
    vocabulary: [
      { pattern: /\bBrötchen\b/gi, replacements: ['Weckle'] },
      { pattern: /\bKartoffel\b/gi, replacements: ['Grombiere', 'Erdäpfl'] },
      { pattern: /\bFleischer\b/gi, replacements: ['Metzger'] },
      { pattern: /\bJunge\b/g, replacements: ['Bub', 'Büble'] },
      { pattern: /\bMädchen\b/gi, replacements: ['Mädle'] },
      { pattern: /\blecker\b/gi, replacements: ['schmeckig', 'guet'], type: 'adj' },
      { pattern: /\bschön\b/gi, replacements: ['schee', 'nett'], type: 'adj' },
      { pattern: /\bschauen\b/gi, replacements: ['gucke', 'luege'] },
      { pattern: /\breden\b/gi, replacements: ['schwätze'] },
      { pattern: /\barbeiten\b/gi, replacements: ['schaffe'] },
      { pattern: /\bessen\b/gi, replacements: ['veschpre', 'esse'] },
      { pattern: /\bTreppe\b/gi, replacements: ['Schdäffele'] },
    ],
    fillers: {
      start: ['Ha, ', 'Also, ', 'Guck mol, ', 'Weisch, ', 'Jetz, ', 'So, '],
      end: [', gell?', ', ha?', ', oder net?', ', weisch?', ', du weisch scho'],
      interjections: ['Ha noi!', 'Heiligs Blechle!', 'So isch es.', 'Des kannscht fei glaube.'],
    }
  },

  // ==========================================================================
  // RUHRPOTT
  // ==========================================================================
  ruhrpott: {
    name: 'Ruhrpott',
    phonetics: [
      // das → dat
      { pattern: /\bdas\b/gi, replacement: 'dat', chance: 0.85 },
      // was → wat
      { pattern: /\bwas\b/gi, replacement: 'wat', chance: 0.85 },
      // es → et
      { pattern: /\bes\b/gi, replacement: 'et', chance: 0.7 },
      // nicht → nich
      { pattern: /\bnicht\b/gi, replacement: 'nich', chance: 0.85 },
      // ge- am Anfang → je-
      { pattern: /\bge([a-zäöü])/gi, replacement: (m, c) => (m[0] === m[0].toUpperCase() ? 'Je' : 'je') + c, chance: 0.5 },
      // g am Anfang vor Vokalen → j
      { pattern: /\bg([aeiouyäöü])/gi, replacement: (m, v) => (m[0] === m[0].toUpperCase() ? 'J' : 'j') + v, chance: 0.5 },
      // -st am Ende → -s
      { pattern: /st\b/g, replacement: 's', chance: 0.5 },
      // auf dem → aufm
      { pattern: /\bauf dem\b/gi, replacement: 'aufm', chance: 0.6 },
      // in dem → im
      { pattern: /\bin dem\b/gi, replacement: 'im', chance: 0.5 },
      // an dem → am
      { pattern: /\ban dem\b/gi, replacement: 'am', chance: 0.5 },
    ],
    vocabulary: [
      { pattern: /\bBrötchen\b/gi, replacements: ['Stuten', 'Brötken'] },
      { pattern: /\bFleischer\b/gi, replacements: ['Metzger'] },
      { pattern: /\bGeld\b/gi, replacements: ['Knete', 'Kohle', 'Kröten'] },
      { pattern: /\bArbeitsplatz\b/gi, replacements: ['Maloche'] },
      { pattern: /\barbeiten\b/gi, replacements: ['malochen', 'schaffen'] },
      { pattern: /\bschauen\b/gi, replacements: ['kucken', 'gucken'] },
      { pattern: /\breden\b/gi, replacements: ['quatschen', 'labern'] },
      { pattern: /\bJunge\b/g, replacements: ['Pansen', 'Fiansen'] },
      { pattern: /\bgroß\b/gi, replacements: ['riesig', 'ordentlich'], type: 'adj' },
      { pattern: /\blecker\b/gi, replacements: ['schmackhaft', 'geil'], type: 'adj' },
      { pattern: /\bkaputt\b/gi, replacements: ['am Arsch', 'hinüber'], type: 'adj' },
    ],
    fillers: {
      start: ['Ey, ', 'Hömma, ', 'Sachma, ', 'Boah, ', 'Weisse wat, ', 'Getz ma, '],
      end: [', woll?', ', ne?', ', ey', ', verstehsse?', ', sachich doch'],
      interjections: ['Boah ey!', 'Sachma!', 'Hömma!', 'Mensch ey.', 'Dat jibet doch nich.'],
    }
  },

  // ==========================================================================
  // NORDDEUTSCH (Bremen / Hamburg)
  // ==========================================================================
  norddeutsch: {
    name: 'Norddeutsch',
    phonetics: [
      // nicht → nich
      { pattern: /\bnicht\b/gi, replacement: 'nich', chance: 0.7 },
      // ein bisschen → n büschen
      { pattern: /\bein bisschen\b/gi, replacement: 'n büschen', chance: 0.8 },
      // sp/st bleiben sp/st (kein schp/scht wie im Süden) — das IST schon Standard
      // Aber: runter → runner, herein → rin
      { pattern: /\bherein\b/gi, replacement: 'rin', chance: 0.6 },
      { pattern: /\bheraus\b/gi, replacement: 'raus', chance: 0.6 },
      // Plattdeutsch-Einfluss: -ig → -ig (kein -isch wie in Berlin)
      // Understatement: "ganz gut" statt "super"
    ],
    vocabulary: [
      { pattern: /\bschön\b/gi, replacements: ['ganz nett', 'nich schlecht'], type: 'adj' },
      { pattern: /\btoll\b/gi, replacements: ['ganz ordentlich', 'kann man machen'], type: 'adj' },
      { pattern: /\bgroßartig\b/gi, replacements: ['nich verkehrt', 'ganz passabel'], type: 'adj' },
      { pattern: /\bschlecht\b/gi, replacements: ['nich so doll', 'da geht mehr'], type: 'adj' },
      { pattern: /\bsehr\b/gi, replacements: ['ganz schön', 'ordentlich'] },
      { pattern: /\breden\b/gi, replacements: ['schnacken', 'klönen'] },
      { pattern: /\bschauen\b/gi, replacements: ['kieken', 'gucken'] },
      { pattern: /\bBrötchen\b/gi, replacements: ['Rundstück'] },
      { pattern: /\bFleischer\b/gi, replacements: ['Schlachter'] },
      { pattern: /\bHallo\b/gi, replacements: ['Moin', 'Moin moin'] },
      { pattern: /\bguten Morgen\b/gi, replacements: ['Moin'] },
      { pattern: /\bguten Tag\b/gi, replacements: ['Moin'] },
      { pattern: /\bguten Abend\b/gi, replacements: ['Moin'] },
      { pattern: /\btschüss\b/gi, replacements: ['Tschüss', 'Mach\'s gut'] },
      { pattern: /\bdumm\b/gi, replacements: ['tüdelig', 'plietsch nich'], type: 'adj' },
      { pattern: /\bklug\b/gi, replacements: ['plietsch'], type: 'adj' },
      { pattern: /\bverrückt\b/gi, replacements: ['tüdelig', 'meschugge'], type: 'adj' },
      { pattern: /\bkalt\b/gi, replacements: ['kühl', 'n büschen frisch'], type: 'adj' },
      { pattern: /\bstürmisch\b/gi, replacements: ['n büschen windig'], type: 'adj' },
    ],
    fillers: {
      start: ['Moin, ', 'Na, ', 'Tja, ', 'Nu, ', 'Nee, ', 'Jo, '],
      end: [', ne?', ', oder wat?', ', tja', ', nech?', ', sach ich mal'],
      interjections: ['Moin.', 'Tja.', 'Dat löppt.', 'Butter bei die Fische.', 'Nich lang schnacken.'],
    }
  },

  // ==========================================================================
  // ÖSTERREICHISCH / WIENERISCH
  // ==========================================================================
  wienerisch: {
    name: 'Wienerisch',
    phonetics: [
      // nicht → net
      { pattern: /\bnicht\b/gi, replacement: 'net', chance: 0.85 },
      // ich → i
      { pattern: /\bich\b/gi, replacement: 'i', chance: 0.7 },
      // ist → is
      { pattern: /\bist\b/gi, replacement: 'is', chance: 0.75 },
      // ein → a
      { pattern: /\bein\b/gi, replacement: 'a', chance: 0.6 },
      // eine → a
      { pattern: /\beine\b/gi, replacement: 'a', chance: 0.6 },
      // haben → ham
      { pattern: /\bhaben\b/gi, replacement: 'ham', chance: 0.6 },
      // auch → aa
      { pattern: /\bauch\b/gi, replacement: 'aa', chance: 0.5 },
      // -chen → -erl (behutsam)
      { pattern: /chen\b/g, replacement: 'erl', chance: 0.6 },
      // was → wos
      { pattern: /\bwas\b/gi, replacement: 'wos', chance: 0.6 },
      // nein → na
      { pattern: /\bnein\b/gi, replacement: 'na', chance: 0.7 },
    ],
    vocabulary: [
      { pattern: /\bBrötchen\b/gi, replacements: ['Semmerl', 'Semmel'] },
      { pattern: /\bFleischer\b/gi, replacements: ['Fleischhauer'] },
      { pattern: /\bKartoffel\b/gi, replacements: ['Erdapfl', 'Erdäpfl'] },
      { pattern: /\bTomate\b/gi, replacements: ['Paradeiser'] },
      { pattern: /\bSahne\b/gi, replacements: ['Obers', 'Schlagobers'] },
      { pattern: /\bMarmelade\b/gi, replacements: ['Marmelad'] },
      { pattern: /\bAprikose\b/gi, replacements: ['Marille'] },
      { pattern: /\bAubergine\b/gi, replacements: ['Melanzani'] },
      { pattern: /\bBlumenkohl\b/gi, replacements: ['Karfiol'] },
      { pattern: /\bschön\b/gi, replacements: ['leiwand', 'fesch'], type: 'adj' },
      { pattern: /\btoll\b/gi, replacements: ['leiwand', 'ur leiwand'], type: 'adj' },
      { pattern: /\bsehr\b/gi, replacements: ['ur', 'voi'] },
      { pattern: /\bgut\b/gi, replacements: ['leiwand', 'passt scho'], type: 'adj' },
      { pattern: /\bschlecht\b/gi, replacements: ['grauslich', 'deppert'], type: 'adj' },
      { pattern: /\bdumm\b/gi, replacements: ['deppert', 'deppat'], type: 'adj' },
      { pattern: /\blecker\b/gi, replacements: ['gschmackig', 'guad'], type: 'adj' },
      { pattern: /\bJunge\b/g, replacements: ['Bub', 'Bua'] },
      { pattern: /\bMädchen\b/gi, replacements: ['Madl', 'Maderl'] },
      { pattern: /\bschauen\b/gi, replacements: ['schaun', 'schaugn'] },
      { pattern: /\breden\b/gi, replacements: ['ratschen', 'plaudern'] },
      { pattern: /\bessen\b/gi, replacements: ['essen', 'jausnen'] },
      { pattern: /\bGeld\b/gi, replacements: ['Schilling', 'Marie'] },
      { pattern: /\bPolizei\b/gi, replacements: ['Kiberer', 'Polizei'] },
      { pattern: /\bTasche\b/gi, replacements: ['Sackerl', 'Tascherl'] },
      { pattern: /\bTreppe\b/gi, replacements: ['Stiegenhaus', 'Stiege'] },
      { pattern: /\bHallo\b/gi, replacements: ['Servus', 'Grüß Gott'] },
      { pattern: /\bguten Tag\b/gi, replacements: ['Grüß Gott', 'Servus'] },
      { pattern: /\btschüss\b/gi, replacements: ['Baba', 'Servus', 'Pfiat di'] },
    ],
    fillers: {
      start: ['Geh, ', 'Schau, ', 'Najo, ', 'Weißt eh, ', 'Heast, ', 'Oida, '],
      end: [', gell?', ', oder?', ', weißt eh', ', Oida', ', gö?'],
      interjections: ['Leck mich!', 'Na geh!', 'Jessas!', 'Na servas!', 'Mei, oh mei.'],
    }
  },

  // ==========================================================================
  // SCHWEIZERDEUTSCH (behutsam)
  // ==========================================================================
  schweizerdeutsch: {
    name: 'Schweizerdeutsch',
    phonetics: [
      // k → ch (Kinder → Chinder, kalt → chalt) — behutsam
      { pattern: /\bk([aeiouäöü])/gi, replacement: (m, v) => (m[0] === m[0].toUpperCase() ? 'Ch' : 'ch') + v, chance: 0.5 },
      // nicht → nöd/nid
      { pattern: /\bnicht\b/gi, replacement: 'nöd', chance: 0.7 },
      // ich → i
      { pattern: /\bich\b/gi, replacement: 'i', chance: 0.5 },
      // ist → isch
      { pattern: /\bist\b/gi, replacement: 'isch', chance: 0.7 },
      // kein → kei
      { pattern: /\bkein\b/gi, replacement: 'kei', chance: 0.6 },
      // -chen → -li
      { pattern: /chen\b/g, replacement: 'li', chance: 0.8 },
      // -lein → -li
      { pattern: /lein\b/g, replacement: 'li', chance: 0.9 },
      // auch → au
      { pattern: /\bauch\b/gi, replacement: 'au', chance: 0.45 },
    ],
    vocabulary: [
      { pattern: /\bBrötchen\b/gi, replacements: ['Weggli', 'Brötli'] },
      { pattern: /\bFleischer\b/gi, replacements: ['Metzger'] },
      { pattern: /\bKartoffel\b/gi, replacements: ['Härdöpfel', 'Härdöpfl'] },
      { pattern: /\bFahrrad\b/gi, replacements: ['Velo'] },
      { pattern: /\bSchrank\b/gi, replacements: ['Chaschte', 'Kasten'] },
      { pattern: /\bschön\b/gi, replacements: ['schön', 'herzig'], type: 'adj' },
      { pattern: /\btoll\b/gi, replacements: ['lässig', 'mega'], type: 'adj' },
      { pattern: /\bgut\b/gi, replacements: ['guet', 'super'], type: 'adj' },
      { pattern: /\bschlecht\b/gi, replacements: ['mies', 'gruusig'], type: 'adj' },
      { pattern: /\bklein\b/gi, replacements: ['chli', 'chlii'], type: 'adj' },
      { pattern: /\bschauen\b/gi, replacements: ['luege'] },
      { pattern: /\breden\b/gi, replacements: ['schwätze', 'rede'] },
      { pattern: /\bessen\b/gi, replacements: ['ässe', 'verputze'] },
      { pattern: /\barbeiten\b/gi, replacements: ['schaffe'] },
      { pattern: /\bgehen\b/gi, replacements: ['go', 'gah'] },
      { pattern: /\bHallo\b/gi, replacements: ['Grüezi', 'Sali', 'Hoi'] },
      { pattern: /\bguten Tag\b/gi, replacements: ['Grüezi', 'Grüessech'] },
      { pattern: /\bguten Morgen\b/gi, replacements: ['Guete Morge'] },
      { pattern: /\btschüss\b/gi, replacements: ['Ade', 'Tschau', 'Uf Widerluege'] },
      { pattern: /\bsehr\b/gi, replacements: ['mega', 'huerä', 'voll'] },
      { pattern: /\bJunge\b/g, replacements: ['Bueb'] },
      { pattern: /\bMädchen\b/gi, replacements: ['Meitli'] },
    ],
    fillers: {
      start: ['Also, ', 'Lueg, ', 'Weisch, ', 'Gäll, ', 'Jä, '],
      end: [', oder?', ', gäll?', ', oder nöd?', ', weisch'],
      interjections: ['Gopferdammi!', 'Herrjemine!', 'Potztuusig!', 'So isch es.'],
    }
  },

  // ==========================================================================
  // HESSISCH
  // ==========================================================================
  hessisch: {
    name: 'Hessisch',
    phonetics: [
      // s → sch vor t/p: Stein → Schdein, Spaß → Schpaß
      { pattern: /\bst/gi, replacement: (m) => (m[0] === 'S' ? 'Schd' : 'schd'), chance: 0.6 },
      { pattern: /\bsp/gi, replacement: (m) => (m[0] === 'S' ? 'Schb' : 'schb'), chance: 0.5 },
      // nicht → net
      { pattern: /\bnicht\b/gi, replacement: 'net', chance: 0.8 },
      // auch → aach
      { pattern: /\bauch\b/gi, replacement: 'aach', chance: 0.7 },
      // -chen → -che
      { pattern: /chen\b/g, replacement: 'che', chance: 0.6 },
      // ich → isch
      { pattern: /\bich\b/gi, replacement: 'isch', chance: 0.7 },
      // ein → en
      { pattern: /\bein\b/gi, replacement: 'en', chance: 0.5 },
      // auf → uff
      { pattern: /\bauf\b/gi, replacement: 'uff', chance: 0.65 },
      // es → 's
      { pattern: /\bes\b/gi, replacement: "'s", chance: 0.5 },
    ],
    vocabulary: [
      { pattern: /\breden\b/gi, replacements: ['babbeln', 'schwätze'] },
      { pattern: /\bsprechen\b/gi, replacements: ['babbeln'] },
      { pattern: /\bBrötchen\b/gi, replacements: ['Weck', 'Weckche'] },
      { pattern: /\bFleischer\b/gi, replacements: ['Metzger'] },
      { pattern: /\bKartoffel\b/gi, replacements: ['Grumbeer', 'Krumbeer'] },
      { pattern: /\bArbeitsplatz\b/gi, replacements: ['Schaff'] },
      { pattern: /\barbeiten\b/gi, replacements: ['schaffe'] },
      { pattern: /\bschauen\b/gi, replacements: ['gucke', 'gugge'] },
      { pattern: /\bgut\b/gi, replacements: ['guud', 'gut'], type: 'adj' },
      { pattern: /\bschön\b/gi, replacements: ['schää', 'nett'], type: 'adj' },
      { pattern: /\bklein\b/gi, replacements: ['klaa'], type: 'adj' },
      { pattern: /\bJunge\b/g, replacements: ['Bub', 'Bubb'] },
      { pattern: /\bMädchen\b/gi, replacements: ['Mädsche', 'Mädschi'] },
      { pattern: /\bGeld\b/gi, replacements: ['Geld', 'Kies', 'Mobbe'] },
      { pattern: /\blecker\b/gi, replacements: ['lecker', 'guud'], type: 'adj' },
      { pattern: /\bHallo\b/gi, replacements: ['Ei Gude!', 'Gude'] },
      { pattern: /\btschüss\b/gi, replacements: ['Tschüssi', 'Mach\'s guud'] },
    ],
    fillers: {
      start: ['Ei, ', 'Gell, ', 'Also, ', 'Horsch emol, ', 'Gude, '],
      end: [', gell?', ', ne?', ', oder?', ', isch schwör'],
      interjections: ['Ei Gude wie!', 'Uff!', 'Des gibbt\'s doch net!', 'Ei verbibbsch!'],
    }
  },

  // ==========================================================================
  // SAARLÄNDISCH
  // ==========================================================================
  saarlaendisch: {
    name: 'Saarländisch',
    phonetics: [
      // st → schd
      { pattern: /\bst/gi, replacement: (m) => (m[0] === 'S' ? 'Schd' : 'schd'), chance: 0.55 },
      // sp → schb
      { pattern: /\bsp/gi, replacement: (m) => (m[0] === 'S' ? 'Schb' : 'schb'), chance: 0.5 },
      // nicht → net / nit
      { pattern: /\bnicht\b/gi, replacement: 'net', chance: 0.8 },
      // ich → isch
      { pattern: /\bich\b/gi, replacement: 'isch', chance: 0.7 },
      // auch → aach
      { pattern: /\bauch\b/gi, replacement: 'aach', chance: 0.6 },
      // ein → en
      { pattern: /\bein\b/gi, replacement: 'en', chance: 0.5 },
      // auf → uff
      { pattern: /\bauf\b/gi, replacement: 'uff', chance: 0.6 },
      // -chen → -che
      { pattern: /chen\b/g, replacement: 'che', chance: 0.55 },
    ],
    vocabulary: [
      { pattern: /\breden\b/gi, replacements: ['schwätze', 'babbele'] },
      { pattern: /\bsprechen\b/gi, replacements: ['schwätze'] },
      { pattern: /\bBrötchen\b/gi, replacements: ['Weck'] },
      { pattern: /\bFleischer\b/gi, replacements: ['Metzger'] },
      { pattern: /\bKartoffel\b/gi, replacements: ['Grumbeere', 'Grombeer'] },
      { pattern: /\barbeiten\b/gi, replacements: ['schaffe'] },
      { pattern: /\bschauen\b/gi, replacements: ['gucke', 'lugge'] },
      { pattern: /\bgut\b/gi, replacements: ['gudd', 'gut'], type: 'adj' },
      { pattern: /\bschön\b/gi, replacements: ['schää'], type: 'adj' },
      { pattern: /\bklein\b/gi, replacements: ['klään'], type: 'adj' },
      { pattern: /\blecker\b/gi, replacements: ['lecker', 'gudd'], type: 'adj' },
      { pattern: /\bJunge\b/g, replacements: ['Bub'] },
      { pattern: /\bMädchen\b/gi, replacements: ['Mädsche', 'Määdsche'] },
      { pattern: /\bHallo\b/gi, replacements: ['Unn?', 'Salü'] },
      { pattern: /\btschüss\b/gi, replacements: ['Salü', 'Ade'] },
      { pattern: /\bguten Tag\b/gi, replacements: ['Salü'] },
      { pattern: /\bGeld\b/gi, replacements: ['Geld', 'Moneten'] },
    ],
    fillers: {
      start: ['Ei jo, ', 'Also, ', 'Gell, ', 'Weischd, ', 'Horch emol, '],
      end: [', gell?', ', ne?', ', oder?', ', weischd'],
      interjections: ['Ei jo!', 'Unn dann?', 'Des gibbt\'s doch net!', 'Hauptsach gudd gess.'],
    }
  },

  // ==========================================================================
  // KÖLSCH
  // ==========================================================================
  koelsch: {
    name: 'Kölsch',
    phonetics: [
      // das → dat
      { pattern: /\bdas\b/gi, replacement: 'dat', chance: 0.8 },
      // was → wat
      { pattern: /\bwas\b/gi, replacement: 'wat', chance: 0.8 },
      // ich → isch
      { pattern: /\bich\b/gi, replacement: 'isch', chance: 0.7 },
      // nicht → nit
      { pattern: /\bnicht\b/gi, replacement: 'nit', chance: 0.85 },
      // auch → ooch
      { pattern: /\bauch\b/gi, replacement: 'ooch', chance: 0.6 },
      // g am Anfang vor Vokal → j
      { pattern: /\bg([aeiouyäöü])/gi, replacement: (m, v) => (m[0] === m[0].toUpperCase() ? 'J' : 'j') + v, chance: 0.55 },
      // -st → -s
      { pattern: /st\b/g, replacement: 's', chance: 0.4 },
      // auf → op
      { pattern: /\bauf\b/gi, replacement: 'op', chance: 0.5 },
      // ein → ene/en
      { pattern: /\bein\b/gi, replacement: 'ene', chance: 0.5 },
    ],
    vocabulary: [
      { pattern: /\breden\b/gi, replacements: ['kalle', 'schwade'] },
      { pattern: /\bsprechen\b/gi, replacements: ['kalle'] },
      { pattern: /\bBrötchen\b/gi, replacements: ['Röggelche'] },
      { pattern: /\bBier\b/gi, replacements: ['Kölsch', 'e Kölsch'] },
      { pattern: /\btrinken\b/gi, replacements: ['süffe', 'drinke'] },
      { pattern: /\bFleischer\b/gi, replacements: ['Metzger'] },
      { pattern: /\barbeiten\b/gi, replacements: ['schaffe'] },
      { pattern: /\bschauen\b/gi, replacements: ['luure', 'kucke'] },
      { pattern: /\bgut\b/gi, replacements: ['jot', 'jut'], type: 'adj' },
      { pattern: /\bschön\b/gi, replacements: ['schön', 'nett'], type: 'adj' },
      { pattern: /\bklein\b/gi, replacements: ['klein', 'lück'], type: 'adj' },
      { pattern: /\blecker\b/gi, replacements: ['lecker', 'jot'], type: 'adj' },
      { pattern: /\bJunge\b/g, replacements: ['Jung', 'Pänz'] },
      { pattern: /\bKinder\b/gi, replacements: ['Pänz'] },
      { pattern: /\bMädchen\b/gi, replacements: ['Mädsche', 'Weet'] },
      { pattern: /\bGeld\b/gi, replacements: ['Jeld', 'Penunze'] },
      { pattern: /\bHallo\b/gi, replacements: ['Tach', 'Moin'] },
      { pattern: /\btschüss\b/gi, replacements: ['Tschö', 'Bes demnähx'] },
    ],
    fillers: {
      start: ['Hür ens, ', 'Sach ens, ', 'Jot, ', 'Weiste wat, ', 'Ävver, '],
      end: [', ne?', ', woll?', ', oder wat?', ', sach isch doch'],
      interjections: ['Et kütt wie et kütt.', 'Wat soll dä Quatsch?', 'Do lachste disch kapott!', 'Jot jemaat!'],
    }
  },
};
