.cpu cortex-m0
.thumb
.syntax unified
.fpu softvfp

.section .text.font,"a",%progbits
.align 1

// 7-segment display font table
// Segment arrangement:
//    AAA
//   F   B
//   F   B
//    GGG
//   E   C
//   E   C
//    DDD  DP
//
// Bits:  DP GFEDCBA
// Value: 80 40 20 10 08 04 02 01

.global font
.type font, %object
font:
.byte 0b00111111  // 0: ABCDEF
.byte 0b00000110  // 1:  BC
.byte 0b01011011  // 2: AB DE G
.byte 0b01001111  // 3: ABCD  G
.byte 0b01100110  // 4:  BC  FG
.byte 0b01101101  // 5: A CD FG
.byte 0b01111101  // 6: A CDEFG
.byte 0b00000111  // 7: ABC
.byte 0b01111111  // 8: ABCDEFG
.byte 0b01101111  // 9: ABCD FG
.byte 0b01110111  // A: ABC EFG
.byte 0b01111100  // b:  CDEFG
.byte 0b00111001  // C: A  DEF
.byte 0b01011110  // d:  BCDEG
.byte 0b01111001  // E: A  DEFG
.byte 0b01110001  // F: A   EFG
.byte 0b00111101  // G: A CDEF
.byte 0b01110110  // H:  BC EFG
.byte 0b00000110  // I:  BC
.byte 0b00011110  // J:  BCDE
.byte 0b01110101  // K: A  EFG (makeshift, not perfect)
.byte 0b00111000  // L:    DEF
.byte 0b00110111  // M: ABC EF  (makeshift, not perfect)
.byte 0b01010100  // n:  C E G
.byte 0b00111111  // O: ABCDEF
.byte 0b01110011  // P: AB  EFG
.byte 0b01100111  // q: ABC  FG
.byte 0b01010000  // r:     EG
.byte 0b01101101  // S: A CD FG
.byte 0b01111000  // t:    DEFG
.byte 0b00111110  // U:  BCDEF
.byte 0b00111110  // V:  BCDEF (same as U)
.byte 0b01111110  // W:  BCDEFG (makeshift, not perfect)
.byte 0b01110110  // X:  BC EFG (makeshift, not perfect)
.byte 0b01101110  // y:  BCDFG
.byte 0b01011011  // Z: AB DE G (same as 2)
.byte 0b00000000  // Space
.byte 0b01000000  // - (minus sign): G only
.byte 0b10000000  // . (period): DP only
.byte 0b01100011  // ° (degree symbol): AB FG
.byte 0b01001001  // = (equals sign): D G

.align 1
.global keymap
.type keymap, %object
keymap:
.byte '1', '2', '3', 'A'
.byte '4', '5', '6', 'B'
.byte '7', '8', '9', 'C'
.byte '*', '0', '#', 'D'

.size font, . - font
.size keymap, . - keymap
