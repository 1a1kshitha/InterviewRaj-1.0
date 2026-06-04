# Requirements Document

## Introduction

InterviewRaj Phase 3 adds a lightweight user identity layer to the existing single-file frontend. Before a student can start practising, they fill in a simple onboarding form (name, college, year). This information is stored in `localStorage`, used to personalise messages throughout the session, and included in backend log entries so answers can later be filtered by college or year.

No login, no passwords, no accounts — just a simple form that remembers the student across sessions.

## Glossary

- **App**: The InterviewRaj single-page web application (`index.html`)
- **Profile**: The student's self-reported identity data: name, college, and year
- **Onboarding_Form**: The form shown before the main app when no Profile exists
- **Session**: A single browser session where the student practises interview questions
- **localStorage**: The browser's built-in key-value store used to persist the Profile

## Requirements

### Requirement 1: Onboarding Form

**User Story:** As a student, I want to enter my name, college, and year before I start, so that the app feels personalised to me.

#### Acceptance Criteria

1. WHEN a student opens the app and no Profile exists in localStorage, THE App SHALL display the Onboarding_Form before showing the main practice interface.
2. THE Onboarding_Form SHALL include fields for: name (text), college (text), and year (select: 1st, 2nd, 3rd, 4th, Other).
3. WHEN the student submits the Onboarding_Form with all fields filled, THE App SHALL save the Profile to localStorage and show the main practice interface.
4. IF the student submits the Onboarding_Form with any field empty, THEN THE App SHALL prevent submission and highlight the missing fields.
5. WHEN a student opens the app and a Profile already exists in localStorage, THE App SHALL skip the Onboarding_Form and show the main practice interface directly.

---

### Requirement 2: Personalised Messages

**User Story:** As a student, I want to see my name used in the app, so that the experience feels made for me.

#### Acceptance Criteria

1. WHEN the main practice interface loads, THE App SHALL display a personalised greeting using the student's name (e.g., "Welcome back, Raj!").
2. WHEN feedback is generated, THE App SHALL include the student's name in the improved answer template where the `{NAME}` placeholder appears.
3. THE App SHALL display the student's college and year in a small profile badge visible during the session.

---

### Requirement 3: Profile Persistence and Reset

**User Story:** As a student, I want my profile to be remembered between visits, so that I don't have to re-enter my details every time.

#### Acceptance Criteria

1. THE App SHALL persist the Profile in localStorage under the key `interviewraj_profile`.
2. WHEN the page is refreshed or reopened, THE App SHALL load the Profile from localStorage automatically.
3. THE App SHALL provide a "Change Profile" link that clears the Profile from localStorage and shows the Onboarding_Form again.

---

### Requirement 4: Backend Integration

**User Story:** As a developer, I want student identity included in logged answers, so that I can filter data by college or year later.

#### Acceptance Criteria

1. WHEN the frontend sends a request to `POST /evaluate/`, THE App SHALL include `student_name`, `student_college`, and `student_year` fields in the request body.
2. THE Backend SHALL accept these optional fields and save them to the `attempts` table.
3. WHERE a Profile does not exist (e.g., backend called directly), THE Backend SHALL treat identity fields as optional and use empty strings as defaults.
