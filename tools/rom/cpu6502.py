#!/usr/bin/env python3
"""CPU 6502 mínima para executar o ROM do Atari 2600 e registrar o que ele escreve.

Não desenha nada. O TIA e o RIOT são simulados só o necessário:
  - escritas no TIA são registradas (com o número da linha de varredura);
  - WSYNC avança a linha de varredura;
  - INTIM sempre lê 0, então as esperas por temporizador terminam na hora;
  - SWCHA/SWCHB/INPT4 devolvem o que o chamador configurar em `joy`.

Serve como oráculo: o que o ROM faz aqui é o comportamento original.
"""

from disasm6502 import OPS, SIZES, IMP, ACC, IMM, ZP, ZPX, ZPY, ABS, ABX, ABY, IND, INX, INY, REL

N_FLAG, V_FLAG, B_FLAG, U_FLAG, D_FLAG, I_FLAG, Z_FLAG, C_FLAG = (
    0x80, 0x40, 0x10, 0x20, 0x08, 0x04, 0x02, 0x01,
)

TIA_WRITE_NAMES = {
    0x00: "VSYNC", 0x01: "VBLANK", 0x02: "WSYNC", 0x06: "COLUP0", 0x07: "COLUP1",
    0x08: "COLUPF", 0x09: "COLUBK", 0x0A: "CTRLPF", 0x0D: "PF0", 0x0E: "PF1", 0x0F: "PF2",
    0x15: "AUDC0", 0x16: "AUDC1", 0x17: "AUDF0", 0x18: "AUDF1", 0x19: "AUDV0", 0x1A: "AUDV1",
    0x1B: "GRP0", 0x1C: "GRP1", 0x2A: "HMOVE", 0x2C: "CXCLR",
}


class Bus:
    def __init__(self, rom):
        self.rom = rom  # 4096 bytes (um banco)
        self.ram = bytearray(128)
        self.joy = 0xFF      # SWCHA: bits 0-3 = direção ativa-baixa, 4-7 = jogador 1
        self.console = 0xFF  # SWCHB: bit0 reset, bit1 select, bit3 dificuldade
        self.fire = 0x80     # INPT4: bit7 = 1 solto, 0 pressionado
        self.frame = 0
        self.scanline = 0
        self.tia_log = []    # (quadro, linha, nome, valor)
        self.vsync_seen = 0
        self.wsync = 0

    def read(self, addr):
        a = addr & 0x1FFF
        if a & 0x1000:
            return self.rom[a & 0xFFF]
        if a & 0x0200:  # RIOT: $0280-$02FF
            off = a & 0x1F
            if off == 0x00:
                return self.joy
            if off == 0x02:
                return self.console
            if off == 0x04:
                return 0x00  # INTIM sempre zero
            return 0x00
        if a & 0x0080:  # RAM $80-$FF (espelhada em $180-$1FF)
            return self.ram[a & 0x7F]
        # TIA leitura
        if (a & 0x0F) == 0x0C:
            return self.fire
        return 0x00

    def write(self, addr, value):
        a = addr & 0x1FFF
        value &= 0xFF
        if a & 0x1000:
            return  # ROM: escrita ignorada
        if a & 0x0200:
            return  # RIOT escrita (temporizadores) ignorada
        if a & 0x0080:
            self.ram[a & 0x7F] = value
            return
        reg = a & 0x3F
        if reg == 0x00 and (value & 0x02):
            self.vsync_seen += 1
            self.frame += 1
            self.scanline = 0
        if reg == 0x02:
            self.wsync += 1
            self.scanline += 1
        name = TIA_WRITE_NAMES.get(reg)
        if name is not None:
            self.tia_log.append((self.frame, self.scanline, name, value))


