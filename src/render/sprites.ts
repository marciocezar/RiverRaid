// Desenho vetorial dos sprites em alta resolução. Coordenadas em unidades lógicas com a
// origem no centro do sprite; o atlas aplica a escala e centraliza. Cada função recebe o
// contexto já transformado e pinta: contorno escuro, preenchimento com gradiente e detalhes.
import { GLIFOS } from "./fonte.ts";

type G = CanvasRenderingContext2D;
export type Ponto = [number, number];

const CONTORNO = "#0d1017";

/** Espelha em x uma metade de polígono e junta as duas. `metade` vai do bico à cauda. */
function simetrico(metade: Ponto[]): Ponto[] {
  const espelho = metade
    .filter(([x]) => x !== 0)
    .map(([x, y]): Ponto => [-x, y])
    .reverse();
  return [...metade, ...espelho];
}

function poligono(g: G, pontos: Ponto[], preenchimento: string | CanvasGradient, espessura = 1.1): void {
  g.beginPath();
  pontos.forEach(([x, y], i) => (i === 0 ? g.moveTo(x, y) : g.lineTo(x, y)));
  g.closePath();
  g.fillStyle = preenchimento;
  g.fill();
  g.lineWidth = espessura;
  g.strokeStyle = CONTORNO;
  g.lineJoin = "round";
  g.stroke();
}

function elipse(g: G, x: number, y: number, rx: number, ry: number, preenchimento: string | CanvasGradient, espessura = 0.9): void {
  g.beginPath();
  g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  g.fillStyle = preenchimento;
  g.fill();
  g.lineWidth = espessura;
  g.strokeStyle = CONTORNO;
  g.stroke();
}

function retangulo(g: G, x: number, y: number, w: number, h: number, preenchimento: string | CanvasGradient, contorno = true): void {
  g.fillStyle = preenchimento;
  g.fillRect(x, y, w, h);
  if (contorno) {
    g.lineWidth = 0.8;
    g.strokeStyle = CONTORNO;
    g.strokeRect(x, y, w, h);
  }
}

function linha(g: G, x1: number, y1: number, x2: number, y2: number, cor: string, espessura: number): void {
  g.beginPath();
  g.moveTo(x1, y1);
  g.lineTo(x2, y2);
  g.strokeStyle = cor;
  g.lineWidth = espessura;
  g.lineCap = "round";
  g.stroke();
}

/** Avião de caça visto de cima, nariz para cima. Usado também nas vidas do HUD (com escala). */
export function desenharAviao(g: G): void {
  const corpo = simetrico([
    [0, -9.6], [2.1, -7.9], [2.5, -3.6], [2.4, -1.2], [8.7, 2.4], [9.5, 4.6],
    [2.8, 5.3], [3.2, 7.8], [4.7, 9.0], [1.7, 9.6], [0, 9.9],
  ]);
  const gradiente = g.createLinearGradient(-8, -9, 8, 9);
  gradiente.addColorStop(0, "#fff8c4");
  gradiente.addColorStop(0.55, "#f7c52b");
  gradiente.addColorStop(1, "#b97512");
  poligono(g, corpo, gradiente);

  // Linha de luz no eixo e nas bordas de ataque das asas.
  linha(g, 0, -7.4, 0, 7.6, "rgba(255,255,220,0.45)", 0.55);
  linha(g, 2.6, -0.6, 8.4, 2.4, "rgba(255,255,255,0.45)", 0.45);
  linha(g, -2.6, -0.6, -8.4, 2.4, "rgba(255,255,255,0.45)", 0.45);

  // Cabine: vidro com reflexo.
  const vidro = g.createLinearGradient(0, -6, 0, -1);
  vidro.addColorStop(0, "#f0fdff");
  vidro.addColorStop(1, "#2f8fca");
  elipse(g, 0, -3.4, 1.5, 2.7, vidro, 0.7);
  elipse(g, -0.5, -4.3, 0.45, 0.8, "rgba(255,255,255,0.85)", 0);

  // Bocais dos motores.
  elipse(g, -1.2, 8.6, 0.75, 0.95, "#3b2e12", 0.5);
  elipse(g, 1.2, 8.6, 0.75, 0.95, "#3b2e12", 0.5);
  elipse(g, -1.2, 8.7, 0.35, 0.45, "#ff9c2e", 0);
  elipse(g, 1.2, 8.7, 0.35, 0.45, "#ff9c2e", 0);
}

