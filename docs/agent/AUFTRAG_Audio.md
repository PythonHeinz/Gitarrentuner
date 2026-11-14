# AUFTRAG Audio (Strang GitarrenHeinz-Audio)

Angelegt 14.11.2026 im Root. Startet, wenn der Strang App Schritt 1 (Gerüst und Schnittstelle) gepusht hat.

## Ziel
Mikrofon einlesen, Grundfrequenz einer gezupften Gitarrensaite zuverlässig bestimmen, Abweichung in Cent zur Zielsaite liefern; alles offline im Browser.

## Entscheidungen (Entwickler, siehe `STAND.md`)
- Tonerkennung **umschaltbar**: Automatik (nächste Saite des Instruments wird erkannt) oder manuelle Vorwahl (Saite kommt von der Anzeige, Abweichung wird zu dieser Saite gemessen).
- Bezugston **einstellbar mit Standardwert** (Standard 440 Hz).
- Anzeige der Abweichung als Nadel mit fünf Zonen `--  -  0  +  ++`.
- Keine Online-Dienste, keine externen Bibliotheken ohne Rücksprache (bevorzugt eigener Code in `lib/audio/`, ES-Module).

## Aufgaben
1. **Vorschlag vorlegen (vor dem Bau, 5 bis 10 Sätze):** Verfahren der Tonhöhenerkennung (zum Beispiel YIN oder Autokorrelation mit Glättung), Fenstergröße und Abtastrate, Umgang mit Obertönen und dem Anschlag, Bereich und Schrittweite des Bezugstons (Vorschlag etwa 430 bis 450 Hz), **Schwellen der fünf Nadelzonen in Cent** (Vorschlag: `0` etwa ±5 Cent). Der Entwickler entscheidet.
2. **Mikrofonzugriff:** Berechtigung, Fehlerfälle (abgelehnt, kein Mikrofon, Tab im Hintergrund), Freigeben des Mikrofons beim Verlassen. Rauschunterdrückung, Echounterdrückung und automatische Verstärkung des Browsers abschalten, wo möglich.
3. **Erkennung:** Frequenz → Note → Cent-Abweichung; Mindestlautstärke (Gate), Stabilisierung gegen Springen, Ausgabe etwa 20 bis 30 Mal pro Sekunde über die Schnittstelle aus `docs/SCHNITTSTELLEN.md`.
4. **Modi:** Automatik und manuell, Bezugston ändert alle Sollfrequenzen (Daten aus dem Instrumentenformat, nicht fest im Code).
5. **Tests im Container:** synthetische Signale (Sinus, Sinus mit Obertönen, Rauschen, leise Signale, Verstimmung ±50 Cent, Bezugston 435/440/445) gegen die Erkennung; Genauigkeitswerte in `docs/` festhalten. Echte Gitarre und Mikrofon testet der Entwickler am Handy: Handytest-Liste in `docs/HANDYTEST.md` anlegen.

## Grenzen
- Berührt nur `lib/audio/` und eigene Tests. Schnittstelle, Instrumentendaten und Einstellungen gehören zum Strang App; Änderungen dort erst nach Rücksprache.
- Nie behaupten, die Erkennung sei mit echter Gitarre getestet, wenn nur synthetische Signale liefen.
