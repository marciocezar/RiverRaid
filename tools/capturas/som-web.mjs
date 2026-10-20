// Simula um jogador na web: abre a página, clica, inicia a partida e lê os ganhos de áudio.
// Mede se o motor e o tiro chegam ao destino com volume audível.
import { chromium } from "playwright";

const [url, motor = "chromium"] = process.argv.slice(2);
const navegador = await chromium.launch({ args: [] });
const pagina = await navegador.newPage({ viewport: { width: 640, height: 720 } });
const erros = [];
pagina.on("pageerror", (e) => erros.push(e.message));
await pagina.addInitScript(() => {
  window.__audio = { contextos: [], ganhos: [] };
  const O = window.AudioContext || window.webkitAudioContext;
  if (!O) return;
  const P = function (...a) {
    const c = new O(...a);
    window.__audio.contextos.push(c);
    const cg = c.createGain.bind(c);
    c.createGain = () => { const g = cg(); window.__audio.ganhos.push(g); return g; };
    return c;
  };
  P.prototype = O.prototype;
  window.AudioContext = P;
  window.webkitAudioContext = P;
});
await pagina.goto(url, { waitUntil: "load" });
await pagina.waitForTimeout(800);

// Jogador clica na tela (gesto de mouse), sem apertar tecla.
const caixa = await pagina.locator("canvas").first().boundingBox();
await pagina.mouse.click(caixa.x + caixa.width / 2, caixa.y + caixa.height / 2);
await pagina.waitForTimeout(400);
const noTitulo = await pagina.evaluate(() => ({
  estados: window.__audio.contextos.map((c) => c.state),
  ganhoMaximo: Math.max(0, ...window.__audio.ganhos.map((g) => g.gain.value)),
}));

// Começa a partida com a tecla de tiro e espera o motor subir.
await pagina.keyboard.down("Space");
await pagina.waitForTimeout(120);
await pagina.keyboard.up("Space");
await pagina.waitForTimeout(1500);
const naPartida = await pagina.evaluate(() => ({
  estados: window.__audio.contextos.map((c) => c.state),
  ganhos: window.__audio.ganhos.map((g) => +g.gain.value.toFixed(4)),
  ganhoMaximo: +Math.max(0, ...window.__audio.ganhos.map((g) => g.gain.value)).toFixed(4),
}));
// Tecla M: silencia. O primeiro ganho criado é o canal mestre; ele deve ir a zero.
await pagina.keyboard.press("KeyM");
await pagina.waitForTimeout(400);
const mudo = await pagina.evaluate(() => ({ mestre: +window.__audio.ganhos[0].gain.value.toFixed(3), motor: +Math.max(...window.__audio.ganhos.slice(1).map((g) => g.gain.value)).toFixed(3) }));
const titulo = await pagina.evaluate(() => localStorage.getItem("river-raid:silenciado"));
console.log(JSON.stringify({ motor, depoisDoClique: noTitulo, naPartida, aposM: mudo, preferenciaSalva: titulo, erros: erros.slice(0, 3) }, null, 1));
await navegador.close();
