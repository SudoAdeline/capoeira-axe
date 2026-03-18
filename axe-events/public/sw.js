const CACHE_NAME = 'axe-events-v3';
const APP_SHELL = ['./', './index.html', './manifest.json', './logo.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  // Activate immediately — don't wait for old tabs to close
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  // Take control of all open tabs immediately
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Skip non-GET, Supabase API, and non-http(s) requests
  if (e.request.method !== 'GET') return;
  if (url.hostname.includes('supabase')) return;
  if (url.pathname.startsWith('/api/')) return;
  if (!url.protocol.startsWith('http')) return;

  // For navigation requests (HTML pages) — always go network-first
  // and don't serve stale HTML from cache
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() =>
        caches.match('./index.html').then((cached) =>
          cached || new Response('Offline', { status: 503 })
        )
      )
    );
    return;
  }

  // For hashed assets (JS/CSS with content hashes) — cache-first is fine
  if (url.pathname.startsWith('/assets/')) {
    e.respondWith(
      caches.match(e.request).then((cached) =>
        cached || fetch(e.request).then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
          }
          return res;
        })
      )
    );
    return;
  }

  // Everything else — network-first with cache fallback
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return res;
      })
      .catch(() =>
        caches.match(e.request).then((cached) =>
          cached || new Response('Offline', { status: 503 })
        )
      )
  );
});
