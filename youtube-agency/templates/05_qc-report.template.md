---
video_id: {{VIDEO_ID}}
agent: "@CEO-Agent"
version: 1
keputusan: PENDING   # RILIS / TAHAN
---
# Laporan QC Final · {{VIDEO_ID}}

## 1. Skor Naskah (rubrik CLAUDE.md §6)
| Kriteria | Bobot | Skor | Catatan |
|---|---|---|---|
| Hook 0-30 dtk | 25 | | |
| Struktur retensi | 20 | | |
| Akurasi fakta | 20 | | |
| Kesesuaian durasi | 10 | | |
| CTA | 10 | | |
| Gaya & brand | 15 | | |
| **Total** | 100 | | |

## 2. Konsistensi Lintas File
- [ ] Judul rekomendasi ditepati oleh hook
- [ ] Teks thumbnail tidak mengulang judul
- [ ] Chapters cocok dengan timestamp naskah
- [ ] Durasi estimasi (tools/wordcount.sh) dalam ±10% target
- [ ] Kolom VRF, TODO, REV semuanya 0 di tools/handoff-check.sh

## 3. Kepatuhan
- [ ] Nilai orisinal video (tulis 1-2 kalimat):
- [ ] Semua aset stok punya kolom lisensi
- [ ] Label "Altered or synthetic content" diperlukan? Ya / Tidak (alasan)
- [ ] Tidak ada klaim menyesatkan / nama-wajah orang nyata tanpa dasar

## 4. Checklist Kerja Manual Pemilik
- [ ] Generate gambar AI dari `prompts/{{VIDEO_ID}}-prompts.md`
- [ ] Unduh aset stok, isi kolom lisensi di 03_visual.md
- [ ] Rekam/generate voice-over dari baris NARASI
- [ ] Edit video sesuai shot list, render
- [ ] Buat thumbnail (konsep rekomendasi)
- [ ] Upload: judul, deskripsi, tags, thumbnail, playlist, end screen, label sintetis
- [ ] Pasang pinned comment
- [ ] Jadwalkan Shorts sesuai 04_metadata.md
- [ ] Catat topik di research/arsip-topik.md

## 5. Keputusan
RILIS / TAHAN, alasan:

<!-- HANDOFF
from: @CEO-Agent
to: Pemilik
video_id: {{VIDEO_ID}}
stage: 05_qc-report
status: PENDING
next_action:
open_questions:
-->
