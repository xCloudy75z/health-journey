// src/sw.js — cache the app shell for offline; update on new version.
var CACHE = 'hj-__VERSION__';
var ASSETS = ['./', './index.html', './manifest.webmanifest', './icons/apple-touch-icon-180.png', './icons/icon.svg'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
// Network-first for the document (so a new deploy shows up), cache-first for the rest.
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var isDoc = e.request.mode === 'navigate';
  e.respondWith(
    isDoc
      ? fetch(e.request).then(function (r) { var cp = r.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, cp); }); return r; }).catch(function () { return caches.match('./index.html'); })
      : caches.match(e.request).then(function (r) { return r || fetch(e.request); })
  );
});
