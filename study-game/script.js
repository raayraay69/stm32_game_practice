// DOM Element References
const questionTextElement = document.getElementById('question-text');
const referenceContentElement = document.getElementById('reference-content');
const answerOptionsElement = document.getElementById('answer-options');
const submitButton = document.getElementById('submit-btn');
const nextButton = document.getElementById('next-btn');
const feedbackElement = document.getElementById('feedback');
const scoreElement = document.getElementById('score');
const totalQuestionsElement = document.getElementById('total-questions');
const quizAreaElement = document.querySelector('.quiz-area');
const finalResultsElement = document.getElementById('final-results');
const finalScoreElement = document.getElementById('final-score');
const finalTotalElement = document.getElementById('final-total');
const restartButton = document.getElementById('restart-btn');
const setupContainer = document.getElementById('setup-container');
const mainContainer = document.getElementById('main-container');
const startSelectedButton = document.getElementById('start-selected-btn');
const topicErrorElement = document.getElementById('topic-error');
const topicBreakdownElement = document.getElementById('topic-breakdown');

// Global variables
let currentQuestionIndex = 0;
let score = 0;
let selectedAnswerIndex = null; // Track which button is clicked
let filteredQuestions = [];
let topicScores = {};
let questionsToUse = [];

// --- Questions Database ---
const questions = [
    // RCC Questions
    {
        topic: "RCC",
        type: "multiple-choice",
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
        explanation: "The GPIO ports (A, B, C...) are connected to the AHB bus. Their clocks are enabled via the RCC_AHBENR register."
    },
    {
        topic: "RCC",
        type: "fill-blank",
        question: "What is the name of the bit in RCC->AHBENR that enables the GPIOC clock? (Write the exact macro name)",
        resources: [
            "<b>RCC AHBENR Register:</b> Controls clocks for AHB bus peripherals.",
            "Available macros from stm32f0xx.h:",
            "<code>RCC_AHBENR_GPIOAEN</code>",
            "<code>RCC_AHBENR_GPIOBEN</code>",
            "<code>RCC_AHBENR_GPIOCEN</code>",
            "<code>RCC_AHBENR_GPIODEN</code>"
        ],
        correctAnswer: "RCC_AHBENR_GPIOCEN",
        explanation: "The GPIOC clock is enabled using the RCC_AHBENR_GPIOCEN bit in the AHBENR register. Always enable the clock for a peripheral before configuring it."
    },
    {
        topic: "RCC",
        type: "multiple-choice",
        question: "What is the proper sequence for enabling and using a peripheral?",
        resources: [
            "From the STM32F0 reference manual:",
            "Peripherals must be properly initialized before use.",
            "The clock to a peripheral must be enabled before any register access."
        ],
        options: [
            "1. Configure peripheral, 2. Enable peripheral clock, 3. Enable peripheral",
            "1. Enable peripheral, 2. Enable peripheral clock, 3. Configure peripheral",
            "1. Enable peripheral clock, 2. Configure peripheral, 3. Enable peripheral",
            "1. Configure peripheral, 2. Enable peripheral, 3. Enable peripheral clock"
        ],
        correctIndex: 2,
        explanation: "The correct sequence is: 1. Enable the clock to the peripheral via RCC, 2. Configure the peripheral's registers, 3. Enable the peripheral (if needed by a specific enable bit). You cannot access a peripheral's registers without first enabling its clock."
    },
    
    // GPIO Questions
    {
        topic: "GPIO",
        type: "multiple-choice",
        question: "What value should be written to the 2-bit field in the GPIOC->MODER register to configure pin PC6 for 'Alternate function mode'?",
        resources: [
            "<b>GPIOx MODER Register (Port mode register):</b> Each pin 'y' is configured by bits 2y+1 and 2y.",
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
        explanation: "The value '10' sets a GPIO pin to Alternate Function mode, allowing it to be used by peripherals like Timers or SPI."
    },
    {
        topic: "GPIO",
        type: "multiple-choice",
        question: "Which C code snippet correctly enables the clock for GPIOC and sets PC4 and PC5 to general purpose output mode?",
        resources: [
            "<b>RCC AHBENR Register:</b> Bit 19: <code>IOPCEN</code>",
            "<b>GPIOC MODER Register:</b> Bits 8-9 for PC4, Bits 10-11 for PC5.",
            "Output mode value: <code>01</code>.",
            "Use bitwise OR (<code>|=</code>) to set bits without affecting others.",
            "Use bitwise AND NOT (<code>&= ~</code>) to clear bits before setting.",
            "Example clearing PC4: <code>GPIOC->MODER &= ~(0x3 << (4*2));</code>",
            "Example setting PC4 to output: <code>GPIOC->MODER |= (0x1 << (4*2));</code>"
        ],
        options: [
            "<code>RCC->AHBENR |= RCC_AHBENR_GPIOCEN; GPIOC->MODER |= 0x5 << 8;</code>", // Incorrect logic/masking
            "<code>RCC->APB1ENR |= RCC_APB1ENR_IOPCEN; GPIOC->MODER = 0x00000500;</code>", // Incorrect RCC reg, direct assignment bad
            "<code>RCC->AHBENR |= RCC_AHBENR_GPIOCEN; GPIOC->MODER &= ~(0xf << 8); GPIOC->MODER |= (0x5 << 8);</code>", // Correct
            "<code>RCC->AHBENR &= ~RCC_AHBENR_GPIOCEN; GPIOC->MODER |= (0xa << 8);</code>" // Disables clock, wrong mode value
        ],
        correctIndex: 2,
        explanation: "Enable clock via RCC_AHBENR. Clear the MODER bits for PC4 & PC5 using <code>&= ~</code> and a mask (0xf covering bits 8-11). Then, set the bits for output mode (01 for PC4, 01 for PC5, combined is 0101 binary or 0x5) using <code>|=</code>."
    },
    
    // Interrupts Questions
    {
        topic: "Interrupts",
        type: "multiple-choice",
        question: "After enabling an interrupt in a peripheral (e.g., setting UIE in TIM7_DIER) and configuring EXTI/SYSCFG if needed, what must be done to allow the CPU to respond to that interrupt?",
        resources: [
            "<b>Peripheral Interrupt Enable:</b> e.g., TIM_DIER_UIE.",
            "<b>NVIC (Nested Vectored Interrupt Controller):</b> Manages interrupt priorities and enables/disables interrupts CPU-side.",
            "<b>NVIC_EnableIRQ(IRQn_Type IRQn):</b> Function to enable a specific interrupt line in the NVIC.",
            "<b>NVIC_SetPriority(IRQn_Type IRQn, uint32_t priority):</b> Sets interrupt priority."
        ],
        options: [
            "Set the global interrupt enable bit in the CPU's status register",
            "Call the corresponding Interrupt Service Routine (ISR) function manually",
            "Enable the corresponding interrupt line in the NVIC using `NVIC_EnableIRQ()`",
            "Clear the interrupt pending flag in the peripheral"
        ],
        correctIndex: 2,
        explanation: "Even if a peripheral generates an interrupt request, the CPU won't process it unless that specific interrupt line is enabled in the NVIC (Nested Vectored Interrupt Controller) using functions like `NVIC_EnableIRQ()`."
    },
    {
        topic: "Interrupts",
        type: "fill-blank",
        question: "What is the name of the ISR function for Timer 7 interrupt? (Write the exact function name)",
        resources: [
            "<b>Interrupt Service Routine (ISR) Naming Convention:</b>",
            "ISR functions follow the naming pattern: <code>[PERIPHERAL]_IRQHandler</code>",
            "Example: <code>TIM2_IRQHandler</code>, <code>EXTI0_1_IRQHandler</code>",
            "These names must match exactly what the system expects for the correct interrupt to be handled."
        ],
        correctAnswer: "TIM7_IRQHandler",
        explanation: "The ISR for Timer 7 is named 'TIM7_IRQHandler'. The exact name is crucial - if it's different, the system won't call your function when the interrupt occurs."
    },
    {
        topic: "Interrupts",
        type: "multiple-choice",
        question: "What must be done at the beginning of a Timer interrupt handler (ISR)?",
        resources: [
            "<b>Example from Lab 4:</b>",
            "<code>void TIM7_IRQHandler(void) {</code>",
            "<code>    // Clear update interrupt flag</code>",
            "<code>    TIM7->SR &= ~TIM_SR_UIF;</code>",
            "<code>    // Rest of handler code...</code>",
            "<code>}</code>"
        ],
        options: [
            "Enable the interrupt in NVIC",
            "Clear the update interrupt flag in the timer's SR register",
            "Disable the timer",
            "Set the timer's UIF bit"
        ],
        correctIndex: 1,
        explanation: "You must clear the update interrupt flag (UIF) in the timer's Status Register (SR) at the beginning of the ISR. This prevents the same interrupt from being triggered again immediately."
    }
];

// Add more topics and questions as needed

// --- Functions ---

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
}

