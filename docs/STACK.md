# Stack

## Núcleo e web

| Componente | Versão | Função |
| --- | --- | --- |
| Node.js | 24.18 | npm, testes e build |
| TypeScript | 7.0.2 | tipagem; o Node executa os testes direto do `.ts` (remoção de tipos) |
| Phaser | 4.2.1 | renderização 2D e entrada na web |
| Vite | 8.3.4 | desenvolvimento e build HTML5 |
| vite-plugin-singlefile | 2.3.3 | gera um único `index.html`, que abre por duplo clique |
| Playwright | latest | capturas de tela e testes de navegador (`tools/capturas/`) |

Observação para o código: o modo de remoção de tipos do Node não aceita propriedades de
parâmetro (`constructor(private x)`) nem `enum`, e exige `import type` para tipos. Por isso o
núcleo usa campos explícitos e importações de tipo.

## Desktop (Tauri)

| Componente | Versão | Função |
| --- | --- | --- |
| @tauri-apps/cli | 2.12.3 | comando `tauri build` |
| crate `tauri` | 2.12 | janela e empacotamento |
| Rust | 1.99.1 | compilação |

Arquivos: `src-tauri/` (`tauri.conf.json`, `src/main.rs`, `capabilities/`). O Tauri roda
`npm run build:desktop` e embute `builds/desktop`.

- **macOS** (`make build-mac`): gera `River Raid.app`. Não está assinado. Na primeira
  abertura, use Controle + clique > Abrir.
- **Windows** (`make build-win`): compilação cruzada a partir do Mac, com o target
  `x86_64-pc-windows-msvc`, `cargo-xwin` como runner e o LLVM do Homebrew (`llvm-rc` e
  `clang-cl`, necessários para embutir o ícone e os metadados). Gera só o `.exe` (sem
  instalador). Os arquivos do SDK do Windows ficam em `tools/xwin-cache/`. O `.exe` é PE32+
  x86-64 e foi verificado no cabeçalho, mas **não foi executado**. O WebView2 precisa estar
  instalado no Windows (já vem no Windows 10 e 11 atualizados).

## Mobile (Capacitor)

| Componente | Versão | Função |
| --- | --- | --- |
| @capacitor/core, ios, android, cli | 8.5.3 | projetos nativos e sincronização |

Arquivos: `capacitor.config.ts` (aponta para `builds/mobile`), `ios/`, `android/`.
`make build-mobile` gera o HTML mobile e cada alvo chama `npx cap sync`.

**iOS** (`make build-ios`): Xcode 27.1 com o SDK do simulador iOS 27.1. O build roda com
`CODE_SIGNING_ALLOWED=NO` e grava os intermediários em `builds/.xcode`. O app foi instalado e
aberto no iPhone 18 Pro (simulador) com `xcrun simctl`, e a captura mostra o título com a faixa
de controles. Para aparelho real e App Store, é preciso uma equipe de assinatura no Xcode.

**Android** (`make build-android`): precisa de um JDK e do Android SDK.

- SDK: `tools/android-sdk/` (command-line tools, platform-tools, platforms;android-35,
  build-tools;35.0.0). É instalado pelo `sdkmanager` dentro do projeto e fica fora do git.
- JDK: **25**. O Capacitor exige `source release 21` ou mais, então o JDK 17 não serve. O
  Gradle não roda em JDK 26 (erro de versão de classe). O Makefile localiza o JDK 25 com
  `/usr/libexec/java_home -v 25`.
- Gradle: **9.5.0**, fixado no wrapper. O `cap sync` pode trocar o wrapper para uma versão
  incompatível com o plugin do Android (AGP 8.13): o 9.7 quebra essa combinação. Por isso
  `make build-android` reescreve o wrapper para 9.5.0 antes de compilar.
- Resultado: `builds/android/app-debug.apk`, 4,5 MB. **Não foi instalado em aparelho nem em
  emulador.**

## Ferramentas de análise do ROM

| Ferramenta | Situação |
| --- | --- |
| `tools/rom/disasm6502.py` | desmontador próprio; gera a listagem em `docs/analise/` |
| `tools/rom/cpu6502.py` | emulador 6502 mínimo; roda o ROM e registra as escritas do TIA |
| REA (`tools/rea`) | clone do `morluto/rea`, **sem uso** |

O REA suporta binário bruto de 6502, mas só com o provedor Ghidra. Ghidra, Hopper e IDA não
estão instalados, e o `objdump` do sistema não tem alvo 6502. A análise foi feita com as
ferramentas acima. Para usar o REA de verdade, é preciso instalar o Ghidra, o que está fora da
pasta do projeto e precisa de aprovação.

## Pré-requisitos por alvo

| Alvo | Precisa de |
| --- | --- |
| `build-web`, `build-mac` | Node, npm, Rust |
| `build-win` | Rust com o target `x86_64-pc-windows-msvc`, LLVM (`brew install llvm`) |
| `build-android` | JDK 25, Android SDK em `tools/android-sdk` |
| `build-ios` | Xcode com um SDK de simulador iOS |
