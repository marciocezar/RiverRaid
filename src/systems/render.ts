/** Quadro 160×192. A casca amplia com vizinho mais próximo e não muda a proporção. */
import { Kind, PLAY_TOP, W, type World } from '../core/types'
import {
  DIGIT,
  FUEL,
  GLYPH,
  HELI_A,
  HELI_B,
  INK,
  JET,
  PLANE,
  SHIP,
} from './sprites'

const WATER = [32, 52, 176]
const BANK = [56, 148, 48]
const DASH = [136, 136, 136]
const YEL = [244, 214, 32]

function plot(px: ImageData, x: number, y: number, rgb: number[]): void {
  if (x < 0 || y < 0 || x >= W || y >= px.height) return
  const i = (y * W + x) * 4
  px.data[i] = rgb[0]
  px.data[i + 1] = rgb[1]
  px.data[i + 2] = rgb[2]
  px.data[i + 3] = 255
}

function blit(px: ImageData, rows: string[], cx: number, top: number, mirror = false): void {
  const w = rows[0].length
  const left = cx - Math.floor(w / 2)
  for (let sy = 0; sy < rows.length; sy++) {
    if (top + sy >= PLAY_TOP) break
    for (let sx = 0; sx < w; sx++) {
      const ink = rows[sy][mirror ? w - 1 - sx : sx]
      if (ink === '.' || !ink) continue
      const rgb = INK[ink]
      if (rgb) plot(px, left + sx, top + sy, rgb)
    }
  }
}

function glyph(px: ImageData, rows: string[], x: number, y: number): void {
  for (let sy = 0; sy < rows.length; sy++) {
    for (let sx = 0; sx < rows[sy].length; sx++) {
      if (rows[sy][sx] === '#') plot(px, x + sx, y + sy, YEL)
    }
  }
}

function text(px: ImageData, message: string, x: number, y: number): void {
  let cursor = x
  for (const ch of message) {
    const rows = GLYPH[ch] ?? DIGIT[Number(ch)] ?? GLYPH[' ']
    glyph(px, rows, cursor, y)
    cursor += 4
  }
}

function paintRiver(px: ImageData, world: World): void {
  for (let y = 0; y < PLAY_TOP; y++) {
    const left = world.left[y]
    const right = world.right[y]
    const il = world.islandL[y]
    const ir = world.islandR[y]
    for (let x = 0; x < W; x++) {
      const land = x < left || x >= right || (ir > il && x >= il && x < ir)
      plot(px, x, y, land ? BANK : WATER)
    }
  }
}

function paintBridge(px: ImageData, world: World, yf: number): void {
  const y0 = Math.floor(yf)
  for (let row = 0; row < 4; row++) {
    const y = y0 + row
    if (y < 0 || y >= PLAY_TOP) continue
    const left = world.left[y]
    const right = world.right[y]
    const mid = (left + right) / 2
    for (let x = left; x < right; x++) {
      const edge = row === 0 || row === 3
      const mark = x >= mid - 1 && x <= mid + 1
      const rgb = edge
        ? [88, 88, 92]
        : mark
          ? [204, 48, 36]
          : row === 1
            ? [196, 196, 196]
            : [168, 168, 168]
      plot(px, x, y, rgb)
    }
  }
}

function paintBurst(px: ImageData, cx: number, cy: number, timer: number): void {
  let rad = 1 + Math.floor((12 - timer) / 4)
  if (rad < 1) rad = 1
  if (rad > 3) rad = 3
  const icx = Math.floor(cx)
  const icy = Math.floor(cy)
  for (let dy = -rad; dy <= rad; dy++) {
    for (let dx = -rad; dx <= rad; dx++) {
      if (dx * dx + dy * dy > rad * rad) continue
      plot(px, icx + dx, icy + dy, (dx + dy + timer) & 1 ? [220, 64, 24] : YEL)
    }
  }
}

function paintBoom(px: ImageData, cx: number, cy: number, timer: number, span = 0): void {
  const count = span >= 24 ? 5 : 1
  const reach = span >= 24 ? span * 0.5 - 4 : 0
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0.5 : i / (count - 1)
    paintBurst(px, cx - reach + t * reach * 2, cy, timer)
  }
}

