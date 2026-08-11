# £ Keuangan Berdua — Catatan Keuangan Bulanan untuk 2 Orang, 2 HP

Aplikasi HP (PWA) untuk mencatat keuangan bulanan **berdua**, dalam **poundsterling (£)**.
Setiap layar menampilkan **keuangan satu orang saja** supaya angkanya tidak tercampur, sementara
datanya **tersinkron real-time** antar HP — ketuk nama pasangan di pengalih atas untuk melihat
perkembangannya. Lengkap dengan anggaran per orang dan **review keuangan setiap bulan**.

## 📲 Buka & Pasang di HP

**https://lukas2407.github.io/Aplikasi-Keuangan/**

1. Buka alamat di atas di browser HP (lakukan di **kedua HP**).
2. **Android (Chrome):** menu ⋮ → *Tambahkan ke layar utama* / *Instal aplikasi*.
3. **iPhone (Safari):** tombol Bagikan ⬆️ → *Tambah ke Layar Utama*.
4. Aplikasi muncul dengan ikon **£**, terbuka layar penuh, dan tetap jalan offline.

📖 Panduan lengkap (termasuk cara menghubungkan 2 HP): **[PANDUAN_KEUANGAN.md](PANDUAN_KEUANGAN.md)**

## ✨ Fitur

- **📷 Scan struk belanja** — foto struknya, aplikasi membaca dan **merinci apa saja yang dibeli** beserta harganya, menebak kategori tiap barang, lalu menyimpannya sebagai satu transaksi berisi rincian atau dipecah otomatis per kategori. Ada juga jalur ketik/tempel teks untuk pemakaian offline.
- **➕ Catat cepat** — pengeluaran/pemasukan, nominal £ (mendukung pence), kategori, tanggal, catatan. Transaksi masuk ke catatan orang yang sedang ditampilkan.
- **🏷️ Kategori lengkap** — termasuk **Baju 👕, Make Up 💄, dan Skincare 🧴**, dan bisa ditambah sendiri.
- **👤 Tampilan per orang** — Beranda, Riwayat, dan Review hanya menampilkan satu orang; aplikasi terbuka pada pemilik HP itu, dan pengalih di atas untuk melihat pasangan.
- **☁️ Dua HP tetap satu data** — sinkronisasi real-time lewat Firebase gratis milik sendiri.
- **🎯 Batas pengeluaran rinci** — batas total bulanan plus batas tiap kategori yang bisa dipatok **per hari, per minggu, atau per bulan**, semuanya dalam satu layar. Beranda menghitung sisa jatah per hari, dan kamu diperingatkan otomatis begitu sebuah batas terlampaui. Batas milik masing-masing orang.
- **🔒 Kunci pribadi** — catatan tiap orang dilindungi PIN sendiri (di-hash SHA-256, berlaku di kedua HP). PIN yang dimasukkan menentukan catatan siapa yang terbuka; pasangan tidak bisa berpindah ke catatanmu tanpa PIN-mu. Kunci otomatis setelah 5 menit menganggur.
- **📈 Review setiap bulan** — pengingat otomatis di awal bulan, vonis kesehatan keuangan, perbandingan vs bulan lalu, batas vs realisasi, 5 pengeluaran terbesar, dan catatan kesepakatan bersama yang ikut tersinkron.
- **📊 Grafik & PDF** — grafik batang pemasukan vs pengeluaran 6 bulan langsung di halaman Review, plus tombol **Buat PDF Review** untuk menyimpan laporan rapi lewat *Simpan sebagai PDF* di HP.
- **💾 Aman** — data tersimpan di HP (offline tetap jalan), ekspor/impor JSON untuk cadangan.

| Beranda | Batas Pengeluaran | Kunci Pribadi |
|---|---|---|
| ![Beranda](screenshots/shot-keuangan-beranda.png) | ![Batas](screenshots/shot-keuangan-batas.png) | ![Kunci](screenshots/shot-keuangan-kunci.png) |

| Scan Struk | Grafik Review | Hasil PDF |
|---|---|---|
| ![Struk](screenshots/shot-keuangan-struk.png) | ![Grafik](screenshots/shot-keuangan-grafik.png) | ![PDF](screenshots/shot-keuangan-pdf.png) |

## 🛠️ Teknis

HTML + CSS + JavaScript murni dalam satu file (`index.html`), PWA (manifest + service worker),
penyimpanan localStorage, sinkronisasi opsional via Firebase Firestore pada akun pengguna sendiri.
Deploy otomatis ke GitHub Pages lewat `.github/workflows/pages.yml`.
