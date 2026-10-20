# Como o REA entra neste laboratório

O repositório [morluto/rea](https://github.com/morluto/rea.git) está clonado, raso e sem submódulos, em `ferramentas/rea`. O commit obtido nesta máquina é `f4322b1`.

O REA é uma ferramenta local de engenharia reversa. O agente pede uma inspeção, o REA devolve código, referências e limites, e a conclusão tem de citar a evidência. O guia que veio no clone está em:

`ferramentas/rea/.agents/skills/reverse-engineer-anything/SKILL.md`

e o vocabulário de evidência está em:

`ferramentas/rea/.agents/skills/reverse-engineer-anything/references/evidence-workflows.md`

## O que esta passagem usou

O alvo daqui é uma imagem 6502 de 4 KB, não um aplicativo JavaScript, um APK ou um binário que o Hopper, o Ghidra ou o IDA já estivessem analisando. Nesta máquina não havia um desses motores ligado ao REA. Por isso a leitura do cartucho foi feita com `laboratorio/04-disassembly/disasm6502.py`, um desmontador 6502 escrito para este laboratório.

O método emprestado do REA é o de separar observação, derivação, inferência e lacuna, e de não tratar a recriação jogável como prova de que o kernel original faz a mesma coisa.

## O que uma próxima passagem pode fazer com o REA

Análise nativa profunda pede Hopper, Ghidra ou IDA, que o REA não instala sozinho (Ghidra e IDA são trazidos por quem analisa; o Hopper só entra se a instalação for aprovada de propósito). Com um desses motores apontando para a imagem de 4 KB e com o processador 6502 selecionado, dá para pedir pseudocódigo das rotinas já marcadas aqui: `$F000`, `$FAC6`, `$F572`, `$F63A` e `$F6D7`.

O clone local serve para ler esse fluxo e para rodar o REA depois, sem misturar a ferramenta com o fonte do jogo. Para obter de novo:

```bash
git clone --depth 1 --no-recurse-submodules https://github.com/morluto/rea.git ferramentas/rea
```

O REA declara uso para pesquisa, ensino, interoperabilidade, preservação e análise de software que você possui ou tem autorização para examinar. Este laboratório fica nesse escopo: o `.a26` já estava na pasta, a leitura é estática, e a janela joga uma recriação.
