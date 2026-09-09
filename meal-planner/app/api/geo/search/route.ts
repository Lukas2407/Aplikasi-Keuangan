import { NextResponse } from 'next/server';
import { z } from 'zod';
import { searchPlaces } from '@/lib/sources/nominatim';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Query = z.object({ q: z.string().min(3).max(120) });

/** GET /api/geo/search?q=camden+town: cari titik lokasi berdasarkan nama. */
export async function GET(request: Request) {
  const parsed = Query.safeParse({ q: new URL(request.url).searchParams.get('q') ?? '' });
  if (!parsed.success) {
    return NextResponse.json({ error: 'Ketik minimal 3 huruf nama tempat.' }, { status: 400 });
  }

  try {
    const results = await searchPlaces(parsed.data.q);
    return NextResponse.json({
      results,
      attribution: '© kontributor OpenStreetMap',
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Pencarian lokasi gagal' },
      { status: 502 },
    );
  }
}
