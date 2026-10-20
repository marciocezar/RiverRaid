// Diagnóstico de som: conta contextos e nós criados e lê o estado FINAL de cada contexto,
// depois de jogar. Uso: node som.mjs <url> [chromium|webkit]
import { chromium, webkit } from "playwright";

const [url, motor = "chromium"] = process.argv.slice(2);
const navegador = await (motor === "webkit" ? webkit : chromium).launch();
const pagina = await navegador.newPage({ viewport: { width: 640, height: 720 } });
const erros = [];
pagina.on("pageerror", (e) => erros.push(e.message));
await pagina.addInitScript(() => {
  window.__som = { contextos: [], osciladores: 0, fontes: 0 };
  const O = window.AudioContext || window.webkitAudioContext;
  if (!O) return;
  const P = function (...a) {
    const c = new O(...a);
    window.__som.contextos.push(c);
    const osc = c.createOscillator.bind(c);
    c.createOscillator = () => { window.__som.osciladores++; return osc(); };
    const fon = c.createBufferSource.bind(c);
    c.createBufferSource = () => { window.__som.fontes++; return fon(); };
    return c;
  };
  P.prototype = O.prototype;
  window.AudioContext = P;
  window.webkitAudioContext = P;
});
await pagina.goto(url, { waitUntil: "load" });
await pagina.waitForTimeout(800);
await pagina.keyboard.down("Space");
await pagina.waitForTimeout(150);
await pagina.keyboard.up("Space");
await pagina.waitForTimeout(800);
// Segundo aperto: já dentro da partida, dispara o tiro (som de tiro).
await pagina.keyboard.down("Space");
await pagina.waitForTimeout(120);
await pagina.keyboard.up("Space");
await pagina.waitForTimeout(500);
const r = await pagina.evaluate(() => ({
  contextos: window.__som.contextos.length,
  estadosFinais: window.__som.contextos.map((c) => c.state),
  osciladores: window.__som.osciladores,
  fontes: window.__som.fontes,
}));
console.log(JSON.stringify({ motor, ...r, erros: erros.slice(0, 3) }));
await navegador.close();
