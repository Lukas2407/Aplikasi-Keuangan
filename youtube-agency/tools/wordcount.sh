#!/usr/bin/env bash
# Menghitung kata narasi di 02_naskah.md (hanya baris yang diawali "NARASI:")
# dan memperkirakan durasi pada 140 kata/menit.
# Pemakaian: ./tools/wordcount.sh VIDEO-ID [kata_per_menit]
set -euo pipefail

cd "$(dirname "$0")/.."

id="${1:?Pemakaian: ./tools/wordcount.sh VIDEO-ID [kata_per_menit]}"
wpm="${2:-140}"
file="produksi/$id/02_naskah.md"
[[ -f "$file" ]] || { echo "$file tidak ditemukan" >&2; exit 1; }

words=$(grep -E '^NARASI:' "$file" | sed 's/^NARASI://' | wc -w)
secs=$(( words * 60 / wpm ))
printf "Kata narasi: %d\nEstimasi durasi @%d kpm: %d:%02d\n" "$words" "$wpm" $((secs / 60)) $((secs % 60))
