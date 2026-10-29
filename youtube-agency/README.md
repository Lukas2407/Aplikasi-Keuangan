# Kantor Virtual · Agensi Produksi YouTube Faceless (Claude Code Multi-Agent)

Ekosistem ini mengubah satu folder menjadi "kantor" berisi lima peran: CEO di sesi utama
Claude Code dan empat divisi sebagai sub-agent. Mereka berkomunikasi lewat file markdown
dengan penanda handoff, sehingga setiap keputusan tercatat dan bisa diaudit lewat git.

Hasil akhir per video: riset topik, naskah ber-timestamp, shot list + prompt AI + konsep
thumbnail, metadata SEO + rencana Shorts, dan laporan QC. **Render video, voice-over,
pembuatan gambar, dan upload tetap dikerjakan Pemilik** (lihat bagian Batasan).

---

## A. Blueprint Arsitektur

```
                         ┌──────────────────────────┐
   Pemilik Kantor ─────▶ │  @CEO-Agent              │  sesi utama Claude Code
   (slash command)       │  CLAUDE.md + /produksi   │  (satu-satunya yang bisa
                         └───────────┬──────────────┘   memanggil sub-agent)
                                     │ tool Agent (subagent_type)
       ┌───────────────┬─────────────┼───────────────┬────────────────┐
       ▼               ▼             ▼               ▼                │
  riset-agent   scriptwriter-agent  designer-agent  seo-optimizer     │
       │               │             │  (paralel)    │                │
       ▼               ▼             ▼               ▼                │
  01_riset.md ──▶ 02_naskah.md ──▶ 03_visual.md   04_metadata.md ─────┘
       ▲ G1: Pemilik pilih topik   ▲ G2: QC naskah       ▼
       │                           │                05_qc-report.md (G3)
       └──────── produksi/<VIDEO-ID>/STATUS.md (papan tiket) ────────┘
```

Keputusan desain dan alasannya:

| Keputusan | Alasan | Trade-off |
|---|---|---|
| CEO di sesi utama, bukan file agent | Sub-agent Claude Code tidak bisa memanggil sub-agent lain | CLAUDE.md jadi lebih panjang |
| Komunikasi lewat file, bukan memori | Sub-agent punya konteks terpisah dan hanya mengembalikan ringkasan | Agent harus disiplin membaca file input |
| Blok `<!-- HANDOFF -->` di akhir file | Bisa dibaca mesin (`handoff-check.sh`) tanpa merusak tampilan markdown | Format harus persis |
| Gerbang G1 manusia | Pilihan topik paling menentukan hasil dan paling sulit dinilai model tanpa data channel | Pipeline tidak 100% otomatis |
| Designer & SEO paralel | Keduanya hanya butuh naskah | SEO belum melihat thumbnail final; CEO menyelaraskan di G3 |
| `git push` diblokir | Hasil tetap lokal sampai Pemilik memeriksa | Push manual |

---

## B. Struktur Workspace

```
youtube-agency/
├── CLAUDE.md                      # SOP kantor + peran CEO (dibaca otomatis)
├── README.md                      # dokumen ini
├── .gitignore
├── .claude/
│   ├── settings.json              # izin tools (allow / ask / deny)
│   ├── agents/                    # definisi divisi (sub-agent)
│   │   ├── riset-agent.md         # @Riset-Agent
│   │   ├── scriptwriter-agent.md  # @Scriptwriter-Agent
│   │   ├── designer-agent.md      # @Designer-Agent
│   │   └── seo-optimizer.md       # @SEO-Optimizer
│   └── commands/                  # slash command untuk Pemilik
│       ├── video-baru.md          # /video-baru <ide>
│       ├── produksi.md            # /produksi <VIDEO-ID>
│       ├── lanjut.md              # /lanjut <VIDEO-ID> <keputusan>
│       ├── revisi.md              # /revisi <VIDEO-ID> <tahap> <catatan>
│       ├── status.md              # /status
│       └── kalender.md            # /kalender <bulan>
├── config/
│   ├── channel-profile.md         # niche, audiens, durasi, gaya (WAJIB diisi)
│   └── brand-guide.md             # warna, font, style suffix prompt
├── research/
│   ├── kompetitor.md              # daftar kompetitor tetap
│   ├── arsip-topik.md             # topik yang sudah dibuat + performa
│   └── kalender-konten.md         # dibuat oleh /kalender
├── prompts/
│   └── VID-2026-001-prompts.md    # prompt Midjourney/Leonardo per video
├── templates/                     # kerangka output setiap tahap
│   ├── 00_brief.template.md … 05_qc-report.template.md
│   ├── STATUS.template.md
│   └── kalender.template.md
├── tools/
│   ├── new-video.sh               # buat folder produksi dari template
│   ├── handoff-check.sh           # baca status HANDOFF + penanda terbuka
│   └── wordcount.sh               # hitung kata narasi → estimasi durasi
└── produksi/
    └── VID-2026-001/              # satu folder = satu video
        ├── STATUS.md              # papan tiket (hanya CEO yang edit)
        ├── 00_brief.md            # Pemilik
        ├── 01_riset.md            # @Riset-Agent        (= /research)
        ├── 02_naskah.md           # @Scriptwriter-Agent (= /scripts)
        ├── 03_visual.md           # @Designer-Agent     (+ /prompts)
        ├── 04_metadata.md         # @SEO-Optimizer      (= /metadata)
        ├── 05_qc-report.md        # @CEO-Agent
        └── aset/                  # file aset lokal (di-gitignore)
```

Folder dikelompokkan per video, bukan per jenis file, agar satu video bisa diarsip,
direvisi, atau di-commit sebagai satu unit.

---

## C. Workflow Operasional: 1 Video dari Ide sampai Siap Upload

