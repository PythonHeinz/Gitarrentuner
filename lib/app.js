/* Gitarren Heinz – Anwendung (Fundament): verdrahtet Einstellungen, Instrumente, Audio und Anzeige. */
(function () {
  'use strict';
  var T = window.Tuner, I = T.Instruments;
  var $ = function (id) { return document.getElementById(id); };
  var st = { refHz: T.config.refHz.def, mode: 'auto', selected: null, running: false, error: null,
             instId: null, instList: [], inst: null, strings: [] };

  function clampRef(v) {
    var c = T.config.refHz;
    v = Math.round(Number(v));
    if (!isFinite(v)) return c.def;
    return Math.min(c.max, Math.max(c.min, v));
  }

  // ---------- Texte ----------
  function applyTexts() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-i18n]'), function (el) {
      el.textContent = T.t(el.getAttribute('data-i18n'));
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-i18n-attr]'), function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var p = pair.split(':'); el.setAttribute(p[0], T.t(p[1]));
      });
    });
    Array.prototype.forEach.call($('lang-btn').querySelectorAll('span'), function (s) {
      s.classList.toggle('active', s.getAttribute('data-l') === T.lang);
    });
    $('run-btn').textContent = T.t(st.running ? 'tuner.stop' : 'tuner.start');
    $('version').textContent = T.t('settings.version', { v: T.version });
    if (st.instList.length > 1) {
      Array.prototype.forEach.call($('instrument-select').options, function (o) { o.textContent = T.pick(o._name); });
    }
    renderStatus();
  }

  function renderStatus() {
    var el = $('status');
    var msg = '', err = false;
    if (st.error) { msg = T.t(st.error === 'NotAllowedError' ? 'error.mic.denied' : 'error.mic.unavailable'); err = true; }
    else if (st.running) msg = T.t('tuner.listening');
    else msg = T.t('tuner.idle');
    if (T.Audio.isPlaceholder && !st.error) msg += ' · ' + T.t('tuner.placeholder.audio');
    el.textContent = msg;
    el.classList.toggle('err', err);
  }

  // ---------- Zustand an Module ----------
  function pushAudio() {
    T.Audio.configure({
      refHz: st.refHz, mode: st.mode,
      strings: st.strings.map(function (s) { return { id: s.id, note: s.note, freq: s.freq }; }),
      targetId: st.mode === 'manual' ? st.selected : null
    });
  }
  function resolveStrings() { st.strings = I.resolve(st.inst, st.refHz); }
  function renderControls() {
    $('ref-value').textContent = st.refHz + ' ' + T.t('ref.unit');
    $('ref-down').disabled = st.refHz <= T.config.refHz.min;
    $('ref-up').disabled = st.refHz >= T.config.refHz.max;
    Array.prototype.forEach.call($('mode-group').querySelectorAll('button[data-mode]'), function (b) {
      b.setAttribute('aria-checked', String(b.getAttribute('data-mode') === st.mode));
    });
  }
  function pushDisplay() {
    T.Display.setInstrument({ id: st.inst.id, name: st.inst.name, strings: st.strings, headstock: st.inst.headstock || null });
    T.Display.setMode(st.mode);
    T.Display.setSelected(st.selected);
  }

  function setRef(v) {
    st.refHz = clampRef(v);
    T.store.set('refHz', st.refHz);
    resolveStrings(); renderControls(); pushDisplay(); pushAudio();
  }
  function setMode(m) {
    if (T.config.modes.indexOf(m) < 0) return;
    st.mode = m;
    if (m === 'auto') st.selected = null;
    T.store.set('mode', m);
    renderControls(); pushDisplay(); pushAudio();
  }
  function setInstrument(id) {
    return I.load(id).then(function (inst) {
      st.inst = inst; st.instId = id; st.selected = null;
      T.store.set('instrument', id);
      resolveStrings(); renderControls(); pushDisplay(); pushAudio();
    });
  }

  // ---------- Ereignisse ----------
  function wire() {
    $('lang-btn').onclick = function () { T.setLang(T.lang === 'de' ? 'en' : 'de'); };
    $('ref-down').onclick = function () { setRef(st.refHz - T.config.refHz.step); };
    $('ref-up').onclick = function () { setRef(st.refHz + T.config.refHz.step); };
    Array.prototype.forEach.call($('mode-group').querySelectorAll('button[data-mode]'), function (b) {
      b.onclick = function () { setMode(b.getAttribute('data-mode')); };
    });
    $('run-btn').onclick = function () {
      if (st.running) { T.Audio.stop(); return; }
      st.error = null;
      T.Audio.start().catch(function (e) {
        st.error = e && e.name === 'NotAllowedError' ? 'NotAllowedError' : 'NotFoundError';
        st.running = false; applyTexts();
      });
    };
    $('instrument-select').onchange = function () { setInstrument(this.value); };

    T.bus.on('lang', function () { applyTexts(); T.Display.relabel(); });
    T.bus.on('string-select', function (e) {
      if (st.mode !== 'manual' || !e || !st.inst.strings.some(function (s) { return s.id === e.id; })) return;
      st.selected = e.id; T.Display.setSelected(st.selected); pushAudio();
    });
    T.bus.on('reading', function (r) { T.Display.update(r); });
    T.bus.on('audio-state', function (s) {
      st.running = !!s.running; st.error = s.error || null;
      T.Display.setRunning(st.running); applyTexts();
    });
  }

  function registerSW() {
    if (!('serviceWorker' in navigator) || location.protocol.indexOf('http') !== 0) return;
    var had = !!navigator.serviceWorker.controller, reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (had && !reloaded) { reloaded = true; location.reload(); }
    });
    navigator.serviceWorker.register('sw.js').catch(function () {});
  }

  // ---------- Start ----------
  function fail(e) {
    console.error(e);
    var el = $('status'); el.classList.add('err');
    el.textContent = T.t('error.data') === 'error.data' ? 'Error: data' : T.t('error.data');
  }
  T.ready = T.loadLang('en').then(function () { return T.setLang(T.lang); }).then(function () {
    return I.list();
  }).then(function (idx) {
    st.instList = idx.instruments;
    var wanted = T.store.get('instrument', idx['default']);
    if (st.instList.indexOf(wanted) < 0) wanted = idx['default'];
    st.refHz = clampRef(T.store.get('refHz', T.config.refHz.def));
    var m = T.store.get('mode', 'auto'); st.mode = T.config.modes.indexOf(m) >= 0 ? m : 'auto';
    return I.load(wanted).then(function (inst) {
      st.inst = inst; st.instId = wanted; resolveStrings();
      if (st.instList.length > 1) {
        return Promise.all(st.instList.map(function (id) { return I.load(id); })).then(function (all) {
          var sel = $('instrument-select');
          all.forEach(function (i) {
            var o = document.createElement('option'); o.value = i.id; o._name = i.name; sel.appendChild(o);
          });
          sel.value = wanted; $('instrument-row').hidden = false;
        });
      }
    });
  }).then(function () {
    T.Display.mount($('display'));
    wire(); renderControls(); pushDisplay(); pushAudio(); applyTexts();
    registerSW();
    document.body.setAttribute('data-ready', '1');
  }).catch(fail);

  T.app = { state: st, setRef: setRef, setMode: setMode, setInstrument: setInstrument };
})();
