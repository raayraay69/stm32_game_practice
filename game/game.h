/**
 * @file game.h
 * @brief Header file for the memory game
 */

#ifndef GAME_H
#define GAME_H

#include "stm32f0xx.h"

/**
 * @brief Initialize all microcontroller peripherals required for the game
 */
void initialize_all_peripherals(void);

/**
 * @brief Wait for n nanoseconds
 * 
 * @param t Time in nanoseconds
 */
void nano_wait(int t);

/**
 * @brief Configure internal 48MHz clock
 */
void internal_clock(void);

/**
 * @brief Print an 8-character string on the 7-segment display
 * 
 * @param str String to display
 */
void print(const char str[]);

/**
 * @brief Print a floating-point value
 * 
 * @param f Value to display
 */
void printfloat(float f);

/**
 * @brief Initialize the sine wave table
 */
void init_wavetable(void);

/**
 * @brief Set frequency for sound generation
 * 
 * @param chan Channel (0 or 1)
 * @param f Frequency in Hz
 */
void set_freq(int chan, float f);

/**
 * @brief Drive a keypad column
 * 
 * @param c Column (0-3)
 */
void drive_column(int c);

/**
 * @brief Read keypad rows
 * 
 * @return int Row values (bits 0-3)
 */
int read_rows(void);

/**
 * @brief Update keypad button history
 * 
 * @param c Column
 * @param rows Row values
 */
void update_history(int c, int rows);

/**
 * @brief Wait for a key event and return the key character
 * 
 * @return char Key character
 */
char get_key_event(void);

/**
 * @brief Display the current score
 * 
 * @param score Score to display
 */
void display_score(int score);

/**
 * @brief Play success sound effect
 */
void play_success_sound(void);

/**
 * @brief Play failure sound effect
 */
void play_failure_sound(void);

/**
 * @brief Play startup sound effect
 */
void play_startup_sound(void);

/**
 * @brief Set RGB LED brightness
 * 
 * @param level Brightness level (0-100)
 */
void set_led_brightness(int level);

/**
 * @brief Set RGB LED color
 * 
 * @param r Red component (0-100)
 * @param g Green component (0-100)
 * @param b Blue component (0-100)
 */
void set_rgb_color(int r, int g, int b);

/**
 * @brief Show a digit on the display with corresponding color
 * 
 * @param digit Digit to display (0-9)
 */
void show_digit(int digit);

/**
 * @brief Generate random sequence for the game
 * 
 * @param level Current game level
 */
void generate_sequence(int level);

/**
 * @brief Display the sequence to the player
 * 
 * @param level Current game level
 */
void show_sequence(int level);

/**
 * @brief Get player input for the sequence
 * 
 * @param level Current game level
 * @return int 1 if correct, 0 if incorrect
 */
int get_player_sequence(int level);

/**
 * @brief Main game logic function
 */
void game_main(void);

#endif /* GAME_H */
