#include "audio.h"

#include <stdatomic.h>

static atomic_int p_speed = 2;
static atomic_int p_fuel = 100;
static atomic_int p_phase = RIVER_PHASE_TITLE;
static atomic_uint seq_shot;
static atomic_uint seq_boom;
static atomic_uint seq_fuel;
static atomic_uint seq_bridge;
static atomic_uint seq_die;

static unsigned seen_shot, seen_boom, seen_fuel, seen_bridge, seen_die;
static int shot_left, boom_left, fuel_left, bridge_left, die_left;
static uint16_t noise = 0x1FFu;
static int div0, bit0, div1, bit1;
static int beep_phase;

static int lfsr9(void) {
    /* Polinômio de 9 bits, o mesmo papel do AUDC 8 do TIA: ruído. */
    unsigned bit = ((noise >> 0) ^ (noise >> 4)) & 1u;
    noise = (uint16_t)((noise >> 1) | (bit << 8));
    return (int)(noise & 1u);
}

static int clock_noise(int *div, int *bit, int audf) {
    *div += 1;
    if (*div >= audf) {
        *div = 0;
        *bit = lfsr9();
    }
    return *bit ? 1 : -1;
}

static int clock_square(int *div, int *bit, int audf) {
    *div += 1;
    if (*div >= audf) {
        *div = 0;
        *bit ^= 1;
    }
    return *bit ? 1 : -1;
}

void river_audio_sync(RiverGame *g) {
    atomic_store(&p_speed, g->speed);
    atomic_store(&p_fuel, (int)g->fuel);
    atomic_store(&p_phase, g->phase);
    if (g->sfx & RIVER_SFX_SHOT) {
        atomic_fetch_add(&seq_shot, 1);
    }
    if (g->sfx & RIVER_SFX_BOOM) {
        atomic_fetch_add(&seq_boom, 1);
    }
    if (g->sfx & RIVER_SFX_FUEL) {
        atomic_fetch_add(&seq_fuel, 1);
    }
    if (g->sfx & RIVER_SFX_BRIDGE) {
        atomic_fetch_add(&seq_bridge, 1);
    }
    if (g->sfx & RIVER_SFX_DIE) {
        atomic_fetch_add(&seq_die, 1);
    }
    g->sfx = 0;
}

static void catch_up(void) {
    unsigned s;
    s = atomic_load(&seq_shot);
    if (s != seen_shot) {
        seen_shot = s;
        shot_left = RIVER_AUDIO_RATE / 12;
    }
    s = atomic_load(&seq_boom);
    if (s != seen_boom) {
        seen_boom = s;
        boom_left = RIVER_AUDIO_RATE / 5;
    }
    s = atomic_load(&seq_fuel);
    if (s != seen_fuel) {
        seen_fuel = s;
        fuel_left = RIVER_AUDIO_RATE / 10;
    }
    s = atomic_load(&seq_bridge);
    if (s != seen_bridge) {
        seen_bridge = s;
        bridge_left = RIVER_AUDIO_RATE / 4;
    }
    s = atomic_load(&seq_die);
    if (s != seen_die) {
        seen_die = s;
        die_left = RIVER_AUDIO_RATE / 3;
    }
}

void river_audio_render(int16_t *dst, int frames) {
    catch_up();
    int phase = atomic_load(&p_phase);
    int speed = atomic_load(&p_speed);
    int fuel = atomic_load(&p_fuel);
    if (speed < 1) {
        speed = 1;
    }
    if (speed > 3) {
        speed = 3;
    }
    /*
     * $F7BD faz AUDF0 cair quando $B5 sobe. Aqui o byte de marcha
     * (0x20..0x70) percorre divisores 28..12: o jato fica mais agudo
     * e o ciclo do ruído não é reiniciado, então o loop não estala.
     */
    int span = RIVER_SPEED_MAX - RIVER_SPEED_MIN;
    int along = speed - RIVER_SPEED_MIN;
    if (along < 0) {
        along = 0;
    }
    if (along > span) {
        along = span;
    }
    int engine_div = 28 - (along * 16) / span;
    if (engine_div < 8) {
        engine_div = 8;
    }
    int alive = phase == RIVER_PHASE_PLAY || phase == RIVER_PHASE_DEAD;
    int low = alive && (unsigned)fuel < (RIVER_FUEL_LOW << 8) && phase == RIVER_PHASE_PLAY;
    int engine_amp = 900 + (along * 500) / span;

    for (int i = 0; i < frames; i++) {
        int mix = 0;
        if (alive && !low) {
            int s = clock_noise(&div0, &bit0, engine_div);
            mix += s * engine_amp;
        } else if (low) {
            beep_phase += 1;
            int on = (beep_phase / (RIVER_AUDIO_RATE / 8)) & 1;
            if (on) {
                int s = clock_square(&div0, &bit0, 10);
                mix += s * 2200;
            }
        }
        if (die_left > 0) {
            int s = clock_noise(&div1, &bit1, 4);
            mix += s * (die_left * 5000 / (RIVER_AUDIO_RATE / 3));
            die_left -= 1;
        } else if (boom_left > 0) {
            int s = clock_noise(&div1, &bit1, 6);
            mix += s * (boom_left * 4200 / (RIVER_AUDIO_RATE / 5));
            boom_left -= 1;
        } else if (shot_left > 0) {
            int s = clock_noise(&div1, &bit1, 3);
            mix += s * 1600;
            shot_left -= 1;
        } else if (bridge_left > 0) {
            int s = clock_square(&div1, &bit1, 14);
            mix += s * 1800;
            bridge_left -= 1;
        } else if (fuel_left > 0) {
            int s = clock_square(&div1, &bit1, 7);
            mix += s * 1200;
            fuel_left -= 1;
        }
        if (mix > 32767) {
            mix = 32767;
        }
        if (mix < -32767) {
            mix = -32767;
        }
        dst[i] = (int16_t)mix;
    }
}
