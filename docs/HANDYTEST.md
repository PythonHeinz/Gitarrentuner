# Handytest Tonerkennung (Entwickler, Pixel)

Voraussetzung: Seite über HTTPS (GitHub Pages) oder als installierte App öffnen. Beim ersten Start Mikrofon erlauben. Ergebnisse unten eintragen oder dem Strang Audio melden (Wert, Saite, Situation).

| Nr. | Prüfung | Erwartung | Ergebnis |
|---|---|---|---|
| 1 | Start antippen, Mikrofonfrage bestätigen | Status „Höre zu …“; Pegel reagiert auf Geräusche | |
| 2 | Mikrofon ablehnen (Frage verneinen oder Berechtigung entziehen) | Meldung „Mikrofonzugriff verweigert“; erneuter Start nach Erlauben möglich | |
| 3 | Jede Saite einzeln leer anschlagen, Automatik | richtige Saite wird erkannt, Zahl ruhig nach ca. 0,3 s | |
| 4 | Tiefe E-Saite (E2) leise und laut anschlagen | keine Oktavsprünge (kein Springen auf E3 oder E1) | |
| 5 | Saite langsam verstimmen (Mechanik drehen) | Cent-Wert folgt gleichmäßig, Vorzeichen stimmt (höher = positiv) | |
| 6 | Manuell: Mechanik G antippen, A-Saite anschlagen | kein Messwert (außerhalb des Bereichs); G anschlagen: Messwert | |
| 7 | Bezugston ändern (z. B. 442), gleiche Saite | Abweichung ändert sich passend | |
| 8 | Stimmgerät mit Referenzton (zweites Gerät oder Clip-Tuner) vergleichen | Abweichung ≤ 2 bis 3 Cent | |
| 9 | Raumgeräusch (Gespräch, Fernseher leise) | keine Dauersprünge; Stille zeigt „kein Ton“ | |
| 10 | Stop antippen, dann Statusleiste prüfen | Mikrofon-Symbol des Systems verschwindet | |
| 11 | App in den Hintergrund legen, zurückkehren | Mikrofon war frei; Start wieder nötig | |
| 12 | Flugmodus an, App neu öffnen, Start | läuft ohne Netz | |

Nicht im Container testbar: echte Saiten, Handymikrofon, Gerätelatenz, Systemanzeige des Mikrofons.
