// maizai-v3
// Strategy: cache ONLY content-addressed Next.js static assets (/_next/static/).
// HTML pages and API routes always go to the network — never stale.
const CACHE_NAME = "maizai-v3";
const STATIC_PREFIX = "/_next/static/";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Only intercept content-addressed static assets — they're safe to cache
  // forever because the filename hash changes with every build.
  if (!url.pathname.startsWith(STATIC_PREFIX)) return;

  event.respondWith(
    caches.match(event.request).then(
      (cached) =>
        cached ??
        fetch(event.request).then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return res;
        })
    )
  );
});
