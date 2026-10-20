/*
 * Teste de mesa do núcleo. Não abre janela.
 * Confere o gerador $FAC6 contra vetores tirados do cartucho e dois
 * comportamentos da recriação: o combustível desce e um tiro marca ponto.
 */
#include "present.h"
#include "river.h"

#include <stdio.h>
#include <string.h>

static int g_failed;

static void expect_eq(const char *name, unsigned got, unsigned want) {
    if (got != want) {
        fprintf(stderr, "FALHOU %s: obteve %u, esperava %u\n", name, got, want);
        g_failed = 1;
    }
}

static void test_lfsr(void) {
    /* Semente inicial $BE/$BF = $14/$A8, copiada para $E9/$EA no início. */
    static const unsigned char lo_after[] = {
        0x29, 0x53, 0xA7, 0x4E, 0x9D, 0x3A, 0x74, 0xE8
    };
    static const unsigned char hi_after[] = {
        0x50, 0xA0, 0x40, 0x81, 0x02, 0x05, 0x0A, 0x14
    };
    uint8_t lo = 0x14;
    uint8_t hi = 0xA8;
    for (int i = 0; i < 8; i++) {
        river_lfsr_step(&lo, &hi);
        expect_eq("lfsr lo", lo, lo_after[i]);
        expect_eq("lfsr hi", hi, hi_after[i]);
    }
}

static void test_fuel_drains(void) {
    RiverGame g;
    river_init(&g);
    river_start(&g);
    unsigned before = g.fuel;
    g.input = 0;
    g.prev_input = 0;
    for (int i = 0; i < 30; i++) {
        river_frame(&g);
    }
    unsigned want = before - 30u * 0x20u;
    if (g.fuel != want) {
        fprintf(stderr, "FALHOU combustivel: %u, esperava %u\n", g.fuel, want);
        g_failed = 1;
    }
}

static void test_straight_runs(void) {
    RiverGame g;
    river_init(&g);
    int run = 1;
    int best = 1;
    for (int y = 1; y < RIVER_H; y++) {
        if (g.bank_left[y] == g.bank_left[y - 1] && g.bank_right[y] == g.bank_right[y - 1]) {
            run += 1;
            if (run > best) {
                best = run;
            }
        } else {
            run = 1;
        }
    }
    if (best < 4) {
        fprintf(stderr, "FALHOU mapa: maior trecho reto tem %d linhas\n", best);
        g_failed = 1;
    }
}

static void test_scroll_holds_remainder(void) {
    RiverGame g;
    river_init(&g);
    river_start(&g);
    uint8_t top = g.bank_left[0];
    g.speed = RIVER_SPEED_MIN;
    g.input = 0;
    g.scroll_acc = 0;
    river_frame(&g);
    /* 0x20/48 < 1, então o primeiro quadro não pode pular uma linha inteira. */
    if (g.bank_left[0] != top) {
        fprintf(stderr, "FALHOU scroll: andou linha com acumulador ainda fracionario\n");
        g_failed = 1;
    }
    if (!(g.scroll_acc > 0.0f)) {
        fprintf(stderr, "FALHOU scroll: resto nao foi guardado\n");
        g_failed = 1;
    }
}

static void test_shot_scores(void) {
    RiverGame g;
    river_init(&g);
    river_start(&g);
    g.invuln = 0;
    memset(g.objs, 0, sizeof g.objs);
    g.objs[0].kind = RIVER_OBJ_SHIP;
    g.objs[0].x = 80;
    g.objs[0].y = 40;
    g.objs[0].w = 16;
    g.objs[0].h = 8;
    g.shot_on = 1;
    g.shot_x = 80;
    g.shot_y = 44;
    g.player_x = 80;
    /* Mantém o avião dentro do rio para o quadro não virar morte. */
    for (int y = 0; y < RIVER_H; y++) {
        g.bank_left[y] = 20;
        g.bank_right[y] = 140;
        g.island_l[y] = 0;
        g.island_r[y] = 0;
    }
    int score = g.score;
    river_frame(&g);
    if (g.score <= score) {
        fprintf(stderr, "FALHOU tiro: placar %d nao subiu\n", g.score);
        g_failed = 1;
    }
    if (g.objs[0].kind != RIVER_OBJ_BOOM) {
        fprintf(stderr, "FALHOU tiro: alvo nao explodiu (kind %d)\n", g.objs[0].kind);
        g_failed = 1;
    }
}

static void lay_bridge(RiverGame *g) {
    river_init(g);
    river_start(g);
    g->invuln = 0;
    g->rows_until_bridge = 0;
    g->input = 0;
    g->speed = RIVER_SPEED_MIN;
    g->scroll_acc = 0;
    memset(g->objs, 0, sizeof g->objs);
    for (int y = 0; y < RIVER_H; y++) {
        g->bank_left[y] = 30;
        g->bank_right[y] = 130;
        g->island_l[y] = 0;
        g->island_r[y] = 0;
    }
    g->player_x = 80;
    river_frame(g);
}

