// Confere a regra de controles por plataforma com toque simulado.
// Uso: node plataformas.mjs <url> <nome> ; imprime se o HUD de toque apareceu.
import { chromium } from "playwright";

const [url, nome] = process.argv.slice(2);
const navegador = await chromium.launch();
const resultados = {};
for (const [rotulo, opcoes] of [
  ["toque", { hasTouch: true, isMobile: true, viewport: { width: 400, height: 760 } }],
  ["sem-toque", { hasTouch: false, viewport: { width: 640, height: 720 } }],
]) {
  const pagina = await (await navegador.newContext(opcoes)).newPage();
  await pagina.goto(url, { waitUntil: "load" });
  await pagina.waitForTimeout(800);
  const c = await pagina.locator("canvas").first().boundingBox();
  // Proporção do canvas: 160:192 sem HUD, 160:240 com HUD.
  const proporcao = c ? +(c.height / c.width).toFixed(2) : null;
  resultados[rotulo] = { proporcaoAlturaLargura: proporcao, hudEsperadoPorComHUD: proporcao !== null && Math.abs(proporcao - 1.5) < 0.02 };
  await pagina.context().close();
}
console.log(nome, JSON.stringify(resultados));
await navegador.close();
