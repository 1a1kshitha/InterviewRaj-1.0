# Implementation Plan: InterviewRaj

## Overview

Build the complete InterviewRaj MVP as a single `index.html` file. Tasks are ordered so each step produces runnable, integrated code — no orphaned modules. Tests are co-located as sub-tasks so correctness is validated incrementally.

## Tasks

- [x] 1. Scaffold index.html with static structure and styles
  - Create `index.html` with all required sections: `#question-section`, `#recording-section`, `#transcript-section`, `#feedback-section`
  - Add all required DOM element IDs: `#question-text`, `#btn-start`, `#btn-stop`, `#recording-status`, `#transcript`, `#btn-feedback`, `#score-display`, `#feedback-list`, `#improved-answer`, `#error-message`
  - Write the `<style>` block: clean, minimal layout; `#feedback-section` hidden by default (`display: none`)
  - Add deployment and usage comments at the top of the file
  - Add a clearly marked comment indicating where to change the question text
  - _Requirements: 1.1, 1.2, 7.1, 7.2, 7.3_

- [x] 2. Implement the Feedback Engine
  - [x] 2.1 Implement `analyzeTranscript(transcript)`
    - Return `{ score: 0, bullets: ["Please record or type your answer first."] }` for empty/whitespace-only input
    - Compute word count; add word-count bullet and score contribution
    - Check keyword presence against `KEYWORDS` array; add keyword bullet and score contribution
    - Check structural cues (current status, project, skills/interests); add structural bullet(s) and score contribution
    - Cap score at 100; ensure bullet count is always 2–4
    - Add clearly marked comments indicating where to tune feedback rules and the keyword set
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [ ]* 2.2 Write property test for analyzeTranscript — Property 1: Score is always in range
    - Use fast-check via CDN in `tests.html`
    - **Property 1: Score is always in range**
    - **Validates: Requirements 4.1**

  - [ ]* 2.3 Write property test for analyzeTranscript — Property 2: Feedback bullet count is bounded
    - **Property 2: Feedback bullet count is bounded**
    - **Validates: Requirements 4.5**

  - [ ]* 2.4 Write property test for analyzeTranscript — Property 5: Whitespace-only treated as empty
    - **Property 5: Whitespace-only transcripts are treated as empty**
    - **Validates: Requirements 4.6**

  - [ ]* 2.5 Write unit tests for analyzeTranscript edge cases
    - Empty string → guard message, no score
    - 10-word answer → word-count bullet present, score < 40
    - 60-word answer with 4 keywords → score ≥ 70
    - _Requirements: 4.1, 4.2, 4.5, 4.6_

- [x] 3. Implement `generateImprovedAnswer(transcript)`
  - Fill the improved answer template with values extracted from the transcript using simple regex/keyword proximity
  - Fall back to readable placeholder strings (`[your name]`, `[your college]`, etc.) when values cannot be detected
  - Add a clearly marked comment indicating where the template can be customised
  - _Requirements: 5.1, 5.2, 5.3, 5.5_

  - [ ]* 3.1 Write property test for generateImprovedAnswer — Property 4: All placeholder slots present
    - **Property 4: Improved answer always contains all placeholder slots**
    - **Validates: Requirements 5.2, 5.3**

  - [ ]* 3.2 Write unit tests for generateImprovedAnswer
    - Empty input → all five fallback placeholders present
    - "I am a computer science student at MIT interested in AI" → COLLEGE filled with "MIT", INTEREST filled with "AI"
    - _Requirements: 5.2, 5.3_

- [ ] 4. Checkpoint — Ensure Feedback Engine tests pass
  - Open `tests.html` in Chrome and verify all property and unit tests pass before wiring the UI.

- [x] 5. Implement the Recording Controller
  - Detect `window.SpeechRecognition || window.webkitSpeechRecognition`; show unsupported-browser error if absent
  - Implement `startRecording()`: clear transcript, show "Recording…" status, enable `#btn-stop`, disable `#btn-start`, start recognition
  - Implement `stopRecording()`: call `recognition.stop()`, update status to "Stopped", swap button states
  - Handle `recognition.onresult` to accumulate and display transcript in `#transcript`
  - Handle `recognition.onerror` for `not-allowed` (mic denied) and `network` errors; display appropriate messages in `#error-message`
  - Handle `recognition.onend` to reset UI state
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.3_

  - [ ]* 5.1 Write unit tests for Recording Controller error paths
    - Mock `SpeechRecognition = undefined` → unsupported-browser message shown
    - Simulate `onerror` with `error = 'not-allowed'` → mic-denied message shown
    - _Requirements: 2.4, 2.5_

- [x] 6. Wire UI events and render results
  - Attach `startRecording` to `#btn-start` click
  - Attach `stopRecording` to `#btn-stop` click
  - Attach "Get Feedback" handler to `#btn-feedback` click:
    - Read transcript from `#transcript`
    - Guard against empty/whitespace-only input (show inline message, return early)
    - Call `analyzeTranscript` and `generateImprovedAnswer`
    - Render score in `#score-display`, bullets in `#feedback-list`, improved answer in `#improved-answer`
    - Make `#feedback-section` visible (`display: block`)
    - Replace any previous results (clear list before re-rendering)
  - Ensure `#transcript` remains editable while results are visible
  - _Requirements: 3.2, 4.6, 6.1, 6.2, 6.3_

  - [ ]* 6.1 Write property test — Property 6: Re-submitting replaces previous results
    - Simulate two sequential feedback calls with different transcripts; verify only second result is present in DOM
    - **Property 6: Re-submitting replaces previous results**
    - **Validates: Requirements 6.3**

  - [ ]* 6.2 Write unit tests for results rendering
    - After feedback call, `#feedback-section` is visible
    - `#transcript` is not disabled/readonly after feedback is shown
    - _Requirements: 6.1, 6.2_

- [ ] 7. Final checkpoint — Ensure all tests pass
  - Open `tests.html` in Chrome and confirm all property-based and unit tests pass.
  - Open `index.html` in Chrome, allow microphone, record a short answer, and verify the full flow works end-to-end.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- `tests.html` uses fast-check loaded from CDN — no install required, just open in Chrome
- All tunable constants (question text, keyword set, scoring weights, improved answer template) are marked with `// ===` comments in the source
- Checkpoints in tasks 4 and 7 ensure incremental validation before moving forward
