/** Teclado em todo lugar. O HUD de toque só escreve bits quando a casca pede. */
import { In } from '../core/types'
import type { Shell } from '../platform'
import { wantsTouchHud } from '../platform'

export interface Commands {
  bits: number
  start: boolean
  pause: boolean
  restart: boolean
  backToTitle: boolean
  gear: number
}

export function createCommands(): Commands {
  return { bits: 0, start: false, pause: false, restart: false, backToTitle: false, gear: 0 }
}

const held = new Set<string>()
let touchBits = 0

function bitFor(code: string): number {
  switch (code) {
    case 'ArrowLeft':
    case 'KeyA':
      return In.Left
    case 'ArrowRight':
    case 'KeyD':
      return In.Right
    case 'ArrowUp':
    case 'KeyW':
      return In.Up
    case 'ArrowDown':
    case 'KeyS':
      return In.Down
    case 'Space':
      return In.Fire
    default:
      return 0
  }
}

function recompute(commands: Commands): void {
  let bits = touchBits
  for (const code of held) bits |= bitFor(code)
  commands.bits = bits
}

export function bindInput(commands: Commands, shell: Shell, hud: HTMLElement): void {
  const touch = wantsTouchHud(shell)
  hud.hidden = !touch

  window.addEventListener('keydown', (event) => {
    if (event.repeat) {
      if (bitFor(event.code)) event.preventDefault()
      return
    }
    const bit = bitFor(event.code)
    if (bit) {
      event.preventDefault()
      held.add(event.code)
      recompute(commands)
      return
    }
    if (event.code === 'Enter') commands.start = true
    else if (event.code === 'KeyP') commands.pause = true
    else if (event.code === 'KeyR') commands.restart = true
    else if (event.code === 'Escape') commands.backToTitle = true
    else if (event.code === 'Digit1') commands.gear = 1
    else if (event.code === 'Digit2') commands.gear = 2
    else if (event.code === 'Digit3') commands.gear = 3
  })

  window.addEventListener('keyup', (event) => {
    if (!bitFor(event.code)) return
    held.delete(event.code)
    recompute(commands)
  })

  window.addEventListener('blur', () => {
    held.clear()
    recompute(commands)
  })

  if (!touch) return

  hud.querySelectorAll<HTMLButtonElement>('button[data-bit]').forEach((button) => {
    const name = button.dataset.bit ?? ''
    const bit =
      name === 'left'
        ? In.Left
        : name === 'right'
          ? In.Right
          : name === 'up'
            ? In.Up
            : name === 'down'
              ? In.Down
              : name === 'fire'
                ? In.Fire
                : 0
    const press = (event: Event) => {
      event.preventDefault()
      touchBits |= bit
      recompute(commands)
    }
    const release = (event: Event) => {
      event.preventDefault()
      touchBits &= ~bit
      recompute(commands)
    }
    button.addEventListener('pointerdown', press)
    button.addEventListener('pointerup', release)
    button.addEventListener('pointercancel', release)
    button.addEventListener('pointerleave', release)
  })
}