// Populates the topic selection checkboxes
function populateTopicSelection() {
    const topics = [...new Set(questions.map(q => q.topic))]; // Get unique topics
    const topicSelectionDiv = document.getElementById('topic-selection');
    topicSelectionDiv.innerHTML = ''; // Clear previous
    topics.sort().forEach(topic => {
        const id = `topic-${topic.replace(/\s+/g, '-')}`; // Create valid ID
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = id;
        checkbox.value = topic;
        checkbox.name = 'topics';

        const label = document.createElement('label');
        label.htmlFor = id;
        label.textContent = topic;

        topicSelectionDiv.appendChild(checkbox);
        topicSelectionDiv.appendChild(label);
    });
}

// Start the quiz game
function startGame(useFiltered = false) {
    const questionsToUse = useFiltered ? filteredQuestions : questions;
    if (questionsToUse.length === 0) {
        alert("No questions available for the selected topics!"); // Handle edge case
        // Optionally, show setup again
        document.getElementById('setup-container').style.display = 'block';
        document.getElementById('main-container').style.display = 'none';
        return;
    }
    
    // Reset state
    currentQuestionIndex = 0;
    score = 0;
    finalResultsElement.style.display = 'none';
    quizAreaElement.style.display = 'block';
    // Use questionsToUse.length for total
    totalQuestionsElement.textContent = questionsToUse.length;
    scoreElement.textContent = score;
    
    // Initialize topic scores
    topicScores = {};
    questionsToUse.forEach(q => {
        if (!topicScores[q.topic]) {
            topicScores[q.topic] = { correct: 0, total: 0, pointsCorrect: 0, pointsTotal: 0 };
        }
        // Initialize points if not present, default to 1
        q.points = q.points || 1;
        topicScores[q.topic].total++;
        topicScores[q.topic].pointsTotal += q.points;
    });
    
    shuffleArray(questionsToUse); // Shuffle the selected questions
    loadQuestion(questionsToUse); // Pass the array to loadQuestion
}

