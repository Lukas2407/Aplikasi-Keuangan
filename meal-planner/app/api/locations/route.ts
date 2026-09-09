import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/current-user';
import { clampRadius } from '@/lib/geo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({
  label: z.string().min(1).max(60),
  address: z.string().max(300).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radiusM: z.number().optional(),
  origin: z.enum(['gps', 'nominatim', 'manual']).default('manual'),
  isDefault: z.boolean().optional(),
});

/** GET /api/locations: lokasi tersimpan milik pengguna. */
export async function GET() {
  const userId = await getCurrentUserId();
  const locations = await prisma.savedLocation.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
  });
  return NextResponse.json({ locations });
}

/** POST /api/locations: simpan lokasi pilihan ("Rumah", "Kantor"). */
export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: 'Isi permintaan bukan JSON' }, { status: 400 });
  }

  const parsed = Body.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Data lokasi tidak sah', detail: parsed.error.flatten() }, { status: 400 });
  }

  const userId = await getCurrentUserId();
  const { label, address, latitude, longitude, origin, isDefault } = parsed.data;
  const radiusM = clampRadius(parsed.data.radiusM ?? 2000);

  // Hanya boleh ada satu lokasi utama, jadi keduanya dijalankan sebagai
  // satu transaksi: turunkan yang lama, baru naikkan yang baru.
  const location = await prisma.$transaction(async (tx) => {
    if (isDefault) {
      await tx.savedLocation.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
    }
    return tx.savedLocation.upsert({
      where: { userId_label: { userId, label } },
      update: { address, latitude, longitude, radiusM, origin, isDefault: isDefault ?? false },
      create: { userId, label, address, latitude, longitude, radiusM, origin, isDefault: isDefault ?? false },
    });
  });

  return NextResponse.json({ location }, { status: 201 });
}
