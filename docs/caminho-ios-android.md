# Caminho para iOS e Android

O núcleo que as duas lojas vão embutir já está compilando no Mac: `src/core/river.c`, `src/core/present.c` e `src/core/audio.c`. Não há SpriteKit, SceneKit nem um motor no meio. O celular recebe um quadro de 160×192 e um fluxo de áudio, e amplia os dois.

## Contrato que a casca do celular implementa

1. Chamar `river_init` uma vez.
2. A cada quadro, por volta de 60 vezes por segundo, traduzir o toque para os bits de `river.h` e chamar `river_set_input` e `river_frame`.
3. Chamar `river_present` e copiar os `RIVER_FRAME_BYTES` para a tela, sem interpolação.
4. Chamar `river_audio_sync` uma vez por quadro, na thread da interface, e `river_audio_render` num callback de áudio a 22050 Hz, mono, 16 bits.
5. Enter, pausa e recomeço viram botões que chamam `river_start`, `river_toggle_pause` e `river_init`, como o teclado faz hoje.

Sugestão de toque, usando os bits que já existem:

| Gesto | Bit |
| --- | --- |
| dedo na metade esquerda | `RIVER_IN_LEFT` |
| dedo na metade direita | `RIVER_IN_RIGHT` |
| botão de acelerar | `RIVER_IN_UP` |
| botão de frear | `RIVER_IN_DOWN` |
| botão de tiro | `RIVER_IN_FIRE` |

## iOS

No Xcode, um alvo iOS para iPhone:

1. Criar um app AppKit não serve; o alvo é iOS, linguagem Swift ou Objective-C na casca.
2. Adicionar ao alvo os arquivos `src/core/river.c`, `src/core/present.c`, `src/core/river.h` e `src/core/present.h`.
3. No Bridging Header, importar `river.h` e `present.h`.
4. Num `UIView`, guardar um `RiverGame` e um buffer de `RIVER_FRAME_BYTES`.
5. No `CADisplayLink`, rodar `river_frame` e `river_present`.
6. Desenhar com `CGContext` e `kCGInterpolationNone`, no mesmo jeito de `src/platform/macos/main.m`.

O simulador do Xcode basta para a primeira versão. O núcleo não usa API de Mac, então o mesmo `.c` entra no alvo iOS sem `#ifdef`.

## Android

O arquivo `src/platform/android/CMakeLists.txt` já monta a biblioteca estática `riverlab` com os dois `.c`. No Android Studio:

1. Criar um projeto com C++ / NDK.
2. Apontar o `externalNativeBuild` para esse `CMakeLists.txt`, ou copiar as duas linhas `add_library` para o `CMakeLists.txt` do módulo.
3. No Kotlin, declarar:

```kotlin
external fun riverInit()
external fun riverFrame(input: Int)
external fun riverPresent(pixels: ByteArray)
```

4. A implementação JNI, em C, chama `river_init`, `river_set_input`, `river_frame` e `river_present`.
5. Um `SurfaceView` ou um `Bitmap` ARGB_8888 recebe os pixels. O Android usa ARGB; na ponte, trocar a ordem dos bytes R e B uma vez por quadro. São 30 mil pixels, irrelevante.
6. `Choreographer.FrameCallback` marca o tempo, no lugar do `NSTimer` do Mac.

## Ordem prática quando for abrir a loja

1. Manter `make test` verde. Ele protege o gerador do cartucho e o desenho do avião.
2. Fazer a casca iOS só copiando o quadro, sem mudar `river.c`.
3. Repetir no Android com a biblioteca do CMake.
4. Só então trazer para o núcleo alguma lacuna que o laboratório ainda não fechou, como o placar exato da tabela `$FE53`. Essa mudança vale para as quatro plataformas de uma vez.
