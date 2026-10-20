// Joga por ~30 s com teclas aleatórias e tiros frequentes, e salva capturas para revisão.
import { chromium } from "playwright";
import { join } from "node:path";

const [url, pasta] = process.argv.slice(2);
const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: 640, height: 720 } });
const erros = [];
pagina.on("pageerror", (e) => erros.push(e.message));
await pagina.goto(url, { waitUntil: "load" });
await pagina.waitForTimeout(600);
await pagina.keyboard.down("Space");
await pagina.waitForTimeout(120);
await pagina.keyboard.up("Space");

const teclas = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];
let capturas = 0;
const inicio = Date.now();
while (Date.now() - inicio < 30000) {
  const tecla = teclas[Math.floor(Math.random() * teclas.length)];
  await pagina.keyboard.down(tecla);
  await pagina.keyboard.down("Space");
  await pagina.waitForTimeout(250 + Math.random() * 400);
  await pagina.keyboard.up(tecla);
  await pagina.keyboard.up("Space");
  if (Math.floor((Date.now() - inicio) / 3000) > capturas) {
    capturas = Math.floor((Date.now() - inicio) / 3000);
    await pagina.screenshot({ path: join(pasta, `partida-${String(capturas).padStart(2, "0")}.png`) });
  }
}
console.log(JSON.stringify({ capturas, erros }));
await navegador.close();
