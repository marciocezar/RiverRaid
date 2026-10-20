/*
 * Núcleo portátil. Não desenha pixels e não lê teclado.
 *
 * O passo do gerador é a rotina $FAC6 (bytes $E9/$EA). A forma do rio
 * segue a máquina de estados em $F8E2–$F92F: direção persistente em $89,
 * magnitude tirada do nibble baixo de $E9, trechos retos entre decisões.
 * O scroll acumula a velocidade como $B5 entra em $8C ($F865). O combustível
 * é o contador $B7:$B8 ($F63A), não uma barra de 0 a 100.
 */
#ifndef RIVER_CORE_H
#define RIVER_CORE_H

#include <stdint.h>

#define RIVER_W 160
#define RIVER_H 192
#define RIVER_MAX_OBJECTS 8

#define RIVER_SPEED_MIN 0x20
#define RIVER_SPEED_MAX 0x70
#define RIVER_SPEED_CRUISE 0x38
#define RIVER_FUEL_FULL 0xFFFFu
#define RIVER_FUEL_LOW 0x40u

enum {
    RIVER_IN_LEFT = 1u << 0,
    RIVER_IN_RIGHT = 1u << 1,
    RIVER_IN_UP = 1u << 2,
    RIVER_IN_DOWN = 1u << 3,
    RIVER_IN_FIRE = 1u << 4
};

enum {
    RIVER_SFX_SHOT = 1u << 0,
    RIVER_SFX_BOOM = 1u << 1,
    RIVER_SFX_FUEL = 1u << 2,
    RIVER_SFX_BRIDGE = 1u << 3,
    RIVER_SFX_DIE = 1u << 4
};

enum {
    RIVER_PHASE_TITLE = 0,
    RIVER_PHASE_PLAY = 1,
    RIVER_PHASE_DEAD = 2,
    RIVER_PHASE_OVER = 3,
    RIVER_PHASE_PAUSE = 4
};

enum {
    RIVER_OBJ_NONE = 0,
    RIVER_OBJ_HELI = 1,
    RIVER_OBJ_SHIP = 2,
    RIVER_OBJ_JET = 3,
    RIVER_OBJ_FUEL = 4,
    RIVER_OBJ_BRIDGE = 5,
    RIVER_OBJ_BOOM = 6
};

typedef struct RiverObj {
    int kind;
    float x;
    float y;
    float vx;
    float w;
    float h;
    int timer;
} RiverObj;

typedef struct RiverGame {
    uint8_t lfsr_lo;
    uint8_t lfsr_hi;
    uint32_t lfsr_steps;

    uint8_t bank_left[RIVER_H];
    uint8_t bank_right[RIVER_H];
    uint8_t island_l[RIVER_H];
    uint8_t island_r[RIVER_H];

    /* Canal do rio. bend_byte faz o papel de $89. */
    int channel_center;
    int channel_half;
    int bend_byte;
    int straight;

    float player_x;
    float player_vx;
    int player_y;
    int speed;
    int facing;
    uint16_t fuel;
    int lives;
    int score;
    int section;
    int rows_until_bridge;
    int since_spawn;
    int invuln;
    int shot_on;
    float shot_x;
    float shot_y;
    int fire_cooldown;
    int phase;
    int dead_timer;
    unsigned input;
    unsigned prev_input;
    unsigned sfx;
    int fuel_tone;
    float scroll_acc;
    uint32_t frame;
    RiverObj objs[RIVER_MAX_OBJECTS];
} RiverGame;

void river_lfsr_step(uint8_t *lo, uint8_t *hi);
void river_init(RiverGame *g);
void river_start(RiverGame *g);
void river_set_input(RiverGame *g, unsigned buttons);
void river_set_speed(RiverGame *g, int speed);
void river_toggle_pause(RiverGame *g);
void river_frame(RiverGame *g);

#endif /* RIVER_CORE_H */
