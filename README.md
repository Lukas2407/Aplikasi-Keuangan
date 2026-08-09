# £ Keuangan Berdua — Catatan Keuangan Bulanan untuk 2 Orang, 2 HP

Aplikasi HP (PWA) untuk mencatat keuangan bulanan **berdua**: setiap pemasukan/pengeluaran yang
dicatat salah satu orang **langsung muncul di HP pasangan** (real-time), dalam **poundsterling (£)**,
lengkap dengan anggaran per kategori dan **review keuangan setiap bulan**.

## 📲 Buka & Pasang di HP

**https://lukas2407.github.io/Aplikasi-Keuangan/**

1. Buka alamat di atas di browser HP (lakukan di **kedua HP**).
2. **Android (Chrome):** menu ⋮ → *Tambahkan ke layar utama* / *Instal aplikasi*.
3. **iPhone (Safari):** tombol Bagikan ⬆️ → *Tambah ke Layar Utama*.
4. Aplikasi muncul dengan ikon **£**, terbuka layar penuh, dan tetap jalan offline.

📖 Panduan lengkap (termasuk cara menghubungkan 2 HP): **[PANDUAN_KEUANGAN.md](PANDUAN_KEUANGAN.md)**

## ✨ Fitur

- **➕ Catat cepat** — pengeluaran/pemasukan, nominal £ (mendukung pence), kategori, tanggal, siapa yang mencatat, catatan.
- **👥 Dua orang, dua HP** — tiap catatan berlabel pencatatnya; Beranda menampilkan kontribusi masing-masing; sinkronisasi real-time lewat Firebase gratis milik sendiri.
- **🎯 Anggaran per kategori** — bilah kemajuan menguning mendekati batas, memerah saat terlampaui.
- **📈 Review setiap bulan** — pengingat otomatis di awal bulan, vonis kesehatan keuangan, perbandingan vs bulan lalu, rapor per orang, anggaran vs realisasi, 5 pengeluaran terbesar, catatan kesepakatan yang ikut tersinkron, dan tanda ✅ review selesai.
- **📊 Perkembangan 6 bulan** — tren pengeluaran kalian berdua berdampingan, untuk saling memantau progress.
- **💾 Aman** — data tersimpan di HP (offline tetap jalan), ekspor/impor JSON untuk cadangan.

| Beranda | Riwayat | Review |
|---|---|---|
| ![Beranda](screenshots/shot-keuangan-beranda.png) | ![Riwayat](screenshots/shot-keuangan-riwayat.png) | ![Review](screenshots/shot-keuangan-review.png) |

## 🛠️ Teknis

HTML + CSS + JavaScript murni dalam satu file (`index.html`), PWA (manifest + service worker),
penyimpanan localStorage, sinkronisasi opsional via Firebase Firestore pada akun pengguna sendiri.
Deploy otomatis ke GitHub Pages lewat `.github/workflows/pages.yml`.
