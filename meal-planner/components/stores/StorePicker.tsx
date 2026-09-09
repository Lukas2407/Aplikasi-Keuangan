'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Layar pemilihan lokasi dan penarikan data toko.
 *
 * Alurnya sengaja dua langkah terpisah:
 *   1. baca yang sudah tersimpan (murah, langsung, jalan tanpa internet),
 *   2. tarik dari OpenStreetMap hanya kalau pengguna menekan tombolnya.
 * Sinkronisasi otomatis setiap halaman dibuka akan membebani layanan
 * sukarela itu tanpa memberi manfaat berarti, karena posisi toko jarang
 * berubah.
 */

type Store = {
  id: string;
  name: string;
  brand: string | null;
  shopType: string | null;
  address: string | null;
  city: string | null;
  openingHours: string | null;
  isFavorite: boolean;
  pricesSyncedAt: string | null;
  distanceLabel: string;
};

type Place = { label: string; latitude: number; longitude: number; city?: string };

type SavedLocation = {
  id: string;
  label: string;
  address: string | null;
  latitude: number;
  longitude: number;
  radiusM: number;
  isDefault: boolean;
};

const RADII = [
  { m: 500, label: '500 m' },
  { m: 1000, label: '1 km' },
  { m: 2000, label: '2 km' },
  { m: 5000, label: '5 km' },
];

const SHOP_LABEL: Record<string, string> = {
  supermarket: 'Swalayan',
  convenience: 'Minimarket',
  greengrocer: 'Sayur & buah',
  butcher: 'Daging',
  bakery: 'Roti',
  seafood: 'Ikan',
  deli: 'Deli',
  farm: 'Hasil tani',
  wholesale: 'Grosir',
};

