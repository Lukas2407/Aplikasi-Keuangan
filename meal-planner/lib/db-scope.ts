import { prisma } from '@/lib/prisma';

/**
 * Penjaga isolasi data antar pengguna.
 *
 * Kebocoran data di aplikasi seperti ini hampir selalu berbentuk sama: satu
 * kueri lupa menyaring userId, dan pengguna A melihat resep pengguna B lewat
 * tebakan id. Dua helper di bawah membuat kelalaian itu jadi error, bukan
 * kebocoran yang diam.
 *
 * Aturannya: route handler tidak boleh memanggil prisma.<model>.findUnique
 * memakai id yang datang dari klien tanpa lewat salah satu helper ini.
 */

/** Sisipkan userId ke setiap klausa where. */
export function scoped<T extends object>(userId: string, where?: T) {
  return { ...(where ?? ({} as T)), userId };
}

type OwnedDelegate = {
  findFirst: (args: { where: { id: string; userId: string } }) => Promise<unknown>;
};

/**
 * Ambil satu baris milik pengguna, atau lempar 404 di pemanggil.
 * Memakai findFirst (bukan findUnique) supaya userId ikut jadi syarat,
 * sehingga id milik orang lain menghasilkan null, bukan baris orang itu.
 */
export async function findOwned<R>(
  model: keyof typeof prisma,
  id: string,
  userId: string,
): Promise<R | null> {
  const delegate = prisma[model] as unknown as OwnedDelegate;
  const row = await delegate.findFirst({ where: { id, userId } });
  return (row as R) ?? null;
}
