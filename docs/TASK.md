## 2. User Flow

Users perform learning activities such as adding vocabulary, reviewing flashcards, writing journal entries, or completing role-play sessions.

Each action generates a learning event stored in the `learning_events` table:

- event_type: `vocab_created`, `vocab_reviewed`, `journal_created`, `roleplay_completed`, `session_active`
- reference_id: links to the related vocab item, journal entry, or session
- metadata: optional JSON details

Grammar errors are stored in `grammar_feedback_logs` and aggregated through a view for dashboard charts.

### Dashboard Queries

- Daily goal card → counts of events per day
- Weekly column chart → stacked counts per day/week
- Error category bar chart → aggregated counts per grammar topic
- Streak → consecutive `session_active` days

### Frontend Displays

- Daily goal card → checkboxes for each learning activity
- Weekly activity column chart → stacked columns per day
- Grammar error bar chart → bar lengths proportional to error counts
- Optional heatmap or streak indicator

---

## 3. Chart Types

- Daily goal card → checkboxes (binary completion)
- Weekly activity → stacked column chart
- Grammar error distribution → horizontal bar chart

---

## 4. Data / Backend Aspects

### `learning_events` Table (new)

Stores atomic, append-only learning events.

**Columns:**
- id
- profile_id
- event_type
- reference_id
- metadata
- created_at

### Existing Tables

- `grammar_feedback_items`
- `grammar_feedback_view` → aggregates grammar errors by topic over a timespan

### Backend Responsibilities

Expose API endpoints to:

- Query counts per event type per day/week
- Query aggregated grammar errors
- Query streak data

Frontend should rely on components already available in the current codebase before importing new libraries.

---

## Event Types (`event_type` in `learning_events`)

### Vocabulary  
- `vocab_created` → user adds a new vocabulary item  
- `vocab_reviewed` → user reviews a flashcard  

### Journal  
- `journal_created` → user submits a journal entry  

### Role-play  
- `roleplay_completed` → user finishes a role-play session  

### Engagement / Streak  
- `session_active` → marks that the user was active that day (triggered when any learning event occurs)
