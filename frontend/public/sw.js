const CACHE_NAME = 'packscan-v4';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Always fetch documents, navigation, and API requests directly from network
  if (
    event.request.mode === 'navigate' ||
    event.request.destination === 'document' ||
    event.request.url.includes('/api/') ||
    event.request.url.includes('/uploads/')
  ) {
    return;
  }

  // Network-first for static assets with cache fallback
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
