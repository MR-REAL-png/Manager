// SE_REAL Service Worker — cache app shell biar tetap kebuka walau offline
const CACHE_NAME = 'sereal-shell-v1';

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.add('/').catch(() => {})));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Jangan campur tangan request ke backend (Vercel API / Supabase) —
  // biar app-level offline-queue (mm_pending_tx) yang handle logika sync-nya.
  if (url.hostname.includes('vercel.app') || url.hostname.includes('supabase.co') || url.pathname.startsWith('/api/')) {
    return;
  }
  if (e.request.method !== 'GET') return;

  // Cache-first untuk asset statis (html/css/js/gambar) — langsung dari cache kalau ada
  // (biar cepat & tetap jalan offline), sambil update cache di background.
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetchPromise = fetch(e.request).then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
