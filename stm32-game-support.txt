/**
 * @file support.c
 * @author Eric Raymond (edraymon)
 * @brief Support functions for the STM32 game
 * @date March 26, 2025
 */

#include "stm32f0xx.h"
#include <stdint.h>

// Font definition for 7-segment display
// Segment mapping: gfedcba (LSB = segment a)
const char font[] = {
    0x3f, // 0: abcdef
    0x06, // 1: bc
    0x5b, // 2: abged
    0x4f, // 3: abgcd
    0x66, // 4: fgbc
    0x6d, // 5: afgcd
    0x7d, // 6: afgecd
    0x07, // 7: abc
    0x7f, // 8: abcdefg
    0x6f, // 9: abfgcd
    0x77, // A: abcefg
    0x7c, // b: fgecd
    0x39, // C: adef
    0x5e, // d: bcdeg
    0x79, // E: afged
    0x71, // F: afge
    0x3d, // G: afcde
    0x76, // H: fgbce
    0x30, // I: ef
    0x1e, // J: bcde
    0x75, // K (approximation)
    0x38, // L: fed
    0x37, // M (approximation)
    0x54, // n: gce
    0x3f, // O: abcdef
    0x73, // P: abefg
    0x67, // q: afgbc
    0x50, // r: ge
    0x6d, // S: afgcd
    0x78, // t: fged
    0x3e, // U: bcdef
    0x3e, // V (same as U)
    0x7e, // W (approximation)
    0x76, // X (approximation)
    0x6e, // y: fbgcd
    0x5b, // Z: abged
    0x00, // space
    0x40, // -
    0x80, // .
    0x5c, // ?
    0x73, // P
    0x3f, // O
    0x77, // A
    0x38, // L
    0x73, // P
    0x50, // r
    0x6d, // S
    0x6d  // S
};

// Keypad history for debouncing
static uint16_t history[16] = {0};
// Mapping from keypad position to character
const char keymap[] = {
    '1', '2', '3', 'A',
    '4', '5', '6', 'B',
    '7', '8', '9', 'C',
    '*', '0', '#', 'D'
};

/**
 * @brief Delay function using busy-wait
 * @param ns Number of nanoseconds to wait
 */
void nano_wait(unsigned int ns) {
    asm("    mov r0, %[ns]            \n"
        "    lsrs r0, #2              \n" // Divide by 4 (rough approximation)
        "1:  subs r0, #1              \n"
        "    bne 1b                   \n"
        :: [ns] "r" (ns) : "r0");
}

/**
 * @brief Configure GPIO ports for game hardware
 */
void enable_ports(void) {
    // Enable clocks for GPIOB and GPIOC
    RCC->AHBENR |= RCC_AHBENR_GPIOBEN | RCC_AHBENR_GPIOCEN;

    // Configure GPIOB pins 0-7 as outputs (segments a-g)
    GPIOB->MODER &= ~0x0000ffff;
    GPIOB->MODER |= 0x00005555;

    // Configure GPIOB pins 8-11 as outputs (digit selection)
    GPIOB->MODER &= ~0x00ff0000;
    GPIOB->MODER |= 0x00550000;

    // Configure GPIOC pins 4-7 as open-drain outputs (keypad columns)
    GPIOC->MODER &= ~0x0000ff00;
    GPIOC->MODER |= 0x00005500;
    GPIOC->OTYPER |= 0x000000f0;

    // Configure GPIOC pins 0-3 as inputs with pull-up (keypad rows)
    GPIOC->MODER &= ~0x000000ff;
    GPIOC->PUPDR &= ~0x000000ff;
    GPIOC->PUPDR |= 0x00000055;
}

/**
 * @brief Configure DMA for LED display update
 */
void setup_dma(void) {
    // Enable DMA1 clock
    RCC->AHBENR |= RCC_AHBENR_DMAEN;

    // Configure DMA1 Channel 5 for display update
    DMA1_Channel5->CCR &= ~DMA_CCR_EN;  // Disable channel during setup
    DMA1_Channel5->CPAR = (uint32_t) &(GPIOB->ODR);  // Peripheral address
    DMA1_Channel5->CMAR = (uint32_t) msg;  // Memory address (msg array)
    DMA1_Channel5->CNDTR = 8;  // Number of data items to transfer
    
    // Configure DMA channel settings
    DMA1_Channel5->CCR |= DMA_CCR_DIR    // Memory to peripheral
                        | DMA_CCR_MINC   // Increment memory address
                        | DMA_CCR_MSIZE_0 // 16-bit memory size
                        | DMA_CCR_PSIZE_0 // 16-bit peripheral size
                        | DMA_CCR_CIRC;   // Circular mode
}

