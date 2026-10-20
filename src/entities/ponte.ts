// Ponte que atravessa o rio de margem a margem. Bloqueia o avião até o miolo ser atingido.
// A geometria (onde começa e termina a água) vem do rio na linha da ponte, então a ponte
// acompanha as margens quando elas se movem.
import type { Caixa } from "./caixa.ts";

/** Altura da ponte em pixels: trilho, tabuleiro, treliça e sombra. */
export const PONTE_ALTURA = 7;
/** Largura do miolo vermelho que precisa ser atingido. */
export const NUCLEO_LARGURA = 6;
/** Quadros que a ponte leva para afundar depois de destruída. */
export const DURACAO_QUEDA_PONTE = 90;

export interface Ponte {
  /** Linha da tela onde a ponte começa (topo). */
  y: number;
  destruida: boolean;
  /** Quadros desde a destruição; controla a animação de queda. */
  tempoQueda: number;
}

export function criarPonte(y: number): Ponte {
  return { y, destruida: false, tempoQueda: 0 };
}

/** Caixa do tabuleiro inteiro: da margem esquerda à direita, nas linhas da ponte. */
export function caixaTabuleiro(esquerda: number, direita: number, y: number): Caixa {
  return { x: esquerda, y, largura: Math.max(0, direita - esquerda), altura: PONTE_ALTURA };
}

/** Caixa do miolo vermelho, centrado na água. */
export function caixaNucleo(esquerda: number, direita: number, y: number): Caixa {
  const centro = (esquerda + direita) / 2;
  return { x: centro - NUCLEO_LARGURA / 2, y, largura: NUCLEO_LARGURA, altura: PONTE_ALTURA };
}
