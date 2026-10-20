// Estado completo da partida e a regra de um quadro. Não importa Phaser nem áudio:
// a camada de render e a de som leem o estado e os eventos e decidem como mostrar.
import {
  ALTURA_JOGO,
  COMBUSTIVEL_MAXIMO,
  LARGURA_TELA,
  VELOCIDADE_MAX,
  VELOCIDADE_MIN,
  VIDAS_INICIAIS,
  Y_AVIAO,
} from "./config.ts";
import { Rio } from "./rio.ts";
import { Rng } from "./rng.ts";
import { caixaAviao, moverAviao, AVIAO_LARGURA } from "../entities/aviao.ts";
import { atualizarInimigo, caixaInimigo, criarInimigo, type Inimigo, type TipoInimigo } from "../entities/inimigo.ts";
import { caixaPosto, caixaZonaPosto, POSTO_ALTURA, POSTO_LARGURA, type Posto } from "../entities/posto.ts";
import { caixaTiro, TIRO_VELOCIDADE, type Tiro } from "../entities/tiro.ts";
import { criarExplosao, type Explosao } from "../entities/explosao.ts";
import {
  caixaNucleo,
  caixaTabuleiro,
  criarPonte,
  DURACAO_QUEDA_PONTE,
  PONTE_ALTURA,
  type Ponte,
} from "../entities/ponte.ts";
import { sobrepoe, type Caixa } from "../entities/caixa.ts";

/** Entrada do jogador num quadro. `esquerda`, `direita`, `acelera`, `freia` e `tiro` são estados mantidos. */
export interface Entrada {
  esquerda: boolean;
  direita: boolean;
  acelera: boolean;
  freia: boolean;
  tiro: boolean;
}

export const ENTRADA_VAZIA: Entrada = {
  esquerda: false,
  direita: false,
  acelera: false,
  freia: false,
  tiro: false,
};

export type EstadoPartida = "jogando" | "morrendo" | "fim";

export type Evento =
  | "tiro"
  | "explosao"
  | "reabastecer"
  | "combustivel_baixo"
  | "inimigo_abatido"
  | "ponte_destruida"
  | "posto_destruido"
  | "impacto"
  | "nivel";

/** Quadros de explosão do avião e do inimigo. */
const DURACAO_EXPLOSAO = 40;
/** Quadros de espera depois de cair, antes de voltar ao jogo. */
const DURACAO_MORTE = 90;
/** Quadros em que o avião fica invulnerável depois de voltar. */
const DURACAO_INVULNERAVEL = 120;
/** Linhas rolando entre postos de combustível. */
const DISTANCIA_ENTRE_POSTOS = 260;
/** Linhas rolando entre pontes: uma ponte nova só aparece depois dessa distância. */
const DISTANCIA_ENTRE_PONTES = 1800;
/** Pontos por ponte destruída. */
const PONTOS_PONTE = 200;
/** Pontos por posto de combustível destruído a tiro (sem reabastecer). */
const PONTOS_POSTO = 50;
/** Limite de tiros simultâneos na tela. */
const TIROS_MAXIMOS = 2;
/** Gasto de combustível por quadro: base mais um termo proporcional à velocidade. */
const CONSUMO_BASE = 0.012;
const CONSUMO_POR_VELOCIDADE = 0.004;
/** Quanto um posto reabastece por quadro. */
const REABASTECIMENTO_POR_QUADRO = 0.5;
/** Abaixo deste valor, o alerta de combustível soa uma vez por segundo. */
const LIMITE_COMBUSTIVEL_BAIXO = 25;

export class Mundo {
  readonly rng: Rng;
  readonly rio: Rio;

  x = LARGURA_TELA / 2;
  velocidade = 2;
  combustivel = COMBUSTIVEL_MAXIMO;
  pontos = 0;
  vidas = VIDAS_INICIAIS;
  nivel = 1;
  /** Linhas de rio que já passaram sob o avião. */
  distancia = 0;
  estado: EstadoPartida = "jogando";
  /** Quadros que faltam para o avião voltar depois da queda. */
  contadorMorte = 0;
  /** Quadros de invulnerabilidade restantes. */
  invulneravel = 0;

  inimigos: Inimigo[] = [];
  postos: Posto[] = [];
  pontes: Ponte[] = [];
  tiros: Tiro[] = [];
  explosoes: Explosao[] = [];
  /** Eventos do último quadro. A camada de som lê e a de render também. */
  eventos: Evento[] = [];
  /** Quadros do mundo desde o início. Serve de relógio para as animações. */
  quadro = 0;

