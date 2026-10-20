/*
 * Simulação de um quadro. O desenho fica em src/systems/present.c.
 *
 * Transcrito do cartucho e coberto por teste:
 *   river_lfsr_step — $FAC6, semente $E9=$14 $EA=$A8
 *
 * Máquina do mapa, lida em $F8E2–$F92F e rasterizada para margens:
 *   a direção ($89) persiste; a magnitude sai de $E9 & $0F, com piso 2
 *   ($F916) e teto $0E / $0D / $08 ($F921–$F92D). Entre decisões o trecho
 *   é reto. O LFSR só avança na decisão, como o JSR $FAC6 do segmento,
 *   não em toda linha.
 *
 * Scroll: $B5 acumula e só então a linha anda ($F865–$F877).
 * Combustível: $FFFF perde $20 por quadro ($F63A). Aviso com o byte alto
 * abaixo de $40 ($F78D). O posto soma no byte alto ($F613).
 */
#include "river.h"

#include "hitbox.h"

#include <string.h>

enum {
    PLAYER_Y = 152,
    PLAYER_HIT_W = 5,
    PLAYER_HIT_H = 4,
    SECTION_ROWS = 1100,
    SPAWN_GAP = 72,
    BRIDGE_HITS = 1,
    SHOT_STEP = 6,
    HALF_MIN = 18,
    HALF_MAX = 46
};

static int clamp_int(int v, int lo, int hi) {
    if (v < lo) {
        return lo;
    }
    if (v > hi) {
        return hi;
    }
    return v;
}

static float clampf(float v, float lo, float hi) {
    if (v < lo) {
        return lo;
    }
    if (v > hi) {
        return hi;
    }
    return v;
}

void river_lfsr_step(uint8_t *lo, uint8_t *hi) {
    /*
     * $FAC6:
     *   LDA $EA / ASL / ASL / ASL / EOR $EA / ASL / ROL $E9 / ROL $EA
     * O acumulador final não é guardado pelos chamadores.
     */
    uint8_t a = *hi;
    a = (uint8_t)(a << 1);
    a = (uint8_t)(a << 1);
    a = (uint8_t)(a << 1);
    a = (uint8_t)(a ^ *hi);
    unsigned carry = (a >> 7) & 1u;
    unsigned carry_lo = (*lo >> 7) & 1u;
    *lo = (uint8_t)((*lo << 1) | carry);
    *hi = (uint8_t)((*hi << 1) | carry_lo);
}

static void lfsr_advance(RiverGame *g) {
    river_lfsr_step(&g->lfsr_lo, &g->lfsr_hi);
    g->lfsr_steps += 1;
}

static RiverObj *free_slot(RiverGame *g) {
    for (int i = 0; i < RIVER_MAX_OBJECTS; i++) {
        if (g->objs[i].kind == RIVER_OBJ_NONE) {
            return &g->objs[i];
        }
    }
    return 0;
}

static int count_alive(const RiverGame *g) {
    int n = 0;
    for (int i = 0; i < RIVER_MAX_OBJECTS; i++) {
        if (g->objs[i].kind != RIVER_OBJ_NONE && g->objs[i].kind != RIVER_OBJ_BOOM) {
            n += 1;
        }
    }
    return n;
}

static void spawn_at(RiverGame *g, int kind, float x, float y, float w, float h, float vx) {
    RiverObj *o = free_slot(g);
    if (!o) {
        return;
    }
    o->kind = kind;
    o->x = x;
    o->y = y;
    o->w = w;
    o->h = h;
    o->vx = vx;
    o->timer = (kind == RIVER_OBJ_BRIDGE) ? BRIDGE_HITS : 0;
}

static void write_channel_row(RiverGame *g, int y) {
    int half = g->channel_half;
    int mid = clamp_int(g->channel_center, 8 + half, (RIVER_W - 1) - half);
    g->channel_center = mid;
    g->bank_left[y] = (uint8_t)(mid - half);
    g->bank_right[y] = (uint8_t)(mid + half);
    g->island_l[y] = 0;
    g->island_r[y] = 0;
    if (g->channel_half >= 28 && g->bend_byte & 0x80 && (g->lfsr_lo & 0x03) == 0) {
        int il = mid - 5;
        int ir = mid + 5;
        if (il > g->bank_left[y] + 10 && ir < g->bank_right[y] - 10) {
            g->island_l[y] = (uint8_t)il;
            g->island_r[y] = (uint8_t)ir;
        }
    }
}

