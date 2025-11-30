# Write2Learn Architecture Overview

This document provides a high-level overview of the Write2Learn codebase structure and architecture.

## 1. Project Overview

Write2Learn is an AI-powered English learning platform focused on active output through Journaling, Vocabulary Building, and Roleplay.

## 2. Tech Stack

-   **Framework**: Next.js 15 (App Router)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS v4, Radix UI (Primitives)
-   **Database & Auth**: Supabase (PostgreSQL)
-   **State Management**: Zustand
-   **Rich Text Editor**: Tiptap
-   **Spaced Repetition**: ts-fsrs

## 3. Directory Structure

The project follows a standard Next.js App Router structure, organized by feature.

```
/
├── app/                  # App Router: Pages, Layouts, and API Routes
├── components/           # React Components
│   ├── ui/               # Reusable UI primitives (Buttons, Inputs, etc.)
│   ├── features/         # Feature-specific components
│   └── [feature]/        # Components specific to a feature (e.g., journal, roleplay)
├── services/             # Business Logic and API interactions
├── lib/                  # Core libraries and configurations
├── hooks/                # Custom React Hooks
├── utils/                # Helper functions
├── types/                # TypeScript definitions
├── public/               # Static assets
└── docs/                 # Project documentation
```

## 4. Key Modules

### 4.1. App Directory (`app/`)

Handles routing and page rendering. Organized by feature:

### 4.1. App Directory (`app/`)

Handles routing and page rendering. Organized by feature:

-   **`account/`**: User account settings and management.
-   **`api/`**: Backend API routes. Acts as a proxy to external webhooks and handles database operations.
    -   `analytics/`: User progress data.
    -   `auth/`: Authentication helpers.
    -   `exercises/`: Generation and grading of grammar exercises.
    -   `flashcards/` & `review_flashcard/`: Flashcard creation and SRS review logging.
    -   `journal-entry/` & `journal-feedback/`: Journal CRUD and AI feedback generation.
    -   `roleplay/`: Webhook proxies for AI roleplay.
    -   `vocab/`: Vocabulary management.
-   **`auth/`**: Authentication pages (Login, Register, Password Reset).
-   **`feedback/`**: User feedback form (for the application itself).
-   **`flashcards/`**: Flashcard generation UI.
-   **`home/`**: Main user dashboard (`DashboardPage`), displaying daily goals and quick access cards.
-   **`journal/`**: Journaling feature.
    -   `[id]/`: View or edit a specific journal entry.
    -   `new/`: Create a new journal entry.
    -   `templates/`: Manage journal templates.
-   **`onboarding/`**: Initial user onboarding flow.
-   **`profile/`**: User profile view and edit page.
-   **`report/`**: Analytics dashboard showing learning trends, streaks, and grammar error analysis.
-   **`roleplay/`**: AI Roleplay feature.
    -   `[id]/`: Scenario details and setup.
    -   `session/`: Active chat interface.
    -   `summary/`: Post-session feedback and review.
-   **`vocab/`**: Vocabulary management and practice.
    -   `[setId]/`: View details of a specific vocabulary set.
    -   `create/`: Interface to create new vocabulary sets.

### 4.2. Services (`services/`)

Contains the core business logic and handles data fetching. Components should call services, not APIs directly where possible.

-   `auth-service.ts`: User authentication management.
-   `journal-service.ts`: CRUD operations for journals.
-   `roleplay/`: Logic for roleplay sessions and feedback.
-   `exercise-service-new.ts`: Logic for generating and grading exercises.
-   `analytics-service.ts`: Aggregating user progress data.

### 4.3. Components (`components/`)

-   `ui/`: Low-level, reusable components (mostly based on Radix UI).
-   `features/`: Components that implement specific business logic.
-   `layout/`: Common layout components (Header, Sidebar).

### 4.4. Lib (`lib/`)

-   `fsrs/`: Implementation of the Free Spaced Repetition Scheduler.
-   `database/`: Supabase client configuration.

### 4.5. Utils (`utils/`)

Stateless helper functions for date formatting (`date-utils.ts`), markdown processing (`markdown-utils.ts`), API helpers (`api-helpers.ts`), etc.

## 5. Data Flow

1.  **UI Components** trigger actions (e.g., "Save Journal").
2.  **Services** are called to handle the business logic.
3.  **Services** interact with:
    -   **Supabase** for database operations.
    -   **Internal API Routes** (`app/api/`) for server-side operations or webhook proxies.
4.  **State** is updated (local state or Zustand stores) to reflect changes in the UI.

## 6. Authentication

Authentication is handled by Supabase Auth.
-   `middleware.ts`: Protects routes and manages sessions.
-   `hooks/auth/`: Custom hooks to access user session and profile.

## 7. Database

The project uses Supabase (PostgreSQL). Key tables include:
-   `profiles`: User data.
-   `journals`: User journal entries.
-   `roleplays`: Roleplay scenarios.
-   `sessions`: User roleplay sessions.
-   `flashcards`: Vocabulary items.
-   `reviews`: SRS review logs.
