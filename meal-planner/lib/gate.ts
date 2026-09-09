/**
 * Gerbang kata sandi sederhana untuk masa sebelum Auth.js terpasang.
 *
 * Kenapa perlu: sampai Phase D selesai, semua data jatuh ke satu pengguna
 * yang sama (lihat lib/current-user.ts). Begitu aplikasinya online tanpa
 * penjaga apa pun, siapa saja yang menemukan alamatnya bisa membaca dan
 * menulis resep, rencana makan, dan daftar belanja Anda. Satu kata sandi
 * bersama menutup celah itu dengan biaya tiga puluh baris kode.
 *
 * Ini bukan pengganti autentikasi sungguhan. Tidak ada pengguna, tidak ada
 * pemulihan kata sandi, dan siapa pun yang tahu kata sandinya melihat data
 * yang sama. Cukup untuk aplikasi pribadi, tidak cukup untuk publik.
 *
 * Tidak boleh mengimpor Prisma di sini: berkas ini ikut terpakai di
 * middleware, yang berjalan di runtime Edge.
 */

export const GATE_COOKIE = 'dk_gate';
export const GATE_MAX_AGE = 60 * 60 * 24 * 30; // 30 hari

/**
 * Nilai cookie = SHA-256 dari kata sandi digabung AUTH_SECRET. Kata sandi
 * aslinya tidak pernah disimpan di peramban, dan tanpa AUTH_SECRET nilai
 * cookie dari pemasangan lain tidak bisa dipakai ulang di sini.
 */
export async function gateToken(passphrase: string, secret: string): Promise<string> {
  const data = new TextEncoder().encode(`${passphrase}::${secret}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Perbandingan waktu tetap, supaya lama pemeriksaan tidak membocorkan isi token. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Gerbang mati kalau APP_PASSPHRASE tidak diisi, misalnya saat ngoding di lokal. */
export function gateEnabled(): boolean {
  return Boolean(process.env.APP_PASSPHRASE);
}
