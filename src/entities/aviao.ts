// Avião do jogador: move-se só na horizontal, na linha fixa Y_AVIAO.
import { Y_AVIAO } from "../core/config.ts";
import type { Caixa } from "./caixa.ts";

// Caixa de colisão do avião, um pouco menor que o desenho (asas têm pontas finas).
// Caixa de colisão do avião: o corpo e as asas centrais. As pontas finas das asas não batem.
export const AVIAO_LARGURA = 15;
export const AVIAO_ALTURA = 17;
export const AVIAO_VELOCIDADE_X = 1.5;

/** Posição do centro horizontal do avião. */
export function caixaAviao(x: number): Caixa {
  return {
    x: x - AVIAO_LARGURA / 2,
    y: Y_AVIAO - AVIAO_ALTURA / 2,
    largura: AVIAO_LARGURA,
    altura: AVIAO_ALTURA,
  };
}

/** Novo centro horizontal, limitado à tela. As margens do rio são tratadas pelo mundo. */
export function moverAviao(x: number, esquerda: boolean, direita: boolean, largura: number): number {
  let novo = x;
  if (esquerda) novo -= AVIAO_VELOCIDADE_X;
  if (direita) novo += AVIAO_VELOCIDADE_X;
  return Math.max(0, Math.min(largura - 1, novo));
}
