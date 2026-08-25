// Cache minimal : l'app reste utilisable hors ligne une fois ouverte.
// Le nom du cache change à chaque version pour forcer le rafraîchissement.
const CACHE = 'dlc-v15';
const FICHIERS = ['./', './index.html', './manifest.json', './icone.png', './icone-180.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(cles =>
    Promise.all(cles.filter(c => c !== CACHE).map(c => caches.delete(c)))
  ).then(() => self.clients.claim()));
});

// Réseau d'abord : la dernière version en ligne gagne toujours sur le cache.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(r => {
        const copie = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copie)).catch(() => {});
        return r;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
