// script.js
// Main application logic for the STM32 study game.


document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const questionTextElement = document.getElementById('question-text');
    const referenceContentElement = document.getElementById('reference-content');
    const answerOptionsElement = document.getElementById('input-area'); // Ensure ID matches HTML
    const submitButton = document.getElementById('submit-btn');
    const nextButton = document.getElementById('next-btn');
    const feedbackElement = document.getElementById('feedback-area'); // Ensure ID matches HTML
    const scoreElement = document.getElementById('score');
    const totalQuestionsElement = document.getElementById('total-questions');
    const finalResultsElement = document.getElementById('results-screen'); // Ensure ID matches HTML
    const finalScoreElement = document.getElementById('final-score');
    const finalTotalElement = document.getElementById('final-total');
    const restartButton = document.getElementById('restart-btn');
    const startButton = document.getElementById('start-btn'); // Ensure ID matches HTML
    const topicButtons = document.querySelectorAll('.topic-btn'); // Ensure class matches HTML
    const topicSelectionScreen = document.getElementById('topic-selection-screen'); // Ensure ID matches HTML
    const gameScreen = document.getElementById('game-screen'); // Ensure ID matches HTML
    const newTopicsButton = document.getElementById('new-topics-btn'); // Ensure ID matches HTML

    // --- Global variables ---
    let currentQuestionIndex = 0;
    let score = 0;
    let selectedAnswerIndex = null;
    let questionsToUse = [];
    let selectedTopics = [];
    let userAnswers = {}; // Optional: Store user answers for detailed results

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
        userAnswers = {}; // Reset answers
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
            topicTag.classList.add('topic-tag'); // Ensure CSS class exists
            topicTag.textContent = currentQuestion.topic;
            questionTextElement.appendChild(topicTag);
            // Add a space between tag and question text
            questionTextElement.appendChild(document.createTextNode(` ${currentQuestion.question}`));
        } else {
            console.error("Question text element not found!");
        }

        // Display Reference Material
        const referenceContainer = document.querySelector('.reference-container'); // Target container
        if (referenceContentElement && referenceContainer) {
            referenceContentElement.innerHTML = ''; // Clear previous content
            if (currentQuestion.resources && currentQuestion.resources.length > 0) {
                currentQuestion.resources.forEach(res => {
                    if (res && res.trim() !== '•') { // Skip empty/bullet-only lines
                        const p = document.createElement('p');
                        p.innerHTML = res; // Allows <b>, <code> etc.
                        referenceContentElement.appendChild(p);
                    }
                });
                referenceContainer.classList.remove('hidden'); // Show container if resources exist
            } else {
                 referenceContainer.classList.add('hidden'); // Hide container if no resources
            }
        } else {
            console.error("Reference content or container element not found!");
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
                // Enable submit button immediately for fill-blank if needed, or wait for input
                 if (submitButton) submitButton.disabled = true; // Start disabled, enable on input

            } else if (currentQuestion.options) {
                currentQuestion.options.forEach((option, index) => {
                    const button = document.createElement('button');
                    button.innerHTML = option; // Allows <code>
                    button.dataset.index = index;
                    button.classList.add('option-btn'); // Ensure class exists in CSS
                    button.addEventListener('click', () => handleOptionSelect(button, index));
                    answerOptionsElement.appendChild(button);
                });
                 if (submitButton) submitButton.disabled = true; // Start disabled for MC
            } else {
                console.error("Question is missing 'options' or is not 'fill-blank':", currentQuestion);
            }
        } else {
            console.error("Answer options element (#input-area) not found!");
        }

        // Clear and hide simulation area initially
        let simContainer = document.getElementById('simulation'); // Ensure ID matches HTML
        const simulationParent = document.querySelector('.simulation-container'); // Target parent
        if (simContainer && simulationParent) {
            simContainer.innerHTML = '';
            // Hide the whole simulation *container* if no simulation data
            if (!currentQuestion.simulation) {
                simulationParent.classList.add('hidden');
            } else {
                simulationParent.classList.add('hidden'); // Start hidden, show in handleSubmit
            }
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
        let userAnswerText = ''; // Store user's answer text

        submitButton.classList.add('hidden');
        nextButton.classList.remove('hidden');

        // Determine correctness
        if (currentQuestion.type === 'fill-blank') {
            const inputField = document.getElementById('fill-blank-input');
            if (inputField) {
                userAnswerText = inputField.value.trim();
                isCorrect = userAnswerText.toLowerCase() === (currentQuestion.correctAnswer || '').toLowerCase();
                inputField.disabled = true;
                feedbackElement.innerHTML = `Your answer: <span class="sim-value color-value">${userAnswerText || '""'}</span><br>`; // Show user's answer styled
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
                userAnswerText = currentQuestion.options[selectedAnswerIndex]; // Get text of selected option
                buttons.forEach(btn => {
                    btn.disabled = true;
                    const btnIndex = parseInt(btn.dataset.index);
                    if (btnIndex === currentQuestion.correctIndex) {
                        btn.classList.add('correct');
                    } else if (btnIndex === selectedAnswerIndex) {
                        if (!btn.classList.contains('correct')) {
                            btn.classList.add('incorrect');
                        }
                    }
                });
            }
        }

         // Store result for this question (topic and correctness)
        userAnswers[currentQuestionIndex] = {
            topic: currentQuestion.topic,
            correct: isCorrect
        };

        // Display Feedback Text
        if (isCorrect) {
            score++;
            feedbackElement.innerHTML += `<b>Correct!</b> ${currentQuestion.explanation || ''}`;
            feedbackElement.classList.remove('hidden', 'feedback-incorrect');
            feedbackElement.classList.add('feedback-correct'); // Use CSS classes for feedback styling
        } else {
            feedbackElement.innerHTML += `<b>Incorrect.</b> ${currentQuestion.explanation || ''}`;
            let correctAnswerText = '';
            if (currentQuestion.type === 'fill-blank') {
                 correctAnswerText = currentQuestion.correctAnswer || 'N/A';
            } else if (currentQuestion.options && currentQuestion.correctIndex < currentQuestion.options.length){
                 correctAnswerText = currentQuestion.options[currentQuestion.correctIndex];
            }
            if (correctAnswerText) {
                 feedbackElement.innerHTML += `<br><span>Correct answer was: ${correctAnswerText}</span>`;
            }
            feedbackElement.classList.remove('hidden', 'feedback-correct');
            feedbackElement.classList.add('feedback-incorrect'); // Use CSS classes
        }

        if (scoreElement) scoreElement.textContent = score;

        // --- Display Simulation AFTER checking answer ---
        const simulationParent = document.querySelector('.simulation-container');
        if (currentQuestion.simulation && simulationParent) {
            setupSimulationPreview(currentQuestion.simulation); // Call the updated function
            simulationParent.classList.remove('hidden'); // Show the container
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

        // --- Calculate and Display Results Breakdown ---
        const topicBreakdownElement = document.getElementById('topic-breakdown'); // Ensure ID matches HTML
        if (topicBreakdownElement) {
             calculateAndDisplayTopicResults(topicBreakdownElement);
        } else {
             console.error("Topic breakdown element not found!");
        }
        // ---
    }

    // --- Function to Calculate and Display Topic Results ---
    function calculateAndDisplayTopicResults(containerElement) {
        containerElement.innerHTML = '<h3>Topic Performance</h3>'; // Add heading
        const resultsByTopic = {};
        const totalByTopic = {};

        // Aggregate results
        for (let i = 0; i < questionsToUse.length; i++) {
            const question = questionsToUse[i];
            const result = userAnswers[i]; // Get stored answer correctness
            const topic = question.topic;

            if (!totalByTopic[topic]) {
                totalByTopic[topic] = 0;
                resultsByTopic[topic] = 0;
            }
            totalByTopic[topic]++;
            if (result && result.correct) {
                resultsByTopic[topic]++;
            }
        }

        // Display results
        const resultsList = document.createElement('ul');
        const topics = Object.keys(totalByTopic).sort(); // Sort topics alphabetically

        if (topics.length === 0) {
            resultsList.innerHTML = '<li>No topics answered.</li>';
        } else {
            topics.forEach((topic, index) => {
                const correct = resultsByTopic[topic] || 0;
                const total = totalByTopic[topic];
                const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

                const listItem = document.createElement('li');
                listItem.style.setProperty('--animation-delay', `${index * 0.05}s`); // Stagger animation via CSS variable

                // Determine performance class for progress bar color
                let performanceClass = 'low';
                if (percentage >= 80) {
                    performanceClass = 'high';
                } else if (percentage >= 50) {
                    performanceClass = 'medium';
                }

                listItem.innerHTML = `
                    <span class="topic-name">${topic}</span>
                    <div class="topic-score-visual">
                        <div class="topic-progress-bar">
                            <div class="topic-progress-fill ${performanceClass}" style="width: ${percentage}%;"></div>
                        </div>
                        <span class="topic-score-text">${correct}/${total}</span>
                    </div>
                `;
                resultsList.appendChild(listItem);
            });
        }
        containerElement.appendChild(resultsList);
    }
    // --- End of Topic Results Function ---

    function restartGame() {
        if (finalResultsElement) finalResultsElement.classList.add('hidden');
        if (topicSelectionScreen) topicSelectionScreen.classList.remove('hidden');
        if (gameScreen) gameScreen.classList.add('hidden');
        if (scoreElement) scoreElement.textContent = 0;
        if (totalQuestionsElement) totalQuestionsElement.textContent = 0; // Reset total shown initially
    }

    // --- Simulation Preview Function (ADHD-Friendly Rendering) ---
    function setupSimulationPreview(simulation) {
        let simContainer = document.getElementById('simulation'); // Ensure ID matches HTML
        if (!simContainer) {
            console.error("Simulation container (#simulation) not found!");
            return;
        }
        simContainer.innerHTML = ''; // Clear previous
        // Visibility handled by parent container now

        const simContent = document.createElement('div');
        simContent.classList.add('sim-content-box'); // Use class from CSS

        // --- Generate ADHD-Friendly HTML ---
        let titleText = simulation.title || simulation.type || 'Simulation Details';

        // --- Render based on available simulation data ---
        if (simulation.steps) {
            if (!simulation.title) { // Generate default title if needed
                 if (simulation.type === "config-sequence") titleText = "Configuration Sequence";
                 else if (simulation.type === "action-sequence") titleText = "Action Sequence";
                 else titleText = "Step-by-Step";
            }
            const stepsList = document.createElement('ol');
            stepsList.classList.add('sim-steps-list');
            simulation.steps.forEach(step => {
                const stepItem = document.createElement('li');
                let stepHTML = '';
                if (step.function_call) { // Render function calls
                     stepHTML += `Call <span class="color-value"><code>${step.function_call}</code></span>`;
                } else if (step.register) { // Render register operations
                     stepHTML += `Register: <b class="color-register">${step.register}</b> | `;
                     stepHTML += `Operation: <span class="color-value">${step.operation || 'N/A'}</span>`;
                     if (step.bits) stepHTML += ` | Bits: <span class="color-bit-num">${step.bits}</span>`;
                     if (step.value) stepHTML += ` | Value: <span class="color-value">${step.value}</span>`;
                     if (step.mask) stepHTML += ` | Mask: <span class="color-value">${step.mask}</span>`;
                     if (step.value_after) stepHTML += ` | Result: <span class="color-value">${step.value_after}</span>`;
                } else if (step.description) { // Render description-only steps
                    stepHTML += `<span class="sim-desc color-desc">${step.description}</span>`;
                }
                // Add description at the end if not already the main content
                if (!step.description && (step.register || step.function_call)) {
                    // Placeholder if description missing but expected
                } else if (step.description && (step.register || step.function_call)) {
                     stepHTML += ` - <span class="sim-desc color-desc">${step.description}</span>`;
                }
                stepItem.innerHTML = stepHTML;
                stepsList.appendChild(stepItem);
            });
             simContent.appendChild(stepsList);

        } else if (simulation.type === "register-view") {
             titleText = simulation.title || `Register View: ${simulation.register}`;
             simContent.innerHTML += `
                <div>Register: <b class="color-register">${simulation.register}</b></div>
                ${simulation.value ? `<div>Value: <span class="sim-value color-value">${simulation.value}</span></div>` : ''}
                ${simulation.value_after ? `<div>Value: <span class="sim-value color-value">${simulation.value_after}</span></div>` : ''}
            `;
            if (simulation.bits && Array.isArray(simulation.bits)) { // Use 'bits' array
                 const bitsList = document.createElement('ul');
                 bitsList.classList.add('sim-bits-list');
                 simulation.bits.forEach(bit => {
                    const bitItem = document.createElement('li');
                    bitItem.innerHTML = `
                         <span class="sim-bit">
                            Bit <span class="color-bit-num">${bit.number}</span>
                            ${bit.name ? `(<span class="color-bit-name">${bit.name}</span>)` : ''}:
                        </span>
                        ${bit.value !== undefined ? `<span class="sim-value color-value"><b>${bit.value}</b></span> - ` : ''}
                         <span class="sim-desc color-desc">${bit.description || ''}</span>`;
                    bitsList.appendChild(bitItem);
                 });
                 simContent.appendChild(bitsList);
            } else if (simulation.bitHighlight !== undefined) { // Fallback for older format
                 simContent.innerHTML += `<p class="sim-desc color-desc">(Relevant Bit: ${simulation.bitHighlight})</p>`;
            }

        } else if (simulation.type === "register-bit-config") {
            titleText = simulation.title || `Configure Bits: ${simulation.register}`;
            simContent.innerHTML += `<div>Register: <b class="color-register">${simulation.register}</b></div>`;
            const bitsList = document.createElement('ul');
            bitsList.classList.add('sim-bits-list');
            if (simulation.bits_to_set && Array.isArray(simulation.bits_to_set)) {
                simulation.bits_to_set.forEach(bit => {
                    const bitItem = document.createElement('li');
                    bitItem.innerHTML = `
                        <span class="sim-bit"> Set Bit(s) <span class="color-bit-num">${bit.number}</span> ${bit.name ? `(<span class="color-bit-name">${bit.name}</span>)` : ''} </span>
                         to <span class="sim-value color-value"><b>${bit.value}</b></span> -
                         <span class="sim-desc color-desc">${bit.description || ''}</span>`;
                    bitsList.appendChild(bitItem);
                });
            }
            if (simulation.bits_to_clear && Array.isArray(simulation.bits_to_clear)) {
                 simulation.bits_to_clear.forEach(bit => {
                    const bitItem = document.createElement('li');
                    bitItem.innerHTML = `
                        <span class="sim-bit"> Clear Bit(s) <span class="color-bit-num">${bit.number}</span> ${bit.name ? `(<span class="color-bit-name">${bit.name}</span>)` : ''} </span>
                         to <span class="sim-value color-value"><b>${bit.value}</b></span> -
                         <span class="sim-desc color-desc">${bit.description || ''}</span>`;
                    bitsList.appendChild(bitItem);
                });
            }
            simContent.appendChild(bitsList);
             if (simulation.value_after) {
                 simContent.innerHTML += `<div>Resulting Config (Conceptual): <span class="color-value">${simulation.value_after}</span></div>`;
            }

        } else if (simulation.type === "pin-config") {
             titleText = simulation.title || `Pin Configuration: ${simulation.pin}`;
             simContent.innerHTML += `
                <div>Pin: <b>${simulation.pin}</b></div>
                <div>Mode: <span class="color-value">${simulation.mode || 'N/A'}</span></div>
                <div>Register: <b class="color-register">${simulation.register}</b></div>
                ${simulation.bitField ? `<div>Bit Field: <span class="color-bit-num">${simulation.bitField}</span></div>` : ''}
                ${simulation.value_after ? `<div>Resulting Reg Value (Conceptual): <span class="color-value">${simulation.value_after}</span></div>` : ''}
                ${simulation.value && !simulation.value_after ? `<div>Register Value (Conceptual): <span class="color-value">${simulation.value}</span></div>` : ''}
            `;
        } else if (simulation.type === "timer-calculation" || simulation.type === "dac-calculation" || simulation.type === "timer-clock") {
             titleText = simulation.title || "Calculation";
             if(simulation.systemClock) simContent.innerHTML += `<div>Input Clock: <span class="color-value">${simulation.systemClock.toLocaleString()} Hz</span></div>`;
             if(simulation.psc !== undefined) simContent.innerHTML += `<div>Prescaler (PSC): <span class="color-value">${simulation.psc}</span></div>`;
             if(simulation.prescaler !== undefined) simContent.innerHTML += `<div>Prescaler (PSC): <span class="color-value">${simulation.prescaler}</span></div>`; // Handle alternate name
             if(simulation.arr !== undefined) simContent.innerHTML += `<div>Auto-Reload (ARR): <span class="color-value">${simulation.arr}</span></div>`;
             if(simulation.division_factor !== undefined) simContent.innerHTML += `<div>Division Factor: <span class="color-value">${simulation.division_factor}</span></div>`;
             if(simulation.targetFrequency !== undefined) simContent.innerHTML += `<div>Target Frequency: <span class="color-value">${simulation.targetFrequency.toLocaleString()} Hz</span></div>`;
             if(simulation.dutyCyclePercent !== undefined) simContent.innerHTML += `<div>Duty Cycle: <span class="color-value">${simulation.dutyCyclePercent}%</span></div>`;
             if(simulation.vdda !== undefined) simContent.innerHTML += `<div>Vdda: <span class="color-value">${simulation.vdda}V</span></div>`;
             if(simulation.resolution !== undefined) simContent.innerHTML += `<div>Resolution: <span class="color-value">${simulation.resolution}-bit</span></div>`;
             if(simulation.dhr_value !== undefined) simContent.innerHTML += `<div>Digital Value (DHR): <span class="color-value">${simulation.dhr_value}</span></div>`;
             if(simulation.formula) simContent.innerHTML += `<div class="sim-formula">Formula: <code>${simulation.formula}</code></div>`;
             if(simulation.result !== undefined) simContent.innerHTML += `<div class="sim-result"><b>Result: <span class="color-value">${simulation.result}</span></b> ${simulation.type === 'dac-calculation' ? 'V' : (simulation.type === 'timer-clock' ? 'Hz' : '')}</div>`;

        } else if (simulation.type === "register-write") {
             titleText = simulation.title || `Write to Register: ${simulation.register}`;
             simContent.innerHTML += `<div>Register: <b class="color-register">${simulation.register}</b></div>`;
             simContent.innerHTML += `<div>Value to Write: <span class="color-value">${simulation.value}</span></div>`;
             if (simulation.context) { // Display context if available
                 let contextHTML = '<div class="sim-context">Context:<ul>';
                 for (const key in simulation.context) {
                     contextHTML += `<li>${key.replace(/_/g, ' ')}: ${simulation.context[key]}</li>`;
                 }
                 contextHTML += '</ul></div>';
                 simContent.innerHTML += contextHTML;
             }

        } else if (simulation.type === "code-example") {
             titleText = simulation.title || "Code Example";
             const pre = document.createElement('pre');
             const code = document.createElement('code');
             code.textContent = simulation.code;
             // Add language class for potential syntax highlighting libraries
             code.classList.add('language-c'); // Example
             pre.appendChild(code);
             simContent.appendChild(pre);

        } else if (simulation.type === "info" || simulation.type === "debugger-tip"){
            titleText = simulation.title || "Information";
            simContent.innerHTML += `<p class="sim-desc color-desc">${simulation.info_text || simulation.tip_text || 'No details.'}</p>`;
        }
        else {
            // Fallback for unknown types or simple structures from original data
            titleText = `Simulation Data: ${simulation.register || simulation.type || ''}`;
            simContent.innerHTML += `<pre>${JSON.stringify(simulation, null, 2)}</pre>`;
            simContent.innerHTML += `<p class="sim-desc color-desc">(Raw data shown - type not fully recognized by renderer)</p>`;
        }

        // --- Add ADHD Fields (Title, Action Description, Relevance, Analogy, Reference) ---
        // Prepend Title
        const titleEl = document.createElement('h4');
        titleEl.classList.add('sim-title');
        titleEl.textContent = titleText;
        simContent.prepend(titleEl); // Add title at the beginning

        // Add Action Description (if exists in data)
        if (simulation.action_description) {
            const actionEl = document.createElement('p');
            actionEl.classList.add('sim-action');
            actionEl.innerHTML = simulation.action_description;
            // Insert after title
            titleEl.insertAdjacentElement('afterend', actionEl);
        }

        // Append Relevance, Analogy, Reference at the end (if they exist)
        let hasExtraInfo = false;
        const extrasContainer = document.createElement('div');
        extrasContainer.classList.add('sim-extras');

        if (simulation.relevance) {
            const relevanceEl = document.createElement('p');
            relevanceEl.classList.add('sim-relevance');
            relevanceEl.innerHTML = `<b>Relevance:</b> ${simulation.relevance}`;
            extrasContainer.appendChild(relevanceEl);
            hasExtraInfo = true;
        }
        if (simulation.analogy) {
            const analogyEl = document.createElement('p');
            analogyEl.classList.add('sim-analogy');
            analogyEl.innerHTML = `<i><b>Analogy:</b> ${simulation.analogy}</i>`;
            extrasContainer.appendChild(analogyEl);
            hasExtraInfo = true;
        }
         if (simulation.reference) {
            const refEl = document.createElement('p');
            refEl.classList.add('sim-reference');
            refEl.innerHTML = `<small>(${simulation.reference})</small>`;
            extrasContainer.appendChild(refEl);
            hasExtraInfo = true;
        }

        if(hasExtraInfo) {
             // Add a separator before the extras if there was main content
             if (simContent.children.length > 1) { // Check if more than just title exists
                 const hr = document.createElement('hr');
                 hr.classList.add('sim-separator');
                 simContent.appendChild(hr);
             }
            simContent.appendChild(extrasContainer);
        }
        // --- End of ADHD Fields ---

        simContainer.appendChild(simContent);
    }
    // --- End of setupSimulationPreview ---


    // --- Helper to update selectedTopics array ---
    function updateSelectedTopicsArray() {
        const specificTopicButtons = document.querySelectorAll('.topic-btn:not([data-topic="all"])');
        selectedTopics = Array.from(specificTopicButtons)
            .filter(btn => btn && btn.classList.contains('selected'))
            .map(btn => btn.dataset.topic);
    }

    // --- Event Listeners ---
    if (startButton) { startButton.addEventListener('click', startGame); }
    else { console.error("Start button not found!"); }

    if (nextButton) { nextButton.addEventListener('click', handleNext); }
    else { console.error("Next button not found!"); }

    if (submitButton) { submitButton.addEventListener('click', handleSubmit); }
    else { console.error("Submit button not found!"); }

    if (restartButton) { restartButton.addEventListener('click', startGame); } // Restart starts the game over
    else { console.error("Restart button not found!"); }

    if (newTopicsButton) { newTopicsButton.addEventListener('click', restartGame); } // New Topics goes back to topic selection
    else { console.error("New Topics button not found!");}


    topicButtons.forEach(button => {
        if (button) {
            button.addEventListener('click', () => {
                // Topic selection logic (same as before)
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
                        if (allSpecificSelected) { allButton.classList.add('selected'); }
                        else { allButton.classList.remove('selected'); }
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
            updateSelectedTopicsArray();
        }
        if (gameScreen) gameScreen.classList.add('hidden');
        if (finalResultsElement) finalResultsElement.classList.add('hidden');
        if (nextButton) nextButton.classList.add('hidden');
        if (submitButton) submitButton.disabled = true;
        if (topicSelectionScreen) topicSelectionScreen.classList.remove('hidden');
    }

    initializeGameUI();

}); // End of DOMContentLoaded listener
