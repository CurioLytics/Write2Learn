# Vocabulary Feature

## Overview
The Vocabulary feature helps users retain new words and phrases using a Spaced Repetition System (SRS). It integrates tightly with Journaling and Roleplay, allowing users to turn their own content and corrections into learning materials.

## Key Components

### 1. Flashcard Generation
-   **Source**: Users can select text (highlights) from:
    -   Journal AI Feedback (Enhanced Version).
    -   Roleplay Session Summaries.
-   **Process**:
    1.  User highlights text and clicks "Save to Flashcards".
    2.  The `flashcardGenerationService` calls the `NEXT_PUBLIC_SAVE_HIGHLIGHTS_WEBHOOK_URL`.
    3.  The AI generates a "Front" (the word/phrase) and a "Back" (definition, context, example) for each highlight.
    4.  Cards are saved to the `flashcards` table.

### 2. Review Interface (SRS)
-   **Algorithm**: The project uses the **FSRS (Free Spaced Repetition Scheduler)** algorithm via the `ts-fsrs` library.
-   **Workflow**:
    1.  The system calculates which cards are "due" for review based on their stability and last review time.
    2.  User reviews a card and rates their recall: **Again**, **Hard**, **Good**, or **Easy**.
    3.  The algorithm schedules the next review date (`due_date`).

### 3. Vocabulary Sets
-   **Organization**: Flashcards are grouped into "Sets" (e.g., "Journal Entry 1", "Coffee Shop Roleplay").
-   **Management**: Users can create custom sets or have them automatically created from their activities.

## Data Model

### `vocabulary` Table
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid | Primary Key |
| `set_id` | uuid | Foreign Key to `vocabulary_set` |
| `word` | text | The word or phrase to learn |
| `meaning` | text | Definition |
| `example` | text | Example sentence |
| `source_id` | uuid | Reference to source (journal/session) |
| `created_at` | timestamp with time zone | Creation time |
| `updated_at` | timestamp with time zone | Last update time |
| `is_starred` | boolean | Whether the card is starred |

### `vocabulary_set` Table
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid | Primary Key |
| `profile_id` | uuid | Foreign Key to `profiles` |
| `title` | text | Set name |
| `description` | text | Set description |
| `is_default` | boolean | Whether it's a default set |
| `is_starred` | boolean | Whether the set is starred |
| `created_at` | timestamp with time zone | Creation time |
| `updated_at` | timestamp with time zone | Last update time |

### `vocabulary_status` Table
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid | Primary Key |
| `vocabulary_id` | uuid | Foreign Key to `vocabulary` |
| `interval` | integer | Current review interval (days) |
| `repetitions` | integer | Total number of reviews |
| `ease_factor` | double precision | FSRS ease factor |
| `next_review_at` | timestamp with time zone | Next review date |
| `last_review_at` | timestamp with time zone | Last review date |
| `stability` | double precision | FSRS stability parameter |
| `difficulty` | double precision | FSRS difficulty parameter |
| `elapsed_days` | integer | Days since last review |
| `scheduled_days` | integer | Scheduled interval |
| `learning_steps` | integer | Current learning step |
| `lapses` | integer | Number of times forgotten |
| `state` | text | FSRS state (New, Learning, Review, Relearning) |
| `updated_at` | timestamp with time zone | Last update time |

### `fsrs_review_logs` Table
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid | Primary Key |
| `card_id` | uuid | Foreign Key to `vocabulary` |
| `rating` | text | User rating (Again, Hard, Good, Easy) |
| `state` | text | Card state at time of review |
| `review_date` | timestamp with time zone | When the review happened |
| `elapsed_days` | integer | Days since last review |
| `scheduled_days` | integer | Days until next review |
| `stability_before` | double precision | Stability before this review |
| `difficulty_before` | double precision | Difficulty before this review |
| `created_at` | timestamp with time zone | Log creation time |

## Algorithm Details
The application uses `ts-fsrs` to handle the scheduling math.
-   **New Cards**: Start in the "Learning" phase with short intervals.
-   **Review Cards**: Intervals increase exponentially as the user rates them "Good" or "Easy".
-   **Lapses**: If a user forgets a card ("Again"), it enters "Relearning" with shorter intervals.
