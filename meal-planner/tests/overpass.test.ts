import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { buildQuery, normalizeElement, normalizeResponse } from '../lib/sources/overpass';
import type { OverpassResponse } from '../lib/sources/overpass';

/** Contoh jawaban Overpass, bentuknya mengikuti "out center tags". */
const FIXTURE: OverpassResponse = {
  elements: [
    {
      type: 'node',
      id: 123456789,
      lat: 51.5311,
      lon: -0.1242,
      tags: {
        shop: 'supermarket',
        name: 'Sainsbury\'s Local',
        brand: "Sainsbury's",
        'addr:housenumber': '12',
        'addr:street': 'Caledonian Road',
        'addr:city': 'London',
        'addr:postcode': 'N1 9DX',
        'addr:country': 'gb',
        opening_hours: 'Mo-Su 07:00-23:00',
      },
    },
    {
      // toko yang digambar sebagai poligon: koordinatnya ada di "center"
      type: 'way',
      id: 987654321,
      center: { lat: 51.5325, lon: -0.1201 },
      tags: { shop: 'convenience', name: 'Toko Pojok' },
    },
    // duplikat dari elemen pertama, harus dibuang
    { type: 'node', id: 123456789, lat: 51.5311, lon: -0.1242, tags: { shop: 'supermarket', name: "Sainsbury's Local" } },
    // tanpa nama dan tanpa merek: tidak berguna untuk dipilih pengguna
    { type: 'node', id: 555, lat: 51.53, lon: -0.12, tags: { shop: 'supermarket' } },
    // tanpa koordinat sama sekali
    { type: 'way', id: 666, tags: { shop: 'bakery', name: 'Roti Tanpa Titik' } },
  ],
};

test('kueri memuat radius, titik, dan jenis toko', () => {
  const q = buildQuery(51.5308, -0.1238, 1500);
  assert.match(q, /around:1500,51\.5308,-0\.1238/);
  assert.match(q, /supermarket\|convenience/);
  assert.match(q, /out center tags/);
});

test('node biasa dinormalkan lengkap dengan alamat', () => {
  const s = normalizeElement(FIXTURE.elements![0]);
  assert.ok(s);
  assert.equal(s.osmId, 'node/123456789');
  assert.equal(s.name, "Sainsbury's Local");
  assert.equal(s.brand, "Sainsbury's");
  assert.equal(s.address, '12 Caledonian Road');
  assert.equal(s.country, 'GB');
  assert.equal(s.openingHours, 'Mo-Su 07:00-23:00');
});

test('poligon memakai titik tengah', () => {
  const s = normalizeElement(FIXTURE.elements![1]);
  assert.ok(s);
  assert.equal(s.latitude, 51.5325);
  assert.equal(s.osmId, 'way/987654321');
});

test('elemen tanpa nama atau tanpa koordinat dibuang, duplikat disaring', () => {
  const list = normalizeResponse(FIXTURE);
  assert.equal(list.length, 2);
  assert.deepEqual(
    list.map((s) => s.osmId),
    ['node/123456789', 'way/987654321'],
  );
});

test('jawaban kosong tidak membuat error', () => {
  assert.deepEqual(normalizeResponse({}), []);
  assert.deepEqual(normalizeResponse({ elements: [] }), []);
});
