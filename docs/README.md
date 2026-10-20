# River Raid — MRC

*River Raid* (Activision, 1982) em TypeScript + Phaser, a partir da análise do
cartucho `River Raid (1982) (Activision) [!].a26`, que fica nesta pasta só para estudo.
O cartucho não entra em nenhum build nem no repositório (ver `.gitignore`).

O jogo roda: partida com rio rolando, avião, tiro, navios, helicópteros, jatos, postos de
combustível, pontes que bloqueiam o avião até o miolo vermelho ser atingido, vidas, níveis e
fim de jogo. Ele não é uma cópia do código original. Para o que
foi verificado contra o ROM e o que foi projetado, ver [ARCHITECTURE.md](ARCHITECTURE.md).

## Rodar do zero

Pré-requisitos: Node.js 24 (testado com 24.18), Python 3, `make`. Para os builds nativos:
Xcode (iOS), JDK 25 e o Android SDK (Android), Rust e LLVM (Windows).

```bash
make install     # dependências do npm
make test        # 30 testes: LFSR, rio, regras do jogo, pontes, postos e 100 mil quadros
make dev         # modo desenvolvedor no navegador
```

## Atalhos (`make help`)

| Alvo | O que gera | Situação |
| --- | --- | --- |
| `make dev` | servidor de desenvolvimento | funciona |
| `make test` | testes do núcleo | 30 passam |
| `make build-web` | `builds/web/index.html`, um único arquivo | funciona; abre por duplo clique |
| `make build-mac` | `builds/mac/River Raid.app` (não assinado) | funciona; processo sobe e fica ativo |
| `make build-win` | `builds/win/River-Raid.exe` (compilação cruzada) | gera o .exe; **não testado num Windows real** |
| `make build-android` | `builds/android/app-debug.apk` | gera o APK; **não instalado em aparelho** |
| `make build-ios` | `builds/ios/App.app` (simulador) | instala e abre no simulador iOS |
| `make oracle` | regenera os vetores do LFSR executando o ROM | funciona |
| `make listing` | regenera a desmontagem do ROM em `docs/analise/` | funciona |
| `make clean` | remove builds e caches | funciona |

## Controles

- **Desktop (Mac e Windows):** só teclado. Setas para mover, cima e baixo para velocidade,
  espaço (ou Enter) para atirar.
- **Mobile (Android e iOS):** faixa de controles na parte de baixo. Cruz à esquerda, botão de
  tiro à direita.

O posto de combustível tem uma área de abastecimento marcada na água: sobrevoe-a para encher o
tanque. Atirar no corpo do posto o destrói, como no original, e você perde o reabastecimento.
- **Web:** a faixa aparece só quando o navegador aceita toque.

Para revisar a arte sem jogar, abra o build web com `?galeria` no final do endereço: a tela mostra
os objetos, as duas pontes (intacta e caindo) e os quadros de uma explosão.

## Documentação

- [ARCHITECTURE.md](ARCHITECTURE.md): núcleo, regras, o que vem do ROM e o que é projetado
- [STACK.md](STACK.md): versões, pipelines nativos e limitações de cada plataforma
- [analise/README.md](analise/README.md): registro da engenharia reversa e o que ficou em aberto
