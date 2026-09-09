/* =============================================================================
   Service worker Dapur Kita.

   Ditulis tangan, bukan hasil generate Workbox, karena tiga alasan praktis:
   1. Halaman aplikasi ini bersifat personal (data per pengguna), jadi aturan
      cache-nya perlu eksplisit: HTML pengguna tidak boleh diendapkan.
   2. Tidak ada langkah build tambahan, jadi aman dipakai bersama Turbopack.
   3. Ukurannya kecil dan bisa dibaca ulang saat ada bug offline.

   Strategi:
     navigasi (HTML)      -> network first, jatuh ke cache, lalu ke /offline
     /_next/static, ikon  -> cache first (nama berkasnya sudah ber-hash)
     aset same-origin lain-> stale while revalidate
     gambar lintas domain -> stale while revalidate, jumlah dibatasi
     /api/*               -> selalu jaringan, tidak pernah di-cache
   ============================================================================= */

const VERSION = 'v1';
const SHELL = `dapurkita-shell-${VERSION}`;
const STATIC = `dapurkita-static-${VERSION}`;
const IMAGES = `dapurkita-img-${VERSION}`;
const KEEP = [SHELL, STATIC, IMAGES];

const OFFLINE_URL = '/offline';
const PRECACHE = [
  OFFLINE_URL,
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
  '/manifest.webmanifest',
];

const MAX_IMAGES = 60;

// Sengaja tanpa skipWaiting(): versi baru menunggu sampai pengguna menekan
// "Muat ulang" di banner pembaruan (lihat components/pwa/ServiceWorkerRegistrar).
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL).then((cache) => cache.addAll(PRECACHE)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => !KEEP.includes(k)).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING' || event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/** Buang entri terlama supaya cache gambar tidak tumbuh tanpa batas. */
async function trimCache(name, max) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  if (keys.length <= max) return;
  await Promise.all(keys.slice(0, keys.length - max).map((k) => cache.delete(k)));
}

async function networkFirstPage(event) {
  const cache = await caches.open(SHELL);
  try {
    const preload = await event.preloadResponse;
    const fresh = preload || (await fetch(event.request));
    // Simpan salinan agar halaman yang pernah dibuka tetap tampil saat offline.
    if (fresh && fresh.ok && fresh.type === 'basic') {
      cache.put(event.request, fresh.clone());
    }
    return fresh;
  } catch {
    const cached = await cache.match(event.request);
    return cached || (await cache.match(OFFLINE_URL)) || Response.error();
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res && (res.ok || res.type === 'opaque')) cache.put(request, res.clone());
  return res;
}

async function staleWhileRevalidate(request, cacheName, cap) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  const network = fetch(request)
    .then((res) => {
      if (res && (res.ok || res.type === 'opaque')) {
        cache.put(request, res.clone()).then(() => {
          if (cap) trimCache(cacheName, cap);
        });
      }
      return res;
    })
    .catch(() => hit);
  return hit || network;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  // API dan autentikasi tidak pernah di-cache: hasilnya personal dan cepat basi.
  if (sameOrigin && url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstPage(event));
    return;
  }

  if (sameOrigin && (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/'))) {
    event.respondWith(cacheFirst(request, STATIC));
    return;
  }

  if (request.destination === 'image') {
    event.respondWith(staleWhileRevalidate(request, IMAGES, MAX_IMAGES));
    return;
  }

  if (sameOrigin) {
    event.respondWith(staleWhileRevalidate(request, STATIC));
  }
});
