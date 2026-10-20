/** Movimento do avião e do tiro. A marcha sobe ou desce enquanto a tecla está segurada. */
import { In, PLAYER_Y, SHOT_STEP, SPEED_MAX, SPEED_MIN, Sfx, W, type World } from '../core/types'

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v
}

export function movePlayer(world: World): void {
  if (world.input & In.Up) world.speed = clamp(world.speed + 2, SPEED_MIN, SPEED_MAX)
  if (world.input & In.Down) world.speed = clamp(world.speed - 2, SPEED_MIN, SPEED_MAX)

  let target = 0
  if (world.input & In.Left && !(world.input & In.Right)) {
    target = -2.15
    world.facing = -1
  } else if (world.input & In.Right && !(world.input & In.Left)) {
    target = 2.15
    world.facing = 1
  }
  world.playerVx += (target - world.playerVx) * 0.45
  world.playerX += world.playerVx
  world.playerX = clamp(world.playerX, 6, W - 7)

  if (world.fireCooldown > 0) world.fireCooldown -= 1
  if (world.fuelTone > 0) world.fuelTone -= 1
  if (world.input & In.Fire && world.fireCooldown === 0 && !world.shotOn) {
    world.shotOn = true
    world.shotX = world.playerX
    world.shotY = PLAYER_Y - 2
    world.fireCooldown = 12
    world.sfx |= Sfx.Shot
  }
  if (world.shotOn) world.shotY -= SHOT_STEP
}