/** Helicóptero visto de cima: fuselagem, cabine, cauda, rotor de cauda e patins. */
export function desenharHelicoptero(g: G): void {
  // Patins e cauda ficam por baixo da fuselagem.
  g.lineCap = "round";
  linha(g, -5.0, -4.2, -5.0, 4.6, "#262c35", 1.2);
  linha(g, 5.0, -4.2, 5.0, 4.6, "#262c35", 1.2);
  const boom = g.createLinearGradient(-1, 0, 1, 0);
  boom.addColorStop(0, "#f2f5f8");
  boom.addColorStop(1, "#6c7480");
  retangulo(g, -1.0, 3.0, 2.0, 8.4, boom);
  poligono(g, simetrico([[0, 8.6], [2.8, 9.8], [2.6, 10.8], [0, 10.3]]), "#cdd4dd", 0.8);
  elipse(g, 0, 11.6, 2.1, 2.1, "#2a2f38", 0.7);
  elipse(g, 0, 11.6, 0.6, 0.6, "#c8d0da", 0);

  const corpo = g.createRadialGradient(-1.6, -2.4, 0.5, 0, 0, 7);
  corpo.addColorStop(0, "#e2fcec");
  corpo.addColorStop(0.45, "#4caf7a");
  corpo.addColorStop(1, "#1d5c48");
  elipse(g, 0, 0, 5.2, 6.4, corpo, 1.0);
  elipse(g, -1.8, -3.0, 2.0, 1.1, "rgba(255,255,255,0.22)", 0);

  const vidro = g.createLinearGradient(0, -5, 0, 0);
  vidro.addColorStop(0, "#f4feff");
  vidro.addColorStop(1, "#2b86bd");
  elipse(g, 0, -2.6, 3.6, 2.6, vidro, 0.8);
  elipse(g, -1.2, -3.4, 0.8, 0.45, "rgba(255,255,255,0.85)", 0);
}

/** Navio visto de cima, com o bico para a direita. */
export function desenharNavio(g: G): void {
  const casco = g.createLinearGradient(0, -4, 0, 4);
  casco.addColorStop(0, "#e6ecf4");
  casco.addColorStop(0.5, "#98a2b3");
  casco.addColorStop(1, "#4b5563");
  poligono(g, [[-10, -3.2], [4.4, -3.6], [8.2, -1.2], [10.6, 0], [8.2, 1.2], [4.4, 3.6], [-10, 3.2]], casco, 1.0);
  g.fillStyle = "#e5483a";
  g.fillRect(-9.4, -0.3, 16.6, 1.6);
  linha(g, 4.6, -3.1, 8.4, -1.1, "rgba(255,255,255,0.4)", 0.5);
  retangulo(g, -7.6, -2.2, 5.4, 4.4, "#c9d1de");
  retangulo(g, -2.0, -2.6, 4.6, 5.2, "#f5f6f8");
  for (const x of [-1.2, 0.2, 1.6]) retangulo(g, x, -1.4, 0.9, 0.9, "#2a2f38", false);
  retangulo(g, -0.4, -2.6, 1.2, 0.7, "#3d4450", false);
  elipse(g, -5.4, 0, 1.2, 1.2, "#2a2f38", 0.5);
  linha(g, -5.4, 0, -8.0, 0, "#2a2f38", 0.8);
}

