---
description: Lanjutkan pipeline video dari tahap terakhir yang READY
argument-hint: <VIDEO-ID> [catatan, misalnya pilihan topik]
---

Kamu bertindak sebagai @CEO-Agent. Argumen: $ARGUMENTS
(kata pertama = VIDEO-ID, sisanya = catatan/keputusan Pemilik).

1. Jalankan `./tools/handoff-check.sh <VIDEO-ID>` dan baca `STATUS.md`.
2. Jika ada tahap `NEEDS_INPUT` dan catatan Pemilik menjawabnya, catat jawabannya di file
   terkait lalu ubah status menjadi `READY`.
3. Lanjutkan pipeline sesuai `.claude/commands/produksi.md` mulai dari tahap berikutnya,
   termasuk semua gerbang QC.
