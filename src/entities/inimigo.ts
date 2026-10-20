// Inimigos que aparecem sobre a água: navios, helicópteros e jatos.
import { ALTURA_JOGO } from "../core/config.ts";
import type { Rio } from "../core/rio.ts";
import type { Caixa } from "./caixa.ts";

export type TipoInimigo = "navio" | "helicoptero" | "jato";

export interface Inimigo {
  tipo: TipoInimigo;
  x: number;
  y: number;
  direcao: -1 | 1;
  largura: number;
  altura: number;
  pontos: number;
}

export const ESPECIFICACAO_INIMIGOS: Record<TipoInimigo, { largura: number; altura: number; pontos: number }> = {
  navio: { largura: 20, altura: 8, pontos: 30 },
  helicoptero: { largura: 11, altura: 13, pontos: 60 },
  jato: { largura: 15, altura: 15, pontos: 80 },
};

export function criarInimigo(tipo: TipoInimigo, x: number, y: number, direcao: -1 | 1): Inimigo {
  const e = ESPECIFICACAO_INIMIGOS[tipo];
  return { tipo, x, y, direcao, largura: e.largura, altura: e.altura, pontos: e.pontos };
}

export function caixaInimigo(e: Inimigo): Caixa {
  return { x: e.x, y: e.y, largura: e.largura, altura: e.altura };
}

/** Faixa de água, em pixels, que a linha y oferece ao inimigo. */
function limitesNaAgua(rio: Rio, y: number, largura: number): [number, number] {
  const linha = rio.linhas[Math.max(0, Math.min(ALTURA_JOGO - 1, Math.floor(y)))];
  if (!linha) return [0, 0];
  return [linha.esquerda, linha.direita - largura];
}

/**
 * Anda o inimigo um quadro. O rio já foi rolado por `rolagem` linhas, então
 * o inimigo desce o mesmo tanto. Navios patrulham a água, helicópteros seguem
 * o avião devagar e jatos descem mais rápido que o rio.
 */
export function atualizarInimigo(
  e: Inimigo,
  rio: Rio,
  xAviao: number,
  rolagem: number,
): void {
  e.y += rolagem;
  if (e.tipo === "navio") {
    e.x += 0.4 * e.direcao;
  } else if (e.tipo === "helicoptero") {
    const diferenca = xAviao - e.x;
    e.x += Math.max(-0.3, Math.min(0.3, diferenca * 0.05));
  } else {
    e.y += 0.5;
  }
  const [minimo, maximo] = limitesNaAgua(rio, e.y, e.largura);
  if (e.x < minimo) {
    e.x = minimo;
    e.direcao = 1;
  } else if (e.x > maximo) {
    e.x = maximo;
    e.direcao = -1;
  }
}
