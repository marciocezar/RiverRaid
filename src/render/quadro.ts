// Framebuffer da tela de jogo. Tudo é desenhado em unidades lógicas (160x192), mas o canvas
// tem ESCALA vezes mais pixels: a transformação do contexto faz a conversão. Retângulos e
// texto usam coordenadas inteiras, então as bordas dos elementos de pixel ficam nítidas.
import { LARGURA_TELA, ALTURA_JOGO } from "../core/config.ts";
import { AVANCO_GLIFO, GLIFOS } from "./fonte.ts";

export class Quadro {
  readonly largura = LARGURA_TELA;
  readonly altura = ALTURA_JOGO;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly escala: number;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D indisponível");
    this.escala = canvas.width / LARGURA_TELA;
    ctx.imageSmoothingEnabled = false;
    ctx.setTransform(this.escala, 0, 0, this.escala, 0, 0);
    this.ctx = ctx;
  }

  limpar(cor: string): void {
    this.ctx.globalAlpha = 1;
    this.ctx.fillStyle = cor;
    this.ctx.fillRect(0, 0, this.largura, this.altura);
  }

  retangulo(x: number, y: number, largura: number, altura: number, cor: string, alpha = 1): void {
    this.ctx.globalAlpha = alpha;
    this.ctx.fillStyle = cor;
    this.ctx.fillRect(Math.round(x), Math.round(y), Math.round(largura), Math.round(altura));
    this.ctx.globalAlpha = 1;
  }

  pixel(x: number, y: number, cor: string, alpha = 1): void {
    this.retangulo(x, y, 1, 1, cor, alpha);
  }

  /**
   * Preenche a área com um padrão de ladrilho. O padrão é desenhado em metade do tamanho
   * do canvas (ladrilho de 32 px vira 16 unidades lógicas) e desloca com a rolagem.
   */
  padrao(x: number, y: number, largura: number, altura: number, padrao: CanvasPattern, deslocX: number, deslocY: number): void {
    padrao.setTransform(new DOMMatrix([0.5, 0, 0, 0.5, Math.round(deslocX), Math.round(deslocY)]));
    this.ctx.fillStyle = padrao;
    this.ctx.fillRect(Math.round(x), Math.round(y), Math.round(largura), Math.round(altura));
  }

  /** Desenha um sprite pelo canto superior esquerdo, opcionalmente espelhado. */
  sprite(imagem: CanvasImageSource, x: number, y: number, larg: number, alt: number, opcoes: { alpha?: number; espelharX?: boolean; espelharY?: boolean } = {}): void {
    const { alpha = 1, espelharX = false, espelharY = false } = opcoes;
    const px = Math.round(x);
    const py = Math.round(y);
    this.ctx.globalAlpha = alpha;
    if (!espelharX && !espelharY) {
      this.ctx.drawImage(imagem, px, py, larg, alt);
    } else {
      this.ctx.save();
      this.ctx.translate(px + (espelharX ? larg : 0), py + (espelharY ? alt : 0));
      this.ctx.scale(espelharX ? -1 : 1, espelharY ? -1 : 1);
      this.ctx.drawImage(imagem, 0, 0, larg, alt);
      this.ctx.restore();
    }
    this.ctx.globalAlpha = 1;
  }

  /** Disco com gradiente radial (brilho de explosão, reflexo de hélice). */
  brilho(cx: number, cy: number, raio: number, paradas: [number, string][], alpha = 1): void {
    if (raio <= 0) return;
    const gradiente = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, raio);
    for (const [posicao, cor] of paradas) gradiente.addColorStop(posicao, cor);
    this.ctx.globalAlpha = alpha;
    this.ctx.fillStyle = gradiente;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, raio, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.globalAlpha = 1;
  }

  /** Círculo preenchido, com borda suave (usado em fumaça e disco de hélice). */
  circulo(cx: number, cy: number, raio: number, cor: string, alpha = 1): void {
    if (raio <= 0) return;
    this.ctx.globalAlpha = alpha;
    this.ctx.fillStyle = cor;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, raio, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.globalAlpha = 1;
  }

  /** Anel vazado com a espessura dada. */
  anel(cx: number, cy: number, raio: number, espessura: number, cor: string, alpha = 1): void {
    if (raio <= espessura) return;
    this.ctx.globalAlpha = alpha;
    this.ctx.strokeStyle = cor;
    this.ctx.lineWidth = espessura;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, raio, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.globalAlpha = 1;
  }

  /** Segmento com antisserrilhamento: pás de helicóptero, faíscas e rastros. */
  segmento(x1: number, y1: number, x2: number, y2: number, cor: string, espessura = 1, alpha = 1): void {
    this.ctx.globalAlpha = alpha;
    this.ctx.strokeStyle = cor;
    this.ctx.lineWidth = espessura;
    this.ctx.lineCap = "round";
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
    this.ctx.globalAlpha = 1;
  }

  /** Gradiente vertical entre duas alturas lógicas, com paradas (posição 0 a 1 e cor). */
  gradienteVertical(y0: number, y1: number, paradas: [number, string][]): CanvasGradient {
    const gradiente = this.ctx.createLinearGradient(0, y0, 0, y1);
    for (const [posicao, cor] of paradas) gradiente.addColorStop(posicao, cor);
    return gradiente;
  }

  /** Polígono preenchido, com contorno opcional. Coordenadas lógicas. */
  poligono(pontos: [number, number][], preenchimento: string | CanvasGradient, alpha = 1, contorno?: string): void {
    if (pontos.length < 3) return;
    this.ctx.globalAlpha = alpha;
    this.ctx.beginPath();
    pontos.forEach(([x, y], i) => (i === 0 ? this.ctx.moveTo(x, y) : this.ctx.lineTo(x, y)));
    this.ctx.closePath();
    this.ctx.fillStyle = preenchimento;
    this.ctx.fill();
    if (contorno) {
      this.ctx.lineWidth = 0.6;
      this.ctx.strokeStyle = contorno;
      this.ctx.stroke();
    }
    this.ctx.globalAlpha = 1;
  }

  /** Texto na fonte 3x5. Escala inteira mantém as bordas nítidas. */
  texto(texto: string, x: number, y: number, cor: string, escala = 1, alpha = 1): void {
    let cursor = Math.round(x);
    for (const caractere of texto.toUpperCase()) {
      const glifo = GLIFOS[caractere] ?? GLIFOS[" "]!;
      for (let linha = 0; linha < 5; linha++) {
        const bits = glifo[linha]!;
        for (let coluna = 0; coluna < 3; coluna++) {
          if (bits[coluna] === "1") this.retangulo(cursor + coluna * escala, y + linha * escala, escala, escala, cor, alpha);
        }
      }
      cursor += AVANCO_GLIFO * escala;
    }
  }
}