static RiverObj *only_bridge(RiverGame *g) {
    for (int i = 0; i < RIVER_MAX_OBJECTS; i++) {
        if (g->objs[i].kind == RIVER_OBJ_BRIDGE) {
            return &g->objs[i];
        }
    }
    fprintf(stderr, "FALHOU ponte: nao nasceu\n");
    g_failed = 1;
    return NULL;
}

static void test_bridge(void) {
    RiverGame g;
    lay_bridge(&g);
    RiverObj *bridge = only_bridge(&g);
    if (!bridge) {
        return;
    }
    bridge->y = 151;
    g.shot_on = 1;
    g.shot_x = 36;
    g.shot_y = 158;
    g.player_x = 80;
    int score = g.score;
    river_frame(&g);
    if (g.section != 2 || g.score != score + 500 || g.phase != RIVER_PHASE_PLAY || g.lives != 3 ||
        bridge->kind != RIVER_OBJ_BOOM) {
        fprintf(stderr, "FALHOU ponte borda: secao %d pontos %d fase %d vidas %d kind %d\n", g.section,
            g.score, g.phase, g.lives, bridge->kind);
        g_failed = 1;
    }

    lay_bridge(&g);
    bridge = only_bridge(&g);
    if (!bridge) {
        return;
    }
    bridge->y = 80;
    for (int y = 0; y < RIVER_H; y++) {
        g.bank_left[y] = 20;
        g.bank_right[y] = 140;
        g.island_l[y] = 75;
        g.island_r[y] = 85;
    }
    g.shot_on = 1;
    g.shot_x = 48;
    g.shot_y = 86;
    g.player_x = 48;
    river_frame(&g);
    if (g.section != 2 || g.phase != RIVER_PHASE_PLAY) {
        fprintf(stderr, "FALHOU ponte canal: secao %d fase %d\n", g.section, g.phase);
        g_failed = 1;
    }

    lay_bridge(&g);
    bridge = only_bridge(&g);
    if (!bridge) {
        return;
    }
    bridge->y = 80;
    g.shot_on = 1;
    g.shot_x = 80;
    g.shot_y = 77;
    g.player_x = 80;
    river_frame(&g);
    if (g.section != 2) {
        fprintf(stderr, "FALHOU ponte no passo: secao %d\n", g.section);
        g_failed = 1;
    }

    lay_bridge(&g);
    bridge = only_bridge(&g);
    if (!bridge) {
        return;
    }
    bridge->y = 80;
    g.shot_on = 1;
    g.shot_x = 10;
    g.shot_y = 86;
    g.player_x = 80;
    score = g.score;
    river_frame(&g);
    if (g.section != 1 || g.score != score || bridge->kind != RIVER_OBJ_BRIDGE) {
        fprintf(stderr, "FALHOU tiro na margem: secao %d kind %d\n", g.section, bridge->kind);
        g_failed = 1;
    }

    lay_bridge(&g);
    bridge = only_bridge(&g);
    if (!bridge) {
        return;
    }
    bridge->y = 154;
    g.shot_on = 0;
    g.player_x = 80;
    river_frame(&g);
    if (g.phase != RIVER_PHASE_DEAD || g.lives != 2) {
        fprintf(stderr, "FALHOU ponte intacta: fase %d vidas %d\n", g.phase, g.lives);
        g_failed = 1;
    }
}

static void test_picture(void) {
    RiverGame g;
    static uint8_t px[RIVER_FRAME_BYTES];
    river_init(&g);
    river_start(&g);
    river_present(&g, px);
    int found = 0;
    int x0 = (int)g.player_x - 8;
    int y0 = g.player_y;
    for (int y = y0; y < y0 + 22 && y < RIVER_H; y++) {
        for (int x = x0; x < x0 + 16 && x >= 0 && x < RIVER_W; x++) {
            uint8_t *p = px + (y * RIVER_W + x) * 4;
            if (p[0] > 200 && p[1] > 180 && p[2] < 80) {
                found = 1;
            }
        }
    }
    if (!found) {
        fprintf(stderr, "FALHOU desenho: o aviao nao apareceu claro no quadro\n");
        g_failed = 1;
    }
}

int main(void) {
    test_lfsr();
    test_fuel_drains();
    test_straight_runs();
    test_scroll_holds_remainder();
    test_shot_scores();
    test_bridge();
    test_picture();
    if (g_failed) {
        fprintf(stderr, "ha testes falhando\n");
        return 1;
    }
    printf("nucleo ok\n");
    return 0;
}
