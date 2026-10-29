#!/usr/bin/env bash
# Membuat folder produksi/VID-<tahun>-<nomor>/ dari template.
# Pemakaian: ./tools/new-video.sh [VIDEO-ID]
set -euo pipefail

cd "$(dirname "$0")/.."

year=$(date +%Y)
if [[ $# -ge 1 && -n "$1" ]]; then
  id="$1"
else
  last=$(ls -d produksi/VID-"$year"-* 2>/dev/null | sed -E 's/.*-([0-9]+)$/\1/' | sort -n | tail -1 || true)
  next=$(( 10#${last:-0} + 1 ))
  id=$(printf "VID-%s-%03d" "$year" "$next")
fi

dir="produksi/$id"
if [[ -e "$dir" ]]; then
  echo "Folder $dir sudah ada." >&2
  exit 1
fi

mkdir -p "$dir/aset"
touch "$dir/aset/.gitkeep"
today=$(date +%Y-%m-%d)
for tpl in templates/0*.template.md templates/STATUS.template.md; do
  name=$(basename "$tpl" .template.md)
  sed -e "s/{{VIDEO_ID}}/$id/g" -e "s/{{TANGGAL}}/$today/g" "$tpl" > "$dir/$name.md"
done

echo "$id"
