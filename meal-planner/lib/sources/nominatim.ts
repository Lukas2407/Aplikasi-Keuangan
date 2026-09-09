import { fetchJson } from '@/lib/net/http';
import type { GeoCandidate } from '@/lib/sources/types';

/**
 * Pencarian lokasi berdasarkan nama, supaya pengguna bisa memilih daerah
 * sendiri ("Camden Town", "Kelapa Gading") tanpa harus mengizinkan GPS.
 *
 * Dipanggil dari server, bukan dari browser. Dua alasannya: aturan
 * pemakaian Nominatim menuntut User-Agent yang jelas (browser tidak
 * mengizinkan kita mengaturnya), dan alamat IP pengguna jadi tidak ikut
 * terkirim ke layanan pihak ketiga.
 *
 * Aturan yang dipatuhi: maksimal satu permintaan per detik (diurus oleh
 * antrean di lib/net/http.ts), tanpa geocoding massal, dan hasilnya
 * disimpan sendiri agar pencarian yang sama tidak diulang.
 */

const BASE = process.env.NOMINATIM_URL ?? 'https://nominatim.openstreetmap.org';

type NominatimPlace = {
  lat: string;
  lon: string;
  display_name?: string;
  name?: string;
  type?: string;
  address?: Record<string, string>;
};

export function normalizePlace(place: NominatimPlace): GeoCandidate | null {
  const latitude = Number(place.lat);
  const longitude = Number(place.lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const address = place.address ?? {};
  return {
    label: place.display_name ?? place.name ?? `${latitude}, ${longitude}`,
    latitude,
    longitude,
    type: place.type,
    city: address.city ?? address.town ?? address.village ?? address.suburb,
    country: address.country_code?.toUpperCase(),
  };
}

export async function searchPlaces(query: string, limit = 6): Promise<GeoCandidate[]> {
  const q = query.trim();
  if (q.length < 3) return [];

  const url =
    `${BASE}/search?` +
    new URLSearchParams({
      q,
      format: 'jsonv2',
      addressdetails: '1',
      limit: String(Math.min(limit, 10)),
      'accept-language': 'id,en',
    }).toString();

  const data = await fetchJson<NominatimPlace[]>(url, { timeoutMs: 15_000, retries: 1 });
  return (Array.isArray(data) ? data : []).map(normalizePlace).filter((p): p is GeoCandidate => p !== null);
}

/** Kebalikannya: titik jadi nama tempat, dipakai setelah tombol "pakai lokasi HP". */
export async function reverseGeocode(lat: number, lon: number): Promise<GeoCandidate | null> {
  const url =
    `${BASE}/reverse?` +
    new URLSearchParams({
      lat: String(lat),
      lon: String(lon),
      format: 'jsonv2',
      addressdetails: '1',
      'accept-language': 'id,en',
    }).toString();

  const data = await fetchJson<NominatimPlace>(url, { timeoutMs: 15_000, retries: 1 });
  return normalizePlace(data);
}
