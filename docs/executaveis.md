# Como gerar os executáveis

Os comandos assumem a pasta do projeto, a que contém o `Makefile`.

## Mac

Pré-requisito: as Command Line Tools. Se `clang` não existir:

```bash
xcode-select --install
```

Gerar e abrir:

```bash
make test
make run
```

O executável fica em `build/river-raid`. `make test` não abre janela: confere o gerador do cartucho, o combustível, o tiro e se o avião aparece no quadro.

Só compilar, sem abrir:

```bash
make
```

Para levar o programa a outra pessoa no Mac, copie o arquivo `build/river-raid`. Na primeira abertura o sistema pode pedir confirmação, porque o binário não está assinado para a App Store. Isso é um laboratório local, não um pacote de loja.

## Windows

O fonte da janela é `src/platform/windows/main.c`. Ele usa a mesma simulação e o mesmo desenho do Mac. Este Mac não produz o `.exe`; a compilação é feita numa máquina Windows.

Com o prompt x64 Native Tools do Visual Studio:

```bat
cl /std:c11 /O2 /I src\core /Fe:river-raid.exe src\core\river.c src\core\present.c src\core\audio.c src\platform\windows\main.c user32.lib gdi32.lib winmm.lib
```

Com MSYS2 e o mingw-w64:

```bash
pacman -S mingw-w64-x86_64-gcc
gcc -std=c11 -O2 -I src/core -I src/systems -I src/entities -o river-raid.exe src/core/river.c src/systems/present.c src/systems/audio.c src/platform/windows/main.c -lgdi32 -luser32 -lwinmm -mwindows
```

O `-mwindows` abre só a janela, sem console. O resultado é `river-raid.exe` na pasta atual.

As teclas são as mesmas do Mac: setas ou WASD, espaço, Enter, P, R, 1, 2, 3 e Esc.

## O que não vira executável

`laboratorio/04-disassembly/disasm6502.py` é ferramenta de leitura. Roda com `python3` e reescreve a listagem do 6502. `ferramentas/rea` é o clone do REA, separado do jogo.
