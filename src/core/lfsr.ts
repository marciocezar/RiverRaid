/**
 * Gerador procedural do rio (LFSR de 16 bits).
 *
 * Transcrição da rotina $FAC6 do cartucho original:
 *
 *   LDA $EA / ASL / ASL / ASL / EOR $EA / ASL / ROL $E9 / ROL $EA / RTS
 *
 * O estado é o par (EA:E9), com EA como byte alto. Cada passo desloca o estado
 * uma posição à esquerda e injeta no bit 0 o XOR dos bits 15 e 12 do estado
 * (bits 7 e 4 de EA). Não usa memória além do próprio estado de 16 bits.
 *
 * Este módulo não conhece renderização nem áudio.
 */

export type RngState = number; // 16 bits: (EA << 8) | E9

export const RNG_MASK = 0xffff;

/** Avança o gerador um passo, exatamente como $FAC6. */
export function lfsrStep(state: RngState): RngState {
  const feedback = ((state >> 15) ^ (state >> 12)) & 1;
  return ((state << 1) | feedback) & RNG_MASK;
}

/** Byte baixo do estado (E9 no cartucho). */
export function lowByte(state: RngState): number {
  return state & 0xff;
}

/** Byte alto do estado (EA no cartucho). */
export function highByte(state: RngState): number {
  return (state >> 8) & 0xff;
}

/** Monta o estado a partir dos dois bytes, como fazem E9 e EA. */
export function makeState(e9: number, ea: number): RngState {
  return ((ea & 0xff) << 8) | (e9 & 0xff);
}
