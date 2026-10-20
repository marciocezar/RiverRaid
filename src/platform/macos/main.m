/*
 * Casca do Mac. Só traduz teclado e desenha o estado que o núcleo entrega.
 * Não há regra de jogo aqui: pontuação, rio e colisão ficam em src/core.
 */
#import <AudioToolbox/AudioToolbox.h>
#import <Cocoa/Cocoa.h>

#include <string.h>

#include "audio.h"
#include "present.h"
#include "river.h"

static const CGFloat kScale = 4.0;
static const CGFloat kOriginX = 28.0;
static const CGFloat kOriginY = 28.0;
static const CGFloat kPanelW = 280.0;

static NSColor *rgb(int r, int g, int b) {
    return [NSColor colorWithCalibratedRed:r / 255.0
                                     green:g / 255.0
                                      blue:b / 255.0
                                     alpha:1.0];
}

static AudioQueueRef audio_queue;

static void audio_callback(void *user, AudioQueueRef queue, AudioQueueBufferRef buf) {
    (void)user;
    int frames = (int)(buf->mAudioDataBytesCapacity / sizeof(int16_t));
    river_audio_render((int16_t *)buf->mAudioData, frames);
    buf->mAudioDataByteSize = (UInt32)(frames * (int)sizeof(int16_t));
    AudioQueueEnqueueBuffer(queue, buf, 0, NULL);
}

static void start_audio(void) {
    AudioStreamBasicDescription fmt;
    memset(&fmt, 0, sizeof fmt);
    fmt.mSampleRate = RIVER_AUDIO_RATE;
    fmt.mFormatID = kAudioFormatLinearPCM;
    fmt.mFormatFlags = kLinearPCMFormatFlagIsSignedInteger | kLinearPCMFormatFlagIsPacked;
    fmt.mBitsPerChannel = 16;
    fmt.mChannelsPerFrame = 1;
    fmt.mFramesPerPacket = 1;
    fmt.mBytesPerFrame = 2;
    fmt.mBytesPerPacket = 2;
    if (AudioQueueNewOutput(&fmt, audio_callback, NULL, NULL, NULL, 0, &audio_queue) != noErr) {
        return;
    }
    for (int i = 0; i < 3; i++) {
        AudioQueueBufferRef buf = NULL;
        AudioQueueAllocateBuffer(audio_queue, 1024 * (UInt32)sizeof(int16_t), &buf);
        audio_callback(NULL, audio_queue, buf);
    }
    AudioQueueStart(audio_queue, NULL);
}

static unsigned bit_for_key(unsigned short code) {
    switch (code) {
    case 123: /* seta esquerda */
    case 0:   /* A */
        return RIVER_IN_LEFT;
    case 124:
    case 2:
        return RIVER_IN_RIGHT;
    case 126:
    case 13:
        return RIVER_IN_UP;
    case 125:
    case 1:
        return RIVER_IN_DOWN;
    case 49:
        return RIVER_IN_FIRE;
    default:
        return 0;
    }
}

@interface GameView : NSView <NSWindowDelegate>
@end

@implementation GameView {
    RiverGame *game;
    uint8_t *pixels;
    unsigned held;
    NSTimer *timer;
}

- (instancetype)initWithFrame:(NSRect)frame {
    self = [super initWithFrame:frame];
    if (self) {
        game = calloc(1, sizeof *game);
        pixels = calloc(1, RIVER_FRAME_BYTES);
        river_init(game);
        start_audio();
        timer = [NSTimer timerWithTimeInterval:1.0 / 60.0
                                         target:self
                                       selector:@selector(tick:)
                                       userInfo:nil
                                        repeats:YES];
        [[NSRunLoop mainRunLoop] addTimer:timer forMode:NSRunLoopCommonModes];
    }
    return self;
}

- (void)dealloc {
    [timer invalidate];
    if (audio_queue) {
        AudioQueueStop(audio_queue, true);
        AudioQueueDispose(audio_queue, true);
    }
    free(pixels);
    free(game);
}

