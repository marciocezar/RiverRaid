// Monta o quadro completo a partir do estado do Mundo. Só lê o estado; nunca altera nada.
import { Y_AVIAO } from "../core/config.ts";
import type { Mundo } from "../core/mundo.ts";
import type { Inimigo } from "../entities/inimigo.ts";
import { caixaZonaPosto, POSTO_ALTURA, POSTO_LARGURA, type Posto } from "../entities/posto.ts";
import type { Tiro } from "../entities/tiro.ts";
import { type Atlas, type Sprite } from "./atlas.ts";
import { desenharCenario } from "./cenario.ts";
import { COR } from "./cores.ts";
import { desenharChamaJato, desenharEsteira, desenharExplosao, desenharRotor, desenharZonaPosto } from "./efeitos.ts";
import { desenharPainel } from "./hud.ts";
import { desenharPonte } from "./ponte.ts";
import type { Quadro } from "./quadro.ts";
import { larguraTexto } from "./fonte.ts";

export function desenharMundo(q: Quadro, atlas: Atlas, mundo: Mundo): void {
  const t = mundo.quadro;
  desenharCenario(q, atlas, mundo.rio, mundo.distancia, t);

  for (const posto of mundo.postos) desenharPosto(q, atlas, posto, t);
  for (const ponte of mundo.pontes) desenharPonte(q, ponte, mundo.rio, t);
  for (const inimigo of mundo.inimigos) desenharInimigo(q, atlas, inimigo, t);
  for (const tiro of mundo.tiros) desenharTiro(q, tiro);

  if (mundo.estado === "jogando") {
    const piscar = mundo.invulneravel > 0 && Math.floor(t / 6) % 2 === 0;
    if (!piscar) desenharAviao(q, atlas, mundo.x);
  }

  for (const explosao of mundo.explosoes) desenharExplosao(q, explosao);
  desenharPainel(q, atlas, mundo, t);

  if (mundo.estado === "fim") desenharFimDeJogo(q, mundo.pontos);
}

/** Centraliza um sprite em (cx, cy) e desenha a sombra logo abaixo, se pedido. */
export function desenharCentrado(
  q: Quadro,
  sprite: Sprite,
  cx: number,
  cy: number,
  opcoes: { sombra?: boolean; espelharX?: boolean; espelharY?: boolean } = {},
): void {
  const x = cx - sprite.largura / 2;
  const y = cy - sprite.altura / 2;
  if (opcoes.sombra) q.sprite(sprite.sombra, x + 2, y + 3, sprite.largura, sprite.altura, { alpha: 1 });
  q.sprite(sprite.canvas, x, y, sprite.largura, sprite.altura, { espelharX: opcoes.espelharX, espelharY: opcoes.espelharY });
}

function desenharAviao(q: Quadro, atlas: Atlas, x: number): void {
  const sprite = atlas.sprites["aviao"];
  if (!sprite) return;
  desenharCentrado(q, sprite, x, Y_AVIAO, { sombra: true });
}

/** Posto: área de abastecimento com marcas de perigo, e o corpo com a placa FUEL por cima. */
function desenharPosto(q: Quadro, atlas: Atlas, posto: Posto, tempo: number): void {
  desenharZonaPosto(q, caixaZonaPosto(posto), tempo);
  const sprite = atlas.sprites["posto"];
  if (!sprite) return;
  desenharCentrado(q, sprite, posto.x + POSTO_LARGURA / 2, posto.y + POSTO_ALTURA / 2, { sombra: true });
}

function desenharInimigo(q: Quadro, atlas: Atlas, e: Inimigo, tempo: number): void {
  const cx = e.x + e.largura / 2;
  const cy = e.y + e.altura / 2;
  if (e.tipo === "navio") {
    const sprite = atlas.sprites["navio"];
    if (!sprite) return;
    desenharEsteira(q, e.x, e.y, e.largura, tempo);
    desenharCentrado(q, sprite, cx, cy, { sombra: true, espelharX: e.direcao < 0 });
  } else if (e.tipo === "helicoptero") {
    const sprite = atlas.sprites["helicoptero"];
    if (!sprite) return;
    desenharCentrado(q, sprite, cx, cy, { sombra: true });
    desenharRotor(q, cx, cy, tempo + e.x, 8);
  } else {
    const sprite = atlas.sprites["jato"];
    if (!sprite) return;
    // O jato desce a tela: nariz para baixo, chama na traseira (em cima).
    desenharChamaJato(q, cx, e.y, tempo);
    desenharCentrado(q, sprite, cx, cy, { sombra: true, espelharY: true });
  }
}

function desenharTiro(q: Quadro, tiro: Tiro): void {
  q.retangulo(tiro.x - 0.5, tiro.y - 2, 1, 4, COR.tiro);
  q.pixel(tiro.x, tiro.y - 3, COR.tiroPonta);
  q.pixel(tiro.x, tiro.y + 2, COR.tiro, 0.5);
  q.pixel(tiro.x, tiro.y + 3, COR.tiro, 0.25);
}

function desenharFimDeJogo(q: Quadro, pontos: number): void {
  q.retangulo(0, 52, q.largura, 60, "#000000", 0.6);
  const titulo = "FIM DE JOGO";
  const x = (q.largura - larguraTexto(titulo, 2)) / 2;
  q.texto(titulo, x + 1, 63, "#000000", 2, 0.8);
  q.texto(titulo, x, 62, COR.textoDestaque, 2);
  const placar = `PONTOS ${Math.floor(pontos)}`;
  q.texto(placar, (q.largura - larguraTexto(placar)) / 2, 88, COR.texto);
  const chamada = "PRESSIONE TIRO";
  q.texto(chamada, (q.largura - larguraTexto(chamada)) / 2, 100, COR.textoInfo);
}
