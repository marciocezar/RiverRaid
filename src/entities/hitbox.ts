/** Caixa de colisão. O inset tira a borda transparente do sprite. */

export interface Hitbox {
  x: number
  y: number
  w: number
  h: number
}

export function hitbox(x: number, y: number, w: number, h: number, inset = 0): Hitbox {
  let bw = w - inset * 2
  let bh = h - inset * 2
  if (bw < 1) bw = 1
  if (bh < 1) bh = 1
  return { x: x + inset, y: y + inset, w: bw, h: bh }
}

export function overlaps(a: Hitbox, b: Hitbox): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}
