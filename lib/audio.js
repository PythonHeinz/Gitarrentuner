/* Gitarren Heinz – Tonerkennung (Strang Audio). Schnittstelle: docs/SCHNITTSTELLEN.md, Abschnitt „Audio“.
   Aufbau:
   1. Reiner Rechenteil (kein Browser nötig, unter Node testbar): YIN, Pegel, Cent, Detector.
   2. Browserteil: Mikrofon (getUserMedia + AnalyserNode), Takt, Ereignisse `reading` / `audio-state`.
   Verfahren, Parameter und Genauigkeit: docs/AUDIO.md. Keine externen Bibliotheken, kein Netz. */
(function (root) {
  'use strict';

  // ---------- Konstanten (Änderungen nur mit Entwickler abstimmen, siehe docs/AUDIO.md) ----------
  var P = {
    frame: 4096,          // Fensterlänge in Samples (ca. 85 ms bei 48 kHz)
    hopMs: 40,            // Abstand der Auswertungen → ca. 25 Messungen/s
    yinThreshold: 0.15,   // YIN: absolute Schwelle der normierten Differenzfunktion
    gateDb: -50,          // Mindestpegel (RMS, dBFS); darunter: kein Ton
    onsetSkip: 3,         // Auswertungen nach Öffnen des Gates, die verworfen werden (Anschlag)
    medianLen: 5,         // Median über die letzten n Messungen gegen Springen
    medianMin: 3,         // mindestens so viele gültige Werte im Median, sonst kein Ton
    manualSpan: 2,        // Suchbereich manuell: ± Halbtöne um die Zielsaite
    autoSpan: 3           // Suchbereich Automatik: Halbtöne unter tiefster / über höchster Saite
  };
  // Nadelzonen in Cent (Betrag): 0 bis ZONES.ok, -/+ bis ZONES.near, darüber --/++
  var ZONES = { ok: 5, near: 20 };

  function zone(cents) {
    if (cents === null || cents === undefined || !isFinite(cents)) return null;
    var a = Math.abs(cents);
    if (a <= ZONES.ok) return '0';
    var s = cents < 0 ? '-' : '+';
    return a <= ZONES.near ? s : s + s;
  }

  // ---------- Rechenteil ----------
  function rms(buf) {
    var s = 0, n = buf.length;
    for (var i = 0; i < n; i++) s += buf[i] * buf[i];
    return Math.sqrt(s / n);
  }
  function toDb(x) { return x > 1e-9 ? 20 * Math.log10(x) : -180; }
  function cents(f, ref) { return 1200 * Math.log(f / ref) / Math.LN2; }

  function median(a) {
    var b = a.slice().sort(function (x, y) { return x - y; }), m = b.length >> 1;
    return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2;
  }

  // YIN (de Cheveigné/Kawahara 2002): Differenzfunktion, kumulierte Mittelwertnormierung,
  // erste Senke unter der Schwelle, parabolische Interpolation. Liefert { freq, clarity } oder null.
  function yin(buf, fs, fmin, fmax, thr) {
    var N = buf.length, W = N >> 1;
    var tauMax = Math.min(Math.floor(fs / fmin), W - 2);
    var tauMin = Math.max(2, Math.floor(fs / fmax));
    if (tauMax <= tauMin + 2) return null;
    var c = new Float32Array(tauMax + 2), tau, j, d, x, run = 0;
    c[0] = 1;
    for (tau = 1; tau <= tauMax + 1; tau++) {
      d = 0;
      for (j = 0; j < W; j++) { x = buf[j] - buf[j + tau]; d += x * x; }
      run += d;
      c[tau] = run > 0 ? d * tau / run : 1;
    }
    var best = -1;
    for (tau = tauMin; tau < tauMax; tau++) {
      if (c[tau] < thr) {
        while (tau + 1 < tauMax && c[tau + 1] < c[tau]) tau++;
        best = tau; break;
      }
    }
    if (best < 0) return null;
    var x0 = c[best - 1], x1 = c[best], x2 = c[best + 1], den = x0 - 2 * x1 + x2;
    var shift = den !== 0 ? 0.5 * (x0 - x2) / den : 0;
    if (!isFinite(shift) || Math.abs(shift) > 1) shift = 0;
    return { freq: fs / (best + shift), clarity: 1 - x1 };
  }

  // Detector: nimmt Fenster (Float32Array, Länge P.frame) entgegen und liefert `reading`-Objekte.
  function Detector(opts) {
    opts = opts || {};
    this.fs = opts.fs || 48000;
    this.p = {};
    for (var k in P) this.p[k] = opts[k] !== undefined ? opts[k] : P[k];
    this.cfg = null;
    this.reset();
  }
  Detector.prototype.reset = function () { this.hist = []; this.loud = 0; };
  Detector.prototype.configure = function (cfg) { this.cfg = cfg || null; this.reset(); };

  Detector.prototype.range = function () {
    var p = this.p, cfg = this.cfg, ss = cfg && cfg.strings || [];
    if (!ss.length) return { fmin: 60, fmax: 500, target: null };
    var target = null, i;
    if (cfg.mode === 'manual' && cfg.targetId) {
      for (i = 0; i < ss.length; i++) if (ss[i].id === cfg.targetId) target = ss[i];
    }
    if (target) {
      return { fmin: target.freq * Math.pow(2, -p.manualSpan / 12), fmax: target.freq * Math.pow(2, p.manualSpan / 12), target: target };
    }
    var lo = Infinity, hi = 0;
    ss.forEach(function (s) { lo = Math.min(lo, s.freq); hi = Math.max(hi, s.freq); });
    return { fmin: lo * Math.pow(2, -p.autoSpan / 12), fmax: hi * Math.pow(2, p.autoSpan / 12), target: null };
  };

  Detector.prototype.process = function (buf) {
    var p = this.p, level = rms(buf), db = toDb(level);
    var lv = Math.max(0, Math.min(1, (db + 60) / 50));
    var raw = null;
    if (db >= p.gateDb) this.loud++; else this.loud = 0;
    var rg = this.range();
    if (this.loud > p.onsetSkip) {
      var r = yin(buf, this.fs, rg.fmin, rg.fmax, p.yinThreshold);
      if (r) raw = r.freq;
    }
    this.hist.push(raw);
    if (this.hist.length > p.medianLen) this.hist.shift();
    var valid = this.hist.filter(function (v) { return v !== null; });
    var out = { freq: null, cents: null, note: null, stringId: null, level: lv };
    if (valid.length < p.medianMin) return out;
    var f = median(valid), ss = this.cfg && this.cfg.strings || [], target = rg.target;
    out.freq = f;
    if (!target && this.cfg && this.cfg.mode !== 'manual') {   // Automatik: nächste Saite (Abstand in Cent)
      var bd = Infinity;
      ss.forEach(function (s) { var d = Math.abs(cents(f, s.freq)); if (d < bd) { bd = d; target = s; } });
    }
    if (target) { out.stringId = target.id; out.note = target.note; out.cents = cents(f, target.freq); }
    return out;
  };

  var DSP = { params: P, zones: ZONES, zone: zone, yin: yin, rms: rms, cents: cents, median: median, Detector: Detector };
  if (typeof module !== 'undefined' && module.exports) module.exports = DSP;

  // ---------- Browserteil ----------
  var T = root && root.Tuner;
  if (!T || !root.document) return;

  var cfg = null, det = null, ctx = null, stream = null, analyser = null, timer = null, buf = null;
  var running = false, starting = null;

  function emitState(err) { T.bus.emit('audio-state', { running: running, error: err || null }); }
  function emitReading(r) { T.bus.emit('reading', r); }

  function tick() {
    if (!running || !analyser) return;
    analyser.getFloatTimeDomainData(buf);
    emitReading(det.process(buf));
  }

  function release() {
    if (timer) { clearInterval(timer); timer = null; }
    if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
    if (analyser) { try { analyser.disconnect(); } catch (e) {} analyser = null; }
    if (ctx) { try { ctx.close(); } catch (e) {} ctx = null; }
  }

  function errName(e) {
    var n = e && e.name;
    return (n === 'NotAllowedError' || n === 'SecurityError') ? 'NotAllowedError' : 'NotFoundError';
  }
  function fail(e) {
    var err = new Error(e && e.message || 'audio');
    err.name = errName(e);
    release(); running = false; emitState(err.name);
    return Promise.reject(err);
  }

  function stop() {
    var was = running;
    release(); running = false;
    if (det) det.reset();
    if (was) emitReading({ freq: null, cents: null, note: null, stringId: null, level: 0 });
    emitState(null);
  }

  function start() {
    if (running) return Promise.resolve();
    if (starting) return starting;
    var md = root.navigator && root.navigator.mediaDevices;
    var AC = root.AudioContext || root.webkitAudioContext;
    if (!md || !md.getUserMedia || !AC) return fail({ name: 'NotFoundError', message: 'no audio input' });
    starting = md.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false, channelCount: 1 }, video: false })
      .then(function (s) {
        stream = s;
        ctx = new AC();
        return Promise.resolve(ctx.resume ? ctx.resume() : null).then(function () {
          analyser = ctx.createAnalyser();
          analyser.fftSize = P.frame;
          analyser.smoothingTimeConstant = 0;
          ctx.createMediaStreamSource(stream).connect(analyser);
          buf = new Float32Array(analyser.fftSize);
          det = new Detector({ fs: ctx.sampleRate });
          det.configure(cfg);
          running = true;
          timer = setInterval(tick, P.hopMs);
          emitState(null);
        });
      })
      .catch(fail)
      .then(function (x) { starting = null; return x; }, function (e) { starting = null; throw e; });
    return starting;
  }

  // Tab im Hintergrund: Mikrofon freigeben (Browser drosselt Timer, Mikrofon soll nicht offen bleiben)
  function onHide() { if (running && root.document.hidden) stop(); }
  root.document.addEventListener('visibilitychange', onHide);
  root.addEventListener('pagehide', function () { if (running) stop(); });

  T.Audio = {
    // { refHz, mode: 'auto'|'manual', strings: [{id,note,freq}], targetId: string|null }
    configure: function (c) { cfg = c; if (det) det.configure(c); },
    start: start,
    stop: stop,
    isRunning: function () { return running; },
    params: P,
    zones: ZONES,
    zone: zone
  };
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
