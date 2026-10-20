# Desmontagem

`disasm6502.py` lê o `.a26` da raiz do projeto, confere que as quatro cópias de 4 KB são iguais e desmonta a primeira no mapa `$F000`–`$FFFF`.

```bash
python3 laboratorio/04-disassembly/disasm6502.py
```

Arquivos gerados, todos substituídos a cada execução:

| Arquivo | Conteúdo |
| --- | --- |
| `listing.asm` | uma linha por instrução; `COD` foi alcançado, `DAD` não foi |
| `mapa.json` | vetores, blocos, escritas em TIA/RIOT, página zero, `JSR` |
| `resumo.txt` | o mesmo resumo que o script imprime |

`COD` significa “o seguidor de fluxo passou por aqui a partir do `RESET` ou de uma entrada da tabela de `$F139`”. Não significa “esta instrução foi provada em execução”. `DAD` significa “esta passagem não chegou aqui”, o que inclui tabelas e também código ainda não ligado.
