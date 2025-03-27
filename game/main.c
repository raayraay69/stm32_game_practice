/**
 * @file main.c
 * @author Eric Raymond
 * @brief STM32 Practice Game for ECE 362 Lab Practical Preparation
 * 
 * This game combines various peripheral configurations into a simple
 * memory/reaction game to help practice the concepts covered in Labs 4-6.
 */

#include "stm32f0xx.h"
#include <stdlib.h>
#include <math.h>
#include <string.h>

// Username for completion code
const char* username = "edraymon";

// External font definitions
extern const char font[];

// Function prototypes
void initialize_all_peripherals(void);
void nano_wait(int t);
void print(const char str[]);
void printfloat(float f);
void display_score(int score);
void play_success_sound(void);
void play_failure_sound(void);
void play_startup_sound(void);
void set_led_brightness(int level);

// Game constants
#define MAX_SEQUENCE 10
#define INITIAL_SPEED 1000 // milliseconds
#define SPEED_DECREASE 100 // decrease per level

// Game variables
int sequence[MAX_SEQUENCE];
int player_sequence[MAX_SEQUENCE];
int current_level = 1;
int score = 0;
int game_state = 0; // 0 = menu, 1 = showing sequence, 2 = player input, 3 = game over
int speed = INITIAL_SPEED;

/**
 * @brief Initialize all required peripherals for the game
 * 
 * This function initializes GPIO, DMA, 7-segment display,
 * ADC, DAC, and timer peripherals needed for the game.
 */
void initialize_all_peripherals(void) {
    // Enable RCC clocks for all peripherals
    RCC->AHBENR |= RCC_AHBENR_GPIOAEN | RCC_AHBENR_GPIOBEN | RCC_AHBENR_GPIOCEN;
    RCC->APB1ENR |= RCC_APB1ENR_TIM6EN | RCC_APB1ENR_TIM7EN | RCC_APB1ENR_DACEN;
    RCC->APB2ENR |= RCC_APB2ENR_TIM15EN | RCC_APB2ENR_ADC1EN;
    
    // Configure GPIO pins
    
    // 7-segment display pins (GPIOB pins 0-7 for segments, 8-11 for digits)
    GPIOB->MODER &= ~0x00FFFFFF;  // Clear mode bits
    GPIOB->MODER |= 0x00555555;   // Set output mode
    
    // Keypad pins (GPIOC pins 0-3 input with pull-up, 4-7 open-drain output)
    GPIOC->MODER &= ~0x0000FFFF;  // Clear mode bits
    GPIOC->MODER |= 0x00005500;   // Set pins 4-7 as outputs
    GPIOC->PUPDR &= ~0x000000FF;  // Clear pull-up/down
    GPIOC->PUPDR |= 0x00000055;   // Set pull-up for pins 0-3
    GPIOC->OTYPER |= 0x000000F0;  // Set open-drain for pins 4-7
    
    // ADC pin (PA1)
    GPIOA->MODER |= 0x0000000C;   // Set PA1 to analog mode
    
    // DAC output (PA4)
    GPIOA->MODER |= 0x00000300;   // Set PA4 to analog mode
    
    // RGB LED (PA8, PA9, PA10)
    GPIOA->MODER &= ~0x00FFFFFF;  // Clear bits
    GPIOA->MODER |= 0x00555555;   // Set alternate function mode
    
    // Setup DMA for display multiplexing
    RCC->AHBENR |= RCC_AHBENR_DMAEN;
    
    DMA1_Channel5->CCR &= ~DMA_CCR_EN;
    DMA1_Channel5->CPAR = (uint32_t)&(GPIOB->ODR);
    DMA1_Channel5->CMAR = (uint32_t)msg;
    DMA1_Channel5->CNDTR = 8;
    DMA1_Channel5->CCR |= DMA_CCR_DIR | DMA_CCR_MINC | DMA_CCR_MSIZE_0 | DMA_CCR_PSIZE_0 | DMA_CCR_CIRC;
    DMA1_Channel5->CCR |= DMA_CCR_EN;
    
    // Setup TIM15 for display multiplexing
    TIM15->PSC = 48 - 1;
    TIM15->ARR = 1000 - 1;
    TIM15->DIER |= TIM_DIER_UDE;
    TIM15->CR1 |= TIM_CR1_CEN;
    
    // Setup TIM7 for keypad scanning
    TIM7->PSC = 48 - 1;
    TIM7->ARR = 1000 - 1;
    TIM7->DIER |= TIM_DIER_UIE;
    TIM7->CR1 |= TIM_CR1_CEN;
    NVIC_EnableIRQ(TIM7_IRQn);
    
    // Setup ADC
    RCC->CR2 |= RCC_CR2_HSI14ON;
    while(!(RCC->CR2 & RCC_CR2_HSI14RDY));
    
    ADC1->CR |= ADC_CR_ADEN;
    while(!(ADC1->ISR & ADC_ISR_ADRDY));
    
    ADC1->CHSELR = ADC_CHSELR_CHSEL1;
    while(!(ADC1->ISR & ADC_ISR_ADRDY));
    
    // Setup DAC
    DAC->CR &= ~DAC_CR_TSEL1;
    DAC->CR |= DAC_CR_TEN1;
    DAC->CR |= DAC_CR_EN1;
    
    // Setup TIM6 for audio generation
    TIM6->PSC = 0;
    TIM6->ARR = 2399; // 20kHz
    TIM6->DIER |= TIM_DIER_UIE;
    TIM6->CR1 |= TIM_CR1_CEN;
    NVIC_EnableIRQ(TIM6_DAC_IRQn);
    
    // Setup TIM1 for RGB LED control
    RCC->APB2ENR |= RCC_APB2ENR_TIM1EN;
    TIM1->BDTR |= TIM_BDTR_MOE;
    TIM1->PSC = 0;
    TIM1->ARR = 2399;
    
    TIM1->CCMR1 |= TIM_CCMR1_OC1M_1 | TIM_CCMR1_OC1M_2 | TIM_CCMR1_OC1PE |
                   TIM_CCMR1_OC2M_1 | TIM_CCMR1_OC2M_2 | TIM_CCMR1_OC2PE;
    TIM1->CCMR2 |= TIM_CCMR2_OC3M_1 | TIM_CCMR2_OC3M_2 | TIM_CCMR2_OC3PE;
    
    TIM1->CCER |= TIM_CCER_CC1P | TIM_CCER_CC2P | TIM_CCER_CC3P;
    TIM1->CCER |= TIM_CCER_CC1E | TIM_CCER_CC2E | TIM_CCER_CC3E;
    
    TIM1->CR1 |= TIM_CR1_CEN;
}

