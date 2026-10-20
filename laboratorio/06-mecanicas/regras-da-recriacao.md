# Regras da recriação

## O que se vê na tela

O desenho mora em `src/core/present.c`. É pixel art de laboratório, no jeito do jogo de 1982, para cada peça ser reconhecível. Não é uma cópia dos bytes `GRP0`/`GRP1` do cartucho: o kernel do TIA ainda não foi reduzido a um mapa de sprites. As silhuetas são estas:

| Peça | Leitura |
| --- | --- |
| avião amarelo, acima do painel | o jogador |
| corpo escuro, rotor amarelo | helicóptero |
| casco azul, faixa laranja, cabine preta | navio |
| forma preta com faixa laranja | jato inimigo |
| placa vertical com as letras FUEL | posto; passar por cima reabastece |
| faixa cinza atravessando o rio, centro vermelho | ponte; o tiro vale no centro |
| painel cinza embaixo: pontos, vidas e barra E–F | combustível e placar |

O mesmo quadro de 160×192 é o que o Mac amplia e o que o Windows, o iOS e o Android devem ampliar. Cada pixel da peça é um pixel do quadro. O som correspondente está em `src/core/audio.c` e o mapa completo, para quem está começando e para quem já programa, em `docs/imagem-e-som.md`.

O arquivo `src/core/river.c` é o jogo que a janela executa. Ele cabe numa leitura. As constantes estão no topo do `.c` e no `river.h`.

## O que é transcrição

`river_lfsr_step` repete os deslocamentos de `$FAC6`. A semente inicial é `$14` / `$A8`, os bytes que a cópia de `$FDB1` deixa em `$BE` / `$BF` e que `$F5E8` copia para `$E9` / `$EA`. O teste em `src/core/test_river.c` trava os oito primeiros estados. Se alguém mudar a função e o teste quebrar, a transcrição deixou de bater com o cartucho.

## O que é regra inspirada no binário

| No jogo da janela | De onde veio a ideia |
| --- | --- |
| Esquerda e direita movem o avião | bits de `SWCHA` guardados em `$84`, uso em `$F650` |
| Cima e baixo mudam a velocidade, com três marchas | `$B5` soma ou perde 2 em `$F69B` e `$F6AF` |
| O combustível desce o tempo todo e zerar mata | contador `$B7:$B8` em `$F63A` |
| Voar sobre o posto reabastece | comportamento do jogo; o posto em si ainda é lacuna na tabela `$FE53` |
| A ponte fecha a seção e precisa ser destruída | o ROM separa tipos por `$04` e `$08`; a ponte da janela é a peça que representa “fim de seção” |

A geometria da margem não é a do TIA. Cada linha nova olha a linha de baixo, anda um passo do gerador e empurra o centro ou a largura conforme dois bits. É uma regra curta de propósito, para dar para apontar o `if` e trocar.

## Números que são só da recriação

| Constante | Valor | Por quê existe |
| --- | --- | --- |
| `SECTION_ROWS` | 1400 | comprimento da seção antes da ponte |
| `SPAWN_EVERY` | 78 | distância entre tentativas de criar um alvo |
| pontos | 30, 60, 80, 100, 500 | navio, helicóptero, posto destruído, jato, ponte |
| combustível | 0 a 100, perda `0,045 × marcha` por quadro | leitura fácil no painel; não é o `$20` do byte `$B8` |
| invulnerabilidade | 90 quadros ao decolar e ao renascer | folga para estudar a tela |

Quando uma lacuna da ficha de evidências fechar, o lugar para trazer o número novo é esta tabela e a constante correspondente em `river.c`. O teste do gerador não deve ser afrouxado para acomodar isso: ele protege só a transcrição.

## Um quadro, na ordem em que o C faz

1. Lê as teclas que a casca entregou.
2. Ajusta a marcha se cima ou baixo acabou de ser pressionado.
3. Move o avião e, se houver tiro, o tiro sobe.
4. Rola o mundo `marcha` linhas para baixo e gera as linhas novas no topo. Cada linha nova consome um passo do gerador.
5. Desconta combustível.
6. Testa margem, alvos, posto e ponte.

A casca do Mac chama isso 60 vezes por segundo e só desenha. Ela não decide colisão.