static void decide_channel(RiverGame *g) {
    /*
     * Magnitude $F910–$F92D e troca de sentido quando $E9 & $30 é zero
     * ou quando o bit 7 de (ASL $89 EOR $89) está ligado ($F8ED).
     */
    lfsr_advance(g);
    int mag = g->lfsr_lo & 0x0f;
    if (mag < 2) {
        mag += 2;
    }
    int cap = (g->bend_byte & 0x80) ? 13 : 14;
    if (g->island_r[0] || g->island_l[0]) {
        cap = 8;
    }
    if (mag > cap) {
        mag = cap;
    }
    int mixed = ((g->bend_byte << 1) ^ g->bend_byte) & 0xff;
    if ((g->lfsr_lo & 0x30) == 0 || (mixed & 0x80)) {
        g->bend_byte = (g->bend_byte & 0x80) ? 0x40 : 0xC0;
    }
    int sign = (g->bend_byte & 0x80) ? -1 : 1;
    int step = mag >= 8 ? 2 : 1;
    g->channel_center += sign * step;
    if ((g->lfsr_hi & 0x07) == 0) {
        g->channel_half += (g->lfsr_hi & 0x08) ? 2 : -2;
    }
    g->channel_half = clamp_int(g->channel_half, HALF_MIN, HALF_MAX);
    int island = g->channel_half >= 28 && (g->bend_byte & 0x80) && (g->lfsr_lo & 0x03) == 0;
    g->straight = island ? 22 : 4 + (g->lfsr_lo & 0x07);
}

static void maybe_spawn(RiverGame *g, int y) {
    if (g->phase != RIVER_PHASE_PLAY && g->phase != RIVER_PHASE_TITLE) {
        return;
    }
    if (g->since_spawn < SPAWN_GAP || count_alive(g) >= 4) {
        return;
    }
    int water_l = g->bank_left[y] + 8;
    int water_r = g->bank_right[y] - 8;
    if (g->island_r[y] > g->island_l[y]) {
        int left_span = g->island_l[y] - water_l;
        int right_span = water_r - g->island_r[y];
        if (left_span >= right_span && left_span >= 14) {
            water_r = g->island_l[y] - 4;
        } else if (right_span >= 14) {
            water_l = g->island_r[y] + 4;
        } else {
            return;
        }
    }
    if (water_r - water_l < 16) {
        return;
    }
    int span = water_r - water_l;
    int x = water_l + (int)(g->lfsr_lo % (unsigned)span);
    int pick = g->lfsr_hi & 0x07;
    if (pick <= 1) {
        x = clamp_int(x, water_l + 6, water_r - 6);
        spawn_at(g, RIVER_OBJ_HELI, (float)x, (float)y, 10, 4, (g->lfsr_lo & 1) ? 0.45f : -0.45f);
    } else if (pick <= 3) {
        x = clamp_int(x, water_l + 7, water_r - 7);
        spawn_at(g, RIVER_OBJ_SHIP, (float)x, (float)y, 12, 3, 0);
    } else if (pick == 4) {
        x = clamp_int(x, water_l + 6, water_r - 6);
        spawn_at(g, RIVER_OBJ_JET, (float)x, (float)y, 7, 3, (g->lfsr_lo & 1) ? 1.35f : -1.35f);
    } else if (pick == 5) {
        x = clamp_int(x, water_l + 5, water_r - 5);
        spawn_at(g, RIVER_OBJ_FUEL, (float)x, (float)y, 7, 16, 0);
    } else {
        return;
    }
    g->since_spawn = 0;
}

static void generate_row(RiverGame *g, int y) {
    if (g->straight > 0) {
        g->straight -= 1;
    } else {
        decide_channel(g);
        maybe_spawn(g, y);
    }
    write_channel_row(g, y);
}

