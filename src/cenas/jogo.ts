// Cena da partida: passo fixo de 60 quadros por segundo, independente da taxa de tela.
// Tudo é pintado no framebuffer 160x192 e mostrado como textura do Phaser.
import Phaser from "phaser";
import { QUADROS_POR_SEGUNDO } from "../core/config.ts";
import { Mundo } from "../core/mundo.ts";
import { type Atlas, obterAtlas } from "../render/atlas.ts";
import { desenharMundo } from "../render/desenho.ts";
import { Quadro } from "../render/quadro.ts";
import { LeitorEntrada } from "../systems/entrada.ts";
import { desenharHudToque } from "../systems/hud-toque.ts";
import { som } from "../systems/instancias.ts";
import { usarHudToque } from "../plataforma.ts";
import { CHAVE_TELA, obterTela, prepararCamera } from "./tela.ts";
import { ESCALA } from "../render/escala.ts";

const PASSO_MS = 1000 / QUADROS_POR_SEGUNDO;
/** Quadros antes de aceitar o tiro para recomeçar depois do fim de jogo. */
const ESPERA_REINICIO = 60;

export class CenaJogo extends Phaser.Scene {
  private mundo!: Mundo;
  private leitor!: LeitorEntrada;
  private quadro!: Quadro;
  private textura!: Phaser.Textures.CanvasTexture;
  private atlas!: Atlas;
  private hud!: Phaser.GameObjects.Graphics;
  private acumulador = 0;
  private quadrosDesdeFim = 0;
  private tiroAnterior = false;

  constructor() {
    super("jogo");
  }

  create(): void {
    const tela = obterTela(this);
    this.textura = tela.textura;
    this.quadro = tela.quadro;
    prepararCamera(this);
    this.add.image(0, 0, CHAVE_TELA).setOrigin(0, 0).setScale(1 / ESCALA);
    this.atlas = obterAtlas();
    this.mundo = new Mundo(Math.floor(Math.random() * 0xfffe) + 1);
    this.leitor = new LeitorEntrada(this, usarHudToque());
    this.hud = this.add.graphics();
    this.acumulador = 0;
    this.quadrosDesdeFim = 0;
    this.tiroAnterior = true; // o tiro que começou a partida não conta como novo
    this.input.keyboard?.addCapture("SPACE,UP,DOWN,LEFT,RIGHT");
    if (usarHudToque()) desenharHudToque(this.hud);
  }

  update(_tempo: number, delta: number): void {
    this.acumulador += delta;
    while (this.acumulador >= PASSO_MS) {
      this.acumulador -= PASSO_MS;
      this.passo();
    }
    desenharMundo(this.quadro, this.atlas, this.mundo);
    this.textura.refresh();
  }

  private passo(): void {
    const entrada = this.leitor.ler();
    if (this.mundo.estado === "fim") {
      this.quadrosDesdeFim++;
      if (this.quadrosDesdeFim > ESPERA_REINICIO && entrada.tiro && !this.tiroAnterior) {
        this.scene.restart();
        return;
      }
      this.tiroAnterior = entrada.tiro;
      return;
    }
    this.mundo.atualizar(entrada);
    som.processar(this.mundo.eventos);
    som.motor(this.mundo.velocidade, this.mundo.estado === "jogando" && this.mundo.combustivel > 0);
    this.tiroAnterior = entrada.tiro;
  }
}
