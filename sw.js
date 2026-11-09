const CACHE = 'ilhas-luiza-202611091527';
const BASE = ['./', 'index.html', 'dados.js?v=202611091527', 'arte.js?v=202611091527', 'mundo.js?v=202611091527', 'jogo.js?v=202611091527', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const guardar = r => { if (r && r.ok) { const copia = r.clone(); caches.open(CACHE).then(c => c.put(req, copia)); } return r; };
  if (url.origin === location.origin) {
    e.respondWith(fetch(req).then(guardar).catch(() => caches.match(req, { ignoreSearch: req.mode === 'navigate' }).then(r => r || caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(req).then(r => r || fetch(req).then(guardar)));
});
