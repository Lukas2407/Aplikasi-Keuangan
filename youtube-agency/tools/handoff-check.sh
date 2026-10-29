#!/usr/bin/env bash
# Membaca blok <!-- HANDOFF --> di setiap file tahap dan mencetak statusnya.
# Juga menghitung penanda [VERIFIKASI], @TODO, dan @REVISI yang belum dijawab.
# Pemakaian: ./tools/handoff-check.sh [VIDEO-ID]   (tanpa argumen = semua video)
set -uo pipefail

cd "$(dirname "$0")/.."

check_video() {
  local dir="$1"
  echo "== $(basename "$dir") =="
  printf "%-16s %-12s %-22s %4s %4s %4s\n" "TAHAP" "STATUS" "TO" "VRF" "TODO" "REV"
  for f in "$dir"/0[1-5]_*.md; do
    [[ -f "$f" ]] || continue
    local block status to vrf todo rev dijawab
    block=$(sed -n '/<!-- HANDOFF/,/-->/p' "$f")
    status=$(grep -m1 '^status:' <<<"$block" | awk '{print $2}')
    to=$(grep -m1 '^to:' <<<"$block" | awk '{print $2}')
    vrf=$(grep -c '\[VERIFIKASI\]' "$f")
    todo=$(grep -c '@TODO(' "$f")
    rev=$(grep -c '@REVISI(CEO)' "$f")
    dijawab=$(grep -c '@DIJAWAB' "$f")
    printf "%-16s %-12s %-22s %4s %4s %4s\n" "$(basename "$f" .md)" "${status:-EMPTY}" "${to:--}" "$vrf" "$todo" "$((rev - dijawab))"
  done
  echo
}

if [[ $# -ge 1 ]]; then
  [[ -d "produksi/$1" ]] || { echo "produksi/$1 tidak ditemukan" >&2; exit 1; }
  check_video "produksi/$1"
else
  for d in produksi/VID-*/; do
    [[ -d "$d" ]] && check_video "${d%/}"
  done
fi
echo "VRF = [VERIFIKASI] tersisa, TODO = @TODO terbuka, REV = @REVISI belum dijawab"
