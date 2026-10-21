const HEX_6 = /^#([0-9A-Fa-f]{6})$/

function canalLinear(valor8bit: number): number {
  const c = valor8bit / 255
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

export function relativeLuminance(hex: string): number {
  const match = HEX_6.exec(hex)
  if (!match) {
    throw new Error(`cor inválida, use hex de 6 dígitos, recebido "${hex}"`)
  }
  const r = canalLinear(parseInt(match[1].slice(0, 2), 16))
  const g = canalLinear(parseInt(match[1].slice(2, 4), 16))
  const b = canalLinear(parseInt(match[1].slice(4, 6), 16))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  const maisClara = Math.max(la, lb)
  const maisEscura = Math.min(la, lb)
  return (maisClara + 0.05) / (maisEscura + 0.05)
}
