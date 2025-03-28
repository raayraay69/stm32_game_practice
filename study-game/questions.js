export const questions = [
    {
        topic: "RCC",
        question: "Which register must be modified to enable the clock for the GPIOB peripheral?",
        resources: [
            "The RCC_AHBENR register controls the clock gating for peripherals connected to the AHB bus. This register has individual bits that enable or disable the clock for each AHB peripheral, including the GPIO ports.",
            "•",
            "Specifically, bit 18 of the RCC_AHBENR register (IOPBEN) is the I/O port B clock enable bit. To enable the clock for GPIOB, you need to set this bit to '1'.",
            "•",
            "Similarly, bit 17 (IOPAEN) enables the clock for Port A, and bit 19 (IOPCEN) enables the clock for Port C. Ports D, E, and F also have corresponding enable bits in the RCC_AHBENR.",
            "•",
            "It's crucial to understand that by default, every subsystem in a microcontroller, including GPIO, is disabled to reduce power consumption. Therefore, before you can configure or use any GPIO port, you must first enable its clock by setting the corresponding bit in the RCC_AHBENR register.",
            "•",
            "The sources also caution that when modifying the RCC_AHBENR, you should use bitwise OR operations (|=) to set specific bits without affecting the status of other important bits, such as the SRAM enable bit (SRAMEN). Directly writing a value to the entire register could unintentionally disable other essential peripherals' clocks. An example of correctly enabling the clock for GPIOC is given as RCC->AHBENR |= RCC_AHBENR_GPIOCEN;. This uses the symbolic constant for the GPIOC enable bit, which corresponds to setting bit 19.",
            "In summary, enabling the clock for GPIOB is a fundamental first step in configuring and using the pins of Port B for input or output operations, and this is achieved by setting the IOPBEN bit (bit 18) in the RCC_AHBENR register.",
            // "<b>RCC AHBENR Register:</b> Controls clocks for AHB bus peripherals.",
            // "Bit 17: <code>IOPAEN</code> - I/O port A clock enable",
            // "Bit 18: <code>IOPBEN</code> - I/O port B clock enable",
            // "Bit 19: <code>IOPCEN</code> - I/O port C clock enable",
            // "To enable a clock, write '1' to the corresponding bit."
        ],
        options: [
            "RCC->APB1ENR",
            "RCC->AHBENR",
            "RCC->APB2ENR",
            "RCC->CR"
        ],
        correctIndex: 1,
        explanation: "The GPIO ports (A, B, C...) are connected to the AHB bus. Their clocks are enabled via the RCC_AHBENR register.",
        simulation: {
            type: "register-view",
            register: "RCC_AHBENR",
            bitHighlight: 18,
            value: "0x00040000"
        }
    },
    {
        topic: "GPIO",
        question: "What value should be written to the 2-bit field in the GPIOC->MODER register to configure pin PC6 for 'Alternate function mode'?",
        resources: [
            "<b>GPIOx MODER Register:</b> Each pin 'y' is configured by bits 2y+1 and 2y.",
            "Values: <code>00</code>: Input mode, <code>01</code>: General purpose output mode",
            "<code>10</code>: Alternate function mode, <code>11</code>: Analog mode"
        ],
        options: [
            "00",
            "01",
            "10",
            "11"
        ],
        correctIndex: 2,
        explanation: "The value '10' sets a GPIO pin to Alternate Function mode, allowing it to be used by peripherals like Timers or SPI.",
        simulation: {
            type: "pin-config",
            pin: "PC6",
            mode: "alternate-function",
            register: "GPIOC_MODER",
            bitField: "13:12",
            value: "0x00001000"
        }
    },
    {
        topic: "GPIO",
        question: "Which C code snippet correctly enables the clock for GPIOC and sets PC4 and PC5 to general purpose output mode?",
        resources: [
            "<b>RCC AHBENR Register:</b> Bit 19: <code>IOPCEN</code>",
            "<b>GPIOC MODER Register:</b> Bits 8-9 for PC4, Bits 10-11 for PC5.",
            "Output mode value: <code>01</code>.",
            "Use bitwise OR (<code>|=</code>) to set bits without affecting others.",
            "Example clearing PC4: <code>GPIOC.MODER &= ~(0x3 << (4*2));</code>",
             "Example setting PC4 to output: <code>GPIOC.MODER |= (0x1 << (4*2));</code>"
        ],
        options: [
            "<code>RCC->AHBENR |= RCC_AHBENR_GPIOCEN; GPIOC->MODER |= 0x5 << 8;</code>", // Incorrect logic/masking
            "<code>RCC->APB1ENR |= RCC_APB1ENR_IOPCEN; GPIOC->MODER = 0x00000500;</code>", // Incorrect RCC reg, direct assignment bad
            "<code>RCC->AHBENR |= RCC_AHBENR_GPIOCEN; GPIOC->MODER &= ~(0xf << 8); GPIOC->MODER |= (0x5 << 8);</code>", // Correct
            "<code>RCC->AHBENR &= ~RCC_AHBENR_GPIOCEN; GPIOC->MODER |= (0xa << 8);</code>" // Disables clock, wrong mode value
        ],
        correctIndex: 2,
        explanation: "Enable clock via RCC_AHBENR. Clear the MODER bits for PC4 & PC5 using <code>&= ~</code> and a mask (0xf covering bits 8-11). Then, set the bits for output mode (01 for PC4, 01 for PC5, combined is 0101 binary or 0x5) using <code>|=</code>.",
        simulation: {
            type: "bit-manipulation",
            steps: [
                { register: "RCC_AHBENR", operation: "set", bits: "19", value: "0x00080000", description: "Enable GPIOC clock" },
                { register: "GPIOC_MODER", operation: "clear", bits: "11:8", mask: "0x00000F00", description: "Clear mode bits for PC4-PC5" },
                { register: "GPIOC_MODER", operation: "set", bits: "11:8", value: "0x00000500", description: "Set PC4-PC5 to output mode (01)" }
            ]
        }
    },
     {
        topic: "Timers",
        question: "You need a 1 Hz PWM frequency using TIM3. The system clock is 48 MHz. If you set TIM3->PSC = 47999, what value should TIM3->ARR be?",
        resources: [
            "Timer Clock Frequency = System Clock / (PSC + 1)",
            "PWM Frequency = Timer Clock Frequency / (ARR + 1)",
            "System Clock = 48,000,000 Hz"
        ],
        options: ["999", "1000", "47999", "48000"],
        correctIndex: 0,
        explanation: "Timer Clock = 48MHz / (47999 + 1) = 48MHz / 48000 = 1000 Hz (1 kHz). To get 1 Hz PWM: 1 Hz = 1000 Hz / (ARR + 1). So, ARR + 1 = 1000. ARR = 999.",
        simulation: { type: "timer-calculation", systemClock: 48000000, psc: 47999, targetFrequency: 1, formula: "ARR = (SystemClock / (PSC+1) / TargetFreq) - 1" }
    },
     {
        topic: "Timers/PWM",
        question: "To generate PWM output on a timer channel (e.g., TIM3_CH1 on PC6), which register must be configured to select 'PWM mode'?",
        resources: [
            "<b>TIMx CR1:</b> Main control register (CEN bit enables timer).",
            "<b>TIMx CCER:</b> Capture/Compare Enable Register (CCxE bits enable channel output).",
            "<b>TIMx CCMRx:</b> Capture/Compare Mode Register (OCxM bits select output mode).",
            "<b>TIMx CCRx:</b> Capture/Compare Register (determines duty cycle).",
            "PWM Mode 1 is typically <code>110</code> for OCxM bits."
        ],
        options: ["TIMx->CR1", "TIMx->CCER", "TIMx->CCMRx (e.g., CCMR1 for CH1/CH2)", "TIMx->ARR"],
        correctIndex: 2,
        explanation: "The Capture/Compare Mode Register (CCMRx) contains the Output Compare Mode (OCxM) bits, which are set to configure a channel for PWM operation.",
        simulation: { type: "timer-pwm-setup", channel: 1, register: "TIM3_CCMR1", bits: "6:4", value: "0x00000060" }
    },
    {
        topic: "ADC",
        question: "Before enabling the ADC using the ADEN bit in ADC_CR, what clock source often needs to be enabled and stabilized specifically for the ADC on STM32F0 series?",
        resources: [
            "<b>RCC APB2ENR Register:</b> Bit 9: <code>ADC1EN</code> - ADC clock enable.",
            "<b>RCC CR2 Register:</b> Bit 14: <code>HSI14ON</code> - 14 MHz internal RC oscillator ON.",
             "Bit 15: <code>HSI14RDY</code> - 14 MHz internal RC oscillator ready flag.",
            "The STM32F0 ADC requires the HSI14 clock."
        ],
        options: ["The main PLL", "The LSI oscillator", "The HSI14 oscillator", "The HSE oscillator"],
        correctIndex: 2,
        explanation: "The STM32F0 series ADC relies on the dedicated 14 MHz High-Speed Internal oscillator (HSI14). You must enable it (HSI14ON) and wait for it to be ready (HSI14RDY) before enabling the ADC itself.",
        simulation: {
            type: "adc-clock-setup",
            steps: [
                { register: "RCC_CR2", operation: "set", bits: "14", value: "0x00004000", description: "Enable HSI14 clock" },
                { register: "RCC_CR2", operation: "wait", bits: "15", mask: "0x00008000", description: "Wait for HSI14RDY flag" }
            ]
        }
    },
     {
        topic: "ADC",
        question: "Which ADC register is read to get the result of a completed conversion?",
        resources: [
            "<b>ADC CR (Control Register):</b> Contains <code>ADSTART</code> (start conversion) and <code>ADEN</code> (ADC enable).",
            "<b>ADC ISR (Interrupt and Status Register):</b> Contains <code>EOC</code> (End Of Conversion flag).",
            "<b>ADC DR (Data Register):</b> Holds the converted digital value.",
            "ADC CHSELR (Channel Selection Register):</b> Selects input channel(s)."
        ],
        options: ["ADC->CR", "ADC->ISR", "ADC->DR", "ADC->CHSELR"],
        correctIndex: 2,
        explanation: "The ADC Data Register (ADC->DR) holds the digital result once a conversion is complete.",
        simulation: {
            type: "adc-conversion",
            steps: [
                { register: "ADC_CR", operation: "set", bits: "2", value: "0x00000004", description: "Start conversion (ADSTART)" },
                { register: "ADC_ISR", operation: "wait", bits: "2", mask: "0x00000004", description: "Wait for EOC flag" },
                { register: "ADC_DR", operation: "read", value: "0x00000800", description: "Read conversion result (2048)" }
            ]
        }
    },
     {
        topic: "DAC",
        question: "To output an analog voltage using DAC channel 1 (typically PA4), which register do you write the digital value to?",
        resources: [
            "<b>DAC CR (Control Register):</b> Contains <code>EN1</code> (Channel 1 Enable).",
            "<b>DAC DHR12R1 (Channel 1 12-bit Right-aligned Data Holding Register):</b> Holds value for CH1.",
            "<b>DAC DOR1 (Channel 1 Data Output Register):</b> Read-only, shows current output value.",
            "GPIOx MODER:</b> Must set PA4 to Analog mode (<code>11</code>)."
        ],
        options: ["DAC->CR", "DAC->DHR12R1", "DAC->DOR1", "GPIOA->ODR"],
        correctIndex: 1,
        explanation: "The digital value (0-4095 for 12-bit) to be converted to an analog voltage by DAC Channel 1 is written to the Data Holding Register DHR12R1.",
        simulation: {
            type: "dac-output", register: "DAC_DHR12R1", value: "0x00000800", output: "1.65V",
            steps: [
                { description: "PA4 configured as analog (GPIOA->MODER bits 9:8 = 11)" },
                { description: "DAC clock enabled (RCC->APB1ENR bit DAC1EN set)" },
                { description: "DAC Channel 1 enabled (DAC->CR bit EN1 set)" },
                { register: "DAC_DHR12R1", operation: "write", value: "0x00000800", description: "Write value to DHR12R1" }
            ]
        }
    },
     {
        topic: "DMA",
        question: "When configuring DMA to transfer data from memory (e.g., an array) to a peripheral (e.g., GPIOB->ODR), what should the 'Direction' bit (DIR in DMA_CCR) be set to?",
        resources: [
            "<b>DMA_CCR Register (Channel Configuration Register):</b>",
            "Bit 4: <code>DIR</code> - Data transfer direction.",
            "<code>0</code>: Read from peripheral (Peripheral-to-Memory)",
            "<code>1</code>: Read from memory (Memory-to-Peripheral)",
            "Bit 5: <code>CIRC</code> - Circular mode",
            "Bit 7: <code>MINC</code> - Memory increment mode"
        ],
        options: ["0 (Read from peripheral)", "1 (Read from memory)"],
        correctIndex: 1,
        explanation: "For Memory-to-Peripheral transfers (like sending data from RAM to GPIO), the DIR bit must be set to 1.",
        simulation: { type: "dma-config", register: "DMA_CCR", bits: "4", value: "0x00000010", description: "Memory to Peripheral direction bit" }
    },
     {
        topic: "DMA",
        question: "You are setting up DMA (e.g., Channel 5) to transfer 8 half-words (16-bit values) from the `msg` array to `GPIOB->ODR`. What value should `DMA1_Channel5->CNDTR` be initialized to?",
        resources: [
            "You are correct that when setting up DMA Channel 5 to transfer 8 half-words (16-bit values) from the msg array to GPIOB->ODR, the DMA1_Channel5->CNDTR register should be initialized to 8.",
            "Here's a more detailed explanation based on the sources:",
            "•",
            "The DMA_CNDTR Register (Channel Number of Data To Transfer Register) specifies the total number of data units to be transferred. It's important to understand that this register counts the number of items, not the size of each item in bytes or bits.",
            "•",
            "In your scenario, you want to transfer 8 half-words from the msg array. Therefore, the number of data units to be transferred is 8.",
            "•",
            "The counter in the DMA_CNDTR register will decrement after each transfer. The DMA transfer will stop when this counter reaches 0, unless the DMA channel is configured for circular mode.",
            "•",
             "Specifies the total number of data units to be transferred.",
             "The counter decrements after each transfer.",
             "Transfer stops when it reaches 0 (unless in circular mode)."
        ],
        options: ["1", "8", "16", "Depends on the peripheral data register size"],
        correctIndex: 1,
        explanation: "CNDTR specifies the *number* of data units (as defined by PSIZE/MSIZE) to transfer. If you're transferring 8 items from the `msg` array, CNDTR should be 8.",
        simulation: {
            type: "dma-transfer", register: "DMA1_Channel5_CNDTR", value: "0x00000008",
            transfer: { source: "msg[8]", destination: "GPIOB->ODR", count: 8, dataSize: "16-bit" }
        }
    },
    {
        topic: "SPI",
        question: "Before configuring SPI settings like baud rate (BR bits) or data size (DS bits) in SPIx_CR1/CR2, what must be done?",
        resources: [
            "<b>SPI_CR1 Register:</b> Bit 6: <code>SPE</code> - SPI Enable.",
             "Configuration bits (like BR, CPOL, CPHA, MSTR) are in CR1.",
             "Data size (DS) bits are in CR2.",
             "<b>Reference Manual Note:</b> The SPI must be disabled (SPE=0) before changing most configuration bits."
        ],
        options: ["Enable the SPI peripheral (set SPE=1)", "Disable the SPI peripheral (clear SPE=0)", "Enable the relevant DMA channel", "Set the NSSP bit in CR2"],
        correctIndex: 1,
        explanation: "It's crucial to disable the SPI peripheral by clearing the SPE bit in SPI_CR1 *before* changing configuration parameters like baud rate, clock polarity/phase, master/slave mode, or data size.",
        simulation: {
            type: "spi-config",
            steps: [
                { register: "SPI1_CR1", operation: "clear", bits: "6", mask: "0x00000040", value: "0x00000000", description: "Disable SPI (SPE=0)" },
                { register: "SPI1_CR1", operation: "set", bits: "5:3", value: "0x00000018", description: "Configure BR bits for baud rate" },
                { register: "SPI1_CR2", operation: "set", bits: "11:8", value: "0x00000700", description: "Set DS bits for 8-bit data size" },
                { register: "SPI1_CR1", operation: "set", bits: "6", value: "0x00000040", description: "Enable SPI (SPE=1)" }
            ]
        }
    },
    {
        topic: "SPI",
        question: "You want to configure SPI1 for Master mode, 8-bit data size, and enable DMA requests for the transmitter. Which register primarily holds the Master mode (MSTR) and SPI enable (SPE) bits?",
        resources: [
            "<b>SPI_CR1 Register:</b> Contains MSTR, BR, SPE, CPOL, CPHA bits.",
            "<b>SPI_CR2 Register:</b> Contains DS (Data Size), SSOE, NSSP, TXDMAEN (TX DMA Enable), RXDMAEN bits.",
             "MSTR=1 for Master mode. DS bits set for 8-bit. TXDMAEN=1 to enable DMA requests on TX empty."
        ],
        options: ["SPI1->CR1", "SPI1->CR2", "SPI1->SR (Status Register)", "DMA1_Channel3->CCR"],
        correctIndex: 0,
        explanation: "SPI_CR1 contains the main control bits, including MSTR (Master/Slave Selection) and SPE (SPI Enable).",
        simulation: {
            type: "register-view", register: "SPI1_CR1",
            bitFields: [
                { bits: "6", name: "SPE", description: "SPI Enable" },
                { bits: "2", name: "MSTR", description: "Master Selection" },
                { bits: "5:3", name: "BR", description: "Baud Rate Control" }
            ],
            value: "0x00000344" // SPE=1, MSTR=1, BR=010
        }
    },
     {
        topic: "Interrupts",
        question: "After enabling an interrupt in a peripheral (e.g., setting UIE in TIM7_DIER) and configuring EXTI/SYSCFG if needed, what must be done to allow the CPU to respond to that interrupt?",
        resources: [
            "<b>Peripheral Interrupt Enable:</b> e.g., TIM_DIER_UIE.",
            "<b>NVIC (Nested Vectored Interrupt Controller):</b> Manages interrupt priorities and enables/disables interrupts CPU-side.",
            "<b>NVIC_EnableIRQ(IRQn_Type IRQn):</b> Function to enable a specific interrupt line in the NVIC.",
             "<b>NVIC_SetPriority(IRQn_Type IRQn, uint32_t priority):</b> Sets interrupt priority."
        ],
        options: ["Set the global interrupt enable bit in the CPU's status register", "Call the corresponding Interrupt Service Routine (ISR) function manually", "Enable the corresponding interrupt line in the NVIC using `NVIC_EnableIRQ()`", "Clear the interrupt pending flag in the peripheral"],
        correctIndex: 2,
        explanation: "Even if a peripheral generates an interrupt request, the CPU won't process it unless that specific interrupt line is enabled in the NVIC (Nested Vectored Interrupt Controller) using functions like `NVIC_EnableIRQ()`.",
        simulation: {
            type: "interrupt-setup",
            steps: [
                { register: "TIM7_DIER", operation: "set", bits: "0", value: "0x00000001", description: "Enable Update Interrupt (UIE)" },
                { function: "NVIC_EnableIRQ(TIM7_IRQn)", register: "NVIC_ISER0", operation: "set", bits: "18", value: "0x00040000", description: "Enable TIM7 interrupt in NVIC" }
            ]
        }
    },
    {
        topic: "Timers",
        question: "What value should be written to the PSC register to divide the timer clock by 48?",
        resources: [
            "<b>TIMx PSC Register:</b> Prescaler value register.",
            "The counter clock frequency CK_CNT = fCK_PSC / (PSC + 1)",
            "System clock (fCK_PSC) = 48 MHz in this case."
        ],
        options: ["47", "48", "49", "0"],
        correctIndex: 0,
        explanation: "To divide the timer clock by 48, you need PSC = 48-1 = 47. This is because the division factor is (PSC + 1).",
        simulation: { type: "timer-clock", systemClock: 48000000, prescaler: 47, result: 1000000, formula: "Timer Clock = System Clock / (PSC + 1)" }
    },
    {
        topic: "Interrupts",
        type: "fill-blank",
        question: "What is the correct function name for the Timer 7 interrupt handler?",
        correctAnswer: "TIM7_IRQHandler",
        explanation: "Interrupt handler function names follow the pattern [Peripheral]_IRQHandler. For Timer 7, the correct name is TIM7_IRQHandler.",
        resources: [
            "<b>Interrupt Handler Naming:</b> [Peripheral]_IRQHandler",
            "Found in startup file or CMSIS device header.",
            "Must match exactly for the interrupt to work correctly."
        ],
        simulation: {
            type: "code-example",
            code: `void TIM7_IRQHandler(void) {
            // Clear the update flag
            TIM7->SR &= ~TIM_SR_UIF;

            // Your interrupt handling code here
            }`
        }
    }
]; // <-- Make sure this closing bracket and semicolon are the absolute end of the file.