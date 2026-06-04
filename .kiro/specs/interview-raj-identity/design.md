# Design Document: InterviewRaj Phase 3 — Light User Identity

## Overview

A lightweight identity layer added entirely to `index.html` (no new files). A simple onboarding form is shown on first visit, the profile is saved to `localStorage`, and the data is used to personalise the UI and enrich backend log entries. The backend `main.py` is updated to accept and store the three new optional fields.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     index.html                          │
│                                                         │
│  ┌──────────────────┐    ┌───────────────────────────┐  │
│  │ Onboarding Form  │    │   Main Practice UI        │  │
│  │ (shown if no     │───▶│   (shown after profile    │  │
│  │  profile)        │    │    is saved)              │  │
│  └──────────────────┘    └───────────────────────────┘  │
│                                   │                     │
│                          ┌────────▼──────────┐          │
│                          │  Profile Manager  │          │
│                          │  loadProfile()    │          │
│                          │  saveProfile()    │          │
│                          │  clearProfile()   │          │
│                          └────────┬──────────┘          │
│                                   │                     │
│                          localStorage                   │
│                          key: interviewraj_profile      │
└─────────────────────────────────────────────────────────┘
```

---

## Components and Interfaces

### 1. Onboarding Form (new HTML section)

```html
<section id="onboarding-section">
  <h2>Welcome to InterviewRaj</h2>
  <input  id="input-name"    type="text"   placeholder="Your name" />
  <input  id="input-college" type="text"   placeholder="Your college" />
  <select id="input-year">
    <option value="">Select year</option>
    <option value="1st">1st Year</option>
    <option value="2nd">2nd Year</option>
    <option value="3rd">3rd Year</option>
    <option value="4th">4th Year</option>
    <option value="Other">Other</option>
  </select>
  <button id="btn-save-profile">Start Practising →</button>
  <p id="profile-error"></p>
</section>
```

Hidden by default; shown when no profile exists.

### 2. Profile Badge (new HTML element in header area)

```html
<div id="profile-badge">
  <span id="greeting"></span>          <!-- "Welcome back, Raj!" -->
  <span id="badge-college-year"></span> <!-- "VIT · 3rd Year" -->
  <a id="link-change-profile">Change Profile</a>
</div>
```

Hidden until profile is loaded.

### 3. Profile Manager (JS)

```javascript
const PROFILE_KEY = 'interviewraj_profile';

function loadProfile()          // returns parsed object or null
function saveProfile(profile)   // saves {name, college, year} to localStorage
function clearProfile()         // removes key, shows onboarding form

// Profile shape
{
  name:    string,
  college: string,
  year:    string   // '1st' | '2nd' | '3rd' | '4th' | 'Other'
}
```

### 4. Updated handleFeedback

- Reads profile from `loadProfile()` before the fetch call
- Passes `student_name`, `student_college`, `student_year` in the JSON body
- Passes `profile.name` to `generateImprovedAnswer` so `{NAME}` is filled

### 5. Updated generateImprovedAnswer signature

```javascript
generateImprovedAnswer(transcript, questionType, studentName)
// studentName replaces the always-fallback '[your name]'
```

---

## Data Models

### Profile (localStorage)

```json
{
  "name":    "Raj",
  "college": "VIT",
  "year":    "3rd"
}
```

Stored as JSON string under key `interviewraj_profile`.

### Updated EvaluateRequest (backend)

```python
class EvaluateRequest(BaseModel):
    question:        str
    answer:          str
    question_type:   str
    student_name:    str = ""   # optional
    student_college: str = ""   # optional
    student_year:    str = ""   # optional
```

### Updated attempts table (backend)

```sql
ALTER TABLE attempts ADD COLUMN student_name    TEXT DEFAULT '';
ALTER TABLE attempts ADD COLUMN student_college TEXT DEFAULT '';
ALTER TABLE attempts ADD COLUMN student_year    TEXT DEFAULT '';
```

`init_db()` uses `CREATE TABLE IF NOT EXISTS` with all columns so new installs get them automatically. Existing DBs get the columns added via `ALTER TABLE IF NOT EXISTS` (SQLite 3.37+) or a safe migration check.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system.*

### Property 1: Profile round-trip

*For any* valid profile object `{name, college, year}`, saving it to localStorage and loading it back must produce an equivalent object.
**Validates: Requirements 3.1, 3.2**

### Property 2: Onboarding form rejects incomplete profiles

*For any* submission where at least one field is empty, the form must not save a profile and must not show the main interface.
**Validates: Requirements 1.4**

### Property 3: Name always appears in improved answer

*For any* non-empty student name, `generateImprovedAnswer(transcript, type, name)` must return a string containing that name.
**Validates: Requirements 2.2**

### Property 4: Backend accepts missing identity fields

*For any* valid request to `POST /evaluate/` that omits `student_name`, `student_college`, `student_year`, the endpoint must return 200 (not 422).
**Validates: Requirements 4.3**

---

## Error Handling

| Scenario | Handling |
|---|---|
| Form submitted with empty field | Highlight empty inputs, show inline error, prevent save |
| localStorage unavailable (private mode) | Catch exception, show onboarding form on every visit |
| Backend missing identity columns (old DB) | `init_db()` runs `ALTER TABLE` safely; falls back to empty strings |

---

## Testing Strategy

### Frontend (tests.html additions)

Unit tests:
- `saveProfile({name:'Raj', college:'VIT', year:'3rd'})` then `loadProfile()` → same object
- `loadProfile()` when nothing saved → null
- `clearProfile()` → `loadProfile()` returns null
- `generateImprovedAnswer('', 'intro', 'Raj')` → output contains "Raj"

Property tests (fast-check):
- **Property 1**: For any `{name, college, year}` with non-empty strings, round-trip is identity
- **Property 3**: For any non-empty name string, improved answer contains that name

### Backend (test_main.py additions)

Unit tests:
- Request without identity fields → 200 (fields default to empty string)
- Request with identity fields → 200, row saved with correct values

Property test:
- **Property 4**: For any valid answer, omitting identity fields always returns 200
