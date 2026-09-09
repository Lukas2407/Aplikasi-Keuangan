import type { MetadataRoute } from 'next';

/**
 * Web App Manifest.
 * Di App Router, file ini otomatis disajikan sebagai /manifest.webmanifest
 * dan <link rel="manifest"> disuntikkan Next ke setiap halaman.
 *
 * Syarat minimum agar Chrome/Android memunculkan banner "Install app":
 *   name, short_name, start_url, display: standalone (atau fullscreen/minimal-ui),
 *   ikon 192px dan 512px, disajikan lewat HTTPS, dan ada service worker
 *   dengan fetch handler. iOS tidak memakai banner: pengguna memakai
 *   Share -> Add to Home Screen, dan membaca apple-touch-icon + meta di layout.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/?source=pwa',
    name: 'Dapur Kita: Perencana Menu & Belanja',
    short_name: 'Dapur Kita',
    description:
      'Simpan resep dari mana saja, susun rencana makan mingguan, dan ubah otomatis jadi daftar belanja yang rapi per rak toko.',
    lang: 'id',
    dir: 'ltr',
    start_url: '/?source=pwa',
    scope: '/',
    display: 'standalone',
    display_override: ['standalone', 'minimal-ui', 'browser'],
    orientation: 'portrait',
    background_color: '#f2f7f4',
    theme_color: '#0e9160',
    categories: ['food', 'lifestyle', 'productivity', 'shopping'],
    prefer_related_applications: false,
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    // Shortcut muncul saat ikon aplikasi ditekan lama di Android.
    shortcuts: [
      {
        name: 'Rencana minggu ini',
        short_name: 'Rencana',
        url: '/plan?source=shortcut',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
      {
        name: 'Daftar belanja',
        short_name: 'Belanja',
        url: '/grocery?source=shortcut',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
      {
        name: 'Impor resep',
        short_name: 'Impor',
        url: '/recipes/import?source=shortcut',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
    ],
    /**
     * screenshots dipakai Chrome untuk dialog install yang lebih kaya.
     * Ganti dengan tangkapan layar asli (form_factor "narrow" untuk HP)
     * setelah UI Phase C jadi; sampai itu biarkan kosong daripada
     * menunjuk berkas yang tidak ada.
     */
    screenshots: [],
  };
}
