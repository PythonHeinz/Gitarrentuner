/* Tests der Tonerkennung mit synthetischen Signalen (Node, ohne Browser). Aufruf: node tests/test_audio.js
   Gibt am Ende eine Genauigkeitstabelle aus (Quelle für docs/AUDIO.md). Echte Gitarre/Mikrofon: docs/HANDYTEST.md. */
'use strict';
const path = require('path');
const A = require(path.join(__dirname, '..', 'lib', 'audio.js'));
const inst = require(path.join(__dirname, '..', 'instruments', 'gitarre-klassisch.json'));

let fails = 0;
function check(cond, msg) { console.log((cond ? 'ok   ' : 'FAIL ') + msg); if (!cond) fails++; }

function strings(ref) {
  return inst.strings.map(s => ({ id: s.id, note: s.note, freq: ref * Math.pow(2, s.semitones / 12) }));
}
// Pseudozufall (reproduzierbar)
let seed = 12345;
function rnd() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 - 0.5; }

// Signal: Grundton + Obertöne, Abklingen, optional Rauschen; Pegel als Spitzenwert in dBFS
function synth(opts) {
  const fs = opts.fs || 48000, n = Math.round((opts.dur || 1.5) * fs);
  const h = opts.harm || [1, 0.5, 0.33, 0.2];
  const peak = Math.pow(10, (opts.db === undefined ? -12 : opts.db) / 20);
  const x = new Float32Array(n);
  let mx = 0;
  for (let i = 0; i < n; i++) {
    const t = i / fs;
    let v = 0;
    for (let k = 0; k < h.length; k++) v += h[k] * Math.sin(2 * Math.PI * opts.f * (k + 1) * t + k);
    v *= Math.exp(-(opts.decay === undefined ? 1.2 : opts.decay) * t);
    if (opts.attack && t < 0.03) v += opts.attack * rnd() * 2;   // Anschlagsgeräusch
    x[i] = v; mx = Math.max(mx, Math.abs(v));
  }
  for (let i = 0; i < n; i++) x[i] = x[i] / mx * peak + (opts.noise ? opts.noise * rnd() * 2 : 0);
  return x;
}

// Signal in Fenstern wie im Browser durch den Detector schicken; liefert alle Readings
function run(sig, cfg, fs) {
  const d = new A.Detector({ fs });
  d.configure(cfg);
  const hop = Math.round(fs * A.params.hopMs / 1000), out = [];
  for (let end = A.params.frame; end <= sig.length; end += hop) out.push({ t: end / fs, r: d.process(sig.subarray(end - A.params.frame, end)) });
  return out;
}
const pad = (sig, fs, lead) => { const o = new Float32Array(sig.length + Math.round(lead * fs)); o.set(sig, o.length - sig.length); return o; };

// Auswertung: Median der Readings im Zeitfenster [t0, t1]
function centsErr(rs, t0, t1, wantId) {
  const v = rs.filter(o => o.t >= t0 && o.t <= t1 && o.r.freq !== null);
  const all = rs.filter(o => o.t >= t0 && o.t <= t1);
  const e = v.map(o => o.r.cents);
  return { n: v.length, of: all.length, err: e.length ? A.median(e) : null,
           maxAbs: e.length ? Math.max(...e.map(Math.abs)) : null,
           ids: new Set(v.map(o => o.r.stringId)), wrong: wantId ? v.filter(o => o.r.stringId !== wantId).length : 0 };
}

const table = [];

// 1) Alle Saiten, Obertonreihe, Abtastraten 44,1/48 kHz, Bezugston 435/440/445, Verstimmung -50..+50 Cent, Automatik
for (const fs of [48000, 44100]) {
  for (const ref of [435, 440, 445]) {
    let worst = 0, bad = 0, wrongId = 0;
    for (const s of strings(ref)) {
      for (const off of [-50, -20, 0, 20, 50]) {
        const f = s.freq * Math.pow(2, off / 1200);
        const rs = run(synth({ f, fs, dur: 1.2 }), { refHz: ref, mode: 'auto', strings: strings(ref), targetId: null }, fs);
        const c = centsErr(rs, 0.5, 1.2, s.id);
        if (c.n < 5 || c.err === null) { bad++; continue; }
        worst = Math.max(worst, Math.abs(c.err - off)); wrongId += c.wrong;
      }
    }
    table.push(`Automatik, ${fs} Hz, Bezug ${ref} Hz, 6 Saiten × 5 Verstimmungen: größte Abweichung ${worst.toFixed(2)} Cent, ohne Ergebnis ${bad}, falsche Saite ${wrongId}`);
    check(bad === 0, `Automatik ${fs}/${ref}: alle Töne erkannt`);
    check(worst < 1.0, `Automatik ${fs}/${ref}: Fehler < 1 Cent (${worst.toFixed(2)})`);
    check(wrongId === 0, `Automatik ${fs}/${ref}: richtige Saite`);
  }
}

