# feedback.py — Rule-based feedback engine (Python port of the JS version)
# Imported by main.py and tested in test_feedback.py

import re

# ── BRANCH KEYWORDS ────────────────────────────────────────────────────────
# TO TUNE: add more branch names to this list.
BRANCH_KEYWORDS = [
    "computer science", "cse", "ece", "mechanical", "civil",
    "electrical", "it", "information technology", "electronics",
]

# ── SKILL / TOOL KEYWORDS ──────────────────────────────────────────────────
# TO TUNE: add more skills or tools to this list.
SKILL_KEYWORDS = [
    "python", "java", "c++", "javascript", "react", "sql",
    "machine learning", "excel", "communication", "leadership",
    "teamwork", "problem solving",
]

# ── SCORING WEIGHTS ────────────────────────────────────────────────────────
# TO TUNE: adjust these values. They should sum to <= 100.
SCORE_WEIGHTS = {
    "word_count_good":  40,   # 30–120 words
    "word_count_long":  25,   # > 120 words
    "word_count_short": 10,   # < 30 words
    "has_intro":        10,
    "has_branch":       10,
    "has_college":      10,
    "has_project":      15,
    "has_skill":        15,
}

# ── TEMPLATES ──────────────────────────────────────────────────────────────
# TO CUSTOMISE: edit any of the three template strings below.

TEMPLATE_INTRO = (
    "Hi, my name is {NAME}. I am a {YEAR} year {BRANCH} student at {COLLEGE}. "
    "During my studies, I worked on a project called {PROJECT}, where I {PROJECT_DETAIL}. "
    "I am skilled in {SKILL} and I am passionate about {INTEREST}. "
    "My goal is to {GOAL} and contribute meaningfully to your organisation."
)

TEMPLATE_PROJECT = (
    "I worked on a project called {PROJECT}. "
    "The problem it solved was {PROBLEM}. "
    "I used {SKILL} to build it, and my role was to {ROLE}. "
    "The outcome was {OUTCOME}, which taught me a lot about real-world development."
)

TEMPLATE_STRENGTHS = (
    "One of my key strengths is {STRENGTH}. For example, {STRENGTH_EXAMPLE}. "
    "A weakness I am working on is {WEAKNESS}. "
    "To improve, I have been {IMPROVEMENT_ACTION}, and I have already seen progress."
)


def analyze_transcript(transcript: str) -> dict:
    """
    Analyse the answer text and return {"score": int, "bullets": list[str]}.
    Raises ValueError for empty or whitespace-only input.
    """
    if not transcript or not transcript.strip():
        raise ValueError("Answer cannot be empty.")

    text = transcript.strip().lower()
    words = text.split()
    w_count = len(words)
    score = 0
    bullets: list[str] = []

    # ── CHECK 1: Word count ───────────────────────────────────────────────
    # TO TUNE: change the thresholds (30 and 120) below.
    if 30 <= w_count <= 120:
        score += SCORE_WEIGHTS["word_count_good"]
        bullets.append(f"✅ Good length: your answer is {w_count} words (ideal range is 30–120 words).")
    elif w_count < 30:
        score += SCORE_WEIGHTS["word_count_short"]
        bullets.append(f"⚠️ Too short: only {w_count} word{'s' if w_count != 1 else ''}. Aim for at least 30 words.")
    else:
        score += SCORE_WEIGHTS["word_count_long"]
        bullets.append(f"⚠️ Too long: {w_count} words. Try to keep it under 120 words.")

    # ── CHECK 2: Intro cue ────────────────────────────────────────────────
    has_intro = bool(re.search(r"\bmy name is\b|\bi am\b|\bi'm\b", text))
    if has_intro:
        score += SCORE_WEIGHTS["has_intro"]
    else:
        bullets.append('💡 Start with an intro: say "My name is..." or "I am a..."')

    # ── CHECK 3: Branch / field of study ──────────────────────────────────
    # TO TUNE: edit BRANCH_KEYWORDS above.
    has_branch = any(k in text for k in BRANCH_KEYWORDS)
    if has_branch:
        score += SCORE_WEIGHTS["has_branch"]
    else:
        bullets.append('💡 Mention your branch: e.g. "I am a Computer Science student" or "I study ECE".')

    # ── CHECK 4: College / institution ────────────────────────────────────
    # TO TUNE: add more college names to the regex below.
    has_college = bool(re.search(
        r"\b(college|university|institute|iit|nit|vit|bits|srm|manipal|anna)\b", text
    ))
    if has_college:
        score += SCORE_WEIGHTS["has_college"]
    else:
        bullets.append('💡 Mention your college or institution (e.g. "I study at VIT" or "I am from NIT").')

    # ── CHECK 5: Project mention ──────────────────────────────────────────
    has_project = bool(re.search(
        r"\b(project|built|developed|created|implemented|designed)\b", text
    ))
    if has_project:
        score += SCORE_WEIGHTS["has_project"]
    else:
        bullets.append("💡 Mention a project: briefly describe something you built or worked on.")

    # ── CHECK 6: Skill or tool ────────────────────────────────────────────
    # TO TUNE: edit SKILL_KEYWORDS above.
    has_skill = any(k in text for k in SKILL_KEYWORDS)
    if has_skill:
        score += SCORE_WEIGHTS["has_skill"]
    else:
        bullets.append("💡 Mention at least one skill or tool (e.g. Python, Java, SQL, communication).")

    # ── Cap score at 100; clamp bullets to 2–4 ───────────────────────────
    score = min(100, round(score))
    if len(bullets) < 2:
        bullets.append("💡 Tip: cover who you are, your branch, college, a project, and a skill.")

    return {"score": score, "bullets": bullets[:4]}


