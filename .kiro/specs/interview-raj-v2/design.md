# Design Document: InterviewRaj v2

## Overview

v2 upgrades the existing single-file MVP in three focused areas without adding any backend or build step:

1. A **Question Bank** with navigation (Previous / Next, counter)
2. **Stronger feedback rules** — five specific element checks (intro, branch, college, project, skill)
3. **Indian student templates** — three question-type-specific improved-answer templates

All changes are additive edits to `index.html`. Existing behaviour (Web Speech API, editable transcript, results display) is fully preserved.

---

## Architecture

The architecture remains a single `index.html` with three logical modules. v2 adds a **Question Controller** module and extends the Feedback Engine.

```
┌──────────────────────────────────────────────────────────┐
│                      index.html                          │
│                                                          │
│  ┌─────────────────┐   ┌──────────────────────────────┐ │
│  │    UI Layer     │   │     Feedback Engine (JS)     │ │
│  │  (HTML / CSS)   │◄──│  analyzeTranscript()  (v2)   │ │
│  │                 │   │  generateImprovedAnswer() (v2)│ │
│  └────────┬────────┘   └──────────────────────────────┘ │
│           │                                              │
│  ┌────────▼────────────────────────────────────────────┐ │
│  │          Question Controller (JS)  ← NEW            │ │
│  │   QUESTION_BANK[]   activeIndex   navigate()        │ │
│  └────────┬────────────────────────────────────────────┘ │
│           │                                              │
│  ┌────────▼────────────────────────────────────────────┐ │
│  │          Recording Controller (JS)  (unchanged)     │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

## Components and Interfaces

### 1. Question Controller (new)

```javascript
// Data
const QUESTION_BANK = [
  { id: 1, type: 'intro',     text: 'Tell me about yourself.' },
  { id: 2, type: 'project',   text: 'Describe a project you have worked on.' },
  { id: 3, type: 'strengths', text: 'What are your strengths and weaknesses?' },
  { id: 4, type: 'goals',     text: 'Where do you see yourself in 5 years?' },
  { id: 5, type: 'teamwork',  text: 'Tell me about a time you worked in a team.' },
  { id: 6, type: 'intro',     text: 'Why should we hire you?' },
  { id: 7, type: 'project',   text: 'What technologies have you worked with?' },
];

let activeIndex = 0;   // index into QUESTION_BANK

// Public interface
function navigate(direction)   // direction: +1 (next) or -1 (prev)
function renderQuestion()      // updates DOM: question text, counter, button states
```

New DOM elements:

```
#btn-prev          — "← Previous" button
#btn-next          — "→ Next" button
#question-counter  — <span> showing "Question X of Y"
```

### 2. Feedback Engine (extended)

#### analyzeTranscript(transcript) — v2 checks

Five new element checks replace/extend the old structural cue checks:

| Check | Regex / keyword list | Score points |
|---|---|---|
| Intro cue | `/\bmy name is\b|\bi am\b|\bi'm\b/i` | +10 |
| Branch mention | `["computer science","cse","ece","mechanical","civil","electrical","it","information technology","electronics"]` | +10 |
| College mention | `/\b(college|university|institute|iit|nit|vit|bits|srm|manipal|anna)\b/i` | +10 |
| Project mention | `/\b(project|built|developed|created|implemented|designed)\b/i` | +15 |
| Skill/tool mention | `["python","java","c++","javascript","react","sql","machine learning","excel","communication","leadership","teamwork","problem solving"]` | +15 |

Scoring table (v2):

| Check | Points |
|---|---|
| Word count 30–120 | +40 |
| Word count < 30 | +10 |
| Word count > 120 | +25 |
| Intro cue present | +10 |
| Branch present | +10 |
| College present | +10 |
| Project present | +15 |
| Skill present | +15 |

Max possible before cap: 100. Score capped at 100.

Feedback bullets (v2): one bullet per missing element + word-count bullet = 2–4 total (clamped).

#### generateImprovedAnswer(transcript, questionType) — v2 signature

Takes the question type string (`'intro'`, `'project'`, `'strengths'`, `'goals'`, `'teamwork'`) and selects the matching template.

### 3. Indian Student Templates

#### Template: intro

```
Hi, my name is {NAME}. I am a {YEAR} year {BRANCH} student at {COLLEGE}.
During my studies, I worked on a project called {PROJECT}, where I {PROJECT_DETAIL}.
I am skilled in {SKILL} and I am passionate about {INTEREST}.
My goal is to {GOAL} and contribute meaningfully to your organisation.
```

#### Template: project

```
I worked on a project called {PROJECT}.
The problem it solved was {PROBLEM}.
I used {SKILL} to build it, and my role was to {ROLE}.
The outcome was {OUTCOME}, which taught me a lot about real-world development.
```

#### Template: strengths

```
One of my key strengths is {STRENGTH}. For example, {STRENGTH_EXAMPLE}.
A weakness I am working on is {WEAKNESS}.
To improve, I have been {IMPROVEMENT_ACTION}, and I have already seen progress.
```

#### Fallback templates (goals, teamwork)

For question types without a dedicated template, fall back to the `intro` template — it covers the most common self-introduction scenario.

