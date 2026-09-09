import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Sedang offline' };

/**
 * Halaman cadangan yang disajikan service worker saat navigasi gagal.
 * Dibuat statis penuh (tanpa data pengguna) supaya aman ikut di-precache.
 */
export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-3 px-6 text-center">
      <span aria-hidden className="text-5xl">
        🥕
      </span>
      <h1 className="text-lg font-bold">Tidak ada koneksi</h1>
      <p className="text-sm text-muted">
        Halaman yang pernah dibuka tetap bisa dilihat. Untuk halaman baru, sambungkan internet lalu coba lagi.
      </p>
    </main>
  );
}
