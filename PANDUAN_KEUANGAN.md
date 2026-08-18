# £ Catatan Keuangan — Panduan Lengkap

Aplikasi pencatatan keuangan bulanan **untuk dirimu sendiri**: pemasukan, pengeluaran, batas
pengeluaran yang rinci, scan struk belanja, dan review setiap bulan lengkap dengan grafik yang bisa
disimpan sebagai PDF. Punya HP kedua atau tablet? Catatannya bisa disinkronkan supaya sama di semua
perangkatmu.

**Satu file. Tanpa server sendiri. Gratis.**

---

## 1. Cara Memasang di HP

### Cara termudah (lewat internet)
1. Buka alamat aplikasi di browser HP:

   **https://lukas2407.github.io/Aplikasi-Keuangan/**

2. **Android (Chrome):** menu ⋮ → *Tambahkan ke layar utama* / *Instal aplikasi*.
3. **iPhone (Safari):** tombol Bagikan ⬆️ → *Tambah ke Layar Utama*.
4. Aplikasi muncul di layar utama dengan ikon **£** ungu, terbuka layar penuh, dan tetap jalan offline.

### Tanpa hosting (offline)
Kirim file `index.html` ke HP (WhatsApp/email/kabel), lalu buka dengan browser. Semua fitur jalan,
hanya saja tidak bisa "di-install" sebagai aplikasi, dan sinkronisasi tetap butuh internet.

## 2. Pengaturan Awal

Saat pertama dibuka, aplikasi hanya menanyakan **namamu**. Itu saja — langsung bisa dipakai.
Nama dan mata uang bisa diubah kapan saja lewat **Atur → Profil**.

**Mata uang bawaannya poundsterling (£)** lengkap dengan pence (misal £12.50). Kalau ingin memakai
Rupiah, ganti di **Atur → Profil → Mata uang**. Nominal yang sudah tercatat tidak dikonversi
otomatis, jadi tentukan mata uangnya sejak awal.

### Kunci aplikasi 🔒
Buka **Atur → 🔒 Kunci Aplikasi → Pasang PIN** supaya catatanmu tidak bisa dibuka orang lain saat HP
dipinjam atau tertinggal.

- Aplikasi meminta PIN setiap kali dibuka.
- Mengunci sendiri setelah **5 menit menganggur** (bisa dimatikan), dan ada tombol **Kunci sekarang**.
- PIN disimpan dalam bentuk **teracak SHA-256**, tidak pernah sebagai angka aslinya, jadi tidak bisa
  dibaca siapa pun termasuk dari file cadangan.
- Konsekuensinya: **PIN yang lupa tidak bisa dipulihkan.** Yang tersisa adalah memulihkan dari file
  cadangan JSON. Karena itu sempatkan ekspor cadangan sesekali.

## 3. Mencatat Keuangan Sehari-hari

- Tekan tombol **＋** besar di tengah bawah, atau **➕ Catat cepat** di Beranda.
- Pilih **💸 Pengeluaran** atau **💰 Pemasukan**, isi nominal, pilih kategori, tanggal, dan catatan singkat.
- Salah catat? Buka transaksinya dari Beranda atau Riwayat, lalu ubah atau hapus.

Tab **🧾 Riwayat** menampilkan transaksi bulan itu, bisa disaring masuk/keluar dan dicari
berdasarkan catatan atau kategori. Panah ‹ › untuk pindah bulan.

### Kategori yang tersedia
Pemasukan: Gaji, Bonus & THR, Usaha Sampingan, Pemasukan Lain.
Pengeluaran: Makan & Minum, Belanja Harian, Transportasi, Tagihan & Pulsa, Sewa/Cicilan, Kesehatan,
**Baju 👕, Make Up 💄, Skincare 🧴**, Hiburan & Jajan, Keluarga & Sosial, Tabungan & Investasi, Lainnya.
Kamu tetap bisa menambah kategori sendiri lewat **Atur → Kategori → Tambah kategori**.