/**
 * @brief Variables for sound generation
 */
#define N 1000
short int wavetable[N];
int step0 = 0;
int offset0 = 0;
int step1 = 0;
int offset1 = 0;
uint32_t volume = 2048;

/**
 * @brief Initializes a sine wave table
 */
void init_wavetable(void) {
    for(int i=0; i < N; i++)
        wavetable[i] = 32767 * sin(2 * M_PI * i / N);
}

/**
 * @brief Set a frequency for a sound channel
 * 
 * @param chan Channel (0 or 1)
 * @param f Frequency
 */
void set_freq(int chan, float f) {
    if (chan == 0) {
        if (f == 0.0) {
            step0 = 0;
            offset0 = 0;
        } else
            step0 = (f * N / 20000) * (1<<16);
    }
    if (chan == 1) {
        if (f == 0.0) {
            step1 = 0;
            offset1 = 0;
        } else
            step1 = (f * N / 20000) * (1<<16);
    }
}

/**
 * @brief Timer 6 interrupt for audio generation
 */
void TIM6_DAC_IRQHandler(void) {
    TIM6->SR &= ~TIM_SR_UIF;
    
    offset0 += step0;
    offset1 += step1;
    
    if (offset0 >= (N << 16))
        offset0 -= (N << 16);
    if (offset1 >= (N << 16))
        offset1 -= (N << 16);
    
    int sample = wavetable[offset0>>16] + wavetable[offset1>>16];
    sample = ((sample * volume) >> 17) + 2048;
    
    DAC->DHR12R1 = sample;
}

