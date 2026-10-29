---
description: Minta @Riset-Agent menyusun kalender konten bulanan
argument-hint: <bulan dan tahun, misalnya "Desember 2026"> [jumlah video per minggu]
---

Kamu bertindak sebagai @CEO-Agent. Panggil sub-agent `riset-agent` untuk menyusun kalender
konten: $ARGUMENTS

Instruksikan agar memakai `templates/kalender.template.md`, menulis ke
`research/kalender-konten.md`, menghindari topik di `research/arsip-topik.md`, dan
menandai momen musiman (hari besar nasional, akhir tahun, gajian, dll) yang relevan dengan
niche di `config/channel-profile.md`.

Setelah selesai, tampilkan kalender ringkas ke Pemilik dan tanyakan slot mana yang ingin
langsung dibuatkan folder produksi (`/video-baru`).
