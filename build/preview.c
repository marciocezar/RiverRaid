#include "present.h"
#include "river.h"
#include <stdio.h>
int main(void) {
    RiverGame g;
    static unsigned char px[RIVER_FRAME_BYTES];
    river_init(&g);
    river_start(&g);
    g.invuln = 0;
    g.player_x = 96;
    g.score = 260;
    g.fuel = 62;
    g.lives = 3;
    g.objs[0].kind = RIVER_OBJ_HELI; g.objs[0].x = 70; g.objs[0].y = 18; g.objs[0].vx = 0.4f;
    g.objs[1].kind = RIVER_OBJ_HELI; g.objs[1].x = 108; g.objs[1].y = 36; g.objs[1].vx = -0.4f;
    g.objs[2].kind = RIVER_OBJ_SHIP; g.objs[2].x = 78; g.objs[2].y = 58;
    g.objs[3].kind = RIVER_OBJ_SHIP; g.objs[3].x = 100; g.objs[3].y = 78;
    g.objs[4].kind = RIVER_OBJ_JET; g.objs[4].x = 88; g.objs[4].y = 100;
    g.objs[5].kind = RIVER_OBJ_FUEL; g.objs[5].x = 72; g.objs[5].y = 118;
    river_present(&g, px);
    FILE *f = fopen("build/preview.ppm", "wb");
    fprintf(f, "P6\n%d %d\n255\n", RIVER_W, RIVER_H);
    for (int i = 0; i < RIVER_W * RIVER_H; i++) {
        fputc(px[i*4], f); fputc(px[i*4+1], f); fputc(px[i*4+2], f);
    }
    fclose(f);
    return 0;
}
