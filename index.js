async function getFeedback() {

    const answer =
        document.getElementById("transcript").value;

    if (!answer.trim()) {
        alert("Please enter an answer first.");
        return;
    }

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

        const data = await response.json();

        document.getElementById(
            "feedback-section"
        ).style.display = "block";

        document.getElementById(
            "ai-score"
        ).innerText =
            `${data.score}/10`;

        document.getElementById(
            "improved-answer-text"
        ).innerText =
            data.improved_answer;

        const strengths =
            document.getElementById(
                "strengths-list"
            );

        strengths.innerHTML = "";

        (data.strengths || []).forEach(item => {
            strengths.innerHTML +=
                `<li>${item}</li>`;
        });

        const weaknesses =
            document.getElementById(
                "weaknesses-list"
            );

        weaknesses.innerHTML = "";

        (data.weaknesses || []).forEach(item => {
            weaknesses.innerHTML +=
                `<li>${item}</li>`;
        });

        localStorage.setItem(
            "interviewScore",
            data.score * 10
        );

    } catch (err) {

        console.error(err);

        alert(
            "AI server not responding. Make sure FastAPI and Ollama are running."
        );

    }
}