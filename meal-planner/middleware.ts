import { NextResponse, type NextRequest } from 'next/server';
import { GATE_COOKIE, gateEnabled, gateToken, safeEqual } from '@/lib/gate';

/**
 * Penjaga seluruh aplikasi. Berjalan sebelum halaman mana pun dirender,
 * jadi tidak ada satu route pun yang bisa lupa memeriksanya.
 */

/** Jalur yang harus tetap terbuka, kalau tidak gerbangnya mengunci dirinya sendiri. */
const PUBLIC_PATHS = ['/masuk', '/api/gate', '/api/health', '/offline'];
const PUBLIC_FILES = ['/sw.js', '/manifest.webmanifest', '/favicon.ico'];

export async function middleware(request: NextRequest) {
  if (!gateEnabled()) return NextResponse.next();

  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icons') ||
    PUBLIC_FILES.includes(pathname) ||
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  ) {
    return NextResponse.next();
  }

  const expected = await gateToken(process.env.APP_PASSPHRASE ?? '', process.env.AUTH_SECRET ?? 'dapurkita');
  const cookie = request.cookies.get(GATE_COOKIE)?.value ?? '';
  if (cookie && safeEqual(cookie, expected)) return NextResponse.next();

  // Permintaan API menerima 401, bukan halaman HTML: pemanggil di sisi
  // klien mengurai JSON, dan redirect hanya akan membingungkannya.
  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Belum masuk' }, { status: 401 });
  }

  const url = request.nextUrl.clone();
  url.pathname = '/masuk';
  url.search = pathname === '/' ? '' : `?next=${encodeURIComponent(pathname)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
