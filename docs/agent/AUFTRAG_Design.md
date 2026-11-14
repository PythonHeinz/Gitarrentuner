# AUFTRAG Design (Strang GitarrenHeinz-Design)

Angelegt 14.11.2026 im Root. Startet, wenn der Strang App Schritt 1 gepusht hat; läuft parallel zu Audio (andere Dateien: Anzeige, Stile).

## Ziel
Die Oberfläche des Tuners im Stil von Braun und frühem Apple: ruhig, funktional, wenige Elemente, gut ablesbar auf dem Smartphone (Pixel 9 Pro, Hochformat, rund 426 × 803 px).

## Entscheidungen (Entwickler, siehe `STAND.md`)
- Anzeige als **Nadel** mit Skala `--  -  0  +  ++`.
- **Kopfplatte mit sechs Stimmmechaniken**; jede Mechanik trägt den Buchstaben ihrer Saite (deutsch E A D G H E, englisch E A D G B E, folgt dem Sprachschalter). Antippen einer Mechanik wählt die Saite **manuell** vor; ein Umschalter wechselt zwischen **Automatik** und **Manuell**.
- Bezugston einstellbar (Standardwert 440 Hz): Bedienelement für die Einstellung gehört in die Gestaltung.
- Sprache DE/EN per Umschalter; alle Texte aus den Sprachdateien des Strangs App.
- Vollständig offline: keine externen Schriften, Bilder oder Skripte.

## Aufgaben
1. **Vorschlag vorlegen (vor dem Bau):** Skizze als HTML-Seite oder Bild (Hauptansicht mit Nadel und Kopfplatte, Zustände: keine Eingabe, zu tief, zu hoch, gestimmt), Farben, Schrift (systemeigene oder mitgelieferte Schrift), Verhalten der Nadel (Trägheit, Rastung bei `0`), Rückmeldung bei „gestimmt“ (Farbe, kein Ton nötig). Der Entwickler entscheidet.
2. **Bausteine:** Nadelanzeige, Kopfplatte mit sechs Mechaniken, Umschalter Automatik/Manuell, Einstellungsblatt (Sprache, Bezugston), Hinweise (Mikrofon nicht erlaubt, zu leise). Bausteine mit Beispiel dokumentieren (`docs/DESIGN.md`).
3. **Bedienbarkeit:** große Tippflächen (mindestens 48 px), gut lesbar auch im Hellen und für ältere Nutzer, Hell/Dunkel nur wenn der Entwickler es will (zuerst fragen).
4. **Anbindung:** Anzeige liest Frequenz und Cent-Abweichung über die Schnittstelle aus `docs/SCHNITTSTELLEN.md`; bis Audio fertig ist, mit einem Testgenerator (Schieberegler oder Demo-Modus) betreibbar.
5. **Tests:** Playwright-Bildschirmfotos der Zustände auf 426 × 803 px; Sprachwechsel; Antippen jeder Mechanik.

## Grenzen
- Berührt Anzeige, Stile und Bausteine; Gerüst, Instrumentendaten, Einstellungen und Service Worker gehören zum Strang App, Tonerkennung zum Strang Audio. Änderungen dort erst nach Rücksprache.
- Nichts als am Gerät geprüft melden, was nur im Container-Browser lief.
