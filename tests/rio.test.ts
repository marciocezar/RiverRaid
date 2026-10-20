import { test } from "node:test";
import assert from "node:assert/strict";
import { Rio } from "../src/core/rio.ts";
import { Rng } from "../src/core/rng.ts";
import { ALTURA_JOGO, LARGURA_TELA } from "../src/core/config.ts";

test("o rio tem uma faixa válida por linha", () => {
  const rio = new Rio(new Rng(0x1234), 1);
  assert.equal(rio.linhas.length, ALTURA_JOGO);
  for (const f of rio.linhas) {
    assert.ok(f.esquerda >= 2 && f.direita <= LARGURA_TELA - 2, "margens dentro da tela");
    assert.ok(f.direita - f.esquerda >= 20, "água com largura mínima");
  }
});

test("a mesma semente gera o mesmo rio", () => {
  const a = new Rio(new Rng(0xbeef), 1);
  const b = new Rio(new Rng(0xbeef), 1);
  for (let i = 0; i < 500; i++) { a.avancar(); b.avancar(); }
  assert.deepEqual(a.linhas, b.linhas);
});

test("as margens variam devagar, um pixel por linha no máximo", () => {
  const rio = new Rio(new Rng(0x2222), 1);
  for (let i = 0; i < 2000; i++) {
    const antes = rio.linhas[0]!;
    rio.avancar();
    const depois = rio.linhas[0]!;
    assert.ok(Math.abs(depois.esquerda - antes.esquerda) <= 2, `salto na margem esquerda na linha ${i}`);
    assert.ok(Math.abs(depois.direita - antes.direita) <= 2, `salto na margem direita na linha ${i}`);
  }
});