// 2) Schwacher Grundton (starker zweiter Oberton), tiefe Saiten – typischer Oktavfehler
{
  let worst = 0, bad = 0;
  for (const s of strings(440).slice(0, 3)) {
    for (const harm of [[0.25, 1, 0.7, 0.4], [0.15, 1, 0.9, 0.6, 0.3], [1, 1.2, 0.8]]) {
      const rs = run(synth({ f: s.freq * 1.01, harm }), { refHz: 440, mode: 'auto', strings: strings(440), targetId: null }, 48000);
      const c = centsErr(rs, 0.5, 1.4, s.id);
      if (c.n < 5) { bad++; continue; }
      worst = Math.max(worst, Math.abs(c.err - 17.2), c.wrong ? 99 : 0);
    }
  }
  table.push(`schwacher Grundton (Oberton 2 stärker), tiefe Saiten: größte Abweichung ${worst.toFixed(2)} Cent, ohne Ergebnis ${bad}`);
  check(bad === 0 && worst < 1.5, `schwacher Grundton: kein Oktavfehler (Abw. ${worst.toFixed(2)}, ohne Ergebnis ${bad})`);
}

// 3) Manueller Modus: Messung zur gewählten Saite; weit entfernter Ton liefert keine falsche Zahl zur Saite
{
  const ss = strings(440), g = ss.find(s => s.id === 'g3'), a = ss.find(s => s.id === 'a2');
  const f = g.freq * Math.pow(2, 30 / 1200);
  const rs = run(synth({ f }), { refHz: 440, mode: 'manual', strings: ss, targetId: 'g3' }, 48000);
  const c = centsErr(rs, 0.5, 1.4, 'g3');
  check(c.n > 10 && Math.abs(c.err - 30) < 1 && c.wrong === 0, `manuell G +30 Cent: ${c.err && c.err.toFixed(2)} Cent`);
  // A-Saite gezupft, G gewählt: außerhalb ±2 Halbtöne → kein Ton (nicht fälschlich „sehr tief“)
  const rs2 = run(synth({ f: a.freq }), { refHz: 440, mode: 'manual', strings: ss, targetId: 'g3' }, 48000);
  const wrongRange = rs2.filter(o => o.t >= 0.5 && o.r.freq !== null && Math.abs(o.r.cents) < 200).length;
  check(wrongRange === 0, 'manuell: kein Messwert innerhalb ±200 Cent, wenn eine andere Saite klingt');
  // Keine Zielsaite gewählt (manuell ohne Auswahl): freq ja, cents/stringId null
  const rs3 = run(synth({ f: a.freq }), { refHz: 440, mode: 'manual', strings: ss, targetId: null }, 48000);
  const last = rs3[rs3.length - 1].r;
  check(last.freq !== null && last.cents === null && last.stringId === null, 'manuell ohne Auswahl: nur Frequenz');
  // Bezugston ändert Sollfrequenz: 432-Hz-Stimmung, A-Saite exakt auf 440-Raster → ca. +31,8 Cent
  const ss432 = strings(432);
  const rs4 = run(synth({ f: a.freq }), { refHz: 432, mode: 'auto', strings: ss432, targetId: null }, 48000);
  const c4 = centsErr(rs4, 0.5, 1.4, 'a2');
  check(Math.abs(c4.err - 1200 * Math.log2(440 / 432)) < 1, `Bezugston 432: A bei 110 Hz = ${c4.err && c4.err.toFixed(1)} Cent`);
}

