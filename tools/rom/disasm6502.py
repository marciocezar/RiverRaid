#!/usr/bin/env python3
"""Desmontador 6502 para o cartucho Atari 2600 (ROM bruta, 4 KB por banco).

Uso:
    python3 disasm6502.py ROM BANCO [--entry 0xF000 ...] [--linear]

BANCO é o índice do banco de 4 KB (0..N). Cada banco é mapeado na janela
$F000-$FFFF do 6507 (espelho de $1000-$1FFF), igual ao esquema F6.

Por padrão faz varredura recursiva a partir dos pontos de entrada: só
desmonta o que é alcançável por fluxo de controle. Bytes não alcançados
ficam marcados como dados.
"""

import argparse
import sys

# Opcode -> (mnemônico, modo, tamanho). Somente opcodes oficiais do 6502.
IMP, ACC, IMM, ZP, ZPX, ZPY, ABS, ABX, ABY, IND, INX, INY, REL = (
    "imp", "acc", "imm", "zp", "zpx", "zpy", "abs", "abx", "aby",
    "ind", "inx", "iny", "rel",
)

SIZES = {
    IMP: 1, ACC: 1, IMM: 2, ZP: 2, ZPX: 2, ZPY: 2, ABS: 3, ABX: 3,
    ABY: 3, IND: 3, INX: 2, INY: 2, REL: 2,
}

