/** Margem, ilha, tiro, posto e ponte. O vão inteiro da ponte conta. */
import { hitbox, overlaps } from '../entities/hitbox'
import { blockedAt, clearX } from '../core/river'
import { bridgeDeck, crackBridge, ensureBridge, planeMeetsBridge, shotPath } from './bridge'
import {
  FUEL_FULL,
  H,
  Kind,
  PLAYER_HIT_H,
  PLAYER_HIT_W,
  PLAYER_Y,
  Sfx,
  type Actor,
  type World,
} from '../core/types'

function pointsFor(kind: number): number {
  switch (kind) {
    case Kind.Ship:
      return 30
    case Kind.Heli:
      return 60
    case Kind.Fuel:
      return 80
    case Kind.Jet:
      return 100
    case Kind.Bridge:
      return 500
    default:
      return 0
  }
}

function boom(actor: Actor, world: World): void {
  world.score += pointsFor(actor.kind)
  world.sfx |= Sfx.Boom
  actor.kind = Kind.Boom
  actor.timer = 16
  actor.vx = 0
}

function killPlayer(world: World): void {
  if (world.invuln > 0 || world.phase !== 1) return
  world.phase = 2
  world.deadTimer = 70
  world.shotOn = false
  world.lives -= 1
  world.sfx |= Sfx.Die
}

function holdInWater(world: World, actor: Actor): void {
  const by = Math.floor(actor.y)
  if (by < 0 || by >= H) return
  const ow = actor.w
  let minX = world.left[by] + ow * 0.5 + 2
  let maxX = world.right[by] - ow * 0.5 - 2
  if (world.islandR[by] > world.islandL[by]) {
    const mid = (world.islandL[by] + world.islandR[by]) * 0.5
    if (actor.x < mid) maxX = world.islandL[by] - ow * 0.5 - 1
    else minX = world.islandR[by] + ow * 0.5 + 1
  }
  if (minX >= maxX) return
  if (actor.x < minX) {
    actor.x = minX
    actor.vx = -actor.vx
  } else if (actor.x > maxX) {
    actor.x = maxX
    actor.vx = -actor.vx
  }
}

function bodyOf(actor: Actor) {
  return hitbox(actor.x - actor.w * 0.5, actor.y, actor.w, actor.h)
}

function strike(world: World, actor: Actor): void {
  world.shotOn = false
  if (actor.kind === Kind.Bridge && !crackBridge(world, actor)) return
  boom(actor, world)
}

function nearestShot(world: World): Actor | null {
  const shot = shotPath(world.shotX, world.shotY)
  let best: Actor | null = null
  let bestBottom = -1
  for (const actor of world.actors) {
    if (actor.kind === Kind.None || actor.kind === Kind.Boom) continue
    const body = actor.kind === Kind.Bridge ? bridgeDeck(world, actor) : bodyOf(actor)
    if (!overlaps(shot, body)) continue
    const bottom = actor.y + actor.h
    if (bottom > bestBottom) {
      best = actor
      bestBottom = bottom
    }
  }
  return best
}

export function resolveHits(world: World, moved: number): void {
  world.rowsUntilBridge -= moved
  if (world.rowsUntilBridge <= 0) ensureBridge(world)

  if (world.fuel < 0x20) {
    world.fuel = 0
    killPlayer(world)
  } else {
    world.fuel -= 0x20
  }

  if (world.invuln > 0) world.invuln -= 1
  else {
    const left = world.playerX - PLAYER_HIT_W * 0.5
    const right = world.playerX + PLAYER_HIT_W * 0.5
    for (let y = PLAYER_Y; y < PLAYER_Y + PLAYER_HIT_H && y < H; y++) {
      if (blockedAt(world, left, right, y)) {
        killPlayer(world)
        break
      }
    }
  }

  for (const actor of world.actors) {
    if (actor.kind === Kind.None) continue
    if (actor.kind === Kind.Boom) {
      actor.timer -= 1
      if (actor.timer <= 0) actor.kind = Kind.None
      continue
    }
    if (actor.kind === Kind.Jet || actor.kind === Kind.Heli) actor.x += actor.vx
    if (actor.kind === Kind.Bridge) bridgeDeck(world, actor)
    else holdInWater(world, actor)
  }

  if (world.shotOn) {
    const hit = nearestShot(world)
    if (hit) strike(world, hit)
  }
  if (world.shotOn && world.shotY < -4) world.shotOn = false

  const plane = hitbox(world.playerX - PLAYER_HIT_W * 0.5, PLAYER_Y, PLAYER_HIT_W, PLAYER_HIT_H)
  for (const actor of world.actors) {
    if (actor.kind === Kind.None || actor.kind === Kind.Boom) continue
    if (actor.kind === Kind.Bridge) {
      if (planeMeetsBridge(world, actor, plane)) killPlayer(world)
      continue
    }
    const body = bodyOf(actor)
    if (actor.kind === Kind.Fuel && overlaps(plane, body)) {
      world.fuel = Math.min(FUEL_FULL, world.fuel + 0x100)
      if (world.fuelTone === 0) {
        world.sfx |= Sfx.Fuel
        world.fuelTone = 10
      }
      continue
    }
    if (overlaps(plane, body)) killPlayer(world)
  }
}

export function settleDead(world: World): void {
  world.deadTimer -= 1
  if (world.deadTimer > 0) return
  if (world.lives <= 0) {
    world.phase = 3
    return
  }
  world.phase = 1
  world.invuln = 90
  if (world.fuel < 0x6000) world.fuel = 0x6000
  world.playerVx = 0
  world.shotOn = false
  world.playerX = clearX(world, PLAYER_Y)
  for (const actor of world.actors) {
    if (actor.kind === Kind.Bridge && actor.y > PLAYER_Y - 30) {
      actor.kind = Kind.None
      world.rowsUntilBridge = 220
    }
  }
}
