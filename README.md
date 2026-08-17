# Fluid — lokaler Musikplayer (Desktop-App)

Ein echtes Desktop-Programm (Electron), kein Browser-Tab: eigenes Fenster,
eigenes Icon in der Taskleiste/im Dock, und ein echtes, immer-im-Vordergrund
schwebendes Overlay-Fenster für die Steuerung.

## Voraussetzung

Node.js (Version 18 oder neuer). Download: https://nodejs.org

Prüfen, ob es installiert ist:
```
node -v
```

## Starten (Entwicklungsmodus)

Im Projektordner ausführen:
```
npm install
npm start
```

Das öffnet Fluid als eigenständiges Fenster. Über das Overlay-Symbol oben
rechts öffnest du das schwebende Mini-Player-Fenster, das über allen anderen
Programmen sichtbar bleibt — auch außerhalb des Browsers/der App.

## Eine installierbare Version bauen (.exe / .dmg / .AppImage)

```
npm run dist
```

Das erzeugt im Ordner `dist/` eine Installationsdatei für dein aktuelles
Betriebssystem (z. B. eine `.exe`-Installationsdatei unter Windows, eine
`.dmg` unter macOS, eine `.AppImage` unter Linux). Electron-Builder
kompiliert dabei normalerweise nur für das Betriebssystem, auf dem der Befehl
ausgeführt wird — für eine Windows-Version musst du den Befehl also auf einem
Windows-Rechner ausführen usw.

Gezielt für ein bestimmtes System bauen:
```
npm run dist:win
npm run dist:mac
npm run dist:linux
```

## Funktionen

- Musikdateien oder ganze Ordner lokal importieren (nichts wird hochgeladen)
- Bibliothek bleibt gespeichert, auch nach dem Neustart der App
- Playlists erstellen, umbenennen, löschen, Titel zuordnen und zwischen
  ihnen wechseln
- Play/Pause, Vor/Zurück, Shuffle, Repeat, Suche, Lautstärke
- Schwebendes Overlay-Fenster: frei positionierbar, immer im Vordergrund,
  eigene Play/Pause/Vor/Zurück-Steuerung und Fortschrittsanzeige

## Eigenes App-Icon (optional)

Lege eine `icon.png` (mind. 512×512, für Windows zusätzlich `icon.ico`, für
macOS `icon.icns`) in den Projektordner und ergänze in `package.json` unter
`"build"` die passenden `"icon"`-Pfade für `win`, `mac` und `linux`.

## Veröffentlichen auf GitHub (mit automatischen Updates)

Fluid ist bereits so eingerichtet, dass GitHub Releases als Verteilungs- und
Update-Kanal genutzt werden können. Einmalige Einrichtung:

### 1. GitHub-Repository erstellen und Code hochladen

```
git init
git add .
git commit -m "Erster Commit"
git branch -M main
git remote add origin https://github.com/DEIN-USERNAME/fluid-player.git
git push -u origin main
```

### 2. `package.json` anpassen

Ersetze in `package.json` beide Vorkommen von `DEIN-USERNAME` (unter
`"repository"` und unter `"build" → "publish"`) durch deinen tatsächlichen
GitHub-Benutzernamen, und `fluid-player` ggf. durch deinen Repository-Namen.

### 3. Ein Release veröffentlichen

Versionsnummer in `package.json` hochzählen (z. B. `"version": "1.0.1"`),
committen, dann einen Git-Tag mit demselben Namen (mit `v`-Prefix) erstellen
und pushen:

```
git add package.json
git commit -m "Version 1.0.1"
git tag v1.0.1
git push origin main --tags
```

Das löst automatisch die GitHub-Action unter `.github/workflows/release.yml`
aus: Sie baut Fluid parallel für Windows, macOS und Linux und lädt die
fertigen Installationsdateien direkt als GitHub Release hoch — ganz ohne
eigenen Rechner. Nach ein paar Minuten findest du sie unter
`https://github.com/DEIN-USERNAME/fluid-player/releases`.

Kein zusätzliches Secret nötig — `GITHUB_TOKEN` wird von GitHub Actions
automatisch bereitgestellt.

### 4. Automatische Updates

Jede installierte Fluid-App prüft beim Start automatisch (nach wenigen
Sekunden) im Hintergrund, ob es auf GitHub ein neueres Release gibt. Wird
eines gefunden, lädt Fluid es im Hintergrund herunter und zeigt danach einen
Dialog: „Ein Update wurde heruntergeladen. Jetzt neu starten?“ — bestätigt
der Nutzer, installiert sich die neue Version automatisch.

Damit das zuverlässig funktioniert:
- Die Versionsnummer in `package.json` muss bei jedem Release erhöht werden
- Der Git-Tag muss exakt `v` + Versionsnummer sein (z. B. `v1.0.1`)
- Nur signierte oder zumindest konsistent über GitHub verteilte Releases
  werden von den Nutzern automatisch erkannt — lokale, manuell gebaute
  Versionen (`npm run dist` ohne Tag/Push) lösen keine Auto-Updates aus

### Hinweis zu Sicherheitswarnungen

Da die Installationsdateien nicht mit einem kostenpflichtigen
Code-Signing-Zertifikat signiert sind, zeigen Windows SmartScreen und macOS
Gatekeeper beim ersten Start eine Warnung. Das ist normal für unsignierte,
quelloffene Software:
- **Windows:** „Weitere Informationen“ → „Trotzdem ausführen“
- **macOS:** Datei im Finder mit Rechtsklick öffnen → „Öffnen“ bestätigen

Wer das vermeiden möchte, braucht ein kostenpflichtiges Code-Signing-Zertifikat
(Windows: ab ca. 70–300 €/Jahr, macOS: Apple Developer Program, 99 $/Jahr) und
trägt es zusätzlich in die `"build"`-Konfiguration ein.