## 3a. Scan Struk Belanja 📷

Daripada mengetik satu per satu, foto saja struknya. Aplikasi membaca tulisannya lalu **merinci apa
saja yang kamu beli**.

1. Tekan **📷 Scan struk** di Beranda (atau tombol yang sama di dalam formulir catat transaksi).
2. Ambil foto struknya, atau pilih foto yang sudah ada di galeri.
3. Tunggu sebentar. Pembacaan **pertama kali mengunduh mesin OCR sekali saja, sekitar 2 MB**
   (butuh internet); setelah itu tersimpan di HP dan scan berikutnya jauh lebih cepat karena
   mesinnya dipakai ulang. Mesin juga mulai disiapkan begitu layar scan dibuka, jadi sebagian waktu
   tunggu sudah berjalan selagi kamu memotret.
4. Muncul layar **Tinjau Belanjaan** berisi daftar barang beserta harganya. Baris total, kembalian,
   pajak, dan ucapan terima kasih otomatis dibuang.
5. **Kategori tiap barang ditebak otomatis** dari namanya — misal *T-Shirt Cotton* → Baju,
   *Maybelline Lipstick* → Make Up, *Cetaphil Cleanser* → Skincare, *Bread* → Makan & Minum.
   Semua bisa kamu betulkan, termasuk nama dan harganya, dan baris bisa ditambah/dihapus.
6. Pilih cara menyimpan:
   - **Simpan Jadi 1 Transaksi** — satu catatan berisi rincian semua barang.
   - **Simpan Terpisah per Kategori** — otomatis dipecah, misal satu transaksi Baju, satu Make Up,
     satu Skincare. Berguna supaya batas tiap kategori terhitung benar.

Transaksi yang punya rincian ditandai lencana **🧾 N barang** di Riwayat; buka transaksinya untuk
melihat daftar belanjanya.

> **Catatan jujur soal ketelitian.** Pembacaan foto bukan sihir: struk yang kusut, buram, atau
> berhuruf kecil bisa terbaca meleset satu-dua huruf atau angka. Karena itu selalu ada layar tinjauan
> sebelum disimpan — periksa sekilas, terutama angkanya. Kalau fotonya gagal terbaca, ada jalur
> **⌨️ Ketik / tempel teks struk** yang jalan tanpa internet: satu barang per baris, harga di akhir baris.

## 3b. Mengatur Batas Pengeluaran 🎯

Buka **Atur → 🎯 Atur Batas Pengeluaran** (atau tombol **🎯 Batas** di Beranda). Semua batas diatur
dalam satu layar:

- **Batas total per bulan** — pagu pengeluaran keseluruhan, misal £2.200. Beranda lalu menampilkan
  bilah "Batas Pengeluaran Bulan Ini" berisi jumlah terpakai, persentase, sisa, dan hitungan
  **kira-kira berapa lagi yang boleh dipakai per hari** untuk sisa hari di bulan itu.
- **Batas tiap kategori** — isi angkanya, lalu pilih satuannya: **per hari, per minggu, atau per bulan**.
  Contoh yang lebih natural: *Makan & Minum £5 per hari*, *Belanja Harian £90 per minggu*,
  *Sewa £1.000 per bulan*. Aplikasi otomatis menghitungnya menjadi setara sebulan penuh saat
  dibandingkan dengan realisasi, dan menuliskan konversinya (*batas £5/hr · setara £155 sebulan*).

Kosongkan angkanya (atau isi 0) bila sebuah kategori tidak ingin dibatasi.

**Peringatan otomatis.** Begitu sebuah transaksi membuat kategori atau total bulanan menembus
batas, muncul pesan seperti *"⚠️ 🍜 Makan & Minum lewat batas £12"* tepat setelah menyimpan.
Aplikasi juga memperingatkan saat pemakaian sudah lebih dari 80% batas. Di Beranda, bilah kemajuan
berubah kuning saat mendekati batas dan merah saat terlampaui.

