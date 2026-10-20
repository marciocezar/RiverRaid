#!/usr/bin/env python3
"""Gera vetores de teste do gerador de rio executando a rotina $FAC6 do próprio ROM.

Saída: tests/vetores/lfsr.json, com pares (E9, EA) -> (E9', EA') para estados de
partida variados. A implementação TypeScript precisa reproduzir todos os pares.

Uso (a partir da raiz do projeto):
    python3 tools/rom/gerar_vetores_lfsr.py
"""

import json
import os
import random
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

from cpu6502 import Bus, CPU  # noqa: E402

ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
ROM = os.path.join(ROOT, "River Raid (1982) (Activision) [!].a26")
SAIDA = os.path.join(ROOT, "tests", "vetores", "lfsr.json")

ENDERECO_ROTINA = 0xFAC6   # LFSR do rio
SENTINELA = 0xF000         # endereço de retorno falso: RTS desembocando aqui encerra


def executar_uma_vez(cpu, bus, e9, ea):
    bus.write(0xE9, e9)
    bus.write(0xEA, ea)
    cpu.push(0xEF)           # RTS soma 1 -> $F000
    cpu.push(0xFF)
    cpu.pc = ENDERECO_ROTINA
    cpu.run_until(lambda c: c.pc == SENTINELA, max_steps=1000)
    return bus.read(0xE9), bus.read(0xEA)


def main():
    with open(ROM, "rb") as f:
        rom = f.read()[:4096]  # as quatro cópias de 4 KB são idênticas
    bus = Bus(rom)
    cpu = CPU(bus)
    cpu.reset()  # garante que o estado de pilha/CPU é o real do cartucho

    rng = random.Random(0x5EED)
    pares = []
    # Estados fixos de borda, depois aleatórios.
    estados = [(0x00, 0x00), (0x01, 0x00), (0xFF, 0xFF), (0x00, 0x80), (0x80, 0x00)]
    estados += [(rng.randrange(256), rng.randrange(256)) for _ in range(400)]
    for e9, ea in estados:
        r9, ra = executar_uma_vez(cpu, bus, e9, ea)
        pares.append({"entrada": [e9, ea], "saida": [r9, ra]})

    # Sequência encadeada: 200 passos a partir de 01:00 (inclui o comportamento de período).
    seq = []
    e9, ea = 0x01, 0x00
    for _ in range(200):
        r9, ra = executar_uma_vez(cpu, bus, e9, ea)
        seq.append([r9, ra])
        e9, ea = r9, ra

    os.makedirs(os.path.dirname(SAIDA), exist_ok=True)
    with open(SAIDA, "w") as f:
        json.dump({
            "origem": "ROM River Raid (1982) (Activision), rotina $FAC6, executada no 6502 de tools/rom/cpu6502.py",
            "pares": pares,
            "sequencia_a_partir_de_01_00": seq,
        }, f, indent=1)
    print(f"{len(pares)} pares e {len(seq)} passos gravados em {os.path.relpath(SAIDA, ROOT)}")


if __name__ == "__main__":
    main()
