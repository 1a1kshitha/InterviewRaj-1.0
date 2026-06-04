# Design Document: InterviewRaj Backend

## Overview

A minimal FastAPI server that mirrors the frontend's rule-based feedback logic in Python, persists every attempt to SQLite, and returns results to the browser. The frontend calls it opportunistically — if the server is down, it falls back to client-side analysis silently.

---

## Architecture

```
Browser (index.html)
        │
        │  POST /evaluate/  (JSON)
        ▼
┌───────────────────────────────┐
│   FastAPI  (main.py)          │
│                               │
│  /evaluate/  endpoint         │
│       │                       │
│       ├── analyze_transcript()│  ← Python port of JS feedback engine
│       ├── generate_answer()   │  ← Python port of JS template engine
│       └── save_attempt()      │  ← writes to SQLite
│                               │
│  SQLite  (interviewraj.db)    │
└───────────────────────────────┘
```

### File structure

```
backend/
├── main.py            ← FastAPI app, endpoint, DB logic
├── feedback.py        ← analyze_transcript() + generate_improved_answer()
├── requirements.txt   ← pinned dependencies
└── README.md          ← setup instructions
```

---

## Components and Interfaces

### 1. FastAPI app (`main.py`)

```python
# Request model
class EvaluateRequest(BaseModel):
    question: str
    answer: str
    question_type: str   # 'intro' | 'project' | 'strengths' | 'goals' | 'teamwork'

# Response model
class EvaluateResponse(BaseModel):
    score: int           # 0–100
    bullets: list[str]   # 2–4 strings
    improved_answer: str

# Endpoint
POST /evaluate/
  → 200 EvaluateResponse   (valid request)
  → 400 {"detail": "..."}  (empty/whitespace answer)
  → 422                    (malformed body — FastAPI default)
```

### 2. Feedback Engine (`feedback.py`)

Python port of the JS `analyzeTranscript` and `generateImprovedAnswer` functions.

```python
def analyze_transcript(transcript: str) -> dict:
    # Returns {"score": int, "bullets": list[str]}

def generate_improved_answer(transcript: str, question_type: str) -> str:
    # Returns filled template string
```

### 3. Database (`main.py` — SQLite via `sqlite3` stdlib)

```sql
CREATE TABLE IF NOT EXISTS attempts (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    question    TEXT    NOT NULL,
    answer_text TEXT    NOT NULL,
    score       INTEGER NOT NULL,
    timestamp   DATETIME DEFAULT (datetime('now'))
);
```

No ORM — plain `sqlite3` to keep dependencies minimal.

---

## Data Models

### EvaluateRequest

| Field | Type | Validation |
|---|---|---|
| `question` | str | non-empty |
| `answer` | str | non-empty after strip |
| `question_type` | str | one of: intro, project, strengths, goals, teamwork |

### EvaluateResponse

| Field | Type |
|---|---|
| `score` | int (0–100) |
| `bullets` | list[str] (2–4 items) |
| `improved_answer` | str |

### Attempt (DB row)

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER | auto-increment PK |
| `question` | TEXT | question text |
| `answer_text` | TEXT | raw answer |
| `score` | INTEGER | computed score |
| `timestamp` | DATETIME | UTC, auto-set |

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system.*

### Property 1: Score is always in range

*For any* non-empty answer string, `analyze_transcript(answer)["score"]` must be an integer in [0, 100].
**Validates: Requirements 1.2**

### Property 2: Bullet count is bounded

*For any* non-empty answer string, `analyze_transcript(answer)["bullets"]` must contain between 2 and 4 elements.
**Validates: Requirements 1.2**

### Property 3: Empty answer is rejected

*For any* answer string that is empty or whitespace-only, the `/evaluate/` endpoint must return HTTP 400.
**Validates: Requirements 1.5**

### Property 4: No raw placeholder tokens in improved answer

*For any* transcript string and any question type, `generate_improved_answer(transcript, question_type)` must not contain `{` or `}` characters.
**Validates: Requirements 1.4**

### Property 5: Every valid request produces a DB row

*For any* valid request to `/evaluate/`, the `attempts` table row count must increase by exactly 1.
**Validates: Requirements 2.3, 2.4**

---

## Error Handling

| Scenario | Response |
|---|---|
| Empty / whitespace answer | HTTP 400 `{"detail": "Answer cannot be empty."}` |
| Missing required field | HTTP 422 (FastAPI default Pydantic validation) |
| DB write failure | HTTP 500 `{"detail": "Failed to save attempt."}` |

---

## Frontend Integration

The frontend tries the backend first with a `fetch` call wrapped in `try/catch`. On any failure (network error, non-2xx response, timeout) it silently falls back to the existing client-side `analyzeTranscript` + `generateImprovedAnswer`.

```javascript
async function handleFeedback() {
    const transcript = transcriptEl.value;
    if (!transcript.trim()) { /* show guard */ return; }

    let score, bullets, improved;
    try {
        const res = await fetch('http://localhost:8000/evaluate/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                question: QUESTION_BANK[activeIndex].text,
                answer: transcript,
                question_type: QUESTION_BANK[activeIndex].type
            })
        });
        if (!res.ok) throw new Error('non-2xx');
        const data = await res.json();
        score   = data.score;
        bullets = data.bullets;
        improved= data.improved_answer;
    } catch {
        // Backend unavailable — use client-side fallback silently
        ({ score, bullets } = analyzeTranscript(transcript));
        improved = generateImprovedAnswer(transcript, QUESTION_BANK[activeIndex].type);
    }
    renderResults(score, bullets, improved);
}
```

---

## Testing Strategy

### Unit Tests (`pytest`)

- `analyze_transcript("")` → raises ValueError or returns empty guard
- `analyze_transcript("My name is Raj, CSE student at VIT, built a Python project")` → score ≥ 70
- `generate_improved_answer("", "intro")` → no `{` or `}` in output
- `generate_improved_answer("", "project")` → no `{` or `}` in output
- `generate_improved_answer("", "strengths")` → no `{` or `}` in output

### Property-Based Tests (`hypothesis`)

**Property 1: Score in range**
```python
@given(st.text(min_size=1))
def test_score_in_range(transcript):
    result = analyze_transcript(transcript)
    assert 0 <= result["score"] <= 100
    assert isinstance(result["score"], int)
```

**Property 2: Bullet count bounded**
```python
@given(st.text(min_size=1))
def test_bullet_count(transcript):
    result = analyze_transcript(transcript)
    assert 2 <= len(result["bullets"]) <= 4
```

**Property 4: No raw tokens in improved answer**
```python
@given(st.text(), st.sampled_from(["intro","project","strengths","goals","teamwork"]))
def test_no_raw_tokens(transcript, qtype):
    answer = generate_improved_answer(transcript, qtype)
    assert "{" not in answer and "}" not in answer
```

**Property 5: Every valid request produces a DB row** (integration test with test DB)
```python
@given(st.text(min_size=1), st.text(min_size=1))
def test_db_row_created(question, answer):
    # POST to test client, check row count increases by 1
```
