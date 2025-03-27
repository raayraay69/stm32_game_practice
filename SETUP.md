# Setting Up the STM32 Game Project

This guide will help you set up your development environment for building and running the STM32 game.

## Prerequisites

Before starting, ensure you have the following:

1. An STM32F0 microcontroller board (STM32F051R8 or compatible)
2. ST-Link V2 programmer or similar
3. 8-digit 7-segment LED display
4. 4x4 keypad
5. Breadboard and jumper wires

## Software Requirements

You'll need the following software:

1. **STM32CubeIDE** or **Eclipse with GNU ARM Embedded Toolchain**
2. **ST-Link Utility** for flashing the microcontroller
3. **Git** for cloning this repository

## Directory Structure

Set up your project directory as follows:

```
stm32_game_practice/
├── inc/                    # Header files
│   ├── game.h              # Game header
│   └── stm32f0xx.h         # STM32F0 peripheral definitions
├── src/                    # Source files
│   ├── font.S              # Font definition in assembly
│   ├── game.c              # Main game implementation
│   ├── startup_stm32f0xx.S # Startup code
│   └── support.c           # Support functions
├── Makefile                # Build configuration
├── README.md               # Project information
└── STM32F051R8_FLASH.ld    # Linker script
```

## Hardware Setup

### Connecting the 7-Segment Display

Connect the 7-segment display to the STM32 as follows:

1. Segments a-g: PB0-PB7
2. Digit selection: PB8-PB11

### Connecting the Keypad

Connect the 4x4 keypad to the STM32 as follows:

1. Rows (inputs): PC0-PC3
2. Columns (outputs): PC4-PC7

## Building the Project

### Using STM32CubeIDE

1. Import the project: File → Import → Existing Projects into Workspace
2. Build the project: Project → Build Project

### Using Makefile

1. Open a terminal in the project directory
2. Run `make` to build the project
3. The binary file will be created in the `bin` directory

## Flashing the Microcontroller

### Using ST-Link Utility

1. Connect the ST-Link programmer to your PC and the STM32 board
2. Open ST-Link Utility
3. File → Open File → Select the binary file (bin/game.bin)
4. Target → Program & Verify

### Using Command Line

If you're using the Makefile:

```
make flash
```

## Debugging

### Using STM32CubeIDE

1. Run → Debug Configurations
2. Create a new debug configuration for your project
3. Run → Debug to start debugging

### Using GDB

1. Connect the ST-Link to your PC and the STM32 board
2. Run in terminal:
   ```
   arm-none-eabi-gdb bin/game.elf
   (gdb) target remote localhost:3333
   (gdb) monitor reset halt
   (gdb) load
   (gdb) continue
   ```

## Troubleshooting

### Common Issues

1. **No power to the board**: Check USB connection and power LED
2. **Cannot flash the board**: Verify connections to SWDIO and SWCLK pins
3. **Game not responding**: Check keypad and display connections
4. **Build errors**: Ensure all files are in correct directories
5. **Compilation errors**: Verify that you have the correct toolchain installed

### Getting Help

If you encounter any issues, please:
1. Check the official STM32F0 documentation
2. See the README file for more information
3. Create an issue in the GitHub repository

Happy coding!
