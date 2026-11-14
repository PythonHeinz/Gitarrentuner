# Tonerkennung (Strang Audio)

Stand: 14.11.2026. Datei: `lib/audio.js` (eine Datei; Rechenteil und Browserteil getrennt, Rechenteil unter Node testbar). Schnittstelle: `docs/SCHNITTSTELLEN.md`, Abschnitt „Audio“. Keine externen Bibliotheken, kein Netz.

## Verfahren
- **YIN** (Differenzfunktion, kumulierte Mittelwertnormierung, erste Senke unter Schwelle 0,15, parabolische Interpolation). Liefert die Grundfrequenz auch dann, wenn der zweite Oberton stärker ist als der Grundton.
- **Fenster** 4096 Samples (ca. 85 ms bei 48 kHz, 93 ms bei 44,1 kHz), Auswertung alle 40 ms (ca. 25 `reading` pro Sekunde), native Abtastrate des Geräts.
- **Suchbereich:** Automatik: tiefste Saite −3 Halbtöne bis höchste Saite +3 Halbtöne. Manuell: gewählte Saite ±2 Halbtöne (ein anderer Ton als die gewählte Saite liefert `freq: null`, keine falsche Zahl).
- **Gate:** RMS unter −50 dBFS gilt als kein Ton. **Anschlag:** die ersten 3 Auswertungen nach Öffnen des Gates (ca. 120 ms) werden verworfen. **Stabilisierung:** Median über die letzten 5 Messungen, mindestens 3 gültige, sonst `freq: null` (das ergibt zugleich eine Haltezeit von ca. 200 ms beim Ausklingen).
- **Automatik:** Zielsaite = nächste Saite nach Abstand in Cent. **Manuell:** `targetId` aus `configure`; ohne Auswahl nur `freq`, `cents` und `stringId` sind `null`.
- **Cent** = 1200 · log2(f / Sollfrequenz der Zielsaite), positiv = zu hoch. Sollfrequenzen kommen aus `configure` (Instrumentendaten, Bezugston).
- **Mikrofon:** `getUserMedia` mit `echoCancellation`, `noiseSuppression`, `autoGainControl` = false, ein Kanal. `AnalyserNode` liefert die Fenster (Taktgeber `setInterval`). `stop()` beendet alle Tracks und schließt den AudioContext; ein Abschluss-`reading` ohne Ton wird gesendet. Tab im Hintergrund oder `pagehide`: automatisch `stop()`.
- **Fehler:** `NotAllowedError` (abgelehnt, auch `SecurityError`), `NotFoundError` (kein Mikrofon, nicht lesbar, API fehlt). Ablehnung des Promises und Ereignis `audio-state` mit `error`.

## Entscheidungen (Entwickler, 14.11.2026)
- Bezugston **400–480 Hz, Schritt 1 Hz, Standard 440 Hz** (wie in `Tuner.config`).
- **Nadelzonen** (Betrag der Abweichung): `0` bis 5 Cent, `-`/`+` über 5 bis 20 Cent, `--`/`++` über 20 Cent.

## Konstanten und Hilfen
`Tuner.Audio.params` (Fenster, Takt, Schwellen), `Tuner.Audio.zones` (`{ ok: 5, near: 20 }`), `Tuner.Audio.zone(cents)` liefert `'--'`, `'-'`, `'0'`, `'+'`, `'++'` oder `null`. Die Anzeige kann `zone()` nutzen, damit die Schwellen nur an einer Stelle stehen. Das ist eine Ergänzung der Audio-Schnittstelle; der Strang Design entscheidet, ob er sie nutzt.

## Genauigkeit (nur synthetische Signale)
Tests: `node tests/test_audio.js` (Rechenteil) und `tests/test_audio_browser.py` (Mikrofonpfad mit Chromium-Fake-Mikrofon, WAV-Datei als Eingang). Alles über `bash tests/run_all.sh`.

| Prüfung | Ergebnis |
|---|---|
| 6 Saiten × Verstimmung −50/−20/0/+20/+50 Cent, Obertonreihe, Abtastrate 44,1 und 48 kHz, Bezugston 435/440/445 Hz, Automatik | größte Abweichung ca. 0,05 Cent, richtige Saite in allen Fällen |
| schwacher Grundton (zweiter Oberton stärker), drei tiefste Saiten | kein Oktavfehler, Abweichung ca. 0,03 Cent |
| manuell, G +30 Cent | 30,01 Cent |
| Signal mit Rauschen (ca. 20 dB Abstand), A2 +10 Cent | Abweichung ca. 2,4 Cent |
| leises Signal (−40 dBFS Spitze) | erkannt; −62 dBFS bleibt unter dem Gate |
| Stille und weißes Rauschen (3 Pegel, 108 Messungen) | keine falschen Töne |
| Anschlagsgeräusch, Abklingen | keine Ausgabe in den ersten ca. 120 ms, danach stabil; nach Ende des Tons wieder Stille |
| Rechenzeit je Auswertung (Node, Container-CPU, tiefste Saite) | ca. 1,7 ms bei 40 ms Takt |

Die Werte sagen nichts über echte Gitarrensaiten (Inharmonizität, Ausklingen, Raumgeräusch), Handymikrofone und Gerätelatenz. Das prüft der Entwickler nach `docs/HANDYTEST.md`.

## Offen
- Schwelle YIN (0,15), Gate (−50 dBFS), Anschlag (3 Auswertungen), Median (5) sind Anfangswerte aus synthetischen Tests. Nach dem Handytest nachstellen; Werte in `lib/audio.js` (`P`) und hier eintragen.
- `Tuner.config.refHz` trägt im Kern noch den Kommentar „vorläufig“; Werte sind jetzt entschieden (Strang App kann den Kommentar anpassen).
