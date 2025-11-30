# Journal Feature

## Overview
The Journal feature is the core of Write2Learn's "Active Output" philosophy. It allows users to write daily entries, use structured templates (frameworks) to guide their writing, and receive instant AI-powered feedback on grammar and vocabulary.

## Key Components

### 1. Journal Editor
-   **Implementation**: A custom Markdown editor (`LiveMarkdownEditor`) built on top of a standard `textarea`.
-   **Features**:
    -   Live markdown preview (via `react-markdown`).
    -   Tagging system.
    -   Date selection.
    -   Auto-save functionality.

### 2. Frameworks (Templates)
-   **Purpose**: To overcome "writer's block" by providing structured prompts.
-   **Management**:
    -   Users can create custom templates or use system defaults.
    -   Templates are stored in the `frameworks` table.
    -   Users can "pin" favorite templates for quick access on the dashboard.

### 3. AI Feedback Loop
-   **Process**:
    1.  User writes an entry and clicks "Get Feedback".
    2.  The content is sent to the `journal-feedback` webhook via `app/api/journal-feedback/route.ts`.
    3.  The AI analyzes the text and returns:
        -   **Enhanced Version**: A more natural/native rewriting of the entry.
        -   **Grammar Details**: Specific corrections with explanations.
        -   **Analysis**: Scores for Clarity, Vocabulary, and Ideas.
-   **Storage**: Feedback is stored in the `journals` table (JSONB column) and `feedback_logs` for analytics.

## Data Model

### `journals` Table
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid | Primary Key |
| `user_id` | uuid | Foreign Key to `profiles` |
| `content` | text | The raw markdown content |
| `journal_date` | date | The date the entry is assigned to |
| `title` | text | Entry title |
| `enhanced_version` | text | AI-enhanced version of the content |
| `created_at` | timestamp with time zone | Creation time |
| `is_draft` | boolean | Whether the entry is a draft |
| `summary` | text | AI-generated summary |

### `journal_tag` Table (Junction)
| Column | Type | Description |
| :--- | :--- | :--- |
| `journal_id` | uuid | Foreign Key to `journals` |
| `tag_id` | text | Foreign Key to `journal_tags` |

### `journal_tags` Table
| Column | Type | Description |
| :--- | :--- | :--- |
| `name` | text | Tag name (Primary Key) |

### `frameworks` Table
| Column | Type | Description |
| :--- | :--- | :--- |
| `name` | text | Template name |
| `content` | text | Template content/questions |
| `category` | text | Category (e.g., "Daily Reflection") |
| `description` | text | Template description |
| `source` | text | Source/author |
| `cover_image` | text | URL to cover image |

### `feedbacks` Table
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid | Primary Key |
| `profile_id` | uuid | Foreign Key to `profiles` |
| `source_type` | USER-DEFINED | 'journal' or 'roleplay' |
| `source_id` | uuid | ID of the journal or session |
| `vocabulary_feedback` | text | Vocabulary suggestions |
| `clarity_feedback` | text | Clarity analysis |
| `ideas_feedback` | text | Ideas/content feedback |
| `enhanced_version` | text | Enhanced version of content |
| `summary` | text | Summary of the content |
| `fixed_typo` | text | Typo corrections |
| `created_at` | timestamp with time zone | Feedback creation time |

### `feedback_grammar_items` Table
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid | Primary Key |
| `feedback_id` | uuid | Foreign Key to `feedbacks` |
| `grammar_topic_id` | text | Grammar error category |
| `description` | text | Error description |
| `tags` | ARRAY | Associated tags |
| `created_at` | timestamp with time zone | Creation time |

## Workflows

### Creating an Entry
1.  User clicks "New Entry" or selects a template from the Dashboard.
2.  If a template is selected, the editor pre-fills with the template's questions.
3.  User writes content.
4.  `useJournalEditor` hook handles auto-saving to Supabase.

### Requesting Feedback
1.  User clicks the "AI Feedback" button.
2.  The app calls `journalFeedbackService.generateFeedback()`.
3.  The UI shows a loading state while the webhook processes the request.
4.  Upon success, the feedback is displayed in tabs (Clarity, Vocab, Ideas, Enhanced).
