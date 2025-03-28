// script.js
// Main application logic for the STM32 study game.

// Import the questions data from the separate file
import { questions } from './questions.js'; // Ensure the path is correct

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const questionTextElement = document.getElementById('question-text');
    const referenceContentElement = document.getElementById('reference-content');
    const answerOptionsElement = document.getElementById('input-area');
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
    const questionContainer = document.querySelector('.question-container'); // Used implicitly? Keep if needed.

    // --- Global variables ---
    let currentQuestionIndex = 0;
    let score = 0;
    let selectedAnswerIndex = null;
    let questionsToUse = [];
    let selectedTopics = [];

    // --- Functions ---

    function startGame() {
        const allButton = document.querySelector('.topic-btn[data-topic="all"]');
        const useAllTopics = allButton && allButton.classList.contains('selected');

        if (!useAllTopics && selectedTopics.length > 0) {
            questionsToUse = questions.filter(q => selectedTopics.includes(q.topic));
        } else {
            questionsToUse = [...questions];
        }

        if (questionsToUse.length === 0) {
            alert("Please select at least one topic with available questions.");
            return;
        }

        currentQuestionIndex = 0;
        score = 0;
        if (finalResultsElement) finalResultsElement.classList.add('hidden');
        if (topicSelectionScreen) topicSelectionScreen.classList.add('hidden');
        if (gameScreen) gameScreen.classList.remove('hidden');

        if (scoreElement) scoreElement.textContent = score;
        if (totalQuestionsElement) totalQuestionsElement.textContent = questionsToUse.length;

        shuffleArray(questionsToUse);
        loadQuestion();
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function loadQuestion() {
        // Reset UI elements
        if (feedbackElement) {
            feedbackElement.classList.add('hidden');
            feedbackElement.classList.remove('feedback-correct', 'feedback-incorrect');
            feedbackElement.innerHTML = '';
        }
        if (submitButton) {
            submitButton.classList.remove('hidden');
            submitButton.disabled = true;
        }
        if (nextButton) {
            nextButton.classList.add('hidden');
        }
        selectedAnswerIndex = null;

        if (!questionsToUse || questionsToUse.length === 0 || currentQuestionIndex >= questionsToUse.length) {
            console.error("Error loading question: questionsToUse is invalid or index out of bounds.");
            showFinalResults();
            return;
        }

        const currentQuestion = questionsToUse[currentQuestionIndex];

        // Display Question Text
        if (questionTextElement) {
            questionTextElement.innerHTML = ''; // Clear previous
            const topicTag = document.createElement('span');
            topicTag.classList.add('topic-tag');
            topicTag.textContent = currentQuestion.topic;
            questionTextElement.appendChild(topicTag);
            questionTextElement.appendChild(document.createTextNode(` ${currentQuestion.question}`));
        } else {
            console.error("Question text element not found!");
        }

        // Display Reference Material
        if (referenceContentElement) {
            referenceContentElement.innerHTML = '';
            if (currentQuestion.resources) {
                currentQuestion.resources.forEach(res => {
                    const p = document.createElement('p');
                    p.innerHTML = res; // Allows <b>, <code> etc.
                    referenceContentElement.appendChild(p);
                });
            }
        } else {
            console.error("Reference content element not found!");
        }

        // Display Answer Options
        if (answerOptionsElement) {
            answerOptionsElement.innerHTML = '';
            if (currentQuestion.type === 'fill-blank') {
                const inputField = document.createElement('input');
                inputField.type = 'text';
                inputField.id = 'fill-blank-input';
                inputField.placeholder = 'Type your answer here...';
                inputField.classList.add('fill-blank-input'); // Use class from CSS
                inputField.addEventListener('input', () => {
                    if (submitButton) submitButton.disabled = inputField.value.trim() === '';
                });
                inputField.addEventListener('keyup', (event) => {
                    if (event.key === 'Enter' && submitButton && !submitButton.disabled) handleSubmit();
                });
                answerOptionsElement.appendChild(inputField);
                setTimeout(() => inputField.focus(), 0);
            } else if (currentQuestion.options) {
                currentQuestion.options.forEach((option, index) => {
                    const button = document.createElement('button');
                    button.innerHTML = option; // Allows <code>
                    button.dataset.index = index;
                    button.classList.add('option-btn');
                    button.addEventListener('click', () => handleOptionSelect(button, index));
                    answerOptionsElement.appendChild(button);
                });
            } else {
                console.error("Question is missing 'options' or is not 'fill-blank':", currentQuestion);
            }
        } else {
            console.error("Answer options element (#input-area) not found!");
        }

        // Clear and hide simulation area initially
        let simContainer = document.getElementById('simulation');
        if (simContainer) {
            simContainer.innerHTML = '';
            simContainer.classList.add('hidden');
             // No need to call setupSimulationPreview here, call it in handleSubmit
        }
    }

    function handleOptionSelect(button, index) {
        if (!answerOptionsElement) return;
        const previouslySelected = answerOptionsElement.querySelector('.option-btn.selected');
        if (previouslySelected) previouslySelected.classList.remove('selected');
        button.classList.add('selected');
        selectedAnswerIndex = index;
        if (submitButton) submitButton.disabled = false;
    }

    function handleSubmit() {
        if (!feedbackElement || !submitButton || !nextButton || !answerOptionsElement) {
            console.error("Cannot handle submit - core elements missing.");
            return;
        }
        if (!questionsToUse || currentQuestionIndex >= questionsToUse.length) {
            console.error("Cannot handle submit - invalid question state.");
            showFinalResults();
            return;
        }

        const currentQuestion = questionsToUse[currentQuestionIndex];
        let isCorrect = false;

        submitButton.classList.add('hidden');
        nextButton.classList.remove('hidden');

        // Determine correctness
        if (currentQuestion.type === 'fill-blank') {
            const inputField = document.getElementById('fill-blank-input');
            if (inputField) {
                const userAnswer = inputField.value.trim();
                isCorrect = userAnswer.toLowerCase() === (currentQuestion.correctAnswer || '').toLowerCase();
                inputField.disabled = true;
                feedbackElement.innerHTML = `Your answer: <span class="sim-value color-value">${userAnswer}</span><br>`; // Show user's answer styled
            } else {
                console.error("Fill-blank input field not found during submit.");
                feedbackElement.innerHTML = 'Error processing answer.<br>';
            }
        } else { // Multiple choice
            const buttons = answerOptionsElement.querySelectorAll('.option-btn');
            if (selectedAnswerIndex === null) {
                feedbackElement.innerHTML = 'No answer selected.<br>';
                isCorrect = false;
                buttons.forEach(btn => btn.disabled = true); // Disable anyway
            } else {
                isCorrect = selectedAnswerIndex === currentQuestion.correctIndex;
                buttons.forEach(btn => {
                    btn.disabled = true;
                    const btnIndex = parseInt(btn.dataset.index);
                    if (btnIndex === currentQuestion.correctIndex) {
                        btn.classList.add('correct');
                    } else if (btnIndex === selectedAnswerIndex) {
                        // Add 'incorrect' only if it wasn't the correct one
                        if (!btn.classList.contains('correct')) {
                            btn.classList.add('incorrect');
                        }
                    }
                });
            }
        }

        // Display Feedback Text
        if (isCorrect) {
            score++;
            feedbackElement.innerHTML += `<b>Correct!</b> ${currentQuestion.explanation || ''}`;
            feedbackElement.classList.remove('hidden', 'feedback-incorrect');
            feedbackElement.classList.add('feedback-correct');
        } else {
            feedbackElement.innerHTML += `<b>Incorrect.</b> ${currentQuestion.explanation || ''}`;
            // Show correct answer if provided
            let correctAnswerText = '';
            if (currentQuestion.type === 'fill-blank') {
                 correctAnswerText = currentQuestion.correctAnswer || 'N/A';
            } else if (currentQuestion.options && currentQuestion.correctIndex < currentQuestion.options.length){
                 correctAnswerText = currentQuestion.options[currentQuestion.correctIndex];
            }
            if (correctAnswerText) {
                 // Use innerHTML for potential <code> tags in correct answer
                 feedbackElement.innerHTML += `<br><span>Correct answer was: ${correctAnswerText}</span>`;
            }
            feedbackElement.classList.remove('hidden', 'feedback-correct');
            feedbackElement.classList.add('feedback-incorrect');
        }

        if (scoreElement) scoreElement.textContent = score;

        // --- Display Simulation AFTER checking answer ---
        if (currentQuestion.simulation) {
            setupSimulationPreview(currentQuestion.simulation); // Call the updated function
            let simContainer = document.getElementById('simulation');
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
        if (gameScreen) gameScreen.classList.add('hidden');
        if (finalResultsElement) finalResultsElement.classList.remove('hidden');
        if (finalScoreElement) finalScoreElement.textContent = score;
        if (finalTotalElement) finalTotalElement.textContent = questionsToUse.length > 0 ? questionsToUse.length : questions.length;

        // --- TODO: Add Results Breakdown Logic Here ---
        // You would iterate through questionsToUse, check correctness (needs storing results per question),
        // group by topic, calculate scores, and generate the progress bar HTML for #topic-breakdown.
        const topicBreakdownElement = document.getElementById('topic-breakdown');
        if (topicBreakdownElement) {
             topicBreakdownElement.innerHTML = '<h3>Topic Performance</h3><ul><li>(Breakdown coming soon)</li></ul>'; // Placeholder
        }
        // ---
    }

    function restartGame() {
        if (finalResultsElement) finalResultsElement.classList.add('hidden');
        if (topicSelectionScreen) topicSelectionScreen.classList.remove('hidden');
        if (gameScreen) gameScreen.classList.add('hidden');
        // Reset score display potentially
        if (scoreElement) scoreElement.textContent = 0;
        // Use imported 'questions' length for total possible if needed, or keep 0 until start
        // if (totalQuestionsElement) totalQuestionsElement.textContent = questions.length;
    }

    // --- Simulation Preview Function (ADHD-Friendly Rendering) ---
    function setupSimulationPreview(simulation) {
        let simContainer = document.getElementById('simulation');
        if (!simContainer) {
            console.error("Simulation container (#simulation) not found!");
            return;
        }
        simContainer.innerHTML = ''; // Clear previous
        simContainer.classList.remove('hidden'); // Ensure visible

        const simContent = document.createElement('div');
        simContent.classList.add('sim-content-box'); // Use class from CSS

        let titleText = simulation.type || 'Simulation Details'; // Default title

        // --- Render based on available simulation data ---

        if (simulation.steps) { // Handle types with 'steps' array
            titleText = simulation.description || titleText; // Use description as title if available
             if (simulation.type === "bit-manipulation") titleText = "Register Bit Manipulation";
             else if (simulation.type === "adc-clock-setup") titleText = "ADC Clock Setup Sequence";
             else if (simulation.type === "adc-conversion") titleText = "ADC Conversion Sequence";
             else if (simulation.type === "spi-config") titleText = "SPI Configuration Sequence";
             else if (simulation.type === "interrupt-setup") titleText = "Interrupt Setup Sequence";
             else if (simulation.type === "dac-output") titleText = "DAC Output Setup";


            const stepsList = document.createElement('ol'); // Use ordered list for steps
            stepsList.classList.add('sim-steps-list');
            simulation.steps.forEach(step => {
                const stepItem = document.createElement('li');
                let stepHTML = '';
                if (step.function) {
                     stepHTML += `Call <span class="color-value"><code>${step.function}</code></span>`;
                } else if (step.register) {
                     stepHTML += `Register: <b class="color-register">${step.register}</b> | `;
                     stepHTML += `Operation: <span class="color-value">${step.operation || 'N/A'}</span> | `;
                     if (step.bits) stepHTML += `Bits: <span class="color-bit-num">${step.bits}</span> | `;
                     if (step.value) stepHTML += `Value: <span class="color-value">${step.value}</span> | `;
                     if (step.mask) stepHTML += `Mask: <span class="color-value">${step.mask}</span> | `;
                }
                 stepHTML += `<span class="sim-desc color-desc">${step.description || ''}</span>`;
                stepItem.innerHTML = stepHTML;
                stepsList.appendChild(stepItem);
            });
             simContent.appendChild(stepsList);

        } else if (simulation.type === "register-view") {
            titleText = `Register View: ${simulation.register}`;
             simContent.innerHTML += `
                <div>Register: <b class="color-register">${simulation.register}</b></div>
                <div>Value: <span class="sim-value color-value">${simulation.value || 'N/A'}</span></div>
            `;
            if (simulation.bitFields && Array.isArray(simulation.bitFields)) {
                 const bitsList = document.createElement('ul');
                 bitsList.classList.add('sim-bits-list');
                 simulation.bitFields.forEach(field => {
                    const bitItem = document.createElement('li');
                    bitItem.innerHTML = `
                         <span class="sim-bit">
                            Bits <span class="color-bit-num">${field.bits}</span>
                            (<span class="color-bit-name">${field.name}</span>):
                        </span>
                         <span class="sim-desc color-desc">${field.description}</span>`;
                    bitsList.appendChild(bitItem);
                 });
                 simContent.appendChild(bitsList);
            }
            // Add highlighting logic if 'bitHighlight' is present (requires more complex rendering)
            if (simulation.bitHighlight !== undefined) {
                 simContent.innerHTML += `<p class="sim-desc color-desc">(Highlighting Bit: ${simulation.bitHighlight})</p>`; // Simple indication for now
            }

        } else if (simulation.type === "pin-config") {
             titleText = `Pin Configuration: ${simulation.pin}`;
             simContent.innerHTML += `
                <div>Pin: <b>${simulation.pin}</b></div>
                <div>Mode: <span class="color-value">${simulation.mode || 'N/A'}</span></div>
                <div>Register: <b class="color-register">${simulation.register}</b></div>
                <div>Bit Field: <span class="color-bit-num">${simulation.bitField || 'N/A'}</span></div>
                <div>Resulting Reg Value (approx): <span class="color-value">${simulation.value || 'N/A'}</span></div>
            `;

        } else if (simulation.type === "timer-calculation" || simulation.type === "timer-clock") {
            titleText = "Timer Calculation";
             simContent.innerHTML += `
                <div>System Clock: <span class="color-value">${simulation.systemClock} Hz</span></div>
                ${simulation.psc !== undefined ? `<div>Prescaler (PSC): <span class="color-value">${simulation.psc}</span></div>` : ''}
                ${simulation.prescaler !== undefined ? `<div>Prescaler (PSC): <span class="color-value">${simulation.prescaler}</span></div>` : ''}
                ${simulation.targetFrequency ? `<div>Target Freq: <span class="color-value">${simulation.targetFrequency} Hz</span></div>` : ''}
                ${simulation.formula ? `<div class="sim-formula">Formula: <code>${simulation.formula}</code></div>` : ''}
                ${simulation.result ? `<div>Resulting Timer Clock: <span class="color-value">${simulation.result} Hz</span></div>` : ''}
            `;
        } else if (simulation.type === "timer-pwm-setup") {
             titleText = `PWM Setup: Channel ${simulation.channel}`;
             simContent.innerHTML += `
                 <div>Register: <b class="color-register">${simulation.register}</b></div>
                 <div>Bits (OC${simulation.channel}M): <span class="color-bit-num">${simulation.bits}</span></div>
                 <div>Value for PWM Mode 1: <span class="color-value">${simulation.value}</span> (Binary 110)</div>
             `;
        } else if (simulation.type === "dma-config") {
             titleText = "DMA Configuration";
              simContent.innerHTML += `
                 <div>Register: <b class="color-register">${simulation.register}</b></div>
                 <div>Bits: <span class="color-bit-num">${simulation.bits}</span></div>
                 <div>Value: <span class="color-value">${simulation.value}</span></div>
                 <div class="sim-desc color-desc">${simulation.description || ''}</div>
             `;
        } else if (simulation.type === "dma-transfer") {
             titleText = "DMA Transfer Setup";
             simContent.innerHTML += `
                 <div>Register: <b class="color-register">${simulation.register}</b></div>
                 <div>Value (Count): <span class="color-value">${simulation.value}</span></div>
             `;
             if (simulation.transfer) {
                 simContent.innerHTML += `
                    <div class="sim-transfer-details">
                        Transferring <b>${simulation.transfer.count}</b> items
                        (Size: ${simulation.transfer.dataSize})<br>
                        From: <span class="color-value">${simulation.transfer.source}</span> <br>
                        To: <span class="color-register">${simulation.transfer.destination}</span>
                    </div>`;
             }
        } else if (simulation.type === "code-example") {
             titleText = "Code Example";
             const pre = document.createElement('pre');
             const code = document.createElement('code');
             // Basic text setting, consider a highlighting library if needed
             code.textContent = simulation.code;
             // You might add a class for CSS/JS based highlighting, e.g., code.classList.add('language-c');
             pre.appendChild(code);
             simContent.appendChild(pre);
        }
        else {
            // Default fallback for unknown types or simple structures
             simContent.innerHTML += `<pre>${JSON.stringify(simulation, null, 2)}</pre>`;
        }

        // Add Title Element (Prepended)
        const titleEl = document.createElement('h4');
        titleEl.classList.add('sim-title');
        titleEl.textContent = titleText;
        simContent.prepend(titleEl); // Add title at the beginning

        // --- Add Placeholders for Relevance/Analogy if data were available ---
        /*
        simContent.appendChild(document.createElement('hr'));
        const relevanceEl = document.createElement('p');
        relevanceEl.classList.add('sim-relevance');
        relevanceEl.innerHTML = `<b>Relevance:</b> (Add relevance data to questions.js)`;
        simContent.appendChild(relevanceEl);

        const analogyEl = document.createElement('p');
        analogyEl.classList.add('sim-analogy');
        analogyEl.innerHTML = `<i><b>Analogy:</b> (Add analogy data to questions.js)</i>`;
        simContent.appendChild(analogyEl);
        */
        // ---

        simContainer.appendChild(simContent);
    }


    // --- Helper to update selectedTopics array ---
    function updateSelectedTopicsArray() {
        const specificTopicButtons = document.querySelectorAll('.topic-btn:not([data-topic="all"])');
        selectedTopics = Array.from(specificTopicButtons)
            .filter(btn => btn && btn.classList.contains('selected'))
            .map(btn => btn.dataset.topic);
        // console.log("Updated Selected Topics:", selectedTopics); // Keep for debugging if needed
    }

    // --- Event Listeners ---
    if (startButton) {
        startButton.addEventListener('click', startGame);
    } else { console.error("Start button (#start-btn) not found!"); }

    if (nextButton) {
        nextButton.addEventListener('click', handleNext);
    } else { console.error("Next button (#next-btn) not found!"); }

    if (submitButton) {
        submitButton.addEventListener('click', handleSubmit);
    } else { console.error("Submit button (#submit-btn) not found!"); }

    if (restartButton) {
        restartButton.addEventListener('click', restartGame);
    } else { console.error("Restart button (#restart-btn) not found!"); }

    // New Game / Select New Topics button on results screen
    const newTopicsButton = document.getElementById('new-topics-btn');
    if (newTopicsButton) {
         newTopicsButton.addEventListener('click', restartGame); // Same action as restart for now
    }

    topicButtons.forEach(button => {
        if (button) {
            button.addEventListener('click', () => {
                const topic = button.dataset.topic;
                const isSelected = button.classList.contains('selected');
                const allButton = document.querySelector('.topic-btn[data-topic="all"]');
                const specificTopicButtons = document.querySelectorAll('.topic-btn:not([data-topic="all"])');

                if (topic === 'all') {
                    if (!isSelected) {
                        button.classList.add('selected');
                        specificTopicButtons.forEach(btn => { if(btn) btn.classList.add('selected'); });
                    } else {
                        button.classList.remove('selected');
                        specificTopicButtons.forEach(btn => { if(btn) btn.classList.remove('selected'); });
                    }
                } else {
                    button.classList.toggle('selected');
                    if (allButton) {
                        const allSpecificSelected = Array.from(specificTopicButtons).every(btn => btn && btn.classList.contains('selected'));
                        if (allSpecificSelected) {
                            allButton.classList.add('selected');
                        } else {
                            allButton.classList.remove('selected');
                        }
                    }
                }
                updateSelectedTopicsArray();
            });
        } else {
            console.error("A topic button element was null during listener setup.");
        }
    });

    // --- Initial Setup ---
    function initializeGameUI() {
        const allButtonInitial = document.querySelector('.topic-btn[data-topic="all"]');
        if (allButtonInitial) {
            allButtonInitial.classList.add('selected');
            topicButtons.forEach(btn => { if (btn && btn !== allButtonInitial) btn.classList.add('selected'); });
            updateSelectedTopicsArray();
        } else {
            updateSelectedTopicsArray(); // Initialize even without 'All' button
        }
        if (gameScreen) gameScreen.classList.add('hidden');
        if (finalResultsElement) finalResultsElement.classList.add('hidden');
        if (nextButton) nextButton.classList.add('hidden');
        if (submitButton) submitButton.disabled = true;
        if (topicSelectionScreen) topicSelectionScreen.classList.remove('hidden');
    }

    initializeGameUI();

}); // End of DOMContentLoaded listener

// NOTE: questions.js content is now provided by the user in the prompt,
// so no need to define it here. Just ensure the import path is correct.