// Load a question
function loadQuestion(questionsToUse) {
    // Reset state from previous question
    feedbackElement.className = 'feedback-hidden'; // Hide feedback
    feedbackElement.innerHTML = '';
    submitButton.style.display = 'block';
    nextButton.style.display = 'none';
    submitButton.disabled = true; // Disable until an answer is selected
    selectedAnswerIndex = null;

    const currentQuestion = questionsToUse[currentQuestionIndex];

    // Display Question
    questionTextElement.textContent = `(${currentQuestion.topic}) ${currentQuestion.question}`;

    // Display Reference Material
    referenceContentElement.innerHTML = ''; // Clear previous references
    currentQuestion.resources.forEach(res => {
        const p = document.createElement('p');
        p.innerHTML = res; // Use innerHTML to parse <code> tags etc.
        referenceContentElement.appendChild(p);
    });

    // Display Answer Options based on question type
    answerOptionsElement.innerHTML = ''; // Clear previous options
    
    if (currentQuestion.type === 'fill-blank') {
        answerOptionsElement.innerHTML = `
            <input type="text" id="fill-blank-input" placeholder="Type your answer here...">
        `;
        // Add event listener to enable submit button on input
        const inputField = document.getElementById('fill-blank-input');
        inputField.addEventListener('input', () => {
            submitButton.disabled = inputField.value.trim() === '';
        });
        // Allow submitting with Enter key
        inputField.addEventListener('keyup', (event) => {
            if (event.key === 'Enter' && !submitButton.disabled) {
                handleSubmit(questionsToUse);
            }
        });
    } else { // Default is multiple-choice
        currentQuestion.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.innerHTML = option; // Use innerHTML for code formatting
            button.dataset.index = index; // Store the index
            button.addEventListener('click', () => handleOptionSelect(button, index));
            answerOptionsElement.appendChild(button);
        });
    }
}

// Handle option selection
function handleOptionSelect(selectedButton, index) {
    // Remove 'selected' class from previously selected button (if any)
    const previouslySelected = answerOptionsElement.querySelector('.selected');
    if (previouslySelected) {
        previouslySelected.classList.remove('selected');
    }

    // Add 'selected' class to the clicked button
    selectedButton.classList.add('selected');
    selectedAnswerIndex = index;
    submitButton.disabled = false; // Enable submit button
}