def _extract(pattern: str, text: str, fallback: str) -> str:
    """Helper: return first capture group or fallback."""
    m = re.search(pattern, text, re.IGNORECASE)
    return m.group(1).strip() if m else fallback


def generate_improved_answer(transcript: str, question_type: str) -> str:
    """
    Select the right template based on question_type and fill all
    {PLACEHOLDER} tokens. Every token is always replaced — either
    with detected text or a readable fallback string.
    """
    text = (transcript or "").strip()

    # Select template
    if question_type == "project":
        template = TEMPLATE_PROJECT
    elif question_type == "strengths":
        template = TEMPLATE_STRENGTHS
    else:
        template = TEMPLATE_INTRO  # intro, goals, teamwork

    # ── Extraction ────────────────────────────────────────────────────────
    name   = "[your name]"
    year   = _extract(r"(\d(?:st|nd|rd|th)?)\s*year", text, "[your year]")

    branch_found = next((k for k in BRANCH_KEYWORDS if k in text.lower()), None)
    branch = branch_found or "[your branch]"

    college = _extract(
        r"\b(?:at|from)\s+([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)*)", text, "[your college]"
    )
    project = _extract(
        r"project\s+(?:was\s+|on\s+|called\s+)?([a-z0-9 ]{3,40}?)(?:[.,]|$)", text, "[your project name]"
    )
    project_detail = _extract(
        r"(?:where i|which i|in which i)\s+([a-z][a-z0-9 ]{3,60}?)(?:[.,]|$)", text, "[describe what you did]"
    )

    skill_found = next((k for k in SKILL_KEYWORDS if k in text.lower()), None)
    skill = skill_found or "[your skill or tool]"

    interest = _extract(
        r"(?:interested in|passionate about|love|enjoy)\s+([a-z][a-z0-9 ]{2,40}?)(?:[.,]|$)",
        text, "[your area of interest]"
    )
    goal = _extract(
        r"(?:want to|goal is|aspire to)\s+([a-z][a-z0-9 ]{2,50}?)(?:[.,]|$)",
        text, "[your career goal, e.g. work in AI or join a product company]"
    )
    problem = _extract(
        r"(?:problem|issue|challenge)\s+(?:was\s+|is\s+)?([a-z][a-z0-9 ]{3,60}?)(?:[.,]|$)",
        text, "[the problem your project solved]"
    )
    role = _extract(
        r"(?:my role|i was responsible for|i handled)\s+([a-z][a-z0-9 ]{3,60}?)(?:[.,]|$)",
        text, "[your specific role, e.g. backend development]"
    )
    outcome = _extract(
        r"(?:result|outcome|achieved|impact)\s+(?:was\s+)?([a-z][a-z0-9 ]{3,60}?)(?:[.,]|$)",
        text, "[the result, e.g. reduced load time by 40%]"
    )
    strength = _extract(
        r"(?:strength is|good at|strong in)\s+([a-z][a-z0-9 ]{2,40}?)(?:[.,]|$)",
        text, "[your strength, e.g. problem solving]"
    )
    strength_example = _extract(
        r"(?:for example|for instance|such as)\s+([a-z][a-z0-9 ]{3,60}?)(?:[.,]|$)",
        text, "[give a specific example from college or a project]"
    )
    weakness = _extract(
        r"(?:weakness is|struggle with|working on)\s+([a-z][a-z0-9 ]{2,40}?)(?:[.,]|$)",
        text, "[your weakness, e.g. public speaking]"
    )
    improvement_action = _extract(
        r"(?:improving|practising|learning|taking)\s+([a-z][a-z0-9 ]{3,60}?)(?:[.,]|$)",
        text, "[what you are doing to improve, e.g. taking an online course]"
    )

    # ── Fill all placeholders ─────────────────────────────────────────────
    return (
        template
        .replace("{NAME}",               name)
        .replace("{YEAR}",               year)
        .replace("{BRANCH}",             branch)
        .replace("{COLLEGE}",            college)
        .replace("{PROJECT}",            project)
        .replace("{PROJECT_DETAIL}",     project_detail)
        .replace("{SKILL}",              skill)
        .replace("{INTEREST}",           interest)
        .replace("{GOAL}",               goal)
        .replace("{PROBLEM}",            problem)
        .replace("{ROLE}",               role)
        .replace("{OUTCOME}",            outcome)
        .replace("{STRENGTH}",           strength)
        .replace("{STRENGTH_EXAMPLE}",   strength_example)
        .replace("{WEAKNESS}",           weakness)
        .replace("{IMPROVEMENT_ACTION}", improvement_action)
    )
