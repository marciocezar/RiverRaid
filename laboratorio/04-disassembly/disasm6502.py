#!/usr/bin/env python3
"""Desmontador 6502 de varredura linear e por alcance.

Le o cartucho .a26 local, isola a imagem de 4 KB (as copias extras sao
identicas) e produz:

- listagem com enderecos no espaco $F000-$FFFF
- mapa de bytes alcancaveis a partir do RESET
- escritas em registradores do TIA e do RIOT
- uso da zero page

Nada aqui executa o jogo. So le bytes e classifica instrucoes.
"""

from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_ROM = ROOT / "River Raid (1982) (Activision) [!].a26"
OUT_DIR = Path(__file__).resolve().parent

# mnemonico, tamanho, ciclos base (sem penalidade de pagina)
# modos: imp, imm, zp, zpx, zpy, abs, abx, aby, ind, izx, izy, rel, acc
OPS = {
    0x00: ("BRK", "imp"), 0x01: ("ORA", "izx"), 0x05: ("ORA", "zp"),
    0x06: ("ASL", "zp"), 0x08: ("PHP", "imp"), 0x09: ("ORA", "imm"),
    0x0A: ("ASL", "acc"), 0x0D: ("ORA", "abs"), 0x0E: ("ASL", "abs"),
    0x10: ("BPL", "rel"), 0x11: ("ORA", "izy"), 0x15: ("ORA", "zpx"),
    0x16: ("ASL", "zpx"), 0x18: ("CLC", "imp"), 0x19: ("ORA", "aby"),
    0x1D: ("ORA", "abx"), 0x1E: ("ASL", "abx"), 0x20: ("JSR", "abs"),
    0x21: ("AND", "izx"), 0x24: ("BIT", "zp"), 0x25: ("AND", "zp"),
    0x26: ("ROL", "zp"), 0x28: ("PLP", "imp"), 0x29: ("AND", "imm"),
    0x2A: ("ROL", "acc"), 0x2C: ("BIT", "abs"), 0x2D: ("AND", "abs"),
    0x2E: ("ROL", "abs"), 0x30: ("BMI", "rel"), 0x31: ("AND", "izy"),
    0x35: ("AND", "zpx"), 0x36: ("ROL", "zpx"), 0x38: ("SEC", "imp"),
    0x39: ("AND", "aby"), 0x3D: ("AND", "abx"), 0x3E: ("ROL", "abx"),
    0x40: ("RTI", "imp"), 0x41: ("EOR", "izx"), 0x45: ("EOR", "zp"),
    0x46: ("LSR", "zp"), 0x48: ("PHA", "imp"), 0x49: ("EOR", "imm"),
    0x4A: ("LSR", "acc"), 0x4C: ("JMP", "abs"), 0x4D: ("EOR", "abs"),
    0x4E: ("LSR", "abs"), 0x50: ("BVC", "rel"), 0x51: ("EOR", "izy"),
    0x55: ("EOR", "zpx"), 0x56: ("LSR", "zpx"), 0x58: ("CLI", "imp"),
    0x59: ("EOR", "aby"), 0x5D: ("EOR", "abx"), 0x5E: ("LSR", "abx"),
    0x60: ("RTS", "imp"), 0x61: ("ADC", "izx"), 0x65: ("ADC", "zp"),
    0x66: ("ROR", "zp"), 0x68: ("PLA", "imp"), 0x69: ("ADC", "imm"),
    0x6A: ("ROR", "acc"), 0x6C: ("JMP", "ind"), 0x6D: ("ADC", "abs"),
    0x6E: ("ROR", "abs"), 0x70: ("BVS", "rel"), 0x71: ("ADC", "izy"),
    0x75: ("ADC", "zpx"), 0x76: ("ROR", "zpx"), 0x78: ("SEI", "imp"),
    0x79: ("ADC", "aby"), 0x7D: ("ADC", "abx"), 0x7E: ("ROR", "abx"),
    0x81: ("STA", "izx"), 0x84: ("STY", "zp"), 0x85: ("STA", "zp"),
    0x86: ("STX", "zp"), 0x88: ("DEY", "imp"), 0x8A: ("TXA", "imp"),
    0x8C: ("STY", "abs"), 0x8D: ("STA", "abs"), 0x8E: ("STX", "abs"),
    0x90: ("BCC", "rel"), 0x91: ("STA", "izy"), 0x94: ("STY", "zpx"),
    0x95: ("STA", "zpx"), 0x96: ("STX", "zpy"), 0x98: ("TYA", "imp"),
    0x99: ("STA", "aby"), 0x9A: ("TXS", "imp"), 0x9D: ("STA", "abx"),
    0xA0: ("LDY", "imm"), 0xA1: ("LDA", "izx"), 0xA2: ("LDX", "imm"),
    0xA4: ("LDY", "zp"), 0xA5: ("LDA", "zp"), 0xA6: ("LDX", "zp"),
    0xA8: ("TAY", "imp"), 0xA9: ("LDA", "imm"), 0xAA: ("TAX", "imp"),
    0xAC: ("LDY", "abs"), 0xAD: ("LDA", "abs"), 0xAE: ("LDX", "abs"),
    0xB0: ("BCS", "rel"), 0xB1: ("LDA", "izy"), 0xB4: ("LDY", "zpx"),
    0xB5: ("LDA", "zpx"), 0xB6: ("LDX", "zpy"), 0xB8: ("CLV", "imp"),
    0xB9: ("LDA", "aby"), 0xBA: ("TSX", "imp"), 0xBC: ("LDY", "abx"),
    0xBD: ("LDA", "abx"), 0xBE: ("LDX", "aby"), 0xC0: ("CPY", "imm"),
    0xC1: ("CMP", "izx"), 0xC4: ("CPY", "zp"), 0xC5: ("CMP", "zp"),
    0xC6: ("DEC", "zp"), 0xC8: ("INY", "imp"), 0xC9: ("CMP", "imm"),
    0xCA: ("DEX", "imp"), 0xCC: ("CPY", "abs"), 0xCD: ("CMP", "abs"),
    0xCE: ("DEC", "abs"), 0xD0: ("BNE", "rel"), 0xD1: ("CMP", "izy"),
    0xD5: ("CMP", "zpx"), 0xD6: ("DEC", "zpx"), 0xD8: ("CLD", "imp"),
    0xD9: ("CMP", "aby"), 0xDD: ("CMP", "abx"), 0xDE: ("DEC", "abx"),
    0xE0: ("CPX", "imm"), 0xE1: ("SBC", "izx"), 0xE4: ("CPX", "zp"),
    0xE5: ("SBC", "zp"), 0xE6: ("INC", "zp"), 0xE8: ("INX", "imp"),
    0xE9: ("SBC", "imm"), 0xEA: ("NOP", "imp"), 0xEC: ("CPX", "abs"),
    0xED: ("SBC", "abs"), 0xEE: ("INC", "abs"), 0xF0: ("BEQ", "rel"),
    0xF1: ("SBC", "izy"), 0xF5: ("SBC", "zpx"), 0xF6: ("INC", "zpx"),
    0xF8: ("SED", "imp"), 0xF9: ("SBC", "aby"), 0xFD: ("SBC", "abx"),
    0xFE: ("INC", "abx"),
}

