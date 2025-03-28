export const questions = [
    // --- Original Questions (Simulations Modified w/ ADHD Fields where discussed) ---
    {
      topic: "RCC",
      question: "Which register must be modified to enable the clock for the GPIOB peripheral?",
      resources: [
          "The RCC_AHBENR register controls the clock gating for peripherals connected to the AHB bus...", // Keep existing resources
          "*RCC AHBENR Register:* Controls clocks for AHB bus peripherals.",
          "Bit 17: IOPAEN - I/O port A clock enable",
          "Bit 18: IOPBEN - I/O port B clock enable",
          "Bit 19: IOPCEN - I/O port C clock enable",
          "To enable a clock, write '1' to the corresponding bit."
      ],
      options: [ "RCC->APB1ENR", "RCC->AHBENR", "RCC->APB2ENR", "RCC->CR" ],
      correctIndex: 1,
      explanation: "The GPIO ports (A, B, C...) are connected to the AHB bus. Their clocks are enabled via the RCC_AHBENR register.",
      simulation: { // MODIFIED w/ ADHD Fields
        type: "register-view",
        title: "Enable GPIOB Clock",
        register: "RCC_AHBENR",
        bits: [
            { number: 18, name: "IOPBEN", value: 1, description: "1 = I/O Port B Clock Enabled" }
        ],
        value_before: "0x00000000", // Example previous state (clock off)
        value_after: "0x00040000",  // Value with bit 18 set
        action_description: "Sets Bit 18 (IOPBEN) to 1.",
        relevance: "Essential first step before configuring any GPIOB pin (Used in most Labs).",
        analogy: "Like turning on the power switch specifically for the Port B section of the chip.",
        reference: "Ref Manual Sec 7.3.7"
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
      options: [ "00", "01", "10", "11" ],
      correctIndex: 2,
      explanation: "The value '10' sets a GPIO pin to Alternate Function mode, allowing it to be used by peripherals like Timers or SPI.",
      simulation: { // MODIFIED w/ ADHD Fields
        type: "pin-config",
        title: "Set PC6 to Alternate Function",
        pin: "PC6",
        mode: "Alternate function (10)",
        register: "GPIOC_MODER",
        bitField: "13:12", // Bits for pin 6 are 2*6+1 and 2*6 -> 13 and 12
        value_before: "0x00000000", // Assuming pin was input before
        value_after: "0x00002000",  // Value with bits 13:12 set to '10' (shifted)
        action_description: "Writes '10' to bits 13:12 of GPIOC_MODER.",
        relevance: "Needed when using PC6 for Timer 3 CH1 PWM (Lab 5) or SPI1 SCK.",
        analogy: "Telling pin PC6 to listen to instructions from a peripheral (like a Timer) instead of being a simple input/output.",
        reference: "Datasheet Pinout / Ref Manual Sec 8.4.1"
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
        "Use bitwise AND NOT (<code>&= ~</code>) to clear bits before setting.", // Added from NotebookLM's resources
        "Example clearing PC4: <code>GPIOC->MODER &= ~(0x3 << (4*2));</code>",
        "Example setting PC4 to output: <code>GPIOC->MODER |= (0x1 << (4*2));</code>"
      ],
      options: [ // Options updated based on NotebookLM's version, assuming #3 is correct
        "<code>RCC->AHBENR |= (1 << 19); GPIOC->MODER |= (0x1 << 8) | (0x1 << 10);</code>", // Lacks clearing step
        "<code>RCC->APB1ENR |= (1 << 19); GPIOC->MODER |= (0x1 << 4) | (0x1 << 5);</code>", // Wrong RCC, wrong bit shifts
        "<code>RCC->AHBENR &= ~(1 << 19); GPIOC->MODER &= ~(0x1 << 8) & ~(0x1 << 10);</code>", // Disables clock, incorrect clearing logic
        "<code>RCC->AHBENR |= (1 << 19); GPIOC->MODER &= ~((0x3 << 8) | (0x3 << 10)); GPIOC->MODER |= (0x1 << 8) | (0x1 << 10);</code>" // Correct: Enable clock, clear PC4/PC5 bits, set PC4/PC5 bits to '01'
      ],
      correctIndex: 3, // Corrected index based on NotebookLM's presumably correct option
      explanation: "Enable clock via RCC_AHBENR bit 19. Then, safely modify MODER: first clear bits 8-11 using `&= ~` with a mask covering both PC4 & PC5 fields `~((0x3 << 8) | (0x3 << 10))`, then set bits 8-9 and 10-11 to '01' using `|= (0x1 << 8) | (0x1 << 10)`.",
      simulation: { // MODIFIED w/ ADHD Fields
        type: "config-sequence",
        title: "Configure PC4/PC5 as Output",
        action_description: "Sequence to enable GPIOC clock and set PC4/PC5 as outputs.",
        steps: [
            { register: "RCC_AHBENR", operation: "set bit", bits: "19", value_after: "0x... | (1<<19)", description: "Enable GPIOC clock (IOPCEN)" },
            { register: "GPIOC_MODER", operation: "clear bits", bits: "11:8", mask: "~(0xF << 8)", description: "Clear mode bits for PC4-PC5" }, // Mask simplified
            { register: "GPIOC_MODER", operation: "set bits", bits: "11:8", value: "(0x5 << 8)", value_after: "0x... | (0x5<<8)", description: "Set PC4-PC5 to output mode ('01' + '01')" }
        ],
        relevance: "Common setup for driving LEDs or other outputs (Lab 1/2).",
        reference: "Ref Manual Sec 7.3.7, 8.4.1"
      }
    },
    {
      topic: "Timers",
      question: "You need a 1 Hz PWM frequency using TIM3. The system clock is 48 MHz. If you set TIM3->PSC = 47999, what value should TIM3->ARR be?",
      resources: [
          "Timer Clock Freq (CK_CNT) = Input Clock / (PSC + 1)",
          "PWM Frequency = Timer Clock Freq / (ARR + 1)",
          "Input Clock = 48,000,000 Hz"
      ],
      options: ["999", "1000", "47999", "48000"],
      correctIndex: 0,
      explanation: "Timer Clock = 48MHz / (47999 + 1) = 1kHz. To get 1 Hz PWM: 1 Hz = 1000 Hz / (ARR + 1). So, ARR + 1 = 1000. ARR = 999.",
      simulation: { // MODIFIED w/ ADHD Fields
          type: "timer-calculation",
          title: "Calculate Timer ARR for PWM Frequency",
          systemClock: 48000000,
          psc: 47999,
          targetFrequency: 1,
          formula: "ARR = (SystemClock / (PSC+1) / TargetFreq) - 1",
          result: 999,
          action_description: "Calculates ARR based on desired frequency, PSC, and system clock.",
          relevance: "Core calculation for setting up PWM period (Lab 5).",
          analogy: "PSC slows down the clock ticks, ARR sets how many ticks make one full cycle.",
          reference: "Ref Manual Sec 17.3 / Lab 5"
      }
    },
      {
      topic: "Timers/PWM",
      question: "To generate PWM output on TIM3 Channel 1 (PC6), which register bits select 'PWM mode'?",
      resources: [
          "<b>TIMx CCMRx:</b> Capture/Compare Mode Register (Use CCMR1 for CH1/CH2).",
          "Bits 6:4 (OC1M) in CCMR1 control Channel 1's output mode.",
          "Values for OC1M: <code>110</code> = PWM Mode 1, <code>111</code> = PWM Mode 2.",
          "<b>TIMx CCER:</b> Bit 0 (CC1E) must be set to enable Channel 1 output.",
          "<b>GPIO Config:</b> PC6 must be set to Alternate Function mode (MODER='10') and correct AF selected (AFR)."
      ],
      options: ["OC1M bits (6:4) in TIM3_CCMR1", "CC1E bit (0) in TIM3_CCER", "CEN bit (0) in TIM3_CR1", "CCR1 register"],
      correctIndex: 0,
      explanation: "The Output Compare Mode bits (OCxM) within the Capture/Compare Mode Register (CCMRx) are used to select PWM mode. For Channel 1, these are the OC1M bits [6:4] in the CCMR1 register.",
      simulation: { // MODIFIED w/ ADHD Fields
        type: "register-bit-config",
        title: "Configure TIM3_CH1 for PWM Mode 1",
        register: "TIM3_CCMR1",
        bits_to_set: [
            { number: "6:4", name: "OC1M", value: "110", description: "Set PWM Mode 1" }
        ],
        value_after: "0x... | 0x0060", // Show value for OC1M bits set
        action_description: "Sets bits 6:4 (OC1M) to '110' in TIM3_CCMR1 register.",
        relevance: "Key step in setting up PWM output signal generation (Lab 5).",
        reference: "Ref Manual Sec 17.4.7"
      }
    },
    {
      topic: "ADC",
      question: "Before enabling the ADC itself (ADEN bit), what dedicated internal clock source for the ADC often needs to be enabled on STM32F0 series?",
      resources: [
          "<b>RCC APB2ENR Register:</b> Bit 9: <code>ADC1EN</code> - Main ADC peripheral clock enable.",
          "<b>RCC CR2 Register:</b> Bit 14: <code>HSI14ON</code> - Enables the 14 MHz internal RC oscillator.",
          "Bit 15: <code>HSI14RDY</code> - Indicates HSI14 is stable.",
          "The STM32F0 ADC peripheral requires the HSI14 clock source to function.",
          "Must enable HSI14ON and wait for HSI14RDY before enabling ADCEN."
      ],
      options: ["The main PLL", "The LSI oscillator", "The HSI14 oscillator", "The HSE oscillator"],
      correctIndex: 2,
      explanation: "The STM32F0 series ADC relies on the dedicated 14 MHz High-Speed Internal oscillator (HSI14). You must enable it (HSI14ON) and wait for it to be ready (HSI14RDY) *before* enabling the main ADC clock (ADC1EN) and the ADC itself (ADEN).",
      simulation: { // MODIFIED w/ ADHD Fields
        type: "config-sequence",
        title: "Enable ADC Clock Source (HSI14)",
        action_description: "Sequence to enable the required HSI14 clock for the ADC.",
        steps: [
            { register: "RCC_CR2", operation: "set bit", bits: "14", value_after: "0x... | (1<<14)", description: "Enable HSI14 clock (HSI14ON)" },
            { register: "RCC_CR2", operation: "wait for bit", bits: "15", mask: "(1<<15)", description: "Wait until HSI14 is Ready (HSI14RDY=1)" }
        ],
        relevance: "Mandatory prerequisite for using ADC on STM32F0 (Lab 4).",
        reference: "Ref Manual Sec 7.3.2, 13.3.1"
      }
    },
    {
      topic: "ADC",
      question: "Which ADC register is read to get the result of a completed conversion?",
      resources: [
        "<b>ADC CR (Control Register):</b> Contains <code>ADSTART</code>, <code>ADEN</code>.",
        "<b>ADC ISR (Interrupt and Status Register):</b> Contains <code>EOC</code> (End Of Conversion flag).",
        "<b>ADC DR (Data Register):</b> Holds the converted digital value.",
        "<b>ADC CHSELR (Channel Selection Register):</b> Selects input channel(s)."
       ],
      options: ["ADC->CR", "ADC->ISR", "ADC->DR", "ADC->CHSELR"],
      correctIndex: 2,
      explanation: "The ADC Data Register (ADC->DR) holds the digital result once a conversion is complete.",
      simulation: { // MODIFIED w/ ADHD Fields
        type: "action-sequence",
        title: "Read ADC Conversion Result",
        action_description: "Sequence to start an ADC conversion and read the result.",
        steps: [
            { register: "ADC_CR", operation: "set bit", bits: "2", value_after: "0x... | (1<<2)", description: "Start conversion (ADSTART=1)" },
            { register: "ADC_ISR", operation: "wait for bit", bits: "2", mask: "(1<<2)", description: "Wait for End Of Conversion flag (EOC=1)" },
            { register: "ADC_DR", operation: "read", value: "(0 to 4095)", description: "Read digital result from Data Register" },
            { register: "ADC_ISR", operation: "write 1 to clear", bits: "2", description: "Clear EOC flag (Write 1 to Bit 2)"} // Added clear step
        ],
        relevance: "How to get the measurement value from the ADC (Lab 4).",
        reference: "Ref Manual Sec 13.12.2, 13.12.4"
      }
    },
    {
      topic: "DAC",
      question: "To output an analog voltage using DAC channel 1 (typically PA4), which register do you write the digital value to?",
      resources: [
          "<b>DAC CR (Control Register):</b> Contains <code>EN1</code> (Channel 1 Enable).",
          "<b>DAC DHR12R1 (Ch1 12-bit Right-aligned Data Holding Register):</b> Holds value for CH1.",
          "<b>DAC DOR1 (Ch1 Data Output Register):</b> Read-only, shows current output.",
          "GPIOx MODER:</b> Must set PA4 to Analog mode (<code>11</code>)."
      ],
      options: ["DAC->CR", "DAC->DHR12R1", "DAC->DOR1", "GPIOA->ODR"],
      correctIndex: 1,
      explanation: "The digital value (0-4095 for 12-bit) to be converted to an analog voltage by DAC Channel 1 is written to the Data Holding Register DHR12R1.",
      simulation: { // MODIFIED w/ ADHD Fields
        type: "config-sequence",
        title: "Output Value via DAC Channel 1",
        action_description: "Steps to configure and write a value to DAC1.",
        steps: [
            { description: "Configure PA4 as Analog (GPIOA->MODER bits 9:8 = 11)" },
            { description: "Enable DAC Clock (RCC->APB1ENR bit 29 = 1)" },
            { description: "Enable DAC Channel 1 (DAC->CR bit EN1 = 1)" },
            { register: "DAC_DHR12R1", operation: "write", value: "0x0800", description: "Write digital value (e.g., 2048) to Data Holding Register" },
        ],
        relevance: "Used to generate analog signals, e.g., for audio or waveform generation (Lab 4).",
        reference: "Ref Manual Sec 14.5 / Lab 4"
      }
    },
    {
      topic: "DMA",
      question: "When configuring DMA to transfer data from memory (e.g., an array) to a peripheral (e.g., GPIOB->ODR), what should the 'Direction' bit (DIR in DMA_CCR) be set to?",
      resources: [
          "<b>DMA_CCR Register:</b>",
          "Bit 4: <code>DIR</code> - Data transfer direction.",
          "<code>0</code>: Read from peripheral (Periph -> Mem)",
          "<code>1</code>: Read from memory (Mem -> Periph)"
      ],
      options: ["0 (Read from peripheral)", "1 (Read from memory)"],
      correctIndex: 1,
      explanation: "For Memory-to-Peripheral transfers (like sending data from RAM to GPIO), the DIR bit must be set to 1.",
      simulation: { // MODIFIED w/ ADHD Fields
        type: "register-bit-config",
        title: "Set DMA Direction: Memory to Peripheral",
        register: "DMA_CCR", // Generic channel
        bits_to_set: [
            { number: 4, name: "DIR", value: 1, description: "1 = Read from memory (Mem -> Periph)" }
        ],
        action_description: "Sets the DIR bit (Bit 4) to 1 in the DMA Channel Configuration Register.",
        relevance: "Crucial for setting up DMA to output data (e.g., to DAC, SPI TX, GPIO ODR) (Lab 4, 6).",
        analogy: "Sets the direction of the automated data 'conveyor belt'.",
        reference: "Ref Manual Sec 11.4.3"
      }
    },
    {
      topic: "DMA",
      question: "You are setting up DMA (e.g., Channel 5) to transfer 8 half-words (16-bit values) from the `msg` array to `GPIOB->ODR`. What value should `DMA1_Channel5->CNDTR` be initialized to?",
      resources: [ /* Keep existing detailed resources */
          "The DMA_CNDTR Register... specifies the total number of data units...",
          "In your scenario, you want to transfer 8 half-words... the number of data units is 8.",
          "The counter... will decrement after each transfer..."
      ],
      options: ["1", "8", "16", "Depends on the peripheral data register size"],
      correctIndex: 1,
      explanation: "CNDTR specifies the *number* of data units (as defined by PSIZE/MSIZE) to transfer. If you're transferring 8 items (half-words) from the `msg` array, CNDTR should be 8.",
      simulation: { // MODIFIED w/ ADHD Fields
        type: "register-write",
        title: "Set DMA Transfer Count",
        register: "DMA1_Channel5_CNDTR",
        value: "8",
        action_description: "Writes the number of data units (8) to the Number of Data to Transfer register.",
        relevance: "Defines how many items DMA will move before stopping (unless circular) (Lab 4, 6).",
        reference: "Ref Manual Sec 11.4.4",
        context: {
          transfer_details: "Transferring 8 items (half-words)",
          source: "`msg` array (Memory)",
          destination: "`GPIOB->ODR` (Peripheral)"
        }
      }
    },
    {
      topic: "SPI",
      question: "Before configuring SPI settings like baud rate (BR bits) or data size (DS bits) in SPIx_CR1/CR2, what must be done?",
      resources: [
          "<b>SPI_CR1 Register:</b> Bit 6: <code>SPE</code> - SPI Enable.",
          "Configuration bits (like BR, MSTR) are in CR1.",
          "Data size (DS) bits are in CR2.",
          "<b>Reference Manual Note:</b> The SPI must be disabled (SPE=0) before changing most configuration bits."
      ],
      options: ["Enable the SPI peripheral (set SPE=1)", "Disable the SPI peripheral (clear SPE=0)", "Enable the relevant DMA channel", "Set the NSSP bit in CR2"],
      correctIndex: 1,
      explanation: "It's crucial to disable the SPI peripheral by clearing the SPE bit in SPI_CR1 *before* changing configuration parameters like baud rate, clock polarity/phase, master/slave mode, or data size.",
      simulation: { // MODIFIED w/ ADHD Fields
        type: "config-sequence",
        title: "SPI Configuration Sequence",
        action_description: "Correct order for configuring SPI parameters.",
        steps: [
            { register: "SPI1_CR1", operation: "clear bit", bits: "6 (SPE)", description: "1. Ensure SPI is Disabled" },
            { register: "SPI1_CR1", operation: "configure", bits: "BR, MSTR, CPOL, CPHA", description: "2. Set Mode, Baud Rate, Clock Settings" },
            { register: "SPI1_CR2", operation: "configure", bits: "DS, etc.", description: "3. Set Data Size, DMA Enables, etc." },
            { register: "SPI1_CR1", operation: "set bit", bits: "6 (SPE)", description: "4. Enable SPI" }
        ],
        relevance: "Important procedure to avoid issues when setting up SPI (Lab 6).",
        reference: "Ref Manual Sec 28.5.1"
      }
    },
    {
      topic: "SPI",
      question: "You want to configure SPI1 for Master mode, 8-bit data size, and enable DMA requests for the transmitter. Which register primarily holds the Master mode (MSTR) and SPI enable (SPE) bits?",
      resources: [
          "<b>SPI_CR1 Register:</b> Contains MSTR, BR, SPE, CPOL, CPHA bits.",
          "<b>SPI_CR2 Register:</b> Contains DS, TXDMAEN, RXDMAEN bits.",
          "MSTR=1 for Master mode. DS bits ('0111') set for 8-bit. TXDMAEN=1 to enable DMA requests on TX empty."
      ],
      options: ["SPI1->CR1", "SPI1->CR2", "SPI1->SR (Status Register)", "DMA1_Channel3->CCR"],
      correctIndex: 0,
      explanation: "SPI_CR1 contains the main control bits, including MSTR (Master/Slave Selection) and SPE (SPI Enable).",
      simulation: { // MODIFIED w/ ADHD Fields
        type: "register-view",
        title: "SPI Control Register 1 Overview",
        register: "SPI1_CR1",
        bits: [
            { number: 6, name: "SPE", value: 1, description: "SPI Enable" },
            { number: 2, name: "MSTR", value: 1, description: "Master Selection" },
            { number: "5:3", name: "BR", value: "e.g. 010", description: "Baud Rate Control" }
        ],
        value_after: "0x... | (1<<6) | (1<<2) | (BR<<3)", // Conceptual value
        action_description: "SPI_CR1 holds key configuration bits like SPE and MSTR.",
        relevance: "Core register for basic SPI setup (Lab 6).",
        reference: "Ref Manual Sec 28.5.1"
      }
    },
    {
      topic: "Interrupts",
      question: "After enabling an interrupt in a peripheral (e.g., setting UIE in TIM7_DIER), what must be done to allow the CPU to respond to that interrupt?",
      resources: [
          "<b>Peripheral Interrupt Enable:</b> e.g., TIM_DIER_UIE.",
          "<b>NVIC (Nested Vectored Interrupt Controller):</b> Manages interrupt priorities and enables/disables interrupts CPU-side.",
          "<b>NVIC_EnableIRQ(IRQn_Type IRQn):</b> Function to enable a specific interrupt line in the NVIC."
      ],
      options: ["Set the global interrupt enable bit in the CPU's status register", "Call the corresponding Interrupt Service Routine (ISR) function manually", "Enable the corresponding interrupt line in the NVIC using `NVIC_EnableIRQ()`", "Clear the interrupt pending flag in the peripheral"],
      correctIndex: 2,
      explanation: "Even if a peripheral generates an interrupt request, the CPU won't process it unless that specific interrupt line is enabled in the NVIC (Nested Vectored Interrupt Controller) using functions like `NVIC_EnableIRQ()`.",
      simulation: { // MODIFIED w/ ADHD Fields
        type: "config-sequence",
        title: "Enabling an Interrupt",
        action_description: "Sequence to enable a peripheral interrupt.",
        steps: [
            { register: "TIM7_DIER", operation: "set bit", bits: "0 (UIE)", description: "1. Enable interrupt source in Peripheral" },
            { description: "2. Find IRQ Number for the peripheral (e.g., TIM7_IRQn)"},
            { function_call: "NVIC_SetPriority(TIM7_IRQn, priority)", description: "3. Set Interrupt Priority in NVIC (Optional)"},
            { function_call: "NVIC_EnableIRQ(TIM7_IRQn)", description: "4. Enable Interrupt in NVIC" }
        ],
        relevance: "Standard procedure for making interrupts work (All Labs using interrupts).",
        reference: "Ref Manual Sec 10.1.2 / CMSIS Core Functions"
      }
    },
    {
      topic: "Timers",
      question: "What value should be written to the PSC register to divide the timer clock by 48?",
      resources: [
          "<b>TIMx PSC Register:</b> Prescaler value register.",
          "The counter clock frequency CK_CNT = fCK_PSC / (PSC + 1)",
          "Input clock (fCK_PSC) = 48 MHz assumed."
      ],
      options: ["47", "48", "49", "0"],
      correctIndex: 0,
      explanation: "To divide the timer clock by 48, you need PSC = 48-1 = 47. This is because the division factor is (PSC + 1).",
      simulation: { // MODIFIED w/ ADHD Fields
          type: "timer-calculation",
          title: "Calculate Timer Prescaler (PSC)",
          systemClock: 48000000, // Assume input clock is SysClk here
          division_factor: 48,
          formula: "PSC = (Division Factor) - 1",
          result: 47,
          action_description: "Calculates PSC value needed for a specific clock division.",
          relevance: "Used to slow down the timer clock for desired frequency ranges (Lab 3, 5).",
          reference: "Ref Manual Sec 17.4.11"
      }
    },
    {
      topic: "Interrupts",
      type: "fill-blank",
      question: "What is the correct function name for the Timer 7 interrupt handler?",
      correctAnswer: "TIM7_IRQHandler",
      explanation: "Interrupt handler function names follow the pattern [Peripheral]_IRQHandler. For Timer 7, the correct name is TIM7_IRQHandler.",
      resources: [
          "<b>Interrupt Handler Naming:</b> [Peripheral]_IRQHandler",
          "Found in startup file (e.g., startup_stm32f0xx.s) or device header.",
          "Must match the name in the vector table exactly."
      ],
      simulation: { // MODIFIED w/ ADHD Fields
        type: "code-example",
        title: "Timer 7 Interrupt Handler Structure",
        action_description: "Example structure of an ISR. The function name must match the vector table.",
        code: `// Located in your main C file or associated source file
  void TIM7_IRQHandler(void) {
    // **Important:** Acknowledge the interrupt first!
    if (TIM7->SR & TIM_SR_UIF) { // Check if update interrupt flag is set
        TIM7->SR &= ~TIM_SR_UIF; // Clear the update interrupt flag
  
        // --- Your interrupt handling code goes here ---
        // Example: Toggle an LED
        // GPIOC->ODR ^= (1 << 8);
        // ------------------------------------------
    }
  }`,
        relevance: "Required structure for handling peripheral interrupts.",
        reference: "Startup file / CMSIS / Ref Manual Interrupt Section"
      }
    },
  
    // --- NEW Questions (PWM Duty Cycle/Enable/GPIO AF) ---
    {
      topic: "PWM",
      question: "You have configured TIM3 with ARR = 999 for a 1 kHz PWM signal. What value should you write to TIM3_CCR1 to achieve a 25% duty cycle on Channel 1?",
      resources: [
          "Duty Cycle (%) = (CCR / (ARR + 1)) * 100%",
          "Therefore, CCR = (Duty Cycle / 100) * (ARR + 1)",
          "ARR = 999",
          "Desired Duty Cycle = 25%"
      ],
      options: [ "249", "250", "750", "999" ],
      correctIndex: 1,
      explanation: "The formula is CCR = (Duty Cycle / 100) * (ARR + 1). With ARR=999 and Duty Cycle=25%, CCR = (25 / 100) * (999 + 1) = 0.25 * 1000 = 250. Writing 250 to TIM3_CCR1 will result in a 25% duty cycle.",
      simulation: {
        type: "timer-calculation",
        title: "PWM Duty Cycle Calculation (CCR)",
        arr: 999,
        dutyCyclePercent: 25,
        formula: "CCR = (DutyCyclePercent / 100) * (ARR + 1)",
        result: 250
        // NOTE: Add relevance/analogy later if desired
      }
    },
    {
      topic: "PWM",
      question: "After setting the OC1M bits in TIMx_CCMR1 for PWM mode, which bit must be set in TIMx_CCER to enable the PWM signal output on Channel 1?",
      resources: [
          "<b>TIMx_CCER (Capture/Compare Enable Register):</b> Controls the output enable for each channel.",
          "Bit 0: <code>CC1E</code> - Capture/Compare 1 Output Enable.",
          "Setting CC1E to '1' enables the output signal (PWM) on the corresponding pin (e.g., TIMx_CH1)."
      ],
      options: [ "CC1P (Polarity)", "CEN (Counter Enable)", "CC1E (Output Enable)", "UIE (Update Interrupt Enable)" ],
      correctIndex: 2,
      explanation: "The CCxE bit (specifically CC1E for Channel 1) in the TIMx_CCER register must be set to '1' to enable the timer channel's output onto the corresponding GPIO pin.",
      simulation: {
        type: "register-bit-config",
        title: "Enable Timer Channel 1 Output",
        register: "TIMx_CCER", // Generic timer
        bits_to_set: [ { number: 0, name: "CC1E", value: 1, description: "Channel 1 Output Enable" } ],
        value_after: "0x... | (1 << 0)",
        relevance: "Necessary step to actually see the PWM signal on the pin (Lab 5)."
        // NOTE: Add reference/analogy later if desired
      }
    },
    {
      topic: "GPIO", // Topic relates to GPIO configuration for a peripheral
      question: "Pin PB4 can be used for TIM3_CH1. To use it for PWM output, what value should be written to the relevant 4-bit field in the GPIO Port B Alternate Function Low Register (GPIOB_AFRL)? (Hint: Check datasheet/reference for AF mapping)",
      resources: [
          "GPIO pins must be in Alternate Function mode (MODER = '10').",
          "The specific alternate function (AF0-AF7) is selected using the <b>GPIOx_AFRL</b> (pins 0-7) or <b>GPIOx_AFRH</b> (pins 8-15) registers.",
          "Each pin uses a 4-bit field. For pin 'y', the field is AFRLy or AFRHy.",
          "Example: Pin 4 uses AFRL4 field (bits 19:16 in AFRL).",
          "<b>STM32F0 Datasheet (Example):</b> Table 15 often shows AF mappings. Assume TIM3_CH1 on PB4 is AF1." // **ASSUMPTION - MUST BE VERIFIED FOR ACTUAL HARDWARE**
      ],
      options: [ "0000 (AF0)", "0001 (AF1)", "0010 (AF2)", "1111 (Invalid)" ],
      correctIndex: 1, // Based on the AF1 assumption
      explanation: "First, set PB4 to AF mode in GPIOB_MODER. Then, consult the datasheet's Alternate Function mapping table. Assuming TIM3_CH1 maps to AF1 for PB4, you write '0001' to the AFRL4 field (bits 19:16) in the GPIOB_AFRL register.",
      simulation: {
        type: "config-sequence",
        title: "Configure PB4 for TIM3_CH1 AF",
        steps: [
            { description: "1. Enable GPIOB Clock (RCC)" },
            { register: "GPIOB_MODER", operation: "set bits", bits: "9:8", value: "(0x2 << 8)", description: "Set PB4 to Alternate function mode ('10')" },
            { description: "2. Find AF number for TIM3_CH1 on PB4 (Assume AF1 - **CHECK DATASHEET**)" },
            { register: "GPIOB_AFRL", operation: "set bits", bits: "19:16", value: "(1 << 16)", description: "Set AFRL4 field (bits 19:16) to '0001' (AF1)" }
        ],
        relevance: "Essential for connecting the timer's internal PWM signal to the physical pin (Lab 5). Requires datasheet lookup.",
        reference: "Datasheet AF Table / Ref Manual Sec 8.4.9"
      }
    },
  
    // --- NEW Questions (DMA Config) ---
    {
      topic: "DMA",
      question: "When setting up a DMA channel (e.g., DMA1_Channel1) for a transfer, which two registers hold the source and destination addresses?",
      resources: [
          "Each DMA channel has dedicated registers to specify the data transfer endpoints.",
          "<b>DMA_CPARx:</b> DMA channel x Peripheral Address Register.",
          "<b>DMA_CMARx:</b> DMA channel x Memory Address Register.",
          "The direction (DIR bit) determines which register acts as the source and which as the destination."
      ],
      options: [ "DMA_CCR & DMA_CNDTR", "DMA_CPARx & DMA_CMARx", "DMA_ISR & DMA_IFCR", "RCC_AHBENR & DMA_CCR" ],
      correctIndex: 1,
      explanation: "The DMA_CPARx (Peripheral Address Register) and DMA_CMARx (Memory Address Register) are used to specify the fixed peripheral address and the starting memory address for the DMA transfer.",
      simulation: {
        type: "register-view",
        title: "DMA Address Registers",
        registers: [
           { name: "DMA_CPARx", description: "Peripheral Address (e.g., &ADC->DR)" },
           { name: "DMA_CMARx", description: "Memory Address (e.g., buffer)" }
        ],
        relevance: "Fundamental step for telling DMA where to get data from and where to put it (Lab 4, 6)."
        // NOTE: Consider adding more ADHD fields manually later
      }
    },
    {
      topic: "DMA",
      question: "You want to use DMA to read 16-bit values from the ADC Data Register (ADC->DR) into a 16-bit array (`uint16_t buffer[]`). How should PSIZE, MSIZE, PINC, and MINC bits in DMA_CCR typically be configured?",
      resources: [
          "<b>DMA_CCR Register Bits:</b>",
          "<code>PSIZE[1:0]</code>: Peripheral size (00=8b, 01=16b, 10=32b)",
          "<code>MSIZE[1:0]</code>: Memory size (00=8b, 01=16b, 10=32b)",
          "<code>PINC</code> (Bit 6): Peripheral increment mode (0=disabled, 1=enabled)",
          "<code>MINC</code> (Bit 7): Memory increment mode (0=disabled, 1=enabled)",
          "Scenario: Reading 16-bit ADC values into a 16-bit buffer."
      ],
      options: [
        "PSIZE=01, MSIZE=01, PINC=0, MINC=1", // Correct
        "PSIZE=01, MSIZE=01, PINC=1, MINC=0",
        "PSIZE=10, MSIZE=10, PINC=0, MINC=1",
        "PSIZE=00, MSIZE=00, PINC=1, MINC=1"
      ],
      correctIndex: 0,
      explanation: "Both peripheral (ADC->DR) and memory (uint16_t array) use 16-bit data (PSIZE='01', MSIZE='01'). The ADC address is fixed (PINC=0). The memory address increments to fill the buffer (MINC=1).",
      simulation: {
        type: "register-bit-config",
        title: "DMA Config: ADC to Memory",
        register: "DMA_CCR",
        bits_to_set: [
            { number: "9:8", name: "PSIZE", value: "01", description: "Peripheral Size = 16-bit" },
            { number: "11:10", name: "MSIZE", value: "01", description: "Memory Size = 16-bit" },
            { number: 7, name: "MINC", value: 1, description: "Memory Increment = Enabled" }
        ],
        bits_to_clear: [
            { number: 6, name: "PINC", value: 0, description: "Peripheral Increment = Disabled" }
        ],
        relevance: "Common configuration for acquiring data from ADC or SPI RX (Lab 4, 6)."
        // NOTE: Consider adding more ADHD fields manually later
      }
    },
    {
      topic: "DMA",
      question: "After configuring the DMA addresses (CMAR, CPAR), data count (CNDTR), and channel settings (CCR), which bit must be set to activate the DMA channel?",
      resources: [
          "<b>DMA_CCR Register:</b> Channel x Configuration Register",
          "Bit 0: <code>EN</code> - Channel enable.",
          "The channel must be configured *before* enabling it.",
          "Setting EN=1 enables the channel. It starts transferring when a request occurs."
      ],
      options: [ "TCIE", "DIR", "MEM2MEM", "EN" ],
      correctIndex: 3,
      explanation: "The EN bit (Bit 0) in the DMA_CCR register is the final step to enable the configured DMA channel. Once enabled, it's ready to respond to DMA requests.",
      simulation: {
        type: "register-bit-config",
        title: "Enable DMA Channel",
        register: "DMA_CCR",
        bits_to_set: [ { number: 0, name: "EN", value: 1, description: "Channel Enable" } ],
        value_after: "0x... | (1 << 0)",
        action_description: "Sets the EN bit to 1, activating the DMA channel.",
        relevance: "Final step to start the DMA operation after all parameters are set (Lab 4, 6)."
        // NOTE: Consider adding more ADHD fields manually later
      }
    },
  
    // --- NEW Questions (SPI Config) ---
    {
      topic: "SPI",
      question: "To use pins PB13 (SCK), PB14 (MISO), and PB15 (MOSI) for SPI2 communication, besides setting them to Alternate Function mode in GPIOB_MODER, what else must be configured?",
      resources: [
          "GPIO pins in Alternate Function mode need the correct AF mapping selected.",
          "<b>GPIOx_AFRL / AFRH:</b> Selects alternate function AF0-AF7.",
          "AFRH configures pins 8-15. Each pin uses a 4-bit field.",
          "Example: Pin 13 uses AFRH5 field (bits 23:20), Pin 14 uses AFRH6 (bits 27:24), Pin 15 uses AFRH7 (bits 31:28).",
          "<b>STM32F0 Datasheet (Example):</b> SPI2 signals often map to AF0 on these pins. **Verify this!**"
      ],
      options: [
        "Configure the corresponding bits in GPIOB_PUPDR",
        "Configure the corresponding 4-bit fields in GPIOB_AFRH", // Correct
        "Configure the corresponding bits in SYSCFG_EXTICR",
        "Configure the corresponding 4-bit fields in GPIOB_AFRL"
      ],
      correctIndex: 1,
      explanation: "After setting pins PB13, PB14, PB15 to AF mode ('10') in GPIOB_MODER, you must select the correct alternate function number (e.g., AF0 for SPI2, check datasheet!) for each pin using their respective 4-bit fields in the GPIOB_AFRH register (AFRH5, AFRH6, AFRH7).",
      simulation: {
        type: "config-sequence",
        title: "Configure GPIOB High Pins for SPI2 AF",
        steps: [
            { description: "1. Enable GPIOB Clock (RCC)" },
            { register: "GPIOB_MODER", operation: "set bits", bits: "e.g., 31:26", description: "Set PB13,14,15 to AF mode ('10')" },
            { description: "2. Find AF number for SPI2 on PB13/14/15 (Assume AF0 - **CHECK DATASHEET**)" },
            { register: "GPIOB_AFRH", operation: "set fields", fields: "[AFRH5, AFRH6, AFRH7]", value: "(AF_Num)", description: "Set AFRH fields for pins 13,14,15 to correct AF number" }
        ],
        relevance: "Crucial for connecting SPI2 peripheral signals to the correct physical pins (Lab 6).",
        reference: "Datasheet AF Table / Ref Manual Sec 8.4.9, 8.4.10"
      }
    },
    {
      topic: "SPI",
      question: "Which register contains the TXDMAEN and RXDMAEN bits used to enable DMA requests for SPI transmit and receive operations?",
      resources: [
          "SPI can trigger DMA requests to handle data transfers automatically.",
          "<b>SPI_CR1:</b> Contains SPE, MSTR, BR, CPOL, CPHA.",
          "<b>SPI_CR2:</b> Contains DS (Data Size), SSOE, TXDMAEN (TX Buffer DMA Enable), RXDMAEN (RX Buffer DMA Enable).",
          "Set TXDMAEN=1 to generate DMA request when TX buffer is empty.",
          "Set RXDMAEN=1 to generate DMA request when RX buffer is not empty."
      ],
      options: [ "SPIx_CR1", "SPIx_CR2", "SPIx_SR", "DMA_CCR" ],
      correctIndex: 1,
      explanation: "The SPI Control Register 2 (SPIx_CR2) contains the TXDMAEN and RXDMAEN bits, which enable DMA requests based on the status of the SPI transmit (TXE) and receive (RXNE) buffers.",
      simulation: {
        type: "register-view",
        title: "SPI Control Register 2 (DMA Enable)",
        register: "SPIx_CR2",
        bits: [
            { number: 1, name: "RXDMAEN", value: 1, description: "RX Buffer DMA Enable" },
            { number: 14, name: "TXDMAEN", value: 1, description: "TX Buffer DMA Enable" },
            { number: "11:8", name: "DS", value: "e.g. 0111", description:"Data Size"}
        ],
        relevance: "Used for efficient data transfer with SPI, often used with displays or external memory (Lab 6).",
        reference: "Ref Manual Sec 28.5.2"
      }
    },
  
    // --- NEW Questions (ADC/DAC Config) ---
    {
      topic: "ADC",
      question: "Which RCC register and bit should be used to enable the main clock for the ADC1 peripheral?",
      resources: [
          "Peripherals need their clock enabled before configuration.",
          "The ADC is typically connected to the APB2 bus on STM32F0.",
          "<b>RCC_APB2ENR:</b> For ADC, TIM1, SPI1, etc.",
          "Bit 9 in APB2ENR is usually ADC1EN."
      ],
      options: [ "RCC_AHBENR, bit IOPBEN", "RCC_APB1ENR, bit DAC1EN", "RCC_APB2ENR, bit ADC1EN", "RCC_CR2, bit HSI14ON" ],
      correctIndex: 2,
      explanation: "The ADC1 peripheral is on the APB2 bus. Therefore, its clock must be enabled using the ADC1EN bit (Bit 9) in the RCC_APB2ENR register.",
      simulation: {
        type: "register-bit-config",
        title: "Enable ADC1 Peripheral Clock",
        register: "RCC_APB2ENR",
        bits_to_set: [ { number: 9, name: "ADC1EN", value: 1, description: "ADC1 Clock Enable" } ],
        value_after: "0x... | (1 << 9)",
        relevance: "Required step before configuring or using the ADC (Lab 4)."
        // NOTE: Consider adding more ADHD fields manually later
      }
    },
    {
      topic: "ADC",
      question: "You want the ADC to convert the signal connected to pin PA1. Which register is used to select this specific input channel for conversion?",
      resources: [
          "The ADC can convert signals from multiple input channels (pins).",
          "<b>ADC_CHSELR:</b> Channel Selection Register.",
          "Each bit (CHSEL0 to CHSEL18) corresponds to an input channel (IN0 to IN18).",
          "Set the bit corresponding to the desired channel to '1' to include it in the sequence.",
          "Pin PA1 typically corresponds to ADC Channel 1 (ADC_IN1)." // **ASSUMPTION - VERIFY PINOUT**
      ],
      options: [ "ADC_CR", "ADC_CFGR1", "ADC_DR", "ADC_CHSELR" ],
      correctIndex: 3,
      explanation: "The ADC Channel Selection Register (ADC_CHSELR) is used to select which analog input channel(s) will be converted. To select Channel 1 (likely PA1), you would set the CHSEL1 bit (Bit 1) to '1'.",
      simulation: {
        type: "register-bit-config",
        title: "Select ADC Input Channel",
        register: "ADC_CHSELR",
        bits_to_set: [ { number: 1, name: "CHSEL1", value: 1, description: "Select Channel 1 (e.g., PA1)" } ],
        value_after: "0x... | (1 << 1)", // Assuming only this channel
        relevance: "Tells the ADC which pin to measure (Lab 4).",
        reference: "Ref Manual Sec 13.12.6 / Datasheet Pinout"
      }
    },
    {
      topic: "DAC",
      question: "If DAC Channel 1 (12-bit) is configured with Vdda = 3.3V, what approximate analog voltage would be output if you write the value 1024 (0x400) to DAC_DHR12R1?",
      resources: [
          "DAC Output Voltage = Vdda * (DHR_Value / 2^Resolution)",
          "Resolution = 12 bits => 2^12 = 4096 values (0-4095)",
          "Vdda = 3.3V",
          "DHR_Value = 1024"
      ],
      options: [ "0.0V", "0.825V", "1.65V", "3.3V" ],
      correctIndex: 1,
      explanation: "Output = Vdda * (Value / 4096) = 3.3V * (1024 / 4096) = 3.3V * (1 / 4) = 0.825V.",
      simulation: {
        type: "dac-calculation", // New type for calculation
        title: "DAC Output Voltage Calculation",
        vdda: 3.3,
        resolution: 12,
        dhr_value: 1024,
        formula: "V_out = Vdda * (DHR / 4096)",
        result: 0.825 // Volts
        // NOTE: Consider adding more ADHD fields manually later
      }
    },
  
    // --- Other NEW Questions Added Previously (NVIC, Timers, Debugging etc.) ---
    // (Includes questions from NotebookLM output that were added in previous turns)
    {
      topic: "Interrupts",
      question: "Which NVIC function is used to set the priority level for an interrupt?",
      resources: [ /* From previous turn */ ],
      options: ["NVIC_EnableIRQ()", "NVIC_DisableIRQ()", "NVIC_ClearPendingIRQ()", "NVIC_SetPriority()"],
      correctIndex: 3,
      explanation: "NVIC_SetPriority() is the CMSIS function used to assign a priority level to a specific IRQ number.",
      simulation: { /* From previous turn */ }
    },
    {
      topic: "Interrupts",
      question: "For an EXTI (External Interrupt) on pin PA0, which register is used to configure the trigger edge (e.g., rising edge)?",
      resources: [ /* From previous turn */ ],
      options: ["EXTI_IMR", "EXTI_EMR", "EXTI_RTSR / EXTI_FTSR", "SYSCFG_EXTICR1"],
      correctIndex: 2,
      explanation: "The EXTI_RTSR (Rising Trigger) and EXTI_FTSR (Falling Trigger) registers are used to select which edge(s) will trigger an external interrupt on a given line.",
      simulation: { /* From previous turn */ }
    },
     {
      topic: "DMA", // Different DMA question
      question: "When transferring data from a peripheral to memory (e.g., ADC->DR to an array), which increment mode bit should usually be enabled?",
      resources: [ /* From previous turn */ ],
      options: ["PINC (Peripheral Increment)", "MINC (Memory Increment)", "CIRC (Circular Mode)", "Neither"],
      correctIndex: 1,
      explanation: "When reading from a peripheral (like ADC_DR) into a memory buffer (array), you want the memory address pointer to increment after each transfer to fill the buffer, so MINC should be enabled (set to 1).",
      simulation: { /* From previous turn */ }
    },
    {
      topic: "SPI", // Different SPI question
      question: "Which bits in SPI_CR1 control the clock polarity (CPOL) and clock phase (CPHA)?",
      resources: [ /* From previous turn */ ],
      options: ["BR[2:0]", "MSTR and SPE", "CPOL (Bit 1) and CPHA (Bit 0)", "LSBFIRST"],
      correctIndex: 2,
      explanation: "Bit 1 (CPOL) and Bit 0 (CPHA) in the SPI_CR1 register control the SPI clock polarity and phase, respectively.",
      simulation: { /* From previous turn */ }
    },
     {
      topic: "General", // Renamed from GPIO
      question: "You need to use pin PA5 for Timer 2 Channel 1 output. Which register configures PA5 to use its alternate function?",
      resources: [ /* From previous turn */ ],
      options: ["GPIOA_MODER", "GPIOA_PUPDR", "GPIOA_AFRL", "Both MODER and AFRL"],
      correctIndex: 3,
      explanation: "First, GPIOA_MODER must be set to '10' for PA5 to enable alternate function mode. Then, GPIOA_AFRL (since PA5 is pin 5) must be configured with the specific alternate function number corresponding to TIM2_CH1 (found in the datasheet).",
      simulation: { /* From previous turn */ }
    },
    {
      topic: "Timers", // Added Timer Enable question from NotebookLM list
      question: "Which bit in the Timer Control Register 1 (TIMx_CR1) is used to enable the counter?",
      resources: [
          "The **CEN** bit (Counter Enable) in the TIMx_CR1 register is used to start and stop the timer counter.",
          "Setting CEN to '1' enables the counter, and setting it to '0' disables it."
      ],
      options: [ "UDIS", "URS", "CEN", "OPM" ],
      correctIndex: 2,
      explanation: "The **CEN** bit (Bit 0) in the TIMx_CR1 register enables the timer's counter.",
      simulation: {
          type: "register-bit-config",
          title: "Enable Timer Counter",
          register: "TIMx_CR1",
          bits_to_set: [ { number: 0, name: "CEN", value: 1, description: "Counter Enable" } ],
          value_after: "0x... | (1 << 0)"
      }
    },
    // NOTE: PWM Mode question was already adjusted earlier based on NotebookLM's suggestion
    // NOTE: DMA DIR and CNDTR questions from NotebookLM were similar to originals, not repeated here explicitly but covered above.
    {
      topic: "ADC", // Added GPIO Analog question from NotebookLM list
      question: "To configure a GPIO pin (e.g., PA0) as an analog input for the ADC, what should the corresponding bits in the GPIOx_MODER register be set to?",
      resources: [
          "The **MODERy[1:0]** bits in the GPIOx_MODER register define the mode of pin y.",
          "For analog mode, MODERy should be set to '**11**'."
      ],
      options: [ "'00' (Input)", "'01' (Output)", "'10' (Alternate Function)", "'11' (Analog)" ],
      correctIndex: 3,
      explanation: "To use a GPIO pin as an analog input for the ADC, the corresponding MODER bits must be set to '**11**' (Analog mode).",
      simulation: {
          type: "register-bit-config",
          title: "Set GPIO Pin to Analog Mode",
          register: "GPIOA_MODER", // Example for PA0
          bits_to_set: [ { number: "1:0", name: "MODER0", value: "11", description: "Analog Mode for Pin 0" } ],
          value_after: "0x... | (0x3 << 0)"
      }
    },
    {
      topic: "ADC", // Added ADC Start question from NotebookLM list
      question: "Which bit in the ADC Control Register (ADC->CR) is used to start an ADC conversion in software trigger mode?",
      resources: [
          "The **ADSTART** bit in the ADC->CR register is used to initiate a conversion when software trigger is selected.",
          "Setting ADSTART to '1' starts the conversion."
      ],
      options: [ "ADEN", "ADDIS", "ADSTART", "JADSTART" ],
      correctIndex: 2,
      explanation: "The **ADSTART** bit (Bit 2) in the ADC->CR register initiates an ADC conversion in software trigger mode.",
      simulation: {
          type: "register-bit-config",
          title: "Start ADC Conversion (Software)",
          register: "ADC_CR",
          bits_to_set: [ { number: 2, name: "ADSTART", value: 1, description: "Start Conversion" } ],
          value_after: "0x... | (1 << 2)"
      }
    },
    {
      topic: "DAC", // Added DAC Enable question from NotebookLM list
      question: "To enable the DAC1 channel, which bit in the DAC Control Register (DAC->CR) needs to be set?",
      resources: [
          "The **EN1** bit (DAC channel1 enable) in the DAC->CR register enables the output of DAC channel 1.",
          "Setting EN1 to '1' activates DAC channel 1."
      ],
      options: [ "TEN1", "EN1", "BOFF1", "DMAEN1" ],
      correctIndex: 1,
      explanation: "The **EN1** bit (Bit 0) in the DAC->CR register enables DAC channel 1.",
      simulation: {
          type: "register-bit-config",
          title: "Enable DAC Channel 1",
          register: "DAC_CR",
          bits_to_set: [ { number: 0, name: "EN1", value: 1, description: "DAC Channel 1 Enable" } ],
          value_after: "0x... | (1 << 0)"
      }
    },
    {
      topic: "DAC", // Added DAC Write Register question from NotebookLM list
      question: "Assuming DAC channel 1 is enabled, to output a digital value for 12-bit right-aligned data, which register should you write to?", // Reworded slightly
      resources: [
          "The DAC data holding registers (**DAC->DHR12R1**, DAC->DHR12L1, DAC->DHR8R1) hold the digital value to be converted.",
          "The '12R1' variant is for 12-bit right-aligned data for channel 1."
      ],
      options: [ "DAC->DOR1", "DAC->SWTRIGR", "DAC->DHR12R1", "DAC->CR" ],
      correctIndex: 2,
      explanation: "You write the digital value for DAC channel 1 into its Data Holding Register, specifically **DAC->DHR12R1** for 12-bit right-aligned data.",
      simulation: {
          type: "register-write", // Changed type
          title: "Write to DAC Data Holding Register",
          register: "DAC_DHR12R1",
          value: "e.g., 0x0FFF", // Example max value
          action_description: "Writes the 12-bit value to be converted."
      }
    },
    {
      topic: "SPI", // Added SPI Enable question from NotebookLM list
      question: "Which bit in the SPI Control Register 1 (SPIx_CR1) enables the SPI peripheral?",
      resources: [
          "The **SPE** bit (SPI enable) in the SPIx_CR1 register enables the SPI communication.",
          "Setting SPE to '1' activates the SPI peripheral."
      ],
      options: [ "CPOL", "CPHA", "MSTR", "SPE" ],
      correctIndex: 3,
      explanation: "The **SPE** bit (Bit 6) in the SPIx_CR1 register enables the SPI peripheral.",
      simulation: {
          type: "register-bit-config",
          title: "Enable SPI Peripheral",
          register: "SPI1_CR1",
          bits_to_set: [ { number: 6, name: "SPE", value: 1, description: "SPI Enable" } ],
          value_after: "0x... | (1 << 6)"
      }
    },
    {
      topic: "SPI", // Added SPI Master question from NotebookLM list
      question: "To configure the SPI peripheral in master mode, which bit in the SPI Control Register 1 (SPIx_CR1) needs to be set?",
      resources: [
          "The **MSTR** bit (Master selection) in the SPIx_CR1 register selects master or slave mode.",
          "Setting MSTR to '**1**' configures the SPI as a master."
      ],
      options: [ "SSI", "SSM", "MSTR", "BR" ],
      correctIndex: 2,
      explanation: "To configure SPI as a master, the **MSTR** bit (Bit 2) in the SPIx_CR1 register must be set to '**1**'.",
      simulation: {
          type: "register-bit-config",
          title: "Set SPI to Master Mode",
          register: "SPI1_CR1",
          bits_to_set: [ { number: 2, name: "MSTR", value: 1, description: "Master Mode Selection" } ],
          value_after: "0x... | (1 << 2)"
      }
    },
    {
      topic: "SPI", // Added SPI Data Size question from NotebookLM list
      question: "Which bits in the SPI Control Register 2 (SPIx_CR2) are used to select the data size (e.g., 8-bit) for SPI communication?", // Reworded
      resources: [
          "The **DS[3:0]** bits (Data size) in the SPIx_CR2 register determine the number of bits per frame.",
          "Example: Set DS[3:0] to '0111' for 8-bit data."
      ],
      options: [ "FRXTH", "TXEIE", "RXNEIE", "DS[3:0]" ],
      correctIndex: 3,
      explanation: "The **DS[3:0]** bits (Bits 11:8) in the SPIx_CR2 register configure the data frame size (e.g., 8-bit, 16-bit).",
      simulation: {
          type: "register-bit-config",
          title: "Set SPI Data Size",
          register: "SPI1_CR2",
          bits_to_set: [ { number: "11:8", name: "DS", value: "0111", description: "8-bit Data Size" } ],
          value_after: "0x... | (0x7 << 8)" // Example for 8-bit
      }
    },
    {
      topic: "RCC", // Added RCC APB1 question from NotebookLM list
      question: "Which RCC register controls the enabling of clock for peripherals connected to the APB1 bus (like TIM3, DAC)?",
      resources: [
          "The **RCC_APB1ENR** register is used to enable/disable clocks for APB1 peripherals."
      ],
      options: [ "RCC_AHBENR", "RCC_APB1ENR", "RCC_APB2ENR", "RCC_CR" ],
      correctIndex: 1,
      explanation: "Peripherals on the APB1 bus (e.g., TIM2, TIM3, TIM6, TIM7, DAC) have their clocks enabled via the **RCC_APB1ENR** register.",
      simulation: {
          type: "register-view",
          title: "APB1 Clock Enable Register",
          register: "RCC_APB1ENR"
      }
    },
    {
      topic: "RCC", // Added RCC GPIOAEN question from NotebookLM list
      question: "What is the name of the bit in RCC_AHBENR that enables the clock for GPIOA?",
      correctAnswer: "GPIOAEN", // Changed from fill-blank back to correct answer based on NotebookLM structure
      type: "fill-blank",
      explanation: "The bit that enables the clock for GPIOA in the RCC_AHBENR register is named **GPIOAEN** (Bit 17).",
      resources: [
          "The **RCC_AHBENR** register controls clock enable for AHB peripherals.",
          "Bit 17 in RCC_AHBENR is the **GPIOAEN** (I/O port A clock enable) bit."
      ],
      simulation: {
          type: "register-bit-config",
          title: "GPIOA Clock Enable Bit",
          register: "RCC_AHBENR",
          bits_to_set: [ { number: 17, name: "GPIOAEN", value: 1, description: "GPIOA Clock Enable"} ],
          value_after: "0x... | (1 << 17)"
      }
    },
    {
      topic: "Debugging", // Added Debugging DefaultHandler question
      question: "If your STM32 code unexpectedly enters the DefaultHandler, what is a likely primary cause?",
      resources: [
          "The **DefaultHandler** catches interrupts without a specific defined handler.",
          "Common cause: **ISR function name mismatch** with the vector table, or missing ISR definition."
      ],
      options: [
          "Incorrect clock configuration.",
          "A syntax error in `main()`.",
          "An incorrectly named or missing Interrupt Service Routine (ISR).",
          "Forgetting to enable a peripheral clock."
      ],
      correctIndex: 2,
      explanation: "Entering the DefaultHandler usually means the CPU received an interrupt but couldn't find the matching ISR function name defined in your code or linked in the vector table.",
      simulation: {
          type: "info",
          title: "Debugging: DefaultHandler Cause",
          info_text: "Check ISR function names (e.g., `TIM7_IRQHandler`) against the startup file/vector table."
      }
    },
    {
      topic: "Debugging", // Added Debugging Peripheral View question
      question: "When debugging peripheral issues, which debugger view is best for checking register values like TIMx->CR1 or GPIOx->MODER?", // Reworded
      resources: [
          "Debuggers offer views to inspect hardware state.",
          "The **Peripheral view** (or SFR view) directly shows current values of peripheral registers."
      ],
      options: [ "Watch view", "Call Stack", "Peripheral view", "Memory view" ],
      correctIndex: 2,
      explanation: "The **Peripheral view** (sometimes called SFRs - Special Function Registers) lets you inspect the actual hardware register values to confirm your configuration code worked correctly.",
      simulation: {
          type: "debugger-tip",
          title: "Debugging Tip: Check Registers",
          tip_text: "Use the 'Peripheral' / 'SFR' view in your debugger (e.g., PlatformIO, CubeIDE) to verify register contents."
      }
    }
  
  ]; // <-- End of export const questions array