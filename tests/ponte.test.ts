// Regras da ponte: bloqueia o avião, abre quando o miolo é atingido, e só faz faísca no tabuleiro.
import { test } from "node:test";
import assert from "node:assert/strict";
import { Mundo, ENTRADA_VAZIA } from "../src/core/mundo.ts";
import { Y_AVIAO } from "../src/core/config.ts";
import { criarPonte } from "../src/entities/ponte.ts";

function centroDaLinha(m: Mundo, y: number): number {
  const linha = m.rio.linhas[y]!;
  return (linha.esquerda + linha.direita) / 2;
}

test("ponte intacta sobre o avião derruba o avião", () => {
  const m = new Mundo(0x501);
  m.pontes.push(criarPonte(Y_AVIAO - 3));
  m.x = centroDaLinha(m, Y_AVIAO);
  m.atualizar(ENTRADA_VAZIA);
  assert.equal(m.estado, "morrendo", "a ponte intacta bloqueia");
});

test("tiro no miolo vermelho destrói a ponte e soma pontos", () => {
  const m = new Mundo(0x502);
  const y = 40;
  m.pontes.push(criarPonte(y));
  const centro = centroDaLinha(m, y + 3);
  // O rio rola antes do tiro andar; o tiro precisa começar abaixo do miolo para alcançá-lo.
  m.tiros.push({ x: centro, y: y + 5 });
  const antes = m.pontos;
  m.atualizar(ENTRADA_VAZIA);
  const ponte = m.pontes[0];
  assert.ok(ponte?.destruida, "o miolo abre a ponte");
  assert.ok(m.pontos >= antes + 200, "soma os pontos da ponte");
  assert.ok(m.eventos.includes("ponte_destruida"));
});

test("tiro no tabuleiro fora do miolo só gera impacto", () => {
  const m = new Mundo(0x503);
  const y = 40;
  m.pontes.push(criarPonte(y));
  const linha = m.rio.linhas[y + 3]!;
  m.tiros.push({ x: linha.esquerda + 2, y: y + 5 });
  m.atualizar(ENTRADA_VAZIA);
  assert.equal(m.pontes[0]?.destruida, false, "fora do miolo não destrói");
  assert.ok(m.eventos.includes("impacto"));
});

test("depois de aberta, a ponte deixa o avião passar", () => {
  const m = new Mundo(0x504);
  m.pontes.push({ y: Y_AVIAO - 3, destruida: true, tempoQueda: 0 });
  m.x = centroDaLinha(m, Y_AVIAO);
  m.atualizar(ENTRADA_VAZIA);
  assert.equal(m.estado, "jogando", "ponte destruída não bloqueia");
});

test("ponte destruída sai da tela depois da animação de queda", () => {
  const m = new Mundo(0x505);
  m.pontes.push({ y: 20, destruida: true, tempoQueda: 0 });
  for (let i = 0; i < 120; i++) m.atualizar(ENTRADA_VAZIA);
  assert.equal(m.pontes.length, 0, "a ponte caída é removida");
});
