// Ponto de entrada: monta o Phaser com a proporção da área de jogo fixa em 160x192.
import Phaser from "phaser";
import { ALTURA_CONTROLES, ALTURA_JOGO, LARGURA_TELA } from "./core/config.ts";
import { CenaTitulo } from "./cenas/titulo.ts";
import { CenaJogo } from "./cenas/jogo.ts";
import { ESCALA } from "./render/escala.ts";
import { CenaGaleria } from "./cenas/galeria.ts";
import { usarHudToque } from "./plataforma.ts";
import { som } from "./systems/instancias.ts";

// O canvas tem ESCALA vezes a resolução lógica; as cenas aplicam zoom ESCALA na câmera.
const altura = ALTURA_JOGO + (usarHudToque() ? ALTURA_CONTROLES : 0);

// Política de áudio: WebKit (Mac com Tauri, iOS com Capacitor) só libera o AudioContext
// quando a criação ou o resume acontece dentro de um evento direto do usuário. Por isso o
// desbloqueio roda no próprio evento DOM, e não no laço do Phaser.
for (const evento of ["pointerdown", "touchend", "keydown", "click"] as const) {
  window.addEventListener(evento, () => som.desbloquear(), { capture: true, passive: true });
}
// M liga ou desliga o som em qualquer tela, sem disputar com os controles de jogo.
window.addEventListener("keydown", (e) => {
  if (e.code === "KeyM" && !e.repeat) som.alternar();
});
// Ao voltar para o primeiro plano (app minimizado, aba reaberta), o sistema pode ter suspendido o áudio.
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") som.desbloquear();
});

new Phaser.Game({
  type: Phaser.AUTO,
  parent: "jogo",
  width: LARGURA_TELA * ESCALA,
  height: altura * ESCALA,
  backgroundColor: "#000000",
  pixelArt: true,
  roundPixels: true,
  scale: {
    // FIT preserva a proporção; nada é esticado. Com pixelArt o zoom não suaviza.
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  // ?galeria abre a tela de revisão da arte; o jogo normal começa no título.
  scene: new URLSearchParams(window.location.search).has("galeria") ? [CenaGaleria] : [CenaTitulo, CenaJogo],
});
