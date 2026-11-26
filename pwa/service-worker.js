// Fairest 100 service worker: makes the site installable and quick to open.
// The build (vite.config.ts) fills in the version and file list below and writes this out as /sw.js.
//
// What it caches:
// - The page itself: network first, so a new deploy shows up straight away. The cached copy is
//   only used when there is no signal.
// - Built files in /assets/ (their names change with every build): cache first.
// - Other files on this site (icons, manifest): served from cache, refreshed in the background.
// Supabase, album art and the radio stream are on other sites and are never touched, so live
// scores always come straight from the network.

const VERSION = '__VERSION__';
const CACHE = `fairest100-${VERSION}`;
const PRECACHE = __PRECACHE__;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key.startsWith('fairest100-') && key !== CACHE).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

async function networkFirstPage(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put('/', response.clone());
    return response;
  } catch {
    return (await cache.match('/')) || Response.error();
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) (await caches.open(CACHE)).put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request, event) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  const refresh = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    });
  if (cached) {
    event.waitUntil(refresh.catch(() => undefined));
    return cached;
  }
  return refresh;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // fairest100.au/tv (old smart-TV page) and the Chromecast receiver always come straight from the network
  if (url.pathname === '/tv' || url.pathname.startsWith('/tv/') || url.pathname === '/cast-receiver.html') return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstPage(request));
  } else if (url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(request));
  } else if (url.pathname !== '/sw.js') {
    event.respondWith(staleWhileRevalidate(request, event));
  }
});

// Tapping a song alert brings the app back to the front (or opens it)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      const open = windows.find((client) => 'focus' in client);
      return open ? open.focus() : self.clients.openWindow('/');
    })
  );
});
