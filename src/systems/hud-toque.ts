// Desenha a faixa de controles de toque. Só é chamada quando `usarHudToque()` é verdadeiro.
import type Phaser from "phaser";
import { ALTURA_JOGO, ALTURA_CONTROLES, LARGURA_TELA } from "../core/config.ts";
import { BOTOES_TOQUE } from "./entrada.ts";
// Cores do Phaser Graphics são números; a paleta de render usa texto CSS.
const PAINEL = 0x0a0f1f;

export function desenharHudToque(g: Phaser.GameObjects.Graphics): void {
  g.fillStyle(PAINEL, 1);
  g.fillRect(0, ALTURA_JOGO, LARGURA_TELA, ALTURA_CONTROLES);
  for (const botao of BOTOES_TOQUE) {
    g.fillStyle(0xffffff, 0.22);
    g.fillCircle(botao.x, botao.y, botao.raio);
    g.lineStyle(1, 0xffffff, 0.45);
    g.strokeCircle(botao.x, botao.y, botao.raio);
  }
}
