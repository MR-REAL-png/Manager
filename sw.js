// ═══════════════════════════════════════════════════
// service-worker.js — SE_REAL PWA Service Worker
// Cache-first untuk aset statis jarang berubah, network-first untuk API & app code
// ═══════════════════════════════════════════════════

// CACHE_NAME dinaikkan tiap kali file ini diedit signifikan, biar browser
// selalu deteksi update dengan benar (bukan nyangkut cache lama).
const CACHE_NAME = 'sereal-20260728-1';
const OFFLINE_URL = './index.html';

// File statis yang di-cache saat install
const STATIC_ASSETS = [
  './',
  './index.html',
  './css/base.css',
  './css/components.css',
  './css/pin.css',
  './js/config.js',
  './js/helpers.js',
  './js/auth.js',
  './js/dashboard.js',
  './js/dompet.js',
  './js/settings.js',
  './js/modals.js',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
];

// ── INSTALL: cache semua file statis ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── ACTIVATE: hapus cache lama ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH: strategi per jenis request ──
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET (POST/PUT append & update transaksi ditangani app-level
  // offline-queue di helpers.js, bukan di sini)
  if (request.method !== 'GET') return;

  // API calls (Vercel API / Supabase) → Network first, fallback JSON offline
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // File JS/CSS statis → Network first supaya update selalu kepakai,
  // fallback ke cache kalau offline
  if (/\.(js|css)$/.test(url.pathname)) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Navigasi (buka/reload halaman) & index.html → Network first juga,
  // supaya perubahan HTML langsung kepakai tanpa harus hard refresh.
  if (request.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('/index.html')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Aset lain (gambar, font, chart.js CDN, dll) → Cache first, fallback network
  event.respondWith(cacheFirst(request));
});

// Cache first: cek cache dulu, baru network
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return caches.match(OFFLINE_URL);
  }
}

// Network first: coba network, fallback ke cache
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Kembalikan response offline berformat JSON untuk API,
    // biar apiPost/apiPut/fetchAllData di helpers.js tetap bisa parsing normal
    return new Response(JSON.stringify({
      success: false,
      error: 'Offline — data tidak tersedia',
      offline: true,
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// ── MESSAGE: dari app untuk trigger update cache manual kalau perlu ──
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data?.type === 'CACHE_URLS') {
    const urls = event.data.urls || [];
    caches.open(CACHE_NAME).then(cache => cache.addAll(urls));
  }
});
