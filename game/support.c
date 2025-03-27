/**
 * @file support.c
 * @brief Support functions for the memory game
 */

#include "stm32f0xx.h"
#include <stdio.h>
#include <stdint.h>

extern const char font[];
extern uint16_t msg[8];

/**
 * @brief Wait for n nanoseconds
 * 
 * @param t Time in nanoseconds
 */
void nano_wait(int t) {
    asm("mov r0, %[t] \n\t"
        "ldr r1, =48      \n\t"  // 1 cycle = 1/48MHz = ~20.8ns
        "udiv r0, r0, r1  \n\t"  // r0 = # of cycles to wait
        "1: sub r0, r0, #1 \n\t" // Subtract 1 from r0
        "nop              \n\t"
        "nop              \n\t"
        "nop              \n\t"
        "nop              \n\t"
        "nop              \n\t"
        "nop              \n\t"
        "nop              \n\t"
        "nop              \n\t"
        "nop              \n\t"
        "nop              \n\t"
        "bne 1b"
        : : [t] "r" (t) : "r0", "r1", "cc");
}

/**
 * @brief Configure internal clock
 */
void internal_clock(void) {
    // Configure the system to use the internal 48MHz clock
    RCC->CR2 |= RCC_CR2_HSI48ON;
    while ((RCC->CR2 & RCC_CR2_HSI48RDY) == 0);
    
    // Select HSI48 as the system clock source
    RCC->CFGR &= ~RCC_CFGR_SW;
    RCC->CFGR |= RCC_CFGR_SW_HSI48;
    while ((RCC->CFGR & RCC_CFGR_SWS) != RCC_CFGR_SWS_HSI48);
}

/**
 * @brief Print an 8-character string on the 7-segment display.
 * 
 * @param str String to display
 */
void print(const char str[]) {
    for(int i=0; i<8; i++) {
        if (i < 8 && str[i] != '\0')
            msg[i] = (i << 8) | font[(unsigned)str[i]];
        else
            msg[i] = (i << 8) | font[' '];
    }
}

/**
 * @brief Print a floating-point value.
 * 
 * @param f Value to display
 */
void printfloat(float f) {
    char buf[10];
    snprintf(buf, 10, "%f", f);
    print(buf);
}

/**
 * @brief Test function to demonstrate keypad functionality
 */
void show_keys(void) {
    char buf[9];
    int i = 0;
    
    for(;;) {
        char key = get_key_event(); // External function defined in main.c
        
        // Only display the last 8 keys pressed
        buf[i++ & 7] = key;
        
        // Display up to 8 characters, filling the rest with spaces
        for(int j=0; j<8; j++) {
            if (j < (i < 8 ? i : 8))
                msg[j] = (j << 8) | font[(unsigned)buf[(i-j-1) & 7]];
            else
                msg[j] = (j << 8) | font[' '];
        }
    }
}
