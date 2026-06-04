// ======================
// DASHBOARD
// ======================

function updateReadiness() {

    const interviewScore =
        parseInt(localStorage.getItem("interviewScore")) || 0;

    const aptitudeScore =
        parseInt(localStorage.getItem("aptitudeScore")) || 0;

    const codingScore =
        parseInt(localStorage.getItem("codingScore")) || 0;

    const readiness =
        Math.round(
            (interviewScore + aptitudeScore + codingScore) / 3
        );

    const scoreEl =
        document.getElementById("readiness-score");

    if (scoreEl) {
        scoreEl.innerText = readiness + "%";
    }

    const barEl =
        document.getElementById("readiness-bar");

    if (barEl) {
        barEl.style.width = readiness + "%";
    }
}

// ======================
// LOAD USER
// ======================

function loadUser() {

    const savedUser =
        localStorage.getItem("userEmail");

    const username =
        document.getElementById("username");

    if (savedUser && username) {
        username.innerText =
            savedUser.split("@")[0];
    }
}

// ======================
// LOAD SCORES
// ======================

function loadScores() {

    const interview =
        parseInt(localStorage.getItem("interviewScore")) || 0;

    const coding =
        parseInt(localStorage.getItem("codingScore")) || 0;

    const aptitude =
        parseInt(localStorage.getItem("aptitudeScore")) || 0;

    const interviewEl =
        document.getElementById("interview-score");

    const codingEl =
        document.getElementById("coding-score");

    const aptitudeEl =
        document.getElementById("dashboard-aptitude-score");

    if (interviewEl) {
        interviewEl.innerText = interview + "%";
    }

    if (codingEl) {
        codingEl.innerText = coding + "%";
    }

    if (aptitudeEl) {
        aptitudeEl.innerText = aptitude + "%";
    }

    updateReadiness();
}

// ======================
// LOAD CHARTS
// ======================

function loadCharts() {

    const interviewScore =
        parseInt(localStorage.getItem("interviewScore")) || 0;

    const codingScore =
        parseInt(localStorage.getItem("codingScore")) || 0;

    const interviewCanvas =
        document.getElementById("interviewChart");

    if (interviewCanvas) {

        new Chart(interviewCanvas, {
            type: "line",
            data: {
                labels: [
                    "Start",
                    "Week 1",
                    "Week 2",
                    "Current"
                ],
                datasets: [{
                    label: "Interview Growth",
                    data: [
                        20,
                        40,
                        60,
                        interviewScore
                    ],
                    borderColor: "#8b5cf6",
                    backgroundColor: "#8b5cf6",
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    const codingCanvas =
        document.getElementById("codingChart");

    if (codingCanvas) {

        new Chart(codingCanvas, {
            type: "bar",
            data: {
                labels: [
                    "Arrays",
                    "Strings",
                    "DP",
                    "Current"
                ],
                datasets: [{
                    label: "Coding Progress",
                    data: [
                        30,
                        50,
                        70,
                        codingScore
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

// ======================
// INIT
// ======================

window.addEventListener(
    "DOMContentLoaded",
    () => {

        loadUser();
        loadScores();
        loadCharts();

    }
);