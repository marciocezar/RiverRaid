// Mede só o contexto do jogo (não o do Phaser): canal mestre, ganho do motor e relógio do áudio.
import { chromium, webkit } from "playwright";
const [url, motor = "chromium"] = process.argv.slice(2);
const navegador = await (motor === "webkit" ? webkit : chromium).launch();
const pagina = await navegador.newPage({ viewport: { width: 640, height: 720 } });
await pagina.addInitScript(() => {
  window.__a = { contextos: [], ganhos: [] };
  const O = window.AudioContext || window.webkitAudioContext;
  const P = function (...a) {
    const c = new O(...a); window.__a.contextos.push(c);
    const cg = c.createGain.bind(c);
    c.createGain = () => { const g = cg(); window.__a.ganhos.push(g); return g; };
    return c;
  };
  P.prototype = O.prototype; window.AudioContext = P; window.webkitAudioContext = P;
});
await pagina.goto(url, { waitUntil: "load" });
await pagina.waitForTimeout(800);
const caixa = await pagina.locator("canvas").first().boundingBox();
await pagina.mouse.click(caixa.x + caixa.width / 2, caixa.y + caixa.height / 2);
await pagina.waitForTimeout(300);
await pagina.keyboard.down("Space"); await pagina.waitForTimeout(120); await pagina.keyboard.up("Space");
const leitura = async () => pagina.evaluate(() => {
  const ctx = window.__a.contextos[window.__a.contextos.length - 1];
  const meus = window.__a.ganhos.filter((g) => g.context === ctx);
  return { relogio: +ctx.currentTime.toFixed(3), estado: ctx.state, mestre: meus[0] ? +meus[0].gain.value.toFixed(3) : null, ganhosDoJogo: meus.map((g) => +g.gain.value.toFixed(3)) };
});
const a = await leitura();
await pagina.waitForTimeout(1000);
const b = await leitura();
await pagina.keyboard.press("KeyM");
await pagina.waitForTimeout(600);
const c = await leitura();
console.log(JSON.stringify({ motor, emPartida1: a, emPartida2_1sDepois: b, aposM: c }));
await navegador.close();
