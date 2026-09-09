import { prisma } from '@/lib/prisma';

/**
 * Penambal sementara sampai Auth.js dipasang di Phase D.
 *
 * Route handler butuh userId sekarang juga supaya alur sinkronisasi toko
 * bisa dipakai dan diuji. Daripada menyebar "TODO auth" di banyak berkas,
 * satu fungsi ini yang nanti diganti isinya dengan auth() dari Auth.js,
 * tanpa menyentuh pemanggilnya.
 *
 * Penambal ini menolak jalan di produksi, kecuali dinyalakan sengaja lewat
 * ALLOW_DEV_USER. Kalau tidak, aplikasi yang ter-deploy akan menaruh data
 * semua orang ke satu pengguna yang sama.
 */
const DEV_EMAIL = 'dev@dapurkita.local';

export async function getCurrentUserId(): Promise<string> {
  const allowDevUser = process.env.ALLOW_DEV_USER === '1';
  if (process.env.NODE_ENV === 'production' && !allowDevUser) {
    throw new Error('Belum ada autentikasi. Pasang Auth.js (Phase D) sebelum menerapkan ke produksi.');
  }

  const user = await prisma.user.upsert({
    where: { email: DEV_EMAIL },
    update: {},
    create: { email: DEV_EMAIL, name: 'Pengguna Dev' },
    select: { id: true },
  });
  return user.id;
}
