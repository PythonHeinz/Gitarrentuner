/* Gitarren Heinz – Anzeige (Strang Design). Schnittstelle: docs/SCHNITTSTELLEN.md, Abschnitt „Display“.
   Zeichnet in #display: Skalenfenster mit Nadel und LED, Messwerte, Kopfplatte mit Mechaniken, Designtaste.
   Themen: 'warm' (Nussbaum, Standard) und 'hell'; gespeichert unter gh.theme. Beschreibung: docs/DESIGN.md. */
(function () {
  'use strict';
  var T = window.Tuner;

  var Z = (T.Audio && T.Audio.zones) || { ok: 5, near: 20 };   // Schwellen nur an einer Stelle (Audio)
  var MAXC = 50, MAXA = 62, R = 155, PX = 180, PY = 196;       // Skala: ±50 Cent = ±62 Grad
  var HOLD_MS = 1200;                                          // Nadel bleibt nach Tonende kurz stehen
  var THEMES = ['warm', 'hell'];
  var THEME_COLOR = { warm: '#3b2417', hell: '#e6e3dc' };
  var MINUS = '−';

  var root, el = {}, inst = null, mode = 'auto', selected = null, running = false;
  var theme = 'warm', last = null, holdTimer = null;
  var pegEls = {};

  // ---------- Hilfen ----------
  function ang(c) { var v = Math.max(-MAXC, Math.min(MAXC, c)); return v / MAXC * MAXA; }
  function pt(r, a) { var t = a * Math.PI / 180; return [PX + r * Math.sin(t), PY - r * Math.cos(t)]; }
  function arcPath(c0, c1) {
    var a = pt(R, ang(c0)), b = pt(R, ang(c1));
    return 'M' + a[0].toFixed(2) + ' ' + a[1].toFixed(2) + ' A' + R + ' ' + R + ' 0 0 1 ' + b[0].toFixed(2) + ' ' + b[1].toFixed(2);
  }
  function zoneOf(c) {          // -2 .. 2 (0 = gestimmt)
    var a = Math.abs(c), z = a <= Z.ok ? 0 : (a <= Z.near ? 1 : 2);
    return c < 0 ? -z : z;
  }
  function ledOf(c) { var a = Math.abs(c); return a <= Z.ok ? 'green' : (a <= Z.near ? 'yellow' : 'red'); }
  function noteName(n) { return n && T.lang === 'de' && n.charAt(0) === 'B' ? 'H' + n.slice(1) : (n || ''); }
  function fmtHz(f) { var s = f.toFixed(1); return T.lang === 'de' ? s.replace('.', ',') : s; }
  function stringById(id) {
    if (!inst) return null;
    for (var i = 0; i < inst.strings.length; i++) if (inst.strings[i].id === id) return inst.strings[i];
    return null;
  }
  function svgEl(tag, attrs) {
    var e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  // ---------- Nadel (Feder-Dämpfer, ruhige Bewegung mit leichtem Überschwingen) ----------
  var needle = { a: -MAXA, v: 0, target: -MAXA, raf: 0, t0: 0 };
  function setNeedleAttr() { if (el.needle) el.needle.setAttribute('transform', 'rotate(' + needle.a.toFixed(2) + ' ' + PX + ' ' + PY + ')'); }
  function step(now) {
    var dt = Math.min(0.05, (now - needle.t0) / 1000); needle.t0 = now;
    var k = 150, c = 19;                                     // Dämpfung ca. 0,78
    needle.v += (k * (needle.target - needle.a) - c * needle.v) * dt;
    needle.a += needle.v * dt;
    setNeedleAttr();
    if (Math.abs(needle.target - needle.a) < 0.04 && Math.abs(needle.v) < 0.04) {
      needle.a = needle.target; needle.v = 0; needle.raf = 0; setNeedleAttr(); return;
    }
    needle.raf = requestAnimationFrame(step);
  }
  function moveNeedle(deg) {
    needle.target = deg;
    if (!needle.raf) { needle.t0 = performance.now(); needle.raf = requestAnimationFrame(step); }
  }

  // ---------- Aufbau ----------
  function buildDial() {
    var s = svgEl('svg', { viewBox: '0 34 360 182', role: 'img', 'aria-label': T.t('display.scale'), 'class': 'scale' });
    s.appendChild(svgEl('path', { 'class': 'arc', d: arcPath(-MAXC, MAXC), 'stroke-width': 1.5, fill: 'none' }));
    [[-MAXC, -Z.near, 'bad'], [Z.near, MAXC, 'bad'], [-Z.near, -Z.ok, 'mid'], [Z.ok, Z.near, 'mid'], [-Z.ok, Z.ok, 'ok']].forEach(function (b) {
      s.appendChild(svgEl('path', { 'class': 'band ' + b[2], d: arcPath(b[0], b[1]), fill: 'none', 'stroke-width': 8 }));
    });
    for (var c = -MAXC; c <= MAXC; c += 5) {
      var major = c === 0 || Math.abs(c) === Z.ok || Math.abs(c) === Z.near || Math.abs(c) === MAXC;
      var len = c === 0 ? 30 : (major ? 20 : 11);
      var p = pt(R, ang(c)), q = pt(R - len, ang(c));
      s.appendChild(svgEl('line', { 'class': 'tick', x1: p[0].toFixed(2), y1: p[1].toFixed(2), x2: q[0].toFixed(2), y2: q[1].toFixed(2), 'stroke-width': c === 0 ? 3 : (major ? 2 : 1) }));
    }
    el.zl = {};
    [['--', -37.5, -2], [MINUS, -12.5, -1], ['0', 0, 0], ['+', 12.5, 1], ['++', 37.5, 2]].forEach(function (z) {
      var p = pt(106, ang(z[1]));
      var t = svgEl('text', { 'class': 'zl', x: p[0].toFixed(2), y: (p[1] + 8).toFixed(2) });
      t.textContent = z[0]; s.appendChild(t); el.zl[z[2]] = t;
    });
    var cl = svgEl('text', { 'class': 'scaletxt', x: 20, y: 208 }); cl.textContent = 'CENT'; s.appendChild(cl);
    el.refTxt = svgEl('text', { 'class': 'scaletxt', x: 340, y: 208, 'text-anchor': 'end' }); s.appendChild(el.refTxt);
    el.needle = svgEl('g', { 'class': 'needle', 'stroke-width': 3, 'stroke-linecap': 'round' });
    el.needle.appendChild(svgEl('line', { x1: PX, y1: PY, x2: PX, y2: 50 }));
    el.needle.appendChild(svgEl('line', { x1: PX, y1: PY, x2: PX, y2: 214 }));
    s.appendChild(el.needle);
    s.appendChild(svgEl('circle', { 'class': 'hub', cx: PX, cy: PY, r: 11 }));
    s.appendChild(svgEl('circle', { 'class': 'hubdot', cx: PX, cy: PY, r: 3.5 }));
    return s;
  }

  function sides() {
    var hs = inst && inst.headstock, ids = inst ? inst.strings.map(function (s) { return s.id; }) : [];
    if (hs && hs.left && hs.right) return [hs.left, hs.right];
    var h = Math.ceil(ids.length / 2);
    return [ids.slice(0, h), ids.slice(h)];
  }

  function buildHead() {
    var s = svgEl('svg', { viewBox: '0 0 360 250', preserveAspectRatio: 'xMidYMid meet', role: 'group', 'aria-label': T.t('display.head') });
    var warm = theme === 'warm';
    var defs = svgEl('defs', {});
    defs.innerHTML =
      '<radialGradient id="gh-metal" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#d4cfc4"/><stop offset="1" stop-color="#8d877b"/></radialGradient>' +
      '<pattern id="gh-wood" patternUnits="userSpaceOnUse" x="0" y="0" width="360" height="250"><image href="img/walnut-panel.jpg" x="-300" y="-500" width="1000" height="1885" preserveAspectRatio="none"/></pattern>';
    s.appendChild(defs);
    var sd = sides(), L = sd[0], Rr = sd[1], n = Math.max(L.length, Rr.length, 1);
    var ys = []; for (var i = 0; i < n; i++) ys.push(n === 1 ? 125 : 38 + i * (174 / (n - 1)));
    var lx = 50, rx = 310;
    ys.forEach(function (y, i) {
      if (i < L.length) s.appendChild(svgEl('line', { 'class': 'shaft', x1: lx, y1: y, x2: 118, y2: y, 'stroke-width': 7, 'stroke-linecap': 'round' }));
      if (i < Rr.length) s.appendChild(svgEl('line', { 'class': 'shaft', x1: rx, y1: y, x2: 242, y2: y, 'stroke-width': 7, 'stroke-linecap': 'round' }));
    });
    var hbPath = 'M126 6 H234 Q246 6 246 20 V150 L232 244 H128 L114 150 V20 Q114 6 126 6 Z';
    s.appendChild(svgEl('path', { 'class': 'headbody', fill: warm ? 'url(#gh-wood)' : '', d: hbPath }));
    if (warm) s.appendChild(svgEl('path', { 'class': 'headlight', d: hbPath }));
    s.appendChild(svgEl('rect', { 'class': 'nut', x: 128, y: 238, width: 104, height: 5, rx: 2 }));
    var sp = Math.min(16, 40 / Math.max(1, Math.max(L.length, Rr.length) - 1));
    L.forEach(function (id, i) { s.appendChild(svgEl('line', { 'class': 'str', x1: 120, y1: ys[i], x2: 138 + i * sp, y2: 241, 'stroke-width': 1.3 })); });
    Rr.forEach(function (id, i) { s.appendChild(svgEl('line', { 'class': 'str', x1: 240, y1: ys[i], x2: 190 + i * sp, y2: 241, 'stroke-width': 1.3 })); });
    pegEls = {};
    function peg(id, x, y) {
      var str = stringById(id); if (!str) return;
      var g = svgEl('g', { 'class': 'peg', role: 'button', tabindex: 0, 'data-id': id, 'aria-label': T.t('display.peg', { n: T.Instruments.label(str) }) });
      g.appendChild(svgEl('circle', { 'class': 'hit', cx: x, cy: y, r: 35 }));
      g.appendChild(svgEl('circle', { 'class': 'k', cx: x, cy: y, r: 29, fill: warm ? 'url(#gh-metal)' : '' }));
      var t = svgEl('text', { x: x, y: y + 1 }); t.textContent = T.Instruments.label(str);
      g.appendChild(t); s.appendChild(g); pegEls[id] = g;
    }
    L.forEach(function (id, i) { peg(id, lx, ys[i]); });
    Rr.forEach(function (id, i) { peg(id, rx, ys[i]); });
    return s;
  }

  function draw() {
    if (!root) return;
    root.innerHTML = '';
    var tuner = document.createElement('div'); tuner.className = 'tuner';
    var dial = document.createElement('div'); dial.className = 'dial';
    var glass = document.createElement('div'); glass.className = 'glass';
    glass.appendChild(buildDial());
    var led = document.createElement('div'); led.className = 'led'; led.setAttribute('data-led', 'off'); led.setAttribute('aria-hidden', 'true');
    led.appendChild(document.createElement('i'));
    dial.appendChild(glass); dial.appendChild(led);
    var ro = document.createElement('div'); ro.className = 'readout';
    ro.innerHTML = '<div class="big"></div><div class="small"></div><div class="state"></div>';
    var tb = document.createElement('button'); tb.type = 'button'; tb.className = 'themekey';
    tb.addEventListener('click', function () { setTheme(theme === 'warm' ? 'hell' : 'warm'); });
    ro.appendChild(tb);
    var head = document.createElement('div'); head.className = 'head'; head.appendChild(buildHead());
    tuner.appendChild(dial); tuner.appendChild(ro); tuner.appendChild(head);
    root.appendChild(tuner);
    el.led = led; el.big = ro.firstChild; el.small = ro.children[1]; el.state = ro.children[2]; el.theme = tb; el.head = head;
    needle.a = needle.target; setNeedleAttr();
    paintStatic(); paint();
  }

  // ---------- Darstellung der Zustände ----------
  function paintStatic() {
    if (el.refTxt) el.refTxt.textContent = (T.app && T.app.state ? T.app.state.refHz : T.config.refHz.def) + ' HZ';
    if (el.theme) {
      el.theme.textContent = T.t('display.theme.' + theme);
      el.theme.setAttribute('aria-label', T.t('display.theme.switch') + ': ' + T.t('display.theme.' + theme));
    }
    Object.keys(pegEls).forEach(function (id) {
      var manual = mode === 'manual';
      pegEls[id].setAttribute('aria-pressed', String(manual && selected === id));
      pegEls[id].setAttribute('aria-disabled', String(!manual));
    });
  }

  function paint() {
    if (!el.big) return;
    var have = running && last && last.freq != null;
    var c = have && last.cents != null ? last.cents : null;
    var str = last && last.stringId ? stringById(last.stringId) : null;
    // LED und Zonen
    el.led.setAttribute('data-led', c === null ? 'off' : ledOf(c));
    var z = c === null ? null : zoneOf(c);
    Object.keys(el.zl).forEach(function (k) { el.zl[k].setAttribute('class', 'zl' + (z !== null && Number(k) === z ? (z === 0 ? ' ok' : ' hit') : '')); });
    // Nadel
    moveNeedle(c === null ? -MAXA : ang(c));
    el.needle.setAttribute('class', 'needle' + (c === null ? ' idle' : ''));
    // Text
    var big = '–', small = '', state = '', sc = '';
    if (!running) small = T.t('tuner.idle');
    else if (!have) small = mode === 'manual' && !selected ? T.t('display.pick') : T.t('display.strike');
    else {
      big = str ? T.Instruments.label(str) : noteName(last.note).charAt(0) || '–';
      small = (last.note ? noteName(last.note) + ' · ' : '') + fmtHz(last.freq);
      small += ' Hz';
      if (c !== null) {
        small += ' · ' + (c > 0 ? '+' : (c < 0 ? MINUS : '')) + Math.abs(Math.round(c)) + ' ' + T.t('display.cent');
        var a = Math.abs(c);
        if (a <= Z.ok) { state = T.t('display.ok'); sc = ' ok'; }
        else { state = T.t(c < 0 ? 'display.low' : 'display.high'); sc = a <= Z.near ? ' mid' : ' bad'; }
      }
    }
    el.big.textContent = big; el.big.className = 'big' + (have ? '' : ' dim');
    el.small.textContent = small; el.state.textContent = state; el.state.className = 'state' + sc;
    // Mechaniken: Zielsaite (Automatik) und Auswahl (Manuell)
    Object.keys(pegEls).forEach(function (id) {
      var cl = 'peg';
      if (mode === 'manual' && selected === id) cl += ' sel';
      else if (mode === 'auto' && have && last.stringId === id) cl += ' target';
      if (mode !== 'manual') cl += ' off';
      pegEls[id].setAttribute('class', cl);
    });
  }

  // ---------- Thema ----------
  function applyTheme() {
    document.documentElement.setAttribute('data-theme', theme);
    var m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute('content', THEME_COLOR[theme]);
  }
  function setTheme(t) {
    if (THEMES.indexOf(t) < 0) return;
    theme = t; T.store.set('theme', t); applyTheme();
    if (root) { var keep = last; draw(); last = keep; paint(); }
  }

  // ---------- Demo (nur Entwicklung: Seite mit ?demo=1) ----------
  function demo() {
    var box = document.createElement('div'); box.className = 'demo';
    box.innerHTML = '<label>Cent <output>0</output><input type="range" min="-60" max="60" value="0" step="1"></label>' +
      '<select></select><button type="button">Ton aus</button>';
    var rng = box.querySelector('input'), out = box.querySelector('output'), sel = box.querySelector('select'), off = box.querySelector('button');
    inst.strings.forEach(function (s) { var o = document.createElement('option'); o.value = s.id; o.textContent = s.note; sel.appendChild(o); });
    var on = true;
    function send() {
      out.textContent = rng.value;
      if (!on) { T.Display.update({ freq: null, cents: null, note: null, stringId: null, level: 0 }); return; }
      var s = stringById(sel.value), c = Number(rng.value);
      T.Display.update({ freq: s.freq * Math.pow(2, c / 1200), cents: c, note: s.note, stringId: s.id, level: .5 });
    }
    rng.oninput = send; sel.onchange = send;
    off.onclick = function () { on = !on; off.textContent = on ? 'Ton aus' : 'Ton an'; send(); };
    document.body.appendChild(box);
    T.Display.setRunning(true); send(); setInterval(send, 400);
  }

  // ---------- Schnittstelle ----------
  T.Display = {
    mount: function (e) {
      root = e;
      theme = T.store.get('theme', 'warm'); if (THEMES.indexOf(theme) < 0) theme = 'warm';
      applyTheme();
      root.addEventListener('click', function (ev) {
        var g = ev.target.closest && ev.target.closest('.peg');
        if (g && mode === 'manual') T.bus.emit('string-select', { id: g.getAttribute('data-id') });
      });
      root.addEventListener('keydown', function (ev) {
        var g = ev.target.closest && ev.target.closest('.peg');
        if (g && mode === 'manual' && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); T.bus.emit('string-select', { id: g.getAttribute('data-id') }); }
      });
      draw();
      if (/[?&]demo=1\b/.test(location.search) && inst) demo();
    },
    setInstrument: function (i) { var first = !inst; inst = i; draw(); if (first && root && /[?&]demo=1\b/.test(location.search)) demo(); },
    setMode: function (m) { mode = m; paintStatic(); paint(); },
    setSelected: function (id) { selected = id; paintStatic(); paint(); },
    update: function (r) {
      if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
      if (r && r.freq != null) { last = r; paint(); return; }
      if (!last) { paint(); return; }
      holdTimer = setTimeout(function () { holdTimer = null; last = null; paint(); }, HOLD_MS);
    },
    setRunning: function (r) {
      running = !!r; document.documentElement.setAttribute('data-running', running ? '1' : '0');
      if (!running) { last = null; if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; } }
      paint();
    },
    relabel: function () { var keep = last; draw(); last = keep; paint(); },
    setTheme: setTheme,
    getTheme: function () { return theme; }
  };
})();
