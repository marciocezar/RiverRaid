# River Raid — laboratório

A versão para navegador, Mac, Windows, Android e iOS está descrita em [docs/README.md](docs/README.md). Na pasta do projeto: `npm install` e `npm run dev`. O mapa, o scroll e o combustível dessa versão são os mesmos do núcleo em C conferido por `make test`.

Estudo do cartucho Atari 2600 *River Raid* (Activision, 1982) e uma recriação jogável no teclado. O jogo que abre na tela não é o ROM executado num emulador: é um programa novo, em C, escrito para dar para ler. O ROM fica ao lado, como alvo da análise.

O arquivo `River Raid (1982) (Activision) [!].a26` é material da Activision. Ele fica nesta pasta para o estudo local. Não redistribua o cartucho.

## Como gerar e jogar

No Mac:

```bash
make test
make run
```

O passo a passo do executável do Mac e do `.exe` do Windows está em [docs/executaveis.md](docs/executaveis.md). A linguagem, as stacks e os ambientes estão em [docs/stacks.md](docs/stacks.md).

`make test` confere o gerador de números do cartucho e dois comportamentos da recriação. `make run` abre a janela.

| Tecla | Efeito |
| --- | --- |
| Enter | começa, ou segue depois do fim de jogo |
| setas ou A D | esquerda e direita |
| setas ou W S | acelera e freia |
| espaço | atira |
| 1 2 3 | escolhe a velocidade direto |
| P | pausa |
| R | recomeça a partida |
| Esc | sai |

O painel da direita mostra placar, vidas, combustível, seção, o gerador (`E9` / `EA`) e a legenda dos alvos. Na água: avião cinza embaixo, helicóptero amarelo, navio branco, jato vermelho, posto laranja e a ponte cinza com o centro vermelho. A barra da direita é o combustível. O ronco do motor acompanha a marcha; o apito entra quando o combustível baixa. O mapa da imagem e do som está em [docs/imagem-e-som.md](docs/imagem-e-som.md).

## Como estudar

Leia nesta ordem:

1. [laboratorio/LEIA-ME.md](laboratorio/LEIA-ME.md) — o percurso
2. [laboratorio/00-metodo/como-o-rea-entra-neste-laboratorio.md](laboratorio/00-metodo/como-o-rea-entra-neste-laboratorio.md) — o que o REA é, e o que esta análise fez sem ele
3. [laboratorio/01-alvo/ficha-do-cartucho.md](laboratorio/01-alvo/ficha-do-cartucho.md) — o arquivo que está na pasta
4. [laboratorio/02-hardware/atari-2600.md](laboratorio/02-hardware/atari-2600.md) — 6507, TIA e RIOT
5. [laboratorio/05-evidencias/leituras-do-binario.md](laboratorio/05-evidencias/leituras-do-binario.md) — o que o binário mostra
6. [laboratorio/06-mecanicas/regras-da-recriacao.md](laboratorio/06-mecanicas/regras-da-recriacao.md) — o que o jogo jogável implementa
7. [docs/arquitetura.md](docs/arquitetura.md) — núcleo, quadro de pixels e cascas
8. [docs/stacks.md](docs/stacks.md) — linguagem, stacks e ambientes
9. [docs/imagem-e-som.md](docs/imagem-e-som.md) — o que cada desenho e cada som significam
10. [docs/executaveis.md](docs/executaveis.md) — Mac e Windows
11. [docs/caminho-ios-android.md](docs/caminho-ios-android.md) — como embutir o mesmo núcleo no celular

O código que vale a pena ler primeiro é [src/core/river.c](src/core/river.c). A função `river_lfsr_step` é a transcrição da rotina `$FAC6`. O desenho está em [src/core/present.c](src/core/present.c). O som está em [src/core/audio.c](src/core/audio.c).

## O que tem na pasta

```
River Raid (1982) (Activision) [!].a26   cartucho local, 16 KB
laboratorio/                              análise e anotações
src/core/                                 regras e pixel art, em C, sem janela
src/platform/macos/                      teclado e janela no Mac
src/platform/windows/                    teclado e janela no Windows
src/platform/android/                    CMake do núcleo para o NDK
docs/                                     arquitetura, stacks, executáveis, celular
ferramentas/rea/                          clone raso de https://github.com/morluto/rea.git
```

Para refazer a listagem do 6502:

```bash
python3 laboratorio/04-disassembly/disasm6502.py
```

Isso reescreve `listing.asm`, `mapa.json` e `resumo.txt` a partir do `.a26`.
