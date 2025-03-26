# STM32 Game Practice

A simple obstacle-dodging game for STM32F0 microcontrollers. This project demonstrates the basic features of STM32 microcontrollers, including GPIO, timers, interrupts, and DMA.

## Overview

This game uses a 7-segment display to show a simple side-scrolling game where the player must dodge obstacles. The player is represented by the letter 'P' and obstacles are represented by the letter 'O'.

### Game Features

- Simple menu system
- Player movement with keypad
- Randomly generated obstacles
- Score tracking
- Increasing difficulty over time
- Game over screen with final score

## Hardware Requirements

- STM32F0 microcontroller (STM32F051R8 or similar)
- 8-digit 7-segment LED display
- 4x4 keypad
- Breadboard and jumper wires

## Pin Connections

### 7-Segment Display
- Segments (a-g): PB0-PB7
- Digit selection: PB8-PB11

### Keypad
- Rows: PC0-PC3 (inputs with pull-up)
- Columns: PC4-PC7 (outputs, open-drain)

## How to Play

1. Power on the device
2. Press any key to start the game
3. Use key '4' to move left and '6' to move right
4. Avoid obstacles that appear from the right side
5. Your score increases for each obstacle you avoid
6. Game ends when you lose all lives
7. Press any key after game over to return to the menu

## Building the Project

### Prerequisites
- STM32CubeIDE or similar development environment
- ARM GCC toolchain
- ST-Link programmer

### Compilation
1. Import the project into STM32CubeIDE
2. Build the project using the IDE's build tools
3. Flash the compiled binary to your STM32 device

## Code Structure

- `game.c`: Main game logic and implementation
- `game.h`: Header file with type definitions and function prototypes
- Supporting files from the STM32 standard peripheral library

## Future Improvements

- Add sound effects
- Implement more complex obstacles
- Add power-ups and special abilities
- Save high scores
- Improve graphics with an actual LCD display

## License

This project is open-source and available under the MIT License.

## Acknowledgments

- Based on code examples from ECE 362 labs
- Developed by Eric Raymond (edraymon)
