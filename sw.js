// Service worker de RadioGuía: guarda toda la app en el dispositivo para usarla sin conexión.
// La lista de archivos y la versión salen de sw-archivos.js, que genera herramientas/preparar.mjs
// (la versión cambia sola cuando cambia cualquier archivo, y eso dispara la actualización).
// versión: ea78c6c881 (la escribe herramientas/preparar.mjs; así este archivo cambia en cada versión y
// cualquier navegador, aunque solo compare sw.js y no sw-archivos.js, se entera de que hay una actualización)
importScripts("sw-archivos.js"); // define self.RG_VERSION, self.RG_ARCHIVOS y self.RG_EXTRAS
const CACHE = "radioguia-" + self.RG_VERSION;
// Las ilustraciones (la mayor parte del peso) van en una caché aparte que no cambia con cada versión:
// no frenan la instalación de una versión nueva, se bajan después de a poco y solo las que cambiaron.
// Se guardan con "?h=<hash>" para distinguir una ilustración corregida de la anterior.
const EXTRAS = "radioguia-extras";
const conHash = (a) => a + "?h=" + self.RG_EXTRAS[a];
const relativa = (url) => { const u = new URL(url); u.search = ""; return u.href.slice(self.registration.scope.length); };

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(self.RG_ARCHIVOS.map((a) => new Request(a, { cache: "reload" })))));
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const ks = await caches.keys();
    await Promise.all(ks.filter((k) => k.startsWith("radioguia-") && k !== CACHE && k !== EXTRAS).map((k) => caches.delete(k)));
    // ilustraciones que ya no están o que cambiaron
    const ex = await caches.open(EXTRAS), vigentes = new Set(Object.keys(self.RG_EXTRAS).map((a) => new URL(conHash(a), self.registration.scope).href));
    await Promise.all((await ex.keys()).filter((r) => !vigentes.has(r.url)).map((r) => ex.delete(r)));
    await self.clients.claim();
  })());
});

// baja las ilustraciones que falten, de a pocas; si se corta (sin internet, app cerrada), sigue la próxima vez
async function completarExtras() {
  const ex = await caches.open(EXTRAS), faltan = [];
  for (const a of Object.keys(self.RG_EXTRAS)) if (!(await ex.match(conHash(a)))) faltan.push(a);
  for (let i = 0; i < faltan.length; i += 6) {
    await Promise.all(faltan.slice(i, i + 6).map(async (a) => {
      try { const r = await fetch(a, { cache: "reload" }); if (r.ok) await ex.put(conHash(a), r); } catch {}
    }));
  }
}

self.addEventListener("message", (e) => {
  // la página pide activar la versión nueva cuando ya está descargada
  if (e.data === "activar") self.skipWaiting();
  // y, ya con la app andando, completar las ilustraciones para usarlas sin internet
  else if (e.data === "completar") e.waitUntil(completarExtras());
});

// primero lo guardado (rápido y sin internet); si algo no está guardado, se pide a la red
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const extra = self.RG_EXTRAS[relativa(req.url)];
    const c = await caches.open(extra ? EXTRAS : CACHE);
    if (req.mode === "navigate") return (await c.match("./index.html")) || fetch(req);
    const clave = extra ? conHash(relativa(req.url)) : req;
    const hit = await c.match(clave, { ignoreSearch: !extra });
    if (hit) return hit;
    try { const r = await fetch(req); if (r.ok) c.put(clave, r.clone()); return r; }
    catch { return new Response("Sin conexión y sin copia guardada de este archivo.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } }); }
  })());
});