  private anterior: Entrada = { ...ENTRADA_VAZIA };
  private rolagemAcumulada = 0;
  private distanciaDesdePosto = DISTANCIA_ENTRE_POSTOS / 2;
  /** Começa adiantada para a primeira ponte aparecer logo no início. */
  private distanciaDesdePonte = DISTANCIA_ENTRE_PONTES / 2;
  private quadrosDesdeAlerta = 0;

  constructor(semente: number) {
    this.rng = new Rng(semente);
    this.rio = new Rio(this.rng, this.nivel);
    this.x = this.centroDaAgua();
  }

  /** Centro da água na linha do avião. */
  private centroDaAgua(): number {
    const linha = this.rio.linhas[Y_AVIAO];
    if (!linha) return LARGURA_TELA / 2;
    return (linha.esquerda + linha.direita) / 2;
  }

  /** Avança o mundo um quadro. */
  atualizar(entrada: Entrada): void {
    this.eventos = [];
    this.quadro++;
    if (this.estado === "fim") {
      this.anterior = { ...entrada };
      return;
    }
    if (this.estado === "morrendo") {
      this.atualizarMorte();
    } else {
      this.atualizarJogando(entrada);
    }
    this.atualizarPontesDestruidas();
    this.anterior = { ...entrada };
  }

  private atualizarMorte(): void {
    this.rolar(1);
    this.atualizarExplosoes();
    this.contadorMorte--;
    if (this.contadorMorte > 0) return;
    if (this.vidas > 0) {
      this.renascer();
    } else {
      this.estado = "fim";
    }
  }

  private atualizarJogando(entrada: Entrada): void {
    const acelerou = entrada.acelera && !this.anterior.acelera;
    const freiou = entrada.freia && !this.anterior.freia;
    if (acelerou) this.velocidade = Math.min(VELOCIDADE_MAX, this.velocidade + 1);
    if (freiou) this.velocidade = Math.max(VELOCIDADE_MIN, this.velocidade - 1);

    if (entrada.tiro && !this.anterior.tiro) this.disparar();

    this.x = moverAviao(this.x, entrada.esquerda, entrada.direita, LARGURA_TELA);
    this.rolar(this.velocidade);
    this.atualizarTiros();
    this.atualizarExplosoes();
    this.atualizarInimigos();
    this.atualizarCombustivel();
    this.verificarColisoes();
    this.atualizarNivel();
  }

  /** Rola o rio `linhas` vezes; objetos na tela descem o mesmo tanto. */
  private rolar(linhas: number): void {
    for (let i = 0; i < linhas; i++) {
      this.rio.avancar();
      this.distancia++;
      this.distanciaDesdePosto++;
      this.distanciaDesdePonte++;
      this.rolagemAcumulada++;
      if (this.rolagemAcumulada % 4 === 0 && this.estado === "jogando") {
        this.pontos += 1;
      }
      for (const inimigo of this.inimigos) inimigo.y += 1;
      for (const posto of this.postos) posto.y += 1;
      for (const ponte of this.pontes) ponte.y += 1;
    }
    this.inimigos = this.inimigos.filter((e) => e.y < ALTURA_JOGO + 10);
    this.postos = this.postos.filter((p) => p.y < ALTURA_JOGO + 10);
    this.pontes = this.pontes.filter((p) => p.y < ALTURA_JOGO + 10);
    if (this.estado === "jogando" && this.distanciaDesdePosto >= DISTANCIA_ENTRE_POSTOS) {
      this.criarPosto();
      this.distanciaDesdePosto = 0;
    }
    if (this.estado === "jogando" && this.distanciaDesdePonte >= DISTANCIA_ENTRE_PONTES && !this.pontes.some((p) => !p.destruida)) {
      this.pontes.push(criarPonte(-PONTE_ALTURA));
      this.distanciaDesdePonte = 0;
    }
    if (this.estado === "jogando" && this.rng.chance(0.012 + 0.004 * this.nivel)) {
      this.criarInimigo();
    }
  }

  private criarPosto(): void {
    const linha = this.rio.linhas[0];
    if (!linha) return;
    const meio = Math.floor((linha.esquerda + linha.direita) / 2) - POSTO_LARGURA / 2;
    this.postos.push({ x: meio, y: -POSTO_ALTURA });
  }

