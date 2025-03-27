// DOM Element References
const questionTextElement = document.getElementById('question-text');
const referenceContentElement = document.getElementById('reference-content');
const answerOptionsElement = document.getElementById('input-area');
const submitButton = document.getElementById('submit-btn');
const nextButton = document.getElementById('next-btn');
const feedbackElement = document.getElementById('feedback-area');
const scoreElement = document.getElementById('score');
const totalQuestionsElement = document.getElementById('total-questions');
const quizAreaElement = document.querySelector('.content-area');
const finalResultsElement = document.getElementById('results-screen');
const finalScoreElement = document.getElementById('final-score');
const finalTotalElement = document.getElementById('final-total');
const restartButton = document.getElementById('restart-btn');
const topicSelectionScreen = document.getElementById('topic-selection-screen');
const gameScreen = document.getElementById('game-screen');
const startButton = document.getElementById('start-btn'); // Fix: using start-btn instead of start-selected-btn
const topicBreakdownElement = document.getElementById('topic-breakdown');
const simulationElement = document.getElementById('simulation'); // Added reference

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
        options