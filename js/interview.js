// ======================
// INTERVIEW QUESTIONS
// ======================

const companyQuestions = {

    Amazon: [
        "Tell me about yourself",
        "Explain a challenging project",
        "What is your biggest strength?"
    ],

    TCS: [
        "Why do you want TCS?",
        "Explain your project",
        "What are your strengths?"
    ],

    Google: [
        "Describe leadership experience",
        "Explain technical project",
        "How do you solve problems?"
    ]
};

let interviewIndex = 0;

// ======================
// LOAD QUESTION
// ======================

function loadInterviewQuestion() {

    const company =
        document.getElementById(
            "company-select"
        ).value;

    const questions =
        companyQuestions[company];

    document.getElementById(
        "question-text"
    ).innerText =
        questions[interviewIndex];

    const recruiterQuestion =
        document.getElementById(
            "recruiter-question"
        );

    if (recruiterQuestion) {

        recruiterQuestion.innerText =
            questions[interviewIndex];
    }

    speakQuestion(
        questions[interviewIndex]
    );
}

// ======================
// NEXT QUESTION
// ======================

function nextInterviewQuestion() {

    const company =
        document.getElementById(
            "company-select"
        ).value;

    const questions =
        companyQuestions[company];

    if (
        interviewIndex <
        questions.length - 1
    ) {

        interviewIndex++;

        loadInterviewQuestion();
    }
}

// ======================
// PREVIOUS QUESTION
// ======================

function prevInterviewQuestion() {

    if (interviewIndex > 0) {

        interviewIndex--;

        loadInterviewQuestion();
    }
}

// ======================
// SPEECH RECOGNITION
// ======================

let recognition;

function startRecording() {

    recognition =
        new (
            window.SpeechRecognition ||
            window.webkitSpeechRecognition
        )();

    recognition.onresult = function (event) {

        document.getElementById(
            "transcript"
        ).value =
            event.results[0][0].transcript;
    };

    recognition.start();
}

function stopRecording() {

    if (recognition) {

        recognition.stop();
    }
}

// ======================
// SPEAK QUESTION
// ======================


// ======================
// AI FEEDBACK
// ======================
async function getFeedback() {

    const transcriptBox = document.getElementById("transcript");

    if (!transcriptBox) {
        alert("Transcript box not found");
        return;
    }

    const answer = transcriptBox.value.trim();

    if (!answer) {
        alert("Please enter your answer");
        return;
    }

    const feedbackSection = document.getElementById("feedback-section");
    const aiScore = document.getElementById("ai-score");
    const strengthsList = document.getElementById("strengths-list");
    const weaknessesList = document.getElementById("weaknesses-list");
    const improvedAnswerText = document.getElementById("improved-answer-text");

    console.log({
        feedbackSection,
        aiScore,
        strengthsList,
        weaknessesList,
        improvedAnswerText
    });

    if (
        !feedbackSection ||
        !aiScore ||
        !strengthsList ||
        !weaknessesList ||
        !improvedAnswerText
    ) {
        alert("Feedback section elements not found");
        return;
    }

    feedbackSection.style.display = "block";
    aiScore.innerText = "Loading...";
    strengthsList.innerHTML = "";
    weaknessesList.innerHTML = "";
    improvedAnswerText.innerText = "Generating feedback...";

    try {

        const response = await fetch(
            "http://localhost:5002/interview",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    answer: answer
                })
            }
        );

        if (!response.ok) {
            throw new Error(
                `Server returned ${response.status}`
            );
        }

        const data = await response.json();

        console.log("Backend Response:", data);

        aiScore.innerText =
            (data.score ?? 0) + "/10";

        strengthsList.innerHTML = "";

        if (Array.isArray(data.strengths)) {
            data.strengths.forEach(item => {
                strengthsList.innerHTML += `<li>${item}</li>`;
            });
        }

        weaknessesList.innerHTML = "";

        if (Array.isArray(data.weaknesses)) {
            data.weaknesses.forEach(item => {
                weaknessesList.innerHTML += `<li>${item}</li>`;
            });
        }

        improvedAnswerText.innerText =
            data.improved_answer ||
            data.feedback ||
            "No improved answer generated.";

    } catch (err) {

        console.error(err);

        alert(
            "AI server not responding:\n" +
            err.message
        );
    }
}


// ======================
// RECRUITER CAMERA
// ======================
// ======================
// CAMERA CONTROL
// ======================

let cameraStream = null;

function startCamera() {

    navigator.mediaDevices
        .getUserMedia({
            video: true
        })
        .then(stream => {

            cameraStream = stream;

            const camera =
                document.getElementById(
                    "camera"
                );

            if (camera) {

                camera.srcObject =
                    stream;
            }

        })
        .catch(error => {

            console.log(error);

        });
}

function stopCamera() {

    if (cameraStream) {

        cameraStream
            .getTracks()
            .forEach(track =>
                track.stop()
            );

        cameraStream = null;
    }
}

// ======================
// RECRUITER STATUS
// ======================

function updateRecruiterStatus(text) {

    const status =
        document.getElementById(
            "recruiter-status"
        );

    if (status) {

        status.innerText = text;

    }
}

// ======================
// SPEAK QUESTION
// ======================
function speakQuestion(text) {

    const avatar =
        document.getElementById(
            "recruiter-avatar"
        );

    const status =
        document.getElementById(
            "recruiter-status"
        );

    const speech =
        new SpeechSynthesisUtterance(
            text
        );

    avatar.classList.add(
        "talking"
    );

    status.innerHTML =
        "🗣 Speaking...";

    speech.onend = () => {

        avatar.classList.remove(
            "talking"
        );

        status.innerHTML =
            "🟢 Listening...";
    };

    speechSynthesis.speak(
        speech
    );
}


// ======================
// COMPANY RECRUITER
// ======================

function changeRecruiter() {

    const companySelect =
        document.getElementById(
            "company-select"
        );

    if (!companySelect) return;

    const company =
        companySelect.value;

    const recruiter =
        document.getElementById(
            "recruiter-name"
        );

    const role =
        document.querySelector(
            ".recruiter-role"
        );

    if (!recruiter || !role) return;

    if (company === "Amazon") {

        recruiter.innerText =
            "Amazon Recruiter";

        role.innerText =
            "Leadership Principles";

    }

    else if (company === "Google") {

        recruiter.innerText =
            "Google Interviewer";

        role.innerText =
            "Problem Solving";

    }

    else {

        recruiter.innerText =
            "TCS HR";

        role.innerText =
            "Communication Skills";

    }
}
function startSpeakingAnimation() {

    const avatar =
        document.getElementById(
            "recruiter-avatar"
        );

    if (avatar) {

        avatar.classList.add(
            "speaking"
        );

    }

}

function stopSpeakingAnimation() {

    const avatar =
        document.getElementById(
            "recruiter-avatar"
        );

    if (avatar) {

        avatar.classList.remove(
            "speaking"
        );

    }

}

