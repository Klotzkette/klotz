// Spezial-Modi: Gender-Modi (Stern, Doppelpunkt, ausgeschrieben, Partizip, Maskulinum)
// Jeder Modus ist ein eigenständiger Transformer mit transformDOM/revertAll

const _SM_SKIP_TAGS = new Set(['SCRIPT','STYLE','NOSCRIPT','IFRAME','TEXTAREA','INPUT','CODE','PRE','SVG']);

// ==========================================================================
// Shared helpers for special-modes.js
// ==========================================================================
function _sharedCollectTextNodes_SM(root) {
  const w = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT, {
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

function _sharedTransformDOM_SM(transformer, rootElement) {
  const root = rootElement || document.body;
  const textNodes = _sharedCollectTextNodes_SM(root);
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

function _sharedRevert_SM(transformer) {
  for (const [n, o] of transformer.originalTexts) {
    try { n.textContent = o; if (n.parentElement) delete n.parentElement.dataset.genzTransformed; } catch(e) {}
  }
  transformer.originalTexts.clear();
}

// ==========================================================================
// GENDER-MODI
// ==========================================================================

// Bekannte gendered Nomen: { maskulin, feminin, neutral_stem }
const GENDERED_NOUNS = [
  { m: 'Lehrer', f: 'Lehrerin', pl: 'Lehrer', stem: 'Lehrer', fpl: 'Lehrerinnen', participle: 'Lehrende' },
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
  { m: 'Rechtsanwalt', f: 'Rechtsanwältin', pl: 'Rechtsanwälte', stem: 'Rechtsanwalt', fpl: 'Rechtsanwältinnen' },
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
  { m: 'Staatsanwalt', f: 'Staatsanwältin', pl: 'Staatsanwälte', stem: 'Staatsanwalt', fpl: 'Staatsanwältinnen' },
  { m: 'Notar', f: 'Notarin', pl: 'Notare', stem: 'Notar', fpl: 'Notarinnen' },
  { m: 'Mandant', f: 'Mandantin', pl: 'Mandanten', stem: 'Mandant', fpl: 'Mandantinnen' },
  { m: 'Kläger', f: 'Klägerin', pl: 'Kläger', stem: 'Kläger', fpl: 'Klägerinnen' },
  { m: 'Beklagter', f: 'Beklagte', pl: 'Beklagte', stem: 'Beklagt', fpl: 'Beklagte' },
  { m: 'Zeuge', f: 'Zeugin', pl: 'Zeugen', stem: 'Zeug', fpl: 'Zeuginnen' },
  { m: 'Gutachter', f: 'Gutachterin', pl: 'Gutachter', stem: 'Gutachter', fpl: 'Gutachterinnen' },
  { m: 'Ingenieur', f: 'Ingenieurin', pl: 'Ingenieure', stem: 'Ingenieur', fpl: 'Ingenieurinnen' },
  { m: 'Wissenschaftler', f: 'Wissenschaftlerin', pl: 'Wissenschaftler', stem: 'Wissenschaftler', fpl: 'Wissenschaftlerinnen', participle: 'Forschende' },
  { m: 'Journalist', f: 'Journalistin', pl: 'Journalisten', stem: 'Journalist', fpl: 'Journalistinnen' },
  { m: 'Moderator', f: 'Moderatorin', pl: 'Moderatoren', stem: 'Moderator', fpl: 'Moderatorinnen' },
  { m: 'Abgeordneter', f: 'Abgeordnete', pl: 'Abgeordnete', stem: 'Abgeordnet', fpl: 'Abgeordnete' },
  { m: 'Minister', f: 'Ministerin', pl: 'Minister', stem: 'Minister', fpl: 'Ministerinnen' },
  { m: 'Präsident', f: 'Präsidentin', pl: 'Präsidenten', stem: 'Präsident', fpl: 'Präsidentinnen' },
  { m: 'Beamter', f: 'Beamtin', pl: 'Beamte', stem: 'Beamt', fpl: 'Beamtinnen' },
  { m: 'Therapeut', f: 'Therapeutin', pl: 'Therapeuten', stem: 'Therapeut', fpl: 'Therapeutinnen' },
  { m: 'Pfleger', f: 'Pflegerin', pl: 'Pfleger', stem: 'Pfleger', fpl: 'Pflegerinnen', participle: 'Pflegende' },
  { m: 'Patient', f: 'Patientin', pl: 'Patienten', stem: 'Patient', fpl: 'Patientinnen' },
];

class GenderTransformer {
  constructor(settings) {
    this.settings = settings;
    this.mode = settings.genderMode || 'star';
    this.intensity = 100; // Immer volle Intensität
    this.originalTexts = new Map();
  }

  transform(text) {
    if (!text || text.trim().length < 3) return text;
    const intensity = this.intensity;
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

  transformDOM(root) { return _sharedTransformDOM_SM(this, root); }
  _collectTextNodes(root) { return _sharedCollectTextNodes_SM(root); }
  revertAll() { _sharedRevert_SM(this); }
}
