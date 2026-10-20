/**
 * Dois canais no papel do TIA.
 * Canal 0: ruído contínuo do jato (AUDC 8), ou tom quando o byte alto
 * do combustível cai abaixo de $40. O buffer dá a volta num período
 * fechado do LFSR de 9 bits, então a emenda do loop não estala.
 * Canal 1: tiro, explosão, posto, ponte e queda.
 * O navegador só libera o áudio depois do gesto na tela de início.
 */
import { FUEL_LOW, Phase, Sfx, type World } from '../core/types'

const RATE = 22050

function lfsr9(seed: number): () => number {
  let noise = seed & 0x1ff
  return () => {
    const bit = ((noise >> 0) ^ (noise >> 4)) & 1
    noise = (noise >> 1) | (bit << 8)
    return noise & 1 ? 1 : -1
  }
}

function noiseBuffer(ctx: AudioContext, seconds: number, audf: number, amp: number): AudioBuffer {
  const frames = Math.floor(RATE * seconds)
  const buffer = ctx.createBuffer(1, frames, RATE)
  const data = buffer.getChannelData(0)
  const next = lfsr9(0x1ff)
  let div = 0
  let bit = 1
  let left = frames
  for (let i = 0; i < frames; i++) {
    div += 1
    if (div >= audf) {
      div = 0
      bit = next()
    }
    const env = amp * (left / frames)
    data[i] = bit * env
    left -= 1
  }
  return buffer
}

function toneBuffer(ctx: AudioContext, seconds: number, audf: number, amp: number): AudioBuffer {
  const frames = Math.floor(RATE * seconds)
  const buffer = ctx.createBuffer(1, frames, RATE)
  const data = buffer.getChannelData(0)
  let div = 0
  let bit = 1
  for (let i = 0; i < frames; i++) {
    div += 1
    if (div >= audf) {
      div = 0
      bit = -bit
    }
    data[i] = bit * amp * (1 - i / frames)
  }
  return buffer
}

function engineLoop(ctx: AudioContext): AudioBuffer {
  const period = 511 * 8
  const buffer = ctx.createBuffer(1, period, RATE)
  const data = buffer.getChannelData(0)
  const next = lfsr9(0x1ff)
  let div = 0
  let bit = 1
  for (let i = 0; i < period; i++) {
    div += 1
    if (div >= 4) {
      div = 0
      bit = next()
    }
    data[i] = bit * 0.22
  }
  return buffer
}

export class TiaAudio {
  private ctx: AudioContext | null = null
  private engine: AudioBufferSourceNode | null = null
  private engineGain: GainNode | null = null
  private beep: OscillatorNode | null = null
  private beepGain: GainNode | null = null
  private shot: AudioBuffer | null = null
  private boom: AudioBuffer | null = null
  private fuel: AudioBuffer | null = null
  private bridge: AudioBuffer | null = null
  private die: AudioBuffer | null = null
  private low = false

  unlock(): void {
    if (!this.ctx) {
      const ctx = new AudioContext({ sampleRate: RATE })
      this.ctx = ctx
      this.engineGain = ctx.createGain()
      this.engineGain.gain.value = 0
      this.engineGain.connect(ctx.destination)
      const source = ctx.createBufferSource()
      source.buffer = engineLoop(ctx)
      source.loop = true
      source.connect(this.engineGain)
      source.start()
      this.engine = source
      this.beep = ctx.createOscillator()
      this.beep.type = 'square'
      this.beep.frequency.value = 440
      this.beepGain = ctx.createGain()
      this.beepGain.gain.value = 0
      this.beep.connect(this.beepGain)
      this.beepGain.connect(ctx.destination)
      this.beep.start()
      this.shot = noiseBuffer(ctx, 0.08, 3, 0.35)
      this.boom = noiseBuffer(ctx, 0.2, 6, 0.55)
      this.die = noiseBuffer(ctx, 0.33, 4, 0.6)
      this.fuel = toneBuffer(ctx, 0.1, 7, 0.3)
      this.bridge = toneBuffer(ctx, 0.25, 14, 0.35)
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume()
  }

  pump(world: World): void {
    if (!this.ctx || !this.engine || !this.engineGain || !this.beepGain) {
      world.sfx = 0
      return
    }
    const alive = world.phase === Phase.Play || world.phase === Phase.Dead
    const low = alive && world.fuel >>> 8 < FUEL_LOW && world.phase === Phase.Play
    const span = 0x70 - 0x20
    const along = Math.max(0, Math.min(span, world.speed - 0x20))
    const audf = 28 - Math.floor((along * 16) / span)
    this.engine.playbackRate.value = 12 / audf
    this.engineGain.gain.value = alive && !low ? 0.9 : 0
    this.beepGain.gain.value = low ? 0.12 : 0
    if (low !== this.low) this.low = low
    if (world.sfx & Sfx.Shot) this.play(this.shot)
    if (world.sfx & Sfx.Boom) this.play(this.boom)
    if (world.sfx & Sfx.Fuel) this.play(this.fuel)
    if (world.sfx & Sfx.Bridge) this.play(this.bridge)
    if (world.sfx & Sfx.Die) this.play(this.die)
    world.sfx = 0
  }

  private play(buffer: AudioBuffer | null): void {
    if (!this.ctx || !buffer) return
    const node = this.ctx.createBufferSource()
    node.buffer = buffer
    node.connect(this.ctx.destination)
    node.start()
  }
}
