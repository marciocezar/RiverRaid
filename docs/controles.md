# Controles

A casca guarda as teclas que estão seguradas e entrega um inteiro de bits para `river_set_input` a cada quadro.

| Bit em `river.h` | Teclas | Efeito no núcleo |
| --- | --- | --- |
| `RIVER_IN_LEFT` | seta esquerda, A | velocidade horizontal negativa |
| `RIVER_IN_RIGHT` | seta direita, D | velocidade horizontal positiva |
| `RIVER_IN_UP` | seta cima, W | sobe uma marcha na borda da tecla |
| `RIVER_IN_DOWN` | seta baixo, S | desce uma marcha na borda da tecla |
| `RIVER_IN_FIRE` | espaço | cria um tiro se não houver outro e o intervalo acabou |

Enter, P, R, 1, 2, 3 e Esc não entram na struct de input. A casca chama `river_start`, `river_toggle_pause`, `river_init` ou `river_set_speed`, ou encerra o processo. Assim o núcleo não precisa saber o que é uma tecla de Mac.

No cartucho, segurar cima ou baixo altera `$B5` de pouco em pouco, todo quadro. Aqui a marcha muda uma vez por toque, e as teclas 1, 2 e 3 existem para fixar a marcha enquanto se observa o combustível e o `LFSR` no painel.
