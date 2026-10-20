// Simula um celular: navegador com toque. Confere a faixa de controles e um toque no botão de tiro.
// Uso: node toque.mjs <url> <arquivo.png>
import { chromium } from "playwright";

const [url, saida] = process.argv.slice(2);
const navegador = await chromium.launch();
const contexto = await navegador.newContext({ viewport: { width: 400, height: 760 }, hasTouch: true, isMobile: true });
const pagina = await contexto.newPage();
const erros = [];
pagina.on("pageerror", (e) => erros.push("pageerror: " + e.message));
pagina.on("console", (m) => { if (m.type() === "error") erros.push(m.text()); });
await pagina.goto(url, { waitUntil: "load" });
await pagina.waitForTimeout(1000);
const canvas = await pagina.locator("canvas").first().boundingBox();
// Toca no botão de tiro (canto inferior direito da faixa de controles, coordenadas da tela).
const x = canvas.x + canvas.width * (1 - 22 / 160);
const y = canvas.y + canvas.height * ((192 + 24) / 240);
await pagina.touchscreen.tap(x, y);
await pagina.waitForTimeout(500);
await pagina.screenshot({ path: saida });
console.log(JSON.stringify({ canvas, toqueEm: { x: Math.round(x), y: Math.round(y) }, erros }, null, 2));
await navegador.close();
