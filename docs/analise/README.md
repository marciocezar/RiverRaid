# Engenharia reversa do ROM

Registro do que foi observado no cartucho. Os números foram medidos com o emulador ou com a
desmontagem, não estimados.

## Ferramentas usadas

- `tools/rom/disasm6502.py`: desmontador próprio (opcodes oficiais). Gera
  `listagem-recursiva.asm` (a partir de `$F000` e dos destinos do despacho) e
  `listagem-linear.asm` (banco inteiro).
- `tools/rom/cpu6502.py`: emulador 6502 mínimo. O TIA é só registrado (escritas com a
  linha de varredura) e o RIOT é stubado (`INTIM` sempre zero).
- `tools/rom/gerar_vetores_lfsr.py`: executa `$FAC6` no emulador e grava os vetores de teste.

**O REA não foi usado nesta análise.** Ele precisa de um provedor de desmontagem (Ghidra,
Hopper ou IDA) para o 6502, e nenhum está instalado. Ver [../STACK.md](../STACK.md).

## Arquivo

- `River Raid (1982) (Activision) [!].a26`: 16 384 bytes.
- As quatro cópias de 4 KB são idênticas (mesmo md5). O programa efetivo tem 4 096 bytes e
  não há troca de banco.
- Vetor de reset em `$FFFC`: `$F000`.

## Desmontagem

- Código alcançável a partir de `$F000` e dos quatro destinos do despacho: 1 581 instruções,
  3 017 bytes.
- Os 1 079 bytes restantes não são alcançados por fluxo de controle. Não foram classificados;
  a hipótese é que sejam tabelas e gráficos, ainda não confirmada.
- Não há `JMP` indireto nem despacho por pilha além do caso abaixo.

## Despacho por tabela

`F0D9`–`F0E1` monta um endereço e o `RTS` em `F139` salta para ele. O byte alto vem de
`$FBEF,Y` (empilhado primeiro) e o baixo de `$FDF6,Y` (empilhado por último). Destino = valor
montado + 1. Para `Y = 0..3`: `$F1F7`, `$F1B4`, `$F13A` e `$F152`.

## Quadro do kernel

Medido em 6 quadros: **144 escritas em `WSYNC`** por quadro. O contador `$FD` começa em `$A0`
(160) em `F12C`, mas não é o número de linhas.

## Cores

Registradores de cor observados nas escritas de TIA durante a tela de espera:

- `COLUBK` = `$84` (fundo, azul)
- `COLUPF` = `$D6` (playfield, verde; a cor dominante)
- `COLUP0` = `$1C`, `COLUP1` = várias

O jogo usa `$84` e `$D6` como referência. Os tons em RGB são aproximações.

## Gerador do rio

Rotina `$FAC6` (LFSR). Verificada: ver [../ARCHITECTURE.md](../ARCHITECTURE.md). Chamada em
`F8BC` e `F8CD`, dentro do laço de segmentos que usa `$B6` (linhas por segmento), `$B9`,
`$BD` (índice de segmento), e `$BE`/`$BF`/`$EB`/`$EC` (histórico, copiado por `FAD3`).

## Entrada e início de partida (em aberto)

- Joystick: lido de `$0280` (SWCHA) em `F572`. Botão de tiro: `INPT4` via `LDA $0C,X` em
  `F58D` e `F74A`.
- Console: `SWCHB` (`$0282`) em `F04A`, `F49E`, `F73B`, `F81F`. A máscara `$85`/`$86` sai
  daí.
- Fluxo observado sem entrada: `$C6` é um contador de fase que começa em `$7F` e desce um por
  quadro. Quando chega a `$31` com `$C0 = 0`, `F5A5`–`F5D9` o reinicia para `$FF`, e ele fica
  nesse valor.
- A condição de início em `F591` exige `$C6 == $30`. Com o caminho acima, `$C6` pula de `$31`
  para `$FF` e **nunca** vale `$30`. Ou seja, o início depende de outro caminho, ainda não
  identificado.
- `$83` é um segundo registrador de deslocamento (8 bits), e `$82` um contador de quadros.

Testes sem resultado (200 a 900 quadros, cada um): RESET, SELECT, FIRE e direções, isolados e em
pulsos. Nenhum acionou som (`AUDV` zerado). Só a execução sem entrada foi rastreada para `$C6`,
que não chegou a `$30` em 1 500 quadros.

## Som

Motor de som em `F761`–`F81F`, por quadro. Canais: `AUDC0`/`AUDC1` (`$15`/`$16`),
`AUDF0`/`AUDF1` (`$17`/`$18`), `AUDV0`/`AUDV1` (`$19`/`$1A`). Estado em `$F8`–`$FB`, e o
jato depende de `$B7` e `$C6`. Não foi medido nenhum efeito de jogo.

## O que faltal

1. Identificar o caminho que leva `$C6` a `$30` (ou o equivalente da versão de partida).
2. Transcrever a montagem das margens (`F8xx`–`F9xx`, `FAxx`) e confrontar linha a linha com
   os registradores de PF no emulador.
3. Medir sons e valores de jogo (combustível, pontos, velocidades) com uma partida real.
4. Extrair os gráficos das tabelas do ROM.
