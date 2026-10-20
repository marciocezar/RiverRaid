import Phaser from 'phaser'
import { frame, setSpeedGear, startRun, togglePause, createWorld } from './core/loop'
import { Phase, W, H, type World } from './core/types'
import { detectShell } from './platform'
import { TiaAudio } from './systems/audio'
import { bindInput, createCommands } from './systems/input'
import { paint } from './systems/render'

const world: World = createWorld()
const commands = createCommands()
const audio = new TiaAudio()
const shell = detectShell()

function begin(): void {
  audio.unlock()
  if (world.phase === Phase.Title || world.phase === Phase.Over) startRun(world)
}

class Play extends Phaser.Scene {
  private pixels!: ImageData
  private tex!: Phaser.Textures.CanvasTexture

  constructor() {
    super('play')
  }

  create(): void {
    this.pixels = new ImageData(W, H)
    this.tex = this.textures.createCanvas('fb', W, H)!
    this.add.image(W / 2, H / 2, 'fb').setOrigin(0.5)
    paint(world, this.pixels)
    this.tex.context.putImageData(this.pixels, 0, 0)
    this.tex.refresh()
  }

  update(): void {
    if (commands.start) {
      commands.start = false
      begin()
    }
    if (commands.pause) {
      commands.pause = false
      audio.unlock()
      togglePause(world)
    }
    if (commands.restart) {
      commands.restart = false
      audio.unlock()
      startRun(world)
    }
    if (commands.backToTitle) {
      commands.backToTitle = false
      world.phase = Phase.Title
      world.input = 0
    }
    if (commands.gear) {
      setSpeedGear(world, commands.gear)
      commands.gear = 0
    }
    world.input = commands.bits
    frame(world)
    audio.pump(world)
    paint(world, this.pixels)
    this.tex.context.putImageData(this.pixels, 0, 0)
    this.tex.refresh()
  }
}

const hud = document.querySelector<HTMLElement>('#touch')!
bindInput(commands, shell, hud)

window.addEventListener('pointerdown', () => {
  if (world.phase === Phase.Title || world.phase === Phase.Over) begin()
})

new Phaser.Game({
  type: Phaser.AUTO,
  width: W,
  height: H,
  parent: 'stage',
  backgroundColor: '#000000',
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: W,
    height: H,
  },
  scene: [Play],
  banner: false,
})
