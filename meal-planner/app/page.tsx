import Link from 'next/link';

/**
 * Halaman sementara. Diganti di Phase C oleh dashboard "Hari Ini"
 * (menu hari ini, stok yang mau kedaluwarsa, ringkasan daftar belanja).
 */
export default function HomePage() {
  const rencana = [
    { href: '/recipes', label: 'Resep', desc: 'Pustaka resep dan impor otomatis', icon: '📖' },
    { href: '/plan', label: 'Rencana', desc: 'Kalender makan mingguan', icon: '📅' },
    { href: '/grocery', label: 'Belanja', desc: 'Daftar belanja per rak toko', icon: '🛒' },
    { href: '/stores', label: 'Toko', desc: 'Toko terdekat dan catatan harga', icon: '🏪' },
  ];

  return (
    <main className="mx-auto max-w-md px-4 pb-nav pt-6">
      <header className="mb-5">
        <h1 className="text-xl font-extrabold">Dapur Kita</h1>
        <p className="text-sm text-muted">Perencana menu makan dan belanja mingguan.</p>
      </header>

      <ul className="grid gap-3">
        {rencana.map((r) => (
          <li key={r.href}>
            <Link
              href={r.href}
              className="flex items-center gap-3 rounded-card border border-line bg-white p-4 shadow-[0_2px_10px_rgb(22_38_30_/_0.06)]"
            >
              <span aria-hidden className="text-2xl">
                {r.icon}
              </span>
              <span className="flex-1">
                <span className="block font-bold">{r.label}</span>
                <span className="block text-sm text-muted">{r.desc}</span>
              </span>
              <span aria-hidden className="text-muted">
                ›
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
