/**
 * @file game.c
 * @author Eric Raymond (edraymon)
 * @brief A simple game for STM32F0 microcontroller
 * @date March 26, 2025
 */

#include "stm32f0xx.h"
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

// Global variables for game state
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

// Game globals
GameState gameState = GAME_MENU;
Player player;
Obstacle obstacles[5];
uint32_t gameTime = 0;
uint32_t obstacleTimer = 0;
uint8_t difficulty = 1;

// 7-segment display messages
uint16_t msg[8] = { 0x0000,0x0100,0x0200,0x0300,0x0400,0x0500,0x0600,0x0700 };
extern const char font[];

// Function prototypes
void enable_ports(void);
void setup_dma(void);
void enable_dma(void);
void init_tim15(void);
void init_tim7(void);
char get_keypress(void);
void nano_wait(unsigned int);

/**
 * @brief Initialize the game state
 */
void game_init(void) {
    // Initialize player
    player.position = 0;
    player.score = 0;
    player.lives = 3;
    
    // Initialize obstacles
    for (int i = 0; i < 5; i++) {
        obstacles[i].active = 0;
    }
    
    gameState = GAME_MENU;
    gameTime = 0;
    obstacleTimer = 0;
}

/**
 * @brief Generate a new obstacle
 */
void spawn_obstacle(void) {
    // Find an inactive obstacle
    for (int i = 0; i < 5; i++) {
        if (!obstacles[i].active) {
            obstacles[i].position = 7; // Start from the rightmost position
            obstacles[i].height = 1 + (rand() % 3); // Random height 1-3
            obstacles[i].active = 1;
            return;
        }
    }
}

/**
 * @brief Update obstacle positions
 */
void update_obstacles(void) {
    for (int i = 0; i < 5; i++) {
        if (obstacles[i].active) {
            obstacles[i].position--;
            
            // Remove obstacle if it goes off screen
            if (obstacles[i].position < 0) {
                obstacles[i].active = 0;
                player.score++;
            }
            
            // Check for collision with player
            if (obstacles[i].position == player.position) {
                player.lives--;
                obstacles[i].active = 0;
                
                if (player.lives <= 0) {
                    gameState = GAME_OVER;
                }
            }
        }
    }
}

/**
 * @brief Display the game on the 7-segment display
 */
void display_game(void) {
    // Clear display
    for (int i = 0; i < 8; i++) {
        msg[i] = i << 8;
    }
    
    // Display player
    if (gameState == GAME_PLAYING) {
        msg[player.position] |= font['P'];
        
        // Display obstacles
        for (int i = 0; i < 5; i++) {
            if (obstacles[i].active) {
                msg[obstacles[i].position] |= font['O'];
            }
        }
    } else if (gameState == GAME_MENU) {
        // Display "PLAY"
        msg[0] |= font['P'];
        msg[1] |= font['L'];
        msg[2] |= font['A'];
        msg[3] |= font['Y'];
    } else if (gameState == GAME_OVER) {
        // Display "OVER"
        msg[0] |= font['O'];
        msg[1] |= font['V'];
        msg[2] |= font['E'];
        msg[3] |= font['R'];
        
        // Display score
        char score_str[5];
        sprintf(score_str, "%4d", player.score);
        for (int i = 0; i < 4; i++) {
            msg[i+4] |= font[score_str[i]];
        }
    }
}

/**
 * @brief Respond to keypad input
 * @param key The key pressed
 */
void game_handle_key(char key) {
    switch (gameState) {
        case GAME_MENU:
            // Any key starts the game
            if (key) {
                gameState = GAME_PLAYING;
                game_init();
            }
            break;
            
        case GAME_PLAYING:
            // Move player left or right
            if (key == '4' && player.position > 0) {
                player.position--;
            } else if (key == '6' && player.position < 7) {
                player.position++;
            }
            // Jump (to be implemented)
            break;
            
        case GAME_OVER:
            // Any key goes back to menu
            if (key) {
                gameState = GAME_MENU;
            }
            break;
    }
}

/**
 * @brief Update game state (called periodically)
 */
void game_update(void) {
    gameTime++;
    
    if (gameState == GAME_PLAYING) {
        // Spawn obstacles periodically
        obstacleTimer++;
        if (obstacleTimer >= 20 / difficulty) {
            spawn_obstacle();
            obstacleTimer = 0;
        }
        
        // Update obstacle positions
        update_obstacles();
        
        // Increase difficulty over time
        if (gameTime % 100 == 0 && difficulty < 5) {
            difficulty++;
        }
    }
    
    // Update display
    display_game();
}

/**
 * @brief Main game loop
 */
void run_game(void) {
    game_init();
    
    // Main game loop
    for (;;) {
        // Get key input
        char key = get_keypress();
        if (key) {
            game_handle_key(key);
        }
        
        // Update game state
        game_update();
        
        // Add a small delay
        nano_wait(100000000); // 100 ms
        
        // Exit condition (optional)
        if (gameState == GAME_OVER && player.score > 100) {
            break;
        }
    }
}

/**
 * @brief Main function
 */
int main(void) {
    // Initialize hardware
    enable_ports();
    setup_dma();
    enable_dma();
    init_tim15();
    init_tim7();
    
    // Show startup message
    msg[0] |= font['G'];
    msg[1] |= font['A'];
    msg[2] |= font['M'];
    msg[3] |= font['E'];
    msg[4] |= font[' '];
    msg[5] |= font['O'];
    msg[6] |= font['N'];
    msg[7] |= font['!'];
    
    // Wait a bit before starting
    nano_wait(1000000000); // 1 second
    
    // Run the game
    run_game();
    
    // Loop forever if we exit the game
    for(;;) {
        asm("wfi");
    }
}
