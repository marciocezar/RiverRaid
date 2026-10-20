/** Ponte de margem a margem. O tiro que cruza o vão abre a seção. */
import { hitbox, type Hitbox } from '../entities/hitbox'
import {
  H,
  Kind,
  PLAYER_Y,
  SECTION_ROWS,
  SHOT_STEP,
  Sfx,
  type Actor,
  type World,
} from '../core/types'

const SHOT_W = 2
const SHOT_H = 4

export function ensureBridge(world: World): void {
  if (world.actors.some((actor) => actor.kind === Kind.Bridge)) return
  const slot = world.actors.find((actor) => actor.kind === Kind.None)
  if (!slot) return
  slot.kind = Kind.Bridge
  slot.x = 0
  slot.y = 0
  slot.vx = 0
  slot.w = 0
  slot.h = 4
  slot.timer = 1
}

/** Grava o vão da linha de cima da ponte e devolve a caixa. */
export function bridgeDeck(world: World, actor: Actor): Hitbox {
  let row = Math.floor(actor.y)
  if (row < 0) row = 0
  if (row >= H) row = H - 1
  const x = world.left[row]
  const w = Math.max(1, world.right[row] - x)
  actor.x = x + w * 0.5
  actor.w = w
  return hitbox(x, actor.y, w, actor.h)
}

/**
 * O tiro anda SHOT_STEP para cima e termina em shotY.
 * A caixa cobre o trajeto, senão a ponte de 4 pixels fica no vão do passo.
 */
export function shotPath(shotX: number, shotY: number): Hitbox {
  return hitbox(shotX - SHOT_W * 0.5, shotY, SHOT_W, SHOT_H + SHOT_STEP)
}

/** Tiro acertou. Devolve false enquanto a ponte ainda está de pé. */
export function crackBridge(world: World, actor: Actor): boolean {
  actor.timer -= 1
  if (actor.timer > 0) return false
  world.section += 1
  world.rowsUntilBridge = SECTION_ROWS
  world.sfx |= Sfx.Bridge
  return true
}

export function planeMeetsBridge(world: World, actor: Actor, plane: Hitbox): boolean {
  const top = actor.y
  const bottom = actor.y + actor.h
  const crosses = plane.y < bottom && plane.y + plane.h > top
  if (!crosses) return actor.y > PLAYER_Y + 6
  const y0 = Math.max(0, Math.floor(top))
  const y1 = Math.min(H - 1, Math.floor(bottom - 0.001))
  for (let y = y0; y <= y1; y++) {
    if (plane.x < world.right[y] && plane.x + plane.w > world.left[y]) return true
  }
  return false
}
