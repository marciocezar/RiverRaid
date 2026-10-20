/*
 * Casca Windows. Mesmo contrato do Mac: teclas entram, o quadro RGBA sai.
 *
 * Compilar no Windows, num prompt do Visual Studio:
 *   cl /std:c11 /O2 /I src\core /Fe:river-raid.exe src\core\river.c src\core\present.c src\core\audio.c src\platform\windows\main.c user32.lib gdi32.lib winmm.lib
 *
 * Ou com MSYS2 / mingw:
 *   gcc -std=c11 -O2 -I src/core -o river-raid.exe src/core/river.c src/core/present.c src/core/audio.c src/platform/windows/main.c -lgdi32 -luser32 -lwinmm -mwindows
 */
#include "audio.h"
#include "present.h"
#include "river.h"

#include <windows.h>
#include <mmsystem.h>

static RiverGame game;
static uint8_t frame[RIVER_FRAME_BYTES];
static uint8_t frame_bgra[RIVER_FRAME_BYTES];
static unsigned held;
static int running = 1;
static HWAVEOUT wave;
static WAVEHDR wave_hdr[2];
static int16_t wave_buf[2][2205];

static void CALLBACK wave_done(HWAVEOUT handle, UINT msg, DWORD_PTR inst, DWORD_PTR p1, DWORD_PTR p2) {
    (void)inst;
    (void)p2;
    if (msg != WOM_DONE) {
        return;
    }
    WAVEHDR *hdr = (WAVEHDR *)p1;
    river_audio_render((int16_t *)hdr->lpData, 2205);
    waveOutWrite(handle, hdr, sizeof *hdr);
}

static void start_wave(void) {
    WAVEFORMATEX fmt;
    ZeroMemory(&fmt, sizeof fmt);
    fmt.wFormatTag = WAVE_FORMAT_PCM;
    fmt.nChannels = 1;
    fmt.nSamplesPerSec = RIVER_AUDIO_RATE;
    fmt.wBitsPerSample = 16;
    fmt.nBlockAlign = 2;
    fmt.nAvgBytesPerSec = RIVER_AUDIO_RATE * 2;
    if (waveOutOpen(&wave, WAVE_MAPPER, &fmt, (DWORD_PTR)wave_done, 0, CALLBACK_FUNCTION) != MMSYSERR_NOERROR) {
        wave = NULL;
        return;
    }
    for (int i = 0; i < 2; i++) {
        ZeroMemory(&wave_hdr[i], sizeof wave_hdr[i]);
        wave_hdr[i].lpData = (LPSTR)wave_buf[i];
        wave_hdr[i].dwBufferLength = sizeof wave_buf[i];
        waveOutPrepareHeader(wave, &wave_hdr[i], sizeof wave_hdr[i]);
        river_audio_render(wave_buf[i], 2205);
        waveOutWrite(wave, &wave_hdr[i], sizeof wave_hdr[i]);
    }
}

enum { SCALE = 4, ORIGIN = 28, PANEL_W = 280 };

static unsigned bit_for_vk(WPARAM vk) {
    switch (vk) {
    case VK_LEFT:
    case 'A':
        return RIVER_IN_LEFT;
    case VK_RIGHT:
    case 'D':
        return RIVER_IN_RIGHT;
    case VK_UP:
    case 'W':
        return RIVER_IN_UP;
    case VK_DOWN:
    case 'S':
        return RIVER_IN_DOWN;
    case VK_SPACE:
        return RIVER_IN_FIRE;
    default:
        return 0;
    }
}

static void to_bgra(void) {
    for (int i = 0; i < RIVER_W * RIVER_H; i++) {
        frame_bgra[i * 4 + 0] = frame[i * 4 + 2];
        frame_bgra[i * 4 + 1] = frame[i * 4 + 1];
        frame_bgra[i * 4 + 2] = frame[i * 4 + 0];
        frame_bgra[i * 4 + 3] = 255;
    }
}

static void paint_text(HDC hdc, int x, int y, const char *text) {
    TextOutA(hdc, x, y, text, lstrlenA(text));
}