  private criarInimigo(): void {
    const linha = this.rio.linhas[0];
    if (!linha) return;
    const sorteio = this.rng.byte();
    let tipo: TipoInimigo;
    if (sorteio < 130) tipo = "navio";
    else if (sorteio < 200) tipo = "helicoptero";
    else tipo = "jato";
    const faixa = linha.direita - linha.esquerda - 13;
    const x = linha.esquerda + (faixa > 0 ? this.rng.inteiro(0, faixa) : 0);
    const direcao = this.rng.byte() & 1 ? 1 : -1;
    this.inimigos.push(criarInimigo(tipo, x, -8, direcao));
  }

  private disparar(): void {
    if (this.tiros.length >= TIROS_MAXIMOS || this.estado !== "jogando") return;
    this.tiros.push({ x: this.x, y: Y_AVIAO - 6 });
    this.eventos.push("tiro");
  }

  /** Limites horizontais da água nas linhas que a ponte ocupa. */
  private faixaDaPonte(ponte: Ponte): [number, number] {
    let esquerda = LARGURA_TELA;
    let direita = 0;
    for (let y = Math.max(0, Math.floor(ponte.y)); y < Math.min(ALTURA_JOGO, Math.ceil(ponte.y) + PONTE_ALTURA); y++) {
      const linha = this.rio.linhas[y];
      if (!linha) continue;
      esquerda = Math.min(esquerda, linha.esquerda);
      direita = Math.max(direita, linha.direita);
    }
    return esquerda < direita ? [esquerda, direita] : [0, LARGURA_TELA];
  }

  /** Caixa do tabuleiro (a parte que bloqueia o avião). */
  caixaTabuleiroDa(ponte: Ponte): Caixa {
    const [esquerda, direita] = this.faixaDaPonte(ponte);
    return caixaTabuleiro(esquerda, direita, ponte.y);
  }

  /** Caixa do miolo vermelho, que precisa ser atingido para abrir a ponte. */
  caixaNucleoDa(ponte: Ponte): Caixa {
    const [esquerda, direita] = this.faixaDaPonte(ponte);
    return caixaNucleo(esquerda, direita, ponte.y);
  }

  private atualizarTiros(): void {
    for (const tiro of this.tiros) {
      tiro.y -= TIRO_VELOCIDADE;
    }
    const restantes: Tiro[] = [];
    for (const tiro of this.tiros) {
      if (this.tiroAtingeInimigo(tiro)) continue;
      if (this.tiroAtingePonte(tiro)) continue;
      if (this.tiroAtingePosto(tiro)) continue;
      if (tiro.y > -4) restantes.push(tiro);
    }
    this.tiros = restantes;
  }

  /** Remove o inimigo atingido e soma os pontos. Devolve verdadeiro se houve acerto. */
  private tiroAtingeInimigo(tiro: Tiro): boolean {
    for (let i = this.inimigos.length - 1; i >= 0; i--) {
      const inimigo = this.inimigos[i]!;
      if (sobrepoe(caixaTiro(tiro), caixaInimigo(inimigo))) {
        this.inimigos.splice(i, 1);
        this.pontos += inimigo.pontos;
        this.explosoes.push(criarExplosao(inimigo.x, inimigo.y, DURACAO_EXPLOSAO));
        this.eventos.push("inimigo_abatido");
        return true;
      }
    }
    return false;
  }

  /** Tiro no miolo abre a ponte; tiro no tabuleiro só faz faísca. Devolve verdadeiro se atingiu. */
  private tiroAtingePonte(tiro: Tiro): boolean {
    for (const ponte of this.pontes) {
      if (ponte.destruida) continue;
      if (!sobrepoe(caixaTiro(tiro), this.caixaTabuleiroDa(ponte))) continue;
      const nucleo = this.caixaNucleoDa(ponte);
      if (sobrepoe(caixaTiro(tiro), nucleo)) {
        ponte.destruida = true;
        ponte.tempoQueda = 0;
        this.pontos += PONTOS_PONTE;
        this.explosoes.push(criarExplosao(nucleo.x + nucleo.largura / 2, nucleo.y + nucleo.altura / 2, DURACAO_QUEDA_PONTE));
        this.eventos.push("ponte_destruida");
      } else {
        this.eventos.push("impacto");
      }
      return true;
    }
    return false;
  }

