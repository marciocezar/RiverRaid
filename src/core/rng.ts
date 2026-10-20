// Números pseudoaleatórios a partir do mesmo LFSR de 16 bits do rio.
// Cada byte novo recebe oito passos do registrador, então os bits de saída são
// os bits recém-deslocados. A semente zero travaria o registrador, então vira 1.
import { lfsrStep, lowByte, type RngState } from "./lfsr.ts";

export class Rng {
  private estado: RngState;

  constructor(semente: number) {
    this.estado = semente & 0xffff || 1;
  }

  /** Um byte de 0 a 255. */
  byte(): number {
    for (let i = 0; i < 8; i++) {
      this.estado = lfsrStep(this.estado);
    }
    return lowByte(this.estado);
  }

  /** Inteiro uniforme entre min e max, inclusive. */
  inteiro(min: number, max: number): number {
    const faixa = max - min + 1;
    return min + (this.byte() % faixa);
  }

  /** Verdadeiro com probabilidade p (0 a 1). */
  chance(p: number): boolean {
    return this.byte() < p * 256;
  }

  /** Estado atual, para depuração e testes. */
  get semente(): RngState {
    return this.estado;
  }
}
