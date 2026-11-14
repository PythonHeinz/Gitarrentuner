# Technik (Tests, Fallstricke)

## Tests
`tests/run_all.sh` startet einen lokalen Server und führt `tests/test_app.py` (Playwright, Chromium) aus; außerdem `tests/check_files.py` (ohne Browser). Aufruf aus dem Repo-Wurzelordner: `bash tests/run_all.sh`.
Voraussetzungen im Container: Python `playwright`, Chrome unter `/usr/bin/google-chrome` (wird über `executable_path` genutzt).

Geprüft: Seite lädt ohne Konsolenfehler, Sprachwechsel DE/EN (inkl. H/B), Einstellungen bleiben nach Neuladen, Bezugston und Modus, Instrumentendaten gültig (Frequenzen bei 440 Hz), Schnittstelle Audio/Display über das Ereignissystem (mit Platzhaltern), `SHELL` entspricht dem Dateibaum, i18n-Dateien haben gleiche Schlüssel, Service Worker cached alles, Neuladen ohne Netz funktioniert, nach Installation keine Netzanfrage außerhalb des eigenen Ursprungs.

## Fallstricke
- **Cache-Version:** Nach jeder Änderung an App-Dateien `version.js` erhöhen. Sonst liefert der Service Worker die alte Fassung (Cache-first).
- **SHELL pflegen:** Neue Datei nicht in `SHELL` = fehlt offline. `tests/check_files.py` schlägt dann fehl.
- **Mikrofon braucht HTTPS** (oder localhost). GitHub Pages liefert HTTPS; `file://` funktioniert nicht (fetch der JSON-Dateien und Service Worker).
- **Kein Mikrofon im Container:** Tonerkennung nur mit synthetischen Signalen testbar (Strang Audio). Installation und Offlinebetrieb auf dem Handy prüft der Entwickler.
- Git-Tags lassen sich aus dem Container nicht pushen (Sicherung als Branch `sicherung/<name>`).
