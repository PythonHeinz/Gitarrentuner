# Entwicklungsverlauf

Behält die letzten rund 10 Tage; Älteres geht nach `docs/archiv/`.

## 14.11.2026 – GitarrenHeinz-Audio: Tonerkennung
- **Was:** `lib/audio.js` ersetzt den Platzhalter: YIN-Tonhöhenerkennung, Mikrofon (ohne Browser-Aufbereitung), Gate, Anschlagsunterdrückung, Median, Modi Automatik/Manuell, Bezugston über `configure`, Nadelzonen-Hilfe `Tuner.Audio.zone()`. Eine Datei statt `lib/audio/`, damit `index.html` (Fundament) unverändert bleibt; der Rechenteil ist unter Node testbar.
- **Entschieden (Entwickler):** Bezugston 400–480 Hz, Schritt 1, Standard 440; Zonen ±5 / ±20 Cent.
- **Dateien:** `lib/audio.js`, `tests/test_audio.js`, `tests/test_audio_browser.py`, `tests/run_all.sh` (beide Tests eingebunden), `docs/AUDIO.md`, `docs/HANDYTEST.md`, `docs/agent/TECHNIK.md`; `version.js` auf 0.1.1.
- **Tests:** `bash tests/run_all.sh` grün. Synthetisch: alle Saiten, ±50 Cent, 44,1/48 kHz, Bezug 435/440/445, Fehler ≤ 0,05 Cent (mit Rauschen ca. 2,4 Cent), kein Oktavfehler bei schwachem Grundton, Stille und Rauschen ohne falsche Töne. Browser: Chromium mit Fake-Mikrofon (WAV): Erkennung, Messrate, Modi, Bezugston, Stop gibt Tracks frei, Hintergrund-Stopp, Fehlerfälle (abgelehnt, kein Mikrofon). Werte in `docs/AUDIO.md`.
- **Nicht auf dem Gerät geprüft:** echte Gitarre, Handymikrofon, Latenz, Systemanzeige des Mikrofons, Verhalten im Hintergrund auf dem Pixel (Liste: `docs/HANDYTEST.md`).
- **Offen:** Konstanten nach dem Handytest nachstellen. `Tuner.config`-Kommentar „vorläufig“ im Kern (Strang App) kann entfallen. Ob die Anzeige `Tuner.Audio.zone()` nutzt, entscheidet Strang Design.

## 14.11.2026 – GitarrenHeinz-App: Schritt 1 Gerüst
- **Was:** lauffähiges Grundgerüst als installierbare Offline-Web-App. Seite mit Kopfzeile, Sprachumschalter DE/EN, Anzeigebereich (Platzhalter), Startknopf (Platzhalter), Modus Automatik/Manuell, Bezugston-Stepper (Standard 440 Hz).
- **Übernommen (kopiert):** Sprachverfahren aus Heinz UI (`lib/core.js` in AIUIheinz: `lang`, `setLang`, `t`, `pick`, `esc`), angepasst auf JSON-Textdateien je Sprache; Service-Worker- und Manifestmuster aus INCIheinz-app (angepasst: Version aus `version.js`, Cache-first ohne Hintergrundabruf). **Nicht** übernommen: `core.css` (Google-Farbwelt, Stil bleibt Strang Design).
- **Dateien:** `index.html`, `version.js`, `sw.js`, `manifest.webmanifest`, `.nojekyll`, `css/base.css`, `lib/{core,instruments,audio,display,app}.js`, `i18n/{de,en}.json`, `instruments/{index,gitarre-klassisch}.json`, `icons/` (Platzhalter-Icons), `docs/SCHNITTSTELLEN.md`, `docs/agent/TECHNIK.md`, `tests/`.
- **Schnittstellen:** festgelegt in `docs/SCHNITTSTELLEN.md` (Ereignisse `reading`, `audio-state`, `string-select`, `lang`; Audio- und Display-API; Instrumentenformat; Speicherschlüssel `gh.*`).
- **Tests:** `bash tests/run_all.sh` – statische Prüfungen (`check_files.py`) und 33 Browserprüfungen (`test_app.py`), alle grün. Getestet in Chromium im Container; Offline per `set_offline` simuliert.
- **Nicht auf dem Gerät geprüft:** Installation als App, Offlinebetrieb am Handy, Darstellung auf dem Pixel. Mikrofon und Tonerkennung nicht vorhanden (Platzhalter).
- **Offen:** Bereich und Schritt des Bezugstons (vorläufig 400–480 Hz, Schritt 1; Vorschlag Strang Audio); GitHub Pages freischalten (Entwickler); echte Icons (Strang Design).

