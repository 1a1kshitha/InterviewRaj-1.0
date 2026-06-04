# main.py — FastAPI app with /evaluate/ endpoint and SQLite logging
import sqlite3
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from feedback import analyze_transcript, generate_improved_answer

# ── Config ────────────────────────────────────────────────────────────────
DB_PATH = "interviewraj.db"


# ── Database ──────────────────────────────────────────────────────────────

def init_db(db_path: str | None = None) -> None:
    """Create the attempts table if it does not exist."""
    path = db_path or DB_PATH
    with sqlite3.connect(path) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS attempts (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                question    TEXT    NOT NULL,
                answer_text TEXT    NOT NULL,
                score       INTEGER NOT NULL,
                timestamp   DATETIME DEFAULT (datetime('now'))
            )
        """)
        conn.commit()


def save_attempt(question: str, answer_text: str, score: int,
                 db_path: str | None = None) -> None:
    """Insert one attempt row and commit."""
    path = db_path or DB_PATH
    with sqlite3.connect(path) as conn:
        conn.execute(
            "INSERT INTO attempts (question, answer_text, score) VALUES (?, ?, ?)",
            (question, answer_text, score),
        )
        conn.commit()


# ── Lifespan ──────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


# ── App ───────────────────────────────────────────────────────────────────

app = FastAPI(title="InterviewRaj API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Pydantic models ───────────────────────────────────────────────────────

class EvaluateRequest(BaseModel):
    question: str
    answer: str
    question_type: str  # 'intro' | 'project' | 'strengths' | 'goals' | 'teamwork'


class EvaluateResponse(BaseModel):
    score: int
    bullets: list[str]
    improved_answer: str


# ── Endpoints ─────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "InterviewRaj API is running."}


@app.post("/evaluate/", response_model=EvaluateResponse)
def evaluate(req: EvaluateRequest):
    # Guard: empty / whitespace-only answer
    if not req.answer or not req.answer.strip():
        raise HTTPException(status_code=400, detail="Answer cannot be empty.")

    # Run feedback engine
    try:
        result = analyze_transcript(req.answer)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    improved = generate_improved_answer(req.answer, req.question_type)

    # Persist to DB — read module-level DB_PATH at call time so tests can patch it
    try:
        import main as _m
        save_attempt(req.question, req.answer, result["score"], _m.DB_PATH)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to save attempt.")

    return EvaluateResponse(
        score=result["score"],
        bullets=result["bullets"],
        improved_answer=improved,
    )
