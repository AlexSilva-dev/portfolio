#!/usr/bin/env bash
#
# Processa a foto fonte do hero (task 4 do redesign-portfolio).
# Corrige orientação EXIF, recorta pra proporção 4:5 (768x960) e grava em
# app/assets/img/alex-hero.jpg. As dimensões são declaradas no template do
# HeroSection.vue e precisam casar com a saída deste script.
#
# Uso: bash scripts/process-photo.sh [/caminho/da/Minha-foto.jpg]
set -euo pipefail

SRC="${1:-/home/Lek/Documents/Curriculo/Minha-foto.jpg}"
OUT="$(cd "$(dirname "$0")/.." && pwd)/app/assets/img/alex-hero.jpg"

if [[ ! -f "$SRC" ]]; then
  echo "ERRO foto fonte nao encontrada em $SRC" >&2
  exit 1
fi

if command -v magick >/dev/null 2>&1; then
  IM="magick"
elif command -v convert >/dev/null 2>&1; then
  IM="convert"
else
  echo "ERRO nem magick nem convert encontrados no PATH" >&2
  exit 1
fi

mkdir -p "$(dirname "$OUT")"

# -auto-orient aplica a rotacao EXIF; recorte central 4:5 mantendo a largura
$IM "$SRC" -auto-orient -gravity center -crop '768x960+0+0' +repage -strip "$OUT"

echo "OK foto gerada em $OUT"
$IM identify "$OUT"
