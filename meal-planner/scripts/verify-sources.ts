/**
 * Pemeriksa sumber data, dijalankan di komputer sendiri:
 *
 *   npm run verify:sources -- 51.5308 -0.1238
 *   npm run verify:sources -- -6.1751 106.8650   (Jakarta)
 *
 * Gunanya satu: memastikan struktur jawaban ketiga API masih cocok dengan
 * pemetaan di lib/sources. Overpass dan Nominatim bentuknya stabil dan
 * berdokumentasi. Open Prices masih berkembang, jadi skrip ini mencetak
 * satu baris mentah apa adanya supaya bisa diadu dengan skema resminya di
 * https://prices.openfoodfacts.org/api/docs kalau ada nama kolom yang berubah.
 *
 * Skrip ini tidak menyentuh basis data.
 */
import { fetchStoresAround } from '../lib/sources/overpass';
import { searchPlaces } from '../lib/sources/nominatim';
import { fetchPricesForOsmLocation } from '../lib/sources/open-prices';

const lat = Number(process.argv[2] ?? 51.5308);
const lon = Number(process.argv[3] ?? -0.1238);

function heading(text: string) {
  console.log(`\n=== ${text} ===`);
}

async function main() {
  let failures = 0;

  heading('Nominatim: cari nama tempat');
  try {
    const places = await searchPlaces('Camden Town London');
    console.log(`${places.length} hasil. Teratas: ${places[0]?.label ?? '(kosong)'}`);
    if (places.length === 0) failures++;
  } catch (err) {
    failures++;
    console.error('GAGAL:', err instanceof Error ? err.message : err);
  }

  heading(`Overpass: toko di sekitar ${lat}, ${lon}`);
  let osmId: string | undefined;
  try {
    const stores = await fetchStoresAround(lat, lon, 1500);
    console.log(`${stores.length} toko ditemukan.`);
    for (const s of stores.slice(0, 5)) {
      console.log(` - ${s.name} (${s.shopType}) ${s.osmId} ${s.address ?? ''}`);
    }
    osmId = stores.find((s) => s.osmType === 'node')?.osmId;
    if (stores.length === 0) {
      console.log('Tidak ada toko di radius ini. Coba koordinat lain sebelum menyimpulkan API bermasalah.');
    }
  } catch (err) {
    failures++;
    console.error('GAGAL:', err instanceof Error ? err.message : err);
  }

  heading('Open Prices: harga untuk toko pertama');
  if (!osmId) {
    console.log('Dilewati, tidak ada toko dengan id OpenStreetMap.');
  } else {
    const [type, id] = osmId.split('/');
    try {
      const res = await fetchPricesForOsmLocation(type, id, { size: 5 });
      console.log(`${res.prices.length} harga terbaca (halaman ${res.page} dari ${res.pages}).`);
      for (const p of res.prices.slice(0, 5)) {
        console.log(` - ${p.name}: ${p.price} ${p.currency} (${p.observedAt.toISOString().slice(0, 10)})`);
      }
      if (res.prices.length === 0) {
        console.log(
          'Kosong itu wajar: cakupan Open Prices masih tipis. Uji dengan toko di kota besar Eropa untuk memastikan pemetaan kolomnya benar.',
        );
      }
    } catch (err) {
      failures++;
      console.error('GAGAL:', err instanceof Error ? err.message : err);
    }
  }

  heading('Ringkasan');
  console.log(failures === 0 ? 'Semua sumber menjawab sesuai dugaan.' : `${failures} sumber bermasalah.`);
  process.exit(failures === 0 ? 0 : 1);
}

void main();