export default function StorePicker() {
  const [query, setQuery] = useState('');
  const [places, setPlaces] = useState<Place[]>([]);
  const [picked, setPicked] = useState<Place | null>(null);
  const [radiusM, setRadiusM] = useState(2000);
  const [stores, setStores] = useState<Store[]>([]);
  const [saved, setSaved] = useState<SavedLocation[]>([]);
  const [busy, setBusy] = useState<'search' | 'gps' | 'sync' | 'read' | null>(null);
  const [priceBusy, setPriceBusy] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ------------------------------------------------ lokasi tersimpan */
  useEffect(() => {
    fetch('/api/locations')
      .then((r) => r.json())
      .then((d) => {
        const list: SavedLocation[] = d.locations ?? [];
        setSaved(list);
        const fallback = list.find((l) => l.isDefault) ?? list[0];
        if (fallback && !picked) {
          setPicked({ label: fallback.label, latitude: fallback.latitude, longitude: fallback.longitude });
          setRadiusM(fallback.radiusM);
        }
      })
      .catch(() => {});
    // sengaja hanya sekali saat halaman dibuka
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------------------------------------ baca toko tersimpan */
  const readStores = useCallback(async (place: Place, radius: number) => {
    setBusy('read');
    setError(null);
    try {
      const res = await fetch(`/api/stores?lat=${place.latitude}&lon=${place.longitude}&radiusM=${radius}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Gagal membaca toko');
      setStores(data.stores ?? []);
      if ((data.stores ?? []).length === 0) {
        setNote('Belum ada toko tersimpan di area ini. Tekan Sinkronkan untuk menariknya.');
      } else {
        setNote(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membaca toko');
    } finally {
      setBusy(null);
    }
  }, []);

  useEffect(() => {
    if (picked) void readStores(picked, radiusM);
  }, [picked, radiusM, readStores]);

  /* ------------------------------------------------ cari nama tempat */
  const onQueryChange = (value: string) => {
    setQuery(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (value.trim().length < 3) {
      setPlaces([]);
      return;
    }
    // Nominatim membatasi satu permintaan per detik, jadi ketikan ditahan
    // dulu sebelum dikirim.
    searchTimer.current = setTimeout(async () => {
      setBusy('search');
      setError(null);
      try {
        const res = await fetch(`/api/geo/search?q=${encodeURIComponent(value)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Pencarian gagal');
        setPlaces(data.results ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Pencarian gagal');
      } finally {
        setBusy(null);
      }
    }, 700);
  };

  /* ------------------------------------------------ lokasi HP */
  const useGps = () => {
    if (!('geolocation' in navigator)) {
      setError('Peramban ini tidak menyediakan lokasi.');
      return;
    }
    setBusy('gps');
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let label = 'Lokasi saya';
        try {
          const res = await fetch(`/api/geo/reverse?lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (res.ok && data.place?.label) label = data.place.label;
        } catch {
          // nama tempat hanya pemanis, koordinatnya yang penting
        }
        setPicked({ label, latitude, longitude });
        setPlaces([]);
        setQuery('');
        setBusy(null);
      },
      (err) => {
        setBusy(null);
        setError(
          err.code === err.PERMISSION_DENIED
            ? 'Izin lokasi ditolak. Pilih lokasi lewat pencarian nama tempat.'
            : 'Lokasi tidak terbaca. Coba lagi atau cari nama tempatnya.',
        );
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 300_000 },
    );
  };

  /* ------------------------------------------------ sinkronisasi toko */
  const syncStores = async (force = false) => {
    if (!picked) return;
    setBusy('sync');
    setError(null);
    setNote(null);
    try {
      const res = await fetch('/api/stores/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: picked.latitude,
          longitude: picked.longitude,
          radiusM,
          force,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Sinkronisasi gagal');
      setStores(data.stores ?? []);
      setNote(
        data.status === 'SKIPPED'
          ? `Memakai data tersimpan (ditarik ${new Date(data.lastSyncedAt).toLocaleString('id-ID')}). Tekan Tarik ulang untuk menyegarkan.`
          : `Selesai: ${data.fetched} toko ditemukan, ${data.created} baru, ${data.updated} diperbarui.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sinkronisasi gagal');
    } finally {
      setBusy(null);
    }
  };

  /* ------------------------------------------------ harga per toko */
  const syncPrices = async (storeId: string) => {
    setPriceBusy(storeId);
    setError(null);
    try {
      const res = await fetch(`/api/stores/${storeId}/prices/sync`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Penarikan harga gagal');
      setNote(
        data.message ??
          `Harga toko ini: ${data.created} baris baru disimpan, ${data.skipped} sudah ada sebelumnya.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Penarikan harga gagal');
    } finally {
      setPriceBusy(null);
    }
  };

  /* ------------------------------------------------ simpan lokasi */
  const saveLocation = async () => {
    if (!picked) return;
    const label = window.prompt('Simpan lokasi ini sebagai apa?', picked.city ?? 'Rumah');
    if (!label) return;
    try {
      const res = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label,
          address: picked.label,
          latitude: picked.latitude,
          longitude: picked.longitude,
          radiusM,
          isDefault: saved.length === 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Gagal menyimpan lokasi');
      setSaved((prev) => [data.location, ...prev.filter((l) => l.id !== data.location.id)]);
      setNote(`Lokasi "${label}" tersimpan.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan lokasi');
    }
  };

  /* ------------------------------------------------ tampilan */
  return (
    <div className="space-y-4">
      {/* pemilih lokasi */}
      <section className="rounded-card border border-line bg-white p-4">
        <h2 className="mb-3 text-sm font-bold">1. Pilih lokasi</h2>

        <div className="flex gap-2">
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Cari nama tempat, misal Camden Town"
            className="min-w-0 flex-1 rounded-xl border border-line bg-canvas px-3 py-3"
            aria-label="Cari nama tempat"
          />
          <button
            type="button"
            onClick={useGps}
            disabled={busy === 'gps'}
            className="rounded-xl bg-brand-soft px-4 py-3 text-sm font-bold text-brand disabled:opacity-50"
          >
            {busy === 'gps' ? '...' : '📍 HP'}
          </button>
        </div>

        {busy === 'search' && <p className="mt-2 text-xs text-muted">Mencari...</p>}

        {places.length > 0 && (
          <ul className="mt-2 divide-y divide-line rounded-xl border border-line">
            {places.map((p) => (
              <li key={`${p.latitude},${p.longitude}`}>
                <button
                  type="button"
                  onClick={() => {
                    setPicked(p);
                    setPlaces([]);
                    setQuery('');
                  }}
                  className="block w-full px-3 py-3 text-left text-sm"
                >
                  {p.label}
                </button>
              </li>
            ))}
          </ul>
        )}

        {saved.length > 0 && (
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {saved.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => {
                  setPicked({ label: l.label, latitude: l.latitude, longitude: l.longitude });
                  setRadiusM(l.radiusM);
                }}
                className="shrink-0 rounded-full border border-line px-3 py-2 text-xs font-bold text-muted"
              >
                {l.isDefault ? '★ ' : ''}
                {l.label}
              </button>
            ))}
          </div>
        )}

        {picked && (
          <div className="mt-3 rounded-xl bg-canvas p-3 text-sm">
            <p className="font-bold">{picked.label}</p>
            <p className="text-xs text-muted">
              {picked.latitude.toFixed(5)}, {picked.longitude.toFixed(5)}
            </p>
            <button type="button" onClick={saveLocation} className="mt-2 text-xs font-bold text-brand">
              Simpan lokasi ini
            </button>
          </div>
        )}
      </section>

      {/* radius + sinkronisasi */}
      <section className="rounded-card border border-line bg-white p-4">
        <h2 className="mb-3 text-sm font-bold">2. Jarak pencarian</h2>
        <div className="flex gap-2">
          {RADII.map((r) => (
            <button
              key={r.m}
              type="button"
              onClick={() => setRadiusM(r.m)}
              className={`flex-1 rounded-xl border px-2 py-2 text-sm font-bold ${
                radiusM === r.m ? 'border-brand bg-brand text-white' : 'border-line text-muted'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => syncStores(false)}
            disabled={!picked || busy === 'sync'}
            className="flex-1 rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            {busy === 'sync' ? 'Menarik data...' : 'Sinkronkan toko'}
          </button>
          <button
            type="button"
            onClick={() => syncStores(true)}
            disabled={!picked || busy === 'sync'}
            className="rounded-xl border border-line px-4 py-3 text-sm font-bold text-muted disabled:opacity-50"
          >
            Tarik ulang
          </button>
        </div>
      </section>

      {error && (
        <p role="alert" className="rounded-card border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
          {error}
        </p>
      )}
      {note && <p className="rounded-card border border-line bg-white p-3 text-sm text-muted">{note}</p>}

      {/* hasil */}
      <section className="rounded-card border border-line bg-white p-4">
        <h2 className="mb-1 text-sm font-bold">
          3. Toko terdekat {stores.length > 0 && <span className="text-muted">({stores.length})</span>}
        </h2>
        {busy === 'read' && <p className="text-xs text-muted">Membaca...</p>}

        <ul className="divide-y divide-line">
          {stores.map((s) => (
            <li key={s.id} className="flex items-start gap-3 py-3">
              <span aria-hidden className="text-xl">
                {s.shopType === 'convenience' ? '🏪' : s.shopType === 'bakery' ? '🥖' : '🛒'}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{s.name}</p>
                <p className="truncate text-xs text-muted">
                  {[SHOP_LABEL[s.shopType ?? ''] ?? s.shopType, s.address, s.city].filter(Boolean).join(' · ')}
                </p>
                {s.openingHours && <p className="truncate text-xs text-muted">🕒 {s.openingHours}</p>}
                <button
                  type="button"
                  onClick={() => syncPrices(s.id)}
                  disabled={priceBusy === s.id}
                  className="mt-2 rounded-lg bg-brand-soft px-3 py-2 text-xs font-bold text-brand disabled:opacity-50"
                >
                  {priceBusy === s.id ? 'Menarik harga...' : 'Ambil harga'}
                </button>
              </div>
              <span className="shrink-0 text-xs font-bold text-muted">{s.distanceLabel}</span>
            </li>
          ))}
        </ul>

        {stores.length === 0 && busy !== 'read' && (
          <p className="py-6 text-center text-sm text-muted">Belum ada toko untuk ditampilkan.</p>
        )}
      </section>

      <p className="px-1 text-xs text-muted">
        Data toko © kontributor OpenStreetMap (ODbL). Data harga dari Open Prices (Open Food Facts), lisensi
        ODbL. Cakupan harga bergantung laporan sukarelawan, jadi banyak toko masih kosong.
      </p>
    </div>
  );
}
