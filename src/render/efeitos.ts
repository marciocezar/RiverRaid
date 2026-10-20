// Efeitos temporários: explosões em camadas, rotor girando, rastro de espuma e chama do jato.
import type { Explosao } from "../entities/explosao.ts";
import { COR } from "./cores.ts";
import type { Quadro } from "./quadro.ts";

/** Explosão em camadas: brilho externo, núcleo quente, anel de choque, fumaça e faíscas. */
export function desenharExplosao(q: Quadro, e: Explosao): void {
  const fase = 1 - e.tempo / e.duracao; // 0 no início, 1 no fim
  const cx = Math.round(e.x);
  const cy = Math.round(e.y);
  const raio = 3 + fase * 11;

  q.brilho(cx, cy, raio * 1.7, [
    [0, "rgba(255, 240, 180, 0.9)"],
    [0.45, "rgba(255, 122, 46, 0.6)"],
    [1, "rgba(255, 122, 46, 0)"],
  ], 1 - fase * 0.6);
  q.brilho(cx, cy, raio * 0.85, [
    [0, "#fffbe0"],
    [0.45, COR.explosaoMeio],
    [1, "rgba(255, 90, 30, 0)"],
  ], 1 - fase * 0.4);
  q.anel(cx, cy, raio * 1.3 + 2, 1, COR.explosaoCentro, (1 - fase) * 0.8);

  if (fase > 0.3) {
    const subida = (fase - 0.3) * 16;
    q.brilho(cx - 2, cy - subida, 3 + fase * 3, [
      [0, "rgba(70, 70, 80, 0.55)"],
      [1, "rgba(70, 70, 80, 0)"],
    ], 1 - fase * 0.5);
    q.brilho(cx + 3, cy - subida * 0.7 - 2, 2 + fase * 2.5, [
      [0, "rgba(70, 70, 80, 0.45)"],
      [1, "rgba(70, 70, 80, 0)"],
    ], 1 - fase * 0.5);
  }

  // Faíscas: segmentos que se afastam, com rastro curto.
  for (let k = 0; k < 8; k++) {
    const angulo = (k * Math.PI) / 4 + ((cx + cy) % 7) * 0.2;
    const distancia = 4 + fase * 16;
    const px = cx + Math.cos(angulo) * distancia;
    const py = cy + Math.sin(angulo) * distancia;
    const rx = cx + Math.cos(angulo) * (distancia - 2.5);
    const ry = cy + Math.sin(angulo) * (distancia - 2.5);
    q.segmento(rx, ry, px, py, COR.destroco, 0.9, 1 - fase);
  }
}

/** Rotor de helicóptero: duas pás girando e um véu de movimento por cima. */
export function desenharRotor(q: Quadro, cx: number, cy: number, tempo: number, raio: number): void {
  const angulo = tempo * 0.55;
  q.circulo(cx, cy, raio, "#dfe6ee", 0.12);
  for (let pá = 0; pá < 2; pá++) {
    const a = angulo + pá * (Math.PI / 2);
    q.segmento(cx - Math.cos(a) * raio, cy - Math.sin(a) * raio, cx + Math.cos(a) * raio, cy + Math.sin(a) * raio, "#1a1d24", 1.1, 0.9);
  }
  q.pixel(cx, cy, "#1a1d24");
}

/** Chama do jato, na traseira (que fica em cima, porque o jato desce a tela). */
export function desenharChamaJato(q: Quadro, x: number, y: number, tempo: number): void {
  const cores = ["#fff3a6", "#ffb347", "#ff5a1f"];
  for (let i = 0; i < 4; i++) {
    const cor = cores[(i + Math.floor(tempo / 2)) % cores.length]!;
    const largura = i < 2 ? 3 : 1;
    q.retangulo(x - largura / 2 + 0.5, y - 2 - i * 2, largura, 2, cor, 0.85 - i * 0.18);
  }
}

/** Rastro de espuma atrás do navio, que fica na direção de onde a água vem. */
export function desenharEsteira(q: Quadro, x: number, y: number, largura: number, tempo: number): void {
  const centro = x + largura / 2;
  for (let i = 0; i < 5; i++) {
    const deslocamento = ((Math.floor(tempo / 3) + i) % 2) * 2;
    q.pixel(centro - 1 + deslocamento - 1, y - 2 - i * 2, COR.espuma, 0.7 - i * 0.12);
  }
}

/** Área de abastecimento do posto: fundo azul leve, borda de marcas amarelas e pretas em movimento. */
export function desenharZonaPosto(q: Quadro, zona: { x: number; y: number; largura: number; altura: number }, tempo: number): void {
  const pulso = 0.5 + 0.5 * Math.sin(tempo / 12);
  q.retangulo(zona.x, zona.y, zona.largura, zona.altura, COR.zonaAzul, 0.07 + 0.07 * pulso);
  const fase = Math.floor(tempo / 4);
  const marca = (i: number): string => ((i + fase) % 6 < 3 ? COR.zonaAmarelo : COR.zonaPreto);
  for (let i = 0; i < zona.largura; i++) {
    q.pixel(zona.x + i, zona.y, marca(i), 0.9);
    q.pixel(zona.x + i, zona.y + zona.altura - 1, marca(i + 3), 0.9);
  }
  for (let j = 1; j < zona.altura - 1; j++) {
    q.pixel(zona.x, zona.y + j, marca(j), 0.9);
    q.pixel(zona.x + zona.largura - 1, zona.y + j, marca(j + 3), 0.9);
  }
}