class CPU:
    def __init__(self, bus):
        self.bus = bus
        self.a = self.x = self.y = 0
        self.sp = 0xFF
        self.p = U_FLAG | I_FLAG
        self.pc = 0
        self.ipc = 0
        self.cycles = 0

    def reset(self):
        self.pc = self.bus.read(0xFFFC) | (self.bus.read(0xFFFD) << 8)

    # --- pilha ---
    def push(self, v):
        self.bus.write(0x100 | self.sp, v)
        self.sp = (self.sp - 1) & 0xFF

    def pop(self):
        self.sp = (self.sp + 1) & 0xFF
        return self.bus.read(0x100 | self.sp)

    def set_zn(self, v):
        v &= 0xFF
        self.p = (self.p & ~(Z_FLAG | N_FLAG)) | (Z_FLAG if v == 0 else 0) | (v & N_FLAG)
        return v

    def addr_of(self, mode):
        """Devolve (endereço efetivo) para modos de memória, e o valor do operando imediato."""
        pc = self.ipc
        b = self.bus
        if mode == IMM:
            return None, b.read(pc + 1)
        if mode == ZP:
            return b.read(pc + 1), None
        if mode == ZPX:
            return (b.read(pc + 1) + self.x) & 0xFF, None
        if mode == ZPY:
            return (b.read(pc + 1) + self.y) & 0xFF, None
        if mode == ABS:
            return b.read(pc + 1) | (b.read(pc + 2) << 8), None
        if mode == ABX:
            return ((b.read(pc + 1) | (b.read(pc + 2) << 8)) + self.x) & 0xFFFF, None
        if mode == ABY:
            return ((b.read(pc + 1) | (b.read(pc + 2) << 8)) + self.y) & 0xFFFF, None
        if mode == INX:
            zp = (b.read(pc + 1) + self.x) & 0xFF
            return b.read(zp) | (b.read((zp + 1) & 0xFF) << 8), None
        if mode == INY:
            zp = b.read(pc + 1)
            base = b.read(zp) | (b.read((zp + 1) & 0xFF) << 8)
            return (base + self.y) & 0xFFFF, None
        raise ValueError(f"modo {mode}")

    def step(self):
        self.ipc = self.pc
        op = self.bus.read(self.pc)
        if op not in OPS:
            raise RuntimeError(f"opcode ilegal ${op:02X} em ${self.pc:04X}")
        mnem, mode = OPS[op]
        size = SIZES[mode]
        self.pc = (self.pc + size) & 0xFFFF
        self.cycles += 2
        getattr(self, "op_" + mnem)(mode)

    # --- leitura/escrita de operando ---
    def load(self, mode):
        if mode == ACC:
            return self.a
        if mode == REL:
            raise ValueError("rel")
        addr, imm = self.addr_of(mode)
        if imm is not None:
            return imm
        return self.bus.read(addr)

    def store(self, mode, value):
        addr, _ = self.addr_of(mode)
        self.bus.write(addr, value)

    def rmw(self, mode, fn):
        """Lê, aplica fn (que devolve o novo valor e atualiza flags), grava."""
        if mode == ACC:
            self.a = fn(self.a)
            return
        addr, _ = self.addr_of(mode)
        v = self.bus.read(addr)
        self.bus.write(addr, fn(v))

    def branch(self, cond):
        off = self.bus.read(self.ipc + 1)
        off = off - 256 if off >= 128 else off
        if cond:
            self.pc = (self.pc + off) & 0xFFFF

    # --- mnemônicos ---
    def op_BRK(self, mode):
        self.pc = (self.pc + 1) & 0xFFFF
        self.push(self.pc >> 8)
        self.push(self.pc & 0xFF)
        self.push(self.p | B_FLAG)
        self.p |= I_FLAG
        self.pc = self.bus.read(0xFFFE) | (self.bus.read(0xFFFF) << 8)

    def op_ORA(self, mode):
        self.a = self.set_zn(self.a | self.load(mode))

    def op_AND(self, mode):
        self.a = self.set_zn(self.a & self.load(mode))

    def op_EOR(self, mode):
        self.a = self.set_zn(self.a ^ self.load(mode))

    def _adc(self, v):
        if self.p & D_FLAG:
            raise RuntimeError("modo decimal não implementado")
        c = 1 if self.p & C_FLAG else 0
        r = self.a + v + c
        self.p &= ~(C_FLAG | V_FLAG)
        if r > 0xFF:
            self.p |= C_FLAG
        if ((self.a ^ r) & (v ^ r) & 0x80):
            self.p |= V_FLAG
        self.a = self.set_zn(r)

    def op_ADC(self, mode):
        self._adc(self.load(mode))

    def op_SBC(self, mode):
        self._adc(self.load(mode) ^ 0xFF)

    def _cmp(self, reg, v):
        r = reg - v
        self.p &= ~C_FLAG
        if reg >= v:
            self.p |= C_FLAG
        self.set_zn(r)

    def op_CMP(self, mode):
        self._cmp(self.a, self.load(mode))

    def op_CPX(self, mode):
        self._cmp(self.x, self.load(mode))

    def op_CPY(self, mode):
        self._cmp(self.y, self.load(mode))

    def op_BIT(self, mode):
        v = self.load(mode)
        self.p &= ~(Z_FLAG | N_FLAG | V_FLAG)
        if (self.a & v) == 0:
            self.p |= Z_FLAG
        self.p |= v & (N_FLAG | V_FLAG)

    def op_LDA(self, mode):
        self.a = self.set_zn(self.load(mode))

    def op_LDX(self, mode):
        self.x = self.set_zn(self.load(mode))

    def op_LDY(self, mode):
        self.y = self.set_zn(self.load(mode))

    def op_STA(self, mode):
        self.store(mode, self.a)

    def op_STX(self, mode):
        self.store(mode, self.x)

    def op_STY(self, mode):
        self.store(mode, self.y)

    def op_ASL(self, mode):
        def f(v):
            self.p = (self.p & ~C_FLAG) | ((v >> 7) & 1)
            return self.set_zn(v << 1)
        self.rmw(mode, f)

    def op_LSR(self, mode):
        def f(v):
            self.p = (self.p & ~C_FLAG) | (v & 1)
            return self.set_zn(v >> 1)
        self.rmw(mode, f)

    def op_ROL(self, mode):
        def f(v):
            c = self.p & C_FLAG
            self.p = (self.p & ~C_FLAG) | ((v >> 7) & 1)
            return self.set_zn(((v << 1) | (1 if c else 0)) & 0xFF)
        self.rmw(mode, f)

    def op_ROR(self, mode):
        def f(v):
            c = self.p & C_FLAG
            self.p = (self.p & ~C_FLAG) | (v & 1)
            return self.set_zn((v >> 1) | (0x80 if c else 0))
        self.rmw(mode, f)

    def op_INC(self, mode):
        self.rmw(mode, lambda v: self.set_zn(v + 1))

    def op_DEC(self, mode):
        self.rmw(mode, lambda v: self.set_zn(v - 1))

    def op_INX(self, mode):
        self.x = self.set_zn(self.x + 1)

    def op_INY(self, mode):
        self.y = self.set_zn(self.y + 1)

    def op_DEX(self, mode):
        self.x = self.set_zn(self.x - 1)

    def op_DEY(self, mode):
        self.y = self.set_zn(self.y - 1)

    def op_TAX(self, mode):
        self.x = self.set_zn(self.a)

    def op_TAY(self, mode):
        self.y = self.set_zn(self.a)

    def op_TXA(self, mode):
        self.a = self.set_zn(self.x)

    def op_TYA(self, mode):
        self.a = self.set_zn(self.y)

    def op_TSX(self, mode):
        self.x = self.set_zn(self.sp)

    def op_TXS(self, mode):
        self.sp = self.x

    def op_PHA(self, mode):
        self.push(self.a)

    def op_PLA(self, mode):
        self.a = self.set_zn(self.pop())

    def op_PHP(self, mode):
        self.push(self.p | B_FLAG | U_FLAG)

    def op_PLP(self, mode):
        self.p = (self.pop() & ~B_FLAG) | U_FLAG

    def op_CLC(self, mode):
        self.p &= ~C_FLAG

    def op_SEC(self, mode):
        self.p |= C_FLAG

    def op_CLI(self, mode):
        self.p &= ~I_FLAG

    def op_SEI(self, mode):
        self.p |= I_FLAG

    def op_CLD(self, mode):
        self.p &= ~D_FLAG

    def op_SED(self, mode):
        self.p |= D_FLAG

    def op_CLV(self, mode):
        self.p &= ~V_FLAG

    def op_NOP(self, mode):
        pass

    def op_JMP(self, mode):
        lo = self.bus.read(self.ipc + 1)
        hi = self.bus.read(self.ipc + 2)
        if mode == IND:
            p = lo | (hi << 8)
            self.pc = self.bus.read(p) | (self.bus.read((p & 0xFF00) | ((p + 1) & 0xFF)) << 8)
        else:
            self.pc = lo | (hi << 8)

    def op_JSR(self, mode):
        ret = (self.pc - 1) & 0xFFFF  # PC já aponta para a próxima instrução
        self.push(ret >> 8)
        self.push(ret & 0xFF)
        self.pc = self.bus.read(self.ipc + 1) | (self.bus.read(self.ipc + 2) << 8)

    def op_RTS(self, mode):
        lo = self.pop()
        hi = self.pop()
        self.pc = ((hi << 8) | lo) + 1

    def op_RTI(self, mode):
        self.p = (self.pop() & ~B_FLAG) | U_FLAG
        lo = self.pop()
        hi = self.pop()
        self.pc = (hi << 8) | lo

    def op_BPL(self, mode):
        self.branch(not self.p & N_FLAG)

    def op_BMI(self, mode):
        self.branch(self.p & N_FLAG)

    def op_BVC(self, mode):
        self.branch(not self.p & V_FLAG)

    def op_BVS(self, mode):
        self.branch(self.p & V_FLAG)

    def op_BCC(self, mode):
        self.branch(not self.p & C_FLAG)

    def op_BCS(self, mode):
        self.branch(self.p & C_FLAG)

    def op_BNE(self, mode):
        self.branch(not self.p & Z_FLAG)

    def op_BEQ(self, mode):
        self.branch(self.p & Z_FLAG)

    def run_until(self, stop, max_steps=50_000_000):
        """Executa até stop(cpu) ser verdadeiro. Levanta erro se estourar o limite."""
        n = 0
        while not stop(self):
            self.step()
            n += 1
            if n > max_steps:
                raise RuntimeError(f"limite de passos atingido em ${self.pc:04X}")
        return n
