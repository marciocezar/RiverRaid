/**
 * Passo do gerador de 16 bits do cartucho, rotina $FAC6.
 *
 *   LDA $EA
 *   ASL
 *   ASL
 *   ASL
 *   EOR $EA
 *   ASL
 *   ROL $E9
 *   ROL $EA
 *
 * O acumulador final é descartado. O estado que fica é o par
 * ($E9, $EA). Este módulo não importa desenho, áudio nem Phaser.
 */

export interface Lfsr {
  lo: number
  hi: number
}

export const LFSR_SEED: Lfsr = { lo: 0x14, hi: 0xa8 }

export function lfsrStep(state: Lfsr): void {
  let a = state.hi & 0xff
  a = (a << 1) & 0xff
  a = (a << 1) & 0xff
  a = (a << 1) & 0xff
  a = (a ^ state.hi) & 0xff
  const carry = (a >> 7) & 1
  const carryLo = (state.lo >> 7) & 1
  state.lo = ((state.lo << 1) | carry) & 0xff
  state.hi = ((state.hi << 1) | carryLo) & 0xff
}
