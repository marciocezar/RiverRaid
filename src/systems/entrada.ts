// Lê os controles e devolve uma Entrada para o Mundo.
// Teclado: setas e espaço (ou Enter). Toque: HUD translúcido à esquerda e à direita,
// desenhado pela própria cena só quando `usarHudToque()` é verdadeiro.
import Phaser from "phaser";
import { ALTURA_JOGO, LARGURA_TELA } from "../core/config.ts";
import { ENTRADA_VAZIA, type Entrada } from "../core/mundo.ts";
import { paraLogico } from "../cenas/tela.ts";

interface Botao {
  nome: "esquerda" | "direita" | "cima" | "baixo" | "tiro";
  x: number;
  y: number;
  raio: number;
}

/** Posições dos botões na faixa de controles, em pixels lógicos. */
export const BOTOES_TOQUE: Botao[] = [
  { nome: "esquerda", x: 12, y: 214, raio: 9 },
  { nome: "direita", x: 48, y: 214, raio: 9 },
  { nome: "cima", x: 30, y: 200, raio: 9 },
  { nome: "baixo", x: 30, y: 228, raio: 9 },
  { nome: "tiro", x: LARGURA_TELA - 22, y: ALTURA_JOGO + 24, raio: 16 },
];

export class LeitorEntrada {
  private teclas: Record<string, Phaser.Input.Keyboard.Key> | null = null;
  private cursores: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
  /*
   * Pressões rápidas (toque ou tecla que sobe antes do próximo quadro) são
   * guardadas aqui e entregues no quadro seguinte, para não se perderem.
   */
  private pendentes = { tiro: false, acelera: false, freia: false };

  constructor(private readonly cena: Phaser.Scene, private readonly comToque: boolean) {
    const teclado = cena.input.keyboard;
    if (teclado) {
      this.cursores = teclado.createCursorKeys();
      this.teclas = teclado.addKeys("SPACE,ENTER") as Record<string, Phaser.Input.Keyboard.Key>;
    }
    if (comToque) {
      cena.input.on("pointerdown", (ponteiro: Phaser.Input.Pointer) => {
        const p = paraLogico(ponteiro, cena.cameras.main.zoom);
        const botao = botaoEm(p.x, p.y);
        if (!botao) return;
        if (botao.nome === "tiro") this.pendentes.tiro = true;
        if (botao.nome === "cima") this.pendentes.acelera = true;
        if (botao.nome === "baixo") this.pendentes.freia = true;
      });
    }
  }

  /** Estado dos controles neste quadro. Os toques e teclas pressionados entre quadros também aparecem. */
  ler(): Entrada {
    const entrada: Entrada = { ...ENTRADA_VAZIA };
    if (this.cursores) {
      entrada.esquerda ||= this.cursores.left.isDown;
      entrada.direita ||= this.cursores.right.isDown;
      if (Phaser.Input.Keyboard.JustDown(this.cursores.up)) this.pendentes.acelera = true;
      if (Phaser.Input.Keyboard.JustDown(this.cursores.down)) this.pendentes.freia = true;
      entrada.acelera ||= this.cursores.up.isDown;
      entrada.freia ||= this.cursores.down.isDown;
    }
    if (this.teclas) {
      const tiroTecla = Phaser.Input.Keyboard.JustDown(this.teclas["SPACE"]!) || Phaser.Input.Keyboard.JustDown(this.teclas["ENTER"]!);
      if (tiroTecla) this.pendentes.tiro = true;
      entrada.tiro ||= this.teclas["SPACE"]!.isDown || this.teclas["ENTER"]!.isDown;
    }
    if (this.comToque) {
      for (const ponteiro of this.cena.input.manager.pointers) {
        if (!ponteiro.isDown) continue;
        const p = paraLogico(ponteiro, this.cena.cameras.main.zoom);
        const botao = botaoEm(p.x, p.y);
        if (!botao) continue;
        if (botao.nome === "esquerda") entrada.esquerda = true;
        if (botao.nome === "direita") entrada.direita = true;
        if (botao.nome === "cima") entrada.acelera = true;
        if (botao.nome === "baixo") entrada.freia = true;
        if (botao.nome === "tiro") entrada.tiro = true;
      }
    }
    entrada.tiro ||= this.pendentes.tiro;
    entrada.acelera ||= this.pendentes.acelera;
    entrada.freia ||= this.pendentes.freia;
    this.pendentes = { tiro: false, acelera: false, freia: false };
    return entrada;
  }

  /** Verdadeiro se o tiro foi pressionado neste quadro. Usado nos menus. */
  tiroPressionado(): boolean {
    return this.ler().tiro;
  }
}

/** Botão de toque sob o ponto (x, y), com margem extra para dedos imprecisos. */
export function botaoEm(x: number, y: number): Botao | undefined {
  for (const botao of BOTOES_TOQUE) {
    const dx = x - botao.x;
    const dy = y - botao.y;
    const alcance = botao.raio * 1.4;
    if (dx * dx + dy * dy <= alcance * alcance) return botao;
  }
  return undefined;
}
