/** Estado e constantes compartilhados. Números alinhados a src/core/river.c. */

export const W = 160
export const H = 192
export const PLAY_TOP = 164
export const MAX_ACTORS = 8

export const SPEED_MIN = 0x20
export const SPEED_MAX = 0x70
export const SPEED_CRUISE = 0x38
export const FUEL_FULL = 0xffff
export const FUEL_LOW = 0x40

export const PLAYER_Y = 152
export const PLAYER_HIT_W = 5
export const PLAYER_HIT_H = 4
export const SECTION_ROWS = 1100
export const SPAWN_GAP = 72
export const SHOT_STEP = 6

export const In = {
  Left: 1 << 0,
  Right: 1 << 1,
  Up: 1 << 2,
  Down: 1 << 3,
  Fire: 1 << 4,
} as const

export const Sfx = {
  Shot: 1 << 0,
  Boom: 1 << 1,
  Fuel: 1 << 2,
  Bridge: 1 << 3,
  Die: 1 << 4,
} as const

export const Phase = {
  Title: 0,
  Play: 1,
  Dead: 2,
  Over: 3,
  Pause: 4,
} as const

export const Kind = {
  None: 0,
  Heli: 1,
  Ship: 2,
  Jet: 3,
  Fuel: 4,
  Bridge: 5,
  Boom: 6,
} as const

/**
 * Um alvo é um punhado de componentes guardados juntos:
 * espécie, posição, velocidade, caixa e um timer.
 * O vetor tem tamanho fixo para o quadro não alocar.
 */
export interface Actor {
  kind: number
  x: number
  y: number
  vx: number
  w: number
  h: number
  timer: number
}

export interface World {
  lo: number
  hi: number
  steps: number
  left: Uint8Array
  right: Uint8Array
  islandL: Uint8Array
  islandR: Uint8Array
  center: number
  half: number
  bend: number
  straight: number
  playerX: number
  playerVx: number
  playerY: number
  speed: number
  facing: number
  fuel: number
  lives: number
  score: number
  section: number
  rowsUntilBridge: number
  sinceSpawn: number
  invuln: number
  shotOn: boolean
  shotX: number
  shotY: number
  fireCooldown: number
  phase: number
  deadTimer: number
  input: number
  prevInput: number
  sfx: number
  fuelTone: number
  scrollAcc: number
  frame: number
  actors: Actor[]
}

export function blankActor(): Actor {
  return { kind: Kind.None, x: 0, y: 0, vx: 0, w: 0, h: 0, timer: 0 }
}
