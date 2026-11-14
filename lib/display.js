/* Gitarren Heinz – Anzeige. PLATZHALTER (Strang Design ersetzt den Inhalt dieser Datei und css/).
   Schnittstelle: docs/SCHNITTSTELLEN.md, Abschnitt „Display“. Diese Signaturen bleiben stabil. */
(function () {
  'use strict';
  var T = window.Tuner;
  var root, inst = null, mode = 'auto', selected = null, running = false, last = null;

  function draw() {
    if (!root) return;
    var head = '<p class="ph">' + T.esc(T.t('tuner.placeholder.display')) + '</p>';
    var pegs = '';
    if (inst) {
      pegs = '<div class="ph-pegs" role="group">' + inst.strings.map(function (s) {
        var on = mode === 'manual' && selected === s.id;
        return '<button type="button" class="ph-peg' + (on ? ' on' : '') + '" data-id="' + T.esc(s.id) + '"' +
          ' aria-pressed="' + on + '"' + (mode === 'manual' ? '' : ' disabled') + '>' + T.esc(T.Instruments.label(s)) + '</button>';
      }).join('') + '</div>';
    }
    var info = last && last.freq ? '<p class="ph-read">' + last.freq.toFixed(1) + ' Hz · ' +
      (last.cents == null ? '–' : (last.cents > 0 ? '+' : '') + last.cents.toFixed(0) + ' ct') + '</p>' : '';
    root.innerHTML = head + pegs + info;
  }

  T.Display = {
    // Container-Element; Anzeige zeichnet nur dort hinein
    mount: function (el) {
      root = el;
      root.addEventListener('click', function (ev) {
        var b = ev.target.closest && ev.target.closest('.ph-peg');
        if (b && mode === 'manual') T.bus.emit('string-select', { id: b.getAttribute('data-id') });
      });
      draw();
    },
    // aufgelöstes Instrument: { id, name, strings: [{id,note,label,freq}], headstock }
    setInstrument: function (i) { inst = i; draw(); },
    setMode: function (m) { mode = m; draw(); },
    setSelected: function (id) { selected = id; draw(); },
    // Messwert: { freq, cents, note, stringId, level }
    update: function (r) { last = r; draw(); },
    setRunning: function (r) { running = r; if (!r) last = null; draw(); },
    // Sprache gewechselt: Beschriftungen neu setzen
    relabel: function () { draw(); },
    isPlaceholder: true
  };
})();
