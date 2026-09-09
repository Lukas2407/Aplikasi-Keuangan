import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { boundingBox, clampRadius, coordKey, distanceMeters, formatDistance } from '../lib/geo';

test('jarak dua titik dihitung dalam meter', () => {
  // Kings Cross ke Camden Town, jarak sebenarnya sekitar 2,2 km.
  const d = distanceMeters(
    { latitude: 51.5308, longitude: -0.1238 },
    { latitude: 51.5392, longitude: -0.1426 },
  );
  assert.ok(d > 1500 && d < 2500, `jarak di luar dugaan: ${d}`);
});

test('titik yang sama berjarak nol', () => {
  const p = { latitude: -6.2, longitude: 106.8 };
  assert.equal(Math.round(distanceMeters(p, p)), 0);
});

test('kotak pembatas melingkupi radius yang diminta', () => {
  const lat = 51.5308;
  const lon = -0.1238;
  const box = boundingBox(lat, lon, 1000);

  // Titik tepat di tepi utara harus masuk kotak.
  assert.ok(box.maxLat > lat);
  assert.ok(box.minLat < lat);
  const utara = { latitude: lat + 1000 / 111_320, longitude: lon };
  assert.ok(utara.latitude <= box.maxLat);
  // Kotak tidak boleh lebih kecil dari radius, karena penyaringan lingkaran
  // dilakukan setelahnya.
  assert.ok(distanceMeters({ latitude: lat, longitude: lon }, { latitude: box.maxLat, longitude: lon }) >= 999);
});

test('radius dijepit ke rentang yang aman', () => {
  assert.equal(clampRadius(50), 200);
  assert.equal(clampRadius(999_999), 10_000);
  assert.equal(clampRadius(Number.NaN), 2000);
  assert.equal(clampRadius(1500), 1500);
});

test('kunci cache membulatkan koordinat', () => {
  assert.equal(coordKey(51.53084321, -0.12381111), '51.531,-0.124');
  // Dua titik yang berjarak beberapa puluh meter dianggap area sama.
  assert.equal(coordKey(51.5308, -0.1238), coordKey(51.53081, -0.12379));
});

test('jarak ditampilkan dalam satuan yang enak dibaca', () => {
  assert.equal(formatDistance(240), '240 m');
  assert.equal(formatDistance(1500), '1.5 km');
  assert.equal(formatDistance(12_000), '12 km');
});