  /** Tiro no corpo do posto destrói o posto. Atirar na área de abastecimento não faz nada. */
  private tiroAtingePosto(tiro: Tiro): boolean {
    for (let i = this.postos.length - 1; i >= 0; i--) {
      const posto = this.postos[i]!;
      if (!sobrepoe(caixaTiro(tiro), caixaPosto(posto))) continue;
      this.postos.splice(i, 1);
      this.pontos += PONTOS_POSTO;
      this.explosoes.push(criarExplosao(posto.x + POSTO_LARGURA / 2, posto.y + POSTO_ALTURA / 2, DURACAO_EXPLOSAO));
      this.eventos.push("posto_destruido");
      return true;
    }
    return false;
  }

  private atualizarPontesDestruidas(): void {
    for (const ponte of this.pontes) {
      if (ponte.destruida) ponte.tempoQueda++;
    }
    this.pontes = this.pontes.filter((p) => !p.destruida || p.tempoQueda < DURACAO_QUEDA_PONTE);
  }

  private atualizarExplosoes(): void {
    for (const e of this.explosoes) e.tempo--;
    this.explosoes = this.explosoes.filter((e) => e.tempo > 0);
  }

  private atualizarInimigos(): void {
    for (const inimigo of this.inimigos) {
      atualizarInimigo(inimigo, this.rio, this.x, 0);
    }
  }

  private atualizarCombustivel(): void {
    if (this.estado !== "jogando") return;
    this.combustivel = Math.max(0, this.combustivel - (CONSUMO_BASE + CONSUMO_POR_VELOCIDADE * this.velocidade));
    const caixa = caixaAviao(this.x);
    // Reabastece dentro da área de abastecimento, que é maior que o corpo do posto.
    const sobrePosto = this.postos.some((p) => sobrepoe(caixa, caixaZonaPosto(p)));
    if (sobrePosto && this.combustivel < COMBUSTIVEL_MAXIMO) {
      this.combustivel = Math.min(COMBUSTIVEL_MAXIMO, this.combustivel + REABASTECIMENTO_POR_QUADRO);
      if (this.quadro % 12 === 0) this.eventos.push("reabastecer");
    }
    this.quadrosDesdeAlerta++;
    if (this.combustivel < LIMITE_COMBUSTIVEL_BAIXO && this.quadrosDesdeAlerta >= 60) {
      this.quadrosDesdeAlerta = 0;
      this.eventos.push("combustivel_baixo");
    }
  }

  private verificarColisoes(): void {
    if (this.invulneravel > 0) {
      this.invulneravel--;
      return;
    }
    const caixa = caixaAviao(this.x);
    const linha = this.rio.linhas[Y_AVIAO];
    const metade = AVIAO_LARGURA / 2;
    const bateuNaMargem = !linha || this.x - metade < linha.esquerda || this.x + metade > linha.direita;
    const bateuNoInimigo = this.inimigos.some((e) => sobrepoe(caixa, caixaInimigo(e)));
    const bateuNaPonte = this.pontes.some((p) => !p.destruida && sobrepoe(caixa, this.caixaTabuleiroDa(p)));
    if (bateuNaMargem || bateuNoInimigo || bateuNaPonte || this.combustivel <= 0) {
      this.cair();
    }
  }

  private atualizarNivel(): void {
    const nivelNovo = 1 + Math.floor(this.pontos / 500);
    if (nivelNovo !== this.nivel) {
      this.nivel = nivelNovo;
      this.rio.setNivel(nivelNovo);
      this.eventos.push("nivel");
    }
  }

  /** O avião cai: explosão, perde uma vida e espera antes de voltar. */
  private cair(): void {
    this.estado = "morrendo";
    this.contadorMorte = DURACAO_MORTE;
    this.explosoes.push(criarExplosao(this.x, Y_AVIAO, DURACAO_EXPLOSAO));
    this.vidas = Math.max(0, this.vidas - 1);
    this.tiros = [];
    this.eventos.push("explosao");
  }

  /** Volta ao jogo no centro da água, com combustível cheio e invulnerabilidade curta. */
  private renascer(): void {
    this.estado = "jogando";
    this.x = this.centroDaAgua();
    this.combustivel = COMBUSTIVEL_MAXIMO;
    this.invulneravel = DURACAO_INVULNERAVEL;
    this.inimigos = this.inimigos.filter((e) => Math.abs(e.y - Y_AVIAO) > 40);
  }
}

