/* Gitarren Heinz – Tonerkennung. PLATZHALTER (Strang Audio ersetzt den Inhalt dieser Datei).
   Schnittstelle: docs/SCHNITTSTELLEN.md, Abschnitt „Audio“. Diese Signaturen bleiben stabil. */
(function () {
  'use strict';
  var T = window.Tuner;
  var cfg = null, running = false;
  T.Audio = {
    // { refHz, mode: 'auto'|'manual', strings: [{id,note,freq}], targetId: string|null }
    configure: function (c) { cfg = c; },
    // Promise; bei Fehler Ablehnung mit Error.name 'NotAllowedError' (verweigert) oder 'NotFoundError' (kein Mikrofon)
    start: function () { running = true; T.bus.emit('audio-state', { running: true, error: null }); return Promise.resolve(); },
    stop: function () { running = false; T.bus.emit('audio-state', { running: false, error: null }); },
    isRunning: function () { return running; },
    isPlaceholder: true
  };
})();
