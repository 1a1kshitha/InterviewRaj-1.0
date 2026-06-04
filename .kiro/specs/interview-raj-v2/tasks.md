# Implementation Plan: InterviewRaj v2

## Overview

All changes are edits to the existing `index.html`. Tasks are ordered so each step is immediately runnable. Optional test sub-tasks are marked with `*`.

## Tasks

- [x] 1. Add Question Bank and navigation UI
  - Add `QUESTION_BANK` array with 7 questions (types: intro, project, strengths, goals, teamwork)
  - Add `#btn-prev`, `#btn-next`, and `#question-counter` elements to the HTML
  - Implement `navigate(direction)` and `renderQuestion()` functions
  - On navigation: update question text, counter, disable/enable buttons, clear `#transcript`, hide `#feedback-section`
  - Call `renderQuestion()` on page load to initialise
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [x] 1.1 Write property test — Property 3: Navigation index stays in bounds
    - Generate random sequences of +1/-1 moves; verify index always in [0, QUESTION_BANK.length - 1]
    - **Property 3: Navigation stays in bounds**
    - **Validates: Requirements 1.3, 1.6, 1.7**

  - [x] 1.2 Write unit tests for navigation edge cases
    - navigate(-1) from index 0 → index stays 0, Previous button disabled
    - navigate(+1) from last index → index stays at max, Next button disabled
    - navigate(+1) from any middle index → transcript cleared, feedback hidden
    - _Requirements: 1.4, 1.6, 1.7_

- [x] 2. Upgrade analyzeTranscript with five element checks
  - Replace old structural-cue checks with five specific checks: intro cue, branch, college, project, skill/tool
  - Each missing element adds a specific, actionable bullet
  - Update scoring weights to match design (intro +10, branch +10, college +10, project +15, skill +15)
  - Keep word-count check and score cap at 100; keep bullet clamp at 2–4
  - Add clearly marked comments for tuning keyword lists
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

  - [x] 2.1 Write property test — Property 1: Score always in range
    - **Property 1: Score is always in range**
    - **Validates: Requirements 2.8**

  - [x] 2.2 Write property test — Property 2: Bullet count bounded
    - **Property 2: Feedback bullet count is bounded**
    - **Validates: Requirements 2.7**

  - [x] 2.3 Write unit test for full-answer scoring
    - Input: "My name is Raj, I am a CSE student at VIT, I built a project using Python"
    - Expected: score >= 70, no missing-element bullets for intro/branch/college/project/skill
    - _Requirements: 2.1–2.6_

- [x] 3. Implement Indian student templates and upgrade generateImprovedAnswer
  - Add three template constants: `TEMPLATE_INTRO`, `TEMPLATE_PROJECT`, `TEMPLATE_STRENGTHS`
  - Update `generateImprovedAnswer(transcript, questionType)` to accept question type and select the right template
  - Add extraction for new placeholders: `{YEAR}`, `{SKILL}`, `{GOAL}`, `{PROBLEM}`, `{ROLE}`, `{OUTCOME}`, `{STRENGTH}`, `{STRENGTH_EXAMPLE}`, `{WEAKNESS}`, `{IMPROVEMENT_ACTION}`
  - Ensure all `{PLACEHOLDER}` tokens are replaced before returning (fallback strings for undetected values)
  - Add clearly marked comment indicating where templates can be customised
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [x] 3.1 Write property test — Property 4: No raw placeholder tokens in output
    - For any transcript and any question type, output must not contain `{` or `}`
    - **Property 4: Improved answer contains all template slots**
    - **Validates: Requirements 3.6**

  - [x] 3.2 Write unit tests for template selection
    - `generateImprovedAnswer('', 'intro')` → output contains "student at" structure
    - `generateImprovedAnswer('', 'project')` → output contains "project" and "technologies" structure
    - `generateImprovedAnswer('', 'strengths')` → output contains "strength" and "weakness" structure
    - _Requirements: 3.2, 3.3, 3.4, 3.5_

- [x] 4. Wire question type into handleFeedback
  - Pass `QUESTION_BANK[activeIndex].type` as second argument to `generateImprovedAnswer` in the `handleFeedback` function
  - _Requirements: 3.2, 4.3_

- [ ] 5. Checkpoint — Verify full flow in Chrome
  - Open `index.html` in Chrome
  - Navigate through all 7 questions; verify counter updates and transcript clears
  - Record a short answer for the intro question; verify feedback uses the five element checks
  - Verify improved answer uses the intro template and has no raw `{...}` tokens

## Notes

- All tasks are required (comprehensive testing from start)
- All keyword lists and templates are marked with `// ===` comments for easy customisation
- No backend, no build step — just edit and refresh Chrome
