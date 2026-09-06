// Kenya Government Accountability Dashboard — Service Worker
// Caches the app shell + key static assets for offline access.
// Field officers in rural counties with intermittent connectivity can
// still browse county data, MPs, and senators without a network.

const CACHE_NAME = 'kenya-govdash-v1';
// /admin is intentionally NOT in the app shell — admin pages should
// not be cached by the service worker for security reasons.
const APP_SHELL = [
  '/',
  '/manifest.json',
];

// Install — cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL).catch((err) => {
        console.warn('[SW] App shell cache failed:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate — clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch — network-first for API calls, cache-first for static assets.
// /admin routes are excluded from caching entirely (bypass to network).
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin requests (e.g. parliament.go.ke images)
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Skip /admin routes — never cache admin pages (security)
  if (url.pathname.startsWith('/admin')) return;

  // Skip /api/admin routes — never cache admin API responses (security)
  if (url.pathname.startsWith('/api/admin')) return;

  // Network-first for API calls (always get fresh data if available)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Cache-first for static assets (HTML, JS, CSS, images, etc.)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(request).then((response) => {
        if (response.ok && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      });
    })
  );
});
