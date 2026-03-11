# Tracker Viewer

Browser-Extension (Chrome/Chromium, Manifest V3), die transparent zeigt, welche Tracker auf jeder Website aktiv sind.

**Reine Anzeige** — kein Blocking, kein Eingriff in den Seitenablauf.

## Was es macht

- Erkennt Third-Party-Tracker in Echtzeit (Google Analytics, Facebook Pixel, Criteo, HubSpot, TikTok, …)
- Zeigt gesendete und empfangene Cookies, URL-Parameter und Request-Typen
- Kategorisiert Tracker: Analytics, Werbung, Social Tracking, CDN, Consent, etc.
- Klickbare Links zu den Tracker-Domains
- Zusammenfassung zum Kopieren

## Was es nicht macht

- Blockiert keine Tracker
- Sendet keine Daten an externe Server
- Verändert keine Requests oder Responses
- Arbeitet zu 100 % lokal im Browser

## Installation

1. `chrome://extensions` öffnen
2. "Entwicklermodus" aktivieren
3. "Entpackte Erweiterung laden" → diesen Ordner auswählen

## Dateien

| Datei | Beschreibung |
|---|---|
| `background.js` | Service Worker — fängt Requests ab, erkennt Tracker |
| `content.js` | Sidebar-UI — rendert die Tracker-Anzeige auf jeder Seite |
| `sidebar.css` | Elegantes Design — Arial thin, hellblau/weiß/grau |
| `trackers.js` | Tracker-Datenbank — lokale Erkennung ohne externe Abfragen |
| `popup.html/js` | Popup beim Klick auf das Extension-Icon |

## Design

Arial thin font, helles Farbschema mit kühlem Blau (#6b9dc2), Weiß und Grau. Glasmorphismus-Header, weiche Schatten, minimalistisch.
