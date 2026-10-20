// Gerador do rio: uma faixa de água por linha da tela, produzida a partir do Rng.
// Cada segmento escolhe um novo centro e uma nova largura. As margens caminham
// em direção a esses alvos, um pixel por vez, então o rio nunca dá saltos bruscos.
import { ALTURA_JOGO, LARGURA_TELA } from "./config.ts";
import { Rng } from "./rng.ts";

export interface Faixa {
  /** Primeira coluna de água (inclusive). */
  esquerda: number;
  /** Última coluna de água + 1 (exclusive). */
  direita: number;
}

export class Rio {
  /** Linhas da tela, índice 0 no topo. */
  readonly linhas: Faixa[] = [];
  private centro = LARGURA_TELA / 2;
  private largura = 80;
  private alvoCentro = LARGURA_TELA / 2;
  private alvoLargura = 80;
  private restanteSegmento = 0;
  private readonly rng: Rng;
  private nivel: number;

  constructor(rng: Rng, nivel = 1) {
    this.rng = rng;
    this.nivel = nivel;
    for (let i = 0; i < ALTURA_JOGO; i++) {
      this.linhas.unshift(this.gerarLinha());
    }
  }

  setNivel(nivel: number): void {
    this.nivel = nivel;
  }

  /** Larguras mínima e máxima da água, que diminuem a cada nível. */
  private limitesLargura(): [number, number] {
    const minimo = Math.max(26, 42 - (this.nivel - 1) * 3);
    const maximo = Math.max(minimo + 10, 110 - (this.nivel - 1) * 4);
    return [minimo, maximo];
  }

  private novoSegmento(): void {
    this.restanteSegmento = this.rng.inteiro(6, 16);
    const [minimo, maximo] = this.limitesLargura();
    this.alvoLargura = this.rng.inteiro(minimo, maximo);
    const margem = Math.ceil(this.alvoLargura / 2) + 2;
    this.alvoCentro = this.rng.inteiro(margem, LARGURA_TELA - margem);
  }

  private passo(atual: number, alvo: number): number {
    if (atual === alvo) return atual;
    // Um byte decide se a margem anda neste quadro, para variar a inclinação.
    if ((this.rng.byte() & 1) === 0) return atual;
    return atual < alvo ? atual + 1 : atual - 1;
  }

  private gerarLinha(): Faixa {
    if (this.restanteSegmento <= 0) this.novoSegmento();
    this.restanteSegmento--;
    this.centro = this.passo(this.centro, this.alvoCentro);
    this.largura = this.passo(this.largura, this.alvoLargura);
    const esquerda = Math.max(2, this.centro - Math.floor(this.largura / 2));
    const direita = Math.min(LARGURA_TELA - 2, esquerda + this.largura);
    return { esquerda, direita };
  }

  /** Rola o rio uma linha: remove a de baixo e cria uma nova no topo. */
  avancar(): void {
    this.linhas.pop();
    this.linhas.unshift(this.gerarLinha());
  }
}
