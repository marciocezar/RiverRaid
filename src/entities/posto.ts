// Posto de combustível flutuante. Tem dois retângulos:
//  - o corpo (20x14): é o alvo de tiro; atirar nele destrói o posto, como no original;
//  - a área de abastecimento (34x30), centrada no corpo: sobrevoá-la reabastece o avião.
import type { Caixa } from "./caixa.ts";

export const POSTO_LARGURA = 20;
export const POSTO_ALTURA = 13;
export const ZONA_LARGURA = 34;
export const ZONA_ALTURA = 30;

export interface Posto {
  /** Canto superior esquerdo do corpo. */
  x: number;
  y: number;
}

export function caixaPosto(p: Posto): Caixa {
  return { x: p.x, y: p.y, largura: POSTO_LARGURA, altura: POSTO_ALTURA };
}

/** Área de abastecimento: maior que o corpo e centrada nele. */
export function caixaZonaPosto(p: Posto): Caixa {
  return {
    x: p.x + POSTO_LARGURA / 2 - ZONA_LARGURA / 2,
    y: p.y + POSTO_ALTURA / 2 - ZONA_ALTURA / 2,
    largura: ZONA_LARGURA,
    altura: ZONA_ALTURA,
  };
}
