// Roda muitos quadros com entradas aleatórias e confere as invariantes do jogo.
// Pega exceções e estados impossíveis que os testes pontuais não alcançam.
import { test } from "node:test";
import assert from "node:assert/strict";
import { Mundo, type Entrada } from "../src/core/mundo.ts";
import { COMBUSTIVEL_MAXIMO, LARGURA_TELA, VELOCIDADE_MAX, VELOCIDADE_MIN } from "../src/core/config.ts";
import { Rng } from "../src/core/rng.ts";

test("100 mil quadros com entradas aleatórias mantêm as invariantes", () => {
  const sorteio = new Rng(0xabcd);
  const m = new Mundo(0x1357);
  let mortes = 0;
  let reinicios = 0;
  let ultimoEstado = m.estado;
  for (let i = 0; i < 100_000; i++) {
    if (m.estado === "fim") {
      reinicios++;
      // Simula um novo jogo com outra semente, como faz a cena.
      Object.assign(m, new Mundo(sorteio.byte() * 257 + sorteio.byte() + 1));
    }
    const entrada: Entrada = {
      esquerda: sorteio.byte() < 90,
      direita: sorteio.byte() < 90,
      acelera: sorteio.byte() < 20,
      freia: sorteio.byte() < 20,
      tiro: sorteio.byte() < 40,
    };
    m.atualizar(entrada);
    if (ultimoEstado !== "morrendo" && m.estado === "morrendo") mortes++;
    ultimoEstado = m.estado;

    assert.ok(m.x >= 0 && m.x <= LARGURA_TELA - 1, `x fora da tela no quadro ${i}: ${m.x}`);
    assert.ok(m.combustivel >= 0 && m.combustivel <= COMBUSTIVEL_MAXIMO, `combustível fora do limite no quadro ${i}`);
    assert.ok(m.velocidade >= VELOCIDADE_MIN && m.velocidade <= VELOCIDADE_MAX, `velocidade fora do limite no quadro ${i}`);
    assert.ok(m.vidas >= 0, `vidas negativas no quadro ${i}`);
    assert.ok(m.tiros.length <= 2, `mais de dois tiros no quadro ${i}`);
    assert.ok(m.rio.linhas.length === 192, "rio com o tamanho da tela");
  }
  assert.ok(mortes > 10, `a simulação deve passar por várias quedas (houve ${mortes})`);
  assert.ok(reinicios >= 0);
});
