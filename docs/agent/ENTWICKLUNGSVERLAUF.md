# Entwicklungsverlauf

Behält die letzten rund 10 Tage; Älteres geht nach `docs/archiv/`.

## 14.11.2026 – GitarrenHeinz-App: Schritt 1 Gerüst
- **Was:** lauffähiges Grundgerüst als installierbare Offline-Web-App. Seite mit Kopfzeile, Sprachumschalter DE/EN, Anzeigebereich (Platzhalter), Startknopf (Platzhalter), Modus Automatik/Manuell, Bezugston-Stepper (Standard 440 Hz).
- **Übernommen (kopiert):** Sprachverfahren aus Heinz UI (`lib/core.js` in AIUIheinz: `lang`, `setLang`, `t`, `pick`, `esc`), angepasst auf JSON-Textdateien je Sprache; Service-Worker- und Manifestmuster aus INCIheinz-app (angepasst: Version aus `version.js`, Cache-first ohne Hintergrundabruf). **Nicht** übernommen: `core.css` (Google-Farbwelt, Stil bleibt Strang Design).
- **Dateien:** `index.html`, `version.js`, `sw.js`, `manifest.webmanifest`, `.nojekyll`, `css/base.css`, `lib/{core,instruments,audio,display,app}.js`, `i18n/{de,en}.json`, `instruments/{index,gitarre-klassisch}.json`, `icons/` (Platzhalter-Icons), `docs/SCHNITTSTELLEN.md`, `docs/agent/TECHNIK.md`, `tests/`.
- **Schnittstellen:** festgelegt in `docs/SCHNITTSTELLEN.md` (Ereignisse `reading`, `audio-state`, `string-select`, `lang`; Audio- und Display-API; Instrumentenformat; Speicherschlüssel `gh.*`).
- **Tests:** `bash tests/run_all.sh` – statische Prüfungen (`check_files.py`) und 33 Browserprüfungen (`test_app.py`), alle grün. Getestet in Chromium im Container; Offline per `set_offline` simuliert.
- **Nicht auf dem Gerät geprüft:** Installation als App, Offlinebetrieb am Handy, Darstellung auf dem Pixel. Mikrofon und Tonerkennung nicht vorhanden (Platzhalter).
- **Offen:** Bereich und Schritt des Bezugstons (vorläufig 400–480 Hz, Schritt 1; Vorschlag Strang Audio); GitHub Pages freischalten (Entwickler); echte Icons (Strang Design).