/**
 * @brief Enable DMA transfers
 */
void enable_dma(void) {
    DMA1_Channel5->CCR |= DMA_CCR_EN;  // Enable DMA channel
}

/**
 * @brief Initialize Timer 15 for display refresh
 */
void init_tim15(void) {
    // Enable TIM15 clock
    RCC->APB2ENR |= RCC_APB2ENR_TIM15EN;
    
    // Configure TIM15 for 1kHz update rate
    TIM15->PSC = 48 - 1;      // Prescaler: 48MHz / 48 = 1MHz
    TIM15->ARR = 1000 - 1;    // Auto-reload: 1MHz / 1000 = 1kHz
    
    // Enable update DMA request
    TIM15->DIER |= TIM_DIER_UDE;
    
    // Enable timer
    TIM15->CR1 |= TIM_CR1_CEN;
}

/**
 * @brief Drive a specific keypad column
 * @param col Column number (0-3)
 */
void drive_column(int col) {
    // Clear all column outputs
    GPIOC->BSRR = 0xF0 << 16;  // Reset bits 4-7
    
    // Drive the selected column
    if (col >= 0 && col <= 3)
        GPIOC->BSRR = 1 << (col + 4);
}

/**
 * @brief Read the state of keypad rows
 * @return Row values (bits 0-3)
 */
int read_rows(void) {
    return GPIOC->IDR & 0xF;  // Read bits 0-3
}

/**
 * @brief Update keypad history for debouncing
 * @param col Current column being scanned
 * @param rows Row values read
 */
void update_history(int col, int rows) {
    // Update history for each row in this column
    for (int row = 0; row < 4; row++) {
        // Calculate button index
        int index = row * 4 + col;
        
        // Shift history and add new state
        history[index] = (history[index] << 1) | ((rows >> row) & 1);
    }
}

/**
 * @brief Get a key event (press or release)
 * @return ASCII character of the key, or 0 if no event
 */
char get_key_event(void) {
    // Check each button
    for (int i = 0; i < 16; i++) {
        // Check for press pattern (0000 -> 1111)
        if ((history[i] & 0x1F) == 0x1F && (history[i] & 0x20) == 0) {
            return keymap[i];  // Return character for pressed key
        }
        
        // Check for release pattern (1111 -> 0000)
        if ((history[i] & 0x1F) == 0x00 && (history[i] & 0x20) == 0x20) {
            return keymap[i] | 0x80;  // Return character with MSB set for release
        }
    }
    
    return 0;  // No event
}

/**
 * @brief Wait for a key press event
 * @return ASCII character of the pressed key
 */
char get_keypress(void) {
    char key;
    
    // Wait for a key press event
    do {
        key = get_key_event();
        // If it's a press event (MSB not set)
        if (key && !(key & 0x80))
            return key;
    } while (1);
}

/**
 * @brief Initialize Timer 7 for keypad scanning
 */
void init_tim7(void) {
    // Enable TIM7 clock
    RCC->APB1ENR |= RCC_APB1ENR_TIM7EN;
    
    // Configure TIM7 for 10ms (100Hz) interrupt
    TIM7->PSC = 48 - 1;      // Prescaler: 48MHz / 48 = 1MHz
    TIM7->ARR = 1000 - 1;    // Auto-reload: 1MHz / 1000 = 1kHz
    
    // Enable update interrupt
    TIM7->DIER |= TIM_DIER_UIE;
    
    // Enable timer
    TIM7->CR1 |= TIM_CR1_CEN;
    
    // Enable TIM7 interrupt in NVIC
    NVIC_EnableIRQ(TIM7_IRQn);
    NVIC_SetPriority(TIM7_IRQn, 1);
}

/**
 * @brief Timer 7 interrupt handler for keypad scanning
 */
void TIM7_IRQHandler(void) {
    // Clear update interrupt flag
    TIM7->SR &= ~TIM_SR_UIF;
    
    // Read the rows for the current column
    int rows = read_rows();
    
    // Update key history
    update_history(col, rows);
    
    // Move to next column
    col = (col + 1) & 3;
    
    // Drive the new column
    drive_column(col);
}