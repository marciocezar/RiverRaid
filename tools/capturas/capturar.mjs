// Abre uma URL num Chromium headless, grava erros do console e salva uma captura.
// Uso: node capturar.mjs <url> <arquivo.png>
import { chromium } from "playwright";

const [url, saida] = process.argv.slice(2);
const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: 960, height: 720 } });
const erros = [];
pagina.on("console", (m) => { if (m.type() === "error") erros.push(m.text()); });
pagina.on("pageerror", (e) => erros.push("pageerror: " + e.message));
await pagina.goto(url, { waitUntil: "load" }).catch((e) => erros.push("goto: " + e.message));
await pagina.waitForTimeout(2500);
const canvas = await pagina.locator("canvas").count();
const texto = await pagina.locator("body").innerText().catch(() => "");
await pagina.screenshot({ path: saida });
console.log(JSON.stringify({ url, canvas, erros, textoVisivel: texto.slice(0, 200) }, null, 2));
await navegador.close();
