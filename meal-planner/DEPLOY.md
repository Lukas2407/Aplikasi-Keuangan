# Menerbitkan Dapur Kita ke internet

Hasil akhirnya: satu alamat HTTPS yang bisa dibuka dari HP mana pun dan
dipasang ke layar utama. Perkiraan waktu 15 sampai 20 menit, biaya nol untuk
pemakaian pribadi.

Susunannya: **Vercel** menjalankan aplikasi, **Neon** (atau Supabase)
menyimpan basis datanya. Keduanya punya paket gratis yang cukup.

---

## 1. Siapkan basis data

### Neon (paling cepat)

1. Daftar di [neon.com](https://neon.com), buat project baru, pilih region
   terdekat (contoh: London untuk Inggris, Singapore untuk Indonesia).
2. Di halaman **Connection Details**, salin dua alamat:
   - **Pooled connection** untuk `DATABASE_URL`
   - **Direct connection** untuk `DIRECT_URL`
3. Tambahkan `?pgbouncer=true&connection_limit=1` di ujung `DATABASE_URL`.
   Ini bukan hiasan: tanpa itu Prisma menyiapkan prepared statement yang
   ditolak PgBouncer, dan pesan errornya membingungkan ("prepared statement
   s0 already exists").

### Supabase (kalau lebih suka ada dashboard tabel)

Settings, lalu Database, lalu Connection string. Port 6543 untuk
`DATABASE_URL` (mode transaction), port 5432 untuk `DIRECT_URL`.

---

## 2. Impor ke Vercel

1. Buka [vercel.com/new](https://vercel.com/new), sambungkan akun GitHub,
   pilih repo `Aplikasi-Keuangan`.
2. **Root Directory: `meal-planner`**. Langkah ini yang paling sering
   terlewat. Kalau dibiarkan di akar repo, Vercel tidak menemukan Next.js
   dan build berhenti dengan "No Next.js version detected".
3. Framework Preset terdeteksi sendiri sebagai Next.js. Biarkan apa adanya.
4. Branch: pilih `claude/meal-planner-app-7u911s`, atau merge dulu ke `main`
   supaya setiap perubahan langsung jadi deploy produksi.

---

## 3. Isi environment variable

Tempel di layar import Vercel, atau nanti di Settings, lalu Environment Variables.

| Nama | Isi | Wajib |
|---|---|---|
| `DATABASE_URL` | alamat pooled dari langkah 1 | ya |
| `DIRECT_URL` | alamat direct dari langkah 1 | ya |
| `AUTH_SECRET` | hasil `openssl rand -base64 32` | ya |
| `APP_PASSPHRASE` | kata sandi bebas, misal `dapur-lukas-2026` | ya, baca peringatan di bawah |
| `NEXT_PUBLIC_APP_URL` | `https://<nama-proyek>.vercel.app` | ya |
| `SOURCE_USER_AGENT` | `DapurKita/0.1 (kontak: email-anda@example.com)` | ya |
| `ALLOW_DEV_USER` | `1` | sementara |
| `STORE_SYNC_CACHE_HOURS` | `24` | tidak |
| `PRICE_SYNC_CACHE_HOURS` | `12` | tidak |

### Peringatan yang tidak boleh dilewati

Auth.js belum terpasang, jadi `ALLOW_DEV_USER=1` membuat semua data jatuh ke
satu pengguna yang sama. Tanpa `APP_PASSPHRASE`, siapa pun yang menemukan
alamat aplikasi Anda bisa membaca dan mengubah resep, rencana makan, dan
daftar belanja Anda. Isi kata sandinya. Middleware mengunci seluruh halaman
dan seluruh API sampai kata sandi itu dimasukkan sekali di `/masuk`, lalu
cookie-nya bertahan 30 hari.

Setelah Phase D selesai, `ALLOW_DEV_USER` dihapus dan gerbang ini boleh
dimatikan dengan mengosongkan `APP_PASSPHRASE`.

`SOURCE_USER_AGENT` juga bukan formalitas: Nominatim menolak permintaan yang
tidak menyebut identitas aplikasi dan kontak yang bisa dihubungi.

---

## 4. Deploy

Tekan Deploy. Build menjalankan `prisma generate && prisma migrate deploy &&
next build`, jadi tabelnya dibuat otomatis pada deploy pertama. Tidak ada
langkah migrasi manual.

Kalau build gagal tepat di tahap migrasi (biasanya karena `DIRECT_URL` salah),
ganti Build Command sementara di Settings menjadi `npm run build:nodb` supaya
aplikasinya tetap naik, lalu jalankan migrasinya dari komputer sendiri:

```bash
cd meal-planner
DATABASE_URL="..." DIRECT_URL="..." npx prisma migrate deploy
```

---

## 5. Periksa hasilnya

Buka `https://<proyek-anda>.vercel.app/api/health`. Jawabannya seperti ini:

```json
{
  "ok": true,
  "env": { "DATABASE_URL": true, "DIRECT_URL": true, "APP_PASSPHRASE": true },
  "database": { "ok": true, "ingredients": 50 },
  "peringatan": []
}
```

- `ok: false` dengan pesan "Can't reach database server": periksa kedua
  connection string.
- `ingredients: 0`: katalog bahan belum diisi, lanjut ke langkah 6.
- Ada isi di `peringatan`: baca, itu daftar yang masih perlu dibereskan.

Endpoint ini sengaja dibiarkan terbuka tanpa kata sandi, supaya tetap bisa
dipakai memeriksa keadaan saat Anda terkunci di luar.

---

## 6. Isi katalog bahan

Seed dijalankan sekali, dari komputer sendiri, menunjuk ke basis data produksi:

```bash
cd meal-planner
DATABASE_URL="alamat-pooled" DIRECT_URL="alamat-direct" npm run db:seed
```

Isinya 50 bahan yang paling sering dipakai, lengkap dengan rak dan sinonim
Indonesia-Inggris. Tanpa ini aplikasi tetap jalan, hanya penggolongan rak di
daftar belanja jadi lebih sering meleset.

---

## 7. Pasang di HP

1. Buka alamatnya di HP, masukkan kata sandi di `/masuk`.
2. **Android (Chrome):** tunggu beberapa detik, banner "Pasang Dapur Kita di
   HP" muncul sendiri. Atau lewat menu titik tiga, lalu *Instal aplikasi*.
3. **iPhone (Safari):** tombol Bagikan, lalu *Add to Home Screen*. Safari
   tidak punya banner otomatis, jadi aplikasi menampilkan petunjuk itu
   sendiri saat dibuka lewat Safari iOS.
4. Ikonnya piring dengan sendok garpu, terbuka layar penuh tanpa bar alamat.

---

## 8. Kalau ada yang tidak beres

| Gejala | Sebab yang paling sering | Perbaikan |
|---|---|---|
| Build: "No Next.js version detected" | Root Directory belum diisi | setel ke `meal-planner`, deploy ulang |
| `P1001 Can't reach database server` | connection string salah, atau project Neon tertidur | buka dashboard Neon sekali, periksa alamatnya |
| `prepared statement "s0" already exists` | pooler tanpa parameter pgbouncer | tambahkan `?pgbouncer=true&connection_limit=1` ke `DATABASE_URL` |
| Semua API menjawab 401 | gerbang aktif, cookie belum ada | buka `/masuk` dulu |
| Halaman terus melempar ke `/masuk` | cookie ditolak | pastikan dibuka lewat HTTPS, bukan http |
| Banner install tidak muncul di Android | sudah pernah dipasang, atau belum HTTPS | copot dulu, atau periksa `/manifest.webmanifest` terbuka |
| "Semua endpoint Overpass gagal" | Overpass sedang sibuk (429 atau 504) | tunggu beberapa menit, cermin lain sudah dicoba otomatis |
| "Ambil harga" mengembalikan 0 baris | belum ada yang melaporkan harga toko itu | wajar, cakupan Open Prices masih tipis |

---

## 9. Biaya dan batasnya

- Vercel Hobby gratis, untuk pemakaian non-komersial. Fungsi serverless tidur
  saat menganggur, jadi kunjungan pertama setelah lama tidak dibuka terasa
  lambat satu sampai dua detik.
- Neon free tier memberi satu project dengan penyimpanan yang jauh lebih dari
  cukup untuk data resep dan belanja pribadi. Basis datanya ikut tidur, dan
  bangun dalam hitungan detik.
- Sinkronisasi toko dibatasi cache 24 jam per area, jadi pemakaian Overpass
  tetap sopan meski tombolnya ditekan berulang kali.
