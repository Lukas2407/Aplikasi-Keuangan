# Dapur Kita

PWA perencana menu makan bergaya Mise: simpan resep dari mana saja, susun rencana
makan mingguan, lalu ubah otomatis jadi daftar belanja yang dikelompokkan per rak
toko. Dipakai lewat browser HP dan bisa dipasang ke layar utama tanpa Play Store
maupun App Store.

## Tumpukan teknologi

| Lapis | Pilihan | Alasan singkat |
|---|---|---|
| Frontend | Next.js App Router + TypeScript + Tailwind v4 | satu proyek untuk UI dan API, mobile-first lewat utility |
| Backend | Next.js Route Handlers (serverless) | tidak ada server terpisah yang perlu dijaga |
| Basis data | PostgreSQL + Prisma | relasi resep, bahan, dan rencana makan padat sekali; Decimal untuk takaran dan uang |
| Auth | Auth.js (NextAuth v5) + Prisma adapter | email/kata sandi dan Google/Apple dalam satu tabel pengguna |
| PWA | manifest.ts + service worker tulis tangan | tidak ada langkah build tambahan, aturan cache eksplisit |
| Hosting | Vercel + Supabase/Neon | gratis untuk pemakaian pribadi, HTTPS otomatis (syarat PWA) |

## Status per fase

| Fase | Isi | Status |
|---|---|---|
| A | Manifest, ikon, service worker, prompt pemasangan | selesai |
| B | Skema basis data (18 tabel) + seed katalog bahan | selesai, `prisma validate` lolos |
| C | UI kalender makan dan daftar belanja | belum |
| D | API impor resep (LLM) dan pembuat daftar belanja | belum |
| E | Panduan penerapan dan uji pasang di HP | belum |

## Menjalankan di lokal

```bash
cp .env.example .env          # isi DATABASE_URL dan DIRECT_URL
npm install
npx prisma migrate deploy     # atau: npx prisma migrate dev
npm run db:seed
npm run dev
```

Service worker sengaja tidak didaftarkan saat `NODE_ENV=development`, supaya
perubahan kode tidak tertahan cache. Untuk mengujinya:

```bash
npm run build && npm start
```

lalu buka lewat HTTPS (ngrok/Cloudflare Tunnel) atau `http://localhost`, karena
service worker hanya jalan di kedua konteks itu.

## Struktur

```
app/
  layout.tsx          metadata, viewport, meta apple-*, pemasangan komponen PWA
  manifest.ts         Web App Manifest (disajikan sebagai /manifest.webmanifest)
  offline/page.tsx    halaman cadangan saat navigasi gagal
components/pwa/
  ServiceWorkerRegistrar.tsx   pendaftaran + banner pembaruan
  InstallPrompt.tsx            tombol pasang (Android) dan petunjuk (iOS)
lib/
  prisma.ts           satu PrismaClient per proses
  db-scope.ts         penjaga agar kueri selalu tersaring userId
prisma/
  schema.prisma       skema lengkap
  seed.ts             katalog bahan awal
  migrations/         migrasi awal hasil prisma migrate diff
public/
  sw.js               service worker
  icons/              192, 512, maskable, apple-touch
```

## Catatan jujur soal harga belanja

Skema menyimpan toko (`Store`) dan pengamatan harga (`PriceEntry`) supaya
aplikasi bisa membandingkan perkiraan total belanja antar toko. Sumber harganya
adalah catatan pengguna sendiri (ketik manual atau baca struk), bukan API toko:
jaringan seperti Tesco, Sainsbury, atau Indomaret tidak membuka data harga
real-time untuk umum. Pencarian toko terdekat memakai titik lokasi perangkat
plus data OpenStreetMap, yang memberi nama, merek, dan jarak toko, tanpa harga.
