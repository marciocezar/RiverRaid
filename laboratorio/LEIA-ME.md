# Percurso do laboratório

A pergunta deste laboratório é: o que dá para afirmar olhando só os bytes do cartucho, e o que a recriação jogável teve de inventar para existir.

Cada afirmação cai numa destas quatro gavetas, no mesmo espírito do REA:

| Gaveta | Significado |
| --- | --- |
| Observação | Um byte, um endereço ou uma instrução que o desmontador mostrou. |
| Derivação | Uma conta em cima de observações, por exemplo o alvo de um `RTS` que desempilha duas tabelas. |
| Inferência | Uma leitura que combina o binário com o funcionamento conhecido do Atari 2600. Pode estar errada. |
| Lacuna | Algo que esta passagem não fechou. |

Não misture as gavetas quando for anotar uma descoberta nova. Se uma rotina só foi lida pela metade, ela continua lacuna mesmo que o jogo da tela já se comporte de um jeito parecido.

## Ordem de leitura

1. A ficha do arquivo, para saber qual imagem está sendo lida.
2. O hardware, para os nomes `TIA`, `RIOT`, `SWCHA` e página zero fazerem sentido.
3. As evidências, com endereços.
4. As regras da recriação, para ver o que entrou no C e o que ficou de fora.
5. `src/core/river.c` e `src/core/present.c`, com o jogo aberto ao lado. O primeiro é a regra. O segundo é o desenho.

O desmontador está em `04-disassembly/disasm6502.py`. Ele não executa o cartucho. Ele segue `JSR`, `JMP` e desvios a partir do `RESET`, e também as dez entradas da tabela que o `RTS` em `$F139` alcança.
