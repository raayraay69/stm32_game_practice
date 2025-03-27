# STM32 Memory Game for Lab Practical Study

This project implements a memory/reaction game on the STM32F0 microcontroller to help you practice and understand the core concepts for the lab practical exam.

## Game Description

The game is a memory challenge where:
1. A sequence of digits is displayed on the 7-segment display with corresponding colors on the RGB LED
2. You must repeat the sequence correctly using the keypad
3. Each level adds one more digit to the sequence and increases your score
4. The game gets progressively faster as you advance through levels

## Controls
- Press `#` on the keypad to start a new game
- Use number keys `1-9` to input your sequence

## How This Game Helps You Study

This game incorporates ALL of the key peripherals and configurations that will be tested on your lab practical:

### 1. GPIO Configuration
- **Digital Output Mode**: Controls the 7-segment display segments (GPIOB 0-7) and digits (GPIOB 8-11)
- **Input Mode with Pull-up**: Reads the keypad rows (GPIOC 0-3)
- **Open-Drain Output Mode**: Drives the keypad columns (GPIOC 4-7)
- **Alternate Function Mode**: For the RGB LED using PWM (PA8-10)
- **Analog Mode**: For ADC input (PA1) and DAC output (PA4)

### 2. Timers & PWM
- **TIM15 Configuration**: Powers the 7-segment display multiplexing via DMA
- **TIM7 Configuration**: Handles keypad scanning with interrupts
- **TIM6 Configuration**: Controls DAC updates for audio generation
- **TIM1 Configuration**: Generates PWM signals for RGB LED brightness/color control
- **Timer Prescalers and Auto-reload calculations**: Various timers use different frequencies (1kHz for display, 20kHz for audio)

### 3. DMA
- **Memory-to-Peripheral Transfer**: Used to transfer display data to GPIO
- **Circular Mode**: Allows continuous display updates
- **Memory & Peripheral Data Size**: Configured for 16-bit transfers
- **Channel Selection**: Appropriate channel for TIM15 updates

### 4. ADC
- **Pin Configuration**: Set PA1 as analog input
- **Channel Selection**: Configure ADC to read from channel 1
- **Sampling Rate**: Controls how often volume input is sampled
- **Data Processing**: Simple boxcar averaging of values

### 5. DAC
- **Audio Output**: Configured to output to PA4
- **Wavetable Synthesis**: Uses sine wave lookup table for sound generation
- **Timer Triggering**: TIM6 triggers DAC updates at audio rate (20kHz)

### 6. Interrupts
- **Timer Interrupts**: Multiple timer interrupts for different functions
- **Interrupt Priorities**: Shows how to prioritize different interrupt handlers
- **ISR Implementation**: Properly implemented handlers that clear flags

### 7. Debugging Techniques
- **Strategic Breakpoints**: You can set breakpoints to see register values change
- **Peripheral View**: Practice using the peripheral viewer to check register values
- **Sequence Flow**: Understand the entire flow from initialization to execution

## Key Learning Points for Lab Practical

### GPIO Setup Procedure:
```c
// Enable clock
RCC->AHBENR |= RCC_AHBENR_GPIOxEN;

// Configure mode (input, output, alternate, analog)
GPIOx->MODER &= ~(mask); // Clear bits
GPIOx->MODER |= (mode);  // Set mode

// Configure additional properties if needed
// (pull-up/down, output type, speed)
```

### Timer Setup Procedure:
```c
// Enable clock
RCC->APB1ENR |= RCC_APB1ENR_TIMxEN;

// Configure prescaler and reload value
TIMx->PSC = psc - 1;  // Divide clock by psc
TIMx->ARR = arr - 1;  // Reload after arr counts

// Enable interrupts if needed
TIMx->DIER |= TIM_DIER_UIE;  // Update interrupt
NVIC_EnableIRQ(TIMx_IRQn);   // Enable in NVIC

// Start timer
TIMx->CR1 |= TIM_CR1_CEN;
```

### DMA Setup Procedure:
```c
// Enable clock
RCC->AHBENR |= RCC_AHBENR_DMAEN;

// Configure channel
DMA1_Channelx->CCR &= ~DMA_CCR_EN;  // Disable during setup
DMA1_Channelx->CPAR = (uint32_t)peripheral_addr;
DMA1_Channelx->CMAR = (uint32_t)memory_addr;
DMA1_Channelx->CNDTR = count;
DMA1_Channelx->CCR |= DMA_CCR_DIR | DMA_CCR_MINC | DMA_CCR_CIRC | etc;

// Enable
DMA1_Channelx->CCR |= DMA_CCR_EN;
```

### ADC Setup Procedure:
```c
// Enable clock and configure pin
RCC->APB2ENR |= RCC_APB2ENR_ADC1EN;
GPIOx->MODER |= (3 << pin*2);  // Analog mode

// Enable HSI14 for ADC
RCC->CR2 |= RCC_CR2_HSI14ON;
while(!(RCC->CR2 & RCC_CR2_HSI14RDY));

// Configure ADC
ADC1->CR |= ADC_CR_ADEN;
while(!(ADC1->ISR & ADC_ISR_ADRDY));

// Select channel
ADC1->CHSELR = ADC_CHSELR_CHSELx;
while(!(ADC1->ISR & ADC_ISR_ADRDY));

// Start conversion (in ISR or main loop)
ADC1->CR |= ADC_CR_ADSTART;
```

### DAC Setup Procedure:
```c
// Enable clock and configure pin
RCC->APB1ENR |= RCC_APB1ENR_DACEN;
GPIOx->MODER |= (3 << pin*2);  // Analog mode

// Configure DAC
DAC->CR |= DAC_CR_EN1;  // Enable channel 1

// Write to DAC
DAC->DHR12R1 = value;   // 12-bit right-aligned value
```

## Testing Your Knowledge

While working with this game code:

1. Try to trace the initialization sequence and understand why each peripheral is configured in that specific way
2. Identify each register being modified and what bits are changing
3. Use the debugger to set breakpoints and watch how register values change
4. Modify the game to add new features:
   - Add a difficulty level selector
   - Implement a high score system
   - Add a timed mode where sequences must be entered quickly
   - Create different sound effects

These exercises will help you practice the exact skills needed for the lab practical where you'll need to configure peripherals by reading reference material and writing the appropriate code.

## Building and Running

To build the game:
```
make
```

To flash to your STM32 board (using st-flash):
```
st-flash write memory_game.bin 0x8000000
```

## References

For the lab practical, remember to refer to:
- STM32F091xBC Datasheet
- RM0091 Reference Manual
- Lab manuals for detailed peripheral explanations 

Good luck with your lab practical!