/**
 * @brief Plays a success sound
 */
void play_success_sound(void) {
    set_freq(0, 1000);
    set_freq(1, 1500);
    nano_wait(200000000);
    set_freq(0, 0);
    set_freq(1, 0);
}

/**
 * @brief Plays a failure sound
 */
void play_failure_sound(void) {
    set_freq(0, 200);
    set_freq(1, 300);
    nano_wait(500000000);
    set_freq(0, 0);
    set_freq(1, 0);
}

/**
 * @brief Plays a startup sound
 */
void play_startup_sound(void) {
    set_freq(0, 440);
    nano_wait(100000000);
    set_freq(0, 587);
    nano_wait(100000000);
    set_freq(0, 880);
    nano_wait(200000000);
    set_freq(0, 0);
}

/**
 * @brief Variables for the keypad
 */
uint8_t col = 0;
uint8_t history[16] = {0};
char keymap[] = "123A456B789C*0#D";

/**
 * @brief Drive a column of the keypad
 * 
 * @param c Column (0-3)
 */
void drive_column(int c) {
    GPIOC->BSRR = 0xF0 << 16;  // Clear columns
    if (c >= 0 && c <= 3)
        GPIOC->BSRR = 1 << (c + 4);  // Set one column
}

/**
 * @brief Read the rows of the keypad
 * 
 * @return int Row values (bits 0-3)
 */
int read_rows(void) {
    return GPIOC->IDR & 0xF;  // Read rows
}

/**
 * @brief Updates the button history
 * 
 * @param c Column
 * @param rows Row values
 */
void update_history(int c, int rows) {
    for(int i = 0; i < 4; i++) {
        history[4*c + i] = (history[4*c + i] << 1) | ((rows & (1 << i)) ? 1 : 0);
    }
}

/**
 * @brief Keypad scanning interrupt
 */
void TIM7_IRQHandler(void) {
    TIM7->SR &= ~TIM_SR_UIF;
    
    int rows = read_rows();
    update_history(col, rows);
    
    col = (col + 1) & 3;
    drive_column(col);
}

/**
 * @brief Get a key press event
 * 
 * @return char Key pressed
 */
char get_key_event(void) {
    for(;;) {
        for(int i = 0; i < 16; i++) {
            // Check for key press pattern (0->1)
            if ((history[i] & 0x7) == 0x1) {
                history[i] = 0;
                return keymap[i];
            }
        }
        // Wait for next scan
        nano_wait(1000000);
    }
}

// 7-segment display messages
uint16_t msg[8] = { 0x0000,0x0100,0x0200,0x0300,0x0400,0x0500,0x0600,0x0700 };

/**
 * @brief Display the current score
 * 
 * @param score Score to display
 */
void display_score(int score) {
    char str[9];
    sprintf(str, "Score %d", score);
    print(str);
}

/**
 * @brief Sets the RGB LED brightness
 * 
 * @param level Brightness level (0-100)
 */
void set_led_brightness(int level) {
    // Invert values since LEDs are active low
    uint16_t pwm_val = (2400 * (100-level))/100;
    TIM1->CCR1 = pwm_val; // Red
    TIM1->CCR2 = pwm_val; // Green
    TIM1->CCR3 = pwm_val; // Blue
}

/**
 * @brief Sets RGB LED color
 * 
 * @param r Red value (0-100)
 * @param g Green value (0-100)
 * @param b Blue value (0-100)
 */
void set_rgb_color(int r, int g, int b) {
    TIM1->CCR1 = (2400 * (100-r))/100; // Red
    TIM1->CCR2 = (2400 * (100-g))/100; // Green
    TIM1->CCR3 = (2400 * (100-b))/100; // Blue
}

/**
 * @brief Sets a digit in the sequence for the game
 * 
 * @param digit Value 0-9
 */
