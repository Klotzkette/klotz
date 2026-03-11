# Text-Transformer — 15 Modi für deutschen Text

Chrome Extension (Manifest v3), die deutschen Text auf beliebigen Webseiten transformiert — mit behutsamer Drei-Akt-Dramaturgie und grammatikbewusster Ersetzung.

## Modi

### Sprachstile
- **Gen-Z / Gen Alpha** — Slang, Emojis, Füllwörter (200+ Einträge)
- **Bildungssprache** — Fachbegriffe, Rechtslatein, gehobener Stil
- **Politiker-Sprech** — Phrasen, Worthülsen, Maßnahmenpakete
- **Barock-Deutsch** — Anachronistische Wörter, alterthümliche Schreibung

### Dialekte
- **Berlinerisch** — ick, dit, jut, wa?
- **Sächsisch** — nu, gelle, Konsonanten-Verschiebung
- **Fränkisch** — fei, gell, ned, -la statt -chen
- **Bairisch** — i, mia, ned, -erl, Ja mei!
- **Schwäbisch** — isch, net, -le, gell?
- **Ruhrpott** — dat, wat, Hömma, woll?
- **Norddeutsch** — Moin, Understatement, schnacken

### Text-Werkzeuge
- **Gendern (Stern \*)** — Lehrer → Lehrer\*innen
- **Gendern (Doppelpunkt :)** — Lehrer → Lehrer:innen
- **Gendern (ausgeschrieben)** — Lehrerinnen und Lehrer
- **Gendern (Partizip)** — Studenten → Studierende
- **Generisches Maskulinum** — Gendern rückgängig machen
- **Adjektivkiller** — Alle Adjektive streichen

## Features

- Einstellbare Intensität (10% bis 100%)
- Drei-Akt-Dramaturgie (subtil → Kontrast → Eskalation)
- **Grammatikbewusste Ersetzung** — Adjektiv-Endungen und Nomen-Endungen werden erkannt und korrekt übertragen
- One-Click Revert zum Original
- Funktioniert auf allen Webseiten mit deutschem Text

## Installation

### Aus dem Quellcode (Developer Mode)

1. Dieses Repository klonen oder herunterladen
2. Chrome öffnen und `chrome://extensions` aufrufen
3. **Entwicklermodus** oben rechts aktivieren
4. **Entpackte Erweiterung laden** klicken
5. Den Ordner `gen-z-translator/` auswählen
6. Das Extension-Icon in der Toolbar anklicken und loslegen

## Technologie

- Chrome Manifest v3
- Vanilla JavaScript (kein Framework)
- Regelbasierte Grammatik-Engine (grammar.js)
- Content Scripts für DOM-Manipulation

## Lizenz

MIT