static void paint(HWND hwnd) {
    PAINTSTRUCT ps;
    HDC hdc = BeginPaint(hwnd, &ps);
    RECT client;
    GetClientRect(hwnd, &client);
    HBRUSH bg = CreateSolidBrush(RGB(16, 18, 16));
    FillRect(hdc, &client, bg);
    DeleteObject(bg);

    river_present(&game, frame);
    to_bgra();

    BITMAPINFO info;
    ZeroMemory(&info, sizeof info);
    info.bmiHeader.biSize = sizeof info.bmiHeader;
    info.bmiHeader.biWidth = RIVER_W;
    info.bmiHeader.biHeight = -RIVER_H;
    info.bmiHeader.biPlanes = 1;
    info.bmiHeader.biBitCount = 32;
    info.bmiHeader.biCompression = BI_RGB;
    SetStretchBltMode(hdc, COLORONCOLOR);
    StretchDIBits(hdc, ORIGIN, ORIGIN, RIVER_W * SCALE, RIVER_H * SCALE,
                  0, 0, RIVER_W, RIVER_H, frame_bgra, &info, DIB_RGB_COLORS, SRCCOPY);

    int panel = ORIGIN + RIVER_W * SCALE + 24;
    int y = 24;
    SetBkMode(hdc, TRANSPARENT);
    SetTextColor(hdc, RGB(220, 224, 210));
    paint_text(hdc, panel, y, "River Raid — laboratorio");
    y += 28;
    const char *phase = "atraindo o olhar";
    if (game.phase == RIVER_PHASE_PLAY) {
        phase = "em jogo";
    } else if (game.phase == RIVER_PHASE_DEAD) {
        phase = "queda";
    } else if (game.phase == RIVER_PHASE_OVER) {
        phase = "fim de jogo";
    } else if (game.phase == RIVER_PHASE_PAUSE) {
        phase = "pausa";
    }
    char line[96];
    wsprintfA(line, "estado       %s", phase);
    paint_text(hdc, panel, y, line);
    y += 20;
    wsprintfA(line, "placar       %d", game.score);
    paint_text(hdc, panel, y, line);
    y += 20;
    wsprintfA(line, "vidas        %d", game.lives);
    paint_text(hdc, panel, y, line);
    y += 20;
    wsprintfA(line, "combustivel  %d", (int)game.fuel);
    paint_text(hdc, panel, y, line);
    y += 20;
    wsprintfA(line, "secao        %d", game.section);
    paint_text(hdc, panel, y, line);
    y += 20;
    wsprintfA(line, "velocidade   %d", game.speed);
    paint_text(hdc, panel, y, line);
    y += 20;
    wsprintfA(line, "E9 EA        %02X %02X", game.lfsr_lo, game.lfsr_hi);
    paint_text(hdc, panel, y, line);
    y += 32;
    paint_text(hdc, panel, y, "amarelo   seu aviao");
    y += 18;
    paint_text(hdc, panel, y, "escuro    helicoptero");
    y += 18;
    paint_text(hdc, panel, y, "preto     navio e jato");
    y += 18;
    paint_text(hdc, panel, y, "FUEL      posto");
    y += 18;
    paint_text(hdc, panel, y, "embaixo   pontos e barra E-F");
    y += 18;
    paint_text(hdc, panel, y, "faixa     ponte");
    y += 28;
    paint_text(hdc, panel, y, "Enter comeca");
    y += 18;
    paint_text(hdc, panel, y, "setas ou WASD");
    y += 18;
    paint_text(hdc, panel, y, "espaco atira");
    y += 18;
    paint_text(hdc, panel, y, "P pausa  R recomeca  Esc sai");
    EndPaint(hwnd, &ps);
}

static void on_key(WPARAM vk, int down, int repeat) {
    unsigned bit = bit_for_vk(vk);
    if (bit) {
        if (down) {
            held |= bit;
        } else {
            held &= ~bit;
        }
        river_set_input(&game, held);
        return;
    }
    if (!down || repeat) {
        return;
    }
    if (vk == VK_RETURN) {
        if (game.phase == RIVER_PHASE_TITLE || game.phase == RIVER_PHASE_OVER) {
            river_start(&game);
        } else if (game.phase == RIVER_PHASE_PAUSE) {
            river_toggle_pause(&game);
        }
    } else if (vk == 'P') {
        river_toggle_pause(&game);
    } else if (vk == 'R') {
        river_init(&game);
        river_start(&game);
    } else if (vk == '1') {
        river_set_speed(&game, 1);
    } else if (vk == '2') {
        river_set_speed(&game, 2);
    } else if (vk == '3') {
        river_set_speed(&game, 3);
    } else if (vk == VK_ESCAPE) {
        running = 0;
        PostQuitMessage(0);
    }
}

static LRESULT CALLBACK wndproc(HWND hwnd, UINT msg, WPARAM wp, LPARAM lp) {
    switch (msg) {
    case WM_KEYDOWN:
        on_key(wp, 1, (lp & (1 << 30)) != 0);
        return 0;
    case WM_KEYUP:
        on_key(wp, 0, 0);
        return 0;
    case WM_TIMER:
        river_set_input(&game, held);
        river_frame(&game);
        river_audio_sync(&game);
        InvalidateRect(hwnd, NULL, FALSE);
        return 0;
    case WM_PAINT:
        paint(hwnd);
        return 0;
    case WM_DESTROY:
        running = 0;
        PostQuitMessage(0);
        return 0;
    default:
        return DefWindowProcA(hwnd, msg, wp, lp);
    }
}

int WINAPI WinMain(HINSTANCE instance, HINSTANCE prev, LPSTR cmd, int show) {
    (void)prev;
    (void)cmd;
    river_init(&game);
    WNDCLASSA wc;
    ZeroMemory(&wc, sizeof wc);
    wc.lpfnWndProc = wndproc;
    wc.hInstance = instance;
    wc.lpszClassName = "RiverRaidLab";
    wc.hCursor = LoadCursor(NULL, IDC_ARROW);
    RegisterClassA(&wc);

    int width = ORIGIN + RIVER_W * SCALE + 24 + PANEL_W + 20;
    int height = ORIGIN + RIVER_H * SCALE + 48;
    RECT rect = {0, 0, width, height};
    AdjustWindowRect(&rect, WS_OVERLAPPEDWINDOW, FALSE);
    HWND hwnd = CreateWindowExA(
        0, wc.lpszClassName, "River Raid — laboratorio",
        WS_OVERLAPPED | WS_CAPTION | WS_SYSMENU | WS_MINIMIZEBOX,
        CW_USEDEFAULT, CW_USEDEFAULT,
        rect.right - rect.left, rect.bottom - rect.top,
        NULL, NULL, instance, NULL);
    ShowWindow(hwnd, show);
    start_wave();
    SetTimer(hwnd, 1, 16, NULL);

    MSG msg;
    while (running && GetMessageA(&msg, NULL, 0, 0) > 0) {
        TranslateMessage(&msg);
        DispatchMessageA(&msg);
    }
    return 0;
}
