# Gestaltung der Anzeige (Strang Design)

Stand: 17.11.2026. Dateien: `lib/display.js` (Anzeige), `css/base.css` (Stil, beide Themen), `fonts/` (Rackschrift), `img/walnut-panel.jpg` (Foto). Schnittstelle: `docs/SCHNITTSTELLEN.md`, Abschnitt „Display“. Vorschlag und Skizzen: `docs/design/` (`vorschlag.html`, `#warm` für die warme Fassung). Fotos der App: `docs/design/app-warm.png`, `app-hell.png`.

## Entscheidungen (Entwickler, 14. und 17.11.2026)
- Stil Braun/früher Apple, Nadel in Ruhelage am **linken Anschlag**, Skala `-- − 0 + ++`.
- **Warm** (Nussbaum-Foto, gelb leuchtende VU-Skala) ist der Standard; **Hell** bleibt als zweites Thema. Beide mit **Rackschrift** und **LED**.
- LED mittig unter dem Skalenfenster: **rot** = außerhalb des Zielbereichs (über 20 Cent), **gelb** = im Zielbereich (über 5 bis 20 Cent), **grün** = gestimmt (bis 5 Cent), **aus** = kein Ton. Die Schwellen kommen aus `Tuner.Audio.zones` (Strang Audio), nicht aus dem Design. Zusätzlich immer Text („Zu tief“, „Zu hoch“, „Gestimmt“) und markierte Skalenzone, nie nur Farbe.

## Bausteine
| Baustein | Wo | Hinweis |
|---|---|---|
| Skalenfenster | `.dial`, `.glass`, SVG `.scale` | ±50 Cent = ±62°; Bänder rot/bernstein/grün; Nadel als Feder-Dämpfer mit leichtem Überschwingen |
| LED | `.led[data-led]` | Werte `off`, `red`, `yellow`, `green` |
| Messwerte | `.readout` (`.big`, `.small`, `.state`) | große Saitenbuchstabe (H/B folgt der Sprache), Note, Hz (deutsch Komma), Cent mit Vorzeichen |
| Kopfplatte | `.head`, SVG mit `.peg` | Anordnung aus `instrument.headstock` (links/rechts, beliebig viele Saiten je Seite); Tippfläche 70 px Durchmesser, sichtbarer Knopf rund 48 px |
| Mechanik-Zustände | `.peg.sel` (Manuell gewählt), `.peg.target` (Automatik erkannt), `.peg.off` (Automatik, nicht antippbar) | auch per Tastatur (Enter, Leertaste) |
| Designtaste | `.themekey` (im Messwertbereich) | wechselt Holz/Hell, speichert `gh.theme` |
| Steuerelemente | Stile für `.seg`, `.stepper`, `button.primary`, `.lang`, `select` in `css/base.css` | HTML liegt beim Strang App (`index.html`), nur Stile hier |
| Statuszeile | `#status` | nur Fehler sichtbar; sonst nur für Screenreader (Messwerte stehen in der Anzeige) |

## Themen und Variablen
Thema über `data-theme` (`warm` | `hell`) am `<html>`; Laufzustand über `data-running` (`0` | `1`, vom Display gesetzt, färbt den Startknopf). Alle Farben stehen als Variablen am Anfang von `css/base.css` (`:root` = warm, `:root[data-theme="hell"]` überschreibt). Ein neues Thema = neuer Variablenblock plus Eintrag in `THEMES` und `THEME_COLOR` in `lib/display.js`.

## Schrift und Bild (Quellen)
- Archivo Narrow 600 und 700 (SIL OFL 1.1), Lizenztext `fonts/LICENSE-ArchivoNarrow.txt`; Quelle npm-Paket `@fontsource/archivo-narrow`. Bei Fallback greifen Arial Narrow, Roboto Condensed und die Systemschrift.
- `img/walnut-panel.jpg`: Poly Haven „Walnut Veneer“, CC0; Bearbeitung und Herkunft in `docs/design/QUELLE-BILDER.md`.

## Entwicklungshilfe
Seite mit `?demo=1` öffnen: Regler für Cent und Saite sowie „Ton aus“ am unteren Rand, ohne Mikrofon.

## Tests
`tests/test_design.py` (in `bash tests/run_all.sh`): Zustände, LED-Farben und Schwellen, Nadelwinkel, Mechaniken (alle sechs, Tastatur), Sprache (H/B, Dezimalzeichen), Themenwechsel, Größen (Tippflächen, kein Überlauf auf 426 × 803 px), Rackschrift geladen. Bildschirmfotos landen in `tests/out/` (nicht im Repo). Alles nur im Container-Chromium.

## Handytest (Entwickler)
Lesbarkeit der Skala im Hellen und im Dunkeln; Nadelverhalten bei echter Saite (Trägheit angenehm? Standzeit nach Tonende 1,2 s); Treffsicherheit beim Antippen der Mechaniken mit dem Daumen; LED-Helligkeit; Schriftdarstellung (Rackschrift geladen?); Erscheinungsbild von Holz und Hell am Pixel 9 Pro.