- (BOOL)acceptsFirstResponder {
    return YES;
}

- (BOOL)isFlipped {
    return NO;
}

- (void)tick:(NSTimer *)sender {
    (void)sender;
    river_set_input(game, held);
    river_frame(game);
    river_audio_sync(game);
    [self setNeedsDisplay:YES];
}

- (void)keyDown:(NSEvent *)event {
    unsigned bit = bit_for_key(event.keyCode);
    if (bit) {
        held |= bit;
        river_set_input(game, held);
        return;
    }
    if (event.isARepeat) {
        return;
    }
    switch (event.keyCode) {
    case 36:
    case 76:
        if (game->phase == RIVER_PHASE_TITLE || game->phase == RIVER_PHASE_OVER) {
            river_start(game);
        } else if (game->phase == RIVER_PHASE_PAUSE) {
            river_toggle_pause(game);
        }
        break;
    case 35:
        river_toggle_pause(game);
        break;
    case 15:
        river_init(game);
        river_start(game);
        break;
    case 18:
        river_set_speed(game, 1);
        break;
    case 19:
        river_set_speed(game, 2);
        break;
    case 20:
        river_set_speed(game, 3);
        break;
    case 53:
        [NSApp terminate:nil];
        break;
    default:
        break;
    }
}

- (void)keyUp:(NSEvent *)event {
    unsigned bit = bit_for_key(event.keyCode);
    if (bit) {
        held &= ~bit;
        river_set_input(game, held);
    }
}

- (void)windowWillClose:(NSNotification *)notification {
    (void)notification;
    [NSApp terminate:nil];
}

- (void)drawPlayfield {
    river_present(game, pixels);
    CGColorSpaceRef space = CGColorSpaceCreateDeviceRGB();
    CGContextRef bitmap = CGBitmapContextCreate(
        pixels, RIVER_W, RIVER_H, 8, RIVER_W * 4, space,
        (CGBitmapInfo)(kCGImageAlphaNoneSkipLast | kCGBitmapByteOrder32Big));
    CGImageRef image = CGBitmapContextCreateImage(bitmap);
    CGContextRef ctx = [[NSGraphicsContext currentContext] CGContext];
    CGContextSaveGState(ctx);
    CGContextSetInterpolationQuality(ctx, kCGInterpolationNone);
    CGContextDrawImage(ctx,
                       CGRectMake(kOriginX, kOriginY, RIVER_W * kScale, RIVER_H * kScale),
                       image);
    CGContextRestoreGState(ctx);
    CGImageRelease(image);
    CGContextRelease(bitmap);
    CGColorSpaceRelease(space);
}

- (void)drawLine:(NSString *)text at:(NSPoint)p size:(CGFloat)size color:(NSColor *)color {
    NSDictionary *attrs = @{
        NSFontAttributeName: [NSFont monospacedSystemFontOfSize:size weight:NSFontWeightRegular],
        NSForegroundColorAttributeName: color
    };
    [text drawAtPoint:p withAttributes:attrs];
}

