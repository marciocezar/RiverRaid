// Ponte de treliça: tabuleiro com gradiente, treliça em diagonal, pilares nas margens,
// luzes de sinalização com brilho e o miolo vermelho que pulsa enquanto está intacta.
// Quando destruída, as duas metades caem em velocidades diferentes e somem aos poucos.
import { Rio } from "../core/rio.ts";
import { DURACAO_QUEDA_PONTE, NUCLEO_LARGURA, PONTE_ALTURA, type Ponte } from "../entities/ponte.ts";
import { COR } from "./cores.ts";
import type { Quadro } from "./quadro.ts";

interface LinhaPonte {
  y: number;
  esquerda: number;
  direita: number;
}

export function desenharPonte(q: Quadro, ponte: Ponte, rio: Rio, tempo: number): void {
  const linhas = linhasDaPonte(ponte, rio);
  if (linhas.length < 2) return;
  const meio = linhas[Math.floor(linhas.length / 2)]!;
  const centro = (meio.esquerda + meio.direita) / 2;
  const nucleoEsq = Math.round(centro - NUCLEO_LARGURA / 2);
  const nucleoDir = nucleoEsq + NUCLEO_LARGURA;

  const queda = ponte.destruida ? ponte.tempoQueda : 0;
  const alpha = ponte.destruida ? Math.max(0, 1 - queda / DURACAO_QUEDA_PONTE) : 1;
  const deslocEsq = ponte.destruida ? Math.min(queda * 0.9, 46) : 0;
  const deslocDir = ponte.destruida ? Math.min(queda * 0.63, 32) : 0;

  if (!ponte.destruida) desenharSombraNaAgua(q, linhas);
  if (!ponte.destruida) desenharPilares(q, linhas);

  desenharMetade(q, linhas, "esquerda", nucleoEsq, deslocEsq, alpha);
  desenharMetade(q, linhas, "direita", nucleoDir, deslocDir, alpha);
  desenharNucleo(q, linhas, nucleoEsq, nucleoDir, ponte, tempo, alpha);
  if (!ponte.destruida) desenharLuzes(q, linhas, tempo);
}

function linhasDaPonte(ponte: Ponte, rio: Rio): LinhaPonte[] {
  const y0 = Math.round(ponte.y);
  const linhas: LinhaPonte[] = [];
  for (let i = 0; i < PONTE_ALTURA; i++) {
    const linha = rio.linhas[y0 + i];
    if (linha) linhas.push({ y: y0 + i, esquerda: linha.esquerda, direita: linha.direita });
  }
  return linhas;
}

/** Sombra suave da ponte sobre a água, deslocada para baixo e para a direita. */
function desenharSombraNaAgua(q: Quadro, linhas: LinhaPonte[]): void {
  const pontos: [number, number][] = [];
  for (const l of linhas) pontos.push([l.esquerda + 2, l.y + 2]);
  for (let i = linhas.length - 1; i >= 0; i--) pontos.push([linhas[i]!.direita + 2, linhas[i]!.y + 2]);
  q.poligono(pontos, COR.sombra, 0.28);
}

/** Metade do tabuleiro (esquerda ou direita do miolo), com gradiente, treliça e borda. */
function desenharMetade(q: Quadro, linhas: LinhaPonte[], lado: "esquerda" | "direita", limite: number, deslocY: number, alpha: number): void {
  const y0 = linhas[0]!.y;
  const y1 = linhas[linhas.length - 1]!.y + 1;
  const gradiente = q.gradienteVertical(y0, y1, [
    [0, "#f4f8fb"],
    [0.22, "#b9c3d0"],
    [0.6, "#7f8a9b"],
    [1, "#2b313b"],
  ]);
  const pontos: [number, number][] = [];
  if (lado === "esquerda") {
    for (const l of linhas) pontos.push([l.esquerda, l.y + deslocY]);
    for (let i = linhas.length - 1; i >= 0; i--) pontos.push([limite, linhas[i]!.y + deslocY]);
  } else {
    for (const l of linhas) pontos.push([limite, l.y + deslocY]);
    for (let i = linhas.length - 1; i >= 0; i--) pontos.push([linhas[i]!.direita, linhas[i]!.y + deslocY]);
  }
  q.poligono(pontos, gradiente, alpha, "#12151c");

  // Treliça: diagonais finas entre o trilho e a base do tabuleiro.
  const topo = y0 + deslocY + 1;
  const base = y1 + deslocY - 1;
  const inicio = lado === "esquerda" ? linhas[0]!.esquerda : limite;
  const fim = lado === "esquerda" ? limite : linhas[0]!.direita;
  for (let x = inicio + 3; x < fim - 3; x += 7) {
    q.segmento(x, topo + 1, x + 6, base - 1, "rgba(40,46,56,0.55)", 0.5, alpha);
    q.segmento(x + 6, topo + 1, x, base - 1, "rgba(40,46,56,0.35)", 0.5, alpha);
  }
  // Trilho superior mais claro e guarda-corpo.
  q.segmento(inicio, topo, fim, topo, "rgba(255,255,255,0.7)", 0.6, alpha);
}

