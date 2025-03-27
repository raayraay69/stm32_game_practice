// script.js
// Main application logic for the STM32 study game.

// Import the questions data from the separate file
import { questions } from './questions.js'; // Ensure the path is correct

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


    // --- NO questions array defined here anymore ---


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

        // Use the imported 'questions' array here
        if (!useAllTopics && selectedTopics.length > 0) {
             questionsToUse = questions.filter(q => selectedTopics.includes(q.topic));
        } else {
             // Use all questions if 'All Topics' is selected or no specific topics are chosen
             questionsToUse = [...questions]; // Use spread to copy from imported array
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
        let simContainer = document.getElementById('simulation'); // Target existing #simulation div
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
             let simContainer = document.getElementById('simulation'); // Target existing div
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
        // Use the imported 'questions' length as a fallback if questionsToUse is empty
        if (finalTotalElement) finalTotalElement.textContent = questionsToUse.length > 0 ? questionsToUse.length : questions.length;
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
        // Use imported 'questions' length for total possible
        if (totalQuestionsElement) totalQuestionsElement.textContent = questions.length;
    }

    // --- Simulation Preview Functions --- (Updated Placeholder) ---
    function setupSimulationPreview(simulation) {
        // Target the existing div in the HTML
        let simContainer = document.getElementById('simulation');
        if (!simContainer) {
             console.error("Simulation container (#simulation) not found!");
             return; // Exit if target doesn't exist
        }
        // Add a class for styling if needed, remove if not
        simContainer.classList.add('simulation-preview'); // Apply styling class

        simContainer.innerHTML = ''; // Clear previous content
        simContainer.classList.remove('hidden'); // Make sure it's visible

        // Optional: Add back the H3 title if you want it inside #simulation dynamically
        // (Your HTML already has one outside #simulation, which might be better)
        // const header = document.createElement('h3');
        // header.textContent = 'Hardware Simulation';
        // simContainer.appendChild(header);

        const simContent = document.createElement('div');
        simContent.classList.add('sim-content');

        // Basic display for now, expand later
        const pre = document.createElement('pre');
        pre.textContent = JSON.stringify(simulation, null, 2); // Pretty print JSON
        simContent.appendChild(pre);

        // Append the content to the simulation container
        simContainer.appendChild(simContent);

        // TODO: Add more specific simulation rendering based on type later
        // switch (simulation.type) {
        //     case 'register-view': createRegisterView(simContent, simulation); break;
        //     // ... other cases
        //     default: simContent.innerHTML = '<p>Simulation details appear here.</p>';
        // }
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