TIA = {
    0x00: "VSYNC", 0x01: "VBLANK", 0x02: "WSYNC", 0x04: "NUSIZ0",
    0x05: "NUSIZ1", 0x06: "COLUP0", 0x07: "COLUP1", 0x08: "COLUPF",
    0x09: "COLUBK", 0x0A: "CTRLPF", 0x0B: "REFP0", 0x0C: "REFP1",
    0x0D: "PF0", 0x0E: "PF1", 0x0F: "PF2", 0x10: "RESP0", 0x11: "RESP1",
    0x12: "RESM0", 0x13: "RESM1", 0x14: "RESBL", 0x15: "AUDC0",
    0x16: "AUDC1", 0x17: "AUDF0", 0x18: "AUDF1", 0x19: "AUDV0",
    0x1A: "AUDV1", 0x1B: "GRP0", 0x1C: "GRP1", 0x1D: "ENAM0",
    0x1E: "ENAM1", 0x1F: "ENABL", 0x20: "HMP0", 0x21: "HMP1",
    0x22: "HMM0", 0x23: "HMM1", 0x24: "HMBL", 0x25: "VDELP0",
    0x26: "VDELP1", 0x27: "VDELBL", 0x28: "RESMP0", 0x29: "RESMP1",
    0x2A: "HMOVE", 0x2B: "HMCLR", 0x2C: "CXCLR",
}

