# Roleplay Feature

## Overview
The Roleplay feature allows users to practice real-world English conversations with an AI partner. It simulates various scenarios (e.g., "Ordering Coffee", "Job Interview") to help users build confidence and fluency.

## Key Components

### 1. Scenario Selection
-   **Scenarios**: Pre-defined situations stored in the `roleplays` table.
-   **Filtering**: Users can filter scenarios by topic or difficulty level.
-   **Display**: Scenarios are presented as cards on the Dashboard and Roleplay page.

### 2. Chat Interface (`app/roleplay/session/[id]`)
-   **Interaction**: A chat-like interface where users exchange messages with the AI.
-   **Voice Mode**: Users can speak their input (using browser Speech-to-Text) and hear the AI's response (using Text-to-Speech).
-   **AI Integration**:
    -   User messages are sent to the `roleplay` webhook via `app/api/roleplay/webhook/route.ts`.
    -   The webhook maintains context and generates appropriate responses based on the scenario's `ai_role` and `partner_prompt`.

### 3. Session Summary & Feedback
-   **Completion**: When a session ends, a summary page is generated.
-   **Feedback**:
    -   The AI analyzes the entire conversation.
    -   It provides feedback on **Clarity**, **Vocabulary**, and **Ideas**.
    -   It offers an **Enhanced Version** of the user's messages.
    -   **Grammar Details** highlight specific errors.

## Data Model

### `roleplays` Table
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid | Primary Key |
| `name` | text | Scenario title |
| `context` | text | Description of the situation |
| `starter_message` | text | AI's opening message |
| `task` | text | User's objective in the scenario |
| `level` | text | Difficulty level (Beginner, Intermediate, Advanced) |
| `topic` | text | Topic category |
| `ai_role` | text | The role the AI plays (e.g., "Barista") |
| `partner_prompt` | text | System prompt for the AI |
| `image` | text | URL to scenario image |
| `created_at` | timestamp without time zone | Creation time |

### `sessions` Table
| Column | Type | Description |
| :--- | :--- | :--- |
| `session_id` | uuid | Primary Key |
| `profile_id` | uuid | Foreign Key to `profiles` |
| `roleplay_id` | uuid | Foreign Key to `roleplays` |
| `conversation_json` | jsonb | Array of message objects `{role, content}` |
| `feedback` | text | AI feedback data (stored as text/JSON) |
| `highlights` | ARRAY | User-selected highlights for flashcards |
| `created_at` | timestamp with time zone | Session creation time |

### `feedbacks` Table
(Shared with Journal feature - see [journal.md](journal.md#feedbacks-table) for full schema)

### `feedback_grammar_items` Table
(Shared with Journal feature - see [journal.md](journal.md#feedback_grammar_items-table) for full schema)

## Integration

### Webhook Flow
1.  **Message Exchange**:
    -   Endpoint: `GET_ROLEPLAY_RESPONSE_WEBHOOK_URL`
    -   Payload: Current message + conversation history + scenario context.
    -   Response: AI's next reply.

2.  **Feedback Generation**:
    -   Endpoint: `GET_ROLEPLAY_ASSESMENT_WEBHOOK_URL`
    -   Payload: Full conversation history.
    -   Response: Structured feedback (Clarity, Vocab, Ideas, Grammar).
