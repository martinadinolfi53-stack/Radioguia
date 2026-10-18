// Service worker de RadioGuía: guarda toda la app en el dispositivo para usarla sin conexión.
// La lista de archivos y la versión salen de sw-archivos.js, que genera herramientas/preparar.mjs
// (la versión cambia sola cuando cambia cualquier archivo, y eso dispara la actualización).
importScripts("sw-archivos.js"); // define self.RG_VERSION y self.RG_ARCHIVOS
const CACHE = "radioguia-" + self.RG_VERSION;

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(self.RG_ARCHIVOS.map((a) => new Request(a, { cache: "reload" })))));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith("radioguia-") && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

// la página pide activar la versión nueva cuando ya está descargada
self.addEventListener("message", (e) => { if (e.data === "activar") self.skipWaiting(); });

// primero lo guardado (rápido y sin internet); si algo no está guardado, se pide a la red
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    if (req.mode === "navigate") return (await c.match("./index.html")) || fetch(req);
    // las correcciones hechas desde el modo edición: primero la red, para ver siempre lo último
    if (new URL(req.url).pathname.endsWith("/datos/ediciones.json")) {
      try { const r = await fetch(req, { cache: "no-cache" }); if (r.ok) { c.put(req, r.clone()); return r; } } catch {}
      return (await c.match(req, { ignoreSearch: true })) || new Response('{"ediciones":{}}', { headers: { "Content-Type": "application/json" } });
    }
    const hit = await c.match(req, { ignoreSearch: true });
    if (hit) return hit;
    try { const r = await fetch(req); if (r.ok) c.put(req, r.clone()); return r; }
    catch { return new Response("Sin conexión y sin copia guardada de este archivo.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } }); }
  })());
});