// 4) Gate, Rauschen, leise Signale
{
  const ss = strings(440), cfg = { refHz: 440, mode: 'auto', strings: ss, targetId: null };
  const silence = run(new Float32Array(48000 * 1.5), cfg, 48000);
  check(silence.every(o => o.r.freq === null), 'Stille: kein Ton');
  let noiseHits = 0, total = 0;
  for (const amp of [0.02, 0.1, 0.5]) {
    const n = new Float32Array(72000); for (let i = 0; i < n.length; i++) n[i] = amp * rnd() * 2;
    const rs = run(n, cfg, 48000); total += rs.length; noiseHits += rs.filter(o => o.r.freq !== null).length;
  }
  table.push(`weißes Rauschen (3 Pegel), ${total} Messungen: ${noiseHits} fälschlich als Ton`);
  check(noiseHits === 0, `Rauschen: keine falschen Töne (${noiseHits}/${total})`);

  const a = ss.find(s => s.id === 'a2');
  const quiet = run(synth({ f: a.freq, db: -40, decay: 0.3, dur: 1.5 }), cfg, 48000);
  const cq = centsErr(quiet, 0.5, 1.4, 'a2');
  check(cq.n > 10 && Math.abs(cq.err) < 1, `leises Signal (−40 dBFS Spitze) erkannt, Abw. ${cq.err && cq.err.toFixed(2)} Cent`);
  const tooQuiet = run(synth({ f: a.freq, db: -62, decay: 0.3, dur: 1.5 }), cfg, 48000);
  check(tooQuiet.every(o => o.r.freq === null), 'zu leises Signal (−62 dBFS): unter dem Gate, kein Ton');

  // Signal mit Rauschen (Störpegel ca. 20 dB unter Signal)
  const nz = run(synth({ f: a.freq * Math.pow(2, 10 / 1200), db: -10, noise: 0.03, decay: 0.3 }), cfg, 48000);
  const cn = centsErr(nz, 0.5, 1.4, 'a2');
  check(cn.n > 10 && Math.abs(cn.err - 10) < 3, `Signal mit Rauschen: ${cn.err && cn.err.toFixed(2)} Cent (Soll 10)`);
  table.push(`Signal mit Rauschen (ca. 20 dB Abstand): Abweichung ${cn.err === null ? '–' : Math.abs(cn.err - 10).toFixed(2)} Cent`);
}

// 5) Anschlag und Abklingen: Anschlagsgeräusch verfälscht nicht; nach Ende des Tons kommt Stille (Gate + Median)
{
  const ss = strings(440), cfg = { refHz: 440, mode: 'auto', strings: ss, targetId: null }, d = ss.find(s => s.id === 'd3');
  const tone = synth({ f: d.freq, dur: 1.0, attack: 0.8, decay: 0.8 });
  const sig = new Float32Array(48000 * 3); sig.set(tone, 24000);   // 0,5 s Stille, 1 s Ton, 1,5 s Stille
  const rs = run(sig, cfg, 48000);
  const during = rs.filter(o => o.t > 0.5 + 0.25 && o.t < 1.5 && o.r.freq !== null);
  const worst = Math.max(...during.map(o => Math.abs(o.r.cents)));
  check(during.length > 10 && worst < 1.5, `Anschlag: Messwerte nach 250 ms ohne Ausreißer (max ${worst.toFixed(2)} Cent)`);
  const early = rs.filter(o => o.t > 0.5 && o.t < 0.5 + 0.12 && o.r.freq !== null).length;
  check(early === 0, 'Anschlag: in den ersten ca. 120 ms keine Ausgabe');
  const late = rs.filter(o => o.t > 2.4 && o.r.freq !== null).length;
  check(late === 0, 'nach dem Ausklingen: kein Ton mehr');
}

// 6) Zonen
{
  const z = A.zone;
  check(z(0) === '0' && z(5) === '0' && z(-5) === '0', 'Zone 0 bis ±5 Cent');
  check(z(5.1) === '+' && z(20) === '+' && z(-5.1) === '-' && z(-20) === '-', 'Zone -/+ bis ±20 Cent');
  check(z(20.1) === '++' && z(-50) === '--', 'Zone --/++ darüber');
  check(z(null) === null, 'Zone ohne Messwert: null');
}

// 7) Rechenzeit je Auswertung (Richtwert)
{
  const sig = synth({ f: 82.41, dur: 0.5 }).subarray(0, 4096);
  const d = new A.Detector({ fs: 48000 }); d.configure({ refHz: 440, mode: 'auto', strings: strings(440), targetId: null });
  const t0 = process.hrtime.bigint(); for (let i = 0; i < 100; i++) { d.loud = 99; d.process(sig); }
  const ms = Number(process.hrtime.bigint() - t0) / 1e6 / 100;
  table.push(`Rechenzeit je Auswertung (Automatik, tiefste Saite, Node auf Container-CPU): ${ms.toFixed(2)} ms bei ${A.params.hopMs} ms Takt`);
  check(ms < 20, `Rechenzeit ${ms.toFixed(2)} ms < 20 ms`);
}

console.log('\n--- Genauigkeit (synthetisch) ---'); table.forEach(l => console.log('- ' + l));
console.log(fails ? `\n${fails} Prüfung(en) FEHLGESCHLAGEN` : '\nAlle Audio-Prüfungen bestanden');
process.exit(fails ? 1 : 0);
