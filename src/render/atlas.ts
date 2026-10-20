// Gera os sprites em alta resolução (ESCALA vezes os pixels lógicos), a sombra projetada
// de cada um e os padrões de água e grama que rolam com o rio. Roda só no navegador.
import { ESCALA } from "./escala.ts";
import { DESENHOS } from "./sprites.ts";
import { TAMANHOS, type NomeSprite } from "./tamanhos.ts";

export interface Sprite {
  canvas: HTMLCanvasElement;
  /** Silhueta escura e translúcida, desenhada deslocada embaixo do sprite. */
  sombra: HTMLCanvasElement;
  /** Tamanho lógico (em pixels da tela de jogo). O canvas tem ESCALA vezes mais pixels. */
  largura: number;
  altura: number;
}

export interface Atlas {
  sprites: Record<NomeSprite, Sprite>;
  agua: CanvasPattern;
  grama: CanvasPattern;
}

/** Tamanho do ladrilho de padrão em pixels reais. Ele é exibido na metade, em unidades lógicas. */
export const LADRILHO = 32;

function criarCanvas(largura: number, altura: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(largura);
  canvas.height = Math.round(altura);
  return canvas;
}

function ctxDe(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D indisponível");
  ctx.imageSmoothingEnabled = true;
  return ctx;
}

function criarSombra(origem: HTMLCanvasElement): HTMLCanvasElement {
  const sombra = criarCanvas(origem.width, origem.height);
  const ctx = ctxDe(sombra);
  ctx.drawImage(origem, 0, 0);
  ctx.globalCompositeOperation = "source-in";
  ctx.fillStyle = "rgba(0, 0, 0, 0.42)";
  ctx.fillRect(0, 0, sombra.width, sombra.height);
  return sombra;
}

/** Sprite: canvas em ESCALA x, origem no centro, desenho em unidades lógicas. */
function montarSprite(nome: NomeSprite): Sprite {
  const { largura, altura } = TAMANHOS[nome];
  const canvas = criarCanvas(largura * ESCALA, altura * ESCALA);
  const ctx = ctxDe(canvas);
  ctx.setTransform(ESCALA, 0, 0, ESCALA, (largura * ESCALA) / 2, (altura * ESCALA) / 2);
  DESENHOS[nome](ctx);
  return { canvas, sombra: criarSombra(canvas), largura, altura };
}

/** Padrão de água: fundo azul com ondulações em arco, em ladrilho seamless de LADRILHO px. */
function criarPadraoAgua(): HTMLCanvasElement {
  const tile = criarCanvas(LADRILHO, LADRILHO);
  const ctx = ctxDe(tile);
  ctx.fillStyle = "#2d55c6";
  ctx.fillRect(0, 0, LADRILHO, LADRILHO);
  const ondas: [number, number, number, string][] = [
    [6, 7, 3.2, "#5a86ea"], [22, 15, 4.0, "#4f7ce6"], [9, 24, 3.6, "#5a86ea"],
    [26, 28, 2.6, "#4f7ce6"], [15, 4, 2.4, "#3b66d4"],
  ];
  for (const [x, y, r, cor] of ondas) {
    ctx.strokeStyle = cor;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(x, y, r, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
  }
  ctx.fillStyle = "#2446ad";
  for (const [x, y] of [[13, 19], [29, 4], [3, 14]] as const) ctx.fillRect(x, y, 2, 1);
  return tile;
}

/** Padrão de grama: tufos claros e escuros e algumas flores, em ladrilho seamless. */
function criarPadraoGrama(): HTMLCanvasElement {
  const tile = criarCanvas(LADRILHO, LADRILHO);
  const ctx = ctxDe(tile);
  ctx.fillStyle = "#2f9c3f";
  ctx.fillRect(0, 0, LADRILHO, LADRILHO);
  // Gerador determinístico: o padrão é sempre o mesmo, em qualquer build.
  let semente = 0x9e3779b1;
  const sorteio = (): number => {
    semente = (Math.imul(semente, 1664525) + 1013904223) >>> 0;
    return semente / 0xffffffff;
  };
  for (let i = 0; i < 46; i++) {
    const x = sorteio() * LADRILHO;
    const y = sorteio() * LADRILHO;
    const claro = sorteio() < 0.55;
    ctx.strokeStyle = claro ? "#4ec260" : "#23803a";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (sorteio() - 0.5) * 2.4, y - 2 - sorteio() * 1.5);
    ctx.stroke();
  }
  for (const [x, y, cor] of [[7, 12, "#ffe066"], [24, 21, "#ffffff"], [17, 29, "#ffe066"]] as const) {
    ctx.fillStyle = cor;
    ctx.fillRect(x, y, 1, 1);
  }
  return tile;
}

let cache: Atlas | null = null;

/** Atlas único por página. Chamadas seguintes devolvem o mesmo objeto. */
export function obterAtlas(): Atlas {
  if (cache) return cache;
  const sprites = {} as Record<NomeSprite, Sprite>;
  for (const nome of Object.keys(TAMANHOS) as NomeSprite[]) {
    sprites[nome] = montarSprite(nome);
  }
  const ctxTemp = ctxDe(criarCanvas(1, 1));
  cache = {
    sprites,
    agua: ctxTemp.createPattern(criarPadraoAgua(), "repeat")!,
    grama: ctxTemp.createPattern(criarPadraoGrama(), "repeat")!,
  };
  return cache;
}
