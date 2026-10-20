# Arquitetura

## Princípios

1. **O núcleo não conhece tela nem som.** `src/core` e `src/entities` são TypeScript puro.
   Os testes rodam no Node, sem navegador.
2. **O que é extraído do ROM é testado contra o próprio ROM.** O LFSR é comparado com a
   execução do código original num emulador de 6502 (`tools/rom/`).
3. **O que não foi extraído é projetado, e a documentação diz isso.** Ver a seção
   "Limites" no fim.
4. **Uma regra por lugar.** A plataforma decide os controles em `src/plataforma.ts`, o
   estado do jogo fica no `Mundo`, e a cena só desenha e encaminha entrada.

## Estrutura

```
src/core/         núcleo puro
  lfsr.ts         gerador de 16 bits (extraído de $FAC6)
  rng.ts          números aleatórios a partir do LFSR
  rio.ts          margens do rio, linha por linha
  mundo.ts        estado da partida e regra de um quadro
  config.ts       constantes (tela 160x192, 60 quadros por segundo)
src/entities/     dados e regras de cada entidade
  aviao.ts  inimigo.ts  posto.ts  tiro.ts  explosao.ts  caixa.ts
src/render/       pintura da cena, sem regra de jogo
  escala.ts       densidade da tela (ESCALA = 2: canvas de 320x384 pixels reais)
  tamanhos.ts     tamanho lógico de cada sprite (a tela de jogo é 160x192)
  sprites.ts      desenho vetorial de cada sprite, em alta resolução
  atlas.ts        gera os sprites (contorno, gradiente, sombra) e os padrões de água e grama
  quadro.ts       framebuffer de 320x384 onde tudo é pintado, em coordenadas lógicas
  cenario.ts      água e margens que rolam, árvores, espuma e reflexos
  ponte.ts        ponte de treliça, pilares e miolo vermelho
  efeitos.ts      explosões, rotor, chama do jato e rastro de espuma
  hud.ts          painel de baixo: pontos, vidas, nível e combustível
  desenho.ts      monta o quadro inteiro a partir do Mundo (só lê)
  fonte.ts        fonte pixelada 3x5
  cores.ts        paleta
src/systems/      o que fala com o mundo externo
  entrada.ts      teclado e toque viram uma Entrada
  hud-toque.ts    faixa de controles de toque
  som.ts          sons sintetizados com WebAudio
src/cenas/        título, partida, galeria de arte (?galeria) e o quadro compartilhado
src/plataforma.ts decide os controles por plataforma
src/main.ts       monta o Phaser
tests/            testes do núcleo e vetores gerados pelo ROM
tools/rom/        desmontador, emulador 6502 e geradores de vetores
tools/capturas/   Playwright para capturas de tela e testes de navegador
tools/rea/        clone do REA (sem uso: ver analise/README.md)
docs/             esta documentação e a análise do ROM
builds/           saídas compiladas (ignoradas pelo git)
```

## Laço de jogo

A cena de jogo tem passo fixo de 1/60 s. Cada passo chama `Mundo.atualizar(entrada)` e a
camada de som processa os eventos do quadro. Depois, a cena desenha o estado. O tempo da tela
não muda a velocidade do jogo: se a tela rodar a 120 Hz, o jogo continua a 60 quadros por
segundo e só a animação fica mais suave.

Pressões de tecla ou toque muito curtas, que começam e terminam entre dois quadros, são
guardadas pela `LeitorEntrada` e entregues no quadro seguinte. Sem isso, um toque rápido se
perderia.

## Gerador do rio

### Extraído do ROM (verificado)

O estado do rio é um LFSR de 16 bits, transcrição da rotina `$FAC6`:

```
LDA $EA / ASL / ASL / ASL / EOR $EA / ASL / ROL $E9 / ROL $EA / RTS
```

Em `src/core/lfsr.ts`:

