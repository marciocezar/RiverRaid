/**
 * Mapa do rio. A decisão de curva é a de $F8E2–$F92F:
 * a direção persiste, a magnitude sai de $E9 & $0F (piso 2, teto 14/13/8)
 * e o trecho seguinte é reto. O LFSR só anda nessa decisão.
 * O scroll guarda a fração, no papel de $8C recebendo $B5.
 */
import { lfsrStep } from './lfsr'
import {
  H,
  Kind,
  MAX_ACTORS,
  PLAY_TOP,
  SPAWN_GAP,
  W,
  type Actor,
  type World,
} from './types'

const HALF_MIN = 18
const HALF_MAX = 46

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v
}

function freeSlot(world: World): Actor | null {
  for (const actor of world.actors) {
    if (actor.kind === Kind.None) return actor
  }
  return null
}

function countAlive(world: World): number {
  let n = 0
  for (const actor of world.actors) {
    if (actor.kind !== Kind.None && actor.kind !== Kind.Boom) n += 1
  }
  return n
}

function spawn(
  world: World,
  kind: number,
  x: number,
  y: number,
  w: number,
  h: number,
  vx: number,
): void {
  const actor = freeSlot(world)
  if (!actor) return
  actor.kind = kind
  actor.x = x
  actor.y = y
  actor.w = w
  actor.h = h
  actor.vx = vx
  actor.timer = kind === Kind.Bridge ? 1 : 0
}

function writeRow(world: World, y: number): void {
  const half = world.half
  const mid = clamp(world.center, 8 + half, W - 1 - half)
  world.center = mid
  world.left[y] = mid - half
  world.right[y] = mid + half
  world.islandL[y] = 0
  world.islandR[y] = 0
  if (world.half >= 28 && world.bend & 0x80 && (world.lo & 0x03) === 0) {
    const il = mid - 5
    const ir = mid + 5
    if (il > world.left[y] + 10 && ir < world.right[y] - 10) {
      world.islandL[y] = il
      world.islandR[y] = ir
    }
  }
}

function decide(world: World): void {
  lfsrStep(world)
  world.steps += 1
  let mag = world.lo & 0x0f
  if (mag < 2) mag += 2
  let cap = world.bend & 0x80 ? 13 : 14
  if (world.islandR[0] || world.islandL[0]) cap = 8
  if (mag > cap) mag = cap
  const mixed = ((world.bend << 1) ^ world.bend) & 0xff
  if ((world.lo & 0x30) === 0 || mixed & 0x80) {
    world.bend = world.bend & 0x80 ? 0x40 : 0xc0
  }
  const sign = world.bend & 0x80 ? -1 : 1
  world.center += sign * (mag >= 8 ? 2 : 1)
  if ((world.hi & 0x07) === 0) {
    world.half += world.hi & 0x08 ? 2 : -2
  }
  world.half = clamp(world.half, HALF_MIN, HALF_MAX)
  const island = world.half >= 28 && (world.bend & 0x80) !== 0 && (world.lo & 0x03) === 0
  world.straight = island ? 22 : 4 + (world.lo & 0x07)
}

function maybeSpawn(world: World, y: number): void {
  if (world.phase !== 1 && world.phase !== 0) return
  if (world.sinceSpawn < SPAWN_GAP || countAlive(world) >= 4) return
  let waterL = world.left[y] + 8
  let waterR = world.right[y] - 8
  if (world.islandR[y] > world.islandL[y]) {
    const leftSpan = world.islandL[y] - waterL
    const rightSpan = waterR - world.islandR[y]
    if (leftSpan >= rightSpan && leftSpan >= 14) waterR = world.islandL[y] - 4
    else if (rightSpan >= 14) waterL = world.islandR[y] + 4
    else return
  }
  if (waterR - waterL < 16) return
  const span = waterR - waterL
  let x = waterL + (world.lo % span)
  const pick = world.hi & 0x07
  if (pick <= 1) {
    x = clamp(x, waterL + 6, waterR - 6)
    spawn(world, Kind.Heli, x, y, 10, 4, world.lo & 1 ? 0.45 : -0.45)
  } else if (pick <= 3) {
    x = clamp(x, waterL + 7, waterR - 7)
    spawn(world, Kind.Ship, x, y, 12, 3, 0)
  } else if (pick === 4) {
    x = clamp(x, waterL + 6, waterR - 6)
    spawn(world, Kind.Jet, x, y, 7, 3, world.lo & 1 ? 1.35 : -1.35)
  } else if (pick === 5) {
    x = clamp(x, waterL + 5, waterR - 5)
    spawn(world, Kind.Fuel, x, y, 7, 16, 0)
  } else {
    return
  }
  world.sinceSpawn = 0
}

function generateRow(world: World, y: number): void {
  if (world.straight > 0) world.straight -= 1
  else {
    decide(world)
    maybeSpawn(world, y)
  }
  writeRow(world, y)
}

export function clearX(world: World, y: number): number {
  const l = world.left[y]
  const r = world.right[y]
  if (world.islandR[y] > world.islandL[y]) {
    const leftSpan = world.islandL[y] - l
    const rightSpan = r - world.islandR[y]
    if (leftSpan >= rightSpan) return (l + world.islandL[y]) * 0.5
    return (world.islandR[y] + r) * 0.5
  }
  return (l + r) * 0.5
}

function scrollRows(world: World, rows: number): void {
  if (rows < 1) return
  if (rows > 4) rows = 4
  for (let y = H - 1; y >= rows; y--) {
    world.left[y] = world.left[y - rows]
    world.right[y] = world.right[y - rows]
    world.islandL[y] = world.islandL[y - rows]
    world.islandR[y] = world.islandR[y - rows]
  }
  for (let y = rows - 1; y >= 0; y--) generateRow(world, y)
  for (const actor of world.actors) {
    if (actor.kind === Kind.None) continue
    actor.y += rows
    if (actor.y > 162) actor.kind = Kind.None
  }
  if (world.shotOn) world.shotY += rows
  world.sinceSpawn += rows
}

export function consumeScroll(world: World, pixels: number): number {
  world.scrollAcc += pixels
  let rows = Math.floor(world.scrollAcc)
  if (rows < 0) rows = 0
  world.scrollAcc -= rows
  if (rows > 0) scrollRows(world, rows)
  return rows
}

export function fillRiver(world: World): void {
  world.center = 80
  world.half = 34
  world.bend = 0x40
  world.straight = 0
  const saved = world.phase
  world.phase = 0
  for (let y = H - 1; y >= 0; y--) generateRow(world, y)
  world.phase = saved
  world.sinceSpawn = SPAWN_GAP
}

export function blockedAt(world: World, left: number, right: number, y: number): boolean {
  if (y < 0 || y >= H) return false
  if (left < world.left[y] || right > world.right[y]) return true
  if (
    world.islandR[y] > world.islandL[y] &&
    left < world.islandR[y] &&
    right > world.islandL[y]
  ) {
    return true
  }
  return false
}

export function emptyActors(): Actor[] {
  const actors: Actor[] = []
  for (let i = 0; i < MAX_ACTORS; i++) {
    actors.push({ kind: Kind.None, x: 0, y: 0, vx: 0, w: 0, h: 0, timer: 0 })
  }
  return actors
}

export const playfieldBottom = PLAY_TOP
