/* Service Worker Gitarren Heinz: vollständiger Vorab-Cache, danach nur noch Cache (kein Netz nötig).
   Die Liste SHELL muss alle App-Dateien enthalten; tests/ prüft das gegen den Dateibaum. */
importScripts('version.js');
const CACHE = 'gitarrenheinz-' + self.GH_VERSION;
const SHELL = [
  './',
  'index.html',
  'manifest.webmanifest',
  'version.js',
  'css/base.css',
  'lib/core.js',
  'lib/instruments.js',
  'lib/audio.js',
  'lib/display.js',
  'lib/app.js',
  'i18n/de.json',
  'i18n/en.json',
  'instruments/index.json',
  'instruments/gitarre-klassisch.json',
  'fonts/archivo-narrow-latin-600-normal.woff2',
  'fonts/archivo-narrow-latin-700-normal.woff2',
  'fonts/LICENSE-ArchivoNarrow.txt',
  'img/walnut-panel.jpg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.indexOf('gitarrenheinz-') === 0 && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).catch(() =>
      e.request.mode === 'navigate' ? caches.match('index.html') : Response.error()
    ))
  );
});
