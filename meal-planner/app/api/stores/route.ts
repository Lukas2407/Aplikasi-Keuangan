import { NextResponse } from 'next/server';
import { z } from 'zod';
import { readNearbyStores } from '@/lib/import/sync-stores';
import { getCurrentUserId } from '@/lib/current-user';
import { clampRadius, formatDistance } from '@/lib/geo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Query = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
  radiusM: z.coerce.number().optional(),
});

/**
 * GET /api/stores?lat=..&lon=..&radiusM=..
 * Hanya membaca dari basis data, tidak pernah memanggil sumber luar.
 * Halaman memakai ini saat dibuka, dan baru menyentuh Overpass kalau
 * pengguna menekan tombol sinkronkan.
 */
export async function GET(request: Request) {
  const sp = new URL(request.url).searchParams;
  const parsed = Query.safeParse({ lat: sp.get('lat'), lon: sp.get('lon'), radiusM: sp.get('radiusM') });
  if (!parsed.success) return NextResponse.json({ error: 'Koordinat tidak sah' }, { status: 400 });

  const radiusM = clampRadius(parsed.data.radiusM ?? 2000);
  const userId = await getCurrentUserId();
  const stores = await readNearbyStores(parsed.data.lat, parsed.data.lon, radiusM, userId);

  return NextResponse.json({
    stores: stores.map((s) => ({ ...s, distanceLabel: formatDistance(s.distanceM) })),
    attribution: 'Data toko © kontributor OpenStreetMap (ODbL)',
  });
}
