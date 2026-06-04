const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// 🎤 Interview API
app.post("/interview", (req, res) => {
    const { answer } = req.body;

    let score = 5;
    let bullets = [];
    let improved_answer = "";

    if (!answer || answer.trim() === "") {
        return res.json({
            score: 0,
            bullets: ["Please provide an answer"],
            improved_answer: "",
        });
    }

    if (answer.length > 80) {
        score = 8;
        bullets = [
            "Good explanation",
            "Answer has decent length",
            "Try adding real examples"
        ];
        improved_answer =
            "Start with introduction, mention your skills, and include a project example.";
    } else {
        score = 5;
        bullets = [
            "Answer is too short",
            "Explain more clearly",
            "Add structure"
        ];
        improved_answer =
            "Structure your answer: intro → skills → example → conclusion.";
    }

    res.json({
        score,
        bullets,
        improved_answer,
    });
});

// Test route
app.get("/", (req, res) => {
    res.send("Server running 🚀");
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});