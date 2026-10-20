// Textura de 160x192 compartilhada pelas cenas. Criada uma vez por página.
import type Phaser from "phaser";
import { ALTURA_JOGO, LARGURA_TELA } from "../core/config.ts";
import { ESCALA } from "../render/escala.ts";
import { Quadro } from "../render/quadro.ts";

export const CHAVE_TELA = "tela";

export function obterTela(cena: Phaser.Scene): { textura: Phaser.Textures.CanvasTexture; quadro: Quadro } {
  if (!cena.textures.exists(CHAVE_TELA)) {
    cena.textures.createCanvas(CHAVE_TELA, LARGURA_TELA * ESCALA, ALTURA_JOGO * ESCALA);
  }
  const textura = cena.textures.get(CHAVE_TELA) as Phaser.Textures.CanvasTexture;
  return { textura, quadro: new Quadro(textura.getCanvas()) };
}

/**
 * Câmera em escala: o mundo de cena continua em coordenadas lógicas (160x192), e a câmera
 * amplia por ESCALA com origem no canto superior esquerdo, para o canvas sair com pixels reais.
 */
export function prepararCamera(cena: Phaser.Scene): void {
  cena.cameras.main.setOrigin(0, 0);
  cena.cameras.main.setZoom(ESCALA);
}

/** Converte um ponteiro para coordenadas lógicas da tela (desfaz o zoom da câmera). */
export function paraLogico(ponteiro: { x: number; y: number }, zoom: number): { x: number; y: number } {
  return { x: ponteiro.x / zoom, y: ponteiro.y / zoom };
}
