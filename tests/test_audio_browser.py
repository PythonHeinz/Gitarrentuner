"""Browsertest Mikrofonpfad mit Chromiums Fake-Mikrofon (WAV-Datei als Eingang). Nur synthetisches Signal,
kein echtes Mikrofon und keine echte Gitarre (siehe docs/HANDYTEST.md)."""
import math, os, struct, sys, tempfile, wave
from playwright.sync_api import sync_playwright

BASE = os.environ.get('BASE_URL', 'http://localhost:8765/')
CHROME = os.environ.get('CHROME_PATH', '/usr/bin/google-chrome')
fails = []

def check(cond, msg):
    print(('ok   ' if cond else 'FAIL ') + msg)
    if not cond:
        fails.append(msg)

def make_wav(path, f0, cents=0, sec=6, fs=48000):
    f = f0 * 2 ** (cents / 1200)
    frames = bytearray()
    for i in range(int(sec * fs)):
        t = i / fs
        v = sum(a * math.sin(2 * math.pi * f * (k + 1) * t) for k, a in enumerate([1, .5, .33, .2])) / 2.2
        frames += struct.pack('<h', int(v * 0.5 * 32767))
    with wave.open(path, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(fs); w.writeframes(bytes(frames))

WRAP = """() => { window.__streams = [];
  const o = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
  navigator.mediaDevices.getUserMedia = c => { window.__constraints = c; return o(c).then(s => { window.__streams.push(s); return s; }); };
  window.__readings = []; window.__states = [];
  Tuner.bus.on('reading', r => window.__readings.push(r));
  Tuner.bus.on('audio-state', s => window.__states.push(s)); }"""

with sync_playwright() as p:
    tmp = tempfile.mkdtemp(); wav = os.path.join(tmp, 'a2.wav')
    make_wav(wav, 110.0, 20)        # A2 (Bezug 440), +20 Cent
    args = ['--no-sandbox', '--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream',
            f'--use-file-for-fake-audio-capture={wav}']
    browser = p.chromium.launch(executable_path=CHROME, args=args)
    ctx = browser.new_context(locale='de-DE', permissions=['microphone'])
    page = ctx.new_page(); errs = []
    page.on('pageerror', lambda e: errs.append(str(e)))
    page.goto(BASE); page.wait_for_selector('body[data-ready="1"]')
    page.evaluate(WRAP)
    check(page.evaluate('!Tuner.Audio.isPlaceholder'), 'echtes Audio-Modul geladen')

    # Automatik
    page.click('#run-btn')
    page.wait_for_function('window.__readings.some(r => r.freq !== null)', timeout=8000)
    page.wait_for_timeout(1500)
    r = page.evaluate('window.__readings.filter(r => r.freq !== null).slice(-1)[0]')
    check(r['stringId'] == 'a2' and r['note'] == 'A2', f"Automatik erkennt A2 ({r['note']})")
    check(abs(r['cents'] - 20) < 1.0, f"Abweichung +20 Cent gemessen: {r['cents']:.2f}")
    check(page.evaluate('Tuner.Audio.isRunning()'), 'läuft nach Start')
    cons = page.evaluate('window.__constraints.audio')
    check(cons['echoCancellation'] is False and cons['noiseSuppression'] is False and cons['autoGainControl'] is False,
          'Browser-Aufbereitung abgeschaltet')
    n0 = page.evaluate('window.__readings.length'); page.wait_for_timeout(1000)
    rate = page.evaluate('window.__readings.length') - n0
    check(15 <= rate <= 35, f'Messrate {rate}/s (Soll 20 bis 30)')
    check('111.' in page.inner_text('#display'), 'Anzeige erhält Messwerte')

    # Manuell: andere Saite gewählt → kein Messwert in ±200 Cent
    page.evaluate("Tuner.app.setMode('manual'); Tuner.bus.emit('string-select', {id: 'a2'})")
    page.wait_for_timeout(1500)
    r = page.evaluate('window.__readings.slice(-1)[0]')
    check(r['stringId'] == 'a2' and r['freq'] is not None and abs(r['cents'] - 20) < 1.0, 'manuell A: +20 Cent')
    page.evaluate("Tuner.bus.emit('string-select', {id: 'g3'})"); page.wait_for_timeout(1500)
    r = page.evaluate('window.__readings.slice(-1)[0]')
    check(r['freq'] is None, 'manuell G gewählt, A klingt: kein Messwert')

    # Bezugston ändern: 432 → A2 liegt bei ca. +51,8 Cent (außerhalb 'ok'), Automatik
    page.evaluate("Tuner.app.setMode('auto'); Tuner.app.setRef(432)"); page.wait_for_timeout(1500)
    r = page.evaluate('window.__readings.slice(-1)[0]')
    check(r['stringId'] == 'a2' and abs(r['cents'] - (20 + 1200 * math.log2(440 / 432))) < 1.0, f"Bezugston 432: {r['cents']:.1f} Cent")
    page.evaluate("Tuner.app.setRef(440)")

    # Stop gibt Mikrofon frei
    page.click('#run-btn'); page.wait_for_timeout(300)
    live = page.evaluate("window.__streams.flatMap(s => s.getTracks()).filter(t => t.readyState === 'live').length")
    check(live == 0, 'nach Stop kein offener Mikrofon-Track')
    check(not page.evaluate('Tuner.Audio.isRunning()'), 'nicht mehr laufend')
    last = page.evaluate('window.__readings.slice(-1)[0]')
    check(last['freq'] is None and last['level'] == 0, 'Abschluss-Reading ohne Ton')
    check(page.evaluate('window.__states.slice(-1)[0].running') is False, 'audio-state running=false')

    # Neustart nach Stop
    page.click('#run-btn'); page.wait_for_timeout(1500)
    check(page.evaluate('Tuner.Audio.isRunning()'), 'Neustart möglich')
    # Tab im Hintergrund
    page.evaluate("Object.defineProperty(document, 'hidden', {value: true, configurable: true}); document.dispatchEvent(new Event('visibilitychange'))")
    page.wait_for_timeout(300)
    check(not page.evaluate('Tuner.Audio.isRunning()'), 'Tab im Hintergrund: Mikrofon freigegeben')
    check(errs == [], f'keine Seitenfehler {errs}')
    ctx.close()

    # Fehlerfälle: Ablehnung und kein Mikrofon (getUserMedia ersetzt)
    for name, label in [('NotAllowedError', 'abgelehnt'), ('NotFoundError', 'kein Mikrofon')]:
        ctx = browser.new_context(locale='de-DE'); page = ctx.new_page()
        page.goto(BASE); page.wait_for_selector('body[data-ready="1"]')
        page.evaluate(WRAP)
        page.evaluate("n => { navigator.mediaDevices.getUserMedia = () => Promise.reject(new DOMException('x', n)); }", name)
        page.click('#run-btn'); page.wait_for_timeout(500)
        check(not page.evaluate('Tuner.Audio.isRunning()'), f'{label}: läuft nicht')
        check(page.evaluate('window.__states.slice(-1)[0].error') == name, f'{label}: audio-state error {name}')
        check(page.inner_text('#status') != '' and 'err' in page.get_attribute('#status', 'class'), f'{label}: Fehlermeldung sichtbar')
        page.click('#run-btn'); page.wait_for_timeout(300)   # erneuter Versuch möglich
        check(not page.evaluate('Tuner.Audio.isRunning()'), f'{label}: erneuter Versuch bleibt sauber')
        ctx.close()
    browser.close()

print('FEHLER: %d' % len(fails) if fails else 'Alle Audio-Browserprüfungen bestanden')
sys.exit(1 if fails else 0)
