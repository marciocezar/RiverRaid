  F000  78        SEI
  F001  D8        CLD
  F002  A2 00     LDX #$00
  F004  A9 00     LDA #$00
  F006  95 00     STA $00,X
  F008  9A        TXS
  F009  E8        INX
  F00A  D0 FA     BNE $F006
  F00C  20 0C FF  JSR $FF0C
  F00F  A9 FB     LDA #$FB
  F011  A2 0B     LDX #$0B
  F013  20 1C FF  JSR $FF1C
  F016  A2 26     LDX #$26
  F018  20 8F FA  JSR $FA8F
  F01B  A5 83     LDA $83
  F01D  D0 08     BNE $F027
  F01F  E6 83     INC $83
  F021  85 C0     STA $C0
  F023  A9 08     LDA #$08
  F025  85 D7     STA $D7
  F027  A2 04     LDX #$04
  F029  A5 B7     LDA $B7
  F02B  4A        LSR A
  F02C  4A        LSR A
  F02D  4A        LSR A
  F02E  18        CLC
  F02F  69 45     ADC #$45
  F031  20 EF FA  JSR $FAEF
  F034  E8        INX
  F035  BD F7 FF  LDA $FFF7,X
  F038  45 85     EOR $85
  F03A  25 86     AND $86
  F03C  95 EE     STA $EE,X
  F03E  95 05     STA $05,X
  F040  CA        DEX
  F041  10 F2     BPL $F035
  F043  A8        TAY
  F044  A5 D7     LDA $D7
  F046  C9 10     CMP #$10
  F048  F0 0E     BEQ $F058
  F04A  AD 82 02  LDA $0282
  F04D  4A        LSR A
  F04E  90 08     BCC $F058
  F050  A5 F4     LDA $F4
  F052  F0 04     BEQ $F058
  F054  84 EF     STY $EF
  F056  84 06     STY $06
  F058  A5 8D     LDA $8D
  F05A  F0 0B     BEQ $F067
  F05C  C6 8D     DEC $8D
  F05E  4A        LSR A
  F05F  90 06     BCC $F067
  F061  A9 42     LDA #$42
  F063  25 86     AND $86
  F065  85 09     STA $09
  F067  E8        INX
  F068  86 F2     STX $F2
  F06A  86 04     STX $04
  F06C  A4 B3     LDY $B3
  F06E  A5 E0     LDA $E0
  F070  85 0B     STA $0B
  F072  F0 01     BEQ $F075
  F074  C8        INY
  F075  98        TYA
  F076  20 EF FA  JSR $FAEF
  F079  E8        INX
  F07A  86 0A     STX $0A
  F07C  86 26     STX $26
  F07E  A4 99     LDY $99
  F080  A5 9F     LDA $9F
  F082  85 05     STA $05
  F084  85 0C     STA $0C
  F086  20 F2 FA  JSR $FAF2
  F089  E8        INX
  F08A  A5 F5     LDA $F5
  F08C  20 EF FA  JSR $FAEF
  F08F  20 AE FF  JSR $FFAE
  F092  84 0D     STY $0D
  F094  84 E2     STY $E2
  F096  84 E4     STY $E4
  F098  84 E6     STY $E6
  F09A  84 E8     STY $E8
  F09C  A2 05     LDX #$05
  F09E  20 D5 FB  JSR $FBD5
  F0A1  A5 8B     LDA $8B
  F0A3  C9 03     CMP #$03
  F0A5  B0 01     BCS $F0A8
  F0A7  CA        DEX
  F0A8  86 DE     STX $DE
  F0AA  B4 A0     LDY $A0,X
  F0AC  BE C8 FF  LDX $FFC8,Y
  F0AF  86 C7     STX $C7
  F0B1  BE BB FB  LDX $FBBB,Y
  F0B4  86 C9     STX $C9
  F0B6  BE 23 FF  LDX $FF23,Y
  F0B9  86 CB     STX $CB
  F0BB  85 2C     STA $2C
  F0BD  85 2B     STA $2B
  F0BF  AA        TAX
  F0C0  38        SEC
  F0C1  E9 01     SBC #$01
  F0C3  29 1F     AND #$1F
  F0C5  85 FC     STA $FC
  F0C7  46 FC     LSR $FC
  F0C9  C9 1A     CMP #$1A
  F0CB  90 04     BCC $F0D1
  F0CD  E9 16     SBC #$16
  F0CF  D0 08     BNE $F0D9
  F0D1  C9 04     CMP #$04
  F0D3  90 04     BCC $F0D9
  F0D5  29 01     AND #$01
  F0D7  09 02     ORA #$02
  F0D9  A8        TAY
  F0DA  B9 EF FB  LDA $FBEF,Y
  F0DD  48        PHA
  F0DE  B9 F6 FD  LDA $FDF6,Y
  F0E1  48        PHA
  F0E2  8A        TXA
  F0E3  4A        LSR A
  F0E4  A8        TAY
  F0E5  B1 C7     LDA ($C7),Y
  F0E7  90 02     BCC $F0EB
  F0E9  B1 C9     LDA ($C9),Y
  F0EB  E0 1A     CPX #$1A
  F0ED  B0 0A     BCS $F0F9
  F0EF  E0 03     CPX #$03
  F0F1  90 06     BCC $F0F9
  F0F3  85 1C     STA $1C
  F0F5  A9 00     LDA #$00
  F0F7  85 1B     STA $1B
  F0F9  B1 D9     LDA ($D9),Y
  F0FB  85 0E     STA $0E
  F0FD  B1 DB     LDA ($DB),Y
  F0FF  85 0F     STA $0F
  F101  B1 CB     LDA ($CB),Y
  F103  45 85     EOR $85
  F105  25 86     AND $86
  F107  85 07     STA $07
  F109  A6 DE     LDX $DE
  F10B  B5 8E     LDA $8E,X
  F10D  85 ED     STA $ED
  F10F  29 04     AND #$04
  F111  09 D2     ORA #$D2
  F113  45 85     EOR $85
  F115  25 86     AND $86
  F117  85 EE     STA $EE
  F119  24 93     BIT $93
  F11B  10 0B     BPL $F128
  F11D  C0 0D     CPY #$0D
  F11F  B0 07     BCS $F128
  F121  B9 B3 FF  LDA $FFB3,Y
  F124  45 85     EOR $85
  F126  25 86     AND $86
  F128  85 08     STA $08
  F12A  A0 A0     LDY #$A0
  F12C  84 FD     STY $FD
  F12E  AD 84 02  LDA $0284
  F131  D0 FB     BNE $F12E
  F133  85 02     STA $02
  F135  85 2A     STA $2A
  F137  85 01     STA $01
  F139  60        RTS
  F13A  E6 FD     INC $FD
  F13C  A4 FC     LDY $FC
  F13E  10 49     BPL $F189
  F140  A6 F6     LDX $F6
  F142  F0 19     BEQ $F15D
  F144  A5 EE     LDA $EE
  F146  4C 68 F1  JMP $F168
  F149  B1 BA     LDA ($BA),Y
  F14B  AA        TAX
  F14C  A9 00     LDA #$00
  F14E  F0 51     BEQ $F1A1
  F150  D0 03     BNE $F155
  F152  20 F5 FD  JSR $FDF5
  F155  EA        NOP
  F156  C0 13     CPY #$13
  F158  B0 E6     BCS $F140
  F15A  B1 BA     LDA ($BA),Y
  F15C  AA        TAX
  F15D  A4 FC     LDY $FC
  F15F  24 ED     BIT $ED
  F161  10 E1     BPL $F144
  F163  B9 B3 FF  LDA $FFB3,Y
  F166  45 85     EOR $85
  F168  25 86     AND $86
  F16A  8D F2 00  STA $00F2
  F16D  B1 C9     LDA ($C9),Y
  F16F  85 1C     STA $1C
  F171  B1 D9     LDA ($D9),Y
  F173  85 0E     STA $0E
  F175  85 2A     STA $2A
  F177  86 1B     STX $1B
  F179  A5 F2     LDA $F2
  F17B  85 08     STA $08
  F17D  B1 CB     LDA ($CB),Y
  F17F  45 85     EOR $85
  F181  25 86     AND $86
  F183  85 07     STA $07
  F185  B1 DB     LDA ($DB),Y
  F187  85 0F     STA $0F
  F189  B1 C7     LDA ($C7),Y
  F18B  85 1C     STA $1C
  F18D  A4 FD     LDY $FD
  F18F  88        DEY
  F190  F0 59     BEQ $F1EB
  F192  C0 13     CPY #$13
  F194  90 B3     BCC $F149
  F196  98        TYA
  F197  E5 B2     SBC $B2
  F199  29 F8     AND #$F8
  F19B  D0 02     BNE $F19F
  F19D  A9 02     LDA #$02
  F19F  A2 00     LDX #$00
  F1A1  88        DEY
  F1A2  84 FD     STY $FD
  F1A4  85 02     STA $02
  F1A6  85 2A     STA $2A
  F1A8  85 1D     STA $1D
  F1AA  86 1B     STX $1B
  F1AC  F0 3D     BEQ $F1EB
  F1AE  C6 FC     DEC $FC
  F1B0  D0 9C     BNE $F14E
  F1B2  C6 DE     DEC $DE
  F1B4  A6 DE     LDX $DE
  F1B6  30 4A     BMI $F202
  F1B8  B5 8E     LDA $8E,X
  F1BA  85 ED     STA $ED
  F1BC  29 04     AND #$04
  F1BE  09 D2     ORA #$D2
  F1C0  45 85     EOR $85
  F1C2  25 86     AND $86
  F1C4  85 EE     STA $EE
  F1C6  B5 A0     LDA $A0,X
  F1C8  AA        TAX
  F1C9  BD C8 FF  LDA $FFC8,X
  F1CC  85 C7     STA $C7
  F1CE  A9 00     LDA #$00
  F1D0  85 1C     STA $1C
  F1D2  C0 13     CPY #$13
  F1D4  85 02     STA $02
  F1D6  85 2A     STA $2A
  F1D8  B0 02     BCS $F1DC
  F1DA  B1 BA     LDA ($BA),Y
  F1DC  85 1B     STA $1B
  F1DE  A0 00     LDY #$00
  F1E0  B1 D9     LDA ($D9),Y
  F1E2  85 0E     STA $0E
  F1E4  B1 DB     LDA ($DB),Y
  F1E6  85 0F     STA $0F
  F1E8  A4 FD     LDY $FD
  F1EA  88        DEY
  F1EB  F0 32     BEQ $F21F
  F1ED  BD BB FB  LDA $FBBB,X
  F1F0  85 C9     STA $C9
  F1F2  BD 23 FF  LDA $FF23,X
  F1F5  85 CB     STA $CB
  F1F7  C0 13     CPY #$13
  F1F9  B0 0E     BCS $F209
  F1FB  B1 BA     LDA ($BA),Y
  F1FD  AA        TAX
  F1FE  A9 00     LDA #$00
  F200  F0 12     BEQ $F214
  F202  E8        INX
  F203  F0 C9     BEQ $F1CE
  F205  EA        NOP
  F206  38        SEC
  F207  B0 1A     BCS $F223
  F209  98        TYA
  F20A  E5 B2     SBC $B2
  F20C  29 F8     AND #$F8
  F20E  D0 02     BNE $F212
  F210  A9 02     LDA #$02
  F212  A2 00     LDX #$00
  F214  85 02     STA $02
  F216  85 2A     STA $2A
  F218  85 1D     STA $1D
  F21A  86 1B     STX $1B
  F21C  88        DEY
  F21D  84 FD     STY $FD
  F21F  F0 53     BEQ $F274
  F221  A6 DE     LDX $DE
  F223  20 D5 FB  JSR $FBD5
  F226  A5 EE     LDA $EE
  F228  C0 13     CPY #$13
  F22A  EA        NOP
  F22B  85 2A     STA $2A
  F22D  85 08     STA $08
  F22F  B0 04     BCS $F235
  F231  B1 BA     LDA ($BA),Y
  F233  85 1B     STA $1B
  F235  A0 0F     LDY #$0F
  F237  B1 D9     LDA ($D9),Y
  F239  85 0E     STA $0E
  F23B  B1 DB     LDA ($DB),Y
  F23D  85 0F     STA $0F
  F23F  C6 FD     DEC $FD
  F241  F0 31     BEQ $F274
  F243  B5 9A     LDA $9A,X
  F245  85 F2     STA $F2
  F247  A4 FD     LDY $FD
  F249  C0 13     CPY #$13
  F24B  90 34     BCC $F281
  F24D  98        TYA
  F24E  E5 B2     SBC $B2
  F250  29 F8     AND #$F8
  F252  D0 02     BNE $F256
  F254  A9 02     LDA #$02
  F256  A0 00     LDY #$00
  F258  85 02     STA $02
  F25A  85 2A     STA $2A
  F25C  85 1D     STA $1D
  F25E  84 1B     STY $1B
  F260  B5 94     LDA $94,X
  F262  F0 13     BEQ $F277
  F264  AA        TAX
  F265  E0 07     CPX #$07
  F267  B0 1F     BCS $F288
  F269  CA        DEX
  F26A  D0 FD     BNE $F269
  F26C  85 11     STA $11
  F26E  C6 FD     DEC $FD
  F270  A4 FD     LDY $FD
  F272  D0 22     BNE $F296
  F274  4C 50 F3  JMP $F350
  F277  EA        NOP
  F278  EA        NOP
  F279  A9 60     LDA #$60
  F27B  85 11     STA $11
  F27D  85 21     STA $21
  F27F  D0 ED     BNE $F26E
  F281  B1 BA     LDA ($BA),Y
  F283  A8        TAY
  F284  A9 00     LDA #$00
  F286  F0 D0     BEQ $F258
  F288  E9 04     SBC #$04
  F28A  AA        TAX
  F28B  C6 FD     DEC $FD
  F28D  A4 FD     LDY $FD
  F28F  F0 E3     BEQ $F274
  F291  CA        DEX
  F292  10 FD     BPL $F291
  F294  85 11     STA $11
  F296  85 02     STA $02
  F298  85 2A     STA $2A
  F29A  C0 13     CPY #$13
  F29C  B0 04     BCS $F2A2
  F29E  B1 BA     LDA ($BA),Y
  F2A0  85 1B     STA $1B
  F2A2  A0 0E     LDY #$0E
  F2A4  B1 D9     LDA ($D9),Y
  F2A6  85 0E     STA $0E
  F2A8  B1 DB     LDA ($DB),Y
  F2AA  85 0F     STA $0F
  F2AC  A4 FD     LDY $FD
  F2AE  88        DEY
  F2AF  F0 C3     BEQ $F274
  F2B1  A6 DE     LDX $DE
  F2B3  A5 F2     LDA $F2
  F2B5  85 21     STA $21
  F2B7  A9 0C     LDA #$0C
  F2B9  85 FC     STA $FC
  F2BB  98        TYA
  F2BC  38        SEC
  F2BD  E5 B2     SBC $B2
  F2BF  29 F8     AND #$F8
  F2C1  D0 02     BNE $F2C5
  F2C3  A9 02     LDA #$02
  F2C5  C0 13     CPY #$13
  F2C7  85 02     STA $02
  F2C9  85 2A     STA $2A
  F2CB  85 1D     STA $1D
  F2CD  B0 04     BCS $F2D3
  F2CF  B1 BA     LDA ($BA),Y
  F2D1  85 1B     STA $1B
  F2D3  B5 9A     LDA $9A,X
  F2D5  85 05     STA $05
  F2D7  85 0C     STA $0C
  F2D9  88        DEY
  F2DA  84 FD     STY $FD
  F2DC  F0 72     BEQ $F350
  F2DE  85 2B     STA $2B
  F2E0  E8        INX
  F2E1  24 00     BIT $00
  F2E3  10 02     BPL $F2E7
  F2E5  86 E2     STX $E2
  F2E7  24 02     BIT $02
  F2E9  10 02     BPL $F2ED
  F2EB  86 E4     STX $E4
  F2ED  24 04     BIT $04
  F2EF  10 02     BPL $F2F3
  F2F1  86 E6     STX $E6
  F2F3  24 07     BIT $07
  F2F5  10 02     BPL $F2F9
  F2F7  86 E8     STX $E8
  F2F9  85 02     STA $02
  F2FB  85 2A     STA $2A
  F2FD  C0 13     CPY #$13
  F2FF  B0 04     BCS $F305
  F301  B1 BA     LDA ($BA),Y
  F303  85 1B     STA $1B
  F305  A0 0D     LDY #$0D
  F307  B1 D9     LDA ($D9),Y
  F309  85 0E     STA $0E
  F30B  B1 DB     LDA ($DB),Y
  F30D  85 0F     STA $0F
  F30F  A4 FD     LDY $FD
  F311  88        DEY
  F312  F0 3C     BEQ $F350
  F314  24 03     BIT $03
  F316  10 06     BPL $F31E
  F318  B5 8E     LDA $8E,X
  F31A  09 20     ORA #$20
  F31C  95 8E     STA $8E,X
  F31E  85 2C     STA $2C
  F320  98        TYA
  F321  38        SEC
  F322  E5 B2     SBC $B2
  F324  29 F8     AND #$F8
  F326  D0 02     BNE $F32A
  F328  A9 02     LDA #$02
  F32A  C0 13     CPY #$13
  F32C  85 02     STA $02
  F32E  85 2A     STA $2A
  F330  85 1D     STA $1D
  F332  B0 18     BCS $F34C
  F334  B1 BA     LDA ($BA),Y
  F336  85 1B     STA $1B
  F338  88        DEY
  F339  84 FD     STY $FD
  F33B  F0 13     BEQ $F350
  F33D  4C 56 F1  JMP $F156
  F340  A9 0C     LDA #$0C
  F342  85 FC     STA $FC
  F344  D0 B3     BNE $F2F9
  F346  A9 0C     LDA #$0C
  F348  85 FC     STA $FC
  F34A  D0 D4     BNE $F320
  F34C  EA        NOP
  F34D  EA        NOP
  F34E  B0 E8     BCS $F338
  F350  85 02     STA $02
  F352  85 2A     STA $2A
  F354  A0 00     LDY #$00
  F356  84 1C     STY $1C
  F358  84 1B     STY $1B
  F35A  A5 F3     LDA $F3
  F35C  85 09     STA $09
  F35E  84 0D     STY $0D
  F360  84 0E     STY $0E
  F362  84 0F     STY $0F
  F364  84 0B     STY $0B
  F366  84 0C     STY $0C
  F368  84 E0     STY $E0
  F36A  A9 11     LDA #$11
  F36C  85 10     STA $10
  F36E  85 11     STA $11
  F370  85 0A     STA $0A
  F372  85 20     STA $20
  F374  A9 20     LDA #$20
  F376  85 21     STA $21
  F378  A5 EF     LDA $EF
  F37A  20 AA FF  JSR $FFAA
  F37D  A5 F0     LDA $F0
  F37F  85 09     STA $09
  F381  A9 03     LDA #$03
  F383  85 04     STA $04
  F385  85 05     STA $05
  F387  A5 F1     LDA $F1
  F389  85 08     STA $08
  F38B  A0 07     LDY #$07
  F38D  84 25     STY $25
  F38F  84 FD     STY $FD
  F391  85 2B     STA $2B
  F393  B1 D5     LDA ($D5),Y
  F395  AA        TAX
  F396  B1 D7     LDA ($D7),Y
  F398  85 02     STA $02
  F39A  85 2A     STA $2A
  F39C  84 ED     STY $ED
  F39E  85 F2     STA $F2
  F3A0  B1 CD     LDA ($CD),Y
  F3A2  85 1B     STA $1B
  F3A4  B1 CF     LDA ($CF),Y
  F3A6  85 1C     STA $1C
  F3A8  B1 D1     LDA ($D1),Y
  F3AA  85 1B     STA $1B
  F3AC  B1 D3     LDA ($D3),Y
  F3AE  A4 F2     LDY $F2
  F3B0  85 1C     STA $1C
  F3B2  86 1B     STX $1B
  F3B4  84 1C     STY $1C
  F3B6  85 1B     STA $1B
  F3B8  A4 ED     LDY $ED
  F3BA  88        DEY
  F3BB  10 D6     BPL $F393
  F3BD  A5 F3     LDA $F3
  F3BF  20 9D FF  JSR $FF9D
  F3C2  84 ED     STY $ED
  F3C4  B9 39 FE  LDA $FE39,Y
  F3C7  BE 2B FE  LDX $FE2B,Y
  F3CA  85 02     STA $02
  F3CC  85 2A     STA $2A
  F3CE  85 F2     STA $F2
  F3D0  EA        NOP
  F3D1  A9 00     LDA #$00
  F3D3  85 1B     STA $1B
  F3D5  B9 48 FE  LDA $FE48,Y
  F3D8  85 1F     STA $1F
  F3DA  B9 00 FE  LDA $FE00,Y
  F3DD  85 1C     STA $1C
  F3DF  B9 0F FE  LDA $FE0F,Y
  F3E2  85 1B     STA $1B
  F3E4  B9 1D FE  LDA $FE1D,Y
  F3E7  A4 F2     LDY $F2
  F3E9  85 1C     STA $1C
  F3EB  86 1B     STX $1B
  F3ED  84 1C     STY $1C
  F3EF  85 1B     STA $1B
  F3F1  A4 ED     LDY $ED
  F3F3  88        DEY
  F3F4  10 CC     BPL $F3C2
  F3F6  A5 EF     LDA $EF
  F3F8  20 9D FF  JSR $FF9D
  F3FB  C8        INY
  F3FC  18        CLC
  F3FD  A6 C6     LDX $C6
  F3FF  E8        INX
  F400  D0 0F     BNE $F411
  F402  A9 58     LDA #$58
  F404  85 C0     STA $C0
  F406  A5 82     LDA $82
  F408  4A        LSR A
  F409  4A        LSR A
  F40A  4A        LSR A
  F40B  C9 14     CMP #$14
  F40D  B0 09     BCS $F418
  F40F  C9 0C     CMP #$0C
  F411  A0 07     LDY #$07
  F413  90 03     BCC $F418
  F415  E9 04     SBC #$04
  F417  A8        TAY
  F418  84 FC     STY $FC
  F41A  A4 FC     LDY $FC
  F41C  B9 A8 FB  LDA $FBA8,Y
  F41F  85 F2     STA $F2
  F421  85 02     STA $02
  F423  85 2A     STA $2A
  F425  BE 98 FB  LDX $FB98,Y
  F428  B1 C0     LDA ($C0),Y
  F42A  85 1B     STA $1B
  F42C  C6 FC     DEC $FC
  F42E  B9 68 FB  LDA $FB68,Y
  F431  85 1C     STA $1C
  F433  B9 78 FB  LDA $FB78,Y
  F436  85 1B     STA $1B
  F438  B9 88 FB  LDA $FB88,Y
  F43B  A4 F2     LDY $F2
  F43D  85 1C     STA $1C
  F43F  86 1B     STX $1B
  F441  84 1C     STY $1C
  F443  85 1B     STA $1B
  F445  C6 FD     DEC $FD
  F447  10 D1     BPL $F41A
  F449  85 02     STA $02
  F44B  85 2A     STA $2A
  F44D  A2 00     LDX #$00
  F44F  86 25     STX $25
  F451  86 1C     STX $1C
  F453  86 1B     STX $1B
  F455  A5 8B     LDA $8B
  F457  C9 1A     CMP #$1A
  F459  90 01     BCC $F45C
  F45B  E8        INX
  F45C  24 00     BIT $00
  F45E  10 02     BPL $F462
  F460  86 E2     STX $E2
  F462  24 02     BIT $02
  F464  10 02     BPL $F468
  F466  86 E4     STX $E4
  F468  24 04     BIT $04
  F46A  10 02     BPL $F46E
  F46C  86 E6     STX $E6
  F46E  A9 1D     LDA #$1D
  F470  A0 82     LDY #$82
  F472  85 02     STA $02
  F474  8D 96 02  STA $0296
  F477  84 01     STY $01
  F479  24 03     BIT $03
  F47B  10 06     BPL $F483
  F47D  B5 8E     LDA $8E,X
  F47F  09 20     ORA #$20
  F481  95 8E     STA $8E,X
  F483  24 07     BIT $07
  F485  10 02     BPL $F489
  F487  86 E8     STX $E8
  F489  C6 82     DEC $82
  F48B  D0 0F     BNE $F49C
  F48D  A6 C6     LDX $C6
  F48F  E8        INX
  F490  D0 03     BNE $F495
  F492  20 D3 FF  JSR $FFD3
  F495  E6 F7     INC $F7
  F497  D0 03     BNE $F49C
  F499  38        SEC
  F49A  66 F7     ROR $F7
  F49C  A0 FF     LDY #$FF
  F49E  AD 82 02  LDA $0282
  F4A1  29 08     AND #$08
  F4A3  D0 02     BNE $F4A7
  F4A5  A0 0F     LDY #$0F
  F4A7  98        TYA
  F4A8  A0 00     LDY #$00
  F4AA  24 F7     BIT $F7
  F4AC  10 04     BPL $F4B2
  F4AE  29 F7     AND #$F7
  F4B0  A4 F7     LDY $F7
  F4B2  84 85     STY $85
  F4B4  06 85     ASL $85
  F4B6  85 86     STA $86
  F4B8  A5 83     LDA $83
  F4BA  0A        ASL A
  F4BB  0A        ASL A
  F4BC  0A        ASL A
  F4BD  45 83     EOR $83
  F4BF  0A        ASL A
  F4C0  26 83     ROL $83
  F4C2  A5 82     LDA $82
  F4C4  29 0F     AND #$0F
  F4C6  D0 11     BNE $F4D9
  F4C8  A5 83     LDA $83
  F4CA  29 07     AND #$07
  F4CC  C9 05     CMP #$05
  F4CE  90 02     BCC $F4D2
  F4D0  E9 05     SBC #$05
  F4D2  AA        TAX
  F4D3  B5 8E     LDA $8E,X
  F4D5  09 40     ORA #$40
  F4D7  95 8E     STA $8E,X
  F4D9  A2 05     LDX #$05
  F4DB  B4 A0     LDY $A0,X
  F4DD  C0 07     CPY #$07
  F4DF  B0 12     BCS $F4F3
  F4E1  A9 01     LDA #$01
  F4E3  C0 04     CPY #$04
  F4E5  B0 02     BCS $F4E9
  F4E7  A9 0F     LDA #$0F
  F4E9  25 82     AND $82
  F4EB  D0 06     BNE $F4F3
  F4ED  B9 F9 FB  LDA $FBF9,Y
  F4F0  95 A0     STA $A0,X
  F4F2  A8        TAY
  F4F3  A5 C6     LDA $C6
  F4F5  D0 6F     BNE $F566
  F4F7  A5 BD     LDA $BD
  F4F9  4A        LSR A
  F4FA  F0 6A     BEQ $F566
  F4FC  C0 04     CPY #$04
  F4FE  F0 28     BEQ $F528
  F500  90 64     BCC $F566
  F502  C0 08     CPY #$08
  F504  B0 60     BCS $F566
  F506  A5 82     LDA $82
  F508  6A        ROR A
  F509  B0 5B     BCS $F566
  F50B  B5 8E     LDA $8E,X
  F50D  0A        ASL A
  F50E  10 56     BPL $F566
  F510  0A        ASL A
  F511  10 0F     BPL $F522
  F513  0A        ASL A
  F514  30 12     BMI $F528
  F516  B5 9A     LDA $9A,X
  F518  49 08     EOR #$08
  F51A  95 9A     STA $9A,X
  F51C  B5 8E     LDA $8E,X
  F51E  09 10     ORA #$10
  F520  D0 04     BNE $F526
  F522  B5 8E     LDA $8E,X
  F524  29 EF     AND #$EF
  F526  95 8E     STA $8E,X
  F528  B4 94     LDY $94,X
  F52A  B5 9A     LDA $9A,X
  F52C  4A        LSR A
  F52D  4A        LSR A
  F52E  4A        LSR A
  F52F  4A        LSR A
  F530  49 07     EOR #$07
  F532  B0 16     BCS $F54A
  F534  69 01     ADC #$01
  F536  C9 0F     CMP #$0F
  F538  90 03     BCC $F53D
  F53A  E9 0F     SBC #$0F
  F53C  C8        INY
  F53D  C0 0A     CPY #$0A
  F53F  90 16     BCC $F557
  F541  C9 0A     CMP #$0A
  F543  90 12     BCC $F557
  F545  A0 00     LDY #$00
  F547  98        TYA
  F548  F0 0D     BEQ $F557
  F54A  E9 01     SBC #$01
  F54C  B0 0B     BCS $F559
  F54E  69 0F     ADC #$0F
  F550  88        DEY
  F551  10 04     BPL $F557
  F553  A0 0A     LDY #$0A
  F555  A9 09     LDA #$09
  F557  94 94     STY $94,X
  F559  49 07     EOR #$07
  F55B  20 F1 FD  JSR $FDF1
  F55E  55 9A     EOR $9A,X
  F560  29 F0     AND #$F0
  F562  55 9A     EOR $9A,X
  F564  95 9A     STA $9A,X
  F566  B5 8E     LDA $8E,X
  F568  29 DF     AND #$DF
  F56A  95 8E     STA $8E,X
  F56C  CA        DEX
  F56D  30 03     BMI $F572
  F56F  4C DB F4  JMP $F4DB
  F572  AD 80 02  LDA $0280
  F575  A6 F4     LDX $F4
  F577  F0 03     BEQ $F57C
  F579  20 F1 FD  JSR $FDF1
  F57C  29 F0     AND #$F0
  F57E  AA        TAX
  F57F  A0 04     LDY #$04
  F581  2A        ROL A
  F582  26 84     ROL $84
  F584  88        DEY
  F585  D0 FA     BNE $F581
  F587  E0 F0     CPX #$F0
  F589  D0 06     BNE $F591
  F58B  A6 F4     LDX $F4
  F58D  B5 0C     LDA $0C,X
  F58F  30 0E     BMI $F59F
  F591  A5 C6     LDA $C6
  F593  C9 30     CMP #$30
  F595  D0 06     BNE $F59D
  F597  A9 40     LDA #$40
  F599  85 B5     STA $B5
  F59B  84 C6     STY $C6
  F59D  84 F7     STY $F7
  F59F  A6 C6     LDX $C6
  F5A1  F0 50     BEQ $F5F3
  F5A3  30 1C     BMI $F5C1
  F5A5  E0 31     CPX #$31
  F5A7  90 47     BCC $F5F0
  F5A9  D0 12     BNE $F5BD
  F5AB  A5 C0     LDA $C0
  F5AD  F0 2A     BEQ $F5D9
  F5AF  E9 08     SBC #$08
  F5B1  D0 02     BNE $F5B5
  F5B3  A9 59     LDA #$59
  F5B5  C9 50     CMP #$50
  F5B7  D0 02     BNE $F5BB
  F5B9  A9 18     LDA #$18
  F5BB  85 C0     STA $C0
  F5BD  C6 C6     DEC $C6
  F5BF  D0 2F     BNE $F5F0
  F5C1  E8        INX
  F5C2  F0 2C     BEQ $F5F0
  F5C4  C6 C6     DEC $C6
  F5C6  30 28     BMI $F5F0
  F5C8  84 BA     STY $BA
  F5CA  A5 C5     LDA $C5
  F5CC  C9 59     CMP #$59
  F5CE  F0 03     BEQ $F5D3
  F5D0  20 D3 FF  JSR $FFD3
  F5D3  A5 C0     LDA $C0
  F5D5  C9 59     CMP #$59
  F5D7  D0 05     BNE $F5DE
  F5D9  20 97 FF  JSR $FF97
  F5DC  D0 12     BNE $F5F0
  F5DE  A2 16     LDX #$16
  F5E0  20 8F FA  JSR $FA8F
  F5E3  98        TYA
  F5E4  09 80     ORA #$80
  F5E6  85 93     STA $93
  F5E8  A5 BE     LDA $BE
  F5EA  85 E9     STA $E9
  F5EC  A5 BF     LDA $BF
  F5EE  85 EA     STA $EA
  F5F0  4C 5D F7  JMP $F75D
  F5F3  A6 E8     LDX $E8
  F5F5  30 36     BMI $F62D
  F5F7  B5 A0     LDA $A0,X
  F5F9  C9 04     CMP #$04
  F5FB  90 30     BCC $F62D
  F5FD  C9 08     CMP #$08
  F5FF  90 04     BCC $F605
  F601  D0 10     BNE $F613
  F603  E6 8A     INC $8A
  F605  A0 1F     LDY #$1F
  F607  A9 01     LDA #$01
  F609  20 5C FF  JSR $FF5C
  F60C  A6 E8     LDX $E8
  F60E  A9 02     LDA #$02
  F610  4C BF F6  JMP $F6BF
  F613  A5 B7     LDA $B7
  F615  69 01     ADC #$01
  F617  A2 04     LDX #$04
  F619  90 06     BCC $F621
  F61B  A9 FF     LDA #$FF
  F61D  85 B8     STA $B8
  F61F  A2 03     LDX #$03
  F621  85 B7     STA $B7
  F623  E4 F8     CPX $F8
  F625  F0 06     BEQ $F62D
  F627  86 F8     STX $F8
  F629  A9 08     LDA #$08
  F62B  85 F9     STA $F9
  F62D  A6 E4     LDX $E4
  F62F  30 09     BMI $F63A
  F631  A0 1F     LDY #$1F
  F633  A9 01     LDA #$01
  F635  20 5C FF  JSR $FF5C
  F638  D0 B6     BNE $F5F0
  F63A  A5 B8     LDA $B8
  F63C  38        SEC
  F63D  E9 20     SBC #$20
  F63F  B0 0D     BCS $F64E
  F641  A4 B7     LDY $B7
  F643  D0 07     BNE $F64C
  F645  A9 02     LDA #$02
  F647  A0 23     LDY #$23
  F649  4C 35 F6  JMP $F635
  F64C  C6 B7     DEC $B7
  F64E  85 B8     STA $B8
  F650  A5 84     LDA $84
  F652  A8        TAY
  F653  29 0C     AND #$0C
  F655  49 0C     EOR #$0C
  F657  D0 08     BNE $F661
  F659  85 87     STA $87
  F65B  85 B4     STA $B4
  F65D  A2 BB     LDX #$BB
  F65F  D0 31     BNE $F692
  F661  A5 87     LDA $87
  F663  18        CLC
  F664  69 08     ADC #$08
  F666  B0 02     BCS $F66A
  F668  85 87     STA $87
  F66A  A2 CD     LDX #$CD
  F66C  98        TYA
  F66D  29 08     AND #$08
  F66F  85 E0     STA $E0
  F671  F0 0D     BEQ $F680
  F673  B0 07     BCS $F67C
  F675  A5 B4     LDA $B4
  F677  38        SEC
  F678  E5 87     SBC $87
  F67A  B0 14     BCS $F690
  F67C  C6 B3     DEC $B3
  F67E  D0 10     BNE $F690
  F680  B0 0C     BCS $F68E
  F682  A5 B4     LDA $B4
  F684  24 84     BIT $84
  F686  10 02     BPL $F68A
  F688  A9 FF     LDA #$FF
  F68A  65 87     ADC $87
  F68C  90 02     BCC $F690
  F68E  E6 B3     INC $B3
  F690  85 B4     STA $B4
  F692  86 BA     STX $BA
  F694  A6 B5     LDX $B5
  F696  98        TYA
  F697  4A        LSR A
  F698  B0 07     BCS $F6A1
  F69A  8A        TXA
  F69B  69 02     ADC #$02
  F69D  90 12     BCC $F6B1
  F69F  B0 12     BCS $F6B3
  F6A1  4A        LSR A
  F6A2  90 06     BCC $F6AA
  F6A4  8A        TXA
  F6A5  0A        ASL A
  F6A6  90 F2     BCC $F69A
  F6A8  F0 09     BEQ $F6B3
  F6AA  8A        TXA
  F6AB  C9 41     CMP #$41
  F6AD  90 04     BCC $F6B3
  F6AF  E9 02     SBC #$02
  F6B1  85 B5     STA $B5
  F6B3  A6 E2     LDX $E2
  F6B5  30 77     BMI $F72E
  F6B7  B4 A0     LDY $A0,X
  F6B9  C0 04     CPY #$04
  F6BB  90 71     BCC $F72E
  F6BD  A9 01     LDA #$01
  F6BF  B4 A0     LDY $A0,X
  F6C1  95 A0     STA $A0,X
  F6C3  A9 17     LDA #$17
  F6C5  85 FA     STA $FA
  F6C7  C0 08     CPY #$08
  F6C9  D0 0C     BNE $F6D7
  F6CB  85 8D     STA $8D
  F6CD  A9 E1     LDA #$E1
  F6CF  95 9A     STA $9A,X
  F6D1  A9 04     LDA #$04
  F6D3  95 94     STA $94,X
  F6D5  E6 8A     INC $8A
  F6D7  A2 08     LDX #$08
  F6D9  B9 53 FE  LDA $FE53,Y
  F6DC  10 0E     BPL $F6EC
  F6DE  29 7F     AND #$7F
  F6E0  A6 D5     LDX $D5
  F6E2  E0 58     CPX #$58
  F6E4  D0 04     BNE $F6EA
  F6E6  A2 00     LDX #$00
  F6E8  86 D5     STX $D5
  F6EA  A2 06     LDX #$06
  F6EC  48        PHA
  F6ED  E0 02     CPX #$02
  F6EF  D0 0E     BNE $F6FF
  F6F1  A5 C0     LDA $C0
  F6F3  C9 48     CMP #$48
  F6F5  F0 08     BEQ $F6FF
  F6F7  90 02     BCC $F6FB
  F6F9  A9 FF     LDA #$FF
  F6FB  69 08     ADC #$08
  F6FD  85 C0     STA $C0
  F6FF  B5 CD     LDA $CD,X
  F701  38        SEC
  F702  E9 58     SBC #$58
  F704  D0 02     BNE $F708
  F706  95 CD     STA $CD,X
  F708  68        PLA
  F709  18        CLC
  F70A  75 CD     ADC $CD,X
  F70C  C9 50     CMP #$50
  F70E  90 18     BCC $F728
  F710  E9 50     SBC #$50
  F712  95 CD     STA $CD,X
  F714  A9 08     LDA #$08
  F716  CA        DEX
  F717  CA        DEX
  F718  10 D2     BPL $F6EC
  F71A  A9 50     LDA #$50
  F71C  A2 0A     LDX #$0A
  F71E  20 1C FF  JSR $FF1C
  F721  A9 59     LDA #$59
  F723  85 C0     STA $C0
  F725  4C 31 F6  JMP $F631
  F728  95 CD     STA $CD,X
  F72A  A2 B4     LDX #$B4
  F72C  D0 2D     BNE $F75B
  F72E  A5 E6     LDA $E6
  F730  10 F8     BPL $F72A
  F732  A5 B2     LDA $B2
  F734  C9 A2     CMP #$A2
  F736  B0 10     BCS $F748
  F738  69 06     ADC #$06
  F73A  AA        TAX
  F73B  AD 82 02  LDA $0282
  F73E  A4 F4     LDY $F4
  F740  D0 01     BNE $F743
  F742  0A        ASL A
  F743  A8        TAY
  F744  10 0E     BPL $F754
  F746  30 13     BMI $F75B
  F748  A6 F4     LDX $F4
  F74A  B5 0C     LDA $0C,X
  F74C  30 DC     BMI $F72A
  F74E  A2 0F     LDX #$0F
  F750  86 FB     STX $FB
  F752  A2 0D     LDX #$0D
  F754  A5 B3     LDA $B3
  F756  18        CLC
  F757  69 05     ADC #$05
  F759  85 F5     STA $F5
  F75B  86 B2     STX $B2
  F75D  A0 1C     LDY #$1C
  F75F  A5 F9     LDA $F9
  F761  A6 F8     LDX $F8
  F763  F0 24     BEQ $F789
  F765  CA        DEX
  F766  F0 08     BEQ $F770
  F768  A0 0F     LDY #$0F
  F76A  E0 02     CPX #$02
  F76C  B0 08     BCS $F776
  F76E  A0 08     LDY #$08
  F770  4A        LSR A
  F771  AA        TAX
  F772  A9 08     LDA #$08
  F774  D0 07     BNE $F77D
  F776  F0 02     BEQ $F77A
  F778  A0 1F     LDY #$1F
  F77A  AA        TAX
  F77B  A9 04     LDA #$04
  F77D  C6 F9     DEC $F9
  F77F  D0 53     BNE $F7D4
  F781  48        PHA
  F782  A9 00     LDA #$00
  F784  85 F8     STA $F8
  F786  68        PLA
  F787  10 4B     BPL $F7D4
  F789  A5 C6     LDA $C6
  F78B  D0 4B     BNE $F7D8
  F78D  A5 B7     LDA $B7
  F78F  C9 40     CMP #$40
  F791  B0 2A     BCS $F7BD
  F793  A4 F9     LDY $F9
  F795  D0 02     BNE $F799
  F797  A0 3F     LDY #$3F
  F799  88        DEY
  F79A  84 F9     STY $F9
  F79C  A6 B8     LDX $B8
  F79E  86 F2     STX $F2
  F7A0  C9 04     CMP #$04
  F7A2  B0 0C     BCS $F7B0
  F7A4  26 F2     ROL $F2
  F7A6  2A        ROL A
  F7A7  26 F2     ROL $F2
  F7A9  2A        ROL A
  F7AA  49 FF     EOR #$FF
  F7AC  69 20     ADC #$20
  F7AE  D0 06     BNE $F7B6
  F7B0  C0 1C     CPY #$1C
  F7B2  90 09     BCC $F7BD
  F7B4  98        TYA
  F7B5  4A        LSR A
  F7B6  A8        TAY
  F7B7  A9 0C     LDA #$0C
  F7B9  A2 0F     LDX #$0F
  F7BB  D0 17     BNE $F7D4
  F7BD  A5 B5     LDA $B5
  F7BF  4A        LSR A
  F7C0  4A        LSR A
  F7C1  4A        LSR A
  F7C2  4A        LSR A
  F7C3  49 FF     EOR #$FF
  F7C5  38        SEC
  F7C6  69 1F     ADC #$1F
  F7C8  A8        TAY
  F7C9  A5 84     LDA $84
  F7CB  29 03     AND #$03
  F7CD  AA        TAX
  F7CE  BD BE FF  LDA $FFBE,X
  F7D1  AA        TAX
  F7D2  A9 08     LDA #$08
  F7D4  85 15     STA $15
  F7D6  84 17     STY $17
  F7D8  86 19     STX $19
  F7DA  A5 FB     LDA $FB
  F7DC  F0 11     BEQ $F7EF
  F7DE  C6 FB     DEC $FB
  F7E0  A6 FA     LDX $FA
  F7E2  D0 0F     BNE $F7F3
  F7E4  49 FF     EOR #$FF
  F7E6  38        SEC
  F7E7  69 1C     ADC #$1C
  F7E9  A0 0C     LDY #$0C
  F7EB  A2 08     LDX #$08
  F7ED  D0 12     BNE $F801
  F7EF  A6 FA     LDX $FA
  F7F1  F0 12     BEQ $F805
  F7F3  C6 FA     DEC $FA
  F7F5  8A        TXA
  F7F6  4A        LSR A
  F7F7  18        CLC
  F7F8  69 04     ADC #$04
  F7FA  AA        TAX
  F7FB  A5 83     LDA $83
  F7FD  09 18     ORA #$18
  F7FF  A0 08     LDY #$08
  F801  85 18     STA $18
  F803  84 16     STY $16
  F805  86 1A     STX $1A
  F807  AD 84 02  LDA $0284
  F80A  D0 FB     BNE $F807
  F80C  A0 82     LDY #$82
  F80E  84 02     STY $02
  F810  84 00     STY $00
  F812  84 02     STY $02
  F814  84 02     STY $02
  F816  84 02     STY $02
  F818  85 00     STA $00
  F81A  A9 2B     LDA #$2B
  F81C  8D 96 02  STA $0296
  F81F  AD 82 02  LDA $0282
  F822  4A        LSR A
  F823  B0 09     BCS $F82E
  F825  A5 80     LDA $80
  F827  85 F4     STA $F4
  F829  A2 F7     LDX #$F7
  F82B  4C 04 F0  JMP $F004
  F82E  4A        LSR A
  F82F  B0 1B     BCS $F84C
  F831  C6 81     DEC $81
  F833  10 19     BPL $F84E
  F835  A5 80     LDA $80
  F837  49 01     EOR #$01
  F839  85 80     STA $80
  F83B  85 F7     STA $F7
  F83D  85 F4     STA $F4
  F83F  0A        ASL A
  F840  0A        ASL A
  F841  0A        ASL A
  F842  69 08     ADC #$08
  F844  20 0C FF  JSR $FF0C
  F847  20 97 FF  JSR $FF97
  F84A  A0 1E     LDY #$1E
  F84C  84 81     STY $81
  F84E  A5 C6     LDA $C6
  F850  30 08     BMI $F85A
  F852  C9 30     CMP #$30
  F854  D0 07     BNE $F85D
  F856  A9 BB     LDA #$BB
  F858  85 BA     STA $BA
  F85A  4C 27 F0  JMP $F027
  F85D  A9 02     LDA #$02
  F85F  85 DE     STA $DE
  F861  C6 DE     DEC $DE
  F863  30 F5     BMI $F85A
  F865  A5 B5     LDA $B5
  F867  C9 FE     CMP #$FE
  F869  B0 06     BCS $F871
  F86B  65 8C     ADC $8C
  F86D  85 8C     STA $8C
  F86F  90 F0     BCC $F861
  F871  E6 8B     INC $8B
  F873  A5 8B     LDA $8B
  F875  C9 20     CMP #$20
  F877  90 E8     BCC $F861
  F879  A2 00     LDX #$00
  F87B  86 8B     STX $8B
  F87D  A0 06     LDY #$06
  F87F  84 F2     STY $F2
  F881  A5 BD     LDA $BD
  F883  C9 05     CMP #$05
  F885  90 02     BCC $F889
  F887  A0 00     LDY #$00
  F889  84 EE     STY $EE
  F88B  A0 05     LDY #$05
  F88D  B5 8F     LDA $8F,X
  F88F  95 8E     STA $8E,X
  F891  E8        INX
  F892  88        DEY
  F893  D0 F8     BNE $F88D
  F895  E8        INX
  F896  C6 F2     DEC $F2
  F898  D0 F1     BNE $F88B
  F89A  84 9F     STY $9F
  F89C  A5 93     LDA $93
  F89E  29 04     AND #$04
  F8A0  85 93     STA $93
  F8A2  A6 BC     LDX $BC
  F8A4  86 88     STX $88
  F8A6  C6 B6     DEC $B6
  F8A8  F0 18     BEQ $F8C2
  F8AA  A6 B9     LDX $B9
  F8AC  CA        DEX
  F8AD  D0 0D     BNE $F8BC
  F8AF  86 8A     STX $8A
  F8B1  A5 BD     LDA $BD
  F8B3  4A        LSR A
  F8B4  A9 80     LDA #$80
  F8B6  B0 02     BCS $F8BA
  F8B8  A9 84     LDA #$84
  F8BA  85 93     STA $93
  F8BC  20 C6 FA  JSR $FAC6
  F8BF  4C 35 F9  JMP $F935
  F8C2  C6 B9     DEC $B9
  F8C4  D0 07     BNE $F8CD
  F8C6  20 D3 FA  JSR $FAD3
  F8C9  A2 10     LDX #$10
  F8CB  86 B9     STX $B9
  F8CD  20 C6 FA  JSR $FAC6
  F8D0  A6 B9     LDX $B9
  F8D2  CA        DEX
  F8D3  D0 06     BNE $F8DB
  F8D5  86 89     STX $89
  F8D7  A9 0C     LDA #$0C
  F8D9  D0 54     BNE $F92F
  F8DB  A5 BD     LDA $BD
  F8DD  4A        LSR A
  F8DE  A9 07     LDA #$07
  F8E0  B0 4D     BCS $F92F
  F8E2  A5 89     LDA $89
  F8E4  CA        DEX
  F8E5  D0 06     BNE $F8ED
  F8E7  C9 C0     CMP #$C0
  F8E9  F0 0D     BEQ $F8F8
  F8EB  D0 1F     BNE $F90C
  F8ED  0A        ASL A
  F8EE  45 89     EOR $89
  F8F0  30 14     BMI $F906
  F8F2  A5 E9     LDA $E9
  F8F4  29 30     AND #$30
  F8F6  D0 18     BNE $F910
  F8F8  A5 89     LDA $89
  F8FA  29 80     AND #$80
  F8FC  D0 02     BNE $F900
  F8FE  09 40     ORA #$40
  F900  85 89     STA $89
  F902  A9 00     LDA #$00
  F904  F0 29     BEQ $F92F
  F906  A9 C0     LDA #$C0
  F908  24 89     BIT $89
  F90A  70 02     BVS $F90E
  F90C  A9 00     LDA #$00
  F90E  85 89     STA $89
  F910  A0 0E     LDY #$0E
  F912  A5 E9     LDA $E9
  F914  29 0F     AND #$0F
  F916  C9 02     CMP #$02
  F918  B0 02     BCS $F91C
  F91A  69 02     ADC #$02
  F91C  24 89     BIT $89
  F91E  10 01     BPL $F921
  F920  88        DEY
  F921  A6 EE     LDX $EE
  F923  F0 02     BEQ $F927
  F925  A0 08     LDY #$08
  F927  84 F2     STY $F2
  F929  C5 F2     CMP $F2
  F92B  90 02     BCC $F92F
  F92D  A5 F2     LDA $F2
  F92F  85 BC     STA $BC
  F931  A0 02     LDY #$02
  F933  84 B6     STY $B6
  F935  A5 88     LDA $88
  F937  AA        TAX
  F938  38        SEC
  F939  E5 BC     SBC $BC
  F93B  85 F2     STA $F2
  F93D  B0 12     BCS $F951
  F93F  E6 F2     INC $F2
  F941  E0 08     CPX #$08
  F943  A6 BC     LDX $BC
  F945  B0 2C     BCS $F973
  F947  E0 09     CPX #$09
  F949  90 0E     BCC $F959
  F94B  A9 FF     LDA #$FF
  F94D  65 88     ADC $88
  F94F  10 24     BPL $F975
  F951  F0 02     BEQ $F955
  F953  C6 F2     DEC $F2
  F955  E0 09     CPX #$09
  F957  B0 0E     BCS $F967
  F959  20 00 FF  JSR $FF00
  F95C  20 B1 FA  JSR $FAB1
  F95F  85 AB     STA $AB
  F961  A9 00     LDA #$00
  F963  85 B1     STA $B1
  F965  F0 18     BEQ $F97F
  F967  A5 BC     LDA $BC
  F969  C9 08     CMP #$08
  F96B  B0 06     BCS $F973
  F96D  A9 0F     LDA #$0F
  F96F  E5 BC     SBC $BC
  F971  B0 02     BCS $F975
  F973  A9 07     LDA #$07
  F975  85 AB     STA $AB
  F977  20 00 FF  JSR $FF00
  F97A  38        SEC
  F97B  2A        ROL A
  F97C  20 B1 FA  JSR $FAB1
  F97F  24 89     BIT $89
  F981  10 08     BPL $F98B
  F983  A5 AB     LDA $AB
  F985  A6 B1     LDX $B1
  F987  85 B1     STA $B1
  F989  86 AB     STX $AB
  F98B  24 93     BIT $93
  F98D  10 0B     BPL $F99A
  F98F  A9 07     LDA #$07
  F991  85 9F     STA $9F
  F993  A0 08     LDY #$08
  F995  A9 3F     LDA #$3F
  F997  4C 81 FA  JMP $FA81
  F99A  A0 0A     LDY #$0A
  F99C  A5 B9     LDA $B9
  F99E  18        CLC
  F99F  65 B6     ADC $B6
  F9A1  C9 12     CMP #$12
  F9A3  B0 0D     BCS $F9B2
  F9A5  A9 40     LDA #$40
  F9A7  E5 BD     SBC $BD
  F9A9  0A        ASL A
  F9AA  C5 EA     CMP $EA
  F9AC  90 33     BCC $F9E1
  F9AE  24 E9     BIT $E9
  F9B0  50 3F     BVC $F9F1
  F9B2  88        DEY
  F9B3  A6 BC     LDX $BC
  F9B5  E4 88     CPX $88
  F9B7  90 02     BCC $F9BB
  F9B9  A6 88     LDX $88
  F9BB  A9 05     LDA #$05
  F9BD  85 9F     STA $9F
  F9BF  A5 BD     LDA $BD
  F9C1  4A        LSR A
  F9C2  90 0E     BCC $F9D2
  F9C4  A5 E9     LDA $E9
  F9C6  29 1F     AND #$1F
  F9C8  69 08     ADC #$08
  F9CA  C9 19     CMP #$19
  F9CC  90 52     BCC $FA20
  F9CE  69 5C     ADC #$5C
  F9D0  D0 4E     BNE $FA20
  F9D2  BD C6 FB  LDA $FBC6,X
  F9D5  24 89     BIT $89
  F9D7  10 47     BPL $FA20
  F9D9  E0 00     CPX #$00
  F9DB  F0 43     BEQ $FA20
  F9DD  A9 47     LDA #$47
  F9DF  D0 3F     BNE $FA20
  F9E1  A9 07     LDA #$07
  F9E3  A6 BD     LDX $BD
  F9E5  E0 03     CPX #$03
  F9E7  B0 02     BCS $F9EB
  F9E9  A9 01     LDA #$01
  F9EB  25 EA     AND $EA
  F9ED  AA        TAX
  F9EE  BC C0 FF  LDY $FFC0,X
  F9F1  C0 07     CPY #$07
  F9F3  D0 04     BNE $F9F9
  F9F5  A9 05     LDA #$05
  F9F7  85 9F     STA $9F
  F9F9  A5 BC     LDA $BC
  F9FB  C5 88     CMP $88
  F9FD  D0 27     BNE $FA26
  F9FF  85 FC     STA $FC
  FA01  A5 BD     LDA $BD
  FA03  4A        LSR A
  FA04  90 26     BCC $FA2C
  FA06  A9 6A     LDA #$6A
  FA08  A6 9F     LDX $9F
  FA0A  F0 02     BEQ $FA0E
  FA0C  A9 61     LDA #$61
  FA0E  E5 EE     SBC $EE
  FA10  85 F2     STA $F2
  FA12  A5 E9     LDA $E9
  FA14  29 3F     AND #$3F
  FA16  69 2D     ADC #$2D
  FA18  65 EE     ADC $EE
  FA1A  C5 F2     CMP $F2
  FA1C  90 02     BCC $FA20
  FA1E  A5 F2     LDA $F2
  FA20  24 E9     BIT $E9
  FA22  30 51     BMI $FA75
  FA24  10 5B     BPL $FA81
  FA26  B0 02     BCS $FA2A
  FA28  A5 88     LDA $88
  FA2A  85 FC     STA $FC
  FA2C  A2 0D     LDX #$0D
  FA2E  24 89     BIT $89
  FA30  10 02     BPL $FA34
  FA32  A2 0A     LDX #$0A
  FA34  E4 FC     CPX $FC
  FA36  B0 08     BCS $FA40
  FA38  98        TYA
  FA39  E9 06     SBC #$06
  FA3B  D0 03     BNE $FA40
  FA3D  85 9F     STA $9F
  FA3F  88        DEY
  FA40  A5 FC     LDA $FC
  FA42  0A        ASL A
  FA43  0A        ASL A
  FA44  F0 12     BEQ $FA58
  FA46  24 89     BIT $89
  FA48  10 0E     BPL $FA58
  FA4A  49 FF     EOR #$FF
  FA4C  69 51     ADC #$51
  FA4E  24 E9     BIT $E9
  FA50  10 17     BPL $FA69
  FA52  49 FF     EOR #$FF
  FA54  69 A0     ADC #$A0
  FA56  D0 06     BNE $FA5E
  FA58  69 10     ADC #$10
  FA5A  24 E9     BIT $E9
  FA5C  30 07     BMI $FA65
  FA5E  18        CLC
  FA5F  69 02     ADC #$02
  FA61  65 EE     ADC $EE
  FA63  D0 1C     BNE $FA81
  FA65  49 FF     EOR #$FF
  FA67  69 A1     ADC #$A1
  FA69  C0 0A     CPY #$0A
  FA6B  E9 09     SBC #$09
  FA6D  E5 EE     SBC $EE
  FA6F  A6 9F     LDX $9F
  FA71  F0 02     BEQ $FA75
  FA73  E9 0A     SBC #$0A
  FA75  C0 0A     CPY #$0A
  FA77  F0 08     BEQ $FA81
  FA79  48        PHA
  FA7A  A5 9F     LDA $9F
  FA7C  09 08     ORA #$08
  FA7E  85 9F     STA $9F
  FA80  68        PLA
  FA81  84 A5     STY $A5
  FA83  20 D8 FD  JSR $FDD8
  FA86  84 99     STY $99
  FA88  05 9F     ORA $9F
  FA8A  85 9F     STA $9F
  FA8C  4C 61 F8  JMP $F861
  FA8F  BD B1 FD  LDA $FDB1,X
  FA92  95 A6     STA $A6,X
  FA94  CA        DEX
  FA95  10 F8     BPL $FA8F
  FA97  A9 00     LDA #$00
  FA99  A2 1E     LDX #$1E
  FA9B  95 87     STA $87,X
  FA9D  CA        DEX
  FA9E  10 FB     BPL $FA9B
  FAA0  A2 05     LDX #$05
  FAA2  A0 01     LDY #$01
  FAA4  A5 BD     LDA $BD
  FAA6  4A        LSR A
  FAA7  90 02     BCC $FAAB
  FAA9  A0 05     LDY #$05
  FAAB  94 8E     STY $8E,X
  FAAD  CA        DEX
  FAAE  10 FB     BPL $FAAB
  FAB0  60        RTS
  FAB1  24 89     BIT $89
  FAB3  10 04     BPL $FAB9
  FAB5  A8        TAY
  FAB6  B9 B7 FB  LDA $FBB7,Y
  FAB9  05 93     ORA $93
  FABB  85 93     STA $93
  FABD  BD F1 FC  LDA $FCF1,X
  FAC0  18        CLC
  FAC1  65 F2     ADC $F2
  FAC3  85 B1     STA $B1
  FAC5  60        RTS
  FAC6  A5 EA     LDA $EA
  FAC8  0A        ASL A
  FAC9  0A        ASL A
  FACA  0A        ASL A
  FACB  45 EA     EOR $EA
  FACD  0A        ASL A
  FACE  26 E9     ROL $E9
  FAD0  26 EA     ROL $EA
  FAD2  60        RTS
  FAD3  A6 BD     LDX $BD
  FAD5  E0 30     CPX #$30
  FAD7  90 02     BCC $FADB
  FAD9  A2 2E     LDX #$2E
  FADB  A5 BE     LDA $BE
  FADD  85 EB     STA $EB
  FADF  A5 BF     LDA $BF
  FAE1  85 EC     STA $EC
  FAE3  A5 E9     LDA $E9
  FAE5  85 BE     STA $BE
  FAE7  A5 EA     LDA $EA
  FAE9  85 BF     STA $BF
  FAEB  E8        INX
  FAEC  86 BD     STX $BD
  FAEE  60        RTS
  FAEF  20 D8 FD  JSR $FDD8
  FAF2  95 20     STA $20,X
  FAF4  C8        INY
  FAF5  C8        INY
  FAF6  C8        INY
  FAF7  85 02     STA $02
  FAF9  88        DEY
  FAFA  10 FD     BPL $FAF9
  FAFC  95 10     STA $10,X
  FAFE  60        RTS
  FAFF  00        BRK
  FB00  3C        .byte $3C
  FB01  66 66     ROR $66
  FB03  66 66     ROR $66
  FB05  66 66     ROR $66
  FB07  3C        .byte $3C
  FB08  3C        .byte $3C
  FB09  18        CLC
  FB0A  18        CLC
  FB0B  18        CLC
  FB0C  18        CLC
  FB0D  18        CLC
  FB0E  38        SEC
  FB0F  18        CLC
  FB10  7E 60 60  ROR $6060,X
  FB13  3C        .byte $3C
  FB14  06 06     ASL $06
  FB16  46 3C     LSR $3C
  FB18  3C        .byte $3C
  FB19  46 06     LSR $06
  FB1B  0C        .byte $0C
  FB1C  0C        .byte $0C
  FB1D  06 46     ASL $46
  FB1F  3C        .byte $3C
  FB20  0C        .byte $0C
  FB21  0C        .byte $0C
  FB22  0C        .byte $0C
  FB23  7E 4C 2C  ROR $2C4C,X
  FB26  1C        .byte $1C
  FB27  0C        .byte $0C
  FB28  7C        .byte $7C
  FB29  46 06     LSR $06
  FB2B  06 7C     ASL $7C
  FB2D  60        RTS
  FB2E  60        RTS
  FB2F  7E 3C 66  ROR $663C,X
  FB32  66 66     ROR $66
  FB34  7C        .byte $7C
  FB35  60        RTS
  FB36  62        .byte $62
  FB37  3C        .byte $3C
  FB38  18        CLC
  FB39  18        CLC
  FB3A  18        CLC
  FB3B  18        CLC
  FB3C  0C        .byte $0C
  FB3D  06 42     ASL $42
  FB3F  7E 3C 66  ROR $663C,X
  FB42  66 3C     ROR $3C
  FB44  3C        .byte $3C
  FB45  66 66     ROR $66
  FB47  3C        .byte $3C
  FB48  3C        .byte $3C
  FB49  46 06     LSR $06
  FB4B  3E 66 66  ROL $6666,X
  FB4E  66 3C     ROR $3C
  FB50  18        CLC
  FB51  18        CLC
  FB52  00        BRK
  FB53  18        CLC
  FB54  18        CLC
  FB55  18        CLC
  FB56  18        CLC
  FB57  18        CLC
  FB58  00        BRK
  FB59  00        BRK
  FB5A  00        BRK
  FB5B  00        BRK
  FB5C  00        BRK
  FB5D  00        BRK
  FB5E  00        BRK
  FB5F  00        BRK
  FB60  00        BRK
  FB61  00        BRK
  FB62  F7        .byte $F7
  FB63  95 87     STA $87,X
  FB65  80        .byte $80
  FB66  90 F0     BCC $FB58
  FB68  00        BRK
  FB69  00        BRK
  FB6A  00        BRK
  FB6B  00        BRK
  FB6C  00        BRK
  FB6D  00        BRK
  FB6E  00        BRK
  FB6F  00        BRK
  FB70  47        .byte $47
  FB71  41 77     EOR ($77,X)
  FB73  55 75     EOR $75,X
  FB75  00        BRK
  FB76  00        BRK
  FB77  00        BRK
  FB78  AD A9 E9  LDA $E9A9
  FB7B  A9 ED     LDA #$ED
  FB7D  41 0F     EOR ($0F,X)
  FB7F  00        BRK
  FB80  03        .byte $03
  FB81  00        BRK
  FB82  4B        .byte $4B
  FB83  4A        LSR A
  FB84  6B        .byte $6B
  FB85  00        BRK
  FB86  08        PHP
  FB87  00        BRK
  FB88  50 58     BVC $FBE2
  FB8A  5C        .byte $5C
  FB8B  56 53     LSR $53,X
  FB8D  11 F0     ORA ($F0),Y
  FB8F  00        BRK
  FB90  80        .byte $80
  FB91  80        .byte $80
  FB92  AA        TAX
  FB93  AA        TAX
  FB94  BA        TSX
  FB95  22        .byte $22
  FB96  27        .byte $27
  FB97  02        .byte $02
  FB98  BA        TSX
  FB99  8A        TXA
  FB9A  BA        TSX
  FB9B  A2 3A     LDX #$3A
  FB9D  80        .byte $80
  FB9E  FE 00 00  INC $0000,X
  FBA1  00        BRK
  FBA2  11 11     ORA ($11),Y
  FBA4  17        .byte $17
  FBA5  15 17     ORA $17,X
  FBA7  00        BRK
  FBA8  E9 AB     SBC #$AB
  FBAA  AF        .byte $AF
  FBAB  AD E9 00  LDA $00E9
  FBAE  00        BRK
  FBAF  00        BRK
  FBB0  00        BRK
  FBB1  00        BRK
  FBB2  77        .byte $77
  FBB3  54        .byte $54
  FBB4  77        .byte $77
  FBB5  51 77     EOR ($77),Y
  FBB7  00        BRK
  FBB8  02        .byte $02
  FBB9  01 03     ORA ($03,X)
  FBBB  0F        .byte $0F
  FBBC  C1 D2     CMP ($D2,X)
  FBBE  C1 A8     CMP ($A8,X)
  FBC0  B9 90 80  LDA $8090,Y
  FBC3  75 E6     ADC $E6,X
  FBC5  68        PLA
  FBC6  8F        .byte $8F
  FBC7  8D 07 0A  STA $0A07
  FBCA  84 0D     STY $0D
  FBCC  80        .byte $80
  FBCD  12        .byte $12
  FBCE  7C        .byte $7C
  FBCF  16 78     ASL $78,X
  FBD1  1A        .byte $1A
  FBD2  74        .byte $74
  FBD3  1E 70 B5  ASL $B570,X
  FBD6  A6 85     LDX $85
  FBD8  D9 B5 8E  CMP $8EB5,Y
  FBDB  29 01     AND #$01
  FBDD  09 FC     ORA #$FC
  FBDF  85 DA     STA $DA
  FBE1  B5 AC     LDA $AC,X
  FBE3  85 DB     STA $DB
  FBE5  B5 8E     LDA $8E,X
  FBE7  4A        LSR A
  FBE8  29 01     AND #$01
  FBEA  09 FC     ORA #$FC
  FBEC  85 DC     STA $DC
  FBEE  60        RTS
  FBEF  F1 F1     SBC ($F1),Y
  FBF1  F1 F1     SBC ($F1),Y
  FBF3  F3        .byte $F3
  FBF4  F3        .byte $F3
  FBF5  F2        .byte $F2
  FBF6  F2        .byte $F2
  FBF7  F2        .byte $F2
  FBF8  F2        .byte $F2
  FBF9  00        BRK
  FBFA  02        .byte $02
  FBFB  03        .byte $03
  FBFC  00        BRK
  FBFD  04        .byte $04
  FBFE  06 05     ASL $05
  FC00  00        BRK
  FC01  00        BRK
  FC02  00        BRK
  FC03  00        BRK
  FC04  00        BRK
  FC05  00        BRK
  FC06  00        BRK
  FC07  00        BRK
  FC08  00        BRK
  FC09  00        BRK
  FC0A  00        BRK
  FC0B  00        BRK
  FC0C  00        BRK
  FC0D  00        BRK
  FC0E  00        BRK
  FC0F  00        BRK
  FC10  00        BRK
  FC11  00        BRK
  FC12  00        BRK
  FC13  01 03     ORA ($03,X)
  FC15  07        .byte $07
  FC16  0F        .byte $0F
  FC17  1F        .byte $1F
  FC18  3F        .byte $3F
  FC19  3F        .byte $3F
  FC1A  3F        .byte $3F
  FC1B  3F        .byte $3F
  FC1C  3F        .byte $3F
  FC1D  3F        .byte $3F
  FC1E  3F        .byte $3F
  FC1F  3F        .byte $3F
  FC20  3F        .byte $3F
  FC21  3F        .byte $3F
  FC22  3F        .byte $3F
  FC23  3F        .byte $3F
  FC24  3F        .byte $3F
  FC25  3F        .byte $3F
  FC26  3F        .byte $3F
  FC27  3F        .byte $3F
  FC28  1F        .byte $1F
  FC29  0F        .byte $0F
  FC2A  07        .byte $07
  FC2B  03        .byte $03
  FC2C  01 00     ORA ($00,X)
  FC2E  00        BRK
  FC2F  00        BRK
  FC30  00        BRK
  FC31  00        BRK
  FC32  00        BRK
  FC33  00        BRK
  FC34  00        BRK
  FC35  01 03     ORA ($03,X)
  FC37  07        .byte $07
  FC38  0F        .byte $0F
  FC39  1F        .byte $1F
  FC3A  1F        .byte $1F
  FC3B  1F        .byte $1F
  FC3C  1F        .byte $1F
  FC3D  1F        .byte $1F
  FC3E  1F        .byte $1F
  FC3F  1F        .byte $1F
  FC40  1F        .byte $1F
  FC41  1F        .byte $1F
  FC42  1F        .byte $1F
  FC43  1F        .byte $1F
  FC44  1F        .byte $1F
  FC45  1F        .byte $1F
  FC46  1F        .byte $1F
  FC47  1F        .byte $1F
  FC48  1F        .byte $1F
  FC49  0F        .byte $0F
  FC4A  07        .byte $07
  FC4B  03        .byte $03
  FC4C  01 00     ORA ($00,X)
  FC4E  00        BRK
  FC4F  00        BRK
  FC50  00        BRK
  FC51  00        BRK
  FC52  00        BRK
  FC53  00        BRK
  FC54  00        BRK
  FC55  01 03     ORA ($03,X)
  FC57  07        .byte $07
  FC58  0F        .byte $0F
  FC59  0F        .byte $0F
  FC5A  0F        .byte $0F
  FC5B  0F        .byte $0F
  FC5C  0F        .byte $0F
  FC5D  0F        .byte $0F
  FC5E  0F        .byte $0F
  FC5F  0F        .byte $0F
  FC60  0F        .byte $0F
  FC61  0F        .byte $0F
  FC62  0F        .byte $0F
  FC63  0F        .byte $0F
  FC64  0F        .byte $0F
  FC65  0F        .byte $0F
  FC66  0F        .byte $0F
  FC67  0F        .byte $0F
  FC68  07        .byte $07
  FC69  03        .byte $03
  FC6A  01 00     ORA ($00,X)
  FC6C  00        BRK
  FC6D  00        BRK
  FC6E  00        BRK
  FC6F  00        BRK
  FC70  00        BRK
  FC71  00        BRK
  FC72  00        BRK
  FC73  01 03     ORA ($03,X)
  FC75  07        .byte $07
  FC76  07        .byte $07
  FC77  07        .byte $07
  FC78  07        .byte $07
  FC79  07        .byte $07
  FC7A  07        .byte $07
  FC7B  07        .byte $07
  FC7C  07        .byte $07
  FC7D  07        .byte $07
  FC7E  07        .byte $07
  FC7F  07        .byte $07
  FC80  07        .byte $07
  FC81  07        .byte $07
  FC82  07        .byte $07
  FC83  07        .byte $07
  FC84  07        .byte $07
  FC85  03        .byte $03
  FC86  01 00     ORA ($00,X)
  FC88  00        BRK
  FC89  00        BRK
  FC8A  00        BRK
  FC8B  00        BRK
  FC8C  00        BRK
  FC8D  00        BRK
  FC8E  00        BRK
  FC8F  01 03     ORA ($03,X)
  FC91  03        .byte $03
  FC92  03        .byte $03
  FC93  03        .byte $03
  FC94  03        .byte $03
  FC95  03        .byte $03
  FC96  03        .byte $03
  FC97  03        .byte $03
  FC98  03        .byte $03
  FC99  03        .byte $03
  FC9A  03        .byte $03
  FC9B  03        .byte $03
  FC9C  03        .byte $03
  FC9D  03        .byte $03
  FC9E  03        .byte $03
  FC9F  03        .byte $03
  FCA0  01 00     ORA ($00,X)
  FCA2  00        BRK
  FCA3  00        BRK
  FCA4  00        BRK
  FCA5  00        BRK
  FCA6  00        BRK
  FCA7  00        BRK
  FCA8  00        BRK
  FCA9  01 01     ORA ($01,X)
  FCAB  01 01     ORA ($01,X)
  FCAD  01 01     ORA ($01,X)
  FCAF  01 01     ORA ($01,X)
  FCB1  01 01     ORA ($01,X)
  FCB3  01 01     ORA ($01,X)
  FCB5  01 01     ORA ($01,X)
  FCB7  01 01     ORA ($01,X)
  FCB9  00        BRK
  FCBA  00        BRK
  FCBB  00        BRK
  FCBC  00        BRK
  FCBD  00        BRK
  FCBE  00        BRK
  FCBF  00        BRK
  FCC0  00        BRK
  FCC1  2A        ROL A
  FCC2  3E 1C 08  ROL $081C,X
  FCC5  49 6B     EOR #$6B
  FCC7  7F        .byte $7F
  FCC8  7F        .byte $7F
  FCC9  3E 1C 08  ROL $081C,X
  FCCC  08        PHP
  FCCD  08        PHP
  FCCE  00        BRK
  FCCF  00        BRK
  FCD0  00        BRK
  FCD1  00        BRK
  FCD2  02        .byte $02
  FCD3  2E 3C 18  ROL $183C
  FCD6  08        PHP
  FCD7  0A        ASL A
  FCD8  2E 3E 3E  ROL $3E3E
  FCDB  3C        .byte $3C
  FCDC  18        CLC
  FCDD  08        PHP
  FCDE  08        PHP
  FCDF  08        PHP
  FCE0  00        BRK
  FCE1  00        BRK
  FCE2  00        BRK
  FCE3  00        BRK
  FCE4  00        BRK
  FCE5  02        .byte $02
  FCE6  08        PHP
  FCE7  10 00     BPL $FCE9
  FCE9  40        RTI
  FCEA  08        PHP
  FCEB  21 44     AND ($44,X)
  FCED  10 04     BPL $FCF3
  FCEF  08        PHP
  FCF0  00        BRK
  FCF1  00        BRK
  FCF2  A1 91     LDA ($91,X)
  FCF4  7F        .byte $7F
  FCF5  6B        .byte $6B
  FCF6  55 3D     EOR $3D,X
  FCF8  23        .byte $23
  FCF9  07        .byte $07
  FCFA  A9 90     LDA #$90
  FCFC  75 58     ADC $58,X
  FCFE  39 18 80  AND $8018,Y
  FD01  C0 E0     CPY #$E0
  FD03  F0 F8     BEQ $FCFD
  FD05  FC        .byte $FC
  FD06  FE FF FF  INC $FFFF,X
  FD09  FF        .byte $FF
  FD0A  FF        .byte $FF
  FD0B  FF        .byte $FF
  FD0C  FF        .byte $FF
  FD0D  FF        .byte $FF
  FD0E  FF        .byte $FF
  FD0F  FF        .byte $FF
  FD10  FF        .byte $FF
  FD11  FF        .byte $FF
  FD12  FF        .byte $FF
  FD13  FF        .byte $FF
  FD14  FF        .byte $FF
  FD15  FF        .byte $FF
  FD16  FF        .byte $FF
  FD17  FE FC F8  INC $F8FC,X
  FD1A  F0 E0     BEQ $FCFC
  FD1C  C0 80     CPY #$80
  FD1E  C0 E0     CPY #$E0
  FD20  F0 F8     BEQ $FD1A
  FD22  FC        .byte $FC
  FD23  FE FE FE  INC $FEFE,X
  FD26  FE FE FE  INC $FEFE,X
  FD29  FE FE FE  INC $FEFE,X
  FD2C  FE FE FE  INC $FEFE,X
  FD2F  FE FE FE  INC $FEFE,X
  FD32  FE FC F8  INC $F8FC,X
  FD35  F0 E0     BEQ $FD17
  FD37  C0 80     CPY #$80
  FD39  C0 E0     CPY #$E0
  FD3B  F0 F8     BEQ $FD35
  FD3D  FC        .byte $FC
  FD3E  FC        .byte $FC
  FD3F  FC        .byte $FC
  FD40  FC        .byte $FC
  FD41  FC        .byte $FC
  FD42  FC        .byte $FC
  FD43  FC        .byte $FC
  FD44  FC        .byte $FC
  FD45  FC        .byte $FC
  FD46  FC        .byte $FC
  FD47  FC        .byte $FC
  FD48  FC        .byte $FC
  FD49  FC        .byte $FC
  FD4A  FC        .byte $FC
  FD4B  FC        .byte $FC
  FD4C  FC        .byte $FC
  FD4D  F8        SED
  FD4E  F0 E0     BEQ $FD30
  FD50  C0 80     CPY #$80
  FD52  C0 E0     CPY #$E0
  FD54  F0 F8     BEQ $FD4E
  FD56  F8        SED
  FD57  F8        SED
  FD58  F8        SED
  FD59  F8        SED
  FD5A  F8        SED
  FD5B  F8        SED
  FD5C  F8        SED
  FD5D  F8        SED
  FD5E  F8        SED
  FD5F  F8        SED
  FD60  F8        SED
  FD61  F8        SED
  FD62  F8        SED
  FD63  F8        SED
  FD64  F8        SED
  FD65  F0 E0     BEQ $FD47
  FD67  C0 80     CPY #$80
  FD69  C0 E0     CPY #$E0
  FD6B  F0 F0     BEQ $FD5D
  FD6D  F0 F0     BEQ $FD5F
  FD6F  F0 F0     BEQ $FD61
  FD71  F0 F0     BEQ $FD63
  FD73  F0 F0     BEQ $FD65
  FD75  F0 F0     BEQ $FD67
  FD77  F0 F0     BEQ $FD69
  FD79  F0 F0     BEQ $FD6B
  FD7B  E0 C0     CPX #$C0
  FD7D  80        .byte $80
  FD7E  C0 E0     CPY #$E0
  FD80  E0 E0     CPX #$E0
  FD82  E0 E0     CPX #$E0
  FD84  E0 E0     CPX #$E0
  FD86  E0 E0     CPX #$E0
  FD88  E0 E0     CPX #$E0
  FD8A  E0 E0     CPX #$E0
  FD8C  E0 E0     CPX #$E0
  FD8E  E0 C0     CPX #$C0
  FD90  80        .byte $80
  FD91  C0 C0     CPY #$C0
  FD93  C0 C0     CPY #$C0
  FD95  C0 C0     CPY #$C0
  FD97  C0 C0     CPY #$C0
  FD99  C0 C0     CPY #$C0
  FD9B  C0 C0     CPY #$C0
  FD9D  C0 C0     CPY #$C0
  FD9F  C0 C0     CPY #$C0
  FDA1  80        .byte $80
  FDA2  80        .byte $80
  FDA3  80        .byte $80
  FDA4  80        .byte $80
  FDA5  80        .byte $80
  FDA6  80        .byte $80
  FDA7  80        .byte $80
  FDA8  80        .byte $80
  FDA9  80        .byte $80
  FDAA  80        .byte $80
  FDAB  80        .byte $80
  FDAC  80        .byte $80
  FDAD  80        .byte $80
  FDAE  80        .byte $80
  FDAF  80        .byte $80
  FDB0  80        .byte $80
  FDB1  07        .byte $07
  FDB2  07        .byte $07
  FDB3  07        .byte $07
  FDB4  07        .byte $07
  FDB5  07        .byte $07
  FDB6  07        .byte $07
  FDB7  58        CLI
  FDB8  58        CLI
  FDB9  58        CLI
  FDBA  58        CLI
  FDBB  58        CLI
  FDBC  58        CLI
  FDBD  B4 4C     LDY $4C,X
  FDBF  00        BRK
  FDC0  FE 01 FF  INC $FF01,X
  FDC3  FF        .byte $FF
  FDC4  11 00     ORA ($00),Y
  FDC6  FC        .byte $FC
  FDC7  0C        .byte $0C
  FDC8  01 14     ORA ($14,X)
  FDCA  A8        TAY
  FDCB  58        CLI
  FDCC  FB        .byte $FB
  FDCD  01 14     ORA ($14,X)
  FDCF  A8        TAY
  FDD0  58        CLI
  FDD1  80        .byte $80
  FDD2  5E FE 69  LSR $69FE,X
  FDD5  FE 4A FF  INC $FF4A,X
  FDD8  A8        TAY
  FDD9  C8        INY
  FDDA  98        TYA
  FDDB  29 0F     AND #$0F
  FDDD  85 ED     STA $ED
  FDDF  98        TYA
  FDE0  4A        LSR A
  FDE1  4A        LSR A
  FDE2  4A        LSR A
  FDE3  4A        LSR A
  FDE4  A8        TAY
  FDE5  18        CLC
  FDE6  65 ED     ADC $ED
  FDE8  C9 0F     CMP #$0F
  FDEA  90 03     BCC $FDEF
  FDEC  E9 0F     SBC #$0F
  FDEE  C8        INY
  FDEF  49 07     EOR #$07
  FDF1  0A        ASL A
  FDF2  0A        ASL A
  FDF3  0A        ASL A
  FDF4  0A        ASL A
  FDF5  60        RTS
  FDF6  F6 B3     INC $B3,X
  FDF8  39 51 45  AND $4551,Y
  FDFB  3F        .byte $3F
  FDFC  B6 95     LDX $95,Y
  FDFE  42        .byte $42
  FDFF  04        .byte $04
  FE00  7F        .byte $7F
  FE01  40        RTI
  FE02  4F        .byte $4F
  FE03  48        PHA
  FE04  48        PHA
  FE05  4E 48 48  LSR $4848
  FE08  4F        .byte $4F
  FE09  40        RTI
  FE0A  40        RTI
  FE0B  4C 4C 4C  JMP $4C4C
  FE0E  7F        .byte $7F
  FE0F  FF        .byte $FF
  FE10  00        BRK
  FE11  00        BRK
  FE12  00        BRK
  FE13  00        BRK
  FE14  00        BRK
  FE15  00        BRK
  FE16  00        BRK
  FE17  00        BRK
  FE18  00        BRK
  FE19  00        BRK
  FE1A  00        BRK
  FE1B  00        BRK
  FE1C  00        BRK
  FE1D  FF        .byte $FF
  FE1E  00        BRK
  FE1F  03        .byte $03
  FE20  C2        .byte $C2
  FE21  63        .byte $63
  FE22  30 1B     BMI $FE3F
  FE24  EC 46 43  CPX $4346
  FE27  C1 48     CMP ($48,X)
  FE29  08        PHP
  FE2A  08        PHP
  FE2B  FF        .byte $FF
  FE2C  00        BRK
  FE2D  80        .byte $80
  FE2E  00        BRK
  FE2F  80        .byte $80
  FE30  80        .byte $80
  FE31  80        .byte $80
  FE32  00        BRK
  FE33  00        BRK
  FE34  00        BRK
  FE35  80        .byte $80
  FE36  00        BRK
  FE37  00        BRK
  FE38  00        BRK
  FE39  FF        .byte $FF
  FE3A  01 81     ORA ($81,X)
  FE3C  81 81     STA ($81,X)
  FE3E  E1 81     SBC ($81,X)
  FE40  81 F1     STA ($F1,X)
  FE42  01 01     ORA ($01,X)
  FE44  19 19 19  ORA $1919,Y
  FE47  FF        .byte $FF
  FE48  00        BRK
  FE49  02        .byte $02
  FE4A  02        .byte $02
  FE4B  02        .byte $02
  FE4C  02        .byte $02
  FE4D  02        .byte $02
  FE4E  02        .byte $02
  FE4F  02        .byte $02
  FE50  02        .byte $02
  FE51  02        .byte $02
  FE52  02        .byte $02
  FE53  00        BRK
  FE54  00        BRK
  FE55  00        BRK
  FE56  00        BRK
  FE57  88        DEY
  FE58  30 30     BMI $FE8A
  FE5A  18        CLC
  FE5B  A8        TAY
  FE5C  00        BRK
  FE5D  40        RTI
  FE5E  FE DE DE  INC $DEDE,X
  FE61  FE DE DE  INC $DEDE,X
  FE64  FE D6 D6  INC $D6D6,X
  FE67  DE CE C6  DEC $C6CE,X
  FE6A  DE DE C6  DEC $C6DE,X
  FE6D  CE C6 C6  DEC $C6C6
  FE70  D6 FE     DEC $FE,X
  FE72  DE DE 7C  DEC $7CDE,X
  FE75  42        .byte $42
  FE76  FF        .byte $FF
  FE77  FF        .byte $FF
  FE78  FF        .byte $FF
  FE79  FF        .byte $FF
  FE7A  FF        .byte $FF
  FE7B  FF        .byte $FF
  FE7C  FF        .byte $FF
  FE7D  FF        .byte $FF
  FE7E  FF        .byte $FF
  FE7F  FF        .byte $FF
  FE80  42        .byte $42
  FE81  00        BRK
  FE82  00        BRK
  FE83  00        BRK
  FE84  FC        .byte $FC
  FE85  FF        .byte $FF
  FE86  30 10     BMI $FE98
  FE88  00        BRK
  FE89  00        BRK
  FE8A  00        BRK
  FE8B  00        BRK
  FE8C  00        BRK
  FE8D  30 4F     BMI $FEDE
  FE8F  C6 00     DEC $00
  FE91  00        BRK
  FE92  00        BRK
  FE93  00        BRK
  FE94  0E 8E FF  ASL $FF8E
  FE97  0E 07 00  ASL $0007
  FE9A  00        BRK
  FE9B  00        BRK
  FE9C  00        BRK
  FE9D  04        .byte $04
  FE9E  FF        .byte $FF
  FE9F  9F        .byte $9F
  FEA0  04        .byte $04
  FEA1  07        .byte $07
  FEA2  00        BRK
  FEA3  00        BRK
  FEA4  00        BRK
  FEA5  7C        .byte $7C
  FEA6  FE 78 10  INC $1078,X
  FEA9  00        BRK
  FEAA  00        BRK
  FEAB  00        BRK
  FEAC  00        BRK
  FEAD  00        BRK
  FEAE  38        SEC
  FEAF  FF        .byte $FF
  FEB0  80        .byte $80
  FEB1  00        BRK
  FEB2  00        BRK
  FEB3  00        BRK
  FEB4  00        BRK
  FEB5  04        .byte $04
  FEB6  FF        .byte $FF
  FEB7  9F        .byte $9F
  FEB8  04        .byte $04
  FEB9  1C        .byte $1C
  FEBA  00        BRK
  FEBB  00        BRK
  FEBC  00        BRK
  FEBD  0E 8E FF  ASL $FF8E
  FEC0  0E 1C 00  ASL $001C
  FEC3  00        BRK
  FEC4  00        BRK
  FEC5  00        BRK
  FEC6  10 20     BPL $FEE8
  FEC8  40        RTI
  FEC9  10 00     BPL $FECB
  FECB  00        BRK
  FECC  00        BRK
  FECD  00        BRK
  FECE  04        .byte $04
  FECF  02        .byte $02
  FED0  08        PHP
  FED1  04        .byte $04
  FED2  00        BRK
  FED3  00        BRK
  FED4  00        BRK
  FED5  00        BRK
  FED6  20 02 41  JSR $4102
  FED9  20 02 04  JSR $0402
  FEDC  00        BRK
  FEDD  00        BRK
  FEDE  00        BRK
  FEDF  04        .byte $04
  FEE0  88        DEY
  FEE1  10 04     BPL $FEE7
  FEE3  80        .byte $80
  FEE4  10 00     BPL $FEE6
  FEE6  00        BRK
  FEE7  00        BRK
  FEE8  04        .byte $04
  FEE9  1F        .byte $1F
  FEEA  0E 04 04  ASL $0404
  FEED  00        BRK
  FEEE  AA        TAX
  FEEF  FE 7C 00  INC $007C,X
  FEF2  00        BRK
  FEF3  04        .byte $04
  FEF4  0E 1F 0E  ASL $0E1F
  FEF7  04        .byte $04
  FEF8  00        BRK
  FEF9  FE AA FE  INC $FEAA,X
  FEFC  38        SEC
  FEFD  00        BRK
  FEFE  00        BRK
  FEFF  00        BRK
  FF00  8A        TXA
  FF01  F0 08     BEQ $FF0B
  FF03  A9 00     LDA #$00
  FF05  E0 09     CPX #$09
  FF07  B0 02     BCS $FF0B
  FF09  A9 01     LDA #$01
  FF0B  60        RTS
  FF0C  85 D7     STA $D7
  FF0E  85 E7     STA $E7
  FF10  A9 58     LDA #$58
  FF12  A2 08     LDX #$08
  FF14  95 DD     STA $DD,X
  FF16  CA        DEX
  FF17  CA        DEX
  FF18  10 FA     BPL $FF14
  FF1A  A2 08     LDX #$08
  FF1C  95 CD     STA $CD,X
  FF1E  CA        DEX
  FF1F  CA        DEX
  FF20  10 FA     BPL $FF1C
  FF22  60        RTS
  FF23  49 2A     EOR #$2A
  FF25  66 2A     ROR $2A
  FF27  44        .byte $44
  FF28  40        RTI
  FF29  40        RTI
  FF2A  49 50     EOR #$50
  FF2C  2C 37 10  BIT $1037
  FF2F  DA        .byte $DA
  FF30  DA        .byte $DA
  FF31  DA        .byte $DA
  FF32  DA        .byte $DA
  FF33  00        BRK
  FF34  0C        .byte $0C
  FF35  0C        .byte $0C
  FF36  00        BRK
  FF37  00        BRK
  FF38  0C        .byte $0C
  FF39  0C        .byte $0C
  FF3A  0C        .byte $0C
  FF3B  48        PHA
  FF3C  48        PHA
  FF3D  48        PHA
  FF3E  0C        .byte $0C
  FF3F  0C        .byte $0C
  FF40  0C        .byte $0C
  FF41  48        PHA
  FF42  48        PHA
  FF43  48        PHA
  FF44  B0 B0     BCS $FEF6
  FF46  80        .byte $80
  FF47  B0 2A     BCS $FF73
  FF49  2A        ROL A
  FF4A  AC 9C 8C  LDY $8C9C
  FF4D  A8        TAY
  FF4E  32        .byte $32
  FF4F  00        BRK
  FF50  00        BRK
  FF51  20 14 12  JSR $1214
  FF54  14        .byte $14
  FF55  12        .byte $12
  FF56  18        CLC
  FF57  12        .byte $12
  FF58  14        .byte $14
  FF59  12        .byte $12
  FF5A  14        .byte $14
  FF5B  20 84 F9  JSR $F984
  FF5E  85 F8     STA $F8
  FF60  A5 8E     LDA $8E
  FF62  45 93     EOR $93
  FF64  29 04     AND #$04
  FF66  F0 24     BEQ $FF8C
  FF68  A5 8A     LDA $8A
  FF6A  F0 09     BEQ $FF75
  FF6C  24 93     BIT $93
  FF6E  10 1C     BPL $FF8C
  FF70  20 D3 FA  JSR $FAD3
  FF73  D0 17     BNE $FF8C
  FF75  24 93     BIT $93
  FF77  30 13     BMI $FF8C
  FF79  A6 BD     LDX $BD
  FF7B  CA        DEX
  FF7C  E0 2E     CPX #$2E
  FF7E  D0 02     BNE $FF82
  FF80  A2 30     LDX #$30
  FF82  86 BD     STX $BD
  FF84  A5 EB     LDA $EB
  FF86  85 BE     STA $BE
  FF88  A5 EC     LDA $EC
  FF8A  85 BF     STA $BF
  FF8C  A9 DF     LDA #$DF
  FF8E  85 BA     STA $BA
  FF90  85 C6     STA $C6
  FF92  A9 B4     LDA #$B4
  FF94  85 B2     STA $B2
  FF96  60        RTS
  FF97  A9 FF     LDA #$FF
  FF99  85 82     STA $82
  FF9B  D0 F3     BNE $FF90
  FF9D  C8        INY
  FF9E  85 02     STA $02
  FFA0  85 2A     STA $2A
  FFA2  84 1C     STY $1C
  FFA4  84 1B     STY $1B
  FFA6  84 1C     STY $1C
  FFA8  A0 0E     LDY #$0E
  FFAA  85 06     STA $06
  FFAC  85 07     STA $07
  FFAE  85 02     STA $02
  FFB0  85 2A     STA $2A
  FFB2  60        RTS
  FFB3  04        .byte $04
  FFB4  04        .byte $04
  FFB5  08        PHP
  FFB6  08        PHP
  FFB7  08        PHP
  FFB8  08        PHP
  FFB9  1C        .byte $1C
  FFBA  08        PHP
  FFBB  08        PHP
  FFBC  08        PHP
  FFBD  08        PHP
  FFBE  04        .byte $04
  FFBF  04        .byte $04
  FFC0  07        .byte $07
  FFC1  05 07     ORA $07
  FFC3  05 04     ORA $04
  FFC5  07        .byte $07
  FFC6  05 05     ORA $05
  FFC8  0F        .byte $0F
  FFC9  C9 DB     CMP #$DB
  FFCB  C9 87     CMP #$87
  FFCD  98        TYA
  FFCE  B0 A1     BCS $FF71
  FFD0  74        .byte $74
  FFD1  F1 5D     SBC ($5D),Y
  FFD3  A5 80     LDA $80
  FFD5  F0 1F     BEQ $FFF6
  FFD7  45 F4     EOR $F4
  FFD9  85 F4     STA $F4
  FFDB  A2 03     LDX #$03
  FFDD  B5 BD     LDA $BD,X
  FFDF  B4 C2     LDY $C2,X
  FFE1  95 C2     STA $C2,X
  FFE3  94 BD     STY $BD,X
  FFE5  CA        DEX
  FFE6  10 F5     BPL $FFDD
  FFE8  A2 0A     LDX #$0A
  FFEA  B5 CD     LDA $CD,X
  FFEC  B4 DD     LDY $DD,X
  FFEE  95 DD     STA $DD,X
  FFF0  94 CD     STY $CD,X
  FFF2  CA        DEX
  FFF3  CA        DEX
  FFF4  10 F4     BPL $FFEA
  FFF6  60        RTS
  FFF7  00        BRK
  FFF8  1C        .byte $1C
  FFF9  06 1E     ASL $1E
  FFFB  84 00     STY $00
  FFFD  F0 00     BEQ $FFFF
  FFFF  00        BRK
