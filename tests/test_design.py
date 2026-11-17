"""Browsertests der Anzeige (Strang Design): Zustände, LED, Nadel, Mechaniken, Themen, Sprache, Größe.
BASE_URL per Umgebung (Standard http://localhost:8765/). Bildschirmfotos nach tests/out/ (nicht im Repo)."""
import os, re, sys
from playwright.sync_api import sync_playwright

BASE = os.environ.get('BASE_URL', 'http://localhost:8765/')
CHROME = os.environ.get('CHROME_PATH', '/usr/bin/google-chrome')
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out')
os.makedirs(OUT, exist_ok=True)
fails = []

def check(cond, msg):
    print(('ok   ' if cond else 'FAIL ') + msg)
    if not cond:
        fails.append(msg)

def new_page(browser, locale='de-DE', url=''):
    ctx = browser.new_context(locale=locale, viewport={'width': 426, 'height': 803}, device_scale_factor=2)
    page = ctx.new_page()
    errs = []
    page.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    page.on('pageerror', lambda e: errs.append(str(e)))
    page.goto(BASE + url)
    page.wait_for_selector('body[data-ready="1"]', timeout=10000)
    page.evaluate('document.fonts.ready')
    return ctx, page, errs

def reading(page, cents, sid='a2', note='A2', freq=110.0):
    page.evaluate("([c, s, n, f]) => Tuner.bus.emit('reading', {freq: f, cents: c, note: n, stringId: s, level: .5})", [cents, sid, note, freq])

def needle_angle(page):
    page.wait_for_timeout(1300)   # Feder schwingt aus
    t = page.get_attribute('.needle', 'transform')
    return float(re.search(r'rotate\(([-\d.]+)', t).group(1))

def led(page):
    return page.get_attribute('.led', 'data-led')