static void scroll_world(RiverGame *g, int rows) {
    if (rows < 1) {
        return;
    }
    if (rows > 4) {
        rows = 4;
    }
    for (int y = RIVER_H - 1; y >= rows; y--) {
        g->bank_left[y] = g->bank_left[y - rows];
        g->bank_right[y] = g->bank_right[y - rows];
        g->island_l[y] = g->island_l[y - rows];
        g->island_r[y] = g->island_r[y - rows];
    }
    for (int y = rows - 1; y >= 0; y--) {
        generate_row(g, y);
    }
    for (int i = 0; i < RIVER_MAX_OBJECTS; i++) {
        if (g->objs[i].kind == RIVER_OBJ_NONE) {
            continue;
        }
        g->objs[i].y += (float)rows;
        if (g->objs[i].y > 162) {
            g->objs[i].kind = RIVER_OBJ_NONE;
        }
    }
    if (g->shot_on) {
        g->shot_y += (float)rows;
    }
    g->since_spawn += rows;
}

static int consume_scroll(RiverGame *g, float pixels) {
    g->scroll_acc += pixels;
    int rows = (int)g->scroll_acc;
    if (rows < 0) {
        rows = 0;
    }
    g->scroll_acc -= (float)rows;
    if (rows > 0) {
        scroll_world(g, rows);
    }
    return rows;
}

static float clear_x(const RiverGame *g, int y) {
    int l = g->bank_left[y];
    int r = g->bank_right[y];
    if (g->island_r[y] > g->island_l[y]) {
        int left_span = g->island_l[y] - l;
        int right_span = r - g->island_r[y];
        if (left_span >= right_span) {
            return (float)(l + g->island_l[y]) * 0.5f;
        }
        return (float)(g->island_r[y] + r) * 0.5f;
    }
    return (float)(l + r) * 0.5f;
}

static void fill_river(RiverGame *g) {
    g->channel_center = 80;
    g->channel_half = 34;
    g->bend_byte = 0x40;
    g->straight = 0;
    int saved = g->phase;
    g->phase = RIVER_PHASE_TITLE;
    for (int y = RIVER_H - 1; y >= 0; y--) {
        generate_row(g, y);
    }
    g->phase = saved;
    g->since_spawn = SPAWN_GAP;
}

void river_init(RiverGame *g) {
    memset(g, 0, sizeof *g);
    g->lfsr_lo = 0x14;
    g->lfsr_hi = 0xA8;
    g->player_y = PLAYER_Y;
    g->player_x = 80;
    g->speed = RIVER_SPEED_CRUISE;
    g->facing = 1;
    g->fuel = RIVER_FUEL_FULL;
    g->lives = 3;
    g->rows_until_bridge = SECTION_ROWS;
    g->phase = RIVER_PHASE_TITLE;
    g->section = 1;
    fill_river(g);
    g->player_x = clear_x(g, PLAYER_Y);
}

void river_start(RiverGame *g) {
    uint8_t lo = g->lfsr_lo;
    uint8_t hi = g->lfsr_hi;
    uint32_t steps = g->lfsr_steps;
    int center = g->channel_center;
    int half = g->channel_half;
    int bend = g->bend_byte;
    int straight = g->straight;
    float acc = g->scroll_acc;
    uint8_t left[RIVER_H];
    uint8_t right[RIVER_H];
    uint8_t il[RIVER_H];
    uint8_t ir[RIVER_H];
    memcpy(left, g->bank_left, sizeof left);
    memcpy(right, g->bank_right, sizeof right);
    memcpy(il, g->island_l, sizeof il);
    memcpy(ir, g->island_r, sizeof ir);
    memset(g, 0, sizeof *g);
    memcpy(g->bank_left, left, sizeof left);
    memcpy(g->bank_right, right, sizeof right);
    memcpy(g->island_l, il, sizeof il);
    memcpy(g->island_r, ir, sizeof ir);
    g->lfsr_lo = lo;
    g->lfsr_hi = hi;
    g->lfsr_steps = steps;
    g->channel_center = center;
    g->channel_half = half;
    g->bend_byte = bend;
    g->straight = straight;
    g->scroll_acc = acc;
    g->player_y = PLAYER_Y;
    g->player_x = clear_x(g, PLAYER_Y);
    g->speed = RIVER_SPEED_CRUISE;
    g->facing = 1;
    g->fuel = RIVER_FUEL_FULL;
    g->lives = 3;
    g->rows_until_bridge = SECTION_ROWS;
    g->section = 1;
    g->phase = RIVER_PHASE_PLAY;
    g->invuln = 90;
}

