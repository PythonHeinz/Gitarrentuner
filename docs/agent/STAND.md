# Gitarren Heinz – Stand

Projekt: einfacher Gitarrentuner für sechssaitige Gitarren als HTML-Web-App für Smartphones/Android, Design im Stil von Braun und frühem Apple; später Ukulele und weitere Instrumente. Routine: `UEBERGABE.md`. Projektanweisung: `PROJEKTANWEISUNG.md` (diese Ordner).

Stand: 14.11.2026. Projekt gerade angelegt, noch kein Code. Maßgeblich ist das Repo `PythonHeinz/Gitarrentuner` (Branch `main`); es gibt keine zweite Ablage der Steuerdateien am PC.

## Aktive Arbeit
Jeder Strang trägt vor der ersten Änderung eine Zeile ein (Datum, Strangname, Vorhaben, berührte Dateien), pusht sofort und löscht die Zeile nach dem Push. Zeilen älter als 24 Stunden gelten als verwaist; vor dem Entfernen den Entwickler fragen.
Aktuell:

## Stränge
Strangname gilt, nicht der Titel in der Chat-Liste. Neue Stränge legt nur der Root an. Die Aufteilung ist ein **Vorschlag des Root, der Entwickler entscheidet**; Aufträge sind noch nicht geschrieben.

| Strang | Inhalt | Stand |
|---|---|---|
| GitarrenHeinz (Root) | Konzept, Querprüfung, Register, Aufträge | läuft; Projektordner und Anweisungen angelegt 14.11.2026 |
| GitarrenHeinz-Audio (Vorschlag) | Mikrofon, Tonhöhenerkennung, Glättung, Genauigkeit | nicht gestartet |
| GitarrenHeinz-Design (Vorschlag) | Oberfläche im Stil Braun/früher Apple, Anzeige für Smartphone | nicht gestartet |
| GitarrenHeinz-App (Vorschlag) | Seitenaufbau, Instrumentendaten, Installierbarkeit/Offline, Hosting | nicht gestartet |

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

## Offen (Entwickler fragen, nicht selbst entscheiden)
- Bezugston: fest 440 Hz oder einstellbar?
- Tonhöhenerkennung: Verfahren (Autokorrelation, YIN o. ä.) und Genauigkeitsziel; Vorschlag macht der Strang Audio, Entwickler entscheidet.
- Darstellung der Anzeige (Zeiger/Nadel, Cent-Skala, Kopfplatte mit sechs Mechaniken): Vorschlag Strang Design.

## Nächste Aufgaben
1. ~~Repo anlegen~~ (erledigt 14.11.2026: `PythonHeinz/Gitarrentuner`, Steuerdateien eingecheckt).
2. Root klärt den Bezugston mit dem Entwickler und schreibt die ersten Aufträge (`AUFTRAG_<Strang>.md`).
3. Entwickler: Systeminstruktion (Codeblock in `PROJEKTANWEISUNG.md`) ins Claude-Projekt kopieren; GitHub Pages im Repo freischalten (Settings → Pages, Branch `main`); Repo muss dafür öffentlich sein (oder bezahlter Plan).

## Berührt Fundament (Chronik der Eingriffe)
(noch keine)