/** Miolo vermelho, centrado: pisca e tem brilho enquanto a ponte está intacta. */
function desenharNucleo(q: Quadro, linhas: LinhaPonte[], esq: number, dir: number, ponte: Ponte, tempo: number, alpha: number): void {
  const y0 = linhas[0]!.y + 2;
  const y1 = linhas[linhas.length - 1]!.y - 2;
  const deslocY = ponte.destruida ? Math.min(ponte.tempoQueda * 0.9, 46) : 0;
  if (ponte.destruida) {
    q.poligono([[esq, y0 + deslocY], [dir, y0 + deslocY], [dir, y1 + deslocY], [esq, y1 + deslocY]], COR.nucleoApagado, alpha);
    return;
  }
  const pulso = 0.5 + 0.5 * Math.sin(tempo / 6);
  q.brilho((esq + dir) / 2, (y0 + y1) / 2, 9, [
    [0, `rgba(255, 60, 48, ${0.55 + 0.25 * pulso})`],
    [1, "rgba(255, 60, 48, 0)"],
  ], alpha);
  const gradiente = q.gradienteVertical(y0, y1, [
    [0, pulso > 0.5 ? "#ff6a5a" : "#ff4a3d"],
    [1, "#b71c1c"],
  ]);
  q.poligono([[esq, y0], [dir, y0], [dir, y1], [esq, y1]], gradiente, alpha, "#3a0d0a");
}

/** Luzes de sinalização no trilho, acesas em alternância. Pequenos discos com brilho. */
function desenharLuzes(q: Quadro, linhas: LinhaPonte[], tempo: number): void {
  const meio = linhas[Math.floor(linhas.length / 2)]!;
  const y = linhas[0]!.y + 0.5;
  let contador = 0;
  for (let x = meio.esquerda + 5; x < meio.direita - 4; x += 12) {
    const acesa = (Math.floor(tempo / 10) + contador) % 2 === 0;
    if (acesa) {
      q.brilho(x, y, 2.4, [[0, "rgba(255, 243, 166, 0.9)"], [1, "rgba(255, 243, 166, 0)"]]);
    }
    q.circulo(x, y, 0.9, acesa ? COR.ponteLuz : COR.ponteLuzApagada);
    contador++;
  }
}

/** Sombra escura sobre a água que cai junto à margem; pilares que descem sobre as margens. */
function desenharPilares(q: Quadro, linhas: LinhaPonte[]): void {
  const meio = linhas[Math.floor(linhas.length / 2)]!;
  const topo = linhas[0]!.y - 2;
  const base = linhas[linhas.length - 1]!.y + 3;
  const gradiente = q.gradienteVertical(topo, base, [
    [0, "#5b6474"],
    [1, COR.pilar],
  ]);
  q.poligono([[meio.esquerda - 5, topo], [meio.esquerda - 1, topo], [meio.esquerda - 1, base], [meio.esquerda - 5, base]], gradiente, 1, "#12151c");
  q.poligono([[meio.direita + 1, topo], [meio.direita + 5, topo], [meio.direita + 5, base], [meio.direita + 1, base]], gradiente, 1, "#12151c");
}
