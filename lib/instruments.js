/* Gitarren Heinz – Instrumentendaten (Fundament). Instrumente sind JSON-Dateien in instruments/.
   Format: docs/SCHNITTSTELLEN.md. Neue Instrumente und Stimmungen brauchen keine Codeänderung. */
(function () {
  'use strict';
  var T = window.Tuner;
  var I = T.Instruments = {};

  I.list = function () {
    return fetch('instruments/index.json').then(function (r) {
      if (!r.ok) throw new Error('instruments/index.json');
      return r.json();
    });
  };
  I.load = function (id) {
    return fetch('instruments/' + id + '.json').then(function (r) {
      if (!r.ok) throw new Error('instruments/' + id);
      return r.json();
    }).then(function (inst) {
      var err = I.validate(inst);
      if (err.length) throw new Error('Instrument ' + id + ': ' + err.join('; '));
      return inst;
    });
  };
  // Gibt eine Liste von Fehlern zurück (leer = gültig).
  I.validate = function (inst) {
    var e = [];
    function ld(o) { return o && typeof o.de === 'string' && o.de && typeof o.en === 'string' && o.en; }
    if (!inst || typeof inst !== 'object') return ['kein Objekt'];
    if (!/^[a-z0-9-]+$/.test(inst.id || '')) e.push('id');
    if (!ld(inst.name)) e.push('name de/en');
    if (inst.referenceNote !== 'A4') e.push('referenceNote muss A4 sein');
    if (!Array.isArray(inst.strings) || !inst.strings.length) { e.push('strings'); return e; }
    var ids = {};
    inst.strings.forEach(function (s, i) {
      if (!/^[a-z0-9]+$/.test(s.id || '')) e.push('strings[' + i + '].id');
      if (ids[s.id]) e.push('doppelte id ' + s.id);
      ids[s.id] = true;
      if (typeof s.note !== 'string' || !/^[A-G]#?-?\d$/.test(s.note)) e.push('strings[' + i + '].note');
      if (!Number.isInteger(s.semitones)) e.push('strings[' + i + '].semitones');
      if (!ld(s.label)) e.push('strings[' + i + '].label de/en');
    });
    var h = inst.headstock;
    if (h) {
      var used = [].concat(h.left || [], h.right || []);
      if (used.length !== inst.strings.length) e.push('headstock: Anzahl Mechaniken passt nicht zu strings');
      used.forEach(function (id) { if (!ids[id]) e.push('headstock: unbekannte Saite ' + id); });
      if (new Set(used).size !== used.length) e.push('headstock: Saite doppelt');
    }
    return e;
  };
  // Frequenz einer Saite bei Bezugston refHz (A4)
  I.freq = function (semitones, refHz) { return refHz * Math.pow(2, semitones / 12); };
  // Saiten mit berechneter Frequenz; Reihenfolge wie in der Datei (tief nach hoch)
  I.resolve = function (inst, refHz) {
    return inst.strings.map(function (s) {
      return { id: s.id, note: s.note, semitones: s.semitones, label: s.label, freq: I.freq(s.semitones, refHz) };
    });
  };
  // Beschriftung der Saite in der aktuellen Sprache (H/B folgt der Sprache)
  I.label = function (s) { return T.pick(s.label); };
})();
