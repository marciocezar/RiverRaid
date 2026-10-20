# Imagem e som

Este texto explica a mesma coisa duas vezes. A primeira parte é para quem está abrindo o projeto agora. A segunda é o mapa técnico, com endereço do cartucho e arquivo do fonte.

## Se você está começando

O River Raid original não tinha uma tela de desenho. O Atari 2600 pintava a televisão linha por linha, com peças de poucos pixels. As duas fotos em `imgs/` (`img1.jpg` e `img2.jpg`) são a referência desta recriação: água azul chapada, margem verde chapada, peças pequenas e um painel cinza embaixo.

Cada pixel do quadro de 160×192 é um quadrado só. A janela do Mac amplia esse quadro com vizinho mais próximo, então a borda continua reta. Não há relevo nem sombra nas peças.

O que você deve reconhecer:

| O que você vê | O que é | O que fazer |
| --- | --- | --- |
| Avião amarelo, embaixo, acima do painel | seu avião | setas ou A D |
| Corpo escuro com rotor amarelo | helicóptero | atire |
| Casco azul, faixa laranja, cabine preta | navio | atire |
| Forma preta com faixa laranja | jato inimigo | desvie ou atire |
| Placa vertical com as letras FUEL | posto de combustível | passe por cima; atirar destrói |
| Faixa cinza de margem a margem, miolo vermelho | ponte | atire no miolo para abrir a seção |
| Painel cinza: pontos amarelos, número de vidas, barra entre E e F | placar | a barra esvazia; no zero o avião cai |

O som também segue os dois alto-falantes internos do Atari, que na prática são dois canais:

- Um ronco contínuo enquanto você voa. Fica mais agudo na marcha rápida.
- Um apito quando o combustível entra na reserva.
- Um estalo curto no tiro.
- Um ruído mais longo quando algo explode ou quando você cai.
- Um tom quando o posto reabastece e outro, mais grave, quando a ponte abre.

Não é o áudio amostra por amostra do cartucho. É o mesmo papel de cada canal, com os mesmos tipos de onda que o programa original pede ao chip de vídeo.

## Se você já programa

### Imagem

O TIA só oferece, por linha:

- o playfield `PF0` `PF1` `PF2`, que aqui são as margens
- dois sprites de jogador, `GRP0` e `GRP1`, 8 bits por linha
- mísseis e a bola

O miolo que escreve esses registradores está espalhado a partir de `$F13A`, escolhido pela tabela empilhada em `$F0DA` (ver `laboratorio/05-evidencias/leituras-do-binario.md`). Os bytes gráficos da página `$FE00` são alcançados por ponteiros cuja parte baixa sai de `$FFC8` e cuja parte alta nasce em `$FE` na cópia inicial de `$FDB1`. Esta passagem não fechou o índice “este Y é o helicóptero” linha a linha. Por isso `present.c` não cola esses bytes crus na tela.

O que está no fonte são silhuetas desenhadas para bater com `imgs/img1.jpg` e `imgs/img2.jpg`: avião amarelo de 5×5, helicóptero de lado, navio achatado, jato preto e a placa FUEL. Cada caractere da máscara é um pixel do quadro de 160×192. A casca amplia com interpolação desligada. O painel ocupa as linhas 164 a 191: pontuação, vidas e a barra horizontal entre E e F.

Contrato do quadro, para qualquer plataforma:

- `river_present(jogo, rgba)`
- 160 × 192 pixels
- 4 bytes, ordem R, G, B, A, alfa 255
- a linha 0 é o topo

### Som

No cartucho a rotina fica imediatamente antes do `VSYNC`, em `$F7D4`–`$F805`.

| Registrador | Endereço | O que a rotina escreve |
| --- | --- | --- |
| `AUDC0` | `$15` | `$08` no motor (ruído de 9 bits do TIA). `$0C` no aviso de combustível baixo (`$B7` comparado com `$40` em `$F78D`) |
| `AUDF0` | `$17` | divisor. No motor, sai de `$B5` deslocado e ajustado em `$F7BD` |
| `AUDV0` | `$19` | volume. No motor, um byte de `$FFBE` indexado pelos dois bits baixos de `$84` |
| `AUDC1` | `$16` | `$08` no ruído de evento, `$0C` num tom curto |
| `AUDF1` | `$18` | divisor do canal 1 |
| `AUDV1` | `$1A` | volume. No evento longo, `$FA` conta o decaimento (`$F6C5` carrega `$17` em `$FA`) |

`src/core/audio.c` reproduz esses dois papéis, não o relógio exato de 30 kHz do TIA:

- canal 0: ruído (LFSR de 9 bits) enquanto `phase` é jogo; tom quadrado pulsado se `fuel < 28`
- canal 1: envelopes curtos disparados pelos bits `RIVER_SFX_*`

A simulação só liga o bit (`g->sfx`). Quem zera é `river_audio_sync`, chamado na casca uma vez por quadro, na thread da janela. `river_audio_render` roda na thread de áudio e só lê contadores atômicos. Taxa: `RIVER_AUDIO_RATE` = 22050 Hz, mono, 16 bits com sinal.

| Evento no jogo | Bit | Envelope |
| --- | --- | --- |
| tiro criado | `RIVER_SFX_SHOT` | ruído, cerca de 80 ms |
| alvo destruído | `RIVER_SFX_BOOM` | ruído que cai, cerca de 200 ms |
| queda do avião | `RIVER_SFX_DIE` | ruído mais longo, cerca de 330 ms |
| ponte aberta | `RIVER_SFX_BRIDGE` | tom grave, cerca de 250 ms |
| contato com o posto | `RIVER_SFX_FUEL` | tom agudo, cerca de 100 ms, no máximo a cada 16 quadros |

No Mac a casca é AudioToolbox (`AudioQueue`), em `src/platform/macos/main.m`. No Windows é `waveOut` (`winmm`), em `src/platform/windows/main.c`. No Android a biblioteca `riverlab` exporta `river_audio_render`; o app copia o PCM para um `AudioTrack`. O iOS faz o mesmo com `AVAudioEngine` ou um callback de `AudioUnit`.

### O que ainda não é o original

- O kernel do TIA não é executado. As margens do rio usam o gerador `$FAC6`, com uma regra de largura escrita neste laboratório.
- Os bytes exatos de `GRP0` de cada tipo de alvo continuam lacuna. A silhueta é fiel ao papel de cada peça, não uma extração fechada da página `$FE00`.
- O som não passa no mesmo contador de clocks do 6507. Volume e duração são da recriação, escolhidos para a função de cada canal bater com a rotina acima.