OPS = {
    0x00: ("BRK", IMP), 0x01: ("ORA", INX), 0x05: ("ORA", ZP), 0x06: ("ASL", ZP),
    0x08: ("PHP", IMP), 0x09: ("ORA", IMM), 0x0A: ("ASL", ACC), 0x0D: ("ORA", ABS),
    0x0E: ("ASL", ABS), 0x10: ("BPL", REL), 0x11: ("ORA", INY), 0x15: ("ORA", ZPX),
    0x16: ("ASL", ZPX), 0x18: ("CLC", IMP), 0x19: ("ORA", ABY), 0x1D: ("ORA", ABX),
    0x1E: ("ASL", ABX), 0x20: ("JSR", ABS), 0x21: ("AND", INX), 0x24: ("BIT", ZP),
    0x25: ("AND", ZP), 0x26: ("ROL", ZP), 0x28: ("PLP", IMP), 0x29: ("AND", IMM),
    0x2A: ("ROL", ACC), 0x2C: ("BIT", ABS), 0x2D: ("AND", ABS), 0x2E: ("ROL", ABS),
    0x30: ("BMI", REL), 0x31: ("AND", INY), 0x35: ("AND", ZPX), 0x36: ("ROL", ZPX),
    0x38: ("SEC", IMP), 0x39: ("AND", ABY), 0x3D: ("AND", ABX), 0x3E: ("ROL", ABX),
    0x40: ("RTI", IMP), 0x41: ("EOR", INX), 0x45: ("EOR", ZP), 0x46: ("LSR", ZP),
    0x48: ("PHA", IMP), 0x49: ("EOR", IMM), 0x4A: ("LSR", ACC), 0x4C: ("JMP", ABS),
    0x4D: ("EOR", ABS), 0x4E: ("LSR", ABS), 0x50: ("BVC", REL), 0x51: ("EOR", INY),
    0x55: ("EOR", ZPX), 0x56: ("LSR", ZPX), 0x58: ("CLI", IMP), 0x59: ("EOR", ABY),
    0x5D: ("EOR", ABX), 0x5E: ("LSR", ABX), 0x60: ("RTS", IMP), 0x61: ("ADC", INX),
    0x65: ("ADC", ZP), 0x66: ("ROR", ZP), 0x68: ("PLA", IMP), 0x69: ("ADC", IMM),
    0x6A: ("ROR", ACC), 0x6C: ("JMP", IND), 0x6D: ("ADC", ABS), 0x6E: ("ROR", ABS),
    0x70: ("BVS", REL), 0x71: ("ADC", INY), 0x75: ("ADC", ZPX), 0x76: ("ROR", ZPX),
    0x78: ("SEI", IMP), 0x79: ("ADC", ABY), 0x7D: ("ADC", ABX), 0x7E: ("ROR", ABX),
    0x81: ("STA", INX), 0x84: ("STY", ZP), 0x85: ("STA", ZP), 0x86: ("STX", ZP),
    0x88: ("DEY", IMP), 0x8A: ("TXA", IMP), 0x8C: ("STY", ABS), 0x8D: ("STA", ABS),
    0x8E: ("STX", ABS), 0x90: ("BCC", REL), 0x91: ("STA", INY), 0x94: ("STY", ZPX),
    0x95: ("STA", ZPX), 0x96: ("STX", ZPY), 0x98: ("TYA", IMP), 0x99: ("STA", ABY),
    0x9A: ("TXS", IMP), 0x9D: ("STA", ABX), 0xA0: ("LDY", IMM), 0xA1: ("LDA", INX),
    0xA2: ("LDX", IMM), 0xA4: ("LDY", ZP), 0xA5: ("LDA", ZP), 0xA6: ("LDX", ZP),
    0xA8: ("TAY", IMP), 0xA9: ("LDA", IMM), 0xAA: ("TAX", IMP), 0xAC: ("LDY", ABS),
    0xAD: ("LDA", ABS), 0xAE: ("LDX", ABS), 0xB0: ("BCS", REL), 0xB1: ("LDA", INY),
    0xB4: ("LDY", ZPX), 0xB5: ("LDA", ZPX), 0xB6: ("LDX", ZPY), 0xB8: ("CLV", IMP),
    0xB9: ("LDA", ABY), 0xBA: ("TSX", IMP), 0xBC: ("LDY", ABX), 0xBD: ("LDA", ABX),
    0xBE: ("LDX", ABY), 0xC0: ("CPY", IMM), 0xC1: ("CMP", INX), 0xC4: ("CPY", ZP),
    0xC5: ("CMP", ZP), 0xC6: ("DEC", ZP), 0xC8: ("INY", IMP), 0xC9: ("CMP", IMM),
    0xCA: ("DEX", IMP), 0xCC: ("CPY", ABS), 0xCD: ("CMP", ABS), 0xCE: ("DEC", ABS),
    0xD0: ("BNE", REL), 0xD1: ("CMP", INY), 0xD5: ("CMP", ZPX), 0xD6: ("DEC", ZPX),
    0xD8: ("CLD", IMP), 0xD9: ("CMP", ABY), 0xDD: ("CMP", ABX), 0xDE: ("DEC", ABX),
    0xE0: ("CPX", IMM), 0xE1: ("SBC", INX), 0xE4: ("CPX", ZP), 0xE5: ("SBC", ZP),
    0xE6: ("INC", ZP), 0xE8: ("INX", IMP), 0xE9: ("SBC", IMM), 0xEA: ("NOP", IMP),
    0xEC: ("CPX", ABS), 0xED: ("SBC", ABS), 0xEE: ("INC", ABS), 0xF0: ("BEQ", REL),
    0xF1: ("SBC", INY), 0xF5: ("SBC", ZPX), 0xF6: ("INC", ZPX), 0xF8: ("SED", IMP),
    0xF9: ("SBC", ABY), 0xFD: ("SBC", ABX), 0xFE: ("INC", ABX),
}

# Terminadores de fluxo: nada depois deles é alcançado por fall-through.
ENDS_FLOW = {"RTS", "RTI", "JMP", "BRK"}
BRANCHES = {"BPL", "BMI", "BVC", "BVS", "BCC", "BCS", "BNE", "BEQ"}


class Bank:
    def __init__(self, data, index):
        self.index = index
        self.base = index * 0x1000
        self.data = data[self.base:self.base + 0x1000]

    def read(self, addr):
        return self.data[(addr - 0xF000) & 0xFFF]


def decode(bank, addr):
    op = bank.read(addr)
    if op not in OPS:
        return None
    mnem, mode = OPS[op]
    size = SIZES[mode]
    raw = [bank.read(addr + i) for i in range(size)]
    return {"addr": addr, "op": op, "mnem": mnem, "mode": mode, "size": size, "raw": raw}


