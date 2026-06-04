// ======================
// CODING QUESTIONS
// ======================

const codingQuestions = [

    {
        title:
            "Reverse String",

        description:
            "Write logic to reverse a string."
    },

    {
        title:
            "Palindrome",

        description:
            "Check whether a string is palindrome."
    },

    {
        title:
            "Factorial",

        description:
            "Find factorial of a number."
    }

];

// ======================
// VARIABLES
// ======================

let codingIndex = 0;

let codingScore = 0;

let editor;

// ======================
// LOAD QUESTION
// ======================

function loadCodingQuestion() {

    document.getElementById(
        "coding-title"
    ).innerText =
        codingQuestions[codingIndex]
            .title;

    document.getElementById(
        "coding-description"
    ).innerText =
        codingQuestions[codingIndex]
            .description;
}

// ======================
// MONACO EDITOR
// ======================

require.config({

    paths: {

        vs:
            'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/vs'

    }
});

require(
    ['vs/editor/editor.main'],

    function () {

        editor =
            monaco.editor.create(

                document.getElementById(
                    'editor'
                ),

                {
                    value:
                        `print("Hello Akshitha")`,

                    language:
                        'python',

                    theme:
                        'vs-dark',

                    fontSize:
                        16,

                    automaticLayout:
                        true,

                    minimap: {
                        enabled: false
                    }
                });
    });

// ======================
// RUN CODE
// ======================

async function runCode() {

    const code =
        editor.getValue();

    document.getElementById(
        "coding-result"
    ).innerText =
        "Running...";

    try {

        const response =
            await fetch(
                "https://emkc.org/api/v2/piston/execute",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        language: "python",

                        version: "3.10.0",

                        files: [
                            {
                                content: code
                            }
                        ]
                    })
                });

        const data =
            await response.json();

        document.getElementById(
            "coding-result"
        ).innerText =
            data.run.output;

    } catch (err) {

        document.getElementById(
            "coding-result"
        ).innerText =
            "Execution Error";
    }
}

// ======================
// SUBMIT CODE
// ======================

function checkCode() {

    codingScore =
        Math.min(
            codingScore + 50,
            100
        );

    localStorage.setItem(
        "codingScore",
        codingScore
    );

    document.getElementById(
        "coding-score"
    ).innerText =
        codingScore + "%";

    updateReadiness();

    alert(
        "Code Submitted 🎉"
    );
}

// ======================
// NEXT QUESTION
// ======================

function nextCodingQuestion() {

    if (
        codingIndex <
        codingQuestions.length - 1
    ) {

        codingIndex++;

        loadCodingQuestion();

    } else {

        alert(
            "All Coding Questions Completed 🎉"
        );
    }
}

// ======================
// INITIALIZE
// ======================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadCodingQuestion();
    });