void river_set_input(RiverGame *g, unsigned buttons) {
    g->input = buttons;
}

void river_set_speed(RiverGame *g, int speed) {
    /* Teclas 1 2 3 continuam escolhendo marcha, agora no byte contínuo. */
    if (speed <= 1) {
        g->speed = RIVER_SPEED_MIN;
    } else if (speed == 2) {
        g->speed = RIVER_SPEED_CRUISE;
    } else {
        g->speed = RIVER_SPEED_MAX;
    }
}

void river_toggle_pause(RiverGame *g) {
    if (g->phase == RIVER_PHASE_PLAY) {
        g->phase = RIVER_PHASE_PAUSE;
    } else if (g->phase == RIVER_PHASE_PAUSE) {
        g->phase = RIVER_PHASE_PLAY;
    }
}

static void kill_player(RiverGame *g) {
    if (g->invuln > 0 || g->phase != RIVER_PHASE_PLAY) {
        return;
    }
    g->phase = RIVER_PHASE_DEAD;
    g->dead_timer = 70;
    g->shot_on = 0;
    g->lives -= 1;
    g->sfx |= RIVER_SFX_DIE;
}

static void boom(RiverObj *o) {
    o->kind = RIVER_OBJ_BOOM;
    o->timer = 16;
    o->vx = 0;
}

static int points_for(int kind) {
    switch (kind) {
    case RIVER_OBJ_SHIP:
        return 30;
    case RIVER_OBJ_HELI:
        return 60;
    case RIVER_OBJ_FUEL:
        return 80;
    case RIVER_OBJ_JET:
        return 100;
    case RIVER_OBJ_BRIDGE:
        return 500;
    default:
        return 0;
    }
}

static void maybe_spawn_bridge(RiverGame *g) {
    for (int i = 0; i < RIVER_MAX_OBJECTS; i++) {
        if (g->objs[i].kind == RIVER_OBJ_BRIDGE) {
            return;
        }
    }
    spawn_at(g, RIVER_OBJ_BRIDGE, 0, 0, 0, 4, 0);
}

static void sync_bridge(RiverGame *g, RiverObj *o) {
    int by = (int)o->y;
    if (by < 0) {
        by = 0;
    }
    if (by >= RIVER_H) {
        by = RIVER_H - 1;
    }
    float ox = (float)g->bank_left[by];
    float ow = (float)(g->bank_right[by] - g->bank_left[by]);
    if (ow < 1.0f) {
        ow = 1.0f;
    }
    o->x = ox + ow * 0.5f;
    o->w = ow;
}

static Hitbox bridge_deck(RiverGame *g, RiverObj *o) {
    sync_bridge(g, o);
    return hitbox_make(o->x - o->w * 0.5f, o->y, o->w, o->h, 0);
}

static Hitbox shot_path(const RiverGame *g) {
    return hitbox_make(g->shot_x - 1.0f, g->shot_y, 2, 4 + SHOT_STEP, 0);
}

static int crack_bridge(RiverGame *g, RiverObj *o) {
    o->timer -= 1;
    if (o->timer > 0) {
        return 0;
    }
    g->section += 1;
    g->rows_until_bridge = SECTION_ROWS;
    g->sfx |= RIVER_SFX_BRIDGE;
    return 1;
}

static int plane_meets_bridge(const RiverGame *g, const RiverObj *o, Hitbox plane) {
    float top = o->y;
    float bottom = o->y + o->h;
    if (!(plane.y < bottom && plane.y + plane.h > top)) {
        return o->y > (float)PLAYER_Y + 6.0f;
    }
    int y0 = (int)top;
    int y1 = (int)(bottom - 0.001f);
    if (y0 < 0) {
        y0 = 0;
    }
    if (y1 >= RIVER_H) {
        y1 = RIVER_H - 1;
    }
    for (int y = y0; y <= y1; y++) {
        if (plane.x < g->bank_right[y] && plane.x + plane.w > g->bank_left[y]) {
            return 1;
        }
    }
    return 0;
}

