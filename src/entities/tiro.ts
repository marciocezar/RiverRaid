// Tiro disparado pelo avião, sobe em linha reta.
import type { Caixa } from "./caixa.ts";

export const TIRO_VELOCIDADE = 4;

export interface Tiro {
  x: number;
  y: number;
}

export function caixaTiro(t: Tiro): Caixa {
  return { x: t.x - 0.5, y: t.y - 2, largura: 1, altura: 4 };
}
