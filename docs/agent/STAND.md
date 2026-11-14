# Gitarren Heinz – Stand

Projekt: einfacher Gitarrentuner für sechssaitige Gitarren als HTML-Web-App für Smartphones/Android, Design im Stil von Braun und frühem Apple; später Ukulele und weitere Instrumente. Routine: `UEBERGABE.md`. Projektanweisung: `PROJEKTANWEISUNG.md` (diese Ordner).

Stand: 14.11.2026. Projekt gerade angelegt, noch kein Code. Maßgeblich ist das Repo `PythonHeinz/Gitarrentuner` (Branch `main`); es gibt keine zweite Ablage der Steuerdateien am PC.

## Aktive Arbeit
Jeder Strang trägt vor der ersten Änderung eine Zeile ein (Datum, Strangname, Vorhaben, berührte Dateien), pusht sofort und löscht die Zeile nach dem Push. Zeilen älter als 24 Stunden gelten als verwaist; vor dem Entfernen den Entwickler fragen.
Aktuell:
- 14.11.2026, GitarrenHeinz-App: Schritt 1 Gerüst (index.html, lib/, instruments/, i18n/, sw.js, manifest, tests/, docs/SCHNITTSTELLEN.md, docs/agent/TECHNIK.md)

## Stränge
Strangname gilt, nicht der Titel in der Chat-Liste. Neue Stränge legt nur der Root an. Reihenfolge: App zuerst (Fundament), danach Audio und Design parallel (verschiedene Dateien).

| Strang | Inhalt | Stand |
|---|---|---|
| GitarrenHeinz (Root) | Konzept, Querprüfung, Register, Aufträge | läuft; Projektordner und Anweisungen angelegt 14.11.2026 |
| GitarrenHeinz-App | Grundgerüst, Fundament, Instrumentendaten, Sprache DE/EN, PWA offline, Hosting; `AUFTRAG_App.md` | Auftrag geschrieben, **startet zuerst**, nicht gestartet |
| GitarrenHeinz-Audio | Mikrofon, Tonhöhenerkennung, Bezugston, Nadelzonen; `AUFTRAG_Audio.md` | Auftrag geschrieben, startet nach App Schritt 1 |
| GitarrenHeinz-Design | Anzeige (Nadel, Kopfplatte mit Mechaniken), Stil Braun/früher Apple; `AUFTRAG_Design.md` | Auftrag geschrieben, startet nach App Schritt 1, parallel zu Audio |

## Module
| Modul | Datei | Stand | Nächster Schritt |
|---|---|---|---|
| Tuner | – | nicht begonnen | Konzept im Root klären |
| Instrumente (Daten) | – | nicht begonnen | Format festlegen (Gitarre zuerst, Ukulele später) |

## Entscheidungen
- 14.11.2026 (Entwickler): einfacher Gitarrentuner, sechssaitig; später Ukulele und andere Instrumente; HTML-Web-App; Stil Braun/früher Apple; Zielgerät Smartphone/Android; Arbeit über GitHub wie bei den anderen Projekten.
- 14.11.2026 (Entwickler): installierbare Web-App (PWA), gehostet über GitHub Pages (HTTPS), **nicht** über localhost wie bei Heinz UI.
- 14.11.2026 (Entwickler): **absoluter Offline-Betrieb**; keine Online-Abhängigkeit (nur Mikrofon, Frequenzen, Rechnen, HTML); nach der Installation läuft alles ohne Netz.
- 14.11.2026 (Entwickler): Oberfläche mit Umschalter Deutsch/Englisch, wie bei seinen anderen Apps (Verfahren aus AIUIheinz/INCIheinz übernehmen). Die Bibliotheken seiner anderen Projekte dürfen wiederverwendet werden (kopieren, nicht verlinken, damit das Repo eigenständig bleibt); Übernahme ist Sache des Strangs App und gilt als Eingriff ins Fundament.
- 14.11.2026 (Entwickler): Tonerkennung **umschaltbar: Automatik oder manuelle Vorwahl**. Manuell wählt man die Saite durch Antippen der Stimmmechanik auf der Kopfplatte in der Anzeige; jede Mechanik trägt den Buchstaben ihrer Saite (Beschriftung folgt der Sprache: deutsch H, englisch B).
- 14.11.2026 (Entwickler): erste Fassung nur klassische Stimmung E A D G H E (englisch E A D G B E); weitere Stimmungen und Instrumente später (Daten, nicht im Code).

- 14.11.2026 (Entwickler): Bezugston **einstellbar, mit Standardwert** (Standard 440 Hz; Bereich und Schrittweite schlägt der Strang Audio vor).
- 14.11.2026 (Entwickler): Anzeige als **Nadel** mit Skala `--  -  0  +  ++` (zu tief bis zu hoch; Schwellen in Cent schlägt der Strang Audio vor, Entwickler entscheidet).

## Offen (Entwickler fragen, nicht selbst entscheiden)
- Tonhöhenerkennung: Verfahren (Autokorrelation, YIN o. ä.) und Genauigkeitsziel; Vorschlag macht der Strang Audio, Entwickler entscheidet.
- Schwellen der Nadelzonen (`--`, `-`, `0`, `+`, `++`) in Cent und Bereich des Bezugstons: Vorschlag Strang Audio.
- Gestaltung (Nadel, Kopfplatte mit sechs Mechaniken, Braun/früher Apple): Vorschlag Strang Design.

## Nächste Aufgaben
1. ~~Repo anlegen~~ (erledigt 14.11.2026: `PythonHeinz/Gitarrentuner`, Steuerdateien eingecheckt).
2. ~~Aufträge schreiben~~ (erledigt 14.11.2026: `AUFTRAG_App.md`, `AUFTRAG_Audio.md`, `AUFTRAG_Design.md`). Entwickler startet als Erstes den Strang `GitarrenHeinz-App`.
3. Entwickler: Systeminstruktion (Codeblock in `PROJEKTANWEISUNG.md`) ins Claude-Projekt kopieren; GitHub Pages im Repo freischalten (Settings → Pages, Branch `main`); Repo muss dafür öffentlich sein (oder bezahlter Plan).

## Berührt Fundament (Chronik der Eingriffe)
(noch keine)
