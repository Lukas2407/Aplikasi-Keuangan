'use client';

import { useEffect, useState } from 'react';

/**
 * Mendaftarkan /sw.js dan menangani pembaruan.
 *
 * Service worker sengaja tidak memanggil skipWaiting() sendiri. Kalau versi
 * baru langsung mengambil alih di tengah sesi, pengguna bisa dapat campuran
 * HTML lama dengan chunk JS baru dan aplikasi error. Jadi alurnya:
 * versi baru menunggu -> banner muncul -> pengguna menekan Muat ulang.
 */
export default function ServiceWorkerRegistrar() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV === 'development') return; // hindari cache basi saat ngoding

    let reloading = false;
    const onControllerChange = () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });

        if (reg.waiting) setWaiting(reg.waiting);

        reg.addEventListener('updatefound', () => {
          const next = reg.installing;
          if (!next) return;
          next.addEventListener('statechange', () => {
            // installed + ada controller = ini pembaruan, bukan instalasi pertama
            if (next.state === 'installed' && navigator.serviceWorker.controller) {
              setWaiting(next);
            }
          });
        });

        // Cek pembaruan tiap kali aplikasi kembali ke depan layar.
        const onVisible = () => {
          if (document.visibilityState === 'visible') reg.update().catch(() => {});
        };
        document.addEventListener('visibilitychange', onVisible);
        return () => document.removeEventListener('visibilitychange', onVisible);
      } catch (err) {
        console.warn('Pendaftaran service worker gagal', err);
      }
    };

    const cleanup = register();
    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      void cleanup;
    };
  }, []);

  if (!waiting) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-3 bottom-3 z-50 flex items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-white shadow-lg"
    >
      <span className="flex-1 text-sm">Versi baru sudah siap.</span>
      <button
        type="button"
        onClick={() => waiting.postMessage('SKIP_WAITING')}
        className="rounded-xl bg-brand px-3 py-2 text-sm font-bold"
      >
        Muat ulang
      </button>
    </div>
  );
}
