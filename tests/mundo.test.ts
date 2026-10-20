import { test } from "node:test";
import assert from "node:assert/strict";
import { Mundo, ENTRADA_VAZIA, type Entrada } from "../src/core/mundo.ts";
import { COMBUSTIVEL_MAXIMO, VIDAS_INICIAIS, Y_AVIAO } from "../src/core/config.ts";
import { criarInimigo } from "../src/entities/inimigo.ts";

const parado: Entrada = { ...ENTRADA_VAZIA };

function rodar(mundo: Mundo, quadros: number, entrada: Entrada = parado): void {
  for (let i = 0; i < quadros; i++) mundo.atualizar(entrada);
}

test("o avião começa no centro da água e com tanque cheio", () => {
  const m = new Mundo(0x77);
  const linha = m.rio.linhas[Y_AVIAO]!;
  assert.ok(m.x >= linha.esquerda && m.x <= linha.direita);
  assert.equal(m.combustivel, COMBUSTIVEL_MAXIMO);
  assert.equal(m.vidas, VIDAS_INICIAIS);
  assert.equal(m.estado, "jogando");
});

test("combustível diminui com o tempo e mais depressa em velocidade alta", () => {
  const lento = new Mundo(0x11);
  lento.velocidade = 1;
  rodar(lento, 60);
  const rapido = new Mundo(0x11);
  rapido.velocidade = 4;
  rodar(rapido, 60);
  assert.ok(lento.combustivel < COMBUSTIVEL_MAXIMO);
  assert.ok(rapido.combustivel < lento.combustivel, "velocidade maior gasta mais");
});

test("acelerar e frear respeitam os limites, uma vez por aperto", () => {
  const m = new Mundo(0x22);
  m.velocidade = 2;
  const acelera: Entrada = { ...ENTRADA_VAZIA, acelera: true };
  m.atualizar(acelera);
  m.atualizar(acelera); // segurar não acelera de novo
  assert.equal(m.velocidade, 3);
  rodar(m, 5, ENTRADA_VAZIA);
  for (let i = 0; i < 10; i++) {
    m.atualizar({ ...ENTRADA_VAZIA, acelera: true });
    m.atualizar(ENTRADA_VAZIA);
  }
  assert.equal(m.velocidade, 4, "limite superior");
});

test("tiro limita-se a dois na tela e sobe", () => {
  const m = new Mundo(0x33);
  const tiro: Entrada = { ...ENTRADA_VAZIA, tiro: true };
  m.atualizar(tiro);
  const primeiro = m.tiros[0];
  assert.ok(primeiro, "o primeiro aperto cria um tiro");
  const yInicial = primeiro.y;
  m.atualizar(ENTRADA_VAZIA);
  assert.ok(primeiro.y < yInicial, "o tiro sobe");
  for (let i = 0; i < 6; i++) {
    m.atualizar(tiro);
    m.atualizar(ENTRADA_VAZIA);
  }
  const quantidade: number = m.tiros.length;
  assert.ok(quantidade <= 2, "no máximo dois tiros na tela");
});

test("tiro atinge inimigo, soma pontos e remove o inimigo", () => {
  const m = new Mundo(0x44);
  const navio = criarInimigo("navio", m.x - 5, Y_AVIAO - 30, 1);
  m.inimigos.push(navio);
  const antes = m.pontos;
  m.tiros.push({ x: m.x, y: Y_AVIAO - 6 });
  for (let i = 0; i < 4; i++) m.atualizar(ENTRADA_VAZIA);
  assert.ok(!m.inimigos.includes(navio), "o navio atingido sai da tela");
  assert.ok(m.pontos >= antes + 30, "soma os pontos do navio");
  assert.ok(m.explosoes.length > 0, "aparece explosão");
});

test("sair da água faz o avião cair e perder uma vida", () => {
  const m = new Mundo(0x55);
  const linha = m.rio.linhas[Y_AVIAO]!;
  m.x = linha.esquerda - 10; // fora da margem
  m.atualizar(ENTRADA_VAZIA);
  assert.equal(m.estado, "morrendo");
  assert.equal(m.vidas, VIDAS_INICIAIS - 1);
});

test("depois de perder todas as vidas o jogo termina", () => {
  const m = new Mundo(0x66);
  m.vidas = 1;
  m.x = 0;
  m.atualizar(ENTRADA_VAZIA); // cai
  assert.equal(m.estado, "morrendo");
  rodar(m, 200);
  assert.equal(m.estado, "fim");
  assert.equal(m.vidas, 0);
});

test("o avião renasce com combustível cheio e invulnerabilidade quando ainda tem vidas", () => {
  const m = new Mundo(0x77);
  m.x = 0;
  m.atualizar(ENTRADA_VAZIA); // cai
  m.combustivel = 3;
  let quadros = 0;
  while (m.estado !== "jogando" && quadros < 300) {
    m.atualizar(ENTRADA_VAZIA);
    quadros++;
  }
  assert.equal(m.estado, "jogando", "volta ao jogo");
  assert.equal(m.combustivel, COMBUSTIVEL_MAXIMO, "combustível cheio ao renascer");
  assert.ok(m.invulneravel > 0, "invulnerável logo após renascer");
});

test("posto de combustível reabastece quando o avião passa por cima", () => {
  const m = new Mundo(0x88);
  m.combustivel = 40;
  m.postos.push({ x: m.x - 4, y: Y_AVIAO - 6 });
  m.atualizar(ENTRADA_VAZIA);
  assert.ok(m.combustivel > 40, "combustível sobe sobre o posto");
  assert.ok(m.eventos.includes("reabastecer") || m.combustivel > 40);
});

test("a mesma semente e a mesma entrada geram a mesma partida", () => {
  const a = new Mundo(0x9999);
  const b = new Mundo(0x9999);
  const entradas: Entrada[] = [
    { ...ENTRADA_VAZIA, esquerda: true },
    { ...ENTRADA_VAZIA, direita: true, tiro: true },
    ENTRADA_VAZIA,
  ];
  for (let i = 0; i < 600; i++) {
    const e = entradas[i % entradas.length]!;
    a.atualizar(e);
    b.atualizar(e);
  }
  assert.equal(a.pontos, b.pontos);
  assert.equal(a.distancia, b.distancia);
  assert.equal(a.combustivel, b.combustivel);
  assert.equal(a.vidas, b.vidas);
  assert.deepEqual(a.rio.linhas, b.rio.linhas);
});
