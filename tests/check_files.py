"""Statische Prüfungen ohne Browser: SHELL gegen Dateibaum, i18n-Schlüssel, Instrumentendaten."""
import json, math, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
errors = []

def err(msg):
    errors.append(msg)

# SHELL aus sw.js lesen
sw = open(os.path.join(ROOT, 'sw.js'), encoding='utf-8').read()
block = re.search(r'const SHELL = \[(.*?)\];', sw, re.S).group(1)
shell = set(re.findall(r"'([^']+)'", block)) - {'./'}

# App-Dateien im Baum (alles außer docs, tests, .git und Repo-Verwaltung)
skip_dirs = {'.git', 'docs', 'tests', 'node_modules', '__pycache__'}
skip_files = {'sw.js', 'README.md', '.nojekyll', '.gitignore'}
tree = set()
for d, dirs, files in os.walk(ROOT):
    dirs[:] = [x for x in dirs if x not in skip_dirs]
    for f in files:
        if f in skip_files:
            continue
        tree.add(os.path.relpath(os.path.join(d, f), ROOT).replace(os.sep, '/'))
for f in sorted(tree - shell):
    err(f'Datei fehlt in SHELL (sw.js): {f}')
for f in sorted(shell - tree):
    err(f'SHELL nennt fehlende Datei: {f}')

# i18n
de = json.load(open(os.path.join(ROOT, 'i18n/de.json'), encoding='utf-8'))
en = json.load(open(os.path.join(ROOT, 'i18n/en.json'), encoding='utf-8'))
for k in sorted(set(de) ^ set(en)):
    err(f'i18n-Schlüssel nur in einer Sprache: {k}')
for lang, d in (('de', de), ('en', en)):
    for k, v in d.items():
        if not isinstance(v, str) or not v.strip():
            err(f'i18n {lang}: leerer Wert {k}')

# Texte nur in i18n: index.html data-i18n-Schlüssel müssen existieren
html = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
keys = re.findall(r'data-i18n="([^"]+)"', html)
for pair in re.findall(r'data-i18n-attr="([^"]+)"', html):
    keys += [p.split(':')[1] for p in pair.split(';')]
for k in keys:
    if k not in de:
        err(f'index.html nutzt unbekannten i18n-Schlüssel: {k}')

# Instrumente
idx = json.load(open(os.path.join(ROOT, 'instruments/index.json'), encoding='utf-8'))
if idx['default'] not in idx['instruments']:
    err('instruments/index.json: default nicht in Liste')
for iid in idx['instruments']:
    p = os.path.join(ROOT, 'instruments', iid + '.json')
    if not os.path.exists(p):
        err(f'Instrument fehlt: {iid}')
        continue
    inst = json.load(open(p, encoding='utf-8'))
    if inst['id'] != iid:
        err(f'{iid}: id passt nicht zum Dateinamen')

# Gitarre klassisch: Sollfrequenzen bei 440 Hz
expect = {'e2': 82.41, 'a2': 110.00, 'd3': 146.83, 'g3': 196.00, 'b3': 246.94, 'e4': 329.63}
g = json.load(open(os.path.join(ROOT, 'instruments/gitarre-klassisch.json'), encoding='utf-8'))
for s in g['strings']:
    f = 440 * 2 ** (s['semitones'] / 12)
    if abs(f - expect[s['id']]) > 0.01:
        err(f"gitarre-klassisch {s['id']}: {f:.2f} Hz statt {expect[s['id']]}")
if [s['label']['de'] for s in g['strings']] != ['E', 'A', 'D', 'G', 'H', 'E']:
    err('gitarre-klassisch: deutsche Beschriftung nicht E A D G H E')
if [s['label']['en'] for s in g['strings']] != ['E', 'A', 'D', 'G', 'B', 'E']:
    err('gitarre-klassisch: englische Beschriftung nicht E A D G B E')

# keine externen URLs im Code
for f in sorted(shell):
    if f.endswith(('.html', '.js', '.css', '.webmanifest')):
        t = open(os.path.join(ROOT, f), encoding='utf-8').read()
        for m in re.findall(r'https?://[^\s"\')]+', t):
            err(f'externe URL in {f}: {m}')

if errors:
    print('FEHLER:')
    print('\n'.join(' - ' + e for e in errors))
    sys.exit(1)
print(f'check_files: OK ({len(shell)} Dateien in SHELL, {len(idx["instruments"])} Instrument(e))')