RIOT = {
    0x280: "SWCHA", 0x281: "SWACNT", 0x282: "SWCHB", 0x283: "SWBCNT",
    0x284: "INTIM", 0x294: "TIM1T", 0x295: "TIM8T", 0x296: "TIM64T",
    0x297: "T1024T",
}

BASE = 0xF000
SIZE = 0x1000


def load_image(path: Path) -> bytes:
    raw = path.read_bytes()
    if len(raw) < SIZE or len(raw) % SIZE != 0:
        raise SystemExit(f"tamanho inesperado: {len(raw)} bytes em {path}")
    banks = [raw[i:i + SIZE] for i in range(0, len(raw), SIZE)]
    if any(b != banks[0] for b in banks[1:]):
        raise SystemExit("as fatias de 4 KB nao sao identicas; analise manual")
    return banks[0]


def fetch(rom: bytes, addr: int, n: int) -> bytes:
    off = addr - BASE
    if off < 0 or off + n > SIZE:
        return b""
    return rom[off:off + n]


def fmt_operand(mode: str, addr: int, rom: bytes) -> tuple[str, int | None, int | None]:
    """Retorna texto, alvo absoluto (se houver) e imediato (se houver)."""
    raw = fetch(rom, addr, 3)
    if mode == "imp" or mode == "acc":
        return ("A" if mode == "acc" else ""), None, None
    if mode == "imm":
        return f"#${raw[1]:02X}", None, raw[1]
    if mode == "zp":
        return f"${raw[1]:02X}", raw[1], None
    if mode == "zpx":
        return f"${raw[1]:02X},X", raw[1], None
    if mode == "zpy":
        return f"${raw[1]:02X},Y", raw[1], None
    if mode == "abs":
        w = raw[1] | (raw[2] << 8)
        return f"${w:04X}", w, None
    if mode == "abx":
        w = raw[1] | (raw[2] << 8)
        return f"${w:04X},X", w, None
    if mode == "aby":
        w = raw[1] | (raw[2] << 8)
        return f"${w:04X},Y", w, None
    if mode == "ind":
        w = raw[1] | (raw[2] << 8)
        return f"(${w:04X})", w, None
    if mode == "izx":
        return f"(${raw[1]:02X},X)", raw[1], None
    if mode == "izy":
        return f"(${raw[1]:02X}),Y", raw[1], None
    if mode == "rel":
        rel = raw[1] if raw[1] < 128 else raw[1] - 256
        target = (addr + 2 + rel) & 0xFFFF
        return f"${target:04X}", target, None
    return "?", None, None


def length_of(mode: str) -> int:
    if mode in ("imp", "acc"):
        return 1
    if mode in ("imm", "zp", "zpx", "zpy", "izx", "izy", "rel"):
        return 2
    return 3


