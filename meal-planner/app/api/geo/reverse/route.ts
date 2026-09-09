import { NextResponse } from 'next/server';
import { z } from 'zod';
import { reverseGeocode } from '@/lib/sources/nominatim';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Query = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
});

/** GET /api/geo/reverse?lat=..&lon=..: ubah titik GPS jadi nama tempat. */
export async function GET(request: Request) {
  const sp = new URL(request.url).searchParams;
  const parsed = Query.safeParse({ lat: sp.get('lat'), lon: sp.get('lon') });
  if (!parsed.success) return NextResponse.json({ error: 'Koordinat tidak sah' }, { status: 400 });

  try {
    const place = await reverseGeocode(parsed.data.lat, parsed.data.lon);
    return NextResponse.json({ place, attribution: '© kontributor OpenStreetMap' });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Gagal membaca lokasi' },
      { status: 502 },
    );
  }
}
