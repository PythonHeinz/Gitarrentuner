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
- 14.11.2026 (Entwickler): als installierbare Web-App (PWA), gehostet über GitHub Pages (HTTPS), **nicht** über localhost wie bei Heinz UI.

## Offen (Entwickler fragen, nicht selbst entscheiden)
- Sprache der Oberfläche (nur Deutsch, oder Englisch mit Umschalter wie bei AIUIheinz).
- Offline-Betrieb (Service Worker, App nach der Installation ohne Netz nutzbar?).
- Tonerkennung: reine Browser-Technik oder Bibliothek; Bezugston (Standard 440 Hz, einstellbar?); Automatik oder manuelle Saitenwahl.
- Welche Instrumente und Stimmungen in der ersten Fassung (nur Standardstimmung oder auch alternative Stimmungen).

## Nächste Aufgaben
1. ~~Repo anlegen~~ (erledigt 14.11.2026: `PythonHeinz/Gitarrentuner`, Steuerdateien eingecheckt).
2. Root klärt die offenen Entscheidungen oben mit dem Entwickler und schreibt die ersten Aufträge (`AUFTRAG_<Strang>.md`).
3. Entwickler: Systeminstruktion (Codeblock in `PROJEKTANWEISUNG.md`) ins Claude-Projekt kopieren; GitHub Pages im Repo freischalten (Settings → Pages, Branch `main`); Repo muss dafür öffentlich sein (oder bezahlter Plan).

## Berührt Fundament (Chronik der Eingriffe)
(noch keine)
