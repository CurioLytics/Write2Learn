# Write2Learn Webhook Documentation

This document describes all webhook integrations used by the application, including request/response structures, API routes, and testing information.

**Note:** All webhooks are proxied through server-side routes under `app/api/**` to handle CORS, validation, and timeouts.

---

## 1. Journal Feedback Webhook

**Purpose:** Sends journal content for grammar correction and enhancement.

- **External Endpoint:** `NEXT_PUBLIC_GET_FEEDBACK_WEBHOOK_URL`
- **Local Route:** `app/api/journal-feedback/route.ts`
- **HTTP Method:** POST
- **Timeout:** 60s, Retries: 1

### Request Data Structure
```typescript
{
  title?: string;           // Optional journal title
  content: string;          // Required journal content  
  level?: string | null;    // column: level in table profiles
}
```

### Expected Response
```typescript


{
  title: string;
  summary: string;
  improvedVersion: string;
  originalVersion: string;
  fb_details: string;

  
}
```


---

## 2. Roleplay Conversation Webhook

**Purpose:** Handles AI roleplay conversations with scenario context.

- **External Endpoint:** `GET_ROLEPLAY_WEBHOOK_URL` (default: `https://auto2.elyandas.com/webhook/roleplay`)
- **Local Route:** `app/api/roleplay/webhook/route.ts`
- **HTTP Method:** POST
- **Timeout:** 30s

### Request Data Structure
```typescript
{
  body: {
    query: {
      title: string;           // Scenario name
      level: string;           // Difficulty level
      ai_role: string;         // AI character role
      partner_prompt: string | null;
    }
  };
  messages: Array<{
    role: string;              // "user" or AI role name
    content: string;           // Message content
  }>;
}
```

### Expected Response
```typescript
// Normalized to:
{
  message: string | object;
}

// Accepted formats:
{ output: string }     // → { message: output }
{ message: string }    // → returned as-is
"plain text"          // → { message: "plain text" }
```

---

## 3. Roleplay Finish Webhook

**Purpose:** Sends complete conversation for summary/feedback generation.

- **External Endpoint:** `https://n8n.elyandas.com/webhook/finish-roleplay`
- **Local Route:** `app/api/roleplay/finish/route.ts`
- **HTTP Method:** POST

### Request Data Structure
```typescript
{
  messages: Array<{
    id?: string;              // Message ID
    content: string;          // Message content
    sender: "user" | "bot";   // Message sender
    timestamp: number;        // Unix timestamp
  }>;
}
```

### Expected Response
```typescript
string  // Plain text feedback
```

---

## 4. Exercise Generation Webhook

**Purpose:** Generates practice exercises from grammar errors.

- **External Endpoint:** `https://auto2.elyandas.com/webhook/gen-exercise`
- **Local Route:** `app/api/exercises/generate/route.ts`
- **HTTP Method:** POST
- **Content-Type:** text/plain

### Request Data Structure
```
Plain text: concatenated error descriptions
Example: "Grammar error detected Subject-verb agreement error ..."
```

### Expected Response
```typescript
// Normalized to:
{
  questions: string[];
}

// Accepted formats:
[{ questions: string[] }]
[{ question: string[] }]
[{ output: { questions: string[] } }]
{ questions: string[] }
{ output: { questions: string[] } }
```

---

## 5. Exercise Check Webhook

**Purpose:** Validates student answers for grammar exercises.

- **External Endpoint:** `https://auto2.elyandas.com/webhook/exercise-check`
- **Local Route:** `app/api/exercises/check/route.ts`
- **HTTP Method:** POST
- **Content-Type:** text/plain

### Request Data Structure
```
Plain text: "Question: <q1> Answer: <a1> Question: <q2> Answer: <a2> ..."
```

### Expected Response
```typescript
// Normalized to:
{
  corrections: string[];
}

// Accepted formats:
[{ output: { correction: string[] } }]
{ output: { correction: string[] } }
string[]  // Array of corrections
{ corrections: string[] }  // Legacy format
```

---

## 6. Exercise Grading Webhook

**Purpose:** Provides detailed feedback on student exercise answers.

- **External Endpoint:** `https://auto2.elyandas.com/webhook/grade-exercise`
- **Local Route:** `app/api/exercises/grade/route.ts`
- **HTTP Method:** POST
- **Content-Type:** text/plain

### Request Data Structure
```
Plain text format:
"Question: <question1>
User Answer: <answer1>

Question: <question2>
User Answer: <answer2>"
```

### Expected Response
```typescript
// JSON response returned as-is
// Text response normalized to:
{
  feedback: string;
}
```

---

## 7. Flashcard Generation Webhook

**Purpose:** Generates flashcards from highlighted text in journal content.

- **External Endpoint:** `NEXT_PUBLIC_SAVE_HIGHLIGHTS_WEBHOOK_URL`
- **Local Route:** `app/api/flashcards/generate/route.ts`
- **HTTP Method:** POST
- **Timeout:** 60s

### Request Data Structure
```typescript
{
  highlights: string[];        // Array of highlighted text
  content: string;            // Full journal content for context
  title?: string;             // Journal title
  level?: string | null;      // User's English level from profiles table
  userId: string;             // User ID for tracking
}
```

### Expected Response
```typescript
// Normalized to:
{
  flashcards: Array<{
    word: string;
    back: {
      definition: string;
      example: string;
    };
  }>;
}

// Accepted formats:
Array<Flashcard>                    // → { flashcards: array }
{ flashcards: Array<Flashcard> }    // → returned as-is
{ output: Array<Flashcard> }        // → { flashcards: output }
{ data: Array<Flashcard> }          // → { flashcards: data }
```

---

## 8. Profile Update Webhook

**Purpose:** Syncs user profile data for flashcard generation (fire-and-forget).

- **External Endpoint:** `NEXT_PUBLIC_UPDATE_FLASHCARDS_WEBHOOK_URL`
- **Triggered by:** `services/profile-service.ts` after profile save
- **HTTP Method:** POST
- **Retries:** 1, Cache TTL: 60s

### Request Data Structure
```typescript
{
  userId: string;
  email: string;
  name?: string;
  englishLevel?: string;
  goals?: string[];
  writingTypes?: string[];
  onboardingCompleted: boolean;
  timestamp: string;          // ISO date-time
  requestId: string;          // userId-timestamp
}
```

### Headers
```
Content-Type: application/json
X-Idempotency-Key: <userId>-<timestamp>
```

### Expected Response
Any 2xx status code indicates success.

---

## Development Guidelines

### API Route Pattern
All routes follow this structure:
```typescript
export async function POST(request: Request) {
  try {
    const user = await authenticateUser();
    const { field } = await parseRequestBody<Type>(request);
    const result = await service.method(user.id, data);
    return createSuccessResponse(result, 'Success message');
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Best Practices
- Always validate inputs before proxying
- Normalize webhook responses to canonical shapes
- Use request IDs and idempotency keys
- Implement proper timeouts (30-60s)
- Provide UI fallbacks for failures
- Log requests/responses for debugging

### Environment Variables
```
NEXT_PUBLIC_GET_FEEDBACK_WEBHOOK_URL      # Journal feedback
GET_ROLEPLAY_WEBHOOK_URL                  # Roleplay conversations
NEXT_PUBLIC_SAVE_HIGHLIGHTS_WEBHOOK_URL   # Flashcard generation
NEXT_PUBLIC_UPDATE_FLASHCARDS_WEBHOOK_URL # Profile updates
```