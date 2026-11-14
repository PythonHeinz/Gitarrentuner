/* Gitarren Heinz – Kern (Fundament). Kein Build, normales Skript.
   Tuner.bus                      Ereignisse zwischen Modulen (on/off/emit)
   Tuner.config                   feste Grenzen (Bezugston vorläufig, Strang Audio schlägt vor)
   Tuner.store                    localStorage mit Präfix gh.  (Schlüssel: docs/SCHNITTSTELLEN.md)
   Tuner.lang / setLang / t / esc Sprache DE|EN, Texte aus i18n/<sprache>.json
   Verfahren der Sprachwahl aus Heinz UI (lib/core.js) übernommen und angepasst. */
(function () {
  'use strict';
  var T = window.Tuner = window.Tuner || {};

  // ---------- Ereignisse ----------
  var handlers = {};
  T.bus = {
    on: function (name, fn) { (handlers[name] = handlers[name] || []).push(fn); },
    off: function (name, fn) { handlers[name] = (handlers[name] || []).filter(function (f) { return f !== fn; }); },
    emit: function (name, data) {
      (handlers[name] || []).slice().forEach(function (f) { try { f(data); } catch (e) { console.error(name, e); } });
    }
  };

  // ---------- Konfiguration ----------
  T.config = {
    refHz: { def: 440, min: 400, max: 480, step: 1 },   // vorläufig; Bereich und Schritt legt der Entwickler nach Vorschlag Audio fest
    modes: ['auto', 'manual'],
    languages: ['de', 'en']
  };

  // ---------- Speicher ----------
  var PREFIX = 'gh.';
  T.store = {
    get: function (key, fallback) {
      try {
        var v = localStorage.getItem(PREFIX + key);
        return v === null ? fallback : JSON.parse(v);
      } catch (e) { return fallback; }
    },
    set: function (key, value) {
      try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); return true; } catch (e) { return false; }
    }
  };

  // ---------- Sprache ----------
  var dicts = {};
  var browserLang = (navigator.language || 'en').toLowerCase().indexOf('de') === 0 ? 'de' : 'en';
  var saved = T.store.get('lang', null);
  T.lang = T.config.languages.indexOf(saved) >= 0 ? saved : browserLang;

  T.loadLang = function (lang) {
    if (dicts[lang]) return Promise.resolve(dicts[lang]);
    return fetch('i18n/' + lang + '.json').then(function (r) {
      if (!r.ok) throw new Error('i18n ' + lang);
      return r.json();
    }).then(function (d) { dicts[lang] = d; return d; });
  };
  T.setLang = function (lang) {
    if (T.config.languages.indexOf(lang) < 0) return Promise.resolve();
    return T.loadLang(lang).then(function () {
      T.lang = lang;
      T.store.set('lang', lang);
      document.documentElement.lang = lang;
      T.bus.emit('lang', lang);
    });
  };
  T.t = function (key, vars) {
    var s = (dicts[T.lang] && dicts[T.lang][key]) || (dicts.en && dicts.en[key]) || key;
    if (vars) Object.keys(vars).forEach(function (k) { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  };
  // Wert mit {de,en}-Objekt in aktueller Sprache
  T.pick = function (o) { return o && typeof o === 'object' ? (o[T.lang] || o.en || '') : (o || ''); };
  T.esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  };
  T.version = self.GH_VERSION || '?';
})();
