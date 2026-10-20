// Tamanhos dos sprites em pixels lógicos (a tela de jogo é 160x192). Cada sprite é desenhado
// em ESCALA vezes mais pixels reais. Os valores incluem contorno e sombra.
export const TAMANHOS = {
  aviao: { largura: 22, altura: 22 },
  helicoptero: { largura: 20, altura: 24 },
  navio: { largura: 24, altura: 12 },
  jato: { largura: 22, altura: 22 },
  posto: { largura: 28, altura: 20 },
  arvore: { largura: 12, altura: 14 },
  vida: { largura: 10, altura: 10 },
} as const;

export type NomeSprite = keyof typeof TAMANHOS;
