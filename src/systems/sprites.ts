/** Máscaras da recriação. Cada caractere é um pixel; ponto é transparente. */

export const INK: Record<string, [number, number, number]> = {
  Y: [244, 214, 32],
  K: [12, 12, 16],
  N: [16, 52, 72],
  O: [216, 96, 24],
  C: [72, 176, 220],
  R: [204, 40, 40],
  W: [236, 236, 236],
  U: [48, 72, 196],
  G: [168, 168, 168],
  D: [72, 72, 76],
}

export const PLANE = ['...Y...', '..YYY..', '.YYYYY.', 'YYYYYYY', '...Y...', '..Y.Y..']
export const HELI_A = [
  'YYYYYYYYYYYY',
  '.....N......',
  '..NNNN......',
  '.NNNNNNN.Y..',
  '..NNNN..NNN.',
  '...NN....N..',
]
export const HELI_B = [
  'YY..YYYY..YY',
  '.....N......',
  '..NNNN......',
  '.NNNNNNN.Y..',
  '..NNNN..NNN.',
  '...NN....N..',
]
export const SHIP = [
  '.....KKKK.....',
  '....KKKKKK....',
  'OOOOOOOOOOOOOO',
  'OOOOOOOOOOOOOO',
  '.CCCCCCCCCCCC.',
]
export const JET = ['....K....', '..KKKKK..', '.KKKKKKK.', 'KKKKKKKKK', '.OOO.OOO.']
export const FUEL = [
  'RWWWWWWRR',
  'RWWWRRRRR',
  'RWWWWWRRR',
  'RWWWRRRRR',
  'RWWWRRRRR',
  'WKKWWKKWW',
  'WKKWWKKWW',
  'WKKWWKKWW',
  'WKKWWKKWW',
  'WWKKKKWWW',
  'UWWWWWWWU',
  'UWWWUUUUU',
  'UWWWWWWWU',
  'UWWWUUUUU',
  'UWWWWWWWU',
  'WKKWWWWWW',
  'WKKWWWWWW',
  'WKKWWWWWW',
  'WKKWWWWWW',
  'WKKKKKKKK',
]

export const DIGIT = [
  ['###', '#.#', '#.#', '#.#', '###'],
  ['.#.', '.#.', '.#.', '.#.', '.#.'],
  ['###', '..#', '###', '#..', '###'],
  ['###', '..#', '###', '..#', '###'],
  ['#.#', '#.#', '###', '..#', '..#'],
  ['###', '#..', '###', '..#', '###'],
  ['###', '#..', '###', '#.#', '###'],
  ['###', '..#', '..#', '..#', '..#'],
  ['###', '#.#', '###', '#.#', '###'],
  ['###', '#.#', '###', '..#', '###'],
]

export const GLYPH: Record<string, string[]> = {
  A: ['.#.', '#.#', '###', '#.#', '#.#'],
  C: ['###', '#..', '#..', '#..', '###'],
  D: ['##.', '#.#', '#.#', '#.#', '##.'],
  E: ['###', '#..', '###', '#..', '###'],
  F: ['###', '#..', '###', '#..', '#..'],
  I: ['###', '.#.', '.#.', '.#.', '###'],
  L: ['#..', '#..', '#..', '#..', '###'],
  M: ['#.#', '###', '#.#', '#.#', '#.#'],
  P: ['##.', '#.#', '##.', '#..', '#..'],
  S: ['###', '#..', '###', '..#', '###'],
  N: ['#.#', '###', '###', '#.#', '#.#'],
  O: ['###', '#.#', '#.#', '#.#', '###'],
  Q: ['###', '#.#', '#.#', '###', '.##'],
  R: ['##.', '#.#', '##.', '#.#', '#.#'],
  T: ['###', '.#.', '.#.', '.#.', '.#.'],
  U: ['#.#', '#.#', '#.#', '#.#', '###'],
  V: ['#.#', '#.#', '#.#', '#.#', '.#.'],
  ' ': ['...', '...', '...', '...', '...'],
}
