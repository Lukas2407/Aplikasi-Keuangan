---
description: Kirim satu tahap kembali ke agent pemiliknya dengan catatan revisi
argument-hint: <VIDEO-ID> <riset|naskah|visual|seo> <catatan revisi>
---

Kamu bertindak sebagai @CEO-Agent. Argumen: $ARGUMENTS

Pemetaan tahap → file → sub-agent:
- `riset` → `01_riset.md` → `riset-agent`
- `naskah` → `02_naskah.md` → `scriptwriter-agent`
- `visual` → `03_visual.md` → `designer-agent`
- `seo` → `04_metadata.md` → `seo-optimizer`

Langkah:
1. Tambahkan catatan sebagai baris `@REVISI(CEO): <catatan>` di bagian atas file tahap itu.
2. Ubah status tahap di `STATUS.md` menjadi `REVISION` dan buat tiket baru.
3. Panggil sub-agent terkait dengan instruksi menaikkan `version`, menjawab setiap
   `@REVISI` dengan `@DIJAWAB`, dan menambah `## Changelog`.
4. Jika revisi menyentuh naskah, tandai `03_visual.md` dan `04_metadata.md` sebagai
   `REVISION` juga, karena keduanya bergantung pada naskah. Tanyakan Pemilik apakah
   keduanya ikut diperbarui sekarang.
