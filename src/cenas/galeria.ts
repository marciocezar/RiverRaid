// Tela de revisão da arte, acessível com ?galeria na URL. Mostra cada objeto, a ponte
// intacta e destruída, e os quadros de uma explosão, no mesmo quadro 160x192 do jogo.
import Phaser from "phaser";
import { LARGURA_TELA } from "../core/config.ts";
import { Rio } from "../core/rio.ts";
import { Rng } from "../core/rng.ts";
import { type Atlas, obterAtlas } from "../render/atlas.ts";
import type { NomeSprite } from "../render/tamanhos.ts";
import { desenharCenario } from "../render/cenario.ts";
import { desenharCentrado } from "../render/desenho.ts";
import { desenharChamaJato, desenharEsteira, desenharExplosao, desenharRotor, desenharZonaPosto } from "../render/efeitos.ts";
import { caixaZonaPosto, POSTO_ALTURA, POSTO_LARGURA } from "../entities/posto.ts";
import { larguraTexto } from "../render/fonte.ts";
import { desenharPonte } from "../render/ponte.ts";
import { Quadro } from "../render/quadro.ts";
import { DURACAO_QUEDA_PONTE } from "../entities/ponte.ts";
import { CHAVE_TELA, obterTela, prepararCamera } from "./tela.ts";
import { ESCALA } from "../render/escala.ts";

export class CenaGaleria extends Phaser.Scene {
  private quadro!: Quadro;
  private textura!: Phaser.Textures.CanvasTexture;
  private atlas!: Atlas;
  private rio!: Rio;
  private tempo = 0;

  constructor() {
    super("galeria");
  }

  create(): void {
    const tela = obterTela(this);
    this.textura = tela.textura;
    this.quadro = tela.quadro;
    prepararCamera(this);
    this.add.image(0, 0, CHAVE_TELA).setOrigin(0, 0).setScale(1 / ESCALA);
    this.atlas = obterAtlas();
    this.rio = new Rio(new Rng(0x3131), 1);
  }

  update(_tempo: number, delta: number): void {
    this.tempo += delta / (1000 / 60);
    this.desenhar();
    this.textura.refresh();
  }

  private desenhar(): void {
    const q = this.quadro;
    const t = Math.floor(this.tempo);
    desenharCenario(q, this.atlas, this.rio, t * 0.5, t);

    // Ponte intacta, em cima.
    desenharPonte(q, { y: 6, destruida: false, tempoQueda: 0 }, this.rio, t);
    // Ponte destruída, animação de queda (fase em loop).
    const queda = (t % 120);
    desenharPonte(q, { y: 26, destruida: true, tempoQueda: queda }, this.rio, t);

    // Fileira de objetos, um por coluna.
    const sprites: [NomeSprite, number][] = [["aviao", 20], ["helicoptero", 42], ["navio", 66], ["jato", 88], ["posto", 116]];
    const y = 66;
    for (const [nome, x] of sprites) {
      const s = this.atlas.sprites[nome];
      if (!s) continue;
      if (nome === "helicoptero") {
        desenharCentrado(q, s, x, y, { sombra: true });
        desenharRotor(q, x, y, t, 8);
      } else if (nome === "navio") {
        desenharEsteira(q, x - 6, y - 2, 13, t);
        desenharCentrado(q, s, x, y, { sombra: true });
      } else if (nome === "jato") {
        desenharChamaJato(q, x, y - 6, t);
        desenharCentrado(q, s, x, y, { sombra: true, espelharY: true });
      } else if (nome === "posto") {
        desenharZonaPosto(q, caixaZonaPosto({ x: x - POSTO_LARGURA / 2, y: y - POSTO_ALTURA / 2 }), t);
        desenharCentrado(q, s, x, y, { sombra: true });
      } else {
        desenharCentrado(q, s, x, y, { sombra: true });
      }
    }

    // Fileira de explosões em fases diferentes.
    for (let i = 0; i < 4; i++) {
      const fase = ((t + i * 10) % 40);
      desenharExplosao(q, { x: 24 + i * 36, y: 108, tempo: 40 - fase, duracao: 40 });
    }

    // Vidas e rótulos.
    const vida = this.atlas.sprites["vida"];
    if (vida) for (let i = 0; i < 3; i++) desenharCentrado(q, vida, 24 + i * 12, 132, { sombra: true });
    q.texto("GALERIA DA ARTE", (LARGURA_TELA - larguraTexto("GALERIA DA ARTE")) / 2, 146, "#ffe066");
    q.texto(`QUEDA ${DURACAO_QUEDA_PONTE}`, 4, 160, "#7fdcff");
  }
}