// Handle submit button click
function handleSubmit(questionsToUse) {
    const currentQuestion = questionsToUse[currentQuestionIndex];
    let correct = false;
    
    if (currentQuestion.type === 'fill-blank') {
        const inputField = document.getElementById('fill-blank-input');
        const userAnswer = inputField.value.trim();
        // Case-insensitive comparison, or adjust as needed
        correct = userAnswer.toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
        inputField.disabled = true; // Disable input after submit

        // Add visual feedback to input if needed (optional)
        if (correct) {
            inputField.style.borderColor = '#2ecc71'; // Green border
            inputField.style.backgroundColor = '#eafaf1';
        } else {
            inputField.style.borderColor = '#e74c3c'; // Red border
            inputField.style.backgroundColor = '#fdedec';
        }
    } else { // Multiple choice
        if (selectedAnswerIndex === null) return;
        
        // Disable option buttons
        const optionButtons = answerOptionsElement.querySelectorAll('button');
        optionButtons.forEach(button => {
            button.disabled = true;
            // Highlight correct and incorrect answers
            const buttonIndex = parseInt(button.dataset.index);
            if (buttonIndex === currentQuestion.correctIndex) {
                button.classList.add('correct');
            } else if (buttonIndex === selectedAnswerIndex) {
                button.classList.add('incorrect');
            }
        });
        
        correct = selectedAnswerIndex === currentQuestion.correctIndex;
    }

    // Update topic scores
    const currentTopic = currentQuestion.topic;
    if (correct) {
        topicScores[currentTopic].correct++;
        topicScores[currentTopic].pointsCorrect += currentQuestion.points;
        score++;
    }
    
    // Update overall score display
    scoreElement.textContent = score;

    // Display feedback
    if (correct) {
        feedbackElement.innerHTML = "Correct!";
        feedbackElement.className = 'feedback-correct';
    } else {
        let explanationText = '';
        if (currentQuestion.type === 'fill-blank') {
            explanationText = `Incorrect. Expected: <code>${currentQuestion.correctAnswer}</code>. <span>${currentQuestion.explanation}</span>`;
        } else {
            explanationText = `Incorrect. <span>${currentQuestion.explanation}</span>`;
        }
        feedbackElement.innerHTML = explanationText;
        feedbackElement.className = 'feedback-incorrect';
    }

    // Show Next button, hide Submit button
    submitButton.style.display = 'none';
    if (currentQuestionIndex < questionsToUse.length - 1) {
        nextButton.style.display = 'block';
    } else {
        // Last question, show results button with delay
        setTimeout(() => showFinalResults(questionsToUse), 1500);
    }
}

// Handle next question button click
function handleNextQuestion(questionsToUse) {
    currentQuestionIndex++;
    loadQuestion(questionsToUse);
}

// Show final results
function showFinalResults(questionsToUse) {
    quizAreaElement.style.display = 'none';
    finalResultsElement.style.display = 'block';
    
    const overallPoints = Object.values(topicScores).reduce((sum, ts) => sum + ts.pointsCorrect, 0);
    const overallTotalPoints = Object.values(topicScores).reduce((sum, ts) => sum + ts.pointsTotal, 0);

    finalScoreElement.textContent = score;
    finalTotalElement.textContent = questionsToUse.length;

    // Add breakdown display
    topicBreakdownElement.innerHTML = '<h3>Score by Topic:</h3>';
    let breakdownHtml = '<ul>';
    
    // Sort topics alphabetically for consistent display
    const sortedTopics = Object.keys(topicScores).sort();
    sortedTopics.forEach(topic => {
        const ts = topicScores[topic];
        // Display both count and points
        breakdownHtml += `<li>${topic}: ${ts.correct}/${ts.total} questions (${ts.pointsCorrect}/${ts.pointsTotal} points)</li>`;
    });
    
    breakdownHtml += '</ul>';
    topicBreakdownElement.innerHTML += breakdownHtml;
}

// --- Event Listeners ---
// Start button click
startSelectedButton.addEventListener('click', () => {
    const selectedCheckboxes = document.querySelectorAll('#topic-selection input[name="topics"]:checked');
    const selectedTopics = Array.from(selectedCheckboxes).map(cb => cb.value);
    
    if (selectedTopics.length === 0) {
        topicErrorElement.style.display = 'block'; // Show error message
        return;
    }
    
    topicErrorElement.style.display = 'none'; // Hide error message
    filteredQuestions = questions.filter(q => selectedTopics.includes(q.topic));
    
    // Hide setup, show main quiz
    setupContainer.style.display = 'none';
    mainContainer.style.display = 'block';
    
    startGame(true); // Pass flag to use filtered questions
});

// Submit button click
submitButton.addEventListener('click', () => handleSubmit(questionsToUse));

// Next button click
nextButton.addEventListener('click', () => handleNextQuestion(questionsToUse));

// Restart button click
restartButton.addEventListener('click', () => {
    mainContainer.style.display = 'none';
    setupContainer.style.display = 'block';
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    populateTopicSelection();
    questionsToUse = questions;
});
