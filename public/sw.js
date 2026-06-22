const CACHE_NAME = 'predict-ai-v1';
const STATIC_ASSETS = [
  '/',
  '/member',
  '/betting',
  '/alerts',
  '/lottery',
  '/live',
  '/share',
  '/community',
  '/world-cup',
];

// Install: pre-cache key pages
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: Network First → Cache Fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET and cross-origin requests
  if (event.request.method !== 'GET') return;

  // Skip chrome-extension and API calls (let them go network-only)
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/')) return;
  if (url.protocol === 'chrome-extension:') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses for static assets
        if (
          response.status === 200 &&
          (url.pathname.match(/\.(js|css|woff2?|png|jpg|svg|ico)$/) ||
            STATIC_ASSETS.includes(url.pathname))
        ) {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, cloned);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          return cached || new Response('Offline', { status: 503 });
        });
      })
  );
});
