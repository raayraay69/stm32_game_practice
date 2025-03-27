document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    // Ensure these IDs match your HTML file exactly!
    const questionTextElement = document.getElementById('question-text');
    const referenceContentElement = document.getElementById('reference-content');
    const answerOptionsElement = document.getElementById('input-area'); // Make sure HTML has id="input-area"
    const submitButton = document.getElementById('submit-btn');
    const nextButton = document.getElementById('next-btn');
    const feedbackElement = document.getElementById('feedback-area');
    const scoreElement = document.getElementById('score');
    const totalQuestionsElement = document.getElementById('total-questions');
    const finalResultsElement = document.getElementById('results-screen');
    const finalScoreElement = document.getElementById('final-score');
    const finalTotalElement = document.getElementById('final-total');
    const restartButton = document.getElementById('restart-btn');
    const startButton = document.getElementById('start-btn');
    const topicButtons = document.querySelectorAll('.topic-btn');
    const topicSelectionScreen = document.getElementById('topic-selection-screen');
    const gameScreen = document.getElementById('game-screen');
    // Using class selector for questionContainer, ensure it exists if needed elsewhere.
    const questionContainer = document.querySelector('.question-container');


    // --- Questions Database ---
    // Structure: { question: "", resources: ["Snippet 1", "Snippet 2..."], options: ["Opt A", "Opt B"...], correctIndex: 0, explanation: "" }
    // Resources can use HTML for formatting like <code></code>
    const questions = [
        {
            topic: "RCC",
            question: "Which register must be modified to enable the clock for the GPIOB peripheral?",
            resources: [
                "<b>RCC AHBENR Register:</b> Controls clocks for AHB bus peripherals.",
                "Bit 17: <code>IOPAEN</code> - I/O port A clock enable",
                "Bit 18: <code>IOPBEN</code> - I/O port B clock enable",
                "Bit 19: <code>IOPCEN</code> - I/O port C clock enable",
                "To enable a clock, write '1' to the corresponding bit."
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
                 "<b>DMA_CNDTR Register (Channel Number of Data To Transfer Register):</b>",
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
    ];

    // --- Global variables ---
    let currentQuestionIndex = 0;
    let score = 0;
    let selectedAnswerIndex = null; // Track which button is clicked
    let questionsToUse = [];
    let selectedTopics = []; // Holds the actual topic strings for filtering

    // --- Functions ---

    function startGame() {
        // Filter questions based on selected topics if any *specific* topics are selected
        const allButton = document.querySelector('.topic-btn[data-topic="all"]');
        // Ensure allButton exists before checking its classList
        const useAllTopics = allButton && allButton.classList.contains('selected');

        if (!useAllTopics && selectedTopics.length > 0) {
             questionsToUse = questions.filter(q => selectedTopics.includes(q.topic));
        } else {
             // Use all questions if 'All Topics' is selected or no specific topics are chosen
             questionsToUse = [...questions];
        }

        // Ensure there are questions to ask for the selected topics
        if (questionsToUse.length === 0) {
            alert("Please select at least one topic with available questions.");
            return; // Don't start the game
        }

        // Reset game state
        currentQuestionIndex = 0;
        score = 0;
        if (finalResultsElement) finalResultsElement.classList.add('hidden');
        if (gameScreen) gameScreen.classList.remove('hidden'); // Show game screen

        // Update score display (check if elements exist)
        if (scoreElement) scoreElement.textContent = score;
        if (totalQuestionsElement) totalQuestionsElement.textContent = questionsToUse.length;

        // Shuffle questions for variety
        shuffleArray(questionsToUse);

        // Hide topic selection and show question interface
        if (topicSelectionScreen) topicSelectionScreen.classList.add('hidden');

        // Load the first question
        loadQuestion(); // Pass questionsToUse implicitly via global scope
    }

    // Fisher-Yates shuffle algorithm
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Swap elements
        }
    }

    function loadQuestion() {
        // Reset state from previous question
        if (feedbackElement) {
            feedbackElement.classList.add('hidden'); // Use classList for consistency
            feedbackElement.classList.remove('feedback-correct', 'feedback-incorrect'); // Clear state classes
            feedbackElement.innerHTML = '';
        }
        if (submitButton) {
            submitButton.classList.remove('hidden');
            submitButton.disabled = true; // Disable until an answer is selected
        }
        if (nextButton) {
            nextButton.classList.add('hidden');
        }
        selectedAnswerIndex = null;

        // Check if questionsToUse is populated and index is valid
        if (!questionsToUse || questionsToUse.length === 0 || currentQuestionIndex >= questionsToUse.length) {
            console.error("Error loading question: questionsToUse is invalid or index out of bounds.");
            showFinalResults(); // Go to results if questions run out or error
            return;
        }

        const currentQuestion = questionsToUse[currentQuestionIndex];

        // Display Question (check element exists)
        if (questionTextElement) {
            questionTextElement.textContent = `(${currentQuestion.topic}) ${currentQuestion.question}`;
        } else {
            console.error("Question text element not found!");
        }


        // Display Reference Material (check element exists)
        if (referenceContentElement) {
            referenceContentElement.innerHTML = ''; // Clear previous references
            if (currentQuestion.resources) {
                currentQuestion.resources.forEach(res => {
                    const p = document.createElement('p');
                    p.innerHTML = res; // Use innerHTML to parse <code> tags etc.
                    referenceContentElement.appendChild(p);
                });
            }
        } else {
            console.error("Reference content element not found!");
        }


        // Display Answer Options based on question type (check element exists)
        if (answerOptionsElement) {
            answerOptionsElement.innerHTML = ''; // Clear previous options

            if (currentQuestion.type === 'fill-blank') {
                // Create a text input for fill-in-the-blank
                const inputField = document.createElement('input');
                inputField.type = 'text';
                inputField.id = 'fill-blank-input';
                inputField.placeholder = 'Type your answer here...';
                inputField.classList.add('fill-blank-input');

                inputField.addEventListener('input', () => {
                    if (submitButton) { // Check submitButton exists
                         submitButton.disabled = inputField.value.trim() === '';
                    }
                });

                inputField.addEventListener('keyup', (event) => {
                    // Check submitButton exists and is not disabled
                    if (event.key === 'Enter' && submitButton && !submitButton.disabled) {
                        handleSubmit();
                    }
                });

                answerOptionsElement.appendChild(inputField);
                // Focus the input field automatically
                 setTimeout(() => inputField.focus(), 0);
            } else {
                // Default to multiple choice
                if (currentQuestion.options) { // Check if options exist
                    currentQuestion.options.forEach((option, index) => {
                        const button = document.createElement('button');
                        button.innerHTML = option; // Use innerHTML for code formatting
                        button.dataset.index = index; // Store the index
                        button.classList.add('option-btn');
                        button.addEventListener('click', () => handleOptionSelect(button, index));
                        answerOptionsElement.appendChild(button);
                    });
                } else {
                     console.error("Question is missing 'options' array:", currentQuestion);
                }
            }
        } else {
             console.error("Answer options element (#input-area) not found!");
        }


        // Set up simulation preview if available
        // Clear previous simulation first
        let simContainer = document.getElementById('simulation-preview');
        if (simContainer) {
            simContainer.innerHTML = ''; // Clear previous simulation
            simContainer.classList.add('hidden'); // Hide until needed
        }
        if (currentQuestion.simulation) {
            // Simulation display logic might go here or in handleSubmit/setupSimulationPreview
        }
    }

    function handleOptionSelect(button, index) {
        // Ensure answerOptionsElement exists before querying it
         if (!answerOptionsElement) return;

        // Remove 'selected' class from previously selected button (if any)
        const previouslySelected = answerOptionsElement.querySelector('.option-btn.selected');
        if (previouslySelected) {
            previouslySelected.classList.remove('selected');
        }

        // Add 'selected' class to the clicked button
        button.classList.add('selected');
        selectedAnswerIndex = index;

        // Enable submit button (check it exists)
        if (submitButton) submitButton.disabled = false;
    }

    function handleSubmit() {
         // Ensure essential elements exist
        if (!feedbackElement || !submitButton || !nextButton || !answerOptionsElement) {
            console.error("Cannot handle submit - core elements missing.");
            return;
        }
         // Ensure question data is valid
        if (!questionsToUse || currentQuestionIndex >= questionsToUse.length) {
            console.error("Cannot handle submit - invalid question state.");
            showFinalResults();
            return;
        }

        const currentQuestion = questionsToUse[currentQuestionIndex];
        let isCorrect = false;

        submitButton.classList.add('hidden'); // Hide submit button
        nextButton.classList.remove('hidden'); // Show next button

        if (currentQuestion.type === 'fill-blank') {
            const inputField = document.getElementById('fill-blank-input');
            if (inputField) { // Check if input field exists
                const userAnswer = inputField.value.trim();
                // Case-insensitive comparison
                isCorrect = userAnswer.toLowerCase() === (currentQuestion.correctAnswer || '').toLowerCase();
                inputField.disabled = true; // Disable input after submission
                feedbackElement.innerHTML = `Your answer: ${userAnswer}<br>`; // Show user's answer
            } else {
                console.error("Fill-blank input field not found during submit.");
                feedbackElement.innerHTML = 'Error processing answer.<br>';
            }

        } else {
            // Multiple choice
            if (selectedAnswerIndex === null) {
                 console.warn("Submit called with no answer selected.");
                 // Re-show submit, hide next if needed? Or just proceed as incorrect?
                 // For simplicity, treat as incorrect or just return
                 // Let's treat as incorrect for now.
                 feedbackElement.innerHTML = 'No answer selected.<br>';
                 isCorrect = false; // Ensure isCorrect is false
                 // Disable buttons anyway
                 answerOptionsElement.querySelectorAll('.option-btn').forEach(btn => {
                    btn.disabled = true;
                 });

            } else {
                isCorrect = selectedAnswerIndex === currentQuestion.correctIndex;

                 // Disable all option buttons after submission
                answerOptionsElement.querySelectorAll('.option-btn').forEach(btn => {
                    btn.disabled = true;
                    // Highlight correct and incorrect answers
                    const btnIndex = parseInt(btn.dataset.index);
                    if (btnIndex === currentQuestion.correctIndex) {
                        btn.classList.add('correct');
                    } else if (btnIndex === selectedAnswerIndex) {
                        // Only add 'incorrect' if it wasn't the correct one already highlighted
                        if (!btn.classList.contains('correct')) {
                             btn.classList.add('incorrect');
                        }
                    }
                });
            }
        }


        // Display Feedback
        if (isCorrect) {
            score++;
            feedbackElement.innerHTML += `<b>Correct!</b> ${currentQuestion.explanation || ''}`;
            feedbackElement.classList.remove('hidden', 'feedback-incorrect');
            feedbackElement.classList.add('feedback-correct');
        } else {
            // Append to existing message (e.g., "No answer selected" or "Your answer: ...")
            feedbackElement.innerHTML += `<b>Incorrect.</b> ${currentQuestion.explanation || ''}`;
             if (currentQuestion.type !== 'fill-blank') {
                  // Check options exist before accessing
                 if(currentQuestion.options && currentQuestion.correctIndex < currentQuestion.options.length){
                    feedbackElement.innerHTML += `<br>Correct answer was: ${currentQuestion.options[currentQuestion.correctIndex]}`;
                 }
             } else {
                 feedbackElement.innerHTML += `<br>Correct answer was: ${currentQuestion.correctAnswer || 'N/A'}`;
             }
            feedbackElement.classList.remove('hidden', 'feedback-correct');
            feedbackElement.classList.add('feedback-incorrect');
        }

        // Update score display (check element exists)
        if (scoreElement) scoreElement.textContent = score;

        // Show simulation if available
        if (currentQuestion.simulation) {
            setupSimulationPreview(currentQuestion.simulation);
             let simContainer = document.getElementById('simulation-preview');
             if(simContainer) simContainer.classList.remove('hidden');
        }
    }

    function handleNext() {
        currentQuestionIndex++;
        if (currentQuestionIndex < questionsToUse.length) {
            loadQuestion();
        } else {
            showFinalResults();
        }
    }

    function showFinalResults() {
        // Check elements exist before manipulating
        if (gameScreen) gameScreen.classList.add('hidden'); // Hide game screen
        if (finalResultsElement) finalResultsElement.classList.remove('hidden'); // Show final results
        if (finalScoreElement) finalScoreElement.textContent = score;
        if (finalTotalElement) finalTotalElement.textContent = questionsToUse.length > 0 ? questionsToUse.length : questions.length; // Show total attempted or total possible if 0 attempted
    }

    function restartGame() {
        // Reset state and show topic selection again
        if (finalResultsElement) finalResultsElement.classList.add('hidden');
        if (topicSelectionScreen) topicSelectionScreen.classList.remove('hidden');
        if (gameScreen) gameScreen.classList.add('hidden');

        // Optional: Reset topic selections visually to 'All' (uncomment if desired)
        /*
        const allButton = document.querySelector('.topic-btn[data-topic="all"]');
        if (allButton) {
            allButton.classList.add('selected');
            topicButtons.forEach(btn => {
                if (btn && btn !== allButton) btn.classList.add('selected');
            });
            updateSelectedTopicsArray(); // Update internal array
        }
        */

        // Reset score display potentially
        if (scoreElement) scoreElement.textContent = 0;
        if (totalQuestionsElement) totalQuestionsElement.textContent = questions.length; // Show total possible initially
    }

    // --- Simulation Preview Functions --- (Placeholder) ---
    function setupSimulationPreview(simulation) {
        let simContainer = document.getElementById('simulation-preview');
        if (!simContainer) {
            console.log("Creating simulation-preview container.");
            simContainer = document.createElement('div');
            simContainer.id = 'simulation-preview';
            simContainer.classList.add('simulation-preview');
            // Insert after reference material or another suitable place
            const referenceContainer = document.querySelector('.reference-container');
             if (referenceContainer && referenceContainer.parentNode) {
                 referenceContainer.parentNode.insertBefore(simContainer, referenceContainer.nextSibling);
             } else if (questionContainer) { // Fallback: append to question container
                  questionContainer.appendChild(simContainer);
             } else if (gameScreen) { // Fallback 2: append to game screen
                 gameScreen.appendChild(simContainer);
             }
             else {
                 console.error("Could not find a place to insert simulation preview.");
                 return; // Exit if no container found
             }
        }
        simContainer.innerHTML = ''; // Clear previous content
        simContainer.classList.remove('hidden'); // Make sure it's visible

        const header = document.createElement('h3');
        header.textContent = 'Simulation / Visualization';
        simContainer.appendChild(header);

        const simContent = document.createElement('div');
        simContent.classList.add('sim-content');

        // Basic display for now, expand later
        const pre = document.createElement('pre');
        pre.textContent = JSON.stringify(simulation, null, 2); // Pretty print JSON
        simContent.appendChild(pre);

        // TODO: Add more specific simulation rendering based on type later
        // switch (simulation.type) {
        //     case 'register-view': createRegisterView(simContent, simulation); break;
        //     // ... other cases
        //     default: simContent.innerHTML = '<p>Simulation details appear here.</p>';
        // }

        simContainer.appendChild(simContent);
    }

    // --- Helper to update selectedTopics array based on button classes ---
    function updateSelectedTopicsArray() {
          const specificTopicButtons = document.querySelectorAll('.topic-btn:not([data-topic="all"])');
          selectedTopics = Array.from(specificTopicButtons)
                             .filter(btn => btn && btn.classList.contains('selected')) // Added null check for safety
                             .map(btn => btn.dataset.topic);
          console.log("Updated Selected Topics:", selectedTopics);
    }


    // --- Event Listeners --- (With null checks)

    // Start button
    if (startButton) {
        startButton.addEventListener('click', startGame);
    } else {
        console.error("Start button (#start-btn) not found!");
    }

    // Next button
    if (nextButton) {
        nextButton.addEventListener('click', handleNext);
    } else {
        console.error("Next button (#next-btn) not found!");
    }

     // Submit button
     if (submitButton) {
         submitButton.addEventListener('click', handleSubmit);
     } else {
         console.error("Submit button (#submit-btn) not found!");
     }

    // Restart button
    if (restartButton) {
        restartButton.addEventListener('click', restartGame);
    } else {
        console.error("Restart button (#restart-btn) not found!");
    }

    // Topic selection buttons
    topicButtons.forEach(button => {
        if (button) { // Check if the button element exists
            button.addEventListener('click', () => {
                // 'button' variable is valid within this handler's scope
                const topic = button.dataset.topic;
                const isSelected = button.classList.contains('selected');
                const allButton = document.querySelector('.topic-btn[data-topic="all"]');
                const specificTopicButtons = document.querySelectorAll('.topic-btn:not([data-topic="all"])');

                if (topic === 'all') {
                    if (!isSelected) {
                        // Selecting 'all'
                        button.classList.add('selected');
                        specificTopicButtons.forEach(btn => {
                            if(btn) btn.classList.add('selected'); // Check btn exists
                        });
                    } else {
                        // Deselecting 'all'
                        button.classList.remove('selected');
                        specificTopicButtons.forEach(btn => {
                            if(btn) btn.classList.remove('selected'); // Check btn exists
                        });
                    }
                } else {
                    // Clicked a specific topic button
                    button.classList.toggle('selected'); // Toggle this specific button

                    // Check if all specific topics are now selected
                    // Ensure 'every' checks that btn exists before accessing classList
                    const allSpecificSelected = Array.from(specificTopicButtons).every(btn => btn && btn.classList.contains('selected'));
                    if (allButton) { // Check if 'all' button exists
                        if (allSpecificSelected) {
                            allButton.classList.add('selected'); // Select 'all' visually
                        } else {
                            allButton.classList.remove('selected'); // Deselect 'all' if any specific is deselected
                        }
                    }
                }
                // Update the internal selectedTopics array after any button click
                updateSelectedTopicsArray();
            });
        } else {
             console.error("A topic button element was null during listener setup.");
        }
    });

    // --- Initial Setup ---
    function initializeGameUI() {
        // Ensure 'All Topics' is selected by default visually and logically
        const allButtonInitial = document.querySelector('.topic-btn[data-topic="all"]');
        if (allButtonInitial) {
            allButtonInitial.classList.add('selected');
            // Also select all specific buttons initially if 'All' means all
            topicButtons.forEach(btn => {
                 if (btn && btn !== allButtonInitial) btn.classList.add('selected');
            });
            updateSelectedTopicsArray(); // Initialize with all topics selected
        } else {
            // If no 'All' button, maybe select none or the first one? Or just update array.
            updateSelectedTopicsArray();
        }

        // Hide game/results areas initially
        if (gameScreen) gameScreen.classList.add('hidden');
        if (finalResultsElement) finalResultsElement.classList.add('hidden');
        if (nextButton) nextButton.classList.add('hidden'); // Ensure next is hidden initially
        if (submitButton) submitButton.disabled = true; // Start with submit disabled

        // Show topic selection
        if (topicSelectionScreen) topicSelectionScreen.classList.remove('hidden');
    }

    // Run initial setup
    initializeGameUI();

}); // End of DOMContentLoaded listener