### Persiapan sekali saja
1. Pasang Claude Code dan login.
2. Salin folder `youtube-agency/` ke lokasi kerja, lalu:
   ```bash
   cd youtube-agency
   git init && git add . && git commit -m "Setup kantor virtual"   # jika belum repo git
   chmod +x tools/*.sh
   ```
3. Isi `config/channel-profile.md`, `config/brand-guide.md`, dan `research/kompetitor.md`.
   Semua `[ISI ...]` harus diganti. Ini langkah dengan dampak terbesar pada kualitas output.
4. (Opsional) Hubungkan MCP server untuk data riil, misalnya vidIQ atau YouTube Data API,
   lewat `claude mcp add ...`. Tanpa ini, angka RPM/volume hanya estimasi.
5. Jalankan `claude` dari folder `youtube-agency/`, ketik `/agents` untuk memastikan
   empat sub-agent terdaftar.

### Produksi per video

| Langkah | Yang Pemilik ketik / lakukan | Yang terjadi | Output |
|---|---|---|---|
| 1 | `/video-baru tema: kenapa harga emas naik terus` | CEO membuat `produksi/VID-2026-001/` dan mengisi brief | `00_brief.md`, `STATUS.md` |
| 2 | Lengkapi field `[ISI]` di `00_brief.md` bila ada | | |
| 3 | `/produksi VID-2026-001` | CEO memanggil @Riset-Agent, lalu menampilkan 3 topik teratas dan **berhenti** (G1) | `01_riset.md` |
| 4 | `/lanjut VID-2026-001 pilih R2, sudut pandang untuk pemula` | CEO mencatat pilihan, memanggil @Scriptwriter-Agent, menilai naskah dengan rubrik; revisi otomatis maks 2 putaran | `02_naskah.md` |
| 5 | (otomatis) | CEO memanggil @Designer-Agent dan @SEO-Optimizer secara paralel | `03_visual.md`, `prompts/…`, `04_metadata.md` |
| 6 | (otomatis) | CEO menjalankan `handoff-check.sh` + `wordcount.sh`, menulis QC, commit lokal | `05_qc-report.md` |
| 7 | Baca `05_qc-report.md`. Jika ingin ubah: `/revisi VID-2026-001 naskah hook kurang tajam, mulai dengan angka` | Tahap dikirim ulang; visual & SEO ditandai ikut revisi | versi +1 |
| 8 | Kerjakan checklist manual di `05_qc-report.md` §4: generate gambar, unduh stok, voice-over dari baris `NARASI:`, edit, thumbnail | | file video |
| 9 | Upload di YouTube Studio: tempel judul/deskripsi/tags dari `04_metadata.md`, pasang label konten sintetis bila diminta QC | | video live |
| 10 | Setelah 7 hari, isi performa di `research/arsip-topik.md` | Data ini dipakai @Riset-Agent untuk video berikutnya | umpan balik |

Perintah pemantauan kapan saja: `/status`, atau dari terminal biasa
`./tools/handoff-check.sh`.

### Contoh perintah bebas (tanpa slash command)
```
@CEO-Agent: minta @SEO-Optimizer buat ulang 5 judul untuk VID-2026-001,
fokus kata kunci "investasi emas pemula", jangan ubah file lain.
```
CEO akan membuat tiket dan memanggil sub-agent `seo-optimizer`. Penyebutan `@Nama-Agent`
adalah konvensi tulis di kantor ini, bukan fitur bawaan; yang benar-benar memicu sub-agent
adalah CEO lewat tool `Agent`. Anda juga bisa memanggil langsung: "Use the seo-optimizer
subagent to …".

---

## D. Batasan dan Risiko yang Perlu Diketahui

1. **Tidak sepenuhnya otomatis.** Claude Code menulis teks dan file. Ia tidak me-render
   video, tidak membuat gambar Midjourney, dan tidak mengunggah ke YouTube kecuali Anda
   menambah integrasi sendiri. Sistem ini sengaja menahan upload di tangan Pemilik.
2. **Data riset.** Tanpa MCP/API, angka views, RPM, dan volume pencarian berasal dari
   pencarian web dan bersifat estimasi. Agent diwajibkan memberi label; tetap periksa.
3. **Kebijakan monetisasi YouTube.** Program Partner YouTube punya kebijakan
   *inauthentic content* (sebelumnya disebut *repetitious content*) yang menyasar konten
   produksi massal dengan variasi minim. Channel faceless yang memakai template berulang
   berisiko tidak dimonetisasi. Karena itu rubrik QC mewajibkan bagian `[NILAI-ORISINAL]`.
   Baca kebijakan resmi terbaru di YouTube Help Center sebelum memulai; kebijakan ini
   berubah dan dokumen ini tidak menggantikannya.
4. **Label konten sintetis.** YouTube mewajibkan pengungkapan untuk konten realistis yang
   dibuat/diubah AI. QC menandai shot `[SINTETIS-REALISTIS]` sebagai pengingat.
5. **Akurasi fakta.** Model bisa salah. Penanda `[VERIFIKASI]` dan kewajiban sumber
   mengurangi risiko tetapi tidak menghilangkannya. Cek klaim penting sendiri.
6. **Biaya token.** Satu video penuh memanggil 4-6 sub-agent ditambah pencarian web.
   Untuk menghemat, set `model: haiku` atau `sonnet` di frontmatter agent yang tugasnya
   ringan (misalnya `seo-optimizer`).
7. **Sintaks izin.** Format `permissions` di `.claude/settings.json` mengikuti dokumentasi
   Claude Code saat ini; jika versi Claude Code Anda berbeda dan aturan tidak berlaku,
   cek `/permissions` di dalam sesi.
