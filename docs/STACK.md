# Stack

Cinco saídas, uma base de jogo. O quadro, o mapa e o som estão em TypeScript. O Phaser só amplia o `ImageData` e chama `update` a cada refresh. Tauri e Capacitor empacotam essa mesma pasta `builds/web`. Não há uma segunda regra de jogo por sistema.

O laboratório em C11 (`make run` no Mac, `gcc` no Windows) implementa as mesmas constantes e é conferido pelos mesmos vetores. Ele existe para ler o núcleo sem Node. O pacote que vai para as cinco plataformas é o da árvore TypeScript.

## Pacotes

| Pacote | Onde entra | Para quê |
| --- | --- | --- |
| `typescript` 5.8 | desenvolvimento | Tipos estritos, `tsc --noEmit` antes do build |
| `vite` 6 | desenvolvimento e web | Servidor e pasta `builds/web` |
| `tsx` | `npm test` | Roda `src/core/selftest.ts` sem canvas |
| `phaser` 3.88 | runtime | Loop, `Scale.FIT`, textura de canvas, `pixelArt` |
| `@capacitor/core` e `@capacitor/cli` 7 | celular | Embrulha `builds/web` num projeto nativo |
| `@capacitor/android`, `@capacitor/ios` | celular | Projetos Gradle e Xcode, depois de `cap add` |
| `@tauri-apps/cli` 2 | Mac e Windows | Abre uma janela nativa em cima do mesmo front |
| Tauri (crate Rust) 2 | `src-tauri` | Binário `.app`, `.dmg`, `.exe` |

Não há runtime de jogo além do Phaser, e o Phaser não decide colisão. Não há SDL, Godot nem emulador de 6502 no executável.

`ferramentas/rea` é o clone de [morluto/rea](https://github.com/morluto/rea.git), usado como método de leitura. O alvo desta passagem é uma imagem 6502 de 4 KB. O REA não tinha, nesta máquina, um motor 6502 ligado (Ghidra, IDA ou Hopper). A listagem que fechou `$FAC6`, `$F63A`, `$F78D` e `$F8E2`–`$F92F` foi gerada por `laboratorio/04-disassembly/disasm6502.py` sobre `original/River Raid (1982) (Activision) [!].a26`, com o mesmo critério do REA: observação, derivação, inferência e lacuna. O clone não entra no `npm run build`.

## Uma base, cinco cascas

```
src/**/*.ts  +  assets/
        |
        |  vite build
        v
   builds/web          HTML, JS, CSS, WASM não é necessário:
                       o quadro cabe em JS puro a 60 fps
        |
        +-- navegador          a própria pasta
        +-- Tauri              src-tauri aponta frontendDist para ../builds/web
        +-- Capacitor          capacitor.config.json aponta webDir para builds/web
```

A detecção da casca está em `src/platform.ts`.

| Casca | Como é reconhecida | Entrada |
| --- | --- | --- |
| Desktop | `window.__TAURI_INTERNALS__` ou `window.__TAURI__` | Teclado apenas. O HUD nem é montado para receber ponteiro |
| Celular | `window.Capacitor.isNativePlatform()` | Cruz e botão de tiro, sempre |
| Web | o resto | Se existe `ontouchstart`, mostra o HUD. Se não existe, só o teclado |

`ontouchstart` é o teste pedido. Não usamos `maxTouchPoints`, porque um trackpad de notebook pode inflar esse número e acender o HUD num Mac que deveria ficar no teclado.

O áudio da web chama `AudioContext.resume()` no primeiro `pointerdown` ou no Enter. Tauri e Capacitor passam pela mesma função; no aplicativo nativo o gesto da tela de início também vale, e o contexto não fica bloqueado depois disso.

## Web

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # escreve builds/web
npm run preview  # serve a pasta gerada
```

`vite.config.ts` fixa `outDir` em `builds/web` e `target` em `es2022`. A página é `index.html`. O canvas nasce com 160×192 e o Phaser o encaixa na janela com `FIT` e `CENTER_BOTH`. CSS: `image-rendering: pixelated` e fundo preto.

Publicar é copiar `builds/web` para o host estático. Não há servidor de jogo.

## Mac e Windows pelo Tauri

`src-tauri/tauri.conf.json` aponta `frontendDist` para `../builds/web` e, em desenvolvimento, para `http://localhost:5173`. A janela nasce em 480×820 e pode ser redimensionada: o FIT recalcula a faixa e mantém 160:192.

```bash
# Rust estável no PATH: https://rustup.rs
npm run desktop:dev
npm run desktop
```

Saída de release: `src-tauri/target/release/bundle/`.

| Sistema | Artefato |
| --- | --- |
| macOS | `.app` e `.dmg` |
| Windows | `.exe` (NSIS) e, se o toolchain WiX estiver presente, MSI |

O perfil `release` do `Cargo.toml` liga LTO e `opt-level = 3`. O binário não embute Node. Teclado exclusivo: `wantsTouchHud` devolve falso assim que a casca é Tauri, inclusive num laptop com tela de toque.

O `make run` continua gerando o binário Cocoa do laboratório, sem Tauri. São duas portas de entrada no Mac; a regra de jogo conferida pelo teste é a mesma.

## Android e iOS pelo Capacitor

`capacitor.config.json`:

```json
{
  "appId": "local.riverraid.lab",
  "appName": "River Raid",
  "webDir": "builds/web"
}
```

```bash
npx cap add android    # uma vez, pede Android Studio
npx cap add ios        # uma vez, pede Xcode num Mac
npm run android        # build web + cap sync android
npm run ios            # build web + cap sync ios
```

`cap sync` copia `builds/web` para o projeto nativo. O WebView é o jogo. A casca Capacitor marca `isNativePlatform()`, então a cruz aparece mesmo que alguém teste num simulador sem o evento de toque ainda disparado.

| Loja | O que o IDE gera |
| --- | --- |
| Android | `.apk` para instalar, `.aab` para a Play Store, ambos pelo menu Build do Android Studio |
| iOS | `.ipa` pelo Archive do Xcode |

Não há código Kotlin nem Swift de regra. Um projeto nativo futuro que queira o núcleo em C liga `src/platform/android/CMakeLists.txt` (`riverlab`) e desenha o mesmo quadro de `river_present`. Esse caminho não substitui o Capacitor; é a porta do laboratório.

## Por que esta combinação aguenta 60 fps

O estado do quadro é pequeno: 192×4 bytes de mapa, 8 alvos, um inteiro de combustível, um acumulador de scroll. O desenho é um buffer de CPU. A GPU, quando o Phaser escolhe WebGL, só apresenta a textura. Não há física de engine, não há atlas dinâmico, não há coleta de lixo obrigatória no meio do quadro (os atores são reaproveitados).

No navegador o limite prático é o `putImageData` de 123 KB mais o FIT. Nos binários Tauri e Capacitor o mesmo JS roda no WebView do sistema, com o mesmo orçamento. O binário C do laboratório faz o equivalente em `river_present` e entrega o buffer ao Cocoa ou ao GDI.

## O que fica de fora de propósito

- Emulador de TIA. O kernel de `$F13A` não é executado.
- Bytes crus de `GRP0` como sprite. As máscaras são desenhos da recriação, exportados para `assets/graphics`.
- WASM. O quadro não precisa de módulo nativo para segurar 60 fps. A pasta web é JS.
- Rede, conta e loja dentro do jogo.
