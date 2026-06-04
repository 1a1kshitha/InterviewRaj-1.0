# Requirements Document

## Introduction

InterviewRaj Backend adds a lightweight Python API server to the existing single-file frontend. It exposes one endpoint (`POST /evaluate/`) that receives a student's answer, runs the same rule-based analysis already in the frontend, persists the result to a SQLite database, and returns the score and feedback to the browser. The frontend is updated to call this endpoint when available, while still working offline as a fallback.

## Glossary

- **Backend**: The Python API server (FastAPI)
- **API**: The HTTP interface exposed by the Backend
- **Attempt**: One row in the database representing a single answer submission (question, answer text, score, timestamp)
- **DB**: The SQLite database file (`interviewraj.db`) managed by the Backend
- **CORS**: Cross-Origin Resource Sharing — must be enabled so the frontend (file:// or localhost) can call the API
- **Frontend**: The existing `index.html` single-file app

## Requirements

### Requirement 1: POST /evaluate/ Endpoint

**User Story:** As a developer, I want a single API endpoint that accepts an answer and returns feedback, so that the frontend can log answers and receive server-side analysis.

#### Acceptance Criteria

1. THE Backend SHALL expose a `POST /evaluate/` endpoint that accepts a JSON body with fields: `question` (string), `answer` (string), and `question_type` (string).
2. WHEN a valid request is received, THE Backend SHALL compute a score (0–100) and 2–4 feedback bullets using the same rule-based logic as the frontend.
3. WHEN a valid request is received, THE Backend SHALL save an Attempt record to the DB with fields: `id`, `question`, `answer_text`, `score`, `timestamp`.
4. WHEN a valid request is received, THE Backend SHALL return a JSON response with fields: `score` (integer), `bullets` (array of strings), `improved_answer` (string).
5. IF the `answer` field is empty or whitespace-only, THEN THE Backend SHALL return a 400 response with a descriptive error message.
6. IF the request body is malformed or missing required fields, THEN THE Backend SHALL return a 422 response.

---

### Requirement 2: Database Logging

**User Story:** As a developer, I want every answer attempt saved to a database, so that I can analyse real student answers later.

#### Acceptance Criteria

1. THE Backend SHALL use SQLite as the database (file: `interviewraj.db` in the project root).
2. THE Backend SHALL create the `attempts` table automatically on startup if it does not exist.
3. THE `attempts` table SHALL have columns: `id` (integer primary key, auto-increment), `question` (text), `answer_text` (text), `score` (integer), `timestamp` (datetime, default current UTC time).
4. WHEN an Attempt is saved, THE Backend SHALL commit the record before returning the HTTP response.

---

### Requirement 3: CORS and Frontend Integration

**User Story:** As a developer, I want the frontend to send answers to the backend when it is running, so that logging happens transparently without breaking the offline experience.

#### Acceptance Criteria

1. THE Backend SHALL enable CORS for all origins so the frontend can call it from `file://` or `http://localhost`.
2. THE Frontend SHALL send a `POST /evaluate/` request to `http://localhost:8000/evaluate/` when the user clicks "Get Feedback".
3. IF the backend request fails (network error, server down), THE Frontend SHALL fall back to the existing client-side analysis and display results normally without showing an error to the user.
4. WHEN the backend responds successfully, THE Frontend SHALL use the score, bullets, and improved answer from the API response instead of the client-side result.

---

### Requirement 4: Local Development Setup

**User Story:** As a developer, I want clear setup instructions so I can run the backend locally in under 5 minutes.

#### Acceptance Criteria

1. THE Backend SHALL be runnable with two commands: `pip install -r requirements.txt` and `uvicorn main:app --reload`.
2. THE Backend project SHALL include a `requirements.txt` listing all dependencies with pinned versions.
3. THE Backend SHALL include a `README.md` with step-by-step local setup instructions.