## 14.11.2026 – GitarrenHeinz-Design: Vorschlag (Aufgabe 1)
- **Was:** Skizze der Hauptansicht, vier Zustände (keine Eingabe, zu tief, zu hoch, gestimmt) auf 426 × 803 px. Nadel mit Skala `-- - 0 + ++`, Strichteilung 5 Cent, Zonengrenzen ±5 und ±20 Cent (vorläufig, Schwellen entscheidet der Entwickler nach Vorschlag Strang Audio), Kopfplatte 3+3 mit sechs Mechaniken (Durchmesser rund 48 px), Start/Stopp, Modus, Bezugston.
- **Stil:** warmes Hellgrau, schwarze Beschriftung, ein Akzent in Braun-Orange (Nadel, Auswahl, laufender Start), Grün nur für „gestimmt“ (zusätzlich Text „Gestimmt“, nicht nur Farbe). Systemschrift (Helvetica/Arial/Roboto), keine mitgelieferte Schrift. Nadel mit leichtem Überschwingen (Trägheit), im Leerlauf blass in der Mitte.
- **Dateien:** `docs/design/vorschlag.html` (eigenständig, offline), `docs/design/vorschlag.png`. Keine App-Dateien geändert.
- **Offen (Entwickler entscheidet):** Stil insgesamt; Nadelruhelage im Leerlauf (Mitte blass oder Anschlag links); Hell/Dunkel (nur wenn gewünscht); Schrift; Rastung bei `0` (Nadel bleibt beim Einrasten kurz ruhig).
- **Nicht auf dem Gerät geprüft:** nur Container-Browser (Chromium), nichts am Handy.

## 14.11.2026 – GitarrenHeinz-Design: Entscheidungen und warme Fassung
- **Entscheidung (Entwickler):** Stil Hell ist getroffen; Nadel in Ruhelage am linken Anschlag (wie analog); Hell bleibt, dazu eine warme Vorschlagsserie.
- **Warme Fassung** (`docs/design/vorschlag.html#warm`, Bild `vorschlag-warm.png`): Nussbaum-Furnier (CSS und SVG-Rauschen, keine Bilddatei), gelb leuchtende VU-Skala in schwarzer Fassung mit Bändern rot/bernstein/grün, schwarze Nadel, **LED** unten mittig an der Fassung: rot = außerhalb Zielbereich (über ±20 ct), gelb = im Zielbereich (±5 bis ±20 ct), grün = gestimmt (bis ±5 ct), aus = keine Eingabe. Zusätzlich bleiben Text (Zu tief/Zu hoch/Gestimmt) und Skalenzone, nicht nur Farbe. Kopfplatte auf schwarzer Blende, Mechaniken als Metallknöpfe, gewählte Mechanik amber leuchtend; Tasten und Schalter wie Rackgerät, Bezugston in amberfarbener Anzeige.
- **Schrift (warm):** Archivo Narrow (SIL OFL), 600 und 700, Großbuchstaben mit Sperrung; Dateien unter `docs/design/fonts/` samt Lizenz, offline. Hell bleibt bei der Systemschrift.
- **Schwellen** weiter vorläufig (±5, ±20 ct), Entscheidung nach Vorschlag Strang Audio.
- **Nicht auf dem Gerät geprüft:** nur Chromium im Container.

## 14.11.2026 – GitarrenHeinz-Design: Nussbaum-Foto statt CSS-Furnier
- **Was:** Panel der warmen Fassung nutzt jetzt ein echtes Foto: Poly Haven „Walnut Veneer“ (Jenelle van Heerden, CC0). Aus der 4K-Diffuse-Karte ein Hochformat-Ausschnitt (1278 × 2409 px, 270 KB), abgedunkelt und wärmer getönt; darüber CSS-Lichtverlauf und Vignette. Das Original (8 MB) liegt nur am PC (`web sources`), nicht im Repo.
- **Dateien:** `docs/design/img/walnut-panel.jpg`, `docs/design/img/QUELLE.md` (Quelle, Lizenz, Bearbeitung), `docs/design/vorschlag.html`, Bilder `vorschlag-warm.png`, `vorschlag-hell.png`.
- **Offen:** Bei Übernahme in die App `img/walnut-panel.jpg` in `SHELL` von `sw.js` eintragen (Offline) und `version.js` erhöhen.