void show_digit(int digit) {
    char str[2] = {0};
    str[0] = '0' + (digit % 10);
    print(str);
    
    // Show visual feedback
    switch(digit) {
        case 1: set_rgb_color(100, 0, 0); break; // Red
        case 2: set_rgb_color(0, 100, 0); break; // Green
        case 3: set_rgb_color(0, 0, 100); break; // Blue
        case 4: set_rgb_color(100, 100, 0); break; // Yellow
        case 5: set_rgb_color(100, 0, 100); break; // Magenta
        case 6: set_rgb_color(0, 100, 100); break; // Cyan
        case 7: set_rgb_color(100, 50, 0); break; // Orange
        case 8: set_rgb_color(50, 0, 100); break; // Purple
        case 9: set_rgb_color(100, 100, 100); break; // White
        default: set_rgb_color(0, 0, 0); break; // Off
    }
}

/**
 * @brief Generates a random sequence for the game
 * 
 * @param level Current game level
 */
void generate_sequence(int level) {
    for(int i = 0; i < level; i++) {
        sequence[i] = (rand() % 9) + 1; // Random digit 1-9
    }
}

/**
 * @brief Shows the sequence to the player
 * 
 * @param level Current game level
 */
void show_sequence(int level) {
    for(int i = 0; i < level; i++) {
        show_digit(sequence[i]);
        nano_wait(speed * 1000000); // Show digit
        
        set_rgb_color(0, 0, 0); // Turn off LED
        print("        "); // Clear display
        nano_wait(300000000); // Brief pause
    }
}

/**
 * @brief Gets player input for the sequence
 * 
 * @param level Current game level
 * @return int 1 if correct, 0 if incorrect
 */
int get_player_sequence(int level) {
    for(int i = 0; i < level; i++) {
        print("Input...");
        
        char key = get_key_event();
        int digit = key - '0';
        
        if(key >= '1' && key <= '9') {
            player_sequence[i] = digit;
            show_digit(digit);
            nano_wait(250000000); // Brief display
            
            if(player_sequence[i] != sequence[i]) {
                return 0; // Incorrect
            }
        } else {
            return 0; // Non-numeric input
        }
    }
    
    return 1; // All correct
}

/**
 * @brief Main game entry point
 */
void game_main(void) {
    // Initialize game
    srand(0); // Fixed seed for debugging
    
    // Show welcome message
    print("MEMORY  ");
    play_startup_sound();
    nano_wait(1000000000);
    
    while(1) {
        // Game menu
        print("Press # ");
        game_state = 0;
        
        // Wait for start key
        while(get_key_event() != '#') {
            // Wait for player to start game
        }
        
        // Game variables
        current_level = 1;
        score = 0;
        speed = INITIAL_SPEED;
        
        // Game loop
        while(1) {
            // Show level
            char level_str[9];
            sprintf(level_str, "Level %d ", current_level);
            print(level_str);
            nano_wait(1000000000);
            
            // Generate and show sequence
            game_state = 1;
            generate_sequence(current_level);
            show_sequence(current_level);
            
            // Get player input
            game_state = 2;
            print("Your go!");
            nano_wait(500000000);
            
            int result = get_player_sequence(current_level);
            
            if(result) {
                // Success
                print("Correct!");
                play_success_sound();
                score += current_level * 10;
                current_level++;
                
                // Decrease speed
                if(speed > 300) {
                    speed -= SPEED_DECREASE;
                }
                
                // Display score
                display_score(score);
                nano_wait(1000000000);
                
                // Check for win
                if(current_level > MAX_SEQUENCE) {
                    print("YOU WIN!");
                    
                    // Victory animation
                    for(int i = 0; i < 5; i++) {
                        set_rgb_color(100, 100, 0);  // Yellow
                        nano_wait(200000000);
                        set_rgb_color(0, 100, 0);    // Green
                        nano_wait(200000000);
                    }
                    
                    break; // Exit game loop
                }
            } else {
                // Failure
                print("WRONG!  ");
                play_failure_sound();
                
                // Game over
                game_state = 3;
                display_score(score);
                nano_wait(2000000000);
                
                print("GAME    ");
                nano_wait(500000000);
                print("OVER    ");
                nano_wait(1000000000);
                
                break; // Exit game loop
            }
        }
    }
}

/**
 * @brief Main function
 */
int main(void) {
    // Initialize all peripherals
    initialize_all_peripherals();
    init_wavetable();
    
    // Start the game
    game_main();
    
    return 0;
}
