// Verifica o padrão de som: perfil novo começa ligado; valor antigo "1" é ignorado;
// M desliga, persiste após recarregar, e M de novo liga.
import { chromium, webkit } from "playwright";
const [url, motor = "chromium", legado = "nao"] = process.argv.slice(2);
const navegador = await (motor === "webkit" ? webkit : chromium).launch();

async function abrir(contexto) {
  const pagina = await contexto.newPage();
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
  await pagina.waitForTimeout(700);
  return pagina;
}
const motorNaPartida = async (pagina) => {
  const caixa = await pagina.locator("canvas").first().boundingBox();
  await pagina.mouse.click(caixa.x + caixa.width / 2, caixa.y + caixa.height / 2);
  await pagina.waitForTimeout(300);
  await pagina.keyboard.down("Space"); await pagina.waitForTimeout(120); await pagina.keyboard.up("Space");
  await pagina.waitForTimeout(1200);
  return pagina.evaluate(() => {
    const ctx = window.__a.contextos[window.__a.contextos.length - 1];
    const meus = window.__a.ganhos.filter((g) => g.context === ctx);
    return { mestre: +meus[0].gain.value.toFixed(2), motor: +Math.max(0, ...meus.slice(1).map((g) => g.gain.value)).toFixed(3) };
  });
};

const contexto = await navegador.newContext({ viewport: { width: 640, height: 720 } });
if (legado === "sim") await contexto.addInitScript(() => localStorage.setItem("river-raid:silenciado", "1"));
const p1 = await abrir(contexto);
const inicial = await motorNaPartida(p1);
await p1.keyboard.press("KeyM");
await p1.waitForTimeout(300);
const depoisM = await p1.evaluate(() => ({ ganho: window.__a.ganhos[0] ? +window.__a.ganhos.filter((g) => g.context === window.__a.contextos[window.__a.contextos.length - 1])[0].gain.value.toFixed(2) : null, salvo: localStorage.getItem("river-raid:som") }));
await p1.reload({ waitUntil: "load" });
await p1.waitForTimeout(600);
const aposRecarregar = await p1.evaluate(() => localStorage.getItem("river-raid:som"));
await p1.keyboard.press("KeyM");
await p1.waitForTimeout(300);
const ligadoDeNovo = await p1.evaluate(() => localStorage.getItem("river-raid:som"));
console.log(JSON.stringify({ motor, legadoSilenciado: legado, partidaInicial: inicial, aposM: depoisM, depoisRecarregar: aposRecarregar, aposMDeNovo: ligadoDeNovo }));
await navegador.close();
