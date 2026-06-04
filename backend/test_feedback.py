# test_feedback.py — Unit and property-based tests for feedback.py
import pytest
from hypothesis import given, settings
from hypothesis import strategies as st

from feedback import analyze_transcript, generate_improved_answer


# ── Unit tests ────────────────────────────────────────────────────────────

class TestAnalyzeTranscriptUnit:

    def test_empty_string_raises(self):
        with pytest.raises(ValueError):
            analyze_transcript("")

    def test_whitespace_only_raises(self):
        with pytest.raises(ValueError):
            analyze_transcript("   \t\n  ")

    def test_full_answer_score_high(self):
        """A complete answer mentioning all elements should score >= 70."""
        answer = (
            "My name is Raj. I am a computer science student at VIT. "
            "I built a project using Python where I developed a web scraper. "
            "I am interested in machine learning and want to work in AI. "
            "I have good communication skills and enjoy problem solving."
        )
        result = analyze_transcript(answer)
        assert result["score"] >= 70

    def test_full_answer_no_missing_bullets(self):
        """A complete answer should have no ⚠️ or ❌ (problem) bullets."""
        answer = (
            "My name is Raj. I am a computer science student at VIT. "
            "I built a project using Python where I developed a web scraper. "
            "I am interested in machine learning and want to work in AI."
        )
        result = analyze_transcript(answer)
        assert not any(b.startswith("⚠️") or b.startswith("❌") for b in result["bullets"])

    def test_short_answer_word_count_bullet(self):
        """A very short answer should get a word-count bullet."""
        result = analyze_transcript("I am a student.")
        assert any("short" in b.lower() or "word" in b.lower() for b in result["bullets"])

    def test_bullet_count_always_at_least_2(self):
        result = analyze_transcript("hello world")
        assert len(result["bullets"]) >= 2


class TestGenerateImprovedAnswerUnit:

    def test_intro_template_no_raw_tokens(self):
        answer = generate_improved_answer("", "intro")
        assert "{" not in answer and "}" not in answer

    def test_project_template_no_raw_tokens(self):
        answer = generate_improved_answer("", "project")
        assert "{" not in answer and "}" not in answer

    def test_strengths_template_no_raw_tokens(self):
        answer = generate_improved_answer("", "strengths")
        assert "{" not in answer and "}" not in answer

    def test_intro_template_structure(self):
        answer = generate_improved_answer("", "intro")
        assert "student at" in answer
        assert "passionate" in answer

    def test_project_template_structure(self):
        answer = generate_improved_answer("", "project")
        assert "project" in answer.lower()

    def test_strengths_template_structure(self):
        answer = generate_improved_answer("", "strengths")
        assert "strength" in answer.lower()
        assert "weakness" in answer.lower()

    def test_goals_uses_intro_template(self):
        """goals and teamwork types should fall back to the intro template."""
        intro  = generate_improved_answer("", "intro")
        goals  = generate_improved_answer("", "goals")
        assert "student at" in goals  # same structure as intro

    def test_known_college_extracted(self):
        answer = generate_improved_answer(
            "I am a student at VIT and I study computer science.", "intro"
        )
        assert "VIT" in answer

    def test_known_skill_extracted(self):
        answer = generate_improved_answer(
            "I know python and have worked on projects.", "intro"
        )
        assert "python" in answer.lower()


# ── Property-based tests ──────────────────────────────────────────────────

# Feature: interview-raj-backend, Property 1: Score is always in range
# Validates: Requirements 1.2
@settings(max_examples=100)
@given(st.text(min_size=1).filter(lambda t: t.strip()))
def test_score_in_range(transcript):
    """Property 1: For any non-empty transcript, score must be in [0, 100]."""
    result = analyze_transcript(transcript)
    assert isinstance(result["score"], int)
    assert 0 <= result["score"] <= 100


# Feature: interview-raj-backend, Property 2: Feedback bullet count is bounded
# Validates: Requirements 1.2
@settings(max_examples=100)
@given(st.text(min_size=1).filter(lambda t: t.strip()))
def test_bullet_count_bounded(transcript):
    """Property 2: For any non-empty transcript, bullet count must be in [2, 4]."""
    result = analyze_transcript(transcript)
    assert 2 <= len(result["bullets"]) <= 4


# Feature: interview-raj-backend, Property 4: No raw placeholder tokens in improved answer
# Validates: Requirements 1.4
@settings(max_examples=100)
@given(
    st.text(),
    st.sampled_from(["intro", "project", "strengths", "goals", "teamwork"])
)
def test_no_raw_tokens(transcript, question_type):
    """Property 4: generate_improved_answer must never return raw {TOKEN} strings."""
    answer = generate_improved_answer(transcript, question_type)
    assert "{" not in answer
    assert "}" not in answer
