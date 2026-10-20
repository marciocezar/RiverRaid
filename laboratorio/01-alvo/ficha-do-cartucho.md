# Ficha do cartucho

Arquivo local: `River Raid (1982) (Activision) [!].a26`

| Medida | Valor |
| --- | --- |
| Tamanho do arquivo | 16384 bytes |
| SHA-256 do arquivo | `cb4551c2c5f1f046e5fd509bb790cd85e082ee27905dbdbda0f8f56cc79dee40` |
| Imagem útil | 4096 bytes, repetida 4 vezes, sem nenhum byte diferente entre as cópias |
| SHA-256 da imagem de 4 KB | `4c6842b8af64fc75e599b773821b3e6bee8e5028f5d63414821b0d63f0b2dfe9` |
| Texto legível | não há `ACTIVISION`, `RIVER` nem `SHAW` em ASCII |

Observação: as quatro fatias de 4096 bytes são iguais. A imagem que o 6502 enxerga é a primeira. As outras três são cópia.

Vetores no fim da imagem, endereços de arquivo `$FFA`–`$FFF` dentro dos 4 KB:

| Vetor | Bytes | Endereço |
| --- | --- | --- |
| NMI | `1E 84` | `$841E` |
| RESET | `00 F0` | `$F000` |
| IRQ / BRK | `00 00` | `$0000` |

Observação: o `RESET` aponta para o primeiro byte da imagem. Esse byte é `78`, a instrução `SEI`.

Inferência: no 6507 o pino de NMI não existe, e `$841E` nem cai na janela do cartucho (o bit A12 desse endereço está em zero). O vetor de IRQ em `$0000` também não é uma rotina de ROM. Os dois funcionam como bytes residentes no fim da imagem, não como tratadores usados pelo jogo.

Lacuna: este laboratório não comparou o hash com um catálogo externo. A identidade “River Raid de 1982” vem do nome do arquivo e do que o código faz, não de uma assinatura conferida fora da máquina.
