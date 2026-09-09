import { PrismaClient, Aisle } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Katalog bahan awal.
 *
 * Gunanya bukan kelengkapan, melainkan menutup bahan yang paling sering
 * muncul supaya penggolongan rak tidak selalu bergantung pada tebakan LLM.
 * Bahan yang belum ada di sini tetap masuk lewat impor resep dengan
 * isVerified = false, dan bisa dinaikkan statusnya belakangan.
 *
 * synonyms dipakai dua arah: mencocokkan hasil parsing berbahasa Inggris
 * ("chicken breast") ke bahan yang sama dengan tulisan pengguna ("dada ayam"),
 * dan menyatukan ejaan yang berbeda ("bombay" / "bombai").
 */
type SeedIngredient = {
  name: string;
  slug: string;
  aisle: Aisle;
  synonyms: string[];
  gramsPerPiece?: number;
  gramsPerCup?: number;
  densityGPerMl?: number;
};

const INGREDIENTS: SeedIngredient[] = [
  // --- sayur dan buah
  { name: 'Bawang bombay', slug: 'bawang-bombay', aisle: 'PRODUCE', synonyms: ['onion', 'bawang bombai'], gramsPerPiece: 150 },
  { name: 'Bawang putih', slug: 'bawang-putih', aisle: 'PRODUCE', synonyms: ['garlic', 'garlic clove'], gramsPerPiece: 5 },
  { name: 'Bawang merah', slug: 'bawang-merah', aisle: 'PRODUCE', synonyms: ['shallot'], gramsPerPiece: 20 },
  { name: 'Tomat', slug: 'tomat', aisle: 'PRODUCE', synonyms: ['tomato', 'tomatoes'], gramsPerPiece: 120 },
  { name: 'Kentang', slug: 'kentang', aisle: 'PRODUCE', synonyms: ['potato', 'potatoes'], gramsPerPiece: 170 },
  { name: 'Wortel', slug: 'wortel', aisle: 'PRODUCE', synonyms: ['carrot', 'carrots'], gramsPerPiece: 70 },
  { name: 'Cabai merah', slug: 'cabai-merah', aisle: 'PRODUCE', synonyms: ['red chilli', 'chili', 'cabe merah'], gramsPerPiece: 8 },
  { name: 'Jahe', slug: 'jahe', aisle: 'PRODUCE', synonyms: ['ginger'] },
  { name: 'Bayam', slug: 'bayam', aisle: 'PRODUCE', synonyms: ['spinach'] },
  { name: 'Brokoli', slug: 'brokoli', aisle: 'PRODUCE', synonyms: ['broccoli'], gramsPerPiece: 350 },
  { name: 'Lemon', slug: 'lemon', aisle: 'PRODUCE', synonyms: ['jeruk lemon'], gramsPerPiece: 100 },
  { name: 'Pisang', slug: 'pisang', aisle: 'PRODUCE', synonyms: ['banana'], gramsPerPiece: 120 },
  { name: 'Alpukat', slug: 'alpukat', aisle: 'PRODUCE', synonyms: ['avocado'], gramsPerPiece: 200 },

  // --- daging dan ikan
  { name: 'Dada ayam', slug: 'dada-ayam', aisle: 'MEAT_FISH', synonyms: ['chicken breast', 'ayam fillet'], gramsPerPiece: 180 },
  { name: 'Paha ayam', slug: 'paha-ayam', aisle: 'MEAT_FISH', synonyms: ['chicken thigh'], gramsPerPiece: 110 },
  { name: 'Daging sapi giling', slug: 'daging-sapi-giling', aisle: 'MEAT_FISH', synonyms: ['beef mince', 'ground beef'] },
  { name: 'Ikan salmon', slug: 'salmon', aisle: 'MEAT_FISH', synonyms: ['salmon fillet'], gramsPerPiece: 130 },
  { name: 'Udang', slug: 'udang', aisle: 'MEAT_FISH', synonyms: ['prawn', 'shrimp'] },
  { name: 'Tahu', slug: 'tahu', aisle: 'MEAT_FISH', synonyms: ['tofu'], gramsPerPiece: 100 },
  { name: 'Tempe', slug: 'tempe', aisle: 'MEAT_FISH', synonyms: ['tempeh'], gramsPerPiece: 200 },

  // --- susu dan telur
  { name: 'Telur ayam', slug: 'telur-ayam', aisle: 'DAIRY_EGGS', synonyms: ['egg', 'eggs', 'telur'], gramsPerPiece: 58 },
  { name: 'Susu cair', slug: 'susu-cair', aisle: 'DAIRY_EGGS', synonyms: ['milk', 'whole milk'], densityGPerMl: 1.03 },
  { name: 'Mentega', slug: 'mentega', aisle: 'DAIRY_EGGS', synonyms: ['butter'], gramsPerCup: 227 },
  { name: 'Keju cheddar', slug: 'keju-cheddar', aisle: 'DAIRY_EGGS', synonyms: ['cheddar', 'cheese'], gramsPerCup: 113 },
  { name: 'Yoghurt', slug: 'yoghurt', aisle: 'DAIRY_EGGS', synonyms: ['yogurt', 'greek yoghurt'], gramsPerCup: 245 },
  { name: 'Santan', slug: 'santan', aisle: 'CANNED_SAUCE', synonyms: ['coconut milk'], densityGPerMl: 0.98 },

  // --- roti dan bahan pokok
  { name: 'Roti tawar', slug: 'roti-tawar', aisle: 'BAKERY', synonyms: ['bread', 'sliced bread'] },
  { name: 'Beras', slug: 'beras', aisle: 'PASTA_RICE', synonyms: ['rice', 'nasi'], gramsPerCup: 185 },
  { name: 'Spageti', slug: 'spageti', aisle: 'PASTA_RICE', synonyms: ['spaghetti', 'pasta'] },
  { name: 'Mi telur', slug: 'mi-telur', aisle: 'PASTA_RICE', synonyms: ['egg noodles', 'mie'] },
  { name: 'Tepung terigu', slug: 'tepung-terigu', aisle: 'PANTRY', synonyms: ['plain flour', 'all purpose flour'], gramsPerCup: 125 },
  { name: 'Gula pasir', slug: 'gula-pasir', aisle: 'PANTRY', synonyms: ['sugar', 'caster sugar'], gramsPerCup: 200 },
  { name: 'Minyak goreng', slug: 'minyak-goreng', aisle: 'PANTRY', synonyms: ['vegetable oil', 'cooking oil'], densityGPerMl: 0.92 },
  { name: 'Minyak zaitun', slug: 'minyak-zaitun', aisle: 'PANTRY', synonyms: ['olive oil'], densityGPerMl: 0.91 },

  // --- kalengan dan saus
  { name: 'Tomat kaleng', slug: 'tomat-kaleng', aisle: 'CANNED_SAUCE', synonyms: ['chopped tomatoes', 'tinned tomatoes'] },
  { name: 'Kecap manis', slug: 'kecap-manis', aisle: 'CANNED_SAUCE', synonyms: ['sweet soy sauce'] },
  { name: 'Kecap asin', slug: 'kecap-asin', aisle: 'CANNED_SAUCE', synonyms: ['soy sauce', 'light soy sauce'] },
  { name: 'Saus tiram', slug: 'saus-tiram', aisle: 'CANNED_SAUCE', synonyms: ['oyster sauce'] },
  { name: 'Kacang merah kaleng', slug: 'kacang-merah-kaleng', aisle: 'CANNED_SAUCE', synonyms: ['kidney beans'] },

  // --- bumbu
  { name: 'Garam', slug: 'garam', aisle: 'SPICES', synonyms: ['salt'] },
  { name: 'Lada hitam', slug: 'lada-hitam', aisle: 'SPICES', synonyms: ['black pepper', 'merica'] },
  { name: 'Ketumbar bubuk', slug: 'ketumbar-bubuk', aisle: 'SPICES', synonyms: ['ground coriander'] },
  { name: 'Kunyit bubuk', slug: 'kunyit-bubuk', aisle: 'SPICES', synonyms: ['turmeric'] },
  { name: 'Kaldu bubuk', slug: 'kaldu-bubuk', aisle: 'SPICES', synonyms: ['stock cube', 'bouillon'] },
  { name: 'Daun salam', slug: 'daun-salam', aisle: 'SPICES', synonyms: ['bay leaf'] },

  // --- beku dan lain-lain
  { name: 'Kacang polong beku', slug: 'kacang-polong-beku', aisle: 'FROZEN', synonyms: ['frozen peas'] },
  { name: 'Kentang goreng beku', slug: 'kentang-goreng-beku', aisle: 'FROZEN', synonyms: ['frozen chips', 'fries'] },
  { name: 'Kopi bubuk', slug: 'kopi-bubuk', aisle: 'DRINKS', synonyms: ['ground coffee'] },
  { name: 'Teh celup', slug: 'teh-celup', aisle: 'DRINKS', synonyms: ['tea bags'] },
  { name: 'Tisu dapur', slug: 'tisu-dapur', aisle: 'HOUSEHOLD', synonyms: ['kitchen roll', 'paper towel'] },
];

async function main() {
  for (const item of INGREDIENTS) {
    await prisma.ingredient.upsert({
      where: { slug: item.slug },
      // Seed harus bisa dijalankan berulang tanpa menggandakan atau
      // menimpa perbaikan manual selain kolom di bawah.
      update: { name: item.name, aisle: item.aisle, synonyms: item.synonyms, isVerified: true },
      create: { ...item, isVerified: true },
    });
  }
  console.log(`Seed selesai: ${INGREDIENTS.length} bahan.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
