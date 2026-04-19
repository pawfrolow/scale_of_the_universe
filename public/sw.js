const CACHE = 'app-cache-v2';
const ASSETS = ['/', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();

          event.waitUntil(
            caches.open(CACHE).then((cache) => cache.put(event.request, responseClone)),
          );

          return response;
        })
        .catch(async () => {
          const cachedPage = await caches.match(event.request);

          if (cachedPage) {
            return cachedPage;
          }

          return caches.match('/');
        }),
    );

    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(event.request).then((response) => {
        if (!response.ok || event.request.url.startsWith('chrome-extension://')) {
          return response;
        }

        const responseClone = response.clone();

        event.waitUntil(
          caches.open(CACHE).then((cache) => cache.put(event.request, responseClone)),
        );

        return response;
      });
    }),
  );
});
