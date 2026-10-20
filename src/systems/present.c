#include "present.h"

#include <string.h>

/* Cores chapadas, no jeito das telas em imgs/. */
enum {
    WATER_R = 32, WATER_G = 52, WATER_B = 176,
    BANK_R = 56, BANK_G = 148, BANK_B = 48,
    DASH_R = 136, DASH_G = 136, DASH_B = 136,
    YEL_R = 244, YEL_G = 214, YEL_B = 32,
    PLAY_TOP = 164
};

static void plot(uint8_t *px, int x, int y, int r, int g, int b) {
    if ((unsigned)x >= RIVER_W || (unsigned)y >= RIVER_H) {
        return;
    }
    uint8_t *p = px + ((y * RIVER_W + x) * 4);
    p[0] = (uint8_t)r;
    p[1] = (uint8_t)g;
    p[2] = (uint8_t)b;
    p[3] = 255;
}

static void ink_rgb(char ink, int *r, int *g, int *b) {
    switch (ink) {
    case 'Y': *r = YEL_R; *g = YEL_G; *b = YEL_B; break;
    case 'K': *r = 12; *g = 12; *b = 16; break;
    case 'N': *r = 16; *g = 52; *b = 72; break;
    case 'O': *r = 216; *g = 96; *b = 24; break;
    case 'C': *r = 72; *g = 176; *b = 220; break;
    case 'R': *r = 204; *g = 40; *b = 40; break;
    case 'W': *r = 236; *g = 236; *b = 236; break;
    case 'U': *r = 48; *g = 72; *b = 196; break;
    case 'G': *r = 168; *g = 168; *b = 168; break;
    case 'D': *r = 72; *g = 72; *b = 76; break;
    default: *r = 0; *g = 0; *b = 0; break;
    }
}

static void blit(uint8_t *px, const char **rows, int n, int cx, int top, int mirror) {
    int w = (int)strlen(rows[0]);
    int left = cx - w / 2;
    for (int sy = 0; sy < n; sy++) {
        if (top + sy >= PLAY_TOP) {
            break;
        }
        for (int sx = 0; sx < w; sx++) {
            char ink = rows[sy][mirror ? (w - 1 - sx) : sx];
            if (ink == '.' || ink == 0) {
                continue;
            }
            int r, g, b;
            ink_rgb(ink, &r, &g, &b);
            plot(px, left + sx, top + sy, r, g, b);
        }
    }
}

static void paint_river(uint8_t *px, const RiverGame *g) {
    for (int y = 0; y < PLAY_TOP; y++) {
        int left = g->bank_left[y];
        int right = g->bank_right[y];
        int il = g->island_l[y];
        int ir = g->island_r[y];
        for (int x = 0; x < RIVER_W; x++) {
            int land = x < left || x >= right || (ir > il && x >= il && x < ir);
            if (land) {
                plot(px, x, y, BANK_R, BANK_G, BANK_B);
            } else {
                plot(px, x, y, WATER_R, WATER_G, WATER_B);
            }
        }
    }
}

/* Avião amarelo, visto de cima, como em imgs/img2.jpg. */
static const char *PLANE[] = {
    "...Y...",
    "..YYY..",
    ".YYYYY.",
    "YYYYYYY",
    "...Y...",
    "..Y.Y..",
};

/* Helicóptero de lado: rotor amarelo, corpo escuro, cauda e esquis. */
static const char *HELI_A[] = {
    "YYYYYYYYYYYY",
    ".....N......",
    "..NNNN......",
    ".NNNNNNN.Y..",
    "..NNNN..NNN.",
    "...NN....N..",
};

static const char *HELI_B[] = {
    "YY..YYYY..YY",
    ".....N......",
    "..NNNN......",
    ".NNNNNNN.Y..",
    "..NNNN..NNN.",
    "...NN....N..",
};

