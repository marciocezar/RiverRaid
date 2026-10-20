/** Um quadro. Quem desenha e quem lê teclado fica fora daqui. */
import { movePlayer } from '../entities/player'
import { resolveHits, settleDead } from '../systems/collision'
import { LFSR_SEED } from './lfsr'
import { clearX, consumeScroll, emptyActors, fillRiver } from './river'
import {
  FUEL_FULL,
  H,
  PLAYER_Y,
  Phase,
  SECTION_ROWS,
  SPEED_CRUISE,
  SPEED_MAX,
  SPEED_MIN,
  type World,
} from './types'

export function createWorld(): World {
  const world: World = {
    lo: LFSR_SEED.lo,
    hi: LFSR_SEED.hi,
    steps: 0,
    left: new Uint8Array(H),
    right: new Uint8Array(H),
    islandL: new Uint8Array(H),
    islandR: new Uint8Array(H),
    center: 80,
    half: 34,
    bend: 0x40,
    straight: 0,
    playerX: 80,
    playerVx: 0,
    playerY: PLAYER_Y,
    speed: SPEED_CRUISE,
    facing: 1,
    fuel: FUEL_FULL,
    lives: 3,
    score: 0,
    section: 1,
    rowsUntilBridge: SECTION_ROWS,
    sinceSpawn: 0,
    invuln: 0,
    shotOn: false,
    shotX: 0,
    shotY: 0,
    fireCooldown: 0,
    phase: Phase.Title,
    deadTimer: 0,
    input: 0,
    prevInput: 0,
    sfx: 0,
    fuelTone: 0,
    scrollAcc: 0,
    frame: 0,
    actors: emptyActors(),
  }
  fillRiver(world)
  world.playerX = clearX(world, PLAYER_Y)
  return world
}

export function startRun(world: World): void {
  const keep = {
    lo: world.lo,
    hi: world.hi,
    steps: world.steps,
    left: world.left.slice(),
    right: world.right.slice(),
    islandL: world.islandL.slice(),
    islandR: world.islandR.slice(),
    center: world.center,
    half: world.half,
    bend: world.bend,
    straight: world.straight,
    scrollAcc: world.scrollAcc,
  }
  world.actors = emptyActors()
  world.playerVx = 0
  world.shotOn = false
  world.fireCooldown = 0
  world.sfx = 0
  world.fuelTone = 0
  world.deadTimer = 0
  world.score = 0
  world.input = 0
  world.prevInput = 0
  world.lo = keep.lo
  world.hi = keep.hi
  world.steps = keep.steps
  world.left.set(keep.left)
  world.right.set(keep.right)
  world.islandL.set(keep.islandL)
  world.islandR.set(keep.islandR)
  world.center = keep.center
  world.half = keep.half
  world.bend = keep.bend
  world.straight = keep.straight
  world.scrollAcc = keep.scrollAcc
  world.playerY = PLAYER_Y
  world.playerX = clearX(world, PLAYER_Y)
  world.speed = SPEED_CRUISE
  world.facing = 1
  world.fuel = FUEL_FULL
  world.lives = 3
  world.rowsUntilBridge = SECTION_ROWS
  world.sinceSpawn = 0
  world.section = 1
  world.phase = Phase.Play
  world.invuln = 90
  world.frame = 0
}

export function setSpeedGear(world: World, gear: number): void {
  if (gear <= 1) world.speed = SPEED_MIN
  else if (gear === 2) world.speed = SPEED_CRUISE
  else world.speed = SPEED_MAX
}

export function togglePause(world: World): void {
  if (world.phase === Phase.Play) world.phase = Phase.Pause
  else if (world.phase === Phase.Pause) world.phase = Phase.Play
}

export function frame(world: World): void {
  if (world.phase === Phase.Pause || world.phase === Phase.Over) {
    world.prevInput = world.input
    return
  }
  if (world.phase === Phase.Title) {
    consumeScroll(world, 0.65)
    world.frame += 1
    world.prevInput = world.input
    return
  }
  if (world.phase === Phase.Dead) {
    settleDead(world)
    world.frame += 1
    world.prevInput = world.input
    return
  }
  movePlayer(world)
  const moved = consumeScroll(world, world.speed / 48)
  resolveHits(world, moved)
  world.frame += 1
  world.prevInput = world.input
}