static void hold_in_water(RiverGame *g, RiverObj *o) {
    int by = (int)o->y;
    if (by < 0 || by >= RIVER_H) {
        return;
    }
    float ow = o->w;
    float min_x = g->bank_left[by] + ow * 0.5f + 2;
    float max_x = g->bank_right[by] - ow * 0.5f - 2;
    if (g->island_r[by] > g->island_l[by]) {
        float island_mid = (g->island_l[by] + g->island_r[by]) * 0.5f;
        if (o->x < island_mid) {
            max_x = g->island_l[by] - ow * 0.5f - 1;
        } else {
            min_x = g->island_r[by] + ow * 0.5f + 1;
        }
    }
    if (min_x >= max_x) {
        return;
    }
    if (o->x < min_x) {
        o->x = min_x;
        o->vx = -o->vx;
    } else if (o->x > max_x) {
        o->x = max_x;
        o->vx = -o->vx;
    }
}

static void strike(RiverGame *g, RiverObj *o) {
    g->shot_on = 0;
    if (o->kind == RIVER_OBJ_BRIDGE && !crack_bridge(g, o)) {
        return;
    }
    g->score += points_for(o->kind);
    g->sfx |= RIVER_SFX_BOOM;
    boom(o);
}

static int nearest_shot(RiverGame *g) {
    Hitbox shot = shot_path(g);
    int best = -1;
    float best_bottom = -1.0f;
    for (int i = 0; i < RIVER_MAX_OBJECTS; i++) {
        RiverObj *o = &g->objs[i];
        if (o->kind == RIVER_OBJ_NONE || o->kind == RIVER_OBJ_BOOM) {
            continue;
        }
        Hitbox body = o->kind == RIVER_OBJ_BRIDGE
            ? bridge_deck(g, o)
            : hitbox_make(o->x - o->w * 0.5f, o->y, o->w, o->h, 0);
        if (!hitbox_overlaps(shot, body)) {
            continue;
        }
        float bottom = o->y + o->h;
        if (bottom > best_bottom) {
            best = i;
            best_bottom = bottom;
        }
    }
    return best;
}

static int blocked_at(const RiverGame *g, float left, float right, int y) {
    if (y < 0 || y >= RIVER_H) {
        return 0;
    }
    if (left < g->bank_left[y] || right > g->bank_right[y]) {
        return 1;
    }
    if (g->island_r[y] > g->island_l[y] && left < g->island_r[y] && right > g->island_l[y]) {
        return 1;
    }
    return 0;
}

