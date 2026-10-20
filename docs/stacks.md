# Linguagem, stacks e ambientes

## Linguagem

O jogo em si está em **C11**. É a mesma linguagem nos quatro alvos: Mac, Windows, iOS e Android. Não há coleta de lixo, não há runtime de jogo e o quadro não aloca memória.

A casca do Mac está em **Objective-C**, só porque a janela do sistema é Cocoa. A casca do Windows está em **C** com a API Win32. Num iOS futuro a casca pode ser Swift ou Objective-C. No Android, Kotlin ou Java chamam a biblioteca C pelo NDK. A regra e o desenho continuam nos `.c`.

O laboratório de leitura do cartucho usa **Python 3** da biblioteca padrão, no desmontador `laboratorio/04-disassembly/disasm6502.py`. Esse script não entra no executável.

## O que cada stack contém

| Camada | Tecnologia | Entra no executável? |
| --- | --- | --- |
| Simulação | C11, `src/core/river.c` | sim |
| Desenho | C11, `src/core/present.c`, quadro de 160×192 | sim |
| Som | C11, `src/core/audio.c`, 22050 Hz, dois canais | sim |
| Mac | Objective-C, Cocoa, Core Graphics, AudioToolbox | sim, só no Mac |
| Windows | C, Win32, GDI, waveOut (`winmm`) | sim, só no Windows |
| Teste de mesa | C11, `test_river.c` | não; é o `make test` |
| Desmontador | Python 3 | não |
| REA | Node.js, no clone em `ferramentas/rea` | não |

Não usamos SDL, Unity, Godot, SpriteKit nem um canvas de navegador. O desenho é um buffer de pixels ampliado com vizinho mais próximo, para o traço continuar quadrado, como no Atari.

## Ambientes suportados

| Ambiente | Estado neste laboratório | O que precisa estar instalado |
| --- | --- | --- |
| macOS com Xcode Command Line Tools | jogável agora, `make run` | `clang`, framework Cocoa |
| Windows 10 ou 11, 64 bits | fonte pronto em `src/platform/windows/main.c` | Visual Studio Build Tools **ou** MSYS2 com mingw-w64 |
| iOS | núcleo pronto para embutir; ainda não há projeto Xcode | Xcode, um alvo iOS |
| Android | `CMakeLists.txt` do núcleo pronto; ainda não há app Gradle | Android Studio, NDK |
| Teste sem janela | `make test` no Mac | o mesmo `clang` |

O binário do Mac gerado aqui é da arquitetura desta máquina (Apple Silicon ou Intel, a que o `clang` local produz). O fonte do Windows está escrito para x64.

## Por que esta escolha aguenta o celular

O quadro inteiro tem 160 × 192 × 4 bytes, cerca de 123 KB. A simulação percorre 192 linhas e no máximo 8 alvos. Isso roda a 60 quadros por segundo sem GPU de verdade: a GPU, quando existir, só amplia o retângulo. O mesmo `.c` compila para o simulador iOS, para um aparelho Android e para o Windows sem reescrever a regra.