def decode_at(rom: bytes, addr: int):
    off = addr - BASE
    op = rom[off]
    spec = OPS.get(op)
    if spec is None:
        return {"addr": addr, "op": op, "mnem": "???", "mode": "imp", "len": 1,
                "text": f"${addr:04X}: {op:02X}          ???", "target": None,
                "imm": None, "valid": False}
    mnem, mode = spec
    n = length_of(mode)
    raw = rom[off:off + n]
    operand, target, imm = fmt_operand(mode, addr, rom)
    hexb = " ".join(f"{b:02X}" for b in raw).ljust(8)
    text = f"${addr:04X}: {hexb}  {mnem}"
    if operand:
        text += " " + operand
    return {"addr": addr, "op": op, "mnem": mnem, "mode": mode, "len": n,
            "text": text, "target": target, "imm": imm, "valid": True,
            "raw": raw}


CONTROL = {"JMP", "JSR", "RTS", "RTI", "BRK", "BPL", "BMI", "BVC", "BVS",
           "BCC", "BCS", "BNE", "BEQ"}
BRANCHES = {"BPL", "BMI", "BVC", "BVS", "BCC", "BCS", "BNE", "BEQ"}


def walk(rom: bytes, entry: int) -> dict[int, dict]:
    """Segue o fluxo a partir do RESET. Desvios condicionais seguem os dois lados."""
    ins_at: dict[int, dict] = {}
    stack = [entry]
    seen = set()
    while stack:
        addr = stack.pop()
        if addr in seen:
            continue
        if not (BASE <= addr < BASE + SIZE):
            continue
        seen.add(addr)
        ins = decode_at(rom, addr)
        ins_at[addr] = ins
        nxt = addr + ins["len"]
        m = ins["mnem"]
        if m == "JMP" and ins["target"] is not None:
            stack.append(ins["target"])
            continue
        if m == "JSR" and ins["target"] is not None:
            stack.append(ins["target"])
            stack.append(nxt)
            continue
        if m in ("RTS", "RTI", "BRK"):
            continue
        if m in BRANCHES and ins["target"] is not None:
            stack.append(ins["target"])
            stack.append(nxt)
            continue
        if m == "???":
            continue
        stack.append(nxt)
    return ins_at


def annotate_hw(ins: dict) -> str | None:
    if ins["mnem"] not in ("STA", "STX", "STY", "LDA", "LDX", "LDY"):
        return None
    t = ins["target"]
    if t is None:
        return None
    if t <= 0x3F and ins["mode"] in ("zp", "zpx", "abs"):
        name = TIA.get(t & 0x3F)
        if name and ins["mnem"].startswith("ST"):
            return name
    if t in RIOT or (t & 0x2FF) in RIOT:
        return RIOT.get(t) or RIOT.get(t & 0x2FF)
    return None