def txt(page, sel):
    return page.text_content(sel).strip()

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=CHROME, args=['--no-sandbox'])

    for theme in ('warm', 'hell'):
        ctx, page, errs = new_page(browser)
        page.evaluate(f"Tuner.Display.setTheme('{theme}')")
        check(page.evaluate('document.documentElement.dataset.theme') == theme, f'[{theme}] Thema gesetzt')
        check(page.evaluate("document.fonts.check('600 16px \"Archivo Narrow\"')"), f'[{theme}] Rackschrift geladen (offline aus fonts/)')
        ff = page.evaluate("getComputedStyle(document.querySelector('.state')).fontFamily")
        check('Archivo Narrow' in ff, f'[{theme}] Rackschrift im Einsatz')
        check(page.evaluate('document.documentElement.scrollHeight <= innerHeight'), f'[{theme}] kein Überlauf auf 426 x 803')
        check(page.query_selector('.led') is not None and led(page) == 'off', f'[{theme}] LED vorhanden, ohne Ton aus')
        check(len(page.query_selector_all('.peg')) == 6, f'[{theme}] sechs Mechaniken')
        small = [p_ for p_ in page.query_selector_all('.peg .hit') if min(p_.bounding_box()['width'], p_.bounding_box()['height']) < 48]
        check(not small, f'[{theme}] Tippflächen der Mechaniken mindestens 48 px')
        k = page.query_selector('.peg .k').bounding_box()
        check(k['width'] >= 42, f'[{theme}] sichtbarer Knopf {k["width"]:.0f} px')
        page.screenshot(path=os.path.join(OUT, f'{theme}_0_keine_eingabe.png'))

        # Zustände: zu tief (rot), zu hoch (gelb), gestimmt (grün)
        page.evaluate('Tuner.Display.setRunning(true)')
        reading(page, -31)
        a = needle_angle(page)
        check(abs(a - (-31 / 50 * 62)) < 0.6, f'[{theme}] Nadel bei −31 ct ({a:.1f}°)')
        check(led(page) == 'red', f'[{theme}] −31 ct: LED rot')
        check(txt(page, '.state').lower() == 'zu tief', f'[{theme}] Text „Zu tief“')
        check(page.eval_on_selector('.zl.hit', 'e => e.textContent') == '--', f'[{theme}] Zone „--“ markiert')
        check(txt(page, '.big') == 'A', f'[{theme}] große Anzeige A')
        page.screenshot(path=os.path.join(OUT, f'{theme}_1_zu_tief.png'))
        reading(page, 12, 'g3', 'G3', 197.4)
        a = needle_angle(page)
        check(abs(a - 12 / 50 * 62) < 0.6 and led(page) == 'yellow' and txt(page, '.state').lower() == 'zu hoch', f'[{theme}] +12 ct: Nadel {a:.1f}°, LED gelb, „Zu hoch“')
        check('+12' in txt(page, '.small') and '197,4' in txt(page, '.small'), f'[{theme}] Messwerte deutsch (Komma, Vorzeichen)')
        page.screenshot(path=os.path.join(OUT, f'{theme}_2_zu_hoch.png'))
        reading(page, 2, 'e2', 'E2', 82.5)
        needle_angle(page)
        check(led(page) == 'green' and txt(page, '.state').lower() == 'gestimmt', f'[{theme}] +2 ct: LED grün, „Gestimmt“')
        check('ok' in (page.get_attribute('.zl.ok', 'class') or '') and txt(page, '.zl.ok') == '0', f'[{theme}] Zone „0“ markiert')
        page.screenshot(path=os.path.join(OUT, f'{theme}_3_gestimmt.png'))

        # Schwellen (nur an einer Stelle: Tuner.Audio.zones)
        for c, want in ((5, 'green'), (5.5, 'yellow'), (-20, 'yellow'), (20.5, 'red'), (-50, 'red'), (0, 'green')):
            reading(page, c)
            check(led(page) == want, f'[{theme}] {c} ct → LED {want}')
        # Zielbereich außerhalb der Skala: Nadel begrenzt
        reading(page, 80)
        check(abs(needle_angle(page) - 62) < 0.6, f'[{theme}] Nadel an Skalenende begrenzt')

        # Kurze Aussetzer: Anzeige bleibt, danach Ruhelage links
        reading(page, 10)
        page.evaluate("Tuner.bus.emit('reading', {freq: null, cents: null, note: null, stringId: null, level: 0})")
        page.wait_for_timeout(300)
        check(led(page) == 'yellow', f'[{theme}] kurzer Aussetzer hält die Anzeige')
        page.wait_for_timeout(1300)
        check(led(page) == 'off' and abs(needle_angle(page) + 62) < 0.6, f'[{theme}] ohne Ton: LED aus, Nadel am linken Anschlag')
        check(txt(page, '.small').lower() == 'saite anschlagen', f'[{theme}] Hinweis „Saite anschlagen“')

        # Mechaniken
        page.evaluate("window.__sel = []; Tuner.bus.on('string-select', e => window.__sel.push(e.id))")
        page.click('.peg[data-id=g3]', force=True)
        check(page.evaluate('window.__sel') == [], f'[{theme}] Automatik: Antippen sendet nichts')
        page.click('#mode-group button[data-mode=manual]')
        check(txt(page, '.small').lower() == 'mechanik antippen', f'[{theme}] Manuell ohne Auswahl: Hinweis')
        for sid in ('e2', 'a2', 'd3', 'g3', 'b3', 'e4'):
            page.click(f'.peg[data-id={sid}]')
        check(page.evaluate('window.__sel') == ['e2', 'a2', 'd3', 'g3', 'b3', 'e4'], f'[{theme}] alle sechs Mechaniken lösen string-select aus')
        check('sel' in page.get_attribute('.peg[data-id=e4]', 'class'), f'[{theme}] gewählte Mechanik hervorgehoben')
        page.focus('.peg[data-id=a2]'); page.keyboard.press('Enter')
        check(page.evaluate('window.__sel').pop() == 'a2', f'[{theme}] Mechanik per Tastatur wählbar')
        page.screenshot(path=os.path.join(OUT, f'{theme}_4_manuell.png'))

        # Mikrofonfehler bleibt sichtbar (Statuszeile)
        page.evaluate("Tuner.bus.emit('audio-state', {running: false, error: 'NotAllowedError'})")
        check(page.is_visible('#status'), f'[{theme}] Mikrofonfehler sichtbar')
        check(errs == [], f'[{theme}] keine Konsolenfehler {errs}')
        ctx.close()

    # Sprache: H/B, Texte, Dezimalzeichen
    ctx, page, errs = new_page(browser, 'de-DE')
    page.evaluate('Tuner.Display.setRunning(true)'); reading(page, -31, 'b3', 'B3', 243.9)
    check(txt(page, '.big') == 'H' and txt(page, '.small').startswith('H3'), 'deutsch: Saite H, Note H3')
    page.click('#lang-btn'); page.wait_for_function("document.documentElement.lang === 'en'")
    reading(page, -31, 'b3', 'B3', 243.9)
    check(txt(page, '.big') == 'B' and txt(page, '.small').startswith('B3') and '243.9' in txt(page, '.small'), 'englisch: Saite B, Punkt als Dezimalzeichen')
    check(txt(page, '.state').lower() == 'too low', 'englisch: Text „Too low“')
    check(page.get_attribute('.peg[data-id=b3]', 'aria-label') == 'String B', 'englisch: Beschriftung der Mechanik')
    ctx.close()

    # Themenwechsel per Taste, bleibt nach Neuladen
    ctx, page, errs = new_page(browser)
    check(page.evaluate('document.documentElement.dataset.theme') == 'warm', 'Standardthema warm')
    page.click('.themekey')
    check(page.evaluate('document.documentElement.dataset.theme') == 'hell' and txt(page, '.themekey').lower() == 'hell', 'Designtaste wechselt auf Hell')
    check(page.evaluate("localStorage.getItem('gh.theme')") == '"hell"', 'Schlüssel gh.theme')
    page.reload(); page.wait_for_selector('body[data-ready="1"]')
    check(page.evaluate('document.documentElement.dataset.theme') == 'hell', 'Thema bleibt nach Neuladen')
    check(page.evaluate("document.querySelector('meta[name=theme-color]').content") == '#e6e3dc', 'theme-color folgt dem Thema')
    check(page.evaluate("document.querySelector('.themekey').getBoundingClientRect().height") >= 48, 'Designtaste mindestens 48 px hoch')
    ctx.close()

    # Laufend-Zustand am Startknopf
    ctx, page, errs = new_page(browser)
    check(page.evaluate('document.documentElement.dataset.running') in (None, '0'), 'Start: nicht laufend')
    page.evaluate("Tuner.bus.emit('audio-state', {running: true, error: null})")
    check(page.evaluate('document.documentElement.dataset.running') == '1', 'laufend wird am Dokument markiert')
    ctx.close()

    # Demo-Modus
    ctx, page, errs = new_page(browser, url='?demo=1')
    check(page.query_selector('.demo input') is not None, 'Demo-Modus (?demo=1) zeigt Regler')
    page.evaluate("() => { const r = document.querySelector('.demo input'); r.value = -40; r.dispatchEvent(new Event('input')); }"); page.wait_for_timeout(500)
    check(led(page) == 'red' and errs == [], f'Demo: −40 ct → LED rot {errs}')
    ctx.close()
    browser.close()

if fails:
    print(f'\n{len(fails)} Test(s) fehlgeschlagen')
    sys.exit(1)
print('\ntest_design: alle Tests bestanden')
