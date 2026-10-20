// Confere que cada caixa de colisão cabe dentro do sprite que a representa.
// Sem isso, uma parte visível do objeto poderia não bater, ou bater no ar.
import { test } from "node:test";
import assert from "node:assert/strict";
import { TAMANHOS } from "../src/render/tamanhos.ts";
import { AVIAO_ALTURA, AVIAO_LARGURA } from "../src/entities/aviao.ts";
import { ESPECIFICACAO_INIMIGOS } from "../src/entities/inimigo.ts";
import { POSTO_ALTURA, POSTO_LARGURA } from "../src/entities/posto.ts";

test("a caixa do avião cabe no sprite do avião", () => {
  assert.ok(AVIAO_LARGURA <= TAMANHOS.aviao.largura);
  assert.ok(AVIAO_ALTURA <= TAMANHOS.aviao.altura);
});

test("a caixa de cada inimigo cabe no sprite correspondente", () => {
  for (const [tipo, caixa] of Object.entries(ESPECIFICACAO_INIMIGOS)) {
    const sprite = TAMANHOS[tipo as "navio" | "helicoptero" | "jato"];
    assert.ok(caixa.largura <= sprite.largura, `${tipo}: largura`);
    assert.ok(caixa.altura <= sprite.altura, `${tipo}: altura`);
  }
});

test("o corpo do posto cabe no sprite do posto", () => {
  assert.ok(POSTO_LARGURA <= TAMANHOS.posto.largura);
  assert.ok(POSTO_ALTURA <= TAMANHOS.posto.altura);
});
