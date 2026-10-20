# O hardware que o cartucho espera

O Atari 2600 não tem uma tela de bitmap. O programa constrói cada linha de TV enquanto o feixe anda. Três peças importam para ler este ROM.

## 6507

É um 6502 com barramento de endereço de 13 bits e sem o pino de NMI. O cartucho de 4 KB aparece quando A12 está em 1, no intervalo `$F000`–`$FFFF`. A RAM do console tem 128 bytes, em `$80`–`$FF`. Quase todo o estado de *River Raid* mora aí. Por isso o painel do laboratório mostra `$E9` e `$EA`: são dois bytes dessa RAM.

## TIA

O Television Interface Adapter desenha a linha. Os registradores que o desmontador viu este programa escrever incluem:

| Endereço | Nome | Papel |
| --- | --- | --- |
| `$00` | `VSYNC` | marca o sincronismo vertical |
| `$01` | `VBLANK` | apaga o feixe durante o miolo fora da imagem |
| `$02` | `WSYNC` | espera o fim da linha |
| `$0D`–`$0F` | `PF0` `PF1` `PF2` | o playfield, aqui as margens do rio |
| `$1B` `$1C` | `GRP0` `GRP1` | os gráficos do avião e dos alvos, 8 pixels por byte |
| `$15`–`$1A` | áudio | canal, frequência e volume |
| `$2A` | `HMOVE` | aplica o deslocamento horizontal fino |
| `$2C` | `CXCLR` | limpa os latches de colisão |

Escrever num desses endereços não é “chamar uma função”. É mudar o que o feixe vai pintar naquela linha. O miolo em `$F13A` em diante é esse tipo de código: curto, repetido e cheio de `STA` em registrador de vídeo. A recriação não copia esse kernel. Ela desenha um retângulo por linha, que é o equivalente legível.

## RIOT

O 6532 guarda as chaves e o timer.

| Endereço | Nome | Onde o ROM mexe |
| --- | --- | --- |
| `$0280` | `SWCHA` | lido em `$F572`; é o joystick, com bit em zero quando a direção está pressionada |
| `$0282` | `SWCHB` | select, reset e cor/preto-e-branco |
| `$0284` | `INTIM` | o programa espera este timer zerar antes do `WSYNC` |
| `$0296` | `TIM64T` | em `$F81C` recebe `$2B`, o intervalo clássico até o próximo quadro |

Observação do quadro, em `$F80C`–`$F81C`: três `WSYNC` com `VSYNC` ligado, depois `VSYNC` desligado, depois `STA $0296` com o valor `$2B`. Isso é o começo de um quadro de TV, não a lógica do rio.
