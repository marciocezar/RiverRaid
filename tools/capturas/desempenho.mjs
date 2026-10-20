// Mede quadros por segundo do jogo em navegador headless e conta erros de página.
import { chromium } from "playwright";

const [url] = process.argv.slice(2);
const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: 640, height: 720 } });
const erros = [];
pagina.on("pageerror", (e) => erros.push(e.message));
await pagina.goto(url, { waitUntil: "load" });
await pagina.waitForTimeout(800);
await pagina.keyboard.down("Space");
await pagina.waitForTimeout(120);
await pagina.keyboard.up("Space");
const quadros = await pagina.evaluate(() => new Promise((resolver) => {
  let n = 0;
  const inicio = performance.now();
  const passo = () => {
    n++;
    if (performance.now() - inicio < 4000) requestAnimationFrame(passo);
    else resolver(n / ((performance.now() - inicio) / 1000));
  };
  requestAnimationFrame(passo);
}));
console.log(JSON.stringify({ quadrosPorSegundo: Math.round(quadros), erros }));
await navegador.close();
