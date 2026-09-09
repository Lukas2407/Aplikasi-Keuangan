import { ImportSource, ImportStatus, PriceSource, Prisma, Unit } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { fetchPricesForOsmLocation } from '@/lib/sources/open-prices';
import { normalizeName } from '@/lib/normalize';
import type { NormalizedPrice } from '@/lib/sources/types';

/**
 * Menarik harga komunitas (Open Prices) untuk satu toko yang sudah tersimpan.
 *
 * Jembatan antara dua sumber ini adalah id OpenStreetMap: toko yang kita
 * ambil dari Overpass punya osmId, dan setiap harga di Open Prices menunjuk
 * ke toko dengan penomoran yang sama. Tanpa itu, mencocokkan "Tesco Express"
 * di dua basis data berbeda akan jadi tebak-tebakan nama.
 */

const CACHE_HOURS = Number(process.env.PRICE_SYNC_CACHE_HOURS ?? 12);
const MAX_PAGES = 5; // 5 x 50 baris, cukup untuk satu toko sekali tarik

export type SyncPricesResult = {
  status: ImportStatus;
  fetched: number;
  created: number;
  skipped: number;
  lastSyncedAt: Date | null;
  message?: string;
};

/**
 * Harga per satuan yang bisa dibandingkan lintas ukuran kemasan.
 * 1,89 untuk 500 g dan 3,40 untuk 1 kg baru bisa diadu setelah keduanya
 * dijadikan harga per kilogram.
 */
export function computeUnitPrice(
  price: number,
  packQuantity?: number,
  packUnitRaw?: string,
): { unitPrice: number; unitPriceUnit: Unit } | null {
  if (!packQuantity || packQuantity <= 0 || !packUnitRaw) return null;
  const u = packUnitRaw.trim().toLowerCase();

  // Dibulatkan empat desimal. Tanpa ini, 1,20 untuk 750 ml keluar sebagai
  // 1.5999999999999999 dan angka itu ikut terbawa ke tampilan.
  const round = (n: number) => Math.round(n * 10_000) / 10_000;

  if (u === 'g' || u === 'gr' || u === 'gram') return { unitPrice: round(price / (packQuantity / 1000)), unitPriceUnit: Unit.KG };
  if (u === 'kg') return { unitPrice: round(price / packQuantity), unitPriceUnit: Unit.KG };
  if (u === 'ml') return { unitPrice: round(price / (packQuantity / 1000)), unitPriceUnit: Unit.L };
  if (u === 'l' || u === 'liter' || u === 'litre') return { unitPrice: round(price / packQuantity), unitPriceUnit: Unit.L };
  return null;
}

/** Petakan satuan kemasan mentah ke enum Unit, kalau dikenali. */
export function mapPackUnit(packUnitRaw?: string): Unit | null {
  if (!packUnitRaw) return null;
  const u = packUnitRaw.trim().toLowerCase();
  if (u === 'g' || u === 'gr' || u === 'gram') return Unit.G;
  if (u === 'kg') return Unit.KG;
  if (u === 'ml') return Unit.ML;
  if (u === 'l' || u === 'liter' || u === 'litre') return Unit.L;
  return null;
}

/** Cocokkan nama produk ke katalog bahan lewat nama atau sinonimnya. */
async function buildIngredientMatcher() {
  const rows = await prisma.ingredient.findMany({ select: { id: true, name: true, synonyms: true } });
  const index = new Map<string, string>();
  for (const row of rows) {
    index.set(normalizeName(row.name), row.id);
    for (const syn of row.synonyms) index.set(normalizeName(syn), row.id);
  }
  return (name: string): string | null => {
    const n = normalizeName(name);
    if (index.has(n)) return index.get(n)!;
    // Cocokkan sebagian: "tesco chicken breast fillets" mengandung "chicken breast".
    for (const [key, id] of index) {
      if (key.length >= 5 && n.includes(key)) return id;
    }
    return null;
  };
}

