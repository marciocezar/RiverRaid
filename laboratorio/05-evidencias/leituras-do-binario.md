# Leituras do binário

Fonte: `python3 laboratorio/04-disassembly/disasm6502.py` sobre o `.a26` local. A listagem completa fica em `laboratorio/04-disassembly/listing.asm`. Nada desta página veio de executar o jogo.

Cobertura desta passagem: 3029 dos 4096 bytes foram alcançados como instrução a partir do `RESET` e das dez entradas do kernel. O resto está agrupado nos blocos de `resumo.txt`. Parte disso é tabela. Parte pode ser código que só um salto indireto ainda não seguido alcança. Não trate “não alcançado” como “não é código”.

## A tabela que escolhe o pedaço da tela

Em `$F0DA` o programa faz `LDA $FBEF,Y` / `PHA` e `LDA $FDF6,Y` / `PHA`. O `RTS` em `$F139` soma 1 ao endereço empilhado. Derivação para Y de 0 a 9, que são os índices cujos dois bytes caem dentro da ROM:

| Y | Bytes empilhados | O `RTS` chega em |
| --- | --- | --- |
| 0 | `$F1F6` | `$F1F7` |
| 1 | `$F1B3` | `$F1B4` |
| 2 | `$F139` | `$F13A` |
| 3 | `$F151` | `$F152` |
| 4 | `$F345` | `$F346` |
| 5 | `$F33F` | `$F340` |
| 6 | `$F2B6` | `$F2B7` |
| 7 | `$F295` | `$F296` |
| 8 | `$F242` | `$F243` |
| 9 | `$F204` | `$F205` |

A partir de Y = 10 os pares deixam de ser endereços de ROM. Inferência: Y nesse ponto é um índice de faixa da tela, e cada faixa tem um miolo de desenho diferente (céu, rio, placar, combustível). Lacuna: o mapa “este Y é a faixa do placar” não foi fechado linha a linha.

## O gerador de 16 bits

Observação, rotina `$FAC6`, chamada a partir de `$F8BC` e `$F8CD`:

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

Os chamadores não usam o acumulador depois do `RTS`. O estado que fica é o par `$E9` (byte baixo) e `$EA` (byte alto).

Observação da semente: `$FA8F` com X = `$26` copia 39 bytes de `$FDB1` para a página zero a partir de `$A6`. Nessa cópia, `$BE` recebe `$14` e `$BF` recebe `$A8`. Em `$F5E8`, no caminho em que a partida anda, `$BE` vai para `$E9` e `$BF` vai para `$EA`.

Derivação conferida à mão e no teste `make test`. Partindo de `$E9=$14` e `$EA=$A8`, os oito primeiros passos deixam:

| Passo | `$E9` | `$EA` |
| --- | --- | --- |
| 1 | `29` | `50` |
| 2 | `53` | `A0` |
| 3 | `A7` | `40` |
| 4 | `4E` | `81` |
| 5 | `9D` | `02` |
| 6 | `3A` | `05` |
| 7 | `74` | `0A` |
| 8 | `E8` | `14` |

Inferência: esse par é a semente do desenho do rio, porque o código logo em seguida testa bits de `$E9` (`AND #$0F`, `AND #$30`, `BIT $E9`) para decidir curvas e o que colocar na água. Lacuna: a fórmula exata que transforma cada bit em “margem esquerda neste pixel” está espalhada por `$F8E2`–`$FA8C` e não foi reduzida a uma equação única. A recriação usa o gerador de verdade e uma regra de margem própria, documentada à parte.

## Joystick

Observação em `$F572`:

```
LDA $0280      ; SWCHA
...
AND #$F0
LDY #$04
ROL A
ROL $84
DEY
BNE ...
```

Os quatro bits altos de `SWCHA` são o joystick do jogador, em nível baixo quando a direção está apertada. Eles são girados para `$84`. Mais adiante, `$F650`–`$F6B1` usa esses bits: esquerda e direita alteram a posição horizontal em `$B3`/`$B4`, cima e baixo somam ou tiram 2 de `$B5`.

