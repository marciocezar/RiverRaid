// Regras do posto: área de abastecimento maior que o corpo; tiro no corpo destrói.
import { test } from "node:test";
import assert from "node:assert/strict";
import { Mundo, ENTRADA_VAZIA } from "../src/core/mundo.ts";
import { COMBUSTIVEL_MAXIMO, Y_AVIAO } from "../src/core/config.ts";
import { caixaZonaPosto, POSTO_LARGURA, ZONA_LARGURA } from "../src/entities/posto.ts";

test("a área de abastecimento é maior que o corpo do posto e está centrada nele", () => {
  const caixa = caixaZonaPosto({ x: 60, y: 40 });
  assert.ok(caixa.largura > POSTO_LARGURA, "área mais larga que o corpo");
  assert.equal(caixa.largura, ZONA_LARGURA);
  assert.equal(caixa.x + caixa.largura / 2, 60 + POSTO_LARGURA / 2, "centrada no corpo");
});

test("o avião reabastece na borda da área, mesmo fora do corpo do posto", () => {
  const m = new Mundo(0x701);
  const posto = { x: 70, y: Y_AVIAO - 7 };
  m.postos.push(posto);
  const zona = caixaZonaPosto(posto);
  // Centro do avião a 2 pixels dentro da área, mas além do corpo.
  m.x = zona.x + zona.largura - 2 - 5;
  m.combustivel = 40;
  m.atualizar(ENTRADA_VAZIA);
  assert.ok(m.combustivel > 40, "reabastece dentro da área");
});

test("fora da área de abastecimento não há reabastecimento", () => {
  const m = new Mundo(0x702);
  const posto = { x: 70, y: Y_AVIAO - 7 };
  m.postos.push(posto);
  const zona = caixaZonaPosto(posto);
  m.x = zona.x - 20;
  m.combustivel = 40;
  m.atualizar(ENTRADA_VAZIA);
  assert.ok(m.combustivel < 40, "sem reabastecimento longe do posto");
});

test("tiro no corpo do posto destrói o posto, soma pontos e não reabastece", () => {
  const m = new Mundo(0x703);
  const posto = { x: 70, y: 40 };
  m.postos.push(posto);
  m.tiros.push({ x: posto.x + POSTO_LARGURA / 2, y: posto.y + 9 });
  const antes = m.pontos;
  m.atualizar(ENTRADA_VAZIA);
  assert.equal(m.postos.includes(posto), false, "o posto some");
  assert.ok(m.pontos >= antes + 50, "soma pontos");
  assert.ok(m.eventos.includes("posto_destruido"));
});

test("tiro só na área de abastecimento, fora do corpo, não destrói o posto", () => {
  const m = new Mundo(0x704);
  const posto = { x: 70, y: 40 };
  m.postos.push(posto);
  const zona = caixaZonaPosto(posto);
  m.tiros.push({ x: zona.x + 1, y: posto.y + 9 });
  m.atualizar(ENTRADA_VAZIA);
  assert.equal(m.postos.length, 1, "o posto continua de pé");
  assert.equal(m.eventos.includes("posto_destruido"), false);
});

test("posto destruído não reabastece mais", () => {
  const m = new Mundo(0x705);
  const posto = { x: 70, y: 40 };
  m.postos.push(posto);
  m.tiros.push({ x: posto.x + 10, y: posto.y + 9 });
  m.atualizar(ENTRADA_VAZIA);
  m.x = caixaZonaPosto(posto).x + 5;
  m.combustivel = 30;
  m.atualizar(ENTRADA_VAZIA);
  assert.ok(m.combustivel < 30, "sem reabastecimento depois de destruído");
  assert.ok(COMBUSTIVEL_MAXIMO > 30);
});
