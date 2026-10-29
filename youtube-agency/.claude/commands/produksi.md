---
description: Jalankan pipeline produksi penuh untuk satu video (riset → naskah → visual + SEO → QC)
argument-hint: <VIDEO-ID>
---

Kamu bertindak sebagai @CEO-Agent. Jalankan pipeline untuk video **$ARGUMENTS** sesuai
`CLAUDE.md` §4 dan §9.

## Tahap 0: Pemeriksaan awal
- Pastikan `produksi/$ARGUMENTS/` ada dan `config/channel-profile.md` tidak berisi `[ISI`.
  Jika gagal, berhenti dan laporkan.
- Baca `STATUS.md`. Jika ada tahap yang sudah `READY`, mulai dari tahap berikutnya.

## Tahap 1: Riset
- Buat TICKET di `STATUS.md`. Panggil sub-agent `riset-agent` dengan prompt berisi VIDEO-ID,
  path input (`00_brief.md`), path output (`01_riset.md`), dan kriteria di CLAUDE.md.
- Baca `01_riset.md`. Tampilkan 3 topik teratas (judul kerja, skor, sudut unik, risiko).
- **GERBANG G1: BERHENTI dan tunggu Pemilik memilih topik.** Jangan lanjut di respons ini.

## Tahap 2: Naskah (setelah Pemilik memilih)
- Tulis pilihan Pemilik ke bagian "Topik Terpilih" di `01_riset.md`.
- Panggil `scriptwriter-agent`. Setelah selesai, baca `02_naskah.md` dan nilai dengan
  rubrik CLAUDE.md §6. Tulis skor per kriteria ke `STATUS.md`.
- Skor < 80 atau ada `[VERIFIKASI]`: tambahkan `@REVISI(CEO): ...` spesifik di naskah,
  set status REVISION, panggil ulang (maks 2 putaran, lalu eskalasi).

## Tahap 3: Visual + SEO (paralel)
- Dalam SATU respons, panggil `designer-agent` dan `seo-optimizer` sekaligus.
- Baca kedua output. Cek: judul rekomendasi selaras dengan hook dan konsep thumbnail;
  teks thumbnail tidak mengulang judul; chapters cocok dengan timestamp naskah.

## Tahap 4: Final QC (G3)
- Jalankan `./tools/handoff-check.sh $ARGUMENTS` dan `./tools/wordcount.sh $ARGUMENTS`.
- Isi `05_qc-report.md` dari template: skor, checklist kepatuhan, nilai orisinal video,
  daftar aset yang harus dibuat/diunduh Pemilik, dan keputusan RILIS / TAHAN.
- Jika RILIS: commit `produksi/$ARGUMENTS` dengan pesan `produksi($ARGUMENTS): siap upload`.
- Laporkan ke Pemilik maksimal 8 baris + checklist upload manual dari `05_qc-report.md`.