/* Navio de lado: cabine preta, faixa laranja, casco azul claro. */
static const char *SHIP[] = {
    ".....KKKK.....",
    "....KKKKKK....",
    "OOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOO",
    ".CCCCCCCCCCCC.",
};

/* Jato inimigo, preto, visto de cima, com a faixa laranja. */
static const char *JET[] = {
    "....K....",
    "..KKKKK..",
    ".KKKKKKK.",
    "KKKKKKKKK",
    ".OOO.OOO.",
};

/* Posto: F vermelho, U branco, E azul, L branco. */
static const char *FUEL[] = {
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
};

static void draw_bridge(uint8_t *px, const RiverGame *g, float yf) {
    int y0 = (int)yf;
    for (int row = 0; row < 4; row++) {
        int y = y0 + row;
        if (y < 0 || y >= PLAY_TOP) {
            continue;
        }
        int left = g->bank_left[y];
        int right = g->bank_right[y];
        int mid = (left + right) / 2;
        for (int x = left; x < right; x++) {
            int edge = row == 0 || row == 3;
            int mark = x >= mid - 1 && x <= mid + 1;
            if (edge) {
                plot(px, x, y, 88, 88, 92);
            } else if (mark) {
                plot(px, x, y, 204, 48, 36);
            } else if (row == 1) {
                plot(px, x, y, 196, 196, 196);
            } else {
                plot(px, x, y, 168, 168, 168);
            }
        }
    }
}

static void draw_burst(uint8_t *px, float cx, float cy, int timer) {
    int rad = 1 + (12 - timer) / 4;
    if (rad < 1) {
        rad = 1;
    }
    if (rad > 3) {
        rad = 3;
    }
    int icx = (int)cx;
    int icy = (int)cy;
    for (int dy = -rad; dy <= rad; dy++) {
        for (int dx = -rad; dx <= rad; dx++) {
            if (dx * dx + dy * dy > rad * rad) {
                continue;
            }
            if (((dx + dy + timer) & 1) == 0) {
                plot(px, icx + dx, icy + dy, YEL_R, YEL_G, YEL_B);
            } else {
                plot(px, icx + dx, icy + dy, 220, 64, 24);
            }
        }
    }
}

static void draw_boom(uint8_t *px, float cx, float cy, int timer, float span) {
    int count = span >= 24.0f ? 5 : 1;
    float reach = span >= 24.0f ? span * 0.5f - 4.0f : 0.0f;
    for (int i = 0; i < count; i++) {
        float t = count == 1 ? 0.5f : (float)i / (float)(count - 1);
        draw_burst(px, cx - reach + t * reach * 2.0f, cy, timer);
    }
}

/* Fonte 3x5. Cada glifo tem 5 linhas. */
static const char *DIGIT[10] = {
    "###" "#.#" "#.#" "#.#" "###",
    ".#." ".#." ".#." ".#." ".#.",
    "###" "..#" "###" "#.." "###",
    "###" "..#" "###" "..#" "###",
    "#.#" "#.#" "###" "..#" "..#",
    "###" "#.." "###" "..#" "###",
    "###" "#.." "###" "#.#" "###",
    "###" "..#" "..#" "..#" "..#",
    "###" "#.#" "###" "#.#" "###",
    "###" "#.#" "###" "..#" "###",
};

static const char *GLY_E = "###" "#.." "###" "#.." "###";
static const char *GLY_F = "###" "#.." "###" "#.." "#..";

static void glyph(uint8_t *px, const char *rows, int x, int y) {
    for (int sy = 0; sy < 5; sy++) {
        for (int sx = 0; sx < 3; sx++) {
            if (rows[sy * 3 + sx] == '#') {
                plot(px, x + sx, y + sy, YEL_R, YEL_G, YEL_B);
            }
        }
    }
}

