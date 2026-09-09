import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/health
 * Dibuka pertama kali setelah deploy untuk memastikan tiga hal sekaligus:
 * aplikasinya hidup, environment variable-nya lengkap, dan basis datanya
 * benar-benar tersambung serta sudah dimigrasi. Jauh lebih cepat daripada
 * menebak dari halaman yang error.
 */
export async function GET() {
  const env = {
    DATABASE_URL: Boolean(process.env.DATABASE_URL),
    DIRECT_URL: Boolean(process.env.DIRECT_URL),
    APP_PASSPHRASE: Boolean(process.env.APP_PASSPHRASE),
    SOURCE_USER_AGENT: Boolean(process.env.SOURCE_USER_AGENT),
    ALLOW_DEV_USER: process.env.ALLOW_DEV_USER === '1',
  };

  let database: { ok: boolean; ingredients?: number; error?: string };
  try {
    // Menghitung baris katalog sekaligus membuktikan migrasi sudah jalan:
    // kalau tabelnya belum ada, kueri ini yang gagal, bukan halaman depan.
    const ingredients = await prisma.ingredient.count();
    database = { ok: true, ingredients };
  } catch (err) {
    database = { ok: false, error: err instanceof Error ? err.message : 'gagal menyambung' };
  }

  const peringatan: string[] = [];
  if (!env.APP_PASSPHRASE) peringatan.push('APP_PASSPHRASE kosong, siapa pun yang tahu alamatnya bisa masuk.');
  if (database.ok && database.ingredients === 0) peringatan.push('Katalog bahan kosong, jalankan npm run db:seed.');

  return NextResponse.json(
    { ok: database.ok, env, database, peringatan, waktu: new Date().toISOString() },
    { status: database.ok ? 200 : 503 },
  );
}
