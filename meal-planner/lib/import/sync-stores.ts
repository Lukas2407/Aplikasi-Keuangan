import { ImportSource, ImportStatus, Prisma, StoreSource } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { boundingBox, clampRadius, coordKey, distanceMeters } from '@/lib/geo';
import { fetchStoresAround } from '@/lib/sources/overpass';

/**
 * Menarik daftar toko di sekitar satu titik dan menyimpannya ke basis data.
 *
 * Dua hal yang membuat ini bukan sekadar "fetch lalu insert":
 *
 * 1. Cache. Overpass adalah layanan sukarela. Menariknya ulang setiap kali
 *    halaman dibuka adalah pemakaian yang tidak sopan dan lambat untuk
 *    pengguna. Area yang sama tidak ditarik ulang sebelum lewat masa cache,
 *    kecuali pengguna menekan segarkan sendiri.
 * 2. Idempoten. Kunci dedup-nya osmId, jadi menarik ulang area yang
 *    bertumpang tindih memperbarui baris yang sudah ada, bukan
 *    menggandakannya. Kolom yang diisi pengguna (isFavorite) tidak pernah
 *    ditimpa oleh data dari luar.
 */

const CACHE_HOURS = Number(process.env.STORE_SYNC_CACHE_HOURS ?? 24);

export type StoreWithDistance = {
  id: string;
  name: string;
  brand: string | null;
  shopType: string | null;
  address: string | null;
  city: string | null;
  openingHours: string | null;
  latitude: number | null;
  longitude: number | null;
  osmId: string | null;
  isFavorite: boolean;
  pricesSyncedAt: Date | null;
  distanceM: number;
};

export type SyncStoresResult = {
  status: ImportStatus;
  fetched: number;
  created: number;
  updated: number;
  stores: StoreWithDistance[];
  lastSyncedAt: Date | null;
};

/** Baca toko yang sudah tersimpan di sekitar titik, terurut dari yang terdekat. */
export async function readNearbyStores(
  lat: number,
  lon: number,
  radiusM: number,
  userId?: string,
): Promise<StoreWithDistance[]> {
  const box = boundingBox(lat, lon, radiusM);

  const rows = await prisma.store.findMany({
    where: {
      latitude: { gte: box.minLat, lte: box.maxLat },
      longitude: { gte: box.minLon, lte: box.maxLon },
      // Data publik hasil sinkronisasi plus toko milik pengguna sendiri.
      OR: [{ userId: null }, ...(userId ? [{ userId }] : [])],
    },
    select: {
      id: true, name: true, brand: true, shopType: true, address: true, city: true,
      openingHours: true, latitude: true, longitude: true, osmId: true,
      isFavorite: true, pricesSyncedAt: true,
    },
    take: 300,
  });

  return rows
    .map((s) => ({
      ...s,
      distanceM:
        s.latitude !== null && s.longitude !== null
          ? distanceMeters({ latitude: lat, longitude: lon }, { latitude: s.latitude, longitude: s.longitude })
          : Number.POSITIVE_INFINITY,
    }))
    // Kotak pembatas berbentuk persegi, radius yang diminta berbentuk
    // lingkaran. Penyaringan terakhir dilakukan di sini.
    .filter((s) => s.distanceM <= radiusM)
    .sort((a, b) => a.distanceM - b.distanceM);
}

export async function syncStoresAround(params: {
  latitude: number;
  longitude: number;
  radiusM: number;
  userId?: string;
  force?: boolean;
}): Promise<SyncStoresResult> {
  const latitude = params.latitude;
  const longitude = params.longitude;
  const radiusM = clampRadius(params.radiusM);
  const cacheKey = `overpass:${coordKey(latitude, longitude)}:${radiusM}`;

  const recent = await prisma.importRun.findFirst({
    where: {
      cacheKey,
      status: ImportStatus.SUCCESS,
      startedAt: { gte: new Date(Date.now() - CACHE_HOURS * 3_600_000) },
    },
    orderBy: { startedAt: 'desc' },
  });

  if (recent && !params.force) {
    return {
      status: ImportStatus.SKIPPED,
      fetched: 0,
      created: 0,
      updated: 0,
      stores: await readNearbyStores(latitude, longitude, radiusM, params.userId),
      lastSyncedAt: recent.startedAt,
    };
  }

  const run = await prisma.importRun.create({
    data: {
      userId: params.userId ?? null,
      source: ImportSource.OVERPASS,
      cacheKey,
      params: { latitude, longitude, radiusM } as Prisma.InputJsonValue,
    },
  });

  try {
    const found = await fetchStoresAround(latitude, longitude, radiusM);
    let created = 0;
    let updated = 0;
    const now = new Date();

    for (const s of found) {
      const existing = await prisma.store.findUnique({ where: { osmId: s.osmId }, select: { id: true } });
      const data = {
        name: s.name,
        brand: s.brand ?? null,
        shopType: s.shopType ?? null,
        osmType: s.osmType,
        source: StoreSource.OSM,
        latitude: s.latitude,
        longitude: s.longitude,
        address: s.address ?? null,
        city: s.city ?? null,
        postcode: s.postcode ?? null,
        country: s.country ?? null,
        openingHours: s.openingHours ?? null,
        website: s.website ?? null,
        lastSyncedAt: now,
      };

      if (existing) {
        await prisma.store.update({ where: { id: existing.id }, data });
        updated++;
      } else {
        await prisma.store.create({ data: { ...data, osmId: s.osmId, userId: null } });
        created++;
      }
    }

    await prisma.importRun.update({
      where: { id: run.id },
      data: {
        status: ImportStatus.SUCCESS,
        itemsFetched: found.length,
        itemsCreated: created,
        itemsUpdated: updated,
        finishedAt: new Date(),
      },
    });

    return {
      status: ImportStatus.SUCCESS,
      fetched: found.length,
      created,
      updated,
      stores: await readNearbyStores(latitude, longitude, radiusM, params.userId),
      lastSyncedAt: now,
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
