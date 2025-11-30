# Reporting Feature

## Overview
The Reporting feature provides users with insights into their learning progress. It visualizes data from journaling, roleplay, and vocabulary reviews to show trends, strengths, and areas for improvement.

## Key Components

### 1. Activity Charts
-   **Weekly Activity**: A bar chart showing the number of "learning events" (journal entries, roleplay sessions, reviews) per day over the last week.
-   **Data Source**: Aggregated from `journals`, `sessions`, and `reviews` tables based on `created_at` or `review_time`.

### 2. Grammar Error Analysis
-   **Purpose**: To identify recurring grammar mistakes.
-   **Mechanism**:
    -   When AI provides feedback on journals or roleplays, it tags specific grammar errors (e.g., "Subject-Verb Agreement").
    -   These errors are stored in `feedback_grammar_items` (linked to `feedback_logs`).
    -   The report aggregates these items to show the most frequent error types.

### 3. Streak Tracking
-   **Definition**: A "streak" is the number of consecutive days the user has completed at least one learning activity.
-   **Calculation**:
    -   Checked daily via `analytics-service.ts`.
    -   Stored in the `profiles` table (`streak_count`, `last_activity_date`).

## Data Model

### `learning_events` Table
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid | Primary Key |
| `profile_id` | uuid | Foreign Key to `profiles` |
| `event_type` | USER-DEFINED | Type of event (journal, roleplay, review) |
| `reference_id` | uuid | ID of the related entity |
| `metadata` | jsonb | Additional event data |
| `created_at` | timestamp with time zone | Event timestamp |

### `learning_progress` Table
| Column | Type | Description |
| :--- | :--- | :--- |
| `profile_id` | uuid | Foreign Key to `profiles` (Primary Key) |
| `total_words_learned` | integer | Total vocabulary items learned |
| `total_journals_completed` | integer | Total journal entries |
| `streak_days` | integer | Current streak count |
| `last_update` | timestamp with time zone | Last progress update |

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
| `created_at` | timestamp with time zone | Log time |

### `feedback_grammar_items` Table
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid | Primary Key |
| `feedback_id` | uuid | Foreign Key to `feedbacks` |
| `grammar_topic_id` | text | Error category (e.g., 'past_tense_usage') |
| `description` | text | Error description |
| `tags` | ARRAY | Associated tags |
| `created_at` | timestamp with time zone | Creation time |

### `profiles` Table (Relevant Fields)
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid | Primary Key |
| `daily_review_goal` | integer | Daily vocabulary review goal |
| `daily_roleplay_goal` | smallint | Daily roleplay sessions goal |
| `daily_journal_goal` | smallint | Daily journal entries goal |
| `daily_vocab_goal` | smallint | Daily vocabulary goal |

## Analytics Service
The `AnalyticsService` (`services/analytics-service.ts`) is responsible for:
1.  Fetching raw data from Supabase.
2.  Aggregating data for charts (e.g., grouping by date).
3.  Calculating streaks and goal progress.
