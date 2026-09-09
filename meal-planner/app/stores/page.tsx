import type { Metadata } from 'next';
import StorePicker from '@/components/stores/StorePicker';

export const metadata: Metadata = { title: 'Toko terdekat' };

export default function StoresPage() {
  return (
    <main className="mx-auto max-w-md px-4 pb-nav pt-6">
      <header className="mb-4">
        <h1 className="text-xl font-extrabold">Toko terdekat</h1>
        <p className="text-sm text-muted">
          Pilih lokasi mana pun, lalu tarik daftar toko di sekitarnya ke basis data.
        </p>
      </header>
      <StorePicker />
    </main>
  );
}
