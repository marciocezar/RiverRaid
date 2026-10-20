/*
 * Som portátil. A casca pede amostras; este arquivo não abre dispositivo.
 *
 * Dois canais, como o TIA do Atari 2600:
 *   canal 0 — motor (ruído) ou aviso de combustível (tom)
 *   canal 1 — tiro, explosão, posto e ponte
 * Os números de forma vêm da rotina $F7D4 / $F801 do cartucho.
 */
#ifndef RIVER_AUDIO_H
#define RIVER_AUDIO_H

#include "river.h"

#include <stdint.h>

#define RIVER_AUDIO_RATE 22050

void river_audio_sync(RiverGame *g);
void river_audio_render(int16_t *dst, int frames);

#endif