/** Caça a jato em delta, pintado com o nariz para cima (o jogo o espelha). */
export function desenharJato(g: G): void {
  const corpo = simetrico([
    [0, -10], [1.5, -6.4], [1.9, -2.2], [9.6, 6.8], [2.6, 5.4], [1.3, 8.8], [0, 8.2],
  ]);
  const gradiente = g.createLinearGradient(0, -10, 0, 9);
  gradiente.addColorStop(0, "#8a93a4");
  gradiente.addColorStop(0.5, "#3a3f4b");
  gradiente.addColorStop(1, "#16181f");
  poligono(g, corpo, gradiente);
  poligono(g, [[6.9, 5.6], [9.6, 6.8], [9.0, 4.5]], "#e0463c", 0.6);
  poligono(g, [[-6.9, 5.6], [-9.6, 6.8], [-9.0, 4.5]], "#e0463c", 0.6);
  elipse(g, -1.7, -1.6, 0.8, 1.6, "#0a0c10", 0.4);
  elipse(g, 1.7, -1.6, 0.8, 1.6, "#0a0c10", 0.4);
  const vidro = g.createLinearGradient(0, -7, 0, -3);
  vidro.addColorStop(0, "#dff8ff");
  vidro.addColorStop(1, "#2a6f96");
  elipse(g, 0, -5.2, 1.1, 2.1, vidro, 0.6);
}

/** Posto de combustível: plataforma de concreto, tanque laranja e placa FUEL. */
export function desenharPosto(g: G): void {
  const concreto = g.createLinearGradient(0, -10, 0, 10);
  concreto.addColorStop(0, "#c4cbd8");
  concreto.addColorStop(1, "#5f6878");
  retangulo(g, -14, -9.5, 28, 19, concreto);
  for (const [x, y] of [[-13, -8.5], [11, -8.5], [-13, 6.5], [11, 6.5]] as const) {
    retangulo(g, x, y, 2, 2, "#4b5563", false);
  }

  const tanque = g.createLinearGradient(0, -4.2, 0, 4.4);
  tanque.addColorStop(0, "#ffdca8");
  tanque.addColorStop(0.5, "#f08a24");
  tanque.addColorStop(1, "#9c4d0b");
  retangulo(g, -10, -4.2, 20, 8.6, tanque);
  elipse(g, -10, 0.1, 1.5, 4.3, "#c76a18", 0.6);
  elipse(g, 10, 0.1, 1.5, 4.3, "#b25c14", 0.6);
  linha(g, -8.2, -3.0, 8.2, -3.0, "rgba(255,255,255,0.45)", 0.6);

  retangulo(g, -8.5, -3.2, 17, 6.4, "#f6f6f6");
  textoPixel(g, "FUEL", -7.5, -2.5, "#1b1b1b");
}

/** Texto em pixels de 1 unidade lógica, com a fonte 3x5 do jogo. */
function textoPixel(g: G, texto: string, x: number, y: number, cor: string): void {
  g.fillStyle = cor;
  let cursor = x;
  for (const caractere of texto) {
    const glifo = GLIFOS[caractere] ?? GLIFOS[" "]!;
    for (let linhaIndice = 0; linhaIndice < 5; linhaIndice++) {
      for (let coluna = 0; coluna < 3; coluna++) {
        if (glifo[linhaIndice]![coluna] === "1") g.fillRect(cursor + coluna, y + linhaIndice, 1, 1);
      }
    }
    cursor += 4;
  }
}

/** Árvore de três camadas com tronco. */
export function desenharArvore(g: G): void {
  retangulo(g, -0.8, 4.4, 1.6, 2.6, "#6b4a2a", false);
  const folhas = g.createLinearGradient(0, -6, 0, 5);
  folhas.addColorStop(0, "#5cc067");
  folhas.addColorStop(0.5, "#1e6b2e");
  folhas.addColorStop(1, "#0f4a1c");
  poligono(g, [[0, -6.6], [3.2, -1.6], [-3.2, -1.6]], folhas, 0.7);
  poligono(g, [[0, -3.8], [4.4, 1.6], [-4.4, 1.6]], folhas, 0.7);
  poligono(g, [[0, -0.4], [5.4, 4.8], [-5.4, 4.8]], folhas, 0.7);
}

/** Miniatura do avião para o HUD de vidas. */
export function desenharVida(g: G): void {
  g.save();
  g.scale(0.42, 0.42);
  desenharAviao(g);
  g.restore();
}

export const DESENHOS: Record<keyof typeof import("./tamanhos.ts").TAMANHOS, (g: G) => void> = {
  aviao: desenharAviao,
  helicoptero: desenharHelicoptero,
  navio: desenharNavio,
  jato: desenharJato,
  posto: desenharPosto,
  arvore: desenharArvore,
  vida: desenharVida,
};
