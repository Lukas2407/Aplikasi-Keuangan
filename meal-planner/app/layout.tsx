import type { Metadata, Viewport } from 'next';
import './globals.css';
import ServiceWorkerRegistrar from '@/components/pwa/ServiceWorkerRegistrar';
import InstallPrompt from '@/components/pwa/InstallPrompt';

const APP_NAME = 'Dapur Kita';
const APP_DESC =
  'Simpan resep dari mana saja, susun rencana makan mingguan, dan ubah otomatis jadi daftar belanja yang rapi per rak toko.';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  applicationName: APP_NAME,
  title: { default: `${APP_NAME}: Perencana Menu & Belanja`, template: `%s · ${APP_NAME}` },
  description: APP_DESC,
  manifest: '/manifest.webmanifest',
  // Kunci dukungan iOS: Safari mengabaikan sebagian besar isi manifest dan
  // membaca meta apple-* ini saat "Add to Home Screen".
  appleWebApp: {
    capable: true,
    title: APP_NAME,
    statusBarStyle: 'default',
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    type: 'website',
    siteName: APP_NAME,
    title: `${APP_NAME}: Perencana Menu & Belanja`,
    description: APP_DESC,
    locale: 'id_ID',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Zoom sengaja tidak dimatikan. Auto-zoom iOS yang mengganggu itu sudah
  // dicegah lewat font-size 16px pada input di globals.css, jadi tidak perlu
  // mengorbankan aksesibilitas dengan user-scalable=no.
  maximumScale: 5,
  userScalable: true,
  // Konten boleh masuk ke area notch, lalu diberi jarak lewat utility safe-*.
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0e9160' },
    { media: '(prefers-color-scheme: dark)', color: '#0a6f4a' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-dvh bg-canvas text-ink antialiased">
        {children}
        <ServiceWorkerRegistrar />
        <InstallPrompt />
      </body>
    </html>
  );
}
