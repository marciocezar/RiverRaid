import { lfsrStep, LFSR_SEED } from './lfsr'
import { createWorld, frame, startRun } from './loop'
import { paint } from '../systems/render'
import { FUEL_FULL, H, Kind, Phase, SECTION_ROWS, SPEED_MIN, W, type World } from './types'

let failed = false

function expect(name: string, got: number, want: number): void {
  if (got !== want) {
    console.error(`FALHOU ${name}: obteve ${got}, esperava ${want}`)
    failed = true
  }
}

function testLfsr(): void {
  const loAfter = [0x29, 0x53, 0xa7, 0x4e, 0x9d, 0x3a, 0x74, 0xe8]
  const hiAfter = [0x50, 0xa0, 0x40, 0x81, 0x02, 0x05, 0x0a, 0x14]
  const state = { lo: LFSR_SEED.lo, hi: LFSR_SEED.hi }
  for (let i = 0; i < 8; i++) {
    lfsrStep(state)
    expect('lfsr lo', state.lo, loAfter[i])
    expect('lfsr hi', state.hi, hiAfter[i])
  }
}

function testFuel(): void {
  const world = createWorld()
  startRun(world)
  const before = world.fuel
  world.input = 0
  for (let i = 0; i < 30; i++) frame(world)
  expect('combustivel', world.fuel, before - 30 * 0x20)
  expect('cheio', before, FUEL_FULL)
}

function testStraight(): void {
  const world = createWorld()
  let run = 1
  let best = 1
  for (let y = 1; y < world.left.length; y++) {
    if (world.left[y] === world.left[y - 1] && world.right[y] === world.right[y - 1]) {
      run += 1
      if (run > best) best = run
    } else run = 1
  }
  if (best < 4) {
    console.error(`FALHOU mapa: maior trecho reto tem ${best} linhas`)
    failed = true
  }
}

function testScroll(): void {
  const world = createWorld()
  startRun(world)
  const top = world.left[0]
  world.speed = SPEED_MIN
  world.scrollAcc = 0
  world.input = 0
  frame(world)
  if (world.left[0] !== top) {
    console.error('FALHOU scroll: andou linha com acumulador ainda fracionario')
    failed = true
  }
  if (!(world.scrollAcc > 0)) {
    console.error('FALHOU scroll: resto nao foi guardado')
    failed = true
  }
}

function testShot(): void {
  const world = createWorld()
  startRun(world)
  world.invuln = 0
  for (const actor of world.actors) actor.kind = Kind.None
  const ship = world.actors[0]
  ship.kind = Kind.Ship
  ship.x = 80
  ship.y = 40
  ship.w = 16
  ship.h = 8
  world.shotOn = true
  world.shotX = 80
  world.shotY = 44
  world.playerX = 80
  for (let y = 0; y < world.left.length; y++) {
    world.left[y] = 20
    world.right[y] = 140
    world.islandL[y] = 0
    world.islandR[y] = 0
  }
  const score = world.score
  frame(world)
  if (world.score <= score) {
    console.error(`FALHOU tiro: placar ${world.score} nao subiu`)
    failed = true
  }
  if (ship.kind !== Kind.Boom) {
    console.error(`FALHOU tiro: alvo nao explodiu (${ship.kind})`)
    failed = true
  }
}

function layBridge(): World {
  const world = createWorld()
  startRun(world)
  world.invuln = 0
  world.rowsUntilBridge = 0
  world.input = 0
  world.speed = SPEED_MIN
  world.scrollAcc = 0
  for (const actor of world.actors) actor.kind = Kind.None
  for (let y = 0; y < world.left.length; y++) {
    world.left[y] = 30
    world.right[y] = 130
    world.islandL[y] = 0
    world.islandR[y] = 0
  }
  world.playerX = 80
  frame(world)
  return world
}

function bridgeActor(world: World) {
  return world.actors.find((actor) => actor.kind === Kind.Bridge)
}

function testBridgeEdgeSavesPlane(): void {
  const world = layBridge()
  const bridge = bridgeActor(world)
  if (!bridge) {
    console.error('FALHOU ponte: nao nasceu')
    failed = true
    return
  }
  bridge.y = 151
  world.shotOn = true
  world.shotX = 36
  world.shotY = 158
  world.playerX = 80
  const score = world.score
  frame(world)
  expect('ponte borda secao', world.section, 2)
  expect('ponte borda pontos', world.score, score + 500)
  expect('ponte borda fase', world.phase, Phase.Play)
  expect('ponte borda vidas', world.lives, 3)
  expect('ponte borda explosao', bridge.kind, Kind.Boom)
  expect('ponte borda proxima', world.rowsUntilBridge, SECTION_ROWS)
}