Inferência: `$B5` é a velocidade do avião. O teto aparece na comparação `CMP #$41` em `$F6AB`. A recriação usa três marchas no lugar desse byte fracionário, para a regra caber numa leitura só.

O botão de tiro não apareceu como uma leitura direta de `INPT4` (`$3C`) nesta passagem. Em `$F58D` o programa faz `LDX $F4` e `LDA $0C,X`. `$F4` é escrito a partir de `$80` quando a chave de reset em `SWCHB` está abaixada (`$F825`) e também é invertido com `$80` em `$FFD7`. Lacuna: ainda não dá para afirmar que essa leitura é o botão. Na recriação, a barra de espaço atira porque o jogo precisa de um tiro para ser jogável, não porque o endereço do botão tenha sido fechado.

## Combustível

Observação: a mesma cópia de `$FDB1` grava `$FF` em `$B7` e em `$B8`. Em `$F63A`:

```
LDA $B8
SEC
SBC #$20
BCS guarda
LDY $B7
BNE decrementa_B7
LDA #$02
LDY #$23
JMP $F635       ; cai em JSR $FF5C e segue
decrementa_B7:
DEC $B7
guarda:
STA $B8
```

Derivação: `$B7:$B8` é um contador de 16 bits que perde `$20` a cada passagem. Se `$B7` já é zero e `$B8` não cobre a subtração, o fluxo sai por um caminho de falha.

Inferência: esse contador é o combustível. O ROM não tem a palavra “fuel”; a inferência junta o valor inicial cheio, a drenagem constante e a falha ao esvaziar. A recriação usa uma barra de 0 a 100 com a mesma ideia, não os mesmos `$20` por quadro.

## Alvos e pontos

Observação: o tipo do objeto fica em `$A0,X`. Em `$F5F9` o código compara esse tipo com `$04` e com `$08`. Em `$F6D9` ele lê `LDA $FE53,Y` e soma o byte numa trilha de dígitos em `$CD,X`, com ajuste quando a soma passa de `$50`.

Os primeiros valores de `$FE53` são:

| Y | Byte |
| --- | --- |
| 0–3 | `$00` |
| 4 | `$88` |
| 5 | `$30` |
| 6 | `$30` |
| 7 | `$18` |
| 8 | `$A8` |

O bit 7 desses bytes muda o caminho (`BPL` em `$F6DC`). Lacuna: ainda não está demonstrado qual Y é helicóptero, navio, jato, posto ou ponte, nem qual número aparece no placar da TV. Os pontos 30, 60, 80, 100 e 500 da janela são regra da recriação, não uma leitura fechada desta tabela.

## Som, dois canais

Observação em `$F7D4`: `STA $15` grava `AUDC0`, `STY $17` grava `AUDF0`, `STX $19` grava `AUDV0`. O valor mais comum de `AUDC0` nesse caminho é `$08`, o ruído de 9 bits do TIA. Quando `$B7` é menor que `$40` (`$F78D`), o mesmo canal recebe `AUDC` `$0C` e volume `$0F`: um tom, não ruído. Inferência: `$08` é o motor e `$0C` com combustível baixo é o aviso. O canal 1 é escrito em `$F801`–`$F805` (`AUDF1`, `AUDC1`, `AUDV1`), com `$FA` como contador de decaimento carregado com `$17` em `$F6C5`.

A recriação usa esses papéis. Não usa o relógio de amostra do TIA. O mapa está em `docs/imagem-e-som.md`.

## O que ficou de fora de propósito

- Não há emulador de TIA aqui. O tempo de cada linha, os `HMOVE` e as colisões por hardware (`CXCLR` em `$F0BB`) continuam no listing para uma passagem futura.
- O áudio (`AUDC0`, `AUDF0`, `AUDV0` por volta de `$F7D4`) não foi reconstruído.
- O caminho de `SWCHB` (reset e select, `$F81F`) foi visto e não virou tecla. No laboratório, Enter, R e Esc cobrem começar, recomeçar e sair.
