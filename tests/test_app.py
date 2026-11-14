"""Browsertests (Playwright, Chromium). BASE_URL per Umgebung, Standard http://localhost:8765/"""
import json, os, sys
from playwright.sync_api import sync_playwright

BASE = os.environ.get('BASE_URL', 'http://localhost:8765/')
CHROME = os.environ.get('CHROME_PATH', '/usr/bin/google-chrome')
fails = []

def check(cond, msg):
    print(('ok   ' if cond else 'FAIL ') + msg)
    if not cond:
        fails.append(msg)

def new_page(browser, locale='de-DE'):
    ctx = browser.new_context(locale=locale, viewport={'width': 390, 'height': 800})
    page = ctx.new_page()
    errs = []
    page.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    page.on('pageerror', lambda e: errs.append(str(e)))
    return ctx, page, errs

def ready(page):
    page.wait_for_selector('body[data-ready="1"]', timeout=10000)

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=CHROME, args=['--no-sandbox'])

    # 1) Laden, Standardsprache aus Browser
    ctx, page, errs = new_page(browser, 'de-DE')
    page.goto(BASE); ready(page)
    check(errs == [], f'Seite lädt ohne Konsolenfehler {errs}')
    check(page.inner_text('#run-btn') == 'Start', 'Startknopf deutsch')
    check(page.inner_text('#mode-group .seg button[data-mode=auto]') == 'Automatik', 'Modus deutsch')
    check(page.evaluate('document.documentElement.lang') == 'de', 'html lang de')

    # 2) Sprachwechsel und Saitenbeschriftung H/B (Manuell → Platzhalter zeigt Mechaniken)
    page.click('#mode-group button[data-mode=manual]')
    labels_de = page.eval_on_selector_all('.ph-peg', 'els => els.map(e => e.textContent)')
    check(sorted(labels_de) == sorted(['E', 'A', 'D', 'G', 'H', 'E']), f'deutsche Saiten {labels_de}')
    page.click('#lang-btn')
    page.wait_for_function("document.documentElement.lang === 'en'")
    check(page.inner_text('#run-btn') == 'Start', 'Startknopf englisch')
    check(page.inner_text('#mode-group .seg button[data-mode=auto]') == 'Automatic', 'Modus englisch')
    labels_en = page.eval_on_selector_all('.ph-peg', 'els => els.map(e => e.textContent)')
    check(sorted(labels_en) == sorted(['E', 'A', 'D', 'G', 'B', 'E']), f'englische Saiten {labels_en}')
    check('H' not in labels_en and 'B' in labels_en, 'H/B folgt der Sprache')
    page.reload(); ready(page)
    check(page.evaluate('Tuner.lang') == 'en', 'Sprache bleibt nach Neuladen')
    check(page.evaluate("localStorage.getItem('gh.lang')") == '"en"', 'Schlüssel gh.lang')
    check(page.evaluate("localStorage.getItem('gh.mode')") == '"manual"', 'Schlüssel gh.mode bleibt')

    # 3) Bezugston
    page.evaluate("localStorage.clear()"); page.reload(); ready(page)
    check(page.inner_text('#ref-value').startswith('440'), 'Bezugston Standard 440')
    page.click('#ref-up'); page.click('#ref-up')
    check(page.inner_text('#ref-value').startswith('442'), 'Bezugston +2')
    check(page.evaluate("localStorage.getItem('gh.refHz')") == '442', 'Schlüssel gh.refHz')
    page.reload(); ready(page)
    check(page.inner_text('#ref-value').startswith('442'), 'Bezugston bleibt nach Neuladen')
    f_a2 = page.evaluate("Tuner.app.state.strings.find(s => s.id === 'a2').freq")
    check(abs(f_a2 - 110 * 442 / 440) < 1e-6, f'A2 folgt Bezugston ({f_a2:.3f} Hz)')
    page.evaluate("Tuner.app.setRef(99999)")
    check(page.evaluate('Tuner.app.state.refHz') == page.evaluate('Tuner.config.refHz.max'), 'Bezugston wird begrenzt')
    check(page.is_disabled('#ref-up'), 'Plus am Maximum gesperrt')
    page.evaluate("Tuner.app.setRef(440)")

    # 4) Modus und Schnittstelle zum Audio-Modul
    page.evaluate("""() => { window.__cfg = []; const o = Tuner.Audio.configure;
        Tuner.Audio.configure = c => { window.__cfg.push(JSON.parse(JSON.stringify(c))); o(c); }; }""")
    page.click('#mode-group button[data-mode=manual]')
    check(page.evaluate('window.__cfg.at(-1).mode') == 'manual', 'Audio erhält Modus manual')
    page.click('.ph-peg[data-id=d3]')
    last = page.evaluate('window.__cfg.at(-1)')
    check(last['targetId'] == 'd3' and abs([s for s in last['strings'] if s['id'] == 'd3'][0]['freq'] - 146.8324) < 1e-3,
          'Antippen der Mechanik setzt Zielsaite D3 (146.83 Hz)')
    page.click('#mode-group button[data-mode=auto]')
    check(page.evaluate('window.__cfg.at(-1).targetId') is None, 'Automatik: targetId null')
    check(page.is_disabled('.ph-peg[data-id=d3]'), 'Automatik: Mechaniken nicht antippbar')

    # 5) Ereignisse Audio → Anzeige und Statusmeldungen
    page.evaluate("Tuner.bus.emit('reading', {freq: 110.5, cents: 8, note: 'A2', stringId: 'a2', level: .5})")
    check('110.5 Hz' in page.inner_text('#display'), 'Anzeige erhält reading')
    page.evaluate("Tuner.bus.emit('audio-state', {running: false, error: 'NotAllowedError'})")
    check('verweigert' in page.inner_text('#status') or 'denied' in page.inner_text('#status'), 'Mikrofonfehler wird angezeigt')

    # 6) Instrumentendaten gültig
    res = page.evaluate("""async () => { const idx = await Tuner.Instruments.list(); const out = {};
        for (const id of idx.instruments) { const i = await Tuner.Instruments.load(id); out[id] = Tuner.Instruments.validate(i); }
        return out; }""")
    check(all(v == [] for v in res.values()) and len(res) >= 1, f'Instrumente gültig {res}')
    bad = page.evaluate("Tuner.Instruments.validate({id:'x', strings:[{id:'a',note:'H9',semitones:1.5}]})")
    check(len(bad) > 0, 'validate erkennt fehlerhafte Daten')
    ctx.close()

    # 7) Service Worker: Cache vollständig, Offline-Neuladen, keine fremden Anfragen
    ctx, page, errs = new_page(browser, 'de-DE')
    reqs = []
    page.on('request', lambda r: reqs.append(r.url))
    page.goto(BASE); ready(page)
    page.evaluate("navigator.serviceWorker.ready")
    page.wait_for_function("navigator.serviceWorker.controller !== null", timeout=10000)
    shell = page.evaluate("""async () => { const keys = await caches.keys(); const c = await caches.open(keys[0]);
        return { name: keys[0], urls: (await c.keys()).map(r => new URL(r.url).pathname) }; }""")
    import re
    sw = open(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'sw.js'), encoding='utf-8').read()
    block = re.search(r'const SHELL = \[(.*?)\];', sw, re.S).group(1)
    wanted = [x for x in re.findall(r"'([^']+)'", block)]
    base_path = '/' + BASE.split('/', 3)[3] if BASE.count('/') > 3 else '/'
    missing = [w for w in wanted if (base_path + ('' if w == './' else w)) not in shell['urls']]
    check(shell['name'].startswith('gitarrenheinz-') and not missing, f"Service Worker cached alles ({len(wanted)} Einträge) fehlend: {missing}")
    reqs.clear()
    ctx.set_offline(True)
    page.reload(); ready(page)
    check(page.inner_text('#run-btn') == 'Start', 'Neuladen ohne Netz funktioniert')
    page.click('#lang-btn')
    page.wait_for_function("document.documentElement.lang === 'en'")
    check(page.inner_text('#mode-group .seg button[data-mode=auto]') == 'Automatic', 'Sprachwechsel ohne Netz')
    origin = BASE.split('/', 3)[0] + '//' + BASE.split('/', 3)[2]
    foreign = [u for u in reqs if not u.startswith(origin) and not u.startswith('data:')]
    check(foreign == [], f'keine Anfragen an fremde Ursprünge {foreign}')
    check(errs == [], f'Offline ohne Konsolenfehler {errs}')
    ctx.close()
    browser.close()

if fails:
    print(f'\n{len(fails)} Test(s) fehlgeschlagen')
    sys.exit(1)
print('\ntest_app: alle Tests bestanden')