```ts
const feedback = ((state >> 15) ^ (state >> 12)) & 1;
return ((state << 1) | feedback) & 0xffff;
```

Verificação:
- 405 pares de estado (fixos e aleatórios) e uma sequência de 200 passos a partir de `01:00`,
  gerados executando `$FAC6` no emulador (`make oracle`). A implementação TypeScript passa em
  todos (`tests/lfsr.test.ts`).
- Para validar o próprio emulador, 20 mil estados aleatórios foram comparados direto no 6502,
  sem divergência.
- Período medido a partir de `01:00`: **57 337** passos. Um LFSR de 16 bits só percorre
  65 535 estados se o polinômio for primitivo, e este não é. O rio se repete com esse período.

### Projetado a partir da análise (não verificado contra o ROM)

`src/core/rio.ts` usa o LFSR como fonte de decisões. A cada segmento de 6 a 16 linhas, ele
sorteia um novo centro e uma nova largura da água. As margens caminham um pixel por linha em
direção a esses alvos, o que evita saltos. A largura mínima e máxima diminuem com o nível.

Isso segue a ideia da análise (segmentos decididos pelo LFSR, margens com variação limitada),
mas **a montagem exata das margens do ROM ainda não foi transcrita**. Por isso o mapa não é
idêntico ao original. Os testes garantem o que vale no projeto: determinismo, largura mínima,
e variação de no máximo dois pixels por linha.

## Regras da partida (projetadas)

| Regra | Valor | Origem |
| --- | --- | --- |
| Tela | 160 x 192 pixels lógicos, escalados sem distorção | área visível do Atari 2600 |
| Avião | linha fixa em y=150, anda na horizontal | projeto |
| Velocidade | 4 níveis, cima e baixo mudam uma marcha por aperto | projeto |
| Combustível | 100 máximo, gasto por quadro = 0,012 + 0,004 x velocidade | projeto |
| Reabastecimento | +0,5 por quadro dentro da área de abastecimento do posto (34x30, maior que o corpo de 20x13) | projeto |
| Postos | um a cada 260 linhas de rio | projeto |
| Posto destruído a tiro | atirar no corpo destrói o posto (+50 pontos, sem reabastecer); atirar só na área não faz nada, como no original | projeto |
| Inimigos | navio 30, helicóptero 60, jato 80 pontos | projeto |
| Tiros | até dois na tela | projeto |
| Vidas | 3; queda com 90 quadros de espera e 120 de invulnerabilidade | projeto |
| Nível | a cada 500 pontos, o rio fica mais estreito | projeto |
| Ponte | atravessa o rio de margem a margem; derruba o avião se estiver intacta; tiro no miolo vermelho abre a ponte (+200 pontos); tiro no tabuleiro só faz faísca | projeto |
| Ponte: intervalo | uma ponte nova só aparece depois de 1 800 linhas de rio | projeto |

Cores: a água e a margem usam os registradores medidos no ROM, `COLUBK = $84` (azul) e
`COLUPF = $D6` (verde). Os tons em RGB são aproximações, não a paleta exata do TIA.

## Arte

Os sprites são desenhados em vetor, em alta resolução (`src/render/sprites.ts`): cada um tem
contorno escuro, preenchimento com gradiente e detalhes (vidro, luzes, treliça). O atlas
(`src/render/atlas.ts`) gera cada sprite em ESCALA vezes os pixels lógicos, e a sombra projetada
é a silhueta do sprite em preto translúcido. O tamanho lógico de cada um fica em
`src/render/tamanhos.ts`. Um teste confere que cada caixa de colisão cabe no sprite.

A tela lógica continua 160×192: regras, colisões e coordenadas não mudam. O canvas tem o
dobro de pixels (320×384): a câmera do Phaser aplica zoom ESCALA com origem no canto superior
esquerdo, e a imagem da tela é desenhada com escala 1/ESCALA, então sai pixel a pixel. Os
toques são convertidos de volta para coordenadas lógicas dividindo pelo zoom.

