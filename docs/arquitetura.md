# Arquitetura

O jogo é um núcleo em C e uma casca por sistema. A regra não desenha, e o desenho não decide colisão. Quem muda de plataforma troca a casca e leva o mesmo quadro.

```
teclado ou toque
        |
        v
casca do sistema          Mac:     src/platform/macos/main.m
(janela, relógio, input)  Windows: src/platform/windows/main.c
        |                 iOS e Android: ainda a casca, o núcleo já está pronto
        v
src/core/river.c          estado e um quadro de simulação
        |
        v
src/core/present.c        quadro RGBA 160×192, primeira linha no topo
src/core/audio.c          amostras mono 22050 Hz, dois canais no papel do TIA
        |
        v
a casca amplia o quadro sem borrar e toca as amostras
```

## O que cada arquivo faz

| Arquivo | Responsabilidade |
| --- | --- |
| `src/core/river.h` | O estado `RiverGame` e os bits de entrada |
| `src/core/river.c` | Rio, tiro, combustível, pontuação, colisão |
| `src/core/present.h` | O contrato do quadro: `RIVER_FRAME_BYTES` e `river_present` |
| `src/core/present.c` | Pixel art de 8 colunas, ampliada, da ponte e da barra |
| `src/core/audio.c` | Motor, alerta, tiro, explosão, posto e ponte |
| `src/core/test_river.c` | Gerador do cartucho, combustível, tiro e presença do avião |
| `src/platform/macos/main.m` | Janela Cocoa, teclado, amplia o quadro |
| `src/platform/windows/main.c` | Janela Win32, teclado, amplia o quadro |
| `src/platform/android/CMakeLists.txt` | Biblioteca estática com os dois `.c` do núcleo |

`RiverGame` é uma struct só. As margens são dois vetores de 192 bytes. Os alvos são oito posições fixas. Não há alocação no meio do quadro. Isso cabe num celular antigo e num console de 4 KB de ROM, que era o ponto de partida do estudo.

## O contrato que as plataformas compartilham

Entrada, um inteiro de bits definido em `river.h`:

`RIVER_IN_LEFT`, `RIVER_IN_RIGHT`, `RIVER_IN_UP`, `RIVER_IN_DOWN`, `RIVER_IN_FIRE`.

Saída visual, `river_present`:

- largura 160, altura 192
- 4 bytes por pixel, ordem R, G, B, A
- a linha 0 é o topo
- o alfa fica em 255

Quem for fazer a versão de iOS ou de Android não redesenha o avião nem regrava o som. Copia o buffer para a tela, pede amostras a `river_audio_render` e liga os mesmos bits a partir do toque. O detalhe de cada sprite e de cada canal está em [imagem-e-som.md](imagem-e-som.md).

## O que não entra no núcleo

Som, rede, loja, conta de jogador e motor de jogo. O executável do Mac liga só o framework Cocoa, que já vem no sistema. O do Windows liga `user32` e `gdi32`, que já vêm no Windows.

O clone do REA em `ferramentas/rea` é a ferramenta de estudo. O Makefile do jogo não compila esse repositório.
