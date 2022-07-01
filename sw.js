var cacheName = 'Balances';
var filesToCache = [
'/',
  'index.html',
  'CSS.css',
  'script.js',
  // 'Airplane.js',
  // 'Airplanes.js',
  // 'C206.js',
  // 'C208.js',
  // 'data.js',
  // 'GA8.js',
  // 'root.js',
  // 'script.js',
  // 'Seat.js',
  // 'Station.js'
];
self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});
self.addEventListener('activate',  event => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request, {ignoreSearch:true}).then(response => {
      return response || fetch(event.request);
    })
  );
});