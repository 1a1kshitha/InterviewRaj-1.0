const fs = require("fs");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();

const PORT = 5000;
const SECRET_KEY = "interviewraj_secret";

app.use(cors());
app.use(express.json());

/* =========================
   CREATE USERS FILE
========================= */

if (!fs.existsSync("users.json")) {
    fs.writeFileSync("users.json", "[]");
}

/* =========================
   HOME
========================= */

app.get("/", (req, res) => {
    res.send("InterviewRaj Server Running 🚀");
});

/* =========================
   SIGNUP
========================= */

app.post("/signup", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password required"
            });
        }

        const users = JSON.parse(
            fs.readFileSync("users.json")
        );

        const existingUser = users.find(
            user => user.email === email
        );

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        users.push({
            email,
            password: hashedPassword
        });

        fs.writeFileSync(
            "users.json",
            JSON.stringify(users, null, 2)
        );

        res.json({
            success: true,
            message: "Signup successful"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
});

/* =========================
   LOGIN
========================= */

app.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        const users = JSON.parse(
            fs.readFileSync("users.json")
        );

        const user = users.find(
            user => user.email === email
        );

        if (!user) {

            return res.status(400).json({
                message: "User not found"
            });
        }

        const validPassword =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!validPassword) {

            return res.status(400).json({
                message: "Invalid password"
            });
        }

        const token = jwt.sign(
            { email },
            SECRET_KEY,
            { expiresIn: "7d" }
        );

        res.json({
            success: true,
            message: "Login successful",
            token
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
});

/* =========================
   AI INTERVIEW FEEDBACK
========================= */

function parseFeedbackText(text) {
    const scoreMatch = text.match(/Score:\s*(\d+)/i);
    const strengthsMatch = text.match(/Strengths:\s*([\s\S]*?)(?:Weaknesses:|Improved Answer:|$)/i);
    const weaknessesMatch = text.match(/Weaknesses:\s*([\s\S]*?)(?:Improved Answer:|$)/i);
    const improvedMatch = text.match(/Improved Answer:\s*([\s\S]*)/i);

    const parseLines = (block) => {
        if (!block) return [];
        return block
            .split(/\r?\n/)
            .map((line) => line.trim().replace(/^[-*]\s*/, ""))
            .filter((line) => line.length > 0);
    };

    return {
        score: scoreMatch ? Math.min(10, Math.max(0, Number(scoreMatch[1] || 0))) : 0,
        strengths: parseLines(strengthsMatch ? strengthsMatch[1] : ""),
        weaknesses: parseLines(weaknessesMatch ? weaknessesMatch[1] : ""),
        improved_answer: improvedMatch ? improvedMatch[1].trim() : "",
        feedback: text.trim(),
    };
}

app.post("/interview", async (req, res) => {
    try {
        const { answer } = req.body;

        if (!answer || !answer.trim()) {
            return res.status(400).json({
                message: "Answer cannot be empty"
            });
        }

        // Prefer the Python backend if it is running.
        try {
            const pythonResponse = await fetch("http://localhost:5001/interview", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ answer })
            });

            if (pythonResponse.ok) {
                const data = await pythonResponse.json();
                return res.json(data);
            }
        } catch (pythonError) {
            console.log("Python backend unavailable, falling back to local AI server:", pythonError.message);
        }

        const response = await fetch(
            "http://localhost:11434/api/generate",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model="llama3.2:3b"
                    prompt: `
You are an expert HR interviewer.

Analyze the following answer:

${answer}

Return EXACTLY in this format:

Score: X/10

Strengths:
- point 1
- point 2
- point 3

Weaknesses:
- point 1
- point 2
- point 3

Improved Answer:
better answer
                    `,
                    stream: false
                })
            }
        );

        const rawText = await response.text();
        const data = parseFeedbackText(rawText);
        res.json(data);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            feedback: "AI server not responding"
        });
    }
});

/* =========================
   START SERVER
========================= */

app.listen(PORT, () => {

    console.log(
        `Server running on port ${PORT}`
    );
});