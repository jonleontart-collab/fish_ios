const CACHE_NAME = 'fishflow-cache-v1';
const MAP_CACHE = 'fishflow-map-tiles';
const ROUTES_CACHE = 'fishflow-routes';

// Base static assets to cache quickly
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/explore',
  '/feed'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Map Tiles Caching Strategy (Cache First for CartoCDN)
  if (url.hostname.includes('basemaps.cartocdn.com')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          const responseClone = networkResponse.clone();
          caches.open(MAP_CACHE).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return networkResponse;
        }).catch(() => {
          // Return generic error tile or transparent pixel if offline
          return new Response('', { status: 404 });
        });
      })
    );
    return;
  }

  // API Caching (Network First, fallback to Cache)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).then((networkResponse) => {
        const responseClone = networkResponse.clone();
        caches.open(ROUTES_CACHE).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return networkResponse;
      }).catch(() => {
        return caches.match(event.request);
      })
    );
    return;
  }

  // Next.js static files and pages (Stale-While-Revalidate)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse.ok) {
           const responseClone = networkResponse.clone();
           caches.open(CACHE_NAME).then((cache) => {
             cache.put(event.request, responseClone);
           });
        }
        return networkResponse;
      }).catch(() => null);

      return cachedResponse || fetchPromise;
    })
  );
});
