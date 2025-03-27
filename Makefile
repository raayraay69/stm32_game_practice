# STM32F0 Game Makefile

# Define the microcontroller
MCU = cortex-m0
DEVICE = STM32F051R8Tx

# Define toolchain
CC = arm-none-eabi-gcc
AS = arm-none-eabi-as
LD = arm-none-eabi-ld
OC = arm-none-eabi-objcopy
OD = arm-none-eabi-objdump
SIZE = arm-none-eabi-size

# Directory structure
SRCDIR = src
INCDIR = inc
OBJDIR = obj
BINDIR = bin

# Source files
SRCS = $(wildcard $(SRCDIR)/*.c)
ASRCS = $(wildcard $(SRCDIR)/*.s)
OBJS = $(patsubst $(SRCDIR)/%.c,$(OBJDIR)/%.o,$(SRCS)) \
       $(patsubst $(SRCDIR)/%.s,$(OBJDIR)/%.o,$(ASRCS))

# Include paths
INCLUDES = -I$(INCDIR) \
           -I../STM32F0xx_StdPeriph_Lib/Libraries/CMSIS/Device/ST/STM32F0xx/Include \
           -I../STM32F0xx_StdPeriph_Lib/Libraries/CMSIS/Include \
           -I../STM32F0xx_StdPeriph_Lib/Libraries/STM32F0xx_StdPeriph_Driver/inc

# Compiler flags
CFLAGS = -mcpu=$(MCU) -mthumb -Wall -g -O2 $(INCLUDES) -DSTM32F051x8
ASFLAGS = -mcpu=$(MCU) -mthumb -g
LDFLAGS = -mcpu=$(MCU) -mthumb -g --specs=nano.specs -T$(INCDIR)/STM32F051R8_FLASH.ld

# Target name
TARGET = $(BINDIR)/game

# Default target
all: directories $(TARGET).bin size

# Create directories
directories:
	mkdir -p $(OBJDIR) $(BINDIR)

# Compile C files
$(OBJDIR)/%.o: $(SRCDIR)/%.c
	$(CC) $(CFLAGS) -c $< -o $@

# Assemble assembly files
$(OBJDIR)/%.o: $(SRCDIR)/%.s
	$(AS) $(ASFLAGS) -c $< -o $@

# Link
$(TARGET).elf: $(OBJS)
	$(CC) $(LDFLAGS) $(OBJS) -o $@

# Create binary file
$(TARGET).bin: $(TARGET).elf
	$(OC) -O binary $< $@

# Display size information
size: $(TARGET).elf
	$(SIZE) $<

# Generate assembly listing
list: $(TARGET).elf
	$(OD) -D $< > $(TARGET).lst

# Clean
clean:
	rm -rf $(OBJDIR) $(BINDIR)

# Flash the device using ST-Link utility
flash: $(TARGET).bin
	st-flash write $< 0x8000000

.PHONY: all directories clean flash size list
