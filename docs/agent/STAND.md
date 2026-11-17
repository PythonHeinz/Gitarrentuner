# Gitarren Heinz – Stand

Projekt: einfacher Gitarrentuner für sechssaitige Gitarren als HTML-Web-App für Smartphones/Android, Design im Stil von Braun und frühem Apple; später Ukulele und weitere Instrumente. Routine: `UEBERGABE.md`. Projektanweisung: `PROJEKTANWEISUNG.md` (diese Ordner).

Stand: 14.11.2026, Commit siehe `git log -1`. Gerüst (App Schritt 1) steht; Audio und Design können starten. Maßgeblich ist das Repo `PythonHeinz/Gitarrentuner` (Branch `main`); es gibt keine zweite Ablage der Steuerdateien am PC.

## Aktive Arbeit
Jeder Strang trägt vor der ersten Änderung eine Zeile ein (Datum, Strangname, Vorhaben, berührte Dateien), pusht sofort und löscht die Zeile nach dem Push. Zeilen älter als 24 Stunden gelten als verwaist; vor dem Entfernen den Entwickler fragen.
Aktuell:
- 17.11.2026, GitarrenHeinz-Design: Anzeige bauen (Warm + Hell, LED, Rackschrift). Berührt `lib/display.js`, `css/`, `img/`, `fonts/`, `docs/DESIGN.md`, `tests/` (Anzeige); `sw.js` (SHELL) und `version.js` nur Eintrag/Erhöhung; `index.html`/`lib/app.js` nur nach Absprache.

## Stränge
Strangname gilt, nicht der Titel in der Chat-Liste. Neue Stränge legt nur der Root an. Reihenfolge: App zuerst (Fundament), danach Audio und Design parallel (verschiedene Dateien).

| Strang | Inhalt | Stand |
|---|---|---|
| GitarrenHeinz (Root) | Konzept, Querprüfung, Register, Aufträge | läuft; Projektordner und Anweisungen angelegt 14.11.2026 |
| GitarrenHeinz-App | Grundgerüst, Fundament, Instrumentendaten, Sprache DE/EN, PWA offline, Hosting; `AUFTRAG_App.md` | Schritt 1 (Gerüst) fertig 14.11.2026; Rest des Auftrags erledigt, bis auf Handytest (Installation, Offline) |
| GitarrenHeinz-Audio | Mikrofon, Tonhöhenerkennung, Bezugston, Nadelzonen; `AUFTRAG_Audio.md` | Modul fertig 14.11.2026 (synthetisch getestet); Handytest steht aus, `docs/HANDYTEST.md` |
| GitarrenHeinz-Design | Anzeige (Nadel, Kopfplatte mit Mechaniken), Stil Braun/früher Apple; `AUFTRAG_Design.md` | Aufgabe 1 (Vorschlag) liegt vor: `docs/design/vorschlag.html` und `.png`, 14.11.2026; Hell angenommen, Nadel links; warme Fassung (`#warm`) liegt zur Auswahl vor, **wartet auf Entscheidung Hell/Warm**, danach Bau von `lib/display.js` und `css/` |

## Module
| Modul | Datei | Stand | Nächster Schritt |
|---|---|---|---|
| Gerüst (Seite, Kern, Einstellungen, i18n) | `index.html`, `lib/core.js`, `lib/app.js`, `i18n/` | fertig, getestet (Container) | – |
| Instrumente (Daten) | `instruments/`, `lib/instruments.js` | fertig: Gitarre klassisch; Format in `docs/SCHNITTSTELLEN.md` | Ukulele später |
| PWA offline | `sw.js`, `manifest.webmanifest`, `version.js` | fertig, im Container getestet (Offline simuliert) | Handytest: installieren, Flugmodus |
| Tonerkennung | `lib/audio.js`, `docs/AUDIO.md` | fertig, im Container getestet (synthetische Signale, Chromium-Fake-Mikrofon) | Handytest nach `docs/HANDYTEST.md`; danach Konstanten nachstellen |
| Anzeige | `lib/display.js`, `css/` | Platzhalter | Strang Design |

