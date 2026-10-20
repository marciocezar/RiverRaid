// Teste isolado de AudioContext no WebKit: criar e retomar dentro de um evento de tecla.
import { webkit } from "playwright";
const navegador = await webkit.launch();
const pagina = await navegador.newPage();
await pagina.setContent(`<html><body><script>
  window.log = [];
  window.addEventListener('keydown', async () => {
    try {
      const ctx = new AudioContext();
      window.log.push('criado: ' + ctx.state);
      const osc = ctx.createOscillator();
      osc.connect(ctx.destination);
      osc.start();
      await ctx.resume();
      window.log.push('depois do resume: ' + ctx.state);
    } catch (e) { window.log.push('erro: ' + e.message); }
  }, true);
</script></body></html>`);
await pagina.keyboard.down("Space");
await pagina.keyboard.up("Space");
await pagina.waitForTimeout(500);
console.log(JSON.stringify(await pagina.evaluate(() => window.log)));
await navegador.close();
