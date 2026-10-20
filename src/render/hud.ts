// Painel de baixo: pontuação, vidas como mini aviões, nível e medidor de combustível
// com ícone de galão. Alinhado a uma grade de 4 pixels para ficar limpo.
import { COMBUSTIVEL_MAXIMO } from "../core/config.ts";
import type { Mundo } from "../core/mundo.ts";
import type { Atlas } from "./atlas.ts";
import { COR } from "./cores.ts";
import { larguraTexto } from "./fonte.ts";
import type { Quadro } from "./quadro.ts";

const ALTURA_PAINEL = 16;

export function desenharPainel(q: Quadro, atlas: Atlas, mundo: Mundo, tempo: number): void {
  const y0 = q.altura - ALTURA_PAINEL;
  const yTexto = y0 + 5;

  // Moldura: linha de luz no topo, fundo escuro e sombra no limite com o rio.
  q.retangulo(0, y0, q.largura, ALTURA_PAINEL, COR.painel);
  q.retangulo(0, y0, q.largura, 1, COR.painelBorda);
  q.retangulo(0, y0 + 1, q.largura, 1, "#16203d", 0.8);

  // Pontuação: rótulo discreto e número em destaque, com zeros à esquerda.
  const pontos = String(Math.floor(mundo.pontos)).padStart(5, "0");
  q.texto("PTS", 4, yTexto, COR.textoSuave);
  q.texto(pontos, 18, yTexto, COR.textoDestaque);

  // Vidas: mini aviões, no máximo três.
  const vida = atlas.sprites["vida"];
  if (vida) {
    for (let i = 0; i < Math.max(0, mundo.vidas); i++) {
      q.sprite(vida.canvas, 56 + i * 10, y0 + 4, vida.largura, vida.altura);
    }
  }

  // Nível em uma pequena etiqueta.
  const rotulo = `N${mundo.nivel}`;
  const larg = larguraTexto(rotulo) + 4;
  q.retangulo(90, y0 + 4, larg, 8, "#1d2540");
  q.texto(rotulo, 92, yTexto, COR.textoInfo);

  // Combustível: ícone de galão, barra com borda, marcas e cor pela faixa.
  const xIcone = 112;
  desenharGalao(q, xIcone, y0 + 4);
  const bx = 119;
  const bl = 35;
  q.retangulo(bx - 1, y0 + 3, bl + 2, 9, "#2d3a66");
  q.retangulo(bx, y0 + 4, bl, 7, COR.combustivelVazio);
  const proporcao = mundo.combustivel / COMBUSTIVEL_MAXIMO;
  const cor = proporcao > 0.5 ? COR.combustivelAlto : proporcao > 0.25 ? COR.combustivelMedio : COR.combustivelBaixo;
  const piscar = proporcao <= 0.25 && Math.floor(tempo / 12) % 2 === 0;
  if (!piscar) {
    q.retangulo(bx, y0 + 4, Math.round(bl * proporcao), 7, cor);
    // Brilho de uma linha no topo do preenchimento.
    q.retangulo(bx, y0 + 4, Math.round(bl * proporcao), 1, "#ffffff", 0.35);
  }
  for (const marca of [0.25, 0.5, 0.75]) {
    q.retangulo(bx + Math.round(bl * marca), y0 + 4, 1, 2, COR.painel, 0.9);
    q.retangulo(bx + Math.round(bl * marca), y0 + 9, 1, 2, COR.painel, 0.9);
  }
}

/** Ícone de galão de combustível, 5x7 pixels. */
function desenharGalao(q: Quadro, x: number, y: number): void {
  q.retangulo(x + 1, y, 3, 1, "#9aa3b5");
  q.retangulo(x, y + 1, 5, 6, "#e53935");
  q.retangulo(x, y + 1, 1, 6, "#ff8a80", 0.6);
  q.retangulo(x + 1, y + 3, 3, 2, "#fff3a6");
}
