import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { categoryTagToName, normalizePrice, normalizeResponse } from '../lib/sources/open-prices';

test('tag kategori jadi nama yang terbaca', () => {
  assert.equal(categoryTagToName('en:whole-milk'), 'whole milk');
  assert.equal(categoryTagToName('fr:pommes'), 'pommes');
});

test('harga produk berbarcode dinormalkan', () => {
  const p = normalizePrice({
    id: 12345,
    product_code: '5000112637922',
    product: { product_name: 'Coca-Cola 1.5L', product_quantity: 1500, product_quantity_unit: 'ml' },
    price: 1.89,
    currency: 'gbp',
    date: '2026-08-14',
    location_osm_id: 123456789,
    location_osm_type: 'NODE',
  });
  assert.ok(p);
  assert.equal(p.externalId, 'open-prices:12345');
  assert.equal(p.name, 'Coca-Cola 1.5L');
  assert.equal(p.currency, 'GBP');
  assert.equal(p.osmId, 'node/123456789');
  assert.equal(p.observedAt.toISOString().slice(0, 10), '2026-08-14');
});

test('produk curah tanpa barcode memakai nama kategori', () => {
  const p = normalizePrice({ id: 7, category_tag: 'en:apples', price: '2.50', currency: 'EUR', date: '2026-07-01' });
  assert.ok(p);
  assert.equal(p.name, 'apples');
  assert.equal(p.price, 2.5);
});

test('baris tanpa harga, tanpa id, atau tanggalnya rusak dibuang', () => {
  assert.equal(normalizePrice({ id: 1, product_name: 'Kopi' }), null);
  assert.equal(normalizePrice({ product_name: 'Kopi', price: 2 }), null);
  assert.equal(normalizePrice({ id: 2, price: 0, product_name: 'Gratis' }), null);
  assert.equal(normalizePrice({ id: 3, price: 2, product_name: 'Teh', date: 'bukan-tanggal' }), null);
});

test('penanda diskon terbaca', () => {
  const p = normalizePrice({ id: 9, product_name: 'Keju', price: 3, price_is_discounted: true, date: '2026-01-02' });
  assert.equal(p?.isDiscounted, true);
});

test('jawaban berhalaman maupun larik polos sama-sama diterima', () => {
  const item = { id: 1, product_name: 'Susu', price: 1.2, date: '2026-02-02' };
  assert.equal(normalizeResponse({ items: [item] }).length, 1);
  assert.equal(normalizeResponse([item]).length, 1);
  assert.equal(normalizeResponse({}).length, 0);
});
