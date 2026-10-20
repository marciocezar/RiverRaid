# River Raid — como jogar e como gerar

Este texto é para quem vai abrir o projeto, jogar e gerar os pacotes. O jogo da janela é uma recriação. O arquivo do cartucho, se estiver em `original/`, é material da Activision e fica só para o estudo local. Não redistribua o cartucho.

A faixa do rio tem sempre 160 por 192 pixels. A janela, o celular e o navegador só ampliam essa faixa e completam o resto com preto. A proporção não estica.

## O que tem em cada pasta

| Pasta | O que guarda |
| --- | --- |
| `assets/graphics` | Desenhos do avião, do helicóptero, do navio, do jato, do posto e da ponte |
| `assets/audio` | Ronco do motor, tiro, explosão, queda, posto e ponte |
| `src/core` | O passo do mapa e o relógio do jogo |
| `src/entities` | O avião, os alvos e as caixas de colisão |
| `src/systems` | Teclado, toque, som e desenho |
| `docs` | Este guia e os textos técnicos |
| `builds/web` | A pasta que o navegador publica, depois do build |
| `original` | O cartucho local, quando ele está na máquina |
| `laboratorio` | A leitura do cartucho, passo a passo |

## Peças e sons

| Arquivo | Na tela ou no alto-falante |
| --- | --- |
| `assets/graphics/plane.png` | Seu avião, amarelo |
| `assets/graphics/heli.png` | Helicóptero |
| `assets/graphics/ship.png` | Navio |
| `assets/graphics/jet.png` | Jato inimigo |
| `assets/graphics/fuel.png` | Posto. Passe por cima para encher o tanque |
| `assets/graphics/bridge.png` | Ponte. Atire no centro vermelho |
| `assets/audio/engine.wav` | Ronco contínuo do jato. Fica mais agudo na marcha alta |
| `assets/audio/shot.wav` | Tiro |
| `assets/audio/boom.wav` | Explosão de um alvo |
| `assets/audio/die.wav` | Queda do avião |
| `assets/audio/fuel.wav` | Reabastecimento |
| `assets/audio/bridge.wav` | Ponte destruída |

Para refazer esses arquivos a partir das máscaras:

```bash
python3 scripts/export_assets.py
```

## O que precisa estar instalado

Para jogar no navegador e gerar a pasta web:

- Node.js 20 ou mais recente
- npm, que vem com o Node

Na primeira vez, na pasta do projeto:

```bash
npm install
```

O Mac nativo (`make run`) pede só o `clang` das Command Line Tools. O Windows nativo pede gcc do MSYS2 ou o Visual Studio. Android pede Android Studio. iOS pede um Mac com Xcode. O aplicativo de Mac e de Windows feito pelo Tauri pede ainda o Rust, em [https://rustup.rs](https://rustup.rs).

## Controles

| Onde | Como se joga |
| --- | --- |
| Mac e Windows, aplicativo nativo ou Tauri | Só o teclado. Não aparece botão na tela |
| Android e iOS | Cruz translúcida e botão de tiro |
| Navegador no computador | Teclado |
| Navegador no celular | Cruz e botão de tiro, porque a página detecta toque |

| Tecla | Efeito |
| --- | --- |
| Enter, ou um clique na faixa | Começa, e também libera o som no navegador |
| Setas ou A D | Esquerda e direita |
| Setas ou W S | Segure para acelerar ou frear. A marcha fica onde você soltou |
| Espaço | Atira |
| 1 2 3 | Marcha lenta, de cruzeiro ou rápida |
| P | Pausa |
| R | Recomeça a partida |
| Esc | Volta à tela de início na versão web. No `make run` do Mac, fecha o programa |

O primeiro clique ou a tecla Enter na tela de início existem porque o navegador bloqueia som até haver um gesto. Sem esse toque o jato fica mudo.

## Gerar as cinco saídas

Todos os comandos rodam na pasta do projeto, depois de `npm install`.

### Web (pasta para publicar)

```bash
npm run build
```

A pasta pronta é `builds/web`. Sirva essa pasta com qualquer hospedagem estática. Para ver na máquina:

```bash
npm run dev
```

Abre em `http://localhost:5173`.

### Windows (`.exe`) e Mac (`.app` / `.dmg`)

Pede o Rust instalado e no `PATH`.

```bash
npm run desktop
```

O Tauri grava o instalador em `src-tauri/target/release/bundle/`. No Mac sai `.app` e `.dmg`. No Windows sai `.exe` (e o instalador MSI, se a máquina tiver as ferramentas). Para abrir em modo de desenvolvimento:

```bash
npm run desktop:dev
```

O aplicativo de mesa usa só o teclado, mesmo que a tela aceite toque.

Há também o laboratório nativo, sem navegador:

```bash
make test
make run
```

No Windows, o comando de compilação está em [executaveis.md](executaveis.md).

### Android (`.apk` / `.aab`)

Pede Android Studio e um aparelho ou emulador. Uma vez por máquina:

```bash
npx cap add android
```

Depois, sempre que o jogo mudar:

```bash
npm run android
```

No Android Studio: Build > Build Bundle(s) / APK(s). O `.apk` serve para instalar direto. O `.aab` é o pacote da Play Store.

### iOS (`.ipa`)

Pede um Mac com Xcode. Uma vez por máquina:

```bash
npx cap add ios
```

Depois:

```bash
npm run ios
```

O Xcode abre o projeto. Para um `.ipa`, use Product > Archive e distribua pela janela do Organizer. A conta de desenvolvedor da Apple só entra nessa etapa de arquivo.

## Conferir sem abrir janela

```bash
npm test
make test
```

Os dois conferem o gerador do cartucho, a queda do combustível, o trecho reto do rio, o resto do scroll e um tiro que marca ponto.
