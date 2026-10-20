/*
 * Caixas de colisão separadas do sprite. O inset descarta a moldura
 * transparente da máscara, para um canto vazio não contar como impacto.
 */
#ifndef RIVER_HITBOX_H
#define RIVER_HITBOX_H

typedef struct Hitbox {
    float x;
    float y;
    float w;
    float h;
} Hitbox;

static inline Hitbox hitbox_make(float x, float y, float w, float h, float inset) {
    Hitbox b;
    b.x = x + inset;
    b.y = y + inset;
    b.w = w - inset * 2.0f;
    b.h = h - inset * 2.0f;
    if (b.w < 1.0f) {
        b.w = 1.0f;
    }
    if (b.h < 1.0f) {
        b.h = 1.0f;
    }
    return b;
}

static inline int hitbox_overlaps(Hitbox a, Hitbox b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

#endif
