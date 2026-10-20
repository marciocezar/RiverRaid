# A imagem `.a26`

Um `.a26` de cartucho de 4 KB, neste arquivo, é a ROM crua. Não há cabeçalho na frente dos 4096 bytes úteis. O que há é o arquivo de 16384 bytes com a mesma imagem quatro vezes.

O 6502 lê o vetor de reset nos dois últimos bytes úteis antes do fim (`$FFFC`–`$FFFD` no mapa do processador, deslocamento `$FFC` na imagem). Aqui eles valem `$F000`, então a execução começa no deslocamento 0:

```
$F000  SEI
$F001  CLD
$F002  LDX #$00
$F004  LDA #$00
$F006  STA $00,X
$F008  TXS
$F009  INX
$F00A  BNE $F006
```

Observação: o laço zera `$00`–`$FF` e, no meio, executa `TXS`. No 6502, `TXS` não mexe nos flags, então o `BNE` olha o resultado do `INX`. Quando X volta a zero, o laço acaba. A pilha fica em `$FF`. Os registradores do TIA, que ocupam o começo dessa página, também recebem zero nessa varredura.

Em seguida o programa chama `$FF0C` e entra no ciclo de quadro. O desenho da imagem não é um `JMP` direto: em `$F0DA`–`$F0E1` ele empilha um endereço montado com duas tabelas e o `RTS` de `$F139` salta para lá. Os alvos estão na ficha de evidências.
