// Service worker da WL Sistema: permite instalar como app e abrir a "casca" offline.
// Estratégia: sempre busca a versão mais nova na internet; usa a cópia salva só se estiver offline.
// Dados do OneDrive (outro domínio) nunca passam por aqui.
const CACHE = "wl-sistema-v10";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req).then(res => {
      const copia = res.clone();
      caches.open(CACHE).then(c => c.put(req, copia));
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match("./")))
  );
});
