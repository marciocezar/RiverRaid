# Arquitetura

A simulação não desenha e o desenho não decide colisão. O mesmo quadro serve ao navegador, ao Tauri e ao Capacitor. O laboratório em C (`src/core/river.c`, `src/systems/present.c`, `src/systems/audio.c`) repete as mesmas regras para o `make run`, e os dois lados travam os mesmos vetores de teste.

```
teclado ou toque
        |
        v
src/systems/input.ts     escolhe os bits e esconde o HUD no desktop
        |
        v
src/core/loop.ts         um quadro, sem Phaser
        |
        +-- src/core/lfsr.ts          passo $FAC6, sem import de tela
        +-- src/core/river.ts         margens, ilha, scroll fracionário
        +-- src/entities/player.ts    marcha e tiro
        +-- src/systems/collision.ts  caixas, posto, ponte, combustível
        |
        v
src/systems/render.ts    ImageData 160×192
src/systems/audio.ts     dois canais no papel do TIA
        |
        v
Phaser Scale.FIT         amplia sem esticar a faixa
```

## Componentes, sem alocação no quadro

Cada alvo é um registro fixo de oito posições. Os componentes moram no próprio registro: espécie (`kind`), posição (`x`, `y`), velocidade (`vx`), caixa (`w`, `h`) e `timer`. O quadro percorre esse vetor. Não há `new` no meio do frame, e o mapa do rio é três `Uint8Array` de 192 bytes (margem esquerda, margem direita, ilha).

O gerador não importa `render.ts`. Dá para avançar dez mil quadros num teste de Node sem canvas e sem áudio. É o que `npm test` faz.

A caixa de impacto não é o retângulo do PNG. `src/entities/hitbox.ts` aplica um inset quando a máscara tem borda vazia. O avião colide com 5×4, menor que o sprite 7×6. O tiro na ponte só vale numa faixa de 12 pixels no centro; encostar na ponte inteira ainda derruba o avião.

## O LFSR, transcrito

Rotina `$FAC6` do cartucho, semente inicial `$E9=$14`, `$EA=$A8` (a cópia de `$FDB1` deixa esses bytes em `$BE`/`$BF`, e `$F5E8` os leva para `$E9`/`$EA`):

```
LDA $EA
ASL
ASL
ASL
EOR $EA
ASL
ROL $E9
ROL $EA
RTS
```

Em inteiros de 8 bits, com `hi` = `$EA` e `lo` = `$E9`:

```
a = hi << 1 << 1 << 1
a = a xor hi
carry = bit 7 de a
lo' = (lo << 1) | carry
hi' = (hi << 1) | bit 7 do lo antigo
```

O acumulador final é descartado, como os chamadores em `$F8BC` e `$F8CD` fazem. Os oito primeiros pares, a partir da semente, são o teste:

| Passo | `$E9` | `$EA` |
| --- | --- | --- |
| 1 | 29 | 50 |
| 2 | 53 | A0 |
| 3 | A7 | 40 |
| 4 | 4E | 81 |
| 5 | 9D | 02 |
| 6 | 3A | 05 |
| 7 | 74 | 0A |
| 8 | E8 | 14 |

## Como o mapa usa esses bits

A versão anterior chamava o gerador em toda linha e empurrava o centro dois pixels a cada oito passos. Isso produz tremor, não o rio do cartucho.

No ROM, `$FAC6` é chamado quando um segmento novo nasce (`$F8BC`, `$F8CD`), não em cada scanline. A direção fica no byte `$89`. A magnitude é o nibble baixo de `$E9`: se for menor que 2, soma 2 (`$F916`); o teto é `$0E`, ou `$0D` quando o bit 7 de `$89` está ligado, ou `$08` no trecho de ilha (`$F921`–`$F92D`). O sentido troca quando `$E9 & $30` é zero ou quando o bit 7 de `(ASL $89) EOR $89` está ligado (`$F8ED`).

A recriação guarda essa decisão e repete a mesma margem por `4 + ($E9 & $07)` linhas. Por isso o teste exige um trecho reto de pelo menos quatro linhas. Ilha no meio só aparece com o rio largo, o bit 7 da direção ligado e os dois bits baixos de `$E9` em zero, e só se sobrar água dos dois lados.

