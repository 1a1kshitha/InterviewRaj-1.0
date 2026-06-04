# Requirements Document

## Introduction

InterviewRaj v2 improves the existing single-file MVP to make it genuinely useful for Indian engineering students preparing for campus placements and internship interviews. The improvements are purely frontend (no backend required) and focus on three areas: a question bank with navigation, stronger rule-based feedback, and natural-sounding improved-answer templates tailored to the Indian student context.

## Glossary

- **App**: The InterviewRaj single-page web application (`index.html`)
- **Question_Bank**: The fixed array of 5–10 interview questions built into the app
- **Active_Question**: The question currently displayed to the user
- **Transcript**: The text of the user's spoken or typed answer
- **Feedback_Engine**: The JavaScript module that analyses the transcript and returns Score, Feedback bullets, and an Improved_Answer
- **Score**: An integer 0–100 summarising answer quality
- **Feedback**: 2–4 bullet-point observations about the transcript
- **Improved_Answer**: A templated sample answer generated from the transcript
- **Indian_Student_Template**: An improved-answer template written in natural English appropriate for Indian engineering students

## Requirements

### Requirement 1: Question Bank and Navigation

**User Story:** As a student, I want to practise multiple interview questions, so that I can prepare for different types of questions I may face.

#### Acceptance Criteria

1. THE App SHALL include a Question_Bank of at least 5 and at most 10 interview questions covering: self-introduction, project description, strengths/weaknesses, career goals, and teamwork.
2. THE App SHALL display the Active_Question prominently on the page.
3. THE App SHALL provide "Previous" and "Next" buttons to navigate between questions in the Question_Bank.
4. WHEN the user navigates to a new question, THE App SHALL clear the transcript textarea and hide the feedback section.
5. THE App SHALL display the current question number and total count (e.g., "Question 2 of 7") so the user knows their position.
6. WHEN the user is on the first question, THE App SHALL disable the "Previous" button.
7. WHEN the user is on the last question, THE App SHALL disable the "Next" button.

---

### Requirement 2: Improved Feedback Rules

**User Story:** As a student, I want specific, actionable feedback on my answer, so that I know exactly what to fix.

#### Acceptance Criteria

1. WHEN the user clicks "Get Feedback" and the transcript is non-empty, THE Feedback_Engine SHALL check whether the answer mentions the user's name or a self-introduction cue (e.g., "my name is", "I am").
2. THE Feedback_Engine SHALL check whether the answer mentions a branch or field of study (e.g., "computer science", "mechanical", "ECE", "IT", "civil", "electrical").
3. THE Feedback_Engine SHALL check whether the answer mentions a college or institution (e.g., "college", "university", "institute", "IIT", "NIT", "VIT").
4. THE Feedback_Engine SHALL check whether the answer mentions at least one project (e.g., "project", "built", "developed", "created", "implemented").
5. THE Feedback_Engine SHALL check whether the answer mentions at least one skill or tool (e.g., "python", "java", "c++", "react", "sql", "machine learning", "excel", "communication", "leadership").
6. THE Feedback_Engine SHALL produce a specific feedback bullet for each missing element (intro, branch, college, project, skill) rather than a generic message.
7. THE Feedback_Engine SHALL return between 2 and 4 feedback bullet points for any non-empty transcript.
8. THE Feedback_Engine SHALL compute a Score between 0 and 100 based on word count, presence of the five elements above, and keyword coverage.

---

### Requirement 3: Indian Student Improved-Answer Templates

**User Story:** As an Indian engineering student, I want the sample improved answer to sound natural and relevant to my context, so that I can use it as a realistic model.

#### Acceptance Criteria

1. THE App SHALL include a distinct Indian_Student_Template for each of the following question types: self-introduction, project description, and strengths/weaknesses.
2. WHEN generating an Improved_Answer, THE Feedback_Engine SHALL select the template that matches the Active_Question's type.
3. THE Indian_Student_Template for self-introduction SHALL follow the structure: greeting → name → college and branch → year → project highlight → skill → career goal.
4. THE Indian_Student_Template for project description SHALL follow the structure: project name → problem it solves → technologies used → your role → outcome/result.
5. THE Indian_Student_Template for strengths/weaknesses SHALL follow the structure: one strength with example → one weakness with improvement action.
6. WHERE a placeholder value cannot be detected in the transcript, THE Improved_Answer SHALL substitute a clearly readable placeholder string (e.g., "[your name]", "[your college]").
7. THE App SHALL include a clearly marked comment indicating where templates can be customised.

---

### Requirement 4: Preserved Core Behaviour

**User Story:** As a student, I want all existing features to continue working after the upgrade, so that I don't lose functionality I rely on.

#### Acceptance Criteria

1. THE App SHALL continue to use the Web Speech API for voice recording with Start/Stop controls.
2. THE App SHALL continue to display the transcript in an editable textarea.
3. THE App SHALL continue to show the Score, feedback bullets, and Improved_Answer in a results section.
4. THE App SHALL remain a single `index.html` file with no backend or paid services.
5. WHEN "Get Feedback" is clicked a second time, THE App SHALL replace the previous results with the new results.