- (void)drawRect:(NSRect)dirty {
    (void)dirty;
    [rgb(16, 18, 16) setFill];
    NSRectFill(self.bounds);

    [self drawPlayfield];

    CGFloat panelX = kOriginX + RIVER_W * kScale + 24.0;
    CGFloat top = NSHeight(self.bounds) - kOriginY - 8.0;
    NSColor *paper = rgb(220, 224, 210);
    NSColor *dim = rgb(150, 158, 140);

    [self drawLine:@"River Raid" at:NSMakePoint(panelX, top) size:22 color:paper];
    [self drawLine:@"MRC" at:NSMakePoint(panelX, top - 26) size:16 color:dim];

    NSString *phase = @"atraindo o olhar";
    if (game->phase == RIVER_PHASE_PLAY) {
        phase = @"em jogo";
    } else if (game->phase == RIVER_PHASE_DEAD) {
        phase = @"queda";
    } else if (game->phase == RIVER_PHASE_OVER) {
        phase = @"fim de jogo";
    } else if (game->phase == RIVER_PHASE_PAUSE) {
        phase = @"pausa";
    }

    NSArray<NSString *> *lines = @[
        [NSString stringWithFormat:@"estado      %@", phase],
        [NSString stringWithFormat:@"placar      %d", game->score],
        [NSString stringWithFormat:@"vidas       %d", game->lives],
        [NSString stringWithFormat:@"combustivel %u", game->fuel],
        [NSString stringWithFormat:@"secao       %d", game->section],
        [NSString stringWithFormat:@"velocidade  %d", game->speed],
        [NSString stringWithFormat:@"quadro      %u", game->frame],
        [NSString stringWithFormat:@"E9 EA       %02X %02X", game->lfsr_lo, game->lfsr_hi],
        [NSString stringWithFormat:@"passos LFSR %u", game->lfsr_steps],
    ];

    CGFloat y = top - 64;
    for (NSString *line in lines) {
        [self drawLine:line at:NSMakePoint(panelX, y) size:13 color:paper];
        y -= 22;
    }

    y -= 6;
    [self drawLine:@"o que aparece na agua" at:NSMakePoint(panelX, y) size:13 color:dim];
    y -= 20;
    NSArray<NSString *> *legend = @[
        @"amarelo    seu aviao",
        @"escuro     helicoptero, rotor amarelo",
        @"preto      navio, faixa laranja",
        @"preto      jato inimigo",
        @"FUEL       posto: passe por cima",
        @"faixa      ponte: atire no centro",
        @"embaixo    pontos, vidas e barra E-F",
    ];
    for (NSString *line in legend) {
        [self drawLine:line at:NSMakePoint(panelX, y) size:12 color:paper];
        y -= 16;
    }

    y -= 8;
    [self drawLine:@"teclas" at:NSMakePoint(panelX, y) size:13 color:dim];
    y -= 22;
    NSArray<NSString *> *help = @[
        @"Enter  comeca",
        @"setas   move / acelera",
        @"A D     esquerda direita",
        @"W S     acelera freia",
        @"espaco  atira",
        @"1 2 3   escolhe velocidade",
        @"P       pausa",
        @"R       recomeca",
        @"Esc     sai",
    ];
    for (NSString *line in help) {
        [self drawLine:line at:NSMakePoint(panelX, y) size:12 color:dim];
        y -= 18;
    }

    if (game->phase == RIVER_PHASE_TITLE) {
        [self drawLine:@"Enter para decolar"
                    at:NSMakePoint(kOriginX + 150, NSHeight(self.bounds) / 2)
                  size:22
                 color:paper];
    }
}

@end

int main(void) {
    @autoreleasepool {
        NSApplication *app = [NSApplication sharedApplication];
        [app setActivationPolicy:NSApplicationActivationPolicyRegular];

        CGFloat width = kOriginX + RIVER_W * kScale + 24.0 + kPanelW + 20.0;
        CGFloat height = kOriginY + RIVER_H * kScale + 36.0;
        NSRect frame = NSMakeRect(80, 80, width, height);
        NSWindow *window = [[NSWindow alloc]
            initWithContentRect:frame
                      styleMask:(NSWindowStyleMaskTitled | NSWindowStyleMaskClosable |
                                 NSWindowStyleMaskMiniaturizable)
                        backing:NSBackingStoreBuffered
                          defer:NO];
        window.title = @"River Raid — MRC";
        GameView *view = [[GameView alloc] initWithFrame:frame];
        window.contentView = view;
        window.delegate = view;
        [window makeKeyAndOrderFront:nil];
        [window makeFirstResponder:view];
        [app activateIgnoringOtherApps:YES];
        [app run];
    }
    return 0;
}