A água e a grama são padrões de 32 pixels reais (16 lógicos) que deslocam com a rolagem do rio:
o movimento da água é exatamente a velocidade do avião. As árvores aparecem a cada 19 linhas
do mundo, em posições fixas por linha.

A ponte é de treliça, com pilares nas margens, miolo vermelho que pisca enquanto está
intacta, e queda animada quando é destruída. A galeria (`?galeria`) mostra os objetos,
as duas pontes e uma explosão em fases para revisão.

Cores: a água e a margem partem dos registradores medidos no ROM. As demais cores e todo o
desenho são projeto.

## Som

Sons sintetizados em WebAudio, disparados pelos eventos do `Mundo`: tiro (onda quadrada
descendo), explosão (rajada de ruído), reabastecimento, alerta de combustível baixo e nível
novo. O motor do jato é um ruído filtrado cujo volume e frequência sobem com a velocidade.

O ROM tem seu próprio motor de som, em `F761`–`F81F`, com canais em `$15`–`$1A`. Ele não foi
recriado: os sons acima são projetados. Medir os registradores exige uma partida em andamento
no emulador, o que ainda não foi alcançado (ver `analise/README.md`).

### Política de áudio

O AudioContext é criado e retomado dentro de um evento real do usuário (toque, clique ou tecla),
registrado no `window` no boot (`src/main.ts`). Também é retomado quando o app volta ao primeiro
plano e antes de cada som. O desbloqueio não roda no laço do Phaser, porque o WebKit (Tauri no
Mac, Capacitor no iOS) só aceita a retomada dentro de um gesto.

Verificado com instrumentação do AudioContext, lendo o estado final depois de jogar: o contexto
fica `running` e o tiro cria oscilador, nas builds web, desktop e mobile, nos motores Chromium e
WebKit. Ainda não foi ouvido em aparelho: o botão silencioso do iPhone pode mutar o áudio do
WebKit, e isso só se confirma num aparelho real.

## Plataformas

`src/plataforma.ts` lê `VITE_PLATFORM`, definida pelo Makefile em cada build:

- `desktop` (Tauri, Mac e Windows): nunca mostra o HUD de toque.
- `mobile` (Capacitor, iOS e Android): mostra o HUD sempre.
- `web` (padrão): mostra o HUD só se `ontouchstart` existir ou `maxTouchPoints > 0`.

Cada build tem sua pasta: `builds/web`, `builds/desktop`, `builds/mobile`. Esse isolamento
evita que um build sobrescreva o outro, o que já aconteceu antes e foi corrigido.

Verificado com Playwright, medindo a proporção do canvas (160:192 sem HUD, 160:240 com HUD):

| Build | Com toque | Sem toque |
| --- | --- | --- |
| web | com HUD | sem HUD |
| mobile | com HUD | com HUD |
| desktop | sem HUD | sem HUD |

## Limites

- **O mapa não é idêntico ao do ROM.** O LFSR é idêntico; a montagem das margens e a
  lógica da partida não foram transcritas.
- **A regra de início de partida do ROM não foi encontrada.** Ver `analise/README.md`.
- **Sprites e sons não foram extraídos.** O avião, os inimigos, a ponte e os sons são
  desenhados e sintetizados (ver a seção Arte). As cores são medidas, o resto é projetado.
- **Os valores de jogo são projeto.** Combustível, pontos, velocidades e tempos não vêm do
  ROM.
- **Som em aparelho não confirmado.** Verificado no navegador (Chromium e WebKit); o botão silencioso do iPhone e o áudio do Android e do Windows ainda precisam de teste no aparelho.
- **Não testado em aparelho nem em Windows real.** O simulador iOS e o navegador com toque
  foram testados; o APK e o `.exe` foram gerados mas não executados em aparelho ou Windows.
