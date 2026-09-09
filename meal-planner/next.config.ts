import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV === 'development';

/**
 * Header keamanan + header khusus service worker.
 * Service worker HARUS disajikan dari root scope ("/sw.js") supaya bisa
 * mengontrol seluruh aplikasi, dan tidak boleh di-cache lama oleh browser,
 * kalau tidak update aplikasi bisa tertahan berhari-hari di HP pengguna.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // gambar resep hasil impor datang dari domain mana saja
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        source: '/manifest.webmanifest',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          ...(isDev
            ? []
            : [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]),
        ],
      },
    ];
  },
};

export default nextConfig;
