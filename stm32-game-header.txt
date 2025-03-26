/**
 * @file game.h
 * @author Eric Raymond (edraymon)
 * @brief Header file for STM32F0 game
 * @date March 26, 2025
 */

#ifndef GAME_H
#define GAME_H

#include "stm32f0xx.h"
#include <stdint.h>

// Game state enum
typedef enum {
    GAME_MENU,
    GAME_PLAYING,
    GAME_OVER
} GameState;

// Player structure
typedef struct {
    int16_t position;
    int16_t score;
    uint8_t lives;
} Player;

// Obstacle structure
typedef struct {
    int16_t position;
    int16_t height;
    uint8_t active;
} Obstacle;

// Function prototypes
void game_init(void);
void game_handle_key(char key);
void game_update(void);
void run_game(void);

#endif /* GAME_H */
