// Confere o LFSR contra vetores gerados executando o próprio ROM (tools/rom/gerar_vetores_lfsr.py).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { lfsrStep, makeState, lowByte, highByte } from "../src/core/lfsr.ts";

type Vetores = { pares: { entrada: number[]; saida: number[] }[]; sequencia_a_partir_de_01_00: number[][] };
const vetores: Vetores = JSON.parse(readFileSync(new URL("./vetores/lfsr.json", import.meta.url), "utf8"));

test("um passo reproduz a rotina $FAC6 do ROM para todos os pares", () => {
  for (const { entrada: [e9 = 0, ea = 0], saida: [r9 = 0, ra = 0] } of vetores.pares) {
    const proximo = lfsrStep(makeState(e9, ea));
    assert.equal(lowByte(proximo), r9, `E9 de ${e9.toString(16)}:${ea.toString(16)}`);
    assert.equal(highByte(proximo), ra, `EA de ${e9.toString(16)}:${ea.toString(16)}`);
  }
});

test("a sequência encadeada a partir de 01:00 coincide com o ROM", () => {
  let estado = makeState(0x01, 0x00);
  vetores.sequencia_a_partir_de_01_00.forEach(([r9 = 0, ra = 0], i) => {
    estado = lfsrStep(estado);
    assert.equal(lowByte(estado), r9, `passo ${i}: E9`);
    assert.equal(highByte(estado), ra, `passo ${i}: EA`);
  });
});
