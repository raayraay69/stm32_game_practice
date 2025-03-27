/**
 * @file font.S
 * @brief Font definition for 7-segment display in assembly
 */

    .syntax unified
    .cpu cortex-m0
    .fpu softvfp
    .thumb

/* Global font array accessible from C */
    .global font
    .global keymap

    .section .rodata
    .align 2

/* 
 * 7-segment display font
 * Segment mapping: gfedcba (bit 0 = segment a)
 */
font:
    .byte 0x3F    /* 0: abcdef */
    .byte 0x06    /* 1: bc */
    .byte 0x5B    /* 2: abged */
    .byte 0x4F    /* 3: abgcd */
    .byte 0x66    /* 4: fgbc */
    .byte 0x6D    /* 5: afgcd */
    .byte 0x7D    /* 6: afgecd */
    .byte 0x07    /* 7: abc */
    .byte 0x7F    /* 8: abcdefg */
    .byte 0x6F    /* 9: abfgcd */
    .byte 0x77    /* A: abcefg */
    .byte 0x7C    /* b: fgecd */
    .byte 0x39    /* C: adef */
    .byte 0x5E    /* d: bcdeg */
    .byte 0x79    /* E: afged */
    .byte 0x71    /* F: afge */
    .byte 0x3D    /* G: afcde */
    .byte 0x76    /* H: fgbce */
    .byte 0x30    /* I: ef */
    .byte 0x1E    /* J: bcde */
    .byte 0x75    /* K (approximation) */
    .byte 0x38    /* L: fed */
    .byte 0x37    /* M (approximation) */
    .byte 0x54    /* n: gce */
    .byte 0x3F    /* O: abcdef */
    .byte 0x73    /* P: abefg */
    .byte 0x67    /* q: afgbc */
    .byte 0x50    /* r: ge */
    .byte 0x6D    /* S: afgcd */
    .byte 0x78    /* t: fged */
    .byte 0x3E    /* U: bcdef */
    .byte 0x3E    /* V (same as U) */
    .byte 0x7E    /* W (approximation) */
    .byte 0x76    /* X (approximation) */
    .byte 0x6E    /* y: fbgcd */
    .byte 0x5B    /* Z: abged */
    .byte 0x00    /* space */
    .byte 0x40    /* - */
    .byte 0x80    /* . */
    .byte 0x00    /* (padding) */
    .byte 0x00    /* @ (not used) */
    .space 40     /* ASCII 41-80 */
    .space 47     /* ASCII 81-127 */
    .space 128    /* Extended ASCII */

/* 
 * Keypad mapping for 4x4 matrix
 * Row 0: 1 2 3 A
 * Row 1: 4 5 6 B
 * Row 2: 7 8 9 C
 * Row 3: * 0 # D
 */
keymap:
    .byte '1', '2', '3', 'A'
    .byte '4', '5', '6', 'B'
    .byte '7', '8', '9', 'C'
    .byte '*', '0', '#', 'D'

    .end
