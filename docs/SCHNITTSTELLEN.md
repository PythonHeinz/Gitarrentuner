# Schnittstellen (Fundament, Strang App)

Stand: 14.11.2026, Version 0.1.0. Änderungen am Fundament nur über den Strang App und mit Eintrag in `docs/agent/STAND.md` (Berührt Fundament). Alle Module hängen am globalen Objekt `window.Tuner`. Skriptreihenfolge in `index.html`: `version.js`, `lib/core.js`, `lib/instruments.js`, `lib/audio.js`, `lib/display.js`, `lib/app.js`.

## Dateiverteilung
| Datei | Besitzer |
|---|---|
| `lib/core.js`, `lib/instruments.js`, `lib/app.js`, `sw.js`, `version.js`, `manifest.webmanifest`, `index.html` (Gerüst), `i18n/`, `instruments/` | Strang App |
| `lib/audio.js` (Platzhalter) | Strang Audio |
| `lib/display.js` (Platzhalter), `css/base.css` (Stil, Platzhalterblock am Ende), `icons/` | Strang Design |

Neue Dateien eines Strangs müssen in `SHELL` in `sw.js` eingetragen werden (Test schlägt sonst fehl) und `version.js` erhöhen. Da `sw.js` und `version.js` dem Strang App gehören: Eintrag in `SHELL` und Versionserhöhung sind für alle Stränge erlaubt, sonst keine Änderung dort. Neue Texte in `i18n/de.json` und `i18n/en.json` (beide Dateien, gleiche Schlüssel; Test prüft das).

## Instrumentenformat (`instruments/<id>.json`)
```json
{
  "id": "gitarre-klassisch",
  "name": { "de": "…", "en": "…" },
  "referenceNote": "A4",
  "strings": [ { "id": "e2", "note": "E2", "semitones": -29, "label": { "de": "E", "en": "E" } } ],
  "headstock": { "layout": "3+3", "left": ["d3","a2","e2"], "right": ["g3","b3","e4"] }
}
```
- `strings`: Reihenfolge tief nach hoch. `semitones` = Halbtonabstand zu A4 (Bezugston). Frequenz = `refHz * 2^(semitones/12)`; keine festen Hertzwerte in den Daten. `label` folgt der Sprache (H/B).
- `headstock` (optional): Anordnung der Mechaniken für die Anzeige. `left` und `right` von der Spitze der Kopfplatte nach unten. Jede Saite genau einmal.
- `instruments/index.json`: `{ "default": id, "instruments": [id, …] }`. Ein Instrument hinzufügen = Datei anlegen, in `index.json` eintragen, in `SHELL` ergänzen.
- `Tuner.Instruments.validate(inst)` liefert Fehlerliste; `resolve(inst, refHz)` liefert Saiten mit `freq`; `label(string)` die Beschriftung in der aktuellen Sprache.

## Aufgelöstes Instrument (an Anzeige)
`{ id, name:{de,en}, strings:[{ id, note, semitones, label:{de,en}, freq }], headstock|null }`. `freq` gilt für den aktuellen Bezugston.

## Ereignisse (`Tuner.bus.on(name, fn)` / `emit`)
| Ereignis | Sender | Daten |
|---|---|---|
| `reading` | Audio | `{ freq: Hz\|null, cents: Zahl\|null, note: "A2"\|null, stringId: id\|null, level: 0..1 }` – `stringId` ist die Zielsaite (Automatik: nächste Saite; Manuell: gewählte), `cents` die Abweichung von deren Sollfrequenz (positiv = zu hoch). `freq: null` = kein Ton erkannt. Rate frei (Vorschlag ≤ 30/s). |
| `audio-state` | Audio | `{ running: bool, error: null\|'NotAllowedError'\|'NotFoundError' }` |
| `string-select` | Anzeige | `{ id }` – Antippen einer Mechanik; nur im Modus `manual` wirksam. |
| `lang` | Kern | neue Sprache `'de'\|'en'` |

## Audio (`Tuner.Audio`, `lib/audio.js`)
- `configure({ refHz, mode, strings:[{id,note,freq}], targetId })`: wird bei jeder Änderung von Bezugston, Modus, Instrument oder Zielsaite aufgerufen. `targetId` ist nur im Modus `manual` gesetzt (sonst `null`).
- `start(): Promise` (Mikrofon öffnen; Ablehnung mit `Error.name` `NotAllowedError` oder `NotFoundError`), `stop()`, `isRunning()`.
- Sendet `reading` und `audio-state`. Der Platzhalter hat `isPlaceholder: true`; die echte Implementierung lässt das Feld weg.
- Erwartet: kein Netz, kein Laden externer Skripte. Mikrofon nur nach Start, Strom nach `stop()` vollständig freigeben.

## Display (`Tuner.Display`, `lib/display.js`)
- `mount(el)`: Container `#display`. Zeichnet nur dort hinein.
- `setInstrument(resolved)`, `setMode('auto'|'manual')`, `setSelected(id|null)`, `update(reading)`, `setRunning(bool)`, `relabel()` (nach Sprachwechsel; Beschriftungen mit `Tuner.Instruments.label(s)` und `Tuner.t(key)`).
- Sendet `string-select`. Im Modus `auto` sind die Mechaniken nicht antippbar.
- Texte nur über `Tuner.t('…')`, Schlüssel in `i18n/*.json` ergänzen.
- Ergänzungen (Strang Design): `setTheme('warm'|'hell')`, `getTheme()`; setzt `data-theme` am `<html>`, `data-running` zeigt den Laufzustand. Ein `reading` mit `freq: null` hält die Anzeige 1,2 s, dann Ruhelage. Seite mit `?demo=1` startet einen Testgenerator. Einzelheiten: `docs/DESIGN.md`.

## Kern (`lib/core.js`)
`Tuner.t(key, vars)`, `Tuner.pick({de,en})`, `Tuner.esc(s)`, `Tuner.lang`, `Tuner.setLang(l)`, `Tuner.store.get/set`, `Tuner.config` (Bezugston vorläufig 400–480 Hz, Standard 440, Schritt 1; Vorschlag des Strangs Audio steht aus), `Tuner.version`, `Tuner.ready` (Promise, `document.body[data-ready]` nach dem Start).

## Gespeicherte Einstellungen (`localStorage`, Präfix `gh.`, Werte als JSON)
| Schlüssel | Werte | Standard |
|---|---|---|
| `gh.lang` | `"de"` \| `"en"` | Browsersprache (de wenn sie mit „de“ beginnt, sonst en) |
| `gh.refHz` | ganze Zahl in `Tuner.config.refHz` | 440 |
| `gh.mode` | `"auto"` \| `"manual"` | `"auto"` |
| `gh.theme` | `"warm"` \| `"hell"` | `"warm"` (setzt und liest das Display) |
| `gh.instrument` | Instrument-Id aus `instruments/index.json` | `default` der Indexdatei |

Neue Schlüssel nur mit Eintrag hier.

## Offline und Hosting
- Alle Pfade relativ (`./`), `start_url` und `scope` `./`: läuft unter `https://<nutzer>.github.io/Gitarrentuner/` und lokal unter beliebigem Pfad.
- `sw.js`: Vorab-Cache aller Dateien aus `SHELL`, danach nur Cache. Cachename `gitarrenheinz-<GH_VERSION>`; alte Caches werden beim Aktivieren gelöscht; neue Version lädt die Seite einmal neu.
- Keine externen Schriften, Skripte, Bilder.
