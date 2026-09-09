import { NextResponse } from 'next/server';
import { z } from 'zod';
import { syncStoresAround } from '@/lib/import/sync-stores';
import { getCurrentUserId } from '@/lib/current-user';
import { formatDistance } from '@/lib/geo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radiusM: z.number().min(200).max(10_000).default(2000),
  /** true = abaikan cache dan tarik ulang dari Overpass. */
  force: z.boolean().optional(),
});

/**
 * POST /api/stores/sync
 * Tarik toko di sekitar titik pilihan pengguna, simpan, lalu kembalikan
 * daftarnya terurut dari yang terdekat.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Isi permintaan bukan JSON' }, { status: 400 });
  }

  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Parameter tidak sah', detail: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const userId = await getCurrentUserId();
    const result = await syncStoresAround({ ...parsed.data, userId });

    return NextResponse.json({
      status: result.status,
      fetched: result.fetched,
      created: result.created,
      updated: result.updated,
      lastSyncedAt: result.lastSyncedAt,
      stores: result.stores.map((s) => ({ ...s, distanceLabel: formatDistance(s.distanceM) })),
      attribution: 'Data toko © kontributor OpenStreetMap (ODbL)',
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Sinkronisasi gagal' },
      { status: 502 },
    );
  }
}