static void update_play(RiverGame *g) {
    if (g->input & RIVER_IN_UP) {
        g->speed = clamp_int(g->speed + 2, RIVER_SPEED_MIN, RIVER_SPEED_MAX);
    }
    if (g->input & RIVER_IN_DOWN) {
        g->speed = clamp_int(g->speed - 2, RIVER_SPEED_MIN, RIVER_SPEED_MAX);
    }

    float target = 0;
    if ((g->input & RIVER_IN_LEFT) && !(g->input & RIVER_IN_RIGHT)) {
        target = -2.15f;
        g->facing = -1;
    } else if ((g->input & RIVER_IN_RIGHT) && !(g->input & RIVER_IN_LEFT)) {
        target = 2.15f;
        g->facing = 1;
    }
    g->player_vx += (target - g->player_vx) * 0.45f;
    g->player_x += g->player_vx;
    g->player_x = clampf(g->player_x, 6, RIVER_W - 7);

    if (g->fire_cooldown > 0) {
        g->fire_cooldown -= 1;
    }
    if (g->fuel_tone > 0) {
        g->fuel_tone -= 1;
    }
    if ((g->input & RIVER_IN_FIRE) && g->fire_cooldown == 0 && !g->shot_on) {
        g->shot_on = 1;
        g->shot_x = g->player_x;
        g->shot_y = (float)PLAYER_Y - 2;
        g->fire_cooldown = 12;
        g->sfx |= RIVER_SFX_SHOT;
    }
    if (g->shot_on) {
        g->shot_y -= (float)SHOT_STEP;
    }

    /* $B5 / 48 pixels por quadro. O resto fica em scroll_acc. */
    int moved = consume_scroll(g, (float)g->speed / 48.0f);
    g->rows_until_bridge -= moved;
    if (g->rows_until_bridge <= 0) {
        maybe_spawn_bridge(g);
    }

    if (g->fuel < 0x20) {
        g->fuel = 0;
        kill_player(g);
    } else {
        g->fuel = (uint16_t)(g->fuel - 0x20);
    }

    if (g->invuln > 0) {
        g->invuln -= 1;
    } else {
        float left = g->player_x - PLAYER_HIT_W * 0.5f;
        float right = g->player_x + PLAYER_HIT_W * 0.5f;
        for (int y = PLAYER_Y; y < PLAYER_Y + PLAYER_HIT_H && y < RIVER_H; y++) {
            if (blocked_at(g, left, right, y)) {
                kill_player(g);
                break;
            }
        }
    }

    for (int i = 0; i < RIVER_MAX_OBJECTS; i++) {
        RiverObj *o = &g->objs[i];
        if (o->kind == RIVER_OBJ_NONE) {
            continue;
        }
        if (o->kind == RIVER_OBJ_BOOM) {
            o->timer -= 1;
            if (o->timer <= 0) {
                o->kind = RIVER_OBJ_NONE;
            }
            continue;
        }
        if (o->kind == RIVER_OBJ_JET || o->kind == RIVER_OBJ_HELI) {
            o->x += o->vx;
        }
        if (o->kind == RIVER_OBJ_BRIDGE) {
            sync_bridge(g, o);
        } else {
            hold_in_water(g, o);
        }
    }

    if (g->shot_on) {
        int hit = nearest_shot(g);
        if (hit >= 0) {
            strike(g, &g->objs[hit]);
        }
    }
    if (g->shot_on && g->shot_y < -4.0f) {
        g->shot_on = 0;
    }

    Hitbox plane = hitbox_make(
        g->player_x - PLAYER_HIT_W * 0.5f, (float)PLAYER_Y, PLAYER_HIT_W, PLAYER_HIT_H, 0);
    for (int i = 0; i < RIVER_MAX_OBJECTS; i++) {
        RiverObj *o = &g->objs[i];
        if (o->kind == RIVER_OBJ_NONE || o->kind == RIVER_OBJ_BOOM) {
            continue;
        }
        if (o->kind == RIVER_OBJ_BRIDGE) {
            if (plane_meets_bridge(g, o, plane)) {
                kill_player(g);
            }
            continue;
        }
        Hitbox body = hitbox_make(o->x - o->w * 0.5f, o->y, o->w, o->h, 0);
        if (o->kind == RIVER_OBJ_FUEL && hitbox_overlaps(plane, body)) {
            uint32_t sum = (uint32_t)g->fuel + 0x100u;
            g->fuel = sum > RIVER_FUEL_FULL ? RIVER_FUEL_FULL : (uint16_t)sum;
            if (g->fuel_tone == 0) {
                g->sfx |= RIVER_SFX_FUEL;
                g->fuel_tone = 10;
            }
            continue;
        }
        if (hitbox_overlaps(plane, body)) {
            kill_player(g);
        }
    }
}

static void update_dead(RiverGame *g) {
    g->dead_timer -= 1;
    if (g->dead_timer > 0) {
        return;
    }
    if (g->lives <= 0) {
        g->phase = RIVER_PHASE_OVER;
        return;
    }
    g->phase = RIVER_PHASE_PLAY;
    g->invuln = 90;
    if (g->fuel < 0x6000) {
        g->fuel = 0x6000;
    }
    g->player_vx = 0;
    g->shot_on = 0;
    g->player_x = clear_x(g, PLAYER_Y);
    for (int i = 0; i < RIVER_MAX_OBJECTS; i++) {
        if (g->objs[i].kind == RIVER_OBJ_BRIDGE && g->objs[i].y > PLAYER_Y - 30) {
            g->objs[i].kind = RIVER_OBJ_NONE;
            g->rows_until_bridge = 220;
        }
    }
}

void river_frame(RiverGame *g) {
    if (g->phase == RIVER_PHASE_PAUSE || g->phase == RIVER_PHASE_OVER) {
        g->prev_input = g->input;
        return;
    }
    if (g->phase == RIVER_PHASE_TITLE) {
        consume_scroll(g, 0.65f);
        g->frame += 1;
        g->prev_input = g->input;
        return;
    }
    if (g->phase == RIVER_PHASE_DEAD) {
        update_dead(g);
        g->frame += 1;
        g->prev_input = g->input;
        return;
    }
    update_play(g);
    g->frame += 1;
    g->prev_input = g->input;
}
