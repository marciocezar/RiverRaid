// Água e margens. A água e a grama são padrões que deslocam junto com a rolagem do rio,
// então o movimento acompanha exatamente a velocidade do avião.
import { ALTURA_JOGO, LARGURA_TELA } from "../core/config.ts";
import type { Rio } from "../core/rio.ts";
import type { Atlas } from "./atlas.ts";
import { COR } from "./cores.ts";
import type { Quadro } from "./quadro.ts";

/** Hash simples de um número inteiro. Mesma entrada, mesmo resultado: o cenário é estável. */
export function sorteioDaLinha(n: number): number {
  let h = (n * 2654435761) >>> 0;
  h ^= h >>> 15;
  h = Math.imul(h, 2246822519) >>> 0;
  h ^= h >>> 13;
  return h >>> 0;
}

export function desenharCenario(q: Quadro, atlas: Atlas, rio: Rio, distancia: number, tempo: number): void {
  const deslocY = Math.round(distancia);

  q.padrao(0, 0, q.largura, q.altura, atlas.agua, 0, deslocY);

  for (let y = 0; y < ALTURA_JOGO; y++) {
    const faixa = rio.linhas[y];
    if (!faixa) continue;
    const { esquerda, direita } = faixa;
    const linhaMundo = y + deslocY;

    // Grama das duas margens, com o mesmo padrão e o mesmo deslocamento da água.
    if (esquerda > 0) q.padrao(0, y, esquerda, 1, atlas.grama, 0, deslocY);
    if (direita < LARGURA_TELA) q.padrao(direita, y, LARGURA_TELA - direita, 1, atlas.grama, 0, deslocY);

    // Sombra da grama junto à praia, depois uma faixa de areia antes da água.
    q.retangulo(esquerda - 3, y, 2, 1, COR.sombra, 0.25);
    q.retangulo(direita + 1, y, 2, 1, COR.sombra, 0.25);
    q.pixel(esquerda - 1, y, COR.areia);
    q.pixel(direita, y, COR.areia);

    // Espuma que pisca ao longo da borda da água.
    if (linhaMundo % 6 < 2) {
      q.pixel(esquerda, y, COR.espuma, 0.75);
      q.pixel(direita - 1, y, COR.espuma, 0.75);
    }
  }

  desenharArvores(q, atlas, rio, deslocY);
  desenharReflexos(q, rio, tempo);
}

/** Árvores nas margens, uma a cada 19 linhas do mundo, em posições fixas. */
function desenharArvores(q: Quadro, atlas: Atlas, rio: Rio, deslocY: number): void {
  const arvore = atlas.sprites["arvore"];
  if (!arvore) return;
  for (let y = 0; y < ALTURA_JOGO; y++) {
    const linhaMundo = y + deslocY;
    if (linhaMundo % 19 !== 0) continue;
    const faixa = rio.linhas[y];
    if (!faixa) continue;
    const sorteio = sorteioDaLinha(linhaMundo);
    const ladoEsquerdo = (sorteio & 1) === 0;
    if (ladoEsquerdo) {
      const espaco = faixa.esquerda - arvore.largura - 2;
      if (espaco < 1) continue;
      q.sprite(arvore.canvas, 1 + ((sorteio >>> 1) % espaco), y - 3, arvore.largura, arvore.altura);
    } else {
      const inicio = faixa.direita + 1;
      const espaco = LARGURA_TELA - arvore.largura - inicio;
      if (espaco < 1) continue;
      q.sprite(arvore.canvas, inicio + ((sorteio >>> 1) % espaco), y - 3, arvore.largura, arvore.altura);
    }
  }
}

/** Reflexos que correm pela água: pequenos traços claros em posições pseudoaleatórias. */
function desenharReflexos(q: Quadro, rio: Rio, tempo: number): void {
  for (let k = 0; k < 9; k++) {
    const y = (k * 23 + Math.floor(tempo / 2)) % ALTURA_JOGO;
    const faixa = rio.linhas[y];
    if (!faixa) continue;
    const larguraAgua = faixa.direita - faixa.esquerda;
    if (larguraAgua < 8) continue;
    const x = faixa.esquerda + 3 + (sorteioDaLinha(k * 97 + Math.floor(tempo / 90)) % (larguraAgua - 8));
    q.retangulo(x, y, 3, 1, "#6f8fe8", 0.55);
  }
}
