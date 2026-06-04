// ======================
// APTITUDE QUESTIONS
// ======================

const aptQuestions = [

    {
        question:
            "What is 25% of 200?",

        options:
            ["25", "50", "75", "100"],

        answer:
            "50"
    },

    {
        question:
            "Find the next number: 2,4,8,16,?",

        options:
            ["20", "24", "32", "64"],

        answer:
            "32"
    },

    {
        question:
            "A train travels 60 km in 1 hour. Speed?",

        options:
            ["50", "60", "70", "80"],

        answer:
            "60"
    },

    {
        question:
            "10 + 15 × 2 = ?",

        options:
            ["50", "40", "35", "30"],

        answer:
            "40"
    },

    {
        question:
            "If x=5, then x²=?",

        options:
            ["10", "15", "20", "25"],

        answer:
            "25"
    }

];

// ======================
// VARIABLES
// ======================

let currentAptitude = 0;

let scoreApt = 0;

let timer = 60;

let timerInterval;

// ======================
// LOAD QUESTION
// ======================

function loadAptitudeQuestion() {

    const q =
        aptQuestions[currentAptitude];

    document.getElementById(
        "aptitude-question"
    ).innerText =
        q.question;

    const optionsDiv =
        document.getElementById(
            "aptitude-options"
        );

    optionsDiv.innerHTML = "";

    q.options.forEach(option => {

        optionsDiv.innerHTML +=
            `
        <button
        class="main-btn"
        onclick="checkAptitudeAnswer('${option}')">

        ${option}

        </button>
        `;
    });

    updatePalette();
}

// ======================
// CHECK ANSWER
// ======================

function checkAptitudeAnswer(option) {

    const q =
        aptQuestions[currentAptitude];

    if (option === q.answer) {

        scoreApt += 20;

        localStorage.setItem(
            "aptitudeScore",
            scoreApt
        );
    }

    nextAptitudeQuestion();
}

// ======================
// NEXT QUESTION
// ======================

function nextAptitudeQuestion() {

    if (
        currentAptitude <
        aptQuestions.length - 1
    ) {

        currentAptitude++;

        loadAptitudeQuestion();

    } else {

        alert(
            "Test Completed 🎉"
        );

        document.getElementById(
            "aptitude-score"
        ).innerText =
            scoreApt + "%";

        document.getElementById(
            "dashboard-aptitude-score"
        ).innerText =
            scoreApt + "%";

        updateReadiness();
    }
}

// ======================
// TIMER
// ======================

function startTimer() {

    timer = 60;

    clearInterval(
        timerInterval
    );

    timerInterval =
        setInterval(() => {

            document.getElementById(
                "aptitude-timer"
            ).innerText =
                timer;

            timer--;

            if (timer < 0) {

                clearInterval(
                    timerInterval
                );

                nextAptitudeQuestion();
            }

        }, 1000);
}

// ======================
// QUESTION PALETTE
// ======================

function updatePalette() {

    const palette =
        document.getElementById(
            "question-palette"
        );

    if (!palette) return;

    palette.innerHTML = "";

    aptQuestions.forEach(
        (_, index) => {

            palette.innerHTML +=
                `
        <button
        class="palette-btn
        ${index === currentAptitude
                    ? "active" : ""
                }">

        ${index + 1}

        </button>
        `;
        });
}

// ======================
// INITIALIZE
// ======================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadAptitudeQuestion();

        startTimer();
    });