/** Perhitungan jarak dan pembulatan koordinat. */

export type LatLon = { latitude: number; longitude: number };

const EARTH_RADIUS_M = 6_371_008.8;

/**
 * Jarak garis lurus antara dua titik dalam meter (rumus haversine).
 *
 * Ini jarak burung terbang, bukan jarak jalan kaki. Untuk memilih toko
 * terdekat dalam radius beberapa kilometer, selisihnya tidak penting, dan
 * menghitungnya di sini jauh lebih murah daripada memanggil layanan rute.
 */
export function distanceMeters(a: LatLon, b: LatLon): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters / 10) * 10} m`;
  return `${(meters / 1000).toFixed(meters < 10_000 ? 1 : 0)} km`;
}

/**
 * Bulatkan koordinat untuk kunci cache. Tiga desimal kira-kira 110 meter,
 * cukup untuk menganggap dua pencarian sebagai area yang sama tanpa
 * membuat setiap pergeseran kecil jadi penarikan data baru.
 */
export function coordKey(lat: number, lon: number, decimals = 3): string {
  return `${lat.toFixed(decimals)},${lon.toFixed(decimals)}`;
}

/** Batasi nilai agar permintaan pengguna tidak membebani sumber data. */
export function clampRadius(radiusM: number, min = 200, max = 10_000): number {
  if (!Number.isFinite(radiusM)) return 2000;
  return Math.min(max, Math.max(min, Math.round(radiusM)));
}

export function isValidLatLon(lat: unknown, lon: unknown): lat is number {
  return (
    typeof lat === 'number' &&
    typeof lon === 'number' &&
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lon) <= 180
  );
}

/**
 * Kotak pembatas kasar untuk menyaring baris di basis data sebelum jarak
 * dihitung tepat. Tanpa PostGIS, ini cara termurah: indeks pada kolom
 * lintang dan bujur bisa dipakai, lalu haversine menyaring sisanya.
 */
export function boundingBox(lat: number, lon: number, radiusM: number) {
  // 110_574 adalah panjang satu derajat lintang di khatulistiwa, angka
  // terpendek di seluruh bumi. Dipakai sengaja: kotak ini harus selalu
  // lebih besar dari radius yang diminta, karena penyaringan lingkaran
  // baru dilakukan setelahnya. Memakai angka rata-rata (111_320) membuat
  // kotak sedikit terlalu kecil dan toko di tepi radius ikut terbuang.
  const METERS_PER_DEG = 110_574;
  const dLat = radiusM / METERS_PER_DEG;
  // Satu derajat bujur menyempit mengikuti kosinus lintang. Dibatasi agar
  // tidak meledak di dekat kutub.
  const cos = Math.max(0.01, Math.cos((lat * Math.PI) / 180));
  const dLon = radiusM / (METERS_PER_DEG * cos);
  return {
    minLat: lat - dLat,
    maxLat: lat + dLat,
    minLon: lon - dLon,
    maxLon: lon + dLon,
  };
}
