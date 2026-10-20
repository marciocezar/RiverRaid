// Tela inicial: rio rolando de fundo, avião sobrevoando e o título. O primeiro aperto de
// tiro libera o áudio e começa a partida.
import Phaser from "phaser";
import { ALTURA_JOGO, LARGURA_TELA, Y_AVIAO } from "../core/config.ts";
import { Rio } from "../core/rio.ts";
import { Rng } from "../core/rng.ts";
import { type Atlas, obterAtlas } from "../render/atlas.ts";
import { desenharCenario } from "../render/cenario.ts";
import { desenharCentrado } from "../render/desenho.ts";
import { COR } from "../render/cores.ts";
import { larguraTexto } from "../render/fonte.ts";
import { Quadro } from "../render/quadro.ts";
import { LeitorEntrada } from "../systems/entrada.ts";
import { desenharHudToque } from "../systems/hud-toque.ts";
import { som } from "../systems/instancias.ts";
import { usarHudToque } from "../plataforma.ts";
import { CHAVE_TELA, obterTela, paraLogico, prepararCamera } from "./tela.ts";
import { ESCALA } from "../render/escala.ts";

export class CenaTitulo extends Phaser.Scene {
  private leitor!: LeitorEntrada;
  private quadro!: Quadro;
  private textura!: Phaser.Textures.CanvasTexture;
  private atlas!: Atlas;
  private rio!: Rio;
  private distancia = 0;
  private tempo = 0;
  private tiroAnterior = false;

  constructor() {
    super("titulo");
  }

  create(): void {
    const tela = obterTela(this);
    this.textura = tela.textura;
    this.quadro = tela.quadro;
    prepararCamera(this);
    this.add.image(0, 0, CHAVE_TELA).setOrigin(0, 0).setScale(1 / ESCALA);
    this.atlas = obterAtlas();
    this.rio = new Rio(new Rng(0x7a11), 1);
    this.distancia = 0;
    this.tempo = 0;
    this.leitor = new LeitorEntrada(this, usarHudToque());
    this.tiroAnterior = false;
    // Tocar na linha de som liga ou desliga o áudio (equivale à tecla M).
    this.input.on("pointerdown", (ponteiro: Phaser.Input.Pointer) => {
      const p = paraLogico(ponteiro, this.cameras.main.zoom);
      if (p.y >= 160 && p.y < 172) {
        som.desbloquear();
        som.alternar();
      }
    });
    this.input.keyboard?.addCapture("SPACE,UP,DOWN,LEFT,RIGHT");
    if (usarHudToque()) desenharHudToque(this.add.graphics());
  }

  update(_tempo: number, delta: number): void {
    this.tempo += delta / (1000 / 60);
    // Rio rolando a 2 linhas por quadro, a velocidade inicial da partida.
    for (let i = 0; i < 2; i++) this.rio.avancar();
    this.distancia += 2;

    const tiro = this.leitor.tiroPressionado();
    if (tiro && !this.tiroAnterior) {
      som.desbloquear();
      this.scene.start("jogo");
      return;
    }
    this.tiroAnterior = tiro;
    this.desenhar();
    this.textura.refresh();
  }

  private desenhar(): void {
    const q = this.quadro;
    const t = Math.floor(this.tempo);
    desenharCenario(q, this.atlas, this.rio, this.distancia, t);

    // Avião sobrevoando a água em oscilação suave.
    const sprite = this.atlas.sprites["aviao"];
    if (sprite) {
      const x = LARGURA_TELA / 2 + Math.sin(this.tempo / 40) * 28;
      desenharCentrado(q, sprite, x, Y_AVIAO - 20, { sombra: true });
    }

    // Faixa escura atrás do texto.
    q.retangulo(0, 26, LARGURA_TELA, 96, "#000000", 0.45);

    // Logotipo em escala 3: cada letra ondula levemente, com sombra e contorno.
    const titulo = "RIVER RAID";
    const escala = 3;
    const x0 = (LARGURA_TELA - larguraTexto(titulo, escala)) / 2;
    let x = x0;
    for (let i = 0; i < titulo.length; i++) {
      const letra = titulo[i]!;
      const ondulacao = Math.round(Math.sin(this.tempo / 14 + i * 0.7) * 1.5);
      q.texto(letra, x + 2, 36 + ondulacao + 2, "#000000", escala, 0.85);
      q.texto(letra, x, 36 + ondulacao, COR.textoDestaque, escala);
      x += 4 * escala;
    }

    const subtitulo = "MRC";
    q.texto(subtitulo, (LARGURA_TELA - larguraTexto(subtitulo)) / 2, 66, COR.texto);

    const linhas = usarHudToque()
      ? ["ESQUERDA/DIREITA: MOVER", "CIMA/BAIXO: VELOCIDADE", "BOTAO DA DIREITA: ATIRAR"]
      : ["SETAS: MOVER", "CIMA/BAIXO: VELOCIDADE", "ESPACO: ATIRAR"];
    linhas.forEach((texto, i) => {
      q.texto(texto, (LARGURA_TELA - larguraTexto(texto)) / 2, 88 + i * 9, COR.textoInfo);
    });

    if (Math.floor(this.tempo / 25) % 2 === 0) {
      const chamada = usarHudToque() ? "TOQUE NO TIRO PARA INICIAR" : "PRESSIONE ESPACO";
      q.texto(chamada, (LARGURA_TELA - larguraTexto(chamada)) / 2, 150, COR.textoDestaque);
    }

    // Rodapé com a versão do jogo.
    // Estado do som: explica por que não há som ainda, e como ligar ou desligar.
    const linhaSom = textoDoSom();
    q.texto(linhaSom, (LARGURA_TELA - larguraTexto(linhaSom)) / 2, 164, corDoSom());

    const versao = "VERSAO 1.0";
    q.texto(versao, (LARGURA_TELA - larguraTexto(versao)) / 2, ALTURA_JOGO - 8, COR.textoSuave);
  }
}

/** Texto da linha de som, conforme o estado do áudio. */
function textoDoSom(): string {
  switch (som.estado()) {
    case "desligado":
      return "SOM DESLIGADO: TOQUE AQUI OU M";
    case "aguardando":
      return "TOQUE NA TELA PARA ATIVAR O SOM";
    default:
      return "SOM LIGADO: TOQUE AQUI OU M";
  }
}

function corDoSom(): string {
  return som.estado() === "aguardando" ? COR.textoDestaque : COR.textoInfo;
}
