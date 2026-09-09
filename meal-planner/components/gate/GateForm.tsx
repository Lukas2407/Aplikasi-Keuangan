'use client';

import { useState } from 'react';

export default function GateForm({ next }: { next: string }) {
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passphrase }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Kata sandi salah');
      }
      // Ganti seluruh halaman, bukan router.push: cookie baru harus terbaca
      // middleware pada permintaan berikutnya.
      window.location.href = next || '/';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal masuk');
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <label className="block">
        <span className="mb-1 block text-sm font-bold">Kata sandi</span>
        <input
          type="password"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          autoComplete="current-password"
          required
          className="w-full rounded-xl border border-line bg-canvas px-3 py-3"
        />
      </label>

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy || passphrase.length === 0}
        className="w-full rounded-xl bg-brand px-4 py-3 font-bold text-white disabled:opacity-50"
      >
        {busy ? 'Memeriksa...' : 'Masuk'}
      </button>
    </form>
  );
}
