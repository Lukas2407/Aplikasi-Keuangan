import { NextResponse } from 'next/server';
import { syncPricesForStore } from '@/lib/import/sync-prices';
import { getCurrentUserId } from '@/lib/current-user';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/stores/<id>/prices/sync
 * Tarik harga komunitas untuk satu toko dari Open Prices.
 */
export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const force = new URL(request.url).searchParams.get('force') === '1';

  try {
    const userId = await getCurrentUserId();
    const result = await syncPricesForStore({ storeId: id, userId, force });
    return NextResponse.json({
      ...result,
      attribution: 'Data harga dari Open Prices (Open Food Facts), lisensi ODbL',
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Penarikan harga gagal' },
      { status: 502 },
    );
  }
}