function testBridgeChannel(): void {
  const world = layBridge()
  const bridge = bridgeActor(world)
  if (!bridge) return
  bridge.y = 80
  for (let y = 0; y < world.left.length; y++) {
    world.left[y] = 20
    world.right[y] = 140
    world.islandL[y] = 75
    world.islandR[y] = 85
  }
  world.shotOn = true
  world.shotX = 48
  world.shotY = 86
  world.playerX = 48
  frame(world)
  expect('ponte canal secao', world.section, 2)
  expect('ponte canal fase', world.phase, Phase.Play)
}

function testBridgeSweep(): void {
  const world = layBridge()
  const bridge = bridgeActor(world)
  if (!bridge) return
  bridge.y = 80
  world.shotOn = true
  world.shotX = 80
  world.shotY = 77
  world.playerX = 80
  frame(world)
  expect('ponte no passo', world.section, 2)
}

function testBridgeMissesBank(): void {
  const world = layBridge()
  const bridge = bridgeActor(world)
  if (!bridge) return
  bridge.y = 80
  world.shotOn = true
  world.shotX = 10
  world.shotY = 86
  world.playerX = 80
  const score = world.score
  frame(world)
  expect('tiro na margem secao', world.section, 1)
  expect('tiro na margem pontos', world.score, score)
  expect('tiro na margem segue', bridge.kind, Kind.Bridge)
}

function testBridgeCrash(): void {
  const world = layBridge()
  const bridge = bridgeActor(world)
  if (!bridge) return
  bridge.y = 154
  world.shotOn = false
  world.playerX = 80
  frame(world)
  expect('ponte intacta fase', world.phase, Phase.Dead)
  expect('ponte intacta vidas', world.lives, 2)
}

function testCloserTarget(): void {
  const world = layBridge()
  const bridge = bridgeActor(world)
  if (!bridge) return
  bridge.y = 84
  const ship = world.actors[1]
  ship.kind = Kind.Ship
  ship.x = 80
  ship.y = 86
  ship.w = 16
  ship.h = 8
  world.shotOn = true
  world.shotX = 80
  world.shotY = 90
  world.playerX = 80
  const score = world.score
  frame(world)
  expect('navio na frente secao', world.section, 1)
  expect('navio na frente pontos', world.score, score + 30)
  expect('navio na frente ponte', bridge.kind, Kind.Bridge)
  expect('navio na frente explosao', ship.kind, Kind.Boom)
}

function testBridgePaint(): void {
  const world = layBridge()
  const bridge = bridgeActor(world)
  if (!bridge) return
  bridge.y = 40
  const px = {
    width: W,
    height: H,
    data: new Uint8ClampedArray(W * H * 4),
    colorSpace: 'srgb',
  } as ImageData
  paint(world, px)
  let gray = 0
  for (let y = 40; y < 44; y++) {
    for (let x = 30; x < 130; x++) {
      const i = (y * W + x) * 4
      if (px.data[i] === 196 && px.data[i + 1] === 196 && px.data[i + 2] === 196) gray += 1
    }
  }
  if (gray < 90) {
    console.error(`FALHOU desenho da ponte: ${gray} pixels cinza`)
    failed = true
  }
  bridge.kind = Kind.Boom
  bridge.x = 80
  bridge.w = 100
  bridge.timer = 16
  px.data.fill(0)
  paint(world, px)
  let left = 0
  for (let y = 40; y < 44; y++) {
    for (let x = 30; x < 130; x++) {
      const i = (y * W + x) * 4
      if (px.data[i] === 196 && px.data[i + 1] === 196 && px.data[i + 2] === 196) left += 1
    }
  }
  if (left !== 0) {
    console.error(`FALHOU ponte destruida: ainda ha ${left} pixels cinza`)
    failed = true
  }
}

testLfsr()
testFuel()
testStraight()
testScroll()
testShot()
testBridgeEdgeSavesPlane()
testBridgeChannel()
testBridgeSweep()
testBridgeMissesBank()
testBridgeCrash()
testCloserTarget()
testBridgePaint()
if (failed) throw new Error('ha testes falhando')
console.log('nucleo ok')
