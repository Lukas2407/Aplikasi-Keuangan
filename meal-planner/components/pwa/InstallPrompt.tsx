'use client';

import { useEffect, useState } from 'react';

/**
 * Tombol "Pasang di layar utama".
 *
 * Android/Chrome: browser menembakkan event beforeinstallprompt. Event itu
 * ditahan, lalu dipanggil ulang saat pengguna menekan tombol kita sendiri,
 * karena prompt bawaan hanya boleh dipicu oleh gestur pengguna.
 *
 * iOS/Safari: tidak ada API apa pun untuk ini. Satu-satunya jalan adalah
 * memberi instruksi Share -> Add to Home Screen, dan itu hanya berlaku di
 * Safari (Chrome iOS memakai mesin yang sama tapi tanpa menu tersebut).
 */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const SNOOZE_KEY = 'dapurkita.install.snoozeUntil';
const SNOOZE_DAYS = 14;

function isStandalone() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // properti khusus Safari iOS
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIosSafari() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const ios = /iPad|iPhone|iPod/.test(ua) || (ua.includes('Macintosh') && 'ontouchend' in document);
  const safari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
  return ios && safari;
}

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    const snoozed = Number(localStorage.getItem(SNOOZE_KEY) || 0);
    if (snoozed > Date.now()) return;

    const onPrompt = (e: Event) => {
      e.preventDefault(); // tahan banner bawaan, kita tampilkan sendiri
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setDeferred(null);
      setShowIosHelp(false);
    };

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    if (isIosSafari()) setShowIosHelp(true);

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const snooze = () => {
    localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_DAYS * 86_400_000));
    setDeferred(null);
    setShowIosHelp(false);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === 'dismissed') snooze();
    setDeferred(null);
  };

  if (!deferred && !showIosHelp) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-line bg-white p-3 shadow-[0_2px_10px_rgb(22_38_30_/_0.06)]">
      <div className="flex items-start gap-3">
        <span aria-hidden className="text-2xl">
          📲
        </span>
        <div className="flex-1 text-sm">
          <p className="font-bold">Pasang Dapur Kita di HP</p>
          {deferred ? (
            <p className="text-muted">Jalan seperti aplikasi biasa, tetap bisa dibuka tanpa internet.</p>
          ) : (
            <p className="text-muted">
              Di Safari, tekan tombol Bagikan lalu pilih <b>Add to Home Screen</b>.
            </p>
          )}
        </div>
        <button type="button" onClick={snooze} aria-label="Tutup" className="px-1 text-muted">
          ✕
        </button>
      </div>
      {deferred && (
        <button
          type="button"
          onClick={install}
          className="mt-3 w-full rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white"
        >
          Pasang sekarang
        </button>
      )}
    </div>
  );
}
