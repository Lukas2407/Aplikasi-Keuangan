import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/current-user';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** DELETE /api/locations/<id> */
export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const userId = await getCurrentUserId();

  // deleteMany dengan userId, bukan delete dengan id saja: id milik orang
  // lain harus menghasilkan "tidak ditemukan", bukan terhapus.
  const res = await prisma.savedLocation.deleteMany({ where: { id, userId } });
  if (res.count === 0) return NextResponse.json({ error: 'Lokasi tidak ditemukan' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
