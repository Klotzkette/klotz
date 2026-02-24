# BGH Suche – Word Add-in

Word Add-in zur Suche auf [bundesgerichtshof.de](https://www.bundesgerichtshof.de) mit direktem Einfügen an der Cursor-Position.

## Dateien

| Datei | Beschreibung |
|---|---|
| `manifest.xml` | Das Word-Add-in-Manifest (wird in Word geladen) |
| `taskpane.html` | Die Benutzeroberfläche des Add-ins (muss gehostet werden) |

---

## Schritt-für-Schritt-Anleitung

### 1. taskpane.html hosten (kostenlos mit GitHub Pages)

Das Add-in benötigt eine HTTPS-URL für die `taskpane.html`. Die einfachste kostenlose Methode ist GitHub Pages:

1. Erstellen Sie ein kostenloses Konto auf [github.com](https://github.com) (falls noch nicht vorhanden)
2. Erstellen Sie ein neues Repository (z. B. `bgh-addin`)
3. Laden Sie `taskpane.html` in das Repository hoch
4. Gehen Sie zu **Settings → Pages** und aktivieren Sie GitHub Pages (Branch: `main`, Ordner: `/ (root)`)
5. Ihre URL lautet dann: `https://IHR-BENUTZERNAME.github.io/bgh-addin/taskpane.html`

### 2. manifest.xml anpassen

Öffnen Sie `manifest.xml` in einem Texteditor und ersetzen Sie **alle** Vorkommen von:

```
https://IHR-BENUTZERNAME.github.io/klotz/taskpane.html
```

durch Ihre tatsächliche GitHub Pages URL, z. B.:

```
https://max-mustermann.github.io/bgh-addin/taskpane.html
```

Ersetzen Sie auch in `<AppDomains>`:

```xml
<AppDomain>https://IHR-BENUTZERNAME.github.io</AppDomain>
```

durch:

```xml
<AppDomain>https://max-mustermann.github.io</AppDomain>
```

### 3. Add-in in Word laden (Sideloading)

#### Methode A: Über freigegebenen Ordner (empfohlen für dauerhaften Einsatz)

1. Erstellen Sie einen Ordner auf Ihrem PC, z. B. `C:\WordAddins\BGH`
2. Kopieren Sie die angepasste `manifest.xml` in diesen Ordner
3. Öffnen Sie Word → **Datei → Optionen → Trust Center → Einstellungen für das Trust Center**
4. Klicken Sie auf **Vertrauenswürdige Add-in-Kataloge**
5. Tragen Sie den Ordnerpfad ein (z. B. `C:\WordAddins\BGH`) und klicken Sie **Katalog hinzufügen**
6. Setzen Sie den Haken bei **Im Menü anzeigen** und klicken Sie **OK**
7. Starten Sie Word neu
8. Gehen Sie zu **Einfügen → Meine Add-ins → Freigegebener Ordner**
9. Wählen Sie **BGH Suche** und klicken Sie **Hinzufügen**

#### Methode B: Manuell im Home-Tab

Nach dem Laden über Methode A erscheint eine neue Schaltfläche **BGH Suche** im **Start**-Tab der Ribbon-Leiste.

---

## Benutzung

1. Klicken Sie im Word-Ribbon (Start-Tab) auf **BGH Suche** – der Aufgabenbereich öffnet sich
2. Geben Sie einen Suchbegriff ein (z. B. Aktenzeichen `IV ZR 145/22`, Thema wie `Mietrecht`)
3. Klicken Sie auf **BGH Entscheidungen durchsuchen** – die Suche öffnet sich im Browser
4. Finden Sie die gewünschte Entscheidung, markieren Sie den Text, kopieren Sie ihn (`Strg+C`)
5. Wechseln Sie zu Word, klicken Sie in den **Textbereich** des Add-ins, fügen Sie ein (`Strg+V`)
6. Setzen Sie den Cursor in Ihrem Word-Dokument an die gewünschte Stelle
7. Klicken Sie **An Cursor-Position in Word einfügen**

---

## Alternativ: Lokaler Test-Server (nur für Entwickler)

Falls Sie einen lokalen HTTPS-Server betreiben möchten (z. B. mit Node.js):

```bash
npx http-server . --ssl --cert ./cert.pem --key ./key.pem -p 3000
```

Dann in `manifest.xml` die URL auf `https://localhost:3000/taskpane.html` setzen.

---

## Hinweise

- Das Add-in öffnet BGH-Suchergebnisse im **externen Browser** (kein direktes Einbetten wegen Sicherheitseinstellungen des BGH)
- Berechtigung `ReadWriteDocument` ist nötig, um Text in das Dokument einzufügen
- Getestet mit Word 2016, 2019, 2021 und Microsoft 365 (Desktop)
