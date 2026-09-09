import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { guessAisle, normalizeName } from '../lib/normalize';
import { computeUnitPrice, mapPackUnit } from '../lib/import/sync-prices';

test('nama bahan dinormalkan jadi kunci yang stabil', () => {
  assert.equal(normalizeName('  Bawang Bombay  '), 'bawang bombay');
  assert.equal(normalizeName('Tomat (matang, segar)'), 'tomat');
  assert.equal(normalizeName('Crème fraîche'), 'creme fraiche');
  assert.equal(normalizeName('Bawang putih, cincang halus'), 'bawang putih cincang');
});

test('rak ditebak dari kata kunci dua bahasa', () => {
  assert.equal(guessAisle('dada ayam'), 'MEAT_FISH');
  assert.equal(guessAisle('chicken breast'), 'MEAT_FISH');
  assert.equal(guessAisle('susu UHT'), 'DAIRY_EGGS');
  assert.equal(guessAisle('kacang polong beku'), 'FROZEN');
  assert.equal(guessAisle('barang aneh entah apa'), 'OTHER');
});

test('harga per satuan dihitung agar ukuran kemasan bisa diadu', () => {
  assert.deepEqual(computeUnitPrice(1.89, 500, 'g'), { unitPrice: 3.78, unitPriceUnit: 'KG' });
  assert.deepEqual(computeUnitPrice(3.4, 1, 'kg'), { unitPrice: 3.4, unitPriceUnit: 'KG' });
  assert.deepEqual(computeUnitPrice(1.2, 750, 'ml'), { unitPrice: 1.6, unitPriceUnit: 'L' });
  assert.equal(computeUnitPrice(2, 0, 'g'), null);
  assert.equal(computeUnitPrice(2, 6, 'butir'), null);
});

test('satuan kemasan dipetakan ke enum, sisanya null', () => {
  assert.equal(mapPackUnit('G'), 'G');
  assert.equal(mapPackUnit('litre'), 'L');
  assert.equal(mapPackUnit(undefined), null);
  assert.equal(mapPackUnit('sachet'), null);
});
