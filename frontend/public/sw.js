const CACHE = "court-scout-pro";
const CORE = ["./", "index.html", "manifest.json", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "apple-touch-icon.png", "favicon.png"];
const abs = (u) => new URL(u, self.registration.scope).href;

// Scarica tutti i file della build e li salva insieme; i vecchi file vengono rimossi
async function precache() {
  const mf = await (await fetch(abs("asset-manifest.json"), { cache: "no-store" })).json();
  const files = Object.values(mf.files).filter((f) => !f.endsWith(".map"));
  const urls = [...new Set([...CORE, "asset-manifest.json", ...files].map(abs))];
  const cache = await caches.open(CACHE);
  const fresh = await Promise.all(urls.map(async (u) => {
    const volatile = /\/$|\.html$|\.json$/.test(u);
    if (!volatile && (await cache.match(u))) return null;
    const r = await fetch(u, { cache: "no-store" });
    if (!r.ok) throw new Error(`precache ${u} ${r.status}`);
    return [u, r];
  }));
  await Promise.all(fresh.filter(Boolean).map(([u, r]) => cache.put(u, r)));
  const keep = new Set(urls);
  for (const req of await cache.keys()) if (!keep.has(req.url)) await cache.delete(req);
}

self.addEventListener("install", (e) => {
  e.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

const timeout = (ms) => new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms));

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;

  if (req.mode === "navigate") {
    e.respondWith((async () => {
      try {
        const res = await Promise.race([fetch(req, { cache: "no-store" }), timeout(4000)]);
        if (res.ok) e.waitUntil(precache().catch(() => {}));
        return res;
      } catch {
        const cache = await caches.open(CACHE);
        return (await cache.match(abs("index.html"))) || (await cache.match(abs("./"))) || Response.error();
      }
    })());
    return;
  }

  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  })());
});
