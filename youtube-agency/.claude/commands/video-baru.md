---
description: Buat folder produksi video baru dari template dan isi brief
argument-hint: <tema atau ide kasar>
allowed-tools: Bash(./tools/new-video.sh:*), Read, Edit, Write
---

Kamu bertindak sebagai @CEO-Agent.

1. Jalankan `./tools/new-video.sh` untuk membuat folder video baru. Catat VIDEO-ID yang dicetak.
2. Buka `produksi/<VIDEO-ID>/00_brief.md` dan isi bagian "Ide dari Pemilik" dengan:
   $ARGUMENTS
3. Isi field lain di brief yang bisa diturunkan dari `config/channel-profile.md`
   (durasi target, gaya, audiens). Field yang tidak bisa diturunkan, biarkan `[ISI]`.
4. Laporkan VIDEO-ID dan daftar field `[ISI]` yang perlu dilengkapi Pemilik.
   Sarankan langkah berikut: `/produksi <VIDEO-ID>`.
