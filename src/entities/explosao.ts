// Explosão temporária: aparece quando algo é atingido ou o avião cai.
export interface Explosao {
  x: number;
  y: number;
  tempo: number;
  duracao: number;
}

export function criarExplosao(x: number, y: number, duracao: number): Explosao {
  return { x, y, tempo: duracao, duracao };
}
