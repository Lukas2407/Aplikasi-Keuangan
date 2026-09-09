import { NextResponse } from 'next/server';
import { z } from 'zod';
import { GATE_COOKIE, GATE_MAX_AGE, gateToken } from '@/lib/gate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({ passphrase: z.string().min(1).max(200) });

/** POST /api/gate: tukar kata sandi dengan cookie sesi. */
export async function POST(request: Request) {
  const expected = process.env.APP_PASSPHRASE;
  if (!expected) return NextResponse.json({ error: 'Gerbang tidak aktif' }, { status: 400 });

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: 'Isi permintaan bukan JSON' }, { status: 400 });
  }

  const parsed = Body.safeParse(raw);
  if (!parsed.success || parsed.data.passphrase !== expected) {
    // Jeda kecil supaya percobaan tebak beruntun tidak murah.
    await new Promise((r) => setTimeout(r, 400));
    return NextResponse.json({ error: 'Kata sandi salah' }, { status: 401 });
  }

  const token = await gateToken(expected, process.env.AUTH_SECRET ?? 'dapurkita');
  const res = NextResponse.json({ ok: true });
  res.cookies.set(GATE_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: GATE_MAX_AGE,
  });
  return res;
}
