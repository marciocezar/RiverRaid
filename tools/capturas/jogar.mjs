// Abre o build, passa pela tela inicial, joga alguns segundos e salva capturas.
// Uso: node jogar.mjs <url> <pasta-de-saida>
import { chromium } from "playwright";
import { join } from "node:path";

const [url, pasta] = process.argv.slice(2);
const navegador = await chromium.launch();
// Segura a tecla por alguns quadros; um toque instantâneo não é visto pelo laço do jogo.
const pagina = await navegador.newPage({ viewport: { width: 640, height: 720 } });
const erros = [];
pagina.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") erros.push(`${m.type()}: ${m.text()}`); });
pagina.on("pageerror", (e) => erros.push("pageerror: " + e.message));
const toque = async (tecla, ms = 150) => { await pagina.keyboard.down(tecla); await pagina.waitForTimeout(ms); await pagina.keyboard.up(tecla); };
await pagina.goto(url, { waitUntil: "load" });
await pagina.waitForTimeout(1200);
await pagina.screenshot({ path: join(pasta, "1-titulo.png") });

await toque("Space");
await pagina.waitForTimeout(600);
await pagina.screenshot({ path: join(pasta, "2-inicio.png") });

// Voa para a esquerda, depois para a direita, atirando de vez em quando.
await pagina.keyboard.down("ArrowLeft");
await pagina.waitForTimeout(700);
await pagina.keyboard.up("ArrowLeft");
await toque("Space");
await pagina.keyboard.down("ArrowUp");
await pagina.waitForTimeout(400);
await pagina.keyboard.up("ArrowUp");
await pagina.keyboard.down("ArrowRight");
await pagina.waitForTimeout(900);
await pagina.keyboard.up("ArrowRight");
await toque("Space");
await pagina.waitForTimeout(500);
await pagina.screenshot({ path: join(pasta, "3-jogando.png") });

const canvas = await pagina.locator("canvas").first().boundingBox();
console.log(JSON.stringify({ canvas, erros }, null, 2));
await navegador.close();
