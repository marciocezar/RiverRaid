/*
 * Desenho portátil. Enche um quadro RGBA de RIVER_W por RIVER_H.
 * A primeira linha é o topo da tela. Cada pixel são 4 bytes: R, G, B, A.
 *
 * Nenhuma casca (Mac, Windows, iOS, Android) precisa saber desenhar um
 * avião. Ela só amplia este quadro. Os sprites são pixel art de laboratório,
 * no jeito do River Raid de 1982, para cada alvo ser reconhecível.
 */
#ifndef RIVER_PRESENT_H
#define RIVER_PRESENT_H

#include "river.h"

#define RIVER_FRAME_BYTES (RIVER_W * RIVER_H * 4)

void river_present(const RiverGame *g, uint8_t *rgba);

#endif