O que ainda é rasterização, e não byte de `PF1`/`PF2`: o kernel do TIA em `$F0F9` escreve o playfield a partir dos ponteiros `$D9` e `$DB`, montados em `$FBD5` com tabelas (`$FCF1`, `$FBB7`). Essa passagem não fechou o índice “este byte de playfield é este pixel”. O centro, a meia-largura e a ilha são a leitura jogável da máquina de estados. Os testes travam o gerador e a forma (trechos retos), não uma foto do TIA.

## Scroll contínuo e 60 quadros

`$F865` soma a velocidade `$B5` num acumulador (`$8C`) e só então o mundo anda. A recriação faz o mesmo com um float:

```
scrollAcc += speed / 48
linhas = floor(scrollAcc)
scrollAcc -= linhas
```

Na marcha mínima (`$20`), o primeiro quadro soma `32/48`, que é menor que 1. Nenhuma linha anda, e o resto fica guardado. O teste `test_scroll` trava isso. Na marcha máxima (`$70`) saem uma ou duas linhas por quadro, nunca o salto fixo de três linhas da versão anterior.

O relógio é o `requestAnimationFrame` do Phaser, alinhado ao refresh do monitor. O trabalho de um quadro é:

- percorrer 192 bytes de margem
- no máximo 8 alvos
- um `putImageData` de 160×192×4, cerca de 123 KB

Isso cabe em bem menos de 16 ms num navegador atual e não pede shader. O Phaser está em `Scale.FIT` com `pixelArt`: a faixa 160:192 é centrada, o vizinho mais próximo não borra o pixel, e o que sobra da janela fica preto. O HUD de toque é HTML por cima, fora do canvas, então não altera a proporção.

No binário nativo do laboratório o timer é 1/60 s (`NSTimer` no Mac). O mesmo acumulador evita o salto de marcha inteira.

## Combustível

`$B7:$B8` nasce em `$FFFF` e perde `$20` por passagem em `$F63A`. Zerar o par cai no caminho de falha. O aviso troca o canal 0 quando `$B7 < $40` (`$F78D`). O posto soma 1 no byte alto (`$F613`), isto é, `+$100` por quadro de contato, com teto em `$FFFF`.

A barra na tela é esse inteiro dividido por 65535. A drenagem não multiplica pela marcha: ir mais rápido cobre mais rio com o mesmo tanque. Trinta quadros sem encostar no posto deixam o tanque em `0xFFFF - 30*0x20`.

## Áudio

Canal 0 fica num `AudioBufferSourceNode` em loop. O buffer é um número inteiro de períodos do LFSR de 9 bits (o polinômio do ruído `AUDC 8`: bit 0 xor bit 4). A emenda do loop cai no mesmo estado, então não há clique de costura. A marcha muda `playbackRate` (`28` na lenta, `12` na rápida), que é o papel de `AUDF0` em `$F7BD`: divisor menor, tom mais agudo. O estado do ruído não é zerado a cada quadro.

Com o byte alto do combustível abaixo de `$40`, o ganho do ruído vai a zero e entra um tom quadrado, no papel de `AUDC $0C` / volume `$0F`.

Canal 1 dispara envelopes curtos: tiro (~80 ms), explosão (~200 ms), queda (~330 ms), posto (~100 ms) e ponte (~250 ms). Os mesmos envelopes estão em `assets/audio/*.wav`.

No navegador, `AudioContext` só sai de `suspended` no clique ou no Enter da tela de início. Sem esse gesto o `pump` descarta os bits de som e o quadro segue mudo, que é a regra da plataforma, não um defeito do loop.

## O que o quadro faz, na ordem

1. A casca entrega os bits de entrada.
2. A marcha sobe ou desce 2 se cima ou baixo está segurado, entre `$20` e `$70`.
3. O avião e o tiro se movem.
4. O acumulador de scroll consome linhas inteiras e gera margem nova no topo.
5. O combustível perde `$20`.
6. Margem, ilha, alvos, posto e ponte são testados com as caixas.
7. A casca desenha o `ImageData` e lê os bits de som, zerando-os.

Pausa e fim de jogo não avançam o mapa. A tela de início rola a `0,65` pixel por quadro, devagar, para o rio já estar vivo antes do Enter.