## 4. Review Setiap Bulan 📈

Ritual bulanan: di awal bulan, tinjau bulan yang baru selesai.

1. Beranda otomatis menampilkan pengingat **"Waktunya review bulanan!"** selama bulan lalu belum
   ditandai selesai. Tekan **Mulai**.
2. Halaman Review menampilkan:
   - **Vonis kesehatan keuangan** — berapa % pemasukan yang berhasil disisakan (atau peringatan defisit);
   - **Perbandingan dengan bulan sebelumnya** — pemasukan/pengeluaran naik atau turun berapa persen;
   - **Grafik Pemasukan vs Pengeluaran** — batang berpasangan untuk 6 bulan terakhir, hijau untuk
     pemasukan dan merah berarsir untuk pengeluaran, dengan bulan yang sedang direview disorot;
   - **Rincian 6 bulan** — angka tiap bulan sebagai tabel pendamping grafik;
   - **Batas vs realisasi** — batas total bulanan dan tiap kategori, dengan tanda ✅/❌;
   - **5 pengeluaran terbesar** bulan itu;
   - Rata-rata pengeluaran per hari.
3. Tulis kesimpulanmu di **Catatan Review** (misal: *"Bulan depan jatah ngopi maksimal £30"*).
4. Tekan **✅ Tandai Review Selesai** — bulan itu mendapat centang hijau di riwayat review.

### Menyimpan review sebagai PDF 📄
Di halaman Review ada tombol **📄 Buat PDF Review**. Aplikasi menyusun laporan rapi berisi judul,
nama, bulan, tanggal cetak, vonis, angka utama, **grafik pemasukan vs pengeluaran**, rincian 6 bulan,
batas vs realisasi, 5 pengeluaran terbesar, dan catatan review — tanpa tombol atau menu.

Saat dialog cetak muncul, pilih tujuan **"Simpan sebagai PDF"**:
- **Android (Chrome):** pada pilihan tujuan/printer, pilih *Save as PDF* → **Simpan**.
- **iPhone (Safari):** di pratinjau cetak, cubit-perbesar halamannya, lalu tekan tombol Bagikan ⬆️ →
  *Simpan ke File*.

## 5. Sinkronisasi Antar Perangkat (opsional)

Kalau hanya memakai satu HP, **lewati bagian ini** — aplikasi sudah jalan sepenuhnya tanpa internet.

Bagian ini berguna bila kamu punya HP kedua atau tablet, atau sedang berganti HP dan ingin catatannya
ikut pindah. Data disimpan di **Firebase** (layanan database Google) pada **akunmu sendiri**; paket
gratisnya jauh lebih dari cukup.

### Langkah A — Buat proyek Firebase
1. Buka **https://console.firebase.google.com** → login akun Google.
2. **Create a project** → beri nama, mis. `keuangan-saya` → matikan Google Analytics → **Create**.

