# Text-Transformer — Gen-Z & Bildungssprache

Chrome Extension (Manifest v3), die deutschen Text auf beliebigen Webseiten verwandelt.

## Modi

### Gen-Z / Alpha
Ersetzt normalen Text durch Jugendsprache mit Emojis, Füllwörtern und Slang.
- 200+ Wörter im Glossar (Stand 2026)
- Emoji-Ketten nach Sätzen
- Füllwörter wie *digga*, *lowkey*, *no cap*

### Bildungssprache
Verwandelt Text in gehobene Sprache mit Fachbegriffen und rhetorischen Figuren.
- Lateinische Wendungen und Fremdwörter
- Parenthetische Einschübe
- Konjunktiv und Passivkonstruktionen

## Features

- Einstellbare Intensität (10% bis 100%)
- Drei-Akt-Dramaturgie (subtil → Kontrast → Eskalation)
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

### Verwendung

1. Eine beliebige deutschsprachige Webseite öffnen
2. Auf das Extension-Icon klicken
3. Modus wählen (Gen-Z oder Bildungssprache)
4. Toggles und Intensität nach Wunsch anpassen
5. **SEITE TRANSFORMIEREN** klicken
6. Zum Zurücksetzen: **ZURÜCKSETZEN** klicken

## Technologie

- Chrome Manifest v3
- Vanilla JavaScript (kein Framework)
- Content Scripts für DOM-Manipulation

## Lizenz

MIT