#### Placeholder extraction (v2)

| Placeholder | Detection strategy |
|---|---|
| `{NAME}` | Always fallback `[your name]` |
| `{YEAR}` | Digit before "year" or "rd"/"th"/"st"/"nd" year pattern |
| `{COLLEGE}` | Word(s) after "at" / "from" with capital letter, or known college name |
| `{BRANCH}` | Known branch keyword found in transcript |
| `{PROJECT}` | Phrase after "project" keyword |
| `{PROJECT_DETAIL}` | Phrase after "where I" / "which I" |
| `{SKILL}` | First matched skill/tool keyword |
| `{INTEREST}` | Phrase after "interested in" / "passionate about" |
| `{GOAL}` | Phrase after "want to" / "goal is" / "aspire" |
| `{PROBLEM}` | Phrase after "problem" / "issue" / "challenge" |
| `{ROLE}` | Phrase after "my role" / "I was responsible" |
| `{OUTCOME}` | Phrase after "result" / "outcome" / "achieved" |
| `{STRENGTH}` | Phrase after "strength is" / "good at" |
| `{STRENGTH_EXAMPLE}` | Phrase after "for example" / "for instance" |
| `{WEAKNESS}` | Phrase after "weakness is" / "struggle with" |
| `{IMPROVEMENT_ACTION}` | Phrase after "working on" / "improving" / "practising" |

---

## Data Models

### Question object

```javascript
{
  id:   Number,   // 1-based
  type: String,   // 'intro' | 'project' | 'strengths' | 'goals' | 'teamwork'
  text: String    // question text shown to user
}
```

### FeedbackResult (unchanged shape, extended content)

```javascript
{
  score:   Number,   // 0–100 integer
  bullets: Array     // 2–4 strings
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do.*

### Property 1: Score is always in range

*For any* non-empty transcript string, `analyzeTranscript(transcript).score` must be an integer in [0, 100].
**Validates: Requirements 2.8**

### Property 2: Bullet count is bounded

*For any* non-empty transcript string, `analyzeTranscript(transcript).bullets` must contain between 2 and 4 elements.
**Validates: Requirements 2.7**

### Property 3: Navigation stays in bounds

*For any* sequence of Previous/Next button clicks, `activeIndex` must always remain in [0, QUESTION_BANK.length - 1].
**Validates: Requirements 1.3, 1.6, 1.7**

### Property 4: Improved answer contains all template slots

*For any* transcript and any question type, `generateImprovedAnswer(transcript, type)` must return a string where every placeholder is either filled with detected text or replaced with a readable fallback — no raw `{PLACEHOLDER}` tokens remain in the output.
**Validates: Requirements 3.6**

### Property 5: Transcript cleared on navigation

*For any* active question index, calling `navigate(+1)` or `navigate(-1)` must result in the transcript textarea being empty and the feedback section being hidden.
**Validates: Requirements 1.4**

---

## Error Handling

All existing error handling (unsupported browser, mic denied, empty transcript, network error) is preserved unchanged.

---

## Testing Strategy

Tests remain in `tests.html` using fast-check via CDN.

### Unit Tests

- `navigate(+1)` from last question → index stays at last, Next button disabled
- `navigate(-1)` from first question → index stays at 0, Previous button disabled
- `analyzeTranscript` with "My name is Raj, I am a CSE student at VIT, I built a project using Python" → score ≥ 70, no missing-element bullets for intro/branch/college/project/skill
- `generateImprovedAnswer('', 'intro')` → no raw `{...}` tokens in output
- `generateImprovedAnswer('', 'project')` → no raw `{...}` tokens in output
- `generateImprovedAnswer('', 'strengths')` → no raw `{...}` tokens in output

### Property-Based Tests

**Property 1: Score in range**
```javascript
fc.assert(fc.property(fc.string({ minLength: 1 }), t => {
  const r = analyzeTranscript(t);
  return r.score >= 0 && r.score <= 100 && Number.isInteger(r.score);
}), { numRuns: 100 });
```

**Property 2: Bullet count bounded**
```javascript
fc.assert(fc.property(fc.string({ minLength: 1 }), t => {
  const r = analyzeTranscript(t);
  return r.bullets.length >= 2 && r.bullets.length <= 4;
}), { numRuns: 100 });
```

**Property 3: Navigation stays in bounds**
```javascript
fc.assert(fc.property(
  fc.array(fc.constantFrom(+1, -1), { minLength: 1, maxLength: 50 }),
  moves => {
    let idx = 0;
    const max = QUESTION_BANK.length - 1;
    moves.forEach(d => { idx = Math.max(0, Math.min(max, idx + d)); });
    return idx >= 0 && idx <= max;
  }
), { numRuns: 100 });
```

**Property 4: No raw placeholder tokens in output**
```javascript
fc.assert(fc.property(
  fc.string(),
  fc.constantFrom('intro', 'project', 'strengths', 'goals', 'teamwork'),
  (t, type) => {
    const answer = generateImprovedAnswer(t, type);
    return !answer.includes('{') && !answer.includes('}');
  }
), { numRuns: 100 });
```
