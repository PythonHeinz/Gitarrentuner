# AUFTRAG App (Strang GitarrenHeinz-App)

Angelegt 14.11.2026 im Root. **Startet zuerst**; Audio und Design warten auf Schritt 1.

## Ziel
Lauffähiges Grundgerüst des Tuners als installierbare, vollständig offline arbeitende Web-App, auf die Audio und Design aufsetzen.

## Entscheidungen (Entwickler, siehe `STAND.md`)
Eigenständige HTML-Dateien ohne Build; PWA über GitHub Pages (HTTPS, nicht localhost); absoluter Offline-Betrieb; Oberfläche Deutsch/Englisch mit Umschalter; Instrumente als Daten; erste Stimmung E A D G H E (englisch E A D G B E).

## Aufgaben
1. **Schritt 1 – Gerüst (zuerst pushen, dann melden):** Seitenstruktur (`index.html`, `lib/`), Ordner für Instrumentendaten, Platzhalter-Module für Anzeige (Design) und Tonerkennung (Audio) mit festgelegter Schnittstelle (zum Beispiel: Audio liefert Frequenz und Cent-Abweichung zur Zielsaite, Design nimmt sie entgegen). Schnittstelle in `docs/SCHNITTSTELLEN.md` beschreiben. Danach melden die Stränge Audio und Design starten.
2. **Wiederverwendung:** Bibliotheken und Verfahren aus den anderen Projekten des Entwicklers ansehen (Heinz UI: `lib/core.js`, `lib/core.css`, EN/DE-Verfahren; INCIheinz-App als Vorbild für PWA und GitHub Pages) und **kopieren** (nicht verlinken). Vorher dem Entwickler kurz sagen, was übernommen wird. Quellen: Klone unter `%USERPROFILE%\Toolsbyclaude` (nur lesen) oder die öffentlichen Repos `PythonHeinz/AIUIheinz` und `PythonHeinz/INCIheinz-app`.
3. **Instrumentendaten:** JSON je Instrument (Name, Saiten mit Notenname, Sollfrequenz bei 440 Hz oder Halbtonabstand zum Bezugston, Beschriftung DE/EN, Reihenfolge der Mechaniken). Zuerst nur „Gitarre, klassisch“; Format so, dass Ukulele und andere Stimmungen ohne Codeänderung dazukommen.
4. **Sprache:** Umschalter DE/EN, Texte nur in einer Textdatei je Sprache, nie im Code. Saitenbeschriftung folgt der Sprache (H/B).
5. **PWA offline:** Manifest, Service Worker mit vollständigem Vorab-Cache, Icons; Test: nach erstem Laden und Installation keine Netzanfrage mehr nötig. Keine externen Schriften, Skripte oder Bilder.
6. **Hosting:** GitHub Pages vorbereiten (Pfad, `start_url`, Scope). Freischalten tut der Entwickler (Settings → Pages, Branch `main`).
7. **Einstellungen speichern** (Sprache, Bezugston, Modus Automatik/Manuell) in `localStorage` mit klar benannten Schlüsseln; Schlüsselliste in `docs/SCHNITTSTELLEN.md`.
8. **Tests:** Playwright im Container (Seite lädt, Sprachwechsel, Service Worker cached alles, Instrumentendaten gültig). `tests/run_all.sh`; in `docs/agent/TECHNIK.md` Tests und Fallstricke eintragen.

## Grenzen
- Fundament ist dein Bereich; Anzeige und Tonerkennung nur als Platzhalter.
- Nichts als am Gerät geprüft melden, was nur simuliert lief (Installation und Offline am Handy prüft der Entwickler).
