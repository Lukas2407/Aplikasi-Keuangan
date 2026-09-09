import { fetchJson, SourceError } from '@/lib/net/http';
import type { NormalizedStore } from '@/lib/sources/types';

/**
 * Pengambilan data toko dari OpenStreetMap lewat Overpass API.
 *
 * Lisensi datanya ODbL, jadi setiap tampilan yang memakainya wajib
 * mencantumkan "© kontributor OpenStreetMap". Lihat komponen atribusi di
 * halaman /stores.
 *
 * Ini bukan pengikisan halaman web: Overpass memang API resmi untuk
 * membaca data OSM. Bedanya penting, karena artinya pemakaian ini sah dan
 * stabil, bukan menebak struktur HTML orang yang bisa berubah sewaktu-waktu.
 */

const ENDPOINTS = [
  process.env.OVERPASS_URL ?? 'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];

/** Jenis toko yang relevan untuk belanja bahan makanan. */
export const SHOP_TYPES = [
  'supermarket',
  'convenience',
  'greengrocer',
  'butcher',
  'bakery',
  'seafood',
  'deli',
  'farm',
  'wholesale',
] as const;

export type OverpassElement = {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

export type OverpassResponse = { elements?: OverpassElement[] };

export function buildQuery(lat: number, lon: number, radiusM: number, limit = 120): string {
  const filter = SHOP_TYPES.join('|');
  // nwr = node, way, relation sekaligus. "out center" memberi satu titik
  // tengah untuk bangunan yang digambar sebagai poligon, sehingga jarak
  // tetap bisa dihitung tanpa mengunduh seluruh geometri.
  return [
    '[out:json][timeout:25];',
    `nwr["shop"~"^(${filter})$"](around:${Math.round(radiusM)},${lat},${lon});`,
    `out center tags ${limit};`,
  ].join('');
}

/** Ubah satu elemen Overpass jadi bentuk yang kita simpan. Null berarti dilewati. */
export function normalizeElement(el: OverpassElement): NormalizedStore | null {
  const tags = el.tags ?? {};
  const latitude = el.lat ?? el.center?.lat;
  const longitude = el.lon ?? el.center?.lon;
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return null;

  const brand = tags.brand || tags.operator || undefined;
  // Toko tanpa nama dan tanpa merek tidak berguna di daftar pilihan.
  const name = tags.name || tags['name:en'] || brand;
  if (!name) return null;

  const houseNumber = tags['addr:housenumber'];
  const street = tags['addr:street'];
  const address = [houseNumber, street].filter(Boolean).join(' ') || undefined;

  const osmType = el.type as NormalizedStore['osmType'];
  if (osmType !== 'node' && osmType !== 'way' && osmType !== 'relation') return null;

  return {
    osmId: `${osmType}/${el.id}`,
    osmType,
    name,
    brand,
    shopType: tags.shop,
    latitude,
    longitude,
    address,
    city: tags['addr:city'] || tags['addr:suburb'] || undefined,
    postcode: tags['addr:postcode'] || undefined,
    country: tags['addr:country']?.slice(0, 2).toUpperCase() || undefined,
    openingHours: tags.opening_hours || undefined,
    website: tags.website || tags['contact:website'] || undefined,
  };
}

export function normalizeResponse(data: OverpassResponse): NormalizedStore[] {
  const seen = new Set<string>();
  const out: NormalizedStore[] = [];
  for (const el of data.elements ?? []) {
    const store = normalizeElement(el);
    // Satu toko bisa muncul dua kali: sebagai titik dan sebagai bangunan.
    if (!store || seen.has(store.osmId)) continue;
    seen.add(store.osmId);
    out.push(store);
  }
  return out;
}

/**
 * Ambil toko di sekitar satu titik. Kalau endpoint utama sedang sibuk
 * (Overpass sering menjawab 429 atau 504 di jam ramai), cermin berikutnya
 * dicoba sebelum menyerah.
 */
export async function fetchStoresAround(
  lat: number,
  lon: number,
  radiusM: number,
  limit = 120,
): Promise<NormalizedStore[]> {
  const query = buildQuery(lat, lon, radiusM, limit);
  let lastError: unknown;

  for (const endpoint of ENDPOINTS) {
    try {
      const data = await fetchJson<OverpassResponse>(endpoint, {
        method: 'POST',
        body: `data=${encodeURIComponent(query)}`,
        timeoutMs: 45_000,
        retries: 1,
      });
      return normalizeResponse(data);
    } catch (err) {
      lastError = err;
    }
  }
  throw new SourceError(
    `Semua endpoint Overpass gagal: ${lastError instanceof Error ? lastError.message : 'tidak diketahui'}`,
  );
}
