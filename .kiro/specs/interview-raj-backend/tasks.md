# Implementation Plan: InterviewRaj Backend

## Overview

Build a minimal FastAPI backend in a `backend/` folder. Tasks are ordered so each step is immediately runnable. The frontend is updated last, after the backend is verified working.

## Tasks

- [x] 1. Scaffold backend project structure
  - Create `backend/` directory with `main.py`, `feedback.py`, `requirements.txt`, `README.md`
  - Write `requirements.txt` with pinned versions: `fastapi`, `uvicorn[standard]`, `hypothesis`, `pytest`, `httpx`
  - Write `README.md` with step-by-step setup: install Python 3.10+, pip install, uvicorn run command, how to test
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 2. Implement feedback.py — Python port of the analysis engine
  - Implement `analyze_transcript(transcript: str) -> dict` with the same 6 checks as the JS version (word count, intro cue, branch, college, project, skill)
  - Implement `generate_improved_answer(transcript: str, question_type: str) -> str` with the same 3 templates (intro, project, strengths)
  - Raise `ValueError` for empty/whitespace-only transcript in `analyze_transcript`
  - Ensure all `{PLACEHOLDER}` tokens are always replaced in `generate_improved_answer`
  - _Requirements: 1.2, 1.4_

  - [x] 2.1 Write property test — Property 1: Score always in range
    - Use hypothesis in `backend/test_feedback.py`
    - **Property 1: Score is always in range**
    - **Validates: Requirements 1.2**

  - [x] 2.2 Write property test — Property 2: Bullet count bounded
    - **Property 2: Feedback bullet count is bounded**
    - **Validates: Requirements 1.2**

  - [x] 2.3 Write property test — Property 4: No raw placeholder tokens
    - **Property 4: No raw placeholder tokens in improved answer**
    - **Validates: Requirements 1.4**

  - [x] 2.4 Write unit tests for feedback.py edge cases
    - Empty string raises ValueError
    - Full answer (name + CSE + VIT + Python project) → score ≥ 70
    - All three template types produce output without `{` or `}`
    - _Requirements: 1.2, 1.4_

- [x] 3. Implement main.py — FastAPI app, endpoint, DB
  - Define `EvaluateRequest` and `EvaluateResponse` Pydantic models
  - Implement `init_db()` — creates `attempts` table if not exists, called on startup
  - Implement `POST /evaluate/` endpoint:
    - Validate answer is non-empty (return 400 if not)
    - Call `analyze_transcript` and `generate_improved_answer`
    - Insert row into `attempts` table and commit
    - Return `EvaluateResponse`
  - Add CORS middleware allowing all origins
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.1, 2.2, 2.3, 2.4, 3.1_

  - [x] 3.1 Write property test — Property 5: Every valid request increases DB row count by 1
    - Use FastAPI TestClient + in-memory/temp DB
    - **Property 5: Every valid request produces a DB row**
    - **Validates: Requirements 1.3, 2.4**

  - [x] 3.2 Write unit tests for endpoint behaviour
    - Valid request → 200, correct response shape
    - Empty answer → 400
    - Missing field → 422
    - CORS header present in response
    - _Requirements: 1.1, 1.4, 1.5, 1.6, 3.1_

- [x] 4. Checkpoint — Run all backend tests
  - Run `pytest backend/` and verify all tests pass before touching the frontend.

- [x] 5. Update frontend handleFeedback to call backend
  - Make `handleFeedback` async
  - Wrap fetch call in try/catch: POST to `http://localhost:8000/evaluate/` with question, answer, question_type
  - On success: use API score, bullets, improved_answer
  - On any failure: silently fall back to client-side `analyzeTranscript` + `generateImprovedAnswer`
  - Extract `renderResults(score, bullets, improved)` helper to avoid code duplication
  - _Requirements: 3.2, 3.3, 3.4_

- [x] 6. Final checkpoint — Verify full stack
  - Start backend: `uvicorn main:app --reload` (from `backend/` folder)
  - Open `index.html` in Chrome, record an answer, click Get Feedback
  - Verify results appear and a row is saved in `interviewraj.db`
  - Stop backend, click Get Feedback again — verify fallback works silently

## Notes

- All tasks are required
- Backend lives in `backend/` — frontend `index.html` stays in the root
- SQLite DB file `interviewraj.db` is created in the `backend/` folder when the server starts
- Run tests with: `cd backend && pytest`
