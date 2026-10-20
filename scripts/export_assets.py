#!/usr/bin/env python3
"""Exporta as máscaras da recriação para PNG e os envelopes do TIA para WAV.

As máscaras são as mesmas de src/systems/sprites.ts. O áudio usa o LFSR de
9 bits (papel do AUDC 8) e tons quadrados (papel do AUDC $0C).
"""

from __future__ import annotations

import struct
import wave
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GFX = ROOT / "assets" / "graphics"
SFX = ROOT / "assets" / "audio"
RATE = 22050

INK = {
    "Y": (244, 214, 32, 255),
    "K": (12, 12, 16, 255),
    "N": (16, 52, 72, 255),
    "O": (216, 96, 24, 255),
    "C": (72, 176, 220, 255),
    "R": (204, 40, 40, 255),
    "W": (236, 236, 236, 255),
    "U": (48, 72, 196, 255),
    "G": (168, 168, 168, 255),
    "D": (72, 72, 76, 255),
}

SPRITES = {
    "plane": ["...Y...", "..YYY..", ".YYYYY.", "YYYYYYY", "...Y...", "..Y.Y.."],
    "heli": [
        "YYYYYYYYYYYY",
        ".....N......",
        "..NNNN......",
        ".NNNNNNN.Y..",
        "..NNNN..NNN.",
        "...NN....N..",
    ],
    "ship": [
        ".....KKKK.....",
        "....KKKKKK....",
        "OOOOOOOOOOOOOO",
        "OOOOOOOOOOOOOO",
        ".CCCCCCCCCCCC.",
    ],
    "jet": ["....K....", "..KKKKK..", ".KKKKKKK.", "KKKKKKKKK", ".OOO.OOO."],
    "fuel": [
        "RWWWWWWRR",
        "RWWWRRRRR",
        "RWWWWWRRR",
        "RWWWRRRRR",
        "RWWWRRRRR",
        "WKKWWKKWW",
        "WKKWWKKWW",
        "WKKWWKKWW",
        "WKKWWKKWW",
        "WWKKKKWWW",
        "UWWWWWWWU",
        "UWWWUUUUU",
        "UWWWWWWWU",
        "UWWWUUUUU",
        "UWWWWWWWU",
        "WKKWWWWWW",
        "WKKWWWWWW",
        "WKKWWWWWW",
        "WKKWWWWWW",
        "WKKKKKKKK",
    ],
    "bridge": ["GGGGGGGGGGGG", "GRRGGGGGRRGG", "GRRGGGGGRRGG", "GGGGGGGGGGGG"],
}


def png(path: Path, w: int, h: int, rgba: bytes) -> None:
    def chunk(tag: bytes, data: bytes) -> bytes:
        return (
            struct.pack(">I", len(data))
            + tag
            + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    raw = b"".join(b"\x00" + rgba[y * w * 4 : (y + 1) * w * 4] for y in range(h))
    blob = b"\x89PNG\r\n\x1a\n"
    blob += chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0))
    blob += chunk(b"IDAT", zlib.compress(raw, 9))
    blob += chunk(b"IEND", b"")
    path.write_bytes(blob)


def sprite_png(name: str, rows: list[str], scale: int = 4) -> None:
    h = len(rows)
    w = len(rows[0])
    sw, sh = w * scale, h * scale
    buf = bytearray(sw * sh * 4)
    for y, row in enumerate(rows):
        for x, ch in enumerate(row):
            color = INK.get(ch)
            if not color:
                continue
            for dy in range(scale):
                for dx in range(scale):
                    i = ((y * scale + dy) * sw + (x * scale + dx)) * 4
                    buf[i : i + 4] = bytes(color)
    png(GFX / f"{name}.png", sw, sh, bytes(buf))


def noise_byte() -> callable:
    state = {"n": 0x1FF}

    def step() -> int:
        bit = ((state["n"] >> 0) ^ (state["n"] >> 4)) & 1
        state["n"] = (state["n"] >> 1) | (bit << 8)
        return 12000 if state["n"] & 1 else -12000

    return step


def write_wav(path: Path, samples: list[int]) -> None:
    with wave.open(str(path), "w") as handle:
        handle.setnchannels(1)
        handle.setsampwidth(2)
        handle.setframerate(RATE)
        handle.writeframes(b"".join(struct.pack("<h", max(-32767, min(32767, s))) for s in samples))


def envelope_noise(seconds: float, audf: int, amp: int) -> list[int]:
    frames = int(RATE * seconds)
    step = noise_byte()
    div = 0
    bit = amp
    out = []
    for i in range(frames):
        div += 1
        if div >= audf:
            div = 0
            bit = step()
        gain = (frames - i) / frames
        out.append(int(bit * gain * amp / 12000))
    return out


def envelope_tone(seconds: float, audf: int, amp: int) -> list[int]:
    frames = int(RATE * seconds)
    div = 0
    bit = 1
    out = []
    for i in range(frames):
        div += 1
        if div >= audf:
            div = 0
            bit = -bit
        gain = 1 - i / frames
        out.append(int(bit * amp * gain))
    return out


def engine_loop() -> list[int]:
    step = noise_byte()
    div = 0
    bit = 8000
    out = []
    for _ in range(511 * 8):
        div += 1
        if div >= 4:
            div = 0
            bit = step()
        out.append(int(bit * 0.45))
    return out


def icon() -> None:
    w = h = 32
    buf = bytearray(w * h * 4)
    for y in range(h):
        for x in range(w):
            i = (y * w + x) * 4
            buf[i : i + 4] = bytes((16, 48, 140, 255))
    for y, row in enumerate(SPRITES["plane"]):
        for x, ch in enumerate(row):
            if ch != "Y":
                continue
            px = 12 + x
            py = 12 + y
            if 0 <= px < w and 0 <= py < h:
                buf[(py * w + px) * 4 : (py * w + px) * 4 + 4] = bytes(INK["Y"])
    png(ROOT / "src-tauri" / "icons" / "icon.png", w, h, bytes(buf))


def main() -> None:
    GFX.mkdir(parents=True, exist_ok=True)
    SFX.mkdir(parents=True, exist_ok=True)
    (ROOT / "src-tauri" / "icons").mkdir(parents=True, exist_ok=True)
    (ROOT / "builds").mkdir(parents=True, exist_ok=True)
    for name, rows in SPRITES.items():
        sprite_png(name, rows)
    write_wav(SFX / "engine.wav", engine_loop())
    write_wav(SFX / "shot.wav", envelope_noise(0.08, 3, 16000))
    write_wav(SFX / "boom.wav", envelope_noise(0.20, 6, 22000))
    write_wav(SFX / "die.wav", envelope_noise(0.33, 4, 24000))
    write_wav(SFX / "fuel.wav", envelope_tone(0.10, 7, 12000))
    write_wav(SFX / "bridge.wav", envelope_tone(0.25, 14, 14000))
    icon()
    (ROOT / "builds" / ".gitkeep").write_text("")


if __name__ == "__main__":
    main()
