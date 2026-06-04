# test_main.py — Unit and property-based tests for main.py (FastAPI endpoint)
import os
import sqlite3
import tempfile

import pytest
from fastapi.testclient import TestClient
from hypothesis import given, settings
from hypothesis import strategies as st

# Patch DB_PATH to a temp file before importing the app
import main as main_module

VALID_PAYLOAD = {
    "question": "Tell me about yourself.",
    "answer": (
        "My name is Raj. I am a computer science student at VIT. "
        "I built a project using Python where I developed a web scraper. "
        "I am interested in machine learning."
    ),
    "question_type": "intro",
}


@pytest.fixture()
def tmp_db(tmp_path):
    """Fixture: provide a fresh temp DB path and patch main_module.DB_PATH."""
    db_path = str(tmp_path / "test.db")
    original = main_module.DB_PATH
    main_module.DB_PATH = db_path
    main_module.init_db(db_path)
    yield db_path
    main_module.DB_PATH = original


@pytest.fixture()
def client(tmp_db):
    """Fixture: TestClient wired to the temp DB."""
    return TestClient(main_module.app)


def row_count(db_path: str) -> int:
    with sqlite3.connect(db_path) as conn:
        return conn.execute("SELECT COUNT(*) FROM attempts").fetchone()[0]


# ── Unit tests ────────────────────────────────────────────────────────────

class TestEndpointUnit:

    def test_valid_request_returns_200(self, client):
        resp = client.post("/evaluate/", json=VALID_PAYLOAD)
        assert resp.status_code == 200

    def test_response_has_correct_shape(self, client):
        resp = client.post("/evaluate/", json=VALID_PAYLOAD)
        data = resp.json()
        assert "score" in data
        assert "bullets" in data
        assert "improved_answer" in data

    def test_score_in_range(self, client):
        resp = client.post("/evaluate/", json=VALID_PAYLOAD)
        assert 0 <= resp.json()["score"] <= 100

    def test_empty_answer_returns_400(self, client):
        payload = {**VALID_PAYLOAD, "answer": ""}
        resp = client.post("/evaluate/", json=payload)
        assert resp.status_code == 400

    def test_whitespace_answer_returns_400(self, client):
        payload = {**VALID_PAYLOAD, "answer": "   "}
        resp = client.post("/evaluate/", json=payload)
        assert resp.status_code == 400

    def test_missing_field_returns_422(self, client):
        resp = client.post("/evaluate/", json={"question": "Q", "answer": "A"})
        assert resp.status_code == 422

    def test_cors_header_present(self, client):
        resp = client.options(
            "/evaluate/",
            headers={"Origin": "http://localhost", "Access-Control-Request-Method": "POST"},
        )
        assert resp.headers.get("access-control-allow-origin") == "*"

    def test_valid_request_saves_db_row(self, client, tmp_db):
        before = row_count(tmp_db)
        client.post("/evaluate/", json=VALID_PAYLOAD)
        assert row_count(tmp_db) == before + 1

    def test_root_endpoint(self, client):
        resp = client.get("/")
        assert resp.status_code == 200


# ── Property-based tests ──────────────────────────────────────────────────

# Feature: interview-raj-backend, Property 5: Every valid request produces a DB row
# Validates: Requirements 1.3, 2.4
@settings(max_examples=30)
@given(
    st.text(min_size=1).filter(lambda t: t.strip()),
    st.text(min_size=1).filter(lambda t: t.strip()),
    st.sampled_from(["intro", "project", "strengths", "goals", "teamwork"]),
)
def test_every_valid_request_creates_db_row(question, answer, question_type):
    """Property 5: Every valid POST /evaluate/ must increase DB row count by 1."""
    with tempfile.TemporaryDirectory(ignore_cleanup_errors=True) as tmp:
        db_path = os.path.join(tmp, "test.db")
        original = main_module.DB_PATH
        main_module.DB_PATH = db_path
        main_module.init_db(db_path)
        try:
            with TestClient(main_module.app) as client:
                before = row_count(db_path)
                resp = client.post("/evaluate/", json={
                    "question": question,
                    "answer": answer,
                    "question_type": question_type,
                })
                assert resp.status_code == 200
                assert row_count(db_path) == before + 1
        finally:
            main_module.DB_PATH = original
