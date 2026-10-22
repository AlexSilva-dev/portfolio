#!/usr/bin/env bash
#
# Gera o recorte sem fundo do dono usado no hero (fix visual do
# redesign-portfolio). Roda o rembg sobre a foto fonte e grava em
# app/assets/img/alex-cut.png com canal alfa. As dimensoes 768x1201 sao
# declaradas no template do HeroSection.vue e precisam casar com a saida.
#
# O rembg e dependencia BUILD ONLY: nunca entra no package.json, a saida
# e um asset versionado. Ambiente conhecido: venv dedicada em
# ~/.local/share/rembg-venv com o modelo u2net ja baixado em ~/.u2net.
#
# Uso: bash scripts/process-cutout.sh [/caminho/da/Minha-foto.jpg]
set -euo pipefail

SRC="${1:-/home/Lek/Documents/Curriculo/Minha-foto.jpg}"
OUT="$(cd "$(dirname "$0")/.." && pwd)/app/assets/img/alex-cut.png"

if [[ ! -f "$SRC" ]]; then
  echo "ERRO foto fonte nao encontrada em $SRC" >&2
  exit 1
fi

# 1) rembg no PATH (wrapper do usuario); 2) binario da venv dedicada;
# 3) fallback de instalacao em venv nova, sem tocar no Python do sistema.
if command -v rembg >/dev/null 2>&1; then
  REMBG="rembg"
elif [[ -x "$HOME/.local/share/rembg-venv/bin/rembg" ]]; then
  REMBG="$HOME/.local/share/rembg-venv/bin/rembg"
else
  echo "rembg ausente, criando venv dedicada em ~/.local/share/rembg-venv" >&2
  python3 -m venv "$HOME/.local/share/rembg-venv"
  "$HOME/.local/share/rembg-venv/bin/pip" install rembg
  REMBG="$HOME/.local/share/rembg-venv/bin/rembg"
fi

mkdir -p "$(dirname "$OUT")"

# Primeira execucao baixa o modelo u2net (~176MB) para ~/.u2net; aguarde.
"$REMBG" i -m u2net "$SRC" "$OUT"

echo "OK recorte gerado em $OUT"
