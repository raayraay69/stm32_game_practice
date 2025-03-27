TARGET = memory_game

# Define the linker script location
LINKER_SCRIPT = ../STM32F051R8_FLASH.ld

# Define the compiler and tools
CC = arm-none-eabi-gcc
LD = arm-none-eabi-gcc
AS = arm-none-eabi-as
OBJCOPY = arm-none-eabi-objcopy
SIZE = arm-none-eabi-size

# Define paths
DEVICE_DIR = STM32F0xx_StdPeriph_Lib/Libraries/CMSIS/Device/ST/STM32F0xx
CMSIS_DIR = STM32F0xx_StdPeriph_Lib/Libraries/CMSIS

# Define compiler flags
CFLAGS = -mcpu=cortex-m0 -mthumb -Wall -g -O0
CFLAGS += -I. -I$(DEVICE_DIR)/Include -I$(CMSIS_DIR)/Include
CFLAGS += -DSTM32F051x8 -D__STARTUP_CLEAR_BSS

# Define linker flags
LDFLAGS = -mcpu=cortex-m0 -mthumb -Wall --specs=nosys.specs -T$(LINKER_SCRIPT)

# Define source files
SOURCES = main.c \
          system_stm32f0xx.c \
          support.c \
          font.S

# Define object files
OBJECTS = $(SOURCES:.c=.o)
OBJECTS := $(OBJECTS:.S=.o)

# Build all
all: $(TARGET).elf $(TARGET).bin $(TARGET).hex size

%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

%.o: %.S
	$(AS) -mcpu=cortex-m0 -mthumb -g $< -o $@

$(TARGET).elf: $(OBJECTS)
	$(LD) $(LDFLAGS) $(OBJECTS) -o $@

$(TARGET).bin: $(TARGET).elf
	$(OBJCOPY) -O binary $< $@

$(TARGET).hex: $(TARGET).elf
	$(OBJCOPY) -O ihex $< $@

size: $(TARGET).elf
	$(SIZE) $<

# Clean
clean:
	rm -f $(OBJECTS) $(TARGET).elf $(TARGET).bin $(TARGET).hex

.PHONY: all clean size