def target_of(ins):
    raw = ins["raw"]
    mode = ins["mode"]
    if mode == REL:
        off = raw[1] - 256 if raw[1] >= 128 else raw[1]
        return (ins["addr"] + 2 + off) & 0xFFFF
    if mode == ABS:
        return raw[1] | (raw[2] << 8)
    return None


def operand(ins, labels):
    r = ins["raw"]
    m = ins["mode"]
    w = r[1] | (r[2] << 8) if len(r) == 3 else 0
    if m == IMP:
        return ""
    if m == ACC:
        return "A"
    if m == IMM:
        return f"#${r[1]:02X}"
    if m == ZP:
        return f"${r[1]:02X}"
    if m == ZPX:
        return f"${r[1]:02X},X"
    if m == ZPY:
        return f"${r[1]:02X},Y"
    if m == INX:
        return f"(${r[1]:02X},X)"
    if m == INY:
        return f"(${r[1]:02X}),Y"
    if m == REL:
        t = target_of(ins)
        return labels.get(t, f"${t:04X}")
    if m == ABS:
        return labels.get(w, f"${w:04X}")
    if m == ABX:
        return f"${w:04X},X"
    if m == ABY:
        return f"${w:04X},Y"
    if m == IND:
        return f"(${w:04X})"
    return "?"


def trace(bank, entries):
    """Varredura recursiva. Devolve dict addr -> instrução, e conjunto de destinos."""
    seen = {}
    targets = set()
    work = list(entries)
    while work:
        addr = work.pop()
        while 0xF000 <= addr <= 0xFFFF:
            if addr in seen:
                break
            ins = decode(bank, addr)
            if ins is None:
                break
            seen[addr] = ins
            t = target_of(ins)
            if ins["mnem"] in BRANCHES and t is not None:
                targets.add(t)
                work.append(t)
            elif ins["mnem"] == "JSR" and t is not None:
                targets.add(t)
                work.append(t)
            elif ins["mnem"] == "JMP" and t is not None:
                targets.add(t)
                work.append(t)
            if ins["mnem"] in ENDS_FLOW:
                break
            addr += ins["size"]
    return seen, targets


def listing(bank, seen, targets, entries):
    out = []
    names = {a: f"L{a:04X}" for a in targets}
    for e in entries:
        names[e] = f"ENTRY_{e:04X}"
    a = 0xF000
    while a <= 0xFFFF:
        if a in names:
            out.append(f"{names[a]}:")
        if a in seen:
            ins = seen[a]
            hexs = " ".join(f"{b:02X}" for b in ins["raw"])
            op = operand(ins, names)
            out.append(f"  {a:04X}  {hexs:<8}  {ins['mnem']} {op}".rstrip())
            a += ins["size"]
        else:
            b = bank.read(a)
            out.append(f"  {a:04X}  {b:02X}        .byte ${b:02X}")
            a += 1
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("rom")
    ap.add_argument("bank", type=int)
    ap.add_argument("--entry", action="append", default=[], type=lambda s: int(s, 0))
    ap.add_argument("--linear", action="store_true", help="desmonta tudo, sem fluxo")
    args = ap.parse_args()

    with open(args.rom, "rb") as f:
        data = f.read()
    bank = Bank(data, args.bank)
    entries = args.entry or [0xFFFC]
    entries = [e for e in entries if 0xF000 <= e <= 0xFFFF]

    if args.linear:
        seen = {}
        a = 0xF000
        while a <= 0xFFFF:
            ins = decode(bank, a)
            if ins is None:
                a += 1
                continue
            seen[a] = ins
            a += ins["size"]
        targets = set()
    else:
        seen, targets = trace(bank, entries)

    for line in listing(bank, seen, targets, entries):
        print(line)

    if not args.linear:
        covered = sum(i["size"] for i in seen.values())
        print(f"; banco {args.bank}: {len(seen)} instruções, {covered}/4096 bytes de código",
              file=sys.stderr)


if __name__ == "__main__":
    main()
