// Controle: retomar o AudioContext fora de um gesto (como o laço do Phaser fazia) no WebKit.
import { webkit } from "playwright";
const navegador = await webkit.launch();
const pagina = await navegador.newPage();
await pagina.setContent(`<html><body><script>
  window.res = {};
  const ctx = new AudioContext();
  window.res.criado = ctx.state;
  setTimeout(() => { ctx.resume().then(() => { window.res.depoisDoResumeForaDoGesto = ctx.state; }); }, 300);
  window.addEventListener('keydown', () => { window.res.ctxKeydown = 'ok'; }, true);
</script></body></html>`);
await pagina.waitForTimeout(800);
console.log(JSON.stringify(await pagina.evaluate(() => window.res)));
await navegador.close();
