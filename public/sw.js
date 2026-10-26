// Migration kill switch for the old preview worker. Production generateSW replaces
// this output with the managed offline worker; this project has not been published.
function isAppCache(name) {
  const workboxBucket = /(^|-)precache-v\d+-|(^|-)runtime-|(^|-)googleAnalytics-/.test(name);
  return (workboxBucket && name.endsWith(self.registration.scope)) ||
    /^vitala-v\d+-(shell|assets)$/.test(name);
}

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil((async () => {
  try {
    const names = await caches.keys();
    await Promise.allSettled(names.filter(isAppCache).map((name) => caches.delete(name)));
    await self.clients.claim();
    const clients = await self.clients.matchAll({ type: "window" });
    await Promise.allSettled(clients.map((client) => client.navigate(client.url)));
  } finally {
    await self.registration.unregister();
  }
})()));