export async function syncPricesForStore(params: {
  storeId: string;
  userId?: string;
  force?: boolean;
  maxPages?: number;
}): Promise<SyncPricesResult> {
  const store = await prisma.store.findUnique({
    where: { id: params.storeId },
    select: { id: true, osmId: true, osmType: true, pricesSyncedAt: true, name: true },
  });
  if (!store) throw new Error('Toko tidak ditemukan');
  if (!store.osmId) {
    return {
      status: ImportStatus.SKIPPED,
      fetched: 0,
      created: 0,
      skipped: 0,
      lastSyncedAt: null,
      message: 'Toko ini ditambahkan manual, jadi tidak punya id OpenStreetMap untuk dicocokkan.',
    };
  }

  const freshUntil = new Date(Date.now() - CACHE_HOURS * 3_600_000);
  if (store.pricesSyncedAt && store.pricesSyncedAt > freshUntil && !params.force) {
    return {
      status: ImportStatus.SKIPPED,
      fetched: 0,
      created: 0,
      skipped: 0,
      lastSyncedAt: store.pricesSyncedAt,
      message: 'Harga baru saja ditarik, memakai data yang tersimpan.',
    };
  }

  const [osmType, osmNumber] = store.osmId.split('/');
  const run = await prisma.importRun.create({
    data: {
      userId: params.userId ?? null,
      source: ImportSource.OPEN_PRICES,
      cacheKey: `open-prices:${store.osmId}`,
      params: { storeId: store.id, osmId: store.osmId } as Prisma.InputJsonValue,
    },
  });

  try {
    const matchIngredient = await buildIngredientMatcher();
    const collected: NormalizedPrice[] = [];
    const limit = Math.min(params.maxPages ?? MAX_PAGES, MAX_PAGES);

    for (let page = 1; page <= limit; page++) {
      const res = await fetchPricesForOsmLocation(osmType, osmNumber, { page, size: 50 });
      collected.push(...res.prices);
      if (page >= res.pages) break;
    }

    let created = 0;
    let skipped = 0;

    for (const p of collected) {
      // externalId unik, jadi baris yang sudah pernah ditarik dilewati.
      const exists = await prisma.priceEntry.findUnique({
        where: { externalId: p.externalId },
        select: { id: true },
      });
      if (exists) {
        skipped++;
        continue;
      }

      const unit = computeUnitPrice(p.price, p.packQuantity, p.packUnitRaw);
      await prisma.priceEntry.create({
        data: {
          userId: null, // data komunitas, bukan milik satu pengguna
          storeId: store.id,
          name: p.name,
          nameNormalized: normalizeName(p.name),
          ingredientId: matchIngredient(p.name),
          externalId: p.externalId,
          productCode: p.productCode ?? null,
          sourceUrl: p.sourceUrl ?? null,
          isDiscounted: p.isDiscounted,
          price: new Prisma.Decimal(p.price.toFixed(2)),
          currency: p.currency,
          packQuantity: p.packQuantity ? new Prisma.Decimal(p.packQuantity) : null,
          packUnit: mapPackUnit(p.packUnitRaw),
          unitPrice: unit ? new Prisma.Decimal(unit.unitPrice.toFixed(4)) : null,
          unitPriceUnit: unit?.unitPriceUnit ?? null,
          source: PriceSource.IMPORT,
          observedAt: p.observedAt,
        },
      });
      created++;
    }

    const now = new Date();
    await prisma.store.update({ where: { id: store.id }, data: { pricesSyncedAt: now } });
    await prisma.importRun.update({
      where: { id: run.id },
      data: {
        status: ImportStatus.SUCCESS,
        itemsFetched: collected.length,
        itemsCreated: created,
        itemsSkipped: skipped,
        finishedAt: now,
      },
    });

    return {
      status: ImportStatus.SUCCESS,
      fetched: collected.length,
      created,
      skipped,
      lastSyncedAt: now,
      message:
        collected.length === 0
          ? 'Belum ada harga yang dilaporkan untuk toko ini di basis data terbuka.'
          : undefined,
    };
  } catch (err) {
    await prisma.importRun.update({
      where: { id: run.id },
      data: {
        status: ImportStatus.FAILED,
        errorMessage: err instanceof Error ? err.message : String(err),
        finishedAt: new Date(),
      },
    });
    throw err;
  }
}