## Entscheidungen
- 14.11.2026 (Entwickler): einfacher Gitarrentuner, sechssaitig; später Ukulele und andere Instrumente; HTML-Web-App; Stil Braun/früher Apple; Zielgerät Smartphone/Android; Arbeit über GitHub wie bei den anderen Projekten.
- 14.11.2026 (Entwickler): installierbare Web-App (PWA), gehostet über GitHub Pages (HTTPS), **nicht** über localhost wie bei Heinz UI.
- 14.11.2026 (Entwickler): **absoluter Offline-Betrieb**; keine Online-Abhängigkeit (nur Mikrofon, Frequenzen, Rechnen, HTML); nach der Installation läuft alles ohne Netz.
- 14.11.2026 (Entwickler): Oberfläche mit Umschalter Deutsch/Englisch, wie bei seinen anderen Apps (Verfahren aus AIUIheinz/INCIheinz übernehmen). Die Bibliotheken seiner anderen Projekte dürfen wiederverwendet werden (kopieren, nicht verlinken, damit das Repo eigenständig bleibt); Übernahme ist Sache des Strangs App und gilt als Eingriff ins Fundament.
- 14.11.2026 (Entwickler): Tonerkennung **umschaltbar: Automatik oder manuelle Vorwahl**. Manuell wählt man die Saite durch Antippen der Stimmmechanik auf der Kopfplatte in der Anzeige; jede Mechanik trägt den Buchstaben ihrer Saite (Beschriftung folgt der Sprache: deutsch H, englisch B).
- 14.11.2026 (Entwickler): erste Fassung nur klassische Stimmung E A D G H E (englisch E A D G B E); weitere Stimmungen und Instrumente später (Daten, nicht im Code).

- 14.11.2026 (Entwickler): Bezugston **einstellbar, mit Standardwert** (Standard 440 Hz).
- 14.11.2026 (Entwickler): Bezugston **400–480 Hz, Schritt 1 Hz, Standard 440 Hz**.
- 14.11.2026 (Entwickler): Nadelzonen nach Vorschlag Audio: `0` bis ±5 Cent, `-`/`+` über 5 bis 20 Cent, `--`/`++` über 20 Cent (`Tuner.Audio.zones`, `zone()`).
- 14.11.2026 (Entwickler): Tonhöhenerkennung **YIN**, Fenster 4096, Takt 40 ms, Gate −50 dBFS, Median über 5 Messungen (Vorschlag Audio, umgesetzt; Einzelheiten `docs/AUDIO.md`).
- 14.11.2026 (Entwickler): Anzeige als **Nadel** mit Skala `--  -  0  +  ++` (zu tief bis zu hoch).

## Offen (Entwickler fragen, nicht selbst entscheiden)
- Konstanten der Tonerkennung (YIN-Schwelle, Gate, Anschlag, Median) sind Anfangswerte; nach dem Handytest nachstellen (Strang Audio).
- Gestaltung (Nadel, Kopfplatte mit sechs Mechaniken, Braun/früher Apple): Vorschlag liegt vor (`docs/design/vorschlag.html`), Entscheidung des Entwicklers steht aus (Fragen siehe ENTWICKLUNGSVERLAUF 14.11.2026, Design).

## Nächste Aufgaben
1. ~~Repo anlegen~~ (erledigt 14.11.2026: `PythonHeinz/Gitarrentuner`, Steuerdateien eingecheckt).
2. ~~Aufträge schreiben~~ (erledigt 14.11.2026: `AUFTRAG_App.md`, `AUFTRAG_Audio.md`, `AUFTRAG_Design.md`). Entwickler startet als Erstes den Strang `GitarrenHeinz-App`.
3. Entwickler: Strang `GitarrenHeinz-Audio` und `GitarrenHeinz-Design` starten (parallel möglich); Reihenfolge der Dateien siehe `docs/SCHNITTSTELLEN.md`.
4. Entwickler: Systeminstruktion (Codeblock in `PROJEKTANWEISUNG.md`) ins Claude-Projekt kopieren; GitHub Pages im Repo freischalten (Settings → Pages, Branch `main`); Repo muss dafür öffentlich sein (oder bezahlter Plan).

## Berührt Fundament (Chronik der Eingriffe)
- 14.11.2026, GitarrenHeinz-App: Fundament angelegt (Kern, Instrumentenformat, Speicherschlüssel `gh.*`, Schnittstellen Audio/Display, Service Worker, i18n). Sprachverfahren aus Heinz UI, PWA-Muster aus INCIheinz-app kopiert. Beschreibung: `docs/SCHNITTSTELLEN.md`.