static void draw_score(uint8_t *px, int value, int y) {
    if (value < 0) {
        value = 0;
    }
    if (value > 999999) {
        value = 999999;
    }
    int digs[6];
    int n = 0;
    int v = value;
    do {
        digs[n++] = v % 10;
        v /= 10;
    } while (v && n < 6);
    int x = (RIVER_W - (n * 4 - 1)) / 2;
    for (int i = n - 1; i >= 0; i--) {
        glyph(px, DIGIT[digs[i]], x, y);
        x += 4;
    }
}

static void draw_dashboard(uint8_t *px, const RiverGame *g) {
    for (int y = PLAY_TOP; y < RIVER_H; y++) {
        for (int x = 0; x < RIVER_W; x++) {
            plot(px, x, y, DASH_R, DASH_G, DASH_B);
        }
    }
    for (int x = 0; x < RIVER_W; x++) {
        plot(px, x, PLAY_TOP, 8, 8, 8);
    }

    draw_score(px, g->score, PLAY_TOP + 2);

    int x0 = 48;
    int x1 = 112;
    int y0 = PLAY_TOP + 9;
    int y1 = y0 + 8;
    for (int y = y0; y <= y1; y++) {
        for (int x = x0; x <= x1; x++) {
            plot(px, x, y, 8, 8, 8);
        }
    }
    glyph(px, GLY_E, x0 + 3, y0 + 2);
    glyph(px, GLY_F, x1 - 6, y0 + 2);

    float fuel = (float)g->fuel / 65535.0f;
    int track0 = x0 + 14;
    int track1 = x1 - 16;
    int mark = track0 + (int)(fuel * (float)(track1 - track0));
    for (int y = y0 + 2; y <= y1 - 2; y++) {
        plot(px, mark, y, YEL_R, YEL_G, YEL_B);
        plot(px, mark + 1, y, YEL_R, YEL_G, YEL_B);
    }

    int lives = g->lives;
    if (lives < 0) {
        lives = 0;
    }
    if (lives > 9) {
        lives = 9;
    }
    glyph(px, DIGIT[lives], (RIVER_W - 3) / 2, PLAY_TOP + 20);
}

void river_present(const RiverGame *g, uint8_t *rgba) {
    paint_river(rgba, g);
    for (int i = 0; i < RIVER_MAX_OBJECTS; i++) {
        const RiverObj *o = &g->objs[i];
        int cx = (int)o->x;
        int top = (int)o->y;
        if (top >= PLAY_TOP) {
            continue;
        }
        if (o->kind == RIVER_OBJ_HELI) {
            blit(rgba, ((g->frame / 4) & 1) ? HELI_B : HELI_A, 6, cx, top, o->vx < 0);
        } else if (o->kind == RIVER_OBJ_SHIP) {
            blit(rgba, SHIP, 5, cx, top, 0);
        } else if (o->kind == RIVER_OBJ_JET) {
            blit(rgba, JET, 5, cx, top, 0);
        } else if (o->kind == RIVER_OBJ_FUEL) {
            blit(rgba, FUEL, 20, cx, top, 0);
        } else if (o->kind == RIVER_OBJ_BRIDGE) {
            draw_bridge(rgba, g, o->y);
        } else if (o->kind == RIVER_OBJ_BOOM) {
            draw_boom(rgba, o->x, o->y + 2, o->timer, o->w);
        }
    }
    if (g->shot_on && g->shot_y < PLAY_TOP) {
        int ix = (int)g->shot_x;
        int iy = (int)g->shot_y;
        plot(rgba, ix, iy, 255, 255, 255);
        plot(rgba, ix, iy + 1, YEL_R, YEL_G, YEL_B);
    }
    int blink = g->invuln > 0 && ((g->frame / 4) & 1);
    if (g->phase != RIVER_PHASE_DEAD && !blink) {
        blit(rgba, PLANE, 6, (int)g->player_x, g->player_y, 0);
    } else if (g->phase == RIVER_PHASE_DEAD) {
        draw_boom(rgba, g->player_x, (float)g->player_y + 2, g->dead_timer > 12 ? 6 : g->dead_timer, 0);
    }
    draw_dashboard(rgba, g);
}
