# InterviewRaj Backend

A minimal FastAPI server that logs student answers to SQLite and returns rule-based feedback.

## Requirements

- Python 3.10 or higher
- pip

## Setup (one time)

```bash
cd backend
pip install -r requirements.txt
```

## Run the server

```bash
cd backend
uvicorn main:app --reload
```

The server starts at **http://localhost:8000**.  
The SQLite database file `interviewraj.db` is created automatically in the `backend/` folder on first run.

## API

### POST /evaluate/

**Request body (JSON):**
```json
{
  "question": "Tell me about yourself.",
  "answer": "My name is Raj. I am a CSE student at VIT...",
  "question_type": "intro"
}
```

**Response (200):**
```json
{
  "score": 85,
  "bullets": ["✅ Good length: 45 words.", "✅ Good coverage: mentioned CSE, VIT, Python."],
  "improved_answer": "Hi, my name is [your name]. I am a ..."
}
```

**Error responses:**
- `400` — answer is empty or whitespace-only
- `422` — missing or invalid fields

## Run tests

```bash
cd backend
pytest
```

## Deploy (free options)

- **Railway**: connect your GitHub repo, set start command to `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Render**: free tier web service, same start command
- Update the frontend `BACKEND_URL` constant in `index.html` to your deployed URL
