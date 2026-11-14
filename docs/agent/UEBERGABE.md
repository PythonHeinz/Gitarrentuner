# Gitarren Heinz – Übergabe für Stränge (Start, Routine, Sicherung)

Gilt für jeden Strang (Root, Entwicklungsstränge, Korrektur-Stränge). Vorbild ist der Ablauf von AIUIheinz (Stand 12.11.2026). Der Stand steht in `STAND.md`, die Projektanweisung des Claude-Projekts in `PROJEKTANWEISUNG.md` (beide in `docs/agent/`).

## Rollen
- **Root (Chat „GitarrenHeinz“):** Konzept, Querprüfung, Aufträge schreiben, Register der Stränge pflegen, Stand auf Wunsch in `INDEX.md` am PC schreiben. Der Entwickler meldet dort „Modul X fertig“.
- **Entwicklungsstrang (Chat „GitarrenHeinz-<Strang>“):** baut genau sein Modul nach `docs/agent/AUFTRAG_<Strang>.md`. Fremde Module und das Fundament nur nach Rücksprache.
- **Korrektur-Strang („GitarrenHeinz-Fix-<Thema>“):** behebt nur das gemeldete Problem, ergänzt `ENTWICKLUNGSVERLAUF.md`, ändert keine Struktur.

## Start (jeder Strang)
1. Repo `PythonHeinz/Gitarrentuner` mit `add_repo` (Zugriff „push“) anhängen und klonen. Die Desktop-Verbindung zum PC ist nur nötig, wenn der Entwickler Dateien am PC will (zum Beispiel einen Stand in `INDEX.md`).
2. Lesen: `docs/agent/STAND.md` (Aktive Arbeit, Stränge, Module, Entscheidungen, Nächste Aufgaben), die letzten Abschnitte von `ENTWICKLUNGSVERLAUF.md`, diese Datei, `BEGRIFFE.md`, den eigenen `AUFTRAG_<Strang>.md`.
3. `git pull --rebase` und `git log`.
4. Entwickler fragen: „Welchen Strang bearbeite ich, und was ist beim Test auf dem Handy aufgefallen?“

## Routine (jede Änderung)
1. **Vor der ersten Änderung:** `git pull --rebase`; „Aktive Arbeit“ in `STAND.md` lesen. Steht dort eine Zeile eines anderen Strangs unter 24 Stunden oder wird ein fremdes Modul oder das Fundament berührt: den Entwickler fragen.
2. **Eigene Zeile eintragen und sofort pushen** (Datum, Strangname, Vorhaben, berührte Dateien).
3. Arbeiten. Neue Funktionen bekommen Tests; vor jedem Push alle Tests grün.
4. **Abschluss (Sicherung des Stands):** `git pull --rebase`, dann `ENTWICKLUNGSVERLAUF.md` (was, Dateien, Tests, was offen), `STAND.md` (Stand je Modul, eigene Zeile unter „Aktive Arbeit“ entfernen, Stränge und Nächste Aufgaben anpassen), bei neuen Fallstricken `TECHNIK.md` anlegen oder ergänzen; nach `main` pushen.
5. Dem Entwickler sagen, was er auf dem Handy prüfen soll und was nur simuliert getestet ist.

## Sicherung
- GitHub (`main`) ist maßgeblich. Ein Strang gilt erst als gesichert, wenn gepusht und `STAND.md` aktualisiert ist.
- Konflikte in `STAND.md` nie überschreiben, beide Stände behalten.
- Sicherungspunkte vor großen Umbauten als Branch: `git push origin <commit>:refs/heads/sicherung/<name>` (Git-Tags lassen sich aus dem Container nicht pushen).
- Der erste Klon ist flach (`--depth 1`); vor dem Push `git fetch origin main`.
- Am PC: Klon `repo\` nur lesen, per `git pull` aktualisieren. Wer dort Git benutzt, braucht einmal die Löschfreigabe für den Ordner (`device_request_delete_permission`), sonst bleiben Sperrdateien in `.git` liegen.
- Kein Schreiben von Steuerdateien in den PC-Ordner, sobald das Repo existiert.

## Arbeitsweise
- Genau ein Strang baut zur selben Zeit, wenn nichts anderes vereinbart ist.
- Das Fundament (gemeinsamer Code, Datenformat der Instrumente, gemeinsame Speicherschlüssel, Designbausteine) ändert nur ein Strang zur Zeit; Eingriffe stehen in `STAND.md` unter „Berührt Fundament“.
- Vor jedem Umbau in kurzen Sätzen sagen, was geplant ist.
- Nie behaupten, etwas sei auf dem Gerät getestet, was nur simuliert lief (Mikrofon und Tonerkennung im Container nur mit synthetischen Signalen).
- Alles Nötige liegt im Repo; keine Pfade mit Benutzernamen in Dateien (`%USERPROFILE%\Toolsbyclaude`).
- Antworten sachlich und knapp, ohne Lob.
