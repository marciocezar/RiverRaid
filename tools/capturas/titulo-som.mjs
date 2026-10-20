// Captura o título antes e depois de liberar o áudio com um clique.
import { chromium } from "playwright";
const [url, pasta] = process.argv.slice(2);
const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: 640, height: 720 } });
await pagina.goto(url, { waitUntil: "load" });
await pagina.waitForTimeout(900);
await pagina.screenshot({ path: `${pasta}/titulo-antes-clique.png` });
const caixa = await pagina.locator("canvas").first().boundingBox();
await pagina.mouse.click(caixa.x + caixa.width / 2, caixa.y + caixa.height * 0.9);
await pagina.waitForTimeout(700);
await pagina.screenshot({ path: `${pasta}/titulo-depois-clique.png` });
await navegador.close();
console.log("ok");