### Langkah B — Nyalakan database Firestore
1. Menu kiri: **Build → Firestore Database** → **Create database**.
2. Lokasi server: **asia-southeast2 (Jakarta)** → Next → **Start in production mode** → **Create**.
3. Buka tab **Rules**, ganti seluruh isinya dengan ini, lalu **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /couples/{coupleId}/{document=**} {
      allow read, write: if true;
    }
  }
}
```

> 🔐 **Keamanannya dari mana?** Data tersimpan di bawah **Kode Sinkronisasi** — kode acak panjang yang
> hanya diketahui perangkatmu (seperti nomor rekening rahasia). Tanpa kode itu data tidak bisa
> ditemukan. Karena itu **jangan bagikan Kode Sinkronisasi** ke siapa pun.

### Langkah C — Ambil 2 kode proyek
1. ⚙️ **Project settings** → gulir ke **Your apps** → klik ikon **`</>`** (Web) → beri nama bebas → **Register app**.
2. Dari kode `firebaseConfig` yang tampil, catat dua nilai:
   - `apiKey` — contoh: `AIzaSyB1234…`
   - `projectId` — contoh: `keuangan-saya`

### Langkah D — Sambungkan perangkat
Di **perangkat utama**:
1. **Atur → ☁️ Sinkronisasi Antar Perangkat** → centang *Aktifkan sinkronisasi cloud*.
2. Isi **API Key** dan **Project ID** dari Langkah C.
3. Tekan **🎲** untuk membuat **Kode Sinkronisasi** acak → tekan **📋** untuk menyalinnya.
4. **💾 Simpan & Sambungkan** → lencana di pojok kanan atas berubah **"☁️ Tersinkron"** hijau.
   Data yang sudah ada otomatis terunggah.

Di **perangkat berikutnya**: ulangi dengan **API Key, Project ID, dan Kode Sinkronisasi yang SAMA
PERSIS** → seluruh catatan langsung tergabung.

### Uji coba
Catat satu pengeluaran di perangkat pertama → dalam ±2 detik muncul di perangkat kedua disertai
notifikasi *"🔄 Data diperbarui dari perangkat lain"*.

## 6. Hal yang Perlu Diketahui

| Hal | Penjelasan |
|---|---|
| Butuh internet? | Tidak untuk pemakaian sehari-hari. Hanya untuk sinkronisasi dan unduhan mesin OCR yang pertama. |
| Apa saja yang tersinkron | Transaksi (termasuk rincian barang dari struk), kategori, batas pengeluaran, nama, catatan review, dan PIN dalam bentuk teracak. |
| Foto struk | Yang disimpan hanya **rincian barangnya**, bukan file fotonya — supaya penyimpanan HP tidak cepat penuh. |
| Cadangan | **Atur → Data & Cadangan → Ekspor JSON** menghasilkan file cadangan yang bisa diimpor kembali kapan saja. Ini juga satu-satunya jalan pulih bila PIN terlupa. |
| Biaya | Paket gratis Firebase: 50.000 baca & 20.000 tulis per hari — jauh di atas kebutuhan pribadi. |
| Coba-coba dulu | Saat data masih kosong ada tombol **🎬 Coba dengan data contoh** untuk melihat semua fitur dengan data pura-pura. |

## 7. Tampilan Aplikasi

| Beranda | Riwayat | Kunci Aplikasi |
|---|---|---|
| ![Beranda](screenshots/shot-keuangan-beranda.png) | ![Riwayat](screenshots/shot-keuangan-riwayat.png) | ![Kunci](screenshots/shot-keuangan-kunci.png) |

| Scan Struk | Batas Pengeluaran | Grafik Review |
|---|---|---|
| ![Struk](screenshots/shot-keuangan-struk.png) | ![Batas](screenshots/shot-keuangan-batas.png) | ![Grafik](screenshots/shot-keuangan-grafik.png) |

Hasil review yang disimpan sebagai PDF:

![PDF](screenshots/shot-keuangan-pdf.png)

## 8. Pemecahan Masalah

- **Lencana "☁️ Gagal"** → periksa API Key/Project ID (salah ketik penyebab #1), pastikan Firestore
  sudah dibuat (Langkah B) dan rules sudah di-Publish.
- **Catatan tidak muncul di perangkat lain** → pastikan **Kode Sinkronisasi sama persis**
  (huruf besar/kecil berpengaruh). Sebaiknya disalin-tempel, jangan diketik ulang.
- **Scan struk gagal atau lama** → pastikan ada internet untuk unduhan pertama, foto struk datar dan
  terang, atau pakai jalur **⌨️ Ketik / tempel teks struk**.
- **Lupa PIN** → tidak bisa dipulihkan karena PIN hanya tersimpan teracak. Pasang ulang aplikasi lalu
  impor file cadangan JSON terakhirmu.
- **Ganti HP** → pasang aplikasi di HP baru, isi konfigurasi sinkron yang sama, semua data turun
  sendiri. Tanpa sinkron: gunakan Ekspor/Impor JSON.