function paintScore(px: ImageData, value: number, y: number): void {
  const digits: number[] = []
  let v = Math.max(0, Math.min(999999, value))
  do {
    digits.push(v % 10)
    v = Math.floor(v / 10)
  } while (v && digits.length < 6)
  let x = Math.floor((W - (digits.length * 4 - 1)) / 2)
  for (let i = digits.length - 1; i >= 0; i--) {
    glyph(px, DIGIT[digits[i]], x, y)
    x += 4
  }
}

function paintDash(px: ImageData, world: World): void {
  for (let y = PLAY_TOP; y < px.height; y++) {
    for (let x = 0; x < W; x++) plot(px, x, y, DASH)
  }
  for (let x = 0; x < W; x++) plot(px, x, PLAY_TOP, [8, 8, 8])
  paintScore(px, world.score, PLAY_TOP + 2)
  const x0 = 48
  const x1 = 112
  const y0 = PLAY_TOP + 9
  const y1 = y0 + 8
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) plot(px, x, y, [8, 8, 8])
  }
  glyph(px, GLYPH.E, x0 + 3, y0 + 2)
  glyph(px, GLYPH.F, x1 - 6, y0 + 2)
  const track0 = x0 + 14
  const track1 = x1 - 16
  const mark = track0 + Math.floor((world.fuel / 65535) * (track1 - track0))
  for (let y = y0 + 2; y <= y1 - 2; y++) {
    plot(px, mark, y, YEL)
    plot(px, mark + 1, y, YEL)
  }
  const lives = Math.max(0, Math.min(9, world.lives))
  glyph(px, DIGIT[lives], Math.floor((W - 3) / 2), PLAY_TOP + 20)
}

function banner(px: ImageData, message: string, y: number): void {
  const width = message.length * 4 - 1
  const x = Math.floor((W - width) / 2)
  for (let yy = y - 2; yy < y + 7; yy++) {
    for (let xx = x - 3; xx < x + width + 3; xx++) plot(px, xx, yy, [8, 12, 16])
  }
  text(px, message, x, y)
}

export function paint(world: World, px: ImageData): void {
  paintRiver(px, world)
  for (const actor of world.actors) {
    if (actor.y >= PLAY_TOP) continue
    const cx = Math.floor(actor.x)
    const top = Math.floor(actor.y)
    if (actor.kind === Kind.Heli) blit(px, (world.frame / 4) & 1 ? HELI_B : HELI_A, cx, top, actor.vx < 0)
    else if (actor.kind === Kind.Ship) blit(px, SHIP, cx, top, false)
    else if (actor.kind === Kind.Jet) blit(px, JET, cx, top, false)
    else if (actor.kind === Kind.Fuel) blit(px, FUEL, cx, top, false)
    else if (actor.kind === Kind.Bridge) paintBridge(px, world, actor.y)
    else if (actor.kind === Kind.Boom) paintBoom(px, actor.x, actor.y + 2, actor.timer, actor.w)
  }
  if (world.shotOn && world.shotY < PLAY_TOP) {
    const ix = Math.floor(world.shotX)
    const iy = Math.floor(world.shotY)
    plot(px, ix, iy, [255, 255, 255])
    plot(px, ix, iy + 1, YEL)
  }
  const blink = world.invuln > 0 && ((world.frame / 4) & 1) === 1
  if (world.phase !== 2 && !blink) blit(px, PLANE, Math.floor(world.playerX), world.playerY, false)
  else if (world.phase === 2) {
    paintBoom(px, world.playerX, world.playerY + 2, world.deadTimer > 12 ? 6 : world.deadTimer)
  }
  paintDash(px, world)
  if (world.phase === 0) banner(px, 'TOQUE OU ENTER', 78)
  else if (world.phase === 3) banner(px, 'FIM  ENTER', 78)
  else if (world.phase === 4) banner(px, 'PAUSA', 78)
}
