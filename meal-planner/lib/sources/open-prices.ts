import { fetchJson } from '@/lib/net/http';
import type { NormalizedPrice } from '@/lib/sources/types';

/**
 * Open Prices (prices.openfoodfacts.org), basis data harga belanja terbuka
 * dari proyek Open Food Facts. Datanya dikumpulkan sukarelawan: seseorang
 * memotret label harga di rak, dan hasilnya dipublikasikan dengan lisensi
 * terbuka, lengkap dengan toko (mengacu ke id OpenStreetMap) dan tanggal.
 *
 * Kenapa sumber ini, bukan mengikis situs Tesco atau Indomaret:
 *   - situs peritel melarangnya di syarat layanan, dan memasang proteksi bot;
 *   - strukturnya berubah tanpa pemberitahuan, jadi selalu rusak;
 *   - datanya bukan milik kita untuk disimpan dan disebar.
 * Open Prices justru dibuat untuk dipakai begini.
 *
 * Konsekuensi jujur yang harus disampaikan ke pengguna: cakupannya timpang.
 * Kota besar Eropa lumayan terisi, banyak daerah lain kosong sama sekali.
 * Karena itu harga hasil impor selalu dianggap cadangan, dan harga catatan
 * pengguna sendiri yang menang saat keduanya ada.
 */

const BASE = process.env.OPEN_PRICES_URL ?? 'https://prices.openfoodfacts.org/api/v1';

type RawPrice = {
  id?: number | string;
  product_code?: string | null;
  product_name?: string | null;
  category_tag?: string | null;
  price?: number | string | null;
  price_without_discount?: number | string | null;
  price_is_discounted?: boolean | null;
  currency?: string | null;
  date?: string | null;
  created?: string | null;
  location_osm_id?: number | string | null;
  location_osm_type?: string | null;
  product_quantity?: number | string | null;
  product_quantity_unit?: string | null;
  product?: { product_name?: string | null; product_quantity?: number | string | null; product_quantity_unit?: string | null } | null;
};

type PricesResponse = { items?: RawPrice[]; total?: number; page?: number; pages?: number };

const toNumber = (v: unknown): number | undefined => {
  if (v === null || v === undefined || v === '') return undefined;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : undefined;
};

/**
 * "en:apples" atau "en:whole-milk" jadi "apples" / "whole milk".
 * Dipakai untuk produk curah yang tidak punya barcode.
 */
export function categoryTagToName(tag: string): string {
  return tag.replace(/^[a-z]{2}:/, '').replace(/-/g, ' ').trim();
}

/** Ubah satu baris Open Prices jadi bentuk kita. Null berarti tidak layak simpan. */
export function normalizePrice(raw: RawPrice): NormalizedPrice | null {
  const price = toNumber(raw.price);
  const id = raw.id;
  if (price === undefined || price <= 0 || id === undefined || id === null) return null;

  const name =
    raw.product?.product_name?.trim() ||
    raw.product_name?.trim() ||
    (raw.category_tag ? categoryTagToName(raw.category_tag) : '') ||
    raw.product_code ||
    '';
  if (!name) return null;

  const dateStr = raw.date ?? raw.created ?? undefined;
  const observedAt = dateStr ? new Date(dateStr) : new Date();
  if (Number.isNaN(observedAt.getTime())) return null;

  const osmType = raw.location_osm_type?.toLowerCase();
  const osmId =
    raw.location_osm_id !== null && raw.location_osm_id !== undefined && osmType
      ? `${osmType}/${raw.location_osm_id}`
      : undefined;

  return {
    externalId: `open-prices:${id}`,
    name,
    productCode: raw.product_code ?? undefined,
    price,
    currency: (raw.currency ?? 'EUR').toUpperCase().slice(0, 3),
    isDiscounted: Boolean(raw.price_is_discounted),
    packQuantity: toNumber(raw.product_quantity ?? raw.product?.product_quantity),
    packUnitRaw: raw.product_quantity_unit ?? raw.product?.product_quantity_unit ?? undefined,
    observedAt,
    osmId,
    sourceUrl: `https://prices.openfoodfacts.org/prices/${id}`,
  };
}

export function normalizeResponse(data: PricesResponse | RawPrice[]): NormalizedPrice[] {
  // Bentuk jawaban bisa berupa objek berhalaman atau larik polos, tergantung
  // versi API. Dua-duanya diterima daripada gagal total.
  const items = Array.isArray(data) ? data : (data.items ?? []);
  return items.map(normalizePrice).filter((p): p is NormalizedPrice => p !== null);
}

/**
 * Ambil harga terbaru untuk satu toko, dikenali lewat id OpenStreetMap-nya.
 * Justru id OSM inilah jembatan antara data toko dan data harga: keduanya
 * memakai penomoran yang sama.
 */
export async function fetchPricesForOsmLocation(
  osmType: string,
  osmId: number | string,
  opts: { page?: number; size?: number } = {},
): Promise<{ prices: NormalizedPrice[]; page: number; pages: number }> {
  const url =
    `${BASE}/prices?` +
    new URLSearchParams({
      location_osm_type: osmType.toUpperCase(),
      location_osm_id: String(osmId),
      order_by: '-date',
      page: String(opts.page ?? 1),
      size: String(Math.min(opts.size ?? 50, 100)),
    }).toString();

  const data = await fetchJson<PricesResponse | RawPrice[]>(url, { timeoutMs: 20_000 });
  return {
    prices: normalizeResponse(data),
    page: Array.isArray(data) ? 1 : (data.page ?? 1),
    pages: Array.isArray(data) ? 1 : (data.pages ?? 1),
  };
}
