from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import ollama
import json
import re

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request model
class InterviewRequest(BaseModel):
    answer: str


@app.get("/")
def home():
    return {"message": "InterviewRaj Backend Running 🚀"}


@app.post("/interview")
async def interview(req: InterviewRequest):

    answer = req.answer

    print("\n======================")
    print("Received Answer:")
    print(answer)
    print("======================\n")

    prompt = f"""
You are an expert HR interviewer.

Evaluate this interview answer.

Answer:
{answer}

Return ONLY valid JSON.

{{
  "score": 8,
  "strengths": [
    "Good communication",
    "Relevant technical skills"
  ],
  "weaknesses": [
    "Needs more detail",
    "Could provide examples"
  ],
  "improved_answer": "Improved professional answer here"
}}
"""

    try:

        response = ollama.chat(
            model="llama3.2:3b",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        text = response["message"]["content"]

        print("\n===== AI RESPONSE =====")
        print(text)
        print("=======================\n")

        # Extract JSON if model adds extra text
        match = re.search(r"\{.*\}", text, re.DOTALL)

        if match:
            try:
                return json.loads(match.group())
            except:
                pass

        return {
            "score": 0,
            "strengths": [],
            "weaknesses": [],
            "improved_answer": text
        }

    except Exception as e:

        print("ERROR:", str(e))

        return {
            "score": 0,
            "strengths": [],
            "weaknesses": [],
            "improved_answer": f"Backend Error: {str(e)}"
        }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=5002
    )