def main() -> None:
    rom_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_ROM
    raw = rom_path.read_bytes()
    rom = load_image(rom_path)
    digest = hashlib.sha256(raw).hexdigest()
    image_digest = hashlib.sha256(rom).hexdigest()

    nmi = rom[-6] | (rom[-5] << 8)
    reset = rom[-4] | (rom[-3] << 8)
    irq = rom[-2] | (rom[-1] << 8)

    # O quadro visivel nao e alcancado por JSR/JMP direto. Em $F0DA o
    # programa empilha um endereco vindo de duas tabelas e o RTS em $F139
    # salta para esse endereco + 1. As 10 primeiras entradas caem na ROM.
    kernel = []
    for i in range(10):
        hi = rom[(0xFBEF - BASE) + i]
        lo = rom[(0xFDF6 - BASE) + i]
        kernel.append(((hi << 8) | lo) + 1)
    reached = walk(rom, reset)
    for entry in kernel:
        reached.update(walk(rom, entry))
    code_bytes = set()
    for ins in reached.values():
        for i in range(ins["len"]):
            code_bytes.add(ins["addr"] + i)

    listing = []
    hw_writes: dict[str, list[str]] = {}
    zp_stores: dict[int, int] = {}
    zp_loads: dict[int, int] = {}
    jsrs: list[tuple[int, int]] = []
    addr = BASE
    while addr < BASE + SIZE:
        if addr in reached:
            ins = reached[addr]
        else:
            ins = decode_at(rom, addr)
            # fora do alcance: mostra bytes crus se a instrucao atravessaria dado
            # ainda assim decodifica para leitura humana, marcado como dado.
        tag = "COD" if addr in reached else "DAD"
        hw = annotate_hw(ins) if addr in reached else None
        line = f"{tag}  {ins['text']}"
        if hw:
            line += f"    ; {hw}"
            hw_writes.setdefault(hw, []).append(f"${addr:04X}")
        listing.append(line)
        if addr in reached and ins["target"] is not None and ins["target"] < 0x100:
            if ins["mnem"] in ("STA", "STX", "STY"):
                zp_stores[ins["target"]] = zp_stores.get(ins["target"], 0) + 1
            if ins["mnem"] in ("LDA", "LDX", "LDY"):
                zp_loads[ins["target"]] = zp_loads.get(ins["target"], 0) + 1
        if addr in reached and ins["mnem"] == "JSR" and ins["target"] is not None:
            jsrs.append((addr, ins["target"]))
        addr += ins["len"] if addr in reached else 1

    data_ranges = []
    start = None
    for a in range(BASE, BASE + SIZE):
        if a not in code_bytes:
            if start is None:
                start = a
        elif start is not None:
            data_ranges.append((start, a - 1))
            start = None
    if start is not None:
        data_ranges.append((start, BASE + SIZE - 1))

    # agrupa dados em blocos contiguos ja calculados
    report = {
        "arquivo": str(rom_path.name),
        "bytes_arquivo": len(raw),
        "copias_de_4kb": len(raw) // SIZE,
        "sha256_arquivo": digest,
        "sha256_imagem_4kb": image_digest,
        "vetores": {"nmi": nmi, "reset": reset, "irq_brk": irq},
        "instrucoes_alcancadas": len(reached),
        "bytes_de_codigo": len(code_bytes),
        "bytes_nao_alcancados": SIZE - len(code_bytes),
        "blocos_de_dados": [
            {"inicio": s, "fim": e, "tamanho": e - s + 1} for s, e in data_ranges
        ],
        "escritas_hardware": {k: v for k, v in sorted(hw_writes.items())},
        "zero_page_stores": {f"${k:02X}": v for k, v in sorted(zp_stores.items())},
        "zero_page_loads": {f"${k:02X}": v for k, v in sorted(zp_loads.items())},
        "jsr": [{"de": a, "para": b} for a, b in jsrs],
        "entradas_kernel_rts": kernel,
    }

    (OUT_DIR / "listing.asm").write_text("\n".join(listing) + "\n", encoding="utf-8")
    (OUT_DIR / "mapa.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")

    summary = []
    summary.append(f"arquivo: {rom_path.name}")
    summary.append(f"sha256 arquivo: {digest}")
    summary.append(f"sha256 imagem 4kb: {image_digest}")
    summary.append(f"copias identicas de 4kb: {len(raw) // SIZE}")
    summary.append(f"RESET ${reset:04X}  NMI ${nmi:04X}  IRQ ${irq:04X}")
    summary.append(f"instrucoes alcancadas: {len(reached)}")
    summary.append(f"bytes de codigo: {len(code_bytes)} / {SIZE}")
    summary.append("blocos nao alcancados (dados ou codigo morto):")
    for s, e in data_ranges:
        summary.append(f"  ${s:04X}-${e:04X}  ({e - s + 1} bytes)")
    summary.append("escritas em hardware observadas:")
    for name, sites in sorted(hw_writes.items()):
        summary.append(f"  {name:8} {len(sites):3}  {', '.join(sites[:8])}")
    (OUT_DIR / "resumo.txt").write_text("\n".join(summary) + "\n", encoding="utf-8")
    print("\n".join(summary))


if __name__ == "__main__":
    main()
