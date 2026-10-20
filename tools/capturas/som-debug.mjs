// Registra cada resume() e cada criação de AudioContext no jogo, com o tipo de evento ativo.
import { webkit } from "playwright";
const navegador = await webkit.launch();
const pagina = await navegador.newPage({ viewport: { width: 640, height: 720 } });
const erros = [];
pagina.on("pageerror", (e) => erros.push(e.message));
await pagina.addInitScript(() => {
  window.__log = [];
  let evento = "nenhum";
  for (const t of ["keydown", "pointerdown", "click"]) window.addEventListener(t, (e) => { evento = t + ":" + e.isTrusted; }, true);
  const O = window.AudioContext;
  const P = function (...a) {
    const c = new O(...a);
    window.__log.push("criado evento=" + evento + " estado=" + c.state);
    const r = c.resume.bind(c);
    c.resume = () => { const p = r(); window.__log.push("resume evento=" + evento); p.then(() => window.__log.push("resume ok estado=" + c.state), (e) => window.__log.push("resume erro " + e)); return p; };
    return c;
  };
  P.prototype = O.prototype;
  window.AudioContext = P;
});
await pagina.goto("file:///Users/marcio/_learn/Games/RiverRaid/builds/web/index.html", { waitUntil: "load" });
await pagina.waitForTimeout(600);
await pagina.keyboard.down("Space");
await pagina.waitForTimeout(150);
await pagina.keyboard.up("Space");
await pagina.waitForTimeout(600);
console.log(JSON.stringify(await pagina.evaluate(() => window.__log), null, 1), erros.slice(0,2));
await navegador.close();
