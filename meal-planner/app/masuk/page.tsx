import type { Metadata } from 'next';
import GateForm from '@/components/gate/GateForm';

export const metadata: Metadata = { title: 'Masuk' };

export default async function MasukPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  // Hanya jalur internal yang diterima, supaya parameter ini tidak bisa
  // dipakai mengarahkan orang ke situs lain setelah masuk.
  const target = next && next.startsWith('/') && !next.startsWith('//') ? next : '/';

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-5">
      <div className="mb-6 text-center">
        <span aria-hidden className="text-4xl">
          🍽️
        </span>
        <h1 className="mt-2 text-xl font-extrabold">Dapur Kita</h1>
        <p className="text-sm text-muted">Aplikasi ini terkunci. Masukkan kata sandinya.</p>
      </div>
      <GateForm next={target} />
    </main>
  );
}
