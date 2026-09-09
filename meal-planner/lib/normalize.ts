import { Aisle } from '@prisma/client';

/**
 * Penormalan nama bahan.
 *
 * Dipakai sebagai kunci di tiga tempat: penggabungan daftar belanja,
 * pencocokan stok dapur, dan pencarian harga. Karena itu aturannya harus
 * satu, bukan disalin ulang di tiap modul.
 */
export function normalizeName(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // buang aksen
    .replace(/\(.*?\)/g, ' ') // buang keterangan dalam kurung
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\b(segar|fresh|organik|organic|besar|kecil|halus|kasar|matang|mentah)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Kata kunci per rak. Yang lebih spesifik harus diperiksa lebih dulu. */
const AISLE_KEYWORDS: Array<[Aisle, string[]]> = [
  [Aisle.FROZEN, ['beku', 'frozen', 'es krim', 'ice cream']],
  [Aisle.MEAT_FISH, ['ayam', 'sapi', 'daging', 'ikan', 'udang', 'chicken', 'beef', 'pork', 'fish', 'salmon', 'prawn', 'mince', 'tahu', 'tempe', 'tofu']],
  [Aisle.DAIRY_EGGS, ['susu', 'keju', 'telur', 'yoghurt', 'yogurt', 'mentega', 'krim', 'milk', 'cheese', 'egg', 'butter', 'cream']],
  [Aisle.BAKERY, ['roti', 'bread', 'baguette', 'croissant', 'kue']],
  [Aisle.PASTA_RICE, ['beras', 'nasi', 'pasta', 'spageti', 'spaghetti', 'mie', 'mi ', 'noodle', 'macaroni', 'rice']],
  [Aisle.CANNED_SAUCE, ['kaleng', 'saus', 'sauce', 'kecap', 'tinned', 'canned', 'santan', 'coconut milk', 'pasta tomat']],
  [Aisle.SPICES, ['garam', 'lada', 'merica', 'ketumbar', 'kunyit', 'jinten', 'bumbu', 'rempah', 'salt', 'pepper', 'spice', 'kaldu', 'stock cube']],
  [Aisle.PRODUCE, ['sayur', 'buah', 'bawang', 'tomat', 'kentang', 'wortel', 'cabai', 'cabe', 'bayam', 'brokoli', 'jahe', 'lemon', 'jeruk', 'pisang', 'apel', 'onion', 'garlic', 'tomato', 'potato', 'carrot', 'spinach', 'broccoli', 'banana', 'apple', 'salad']],
  [Aisle.DRINKS, ['air', 'jus', 'kopi', 'teh', 'juice', 'coffee', 'tea', 'water', 'soda']],
  [Aisle.SNACKS, ['keripik', 'biskuit', 'cokelat', 'coklat', 'permen', 'crisps', 'biscuit', 'chocolate', 'snack']],
  [Aisle.HOUSEHOLD, ['tisu', 'sabun', 'deterjen', 'pembersih', 'tissue', 'soap', 'detergent', 'cleaner', 'kantong sampah']],
  [Aisle.PANTRY, ['tepung', 'gula', 'minyak', 'madu', 'flour', 'sugar', 'oil', 'honey', 'vinegar', 'cuka']],
];

/**
 * Tebakan rak dari nama bahan. Sengaja berbasis kata kunci, bukan LLM:
 * ini dijalankan untuk ratusan baris sekaligus, harus murah, dapat
 * diulang hasilnya, dan tetap jalan saat tidak ada koneksi. Bahan yang
 * tidak dikenali masuk OTHER, dan pengguna bisa memindahkannya sendiri.
 */
export function guessAisle(name: string): Aisle {
  const n = ` ${normalizeName(name)} `;
  for (const [aisle, keywords] of AISLE_KEYWORDS) {
    if (keywords.some((k) => n.includes(k))) return aisle;
  }
  return Aisle.OTHER;
}
