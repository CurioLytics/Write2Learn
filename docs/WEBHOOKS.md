# Webhook Architecture

Write2Learn integrates with external AI services through a webhook-based architecture. All webhooks are hosted at `https://auto2.elyandas.com/webhook/` and provide AI-powered features for content generation, feedback, and assessment.

## Overview

The app uses **6 distinct webhooks** organized into two integration patterns:

1. **Server-side Proxy Pattern**: API routes that proxy webhook calls to avoid CORS and protect credentials
2. **Direct Client Calls**: Public webhooks called directly from client components (with NEXT_PUBLIC_ prefix)

## Webhook Endpoints

### 1. Journal Feedback (`journal-feedback-v1`)
**Purpose**: Generate comprehensive writing feedback for journal entries including grammar corrections, vocabulary suggestions, and enhanced versions.

**Environment Variable**: `NEXT_PUBLIC_GET_FEEDBACK_WEBHOOK_URL`

**Integration**: Client-side direct call from `/app/journal/new` and `/app/journal/[id]` pages via `/app/api/journal-feedback/route.ts` with retry logic.

**Request Format**:
```json
{
  "user": {
    "name": "User Name",
    "english_level": "B1|B2|C1|C2",
    "style": "Formal|Conversational|Academic"
  },
  "journal_content": "The journal text to analyze...",
  "title": "Journal Title"
}
```

**Response Format**:
```json
{
  "enhanced_version": "Improved version of the text",
  "grammar_details": [
    {
      "line": "Original sentence",
      "mistake": "Specific error description",
      "correction": "Corrected sentence",
      "type": "Grammar|Spelling|Punctuation|Style"
    }
  ],
  "output": {
    "clarity": {
      "score": 85,
      "feedback": "Detailed clarity assessment..."
    },
    "vocabulary": {
      "score": 78,
      "feedback": "Vocabulary usage analysis..."
    },
    "ideas": {
      "score": 90,
      "feedback": "Content ideas evaluation..."
    }
  },
  "summary": "Overall feedback summary",
  "title": "Suggested title",
  "fixed_typo": "Text with typos corrected"
}
```

**Key Features**:
- 60-second timeout with 3 automatic retries
- Response normalization handles multiple webhook formats
- User preferences (level, style) included for personalized feedback
- Grammar details saved to separate `feedback_grammar_items` table

**Database Integration**:
- Main feedback stored in `feedbacks` table
- Grammar details normalized to `feedback_grammar_items` with foreign key
- Links to `journals` table via `journal_id`

---

### 2. Roleplay Response (`roleplay-v1`)
**Purpose**: Generate AI bot responses for conversational roleplay scenarios based on user messages and scenario context.

**Environment Variable**: `GET_ROLEPLAY_RESPONSE_WEBHOOK_URL`

**Integration**: Server-side proxy at `/app/api/roleplay/webhook/route.ts` called by `services/roleplay-webhook-service.ts`

**Request Format**:
```typescript
// Query parameters in URL-encoded format
{
  scenario_content: "The roleplay scenario description",
  scenario_title: "Scenario Title",
  conversation_history: JSON.stringify([
    { role: "user|bot", content: "message text" }
  ]),
  user_message: "Latest user message",
  user_level: "B1|B2|C1|C2",
  user_style: "Formal|Conversational|Academic"
}
```

**Response Format**:
```json
{
  "bot_response": "The AI-generated reply text"
}
```

**Key Features**:
- CORS-free proxy pattern protects webhook URL from client exposure
- Conversation history maintained for context-aware responses
- User preferences dynamically injected from `profiles` table
- Structured query parameter encoding for complex data

---

### 3. Roleplay Assessment (`roleplay-assesment`)
**Purpose**: Evaluate roleplay conversation performance with scores and detailed feedback.

**Environment Variable**: `GET_ROLEPLAY_ASSESMENT_WEBHOOK_URL`

**Integration**: Server-side proxy at `/app/api/roleplay/feedback/route.ts`

**Request Format**:
```json
{
  "conversation_history": [
    { "role": "user|bot", "content": "message" }
  ],
  "scenario": "Scenario description",
  "user_level": "B1|B2|C1|C2"
}
```

**Response Format**:
```json
{
  "score": 85,
  "feedback": "Detailed performance assessment...",
  "strengths": ["Good vocabulary", "Natural flow"],
  "improvements": ["More complex sentences", "Use idioms"]
}
```

---

### 4. Exercise Check/Grading (`exercise-check`)
**Purpose**: Grade user exercise answers with corrections and explanations. Used by both legacy single-exercise and new multi-topic exercise flows.

**Environment Variable**: `GET_EXERCISE_CHECK_WEBHOOK_URL`

**Integration**: 
- Legacy: `/app/api/exercises/check/route.ts`
- New: `/app/api/exercises/grade-v2/route.ts` (multi-topic batch grading)

**Request Format (Legacy)**:
```json
{
  "user": {
    "name": "User Name",
    "english_level": "B1",
    "style": "Conversational"
  },
  "exercises": [
    { "question": "Fill in: I ___ to school", "answer": "go" }
  ]
}
```

**Request Format (V2 - Multi-topic)**:
```json
{
  "topics": [
    {
      "topic_name": "Present Simple",
      "quizzes": ["Q1 text", "Q2 text"],
      "user_answers": ["answer1", "answer2"]
    }
  ]
}
```

**Response Format (Legacy)**:
```json
{
  "corrections": [
    "Correct! Well done.",
    "Wrong: The correct answer is 'goes' (third person singular)"
  ]
}
```

**Response Format (V2)**:
```json
{
  "Present Simple": [
    { "correct": true, "correct_answer": "go" },
    { "correct": false, "correct_answer": "goes" }
  ]
}
```

**Key Features**:
- Handles multiple response formats from webhook evolution
- V2 supports batch grading with topic grouping
- Response normalization extracts corrections from nested structures

---

### 5. Exercise Generation (`gen-exercise`)
**Purpose**: Generate grammar exercises based on user errors and selected topics.

**Environment Variable**: `GET_GEN_EXERCISE_WEBHOOK_URL`

**Integration**: Server-side at `/app/api/exercises/generate/route.ts`

**Request Format**:
```json
{
  "user_level": "B1|B2|C1|C2",
  "english_tone": "Formal|Conversational|Academic",
  "topics": {
    "Present Simple": 5,
    "Past Tense": 3,
    "Articles": 4
  }
}
```

**Response Format**:
```json
{
  "output": [
    {
      "topic_name": "Present Simple",
      "exercise_type": "fill-in-the-blank|multiple-choice|sentence-transformation",
      "quizzes": [
        { "question": "I ___ to school every day", "options": ["go", "goes", "going"] }
      ]
    }
  ]
}
```

**Key Features**:
- Generates exercises from grammar error analysis
- Topics object maps grammar concepts to desired question counts
- Supports multiple exercise types per topic
- Response includes structured quiz data ready for UI rendering

---

### 6. Flashcard Generation from Highlights (`save-process-highlight-v1`)
**Purpose**: Process text highlights to generate vocabulary flashcards with definitions, examples, and translations.

**Environment Variable**: `NEXT_PUBLIC_SAVE_HIGHLIGHTS_WEBHOOK_URL`

**Integration**: Client-side call from `/app/api/flashcards/generate/route.ts`

**Request Format**:
```json
{
  "user_id": "uuid",
  "highlights": [
    { "text": "ephemeral", "context": "The moment was ephemeral" }
  ],
  "source_type": "journal|vocab|custom",
  "user_level": "B1"
}
```

**Response Format**:
```json
{
  "flashcards": [
    {
      "word": "ephemeral",
      "definition": "Lasting for a very short time",
      "example": "Fame is often ephemeral",
      "translation": "短暂的",
      "difficulty": "C1"
    }
  ]
}
```

## Common Patterns

### 1. User Preferences Injection
All webhooks receive user profile data from `profiles` table:
```typescript
const userPreferences = await getUserPreferences(user.id);
// Injected: name, english_level, style
```

### 2. Authentication
Server-side routes use `authenticateUser()` from `utils/api-helpers.ts`:
```typescript
const user = await authenticateUser();
// Validates session, returns user object or throws error
```

### 3. Response Normalization
Webhooks return varying formats (arrays vs objects, nested structures). API routes normalize:
```typescript
// Handle [{ output: {...} }] or { output: {...} }
const responseData = Array.isArray(webhookResponse) 
  ? webhookResponse[0] 
  : webhookResponse;
const outputData = responseData?.output || responseData;
```

### 4. Error Handling
All routes follow consistent pattern:
```typescript
try {
  // Webhook call
} catch (error) {
  console.error('Error calling webhook:', error);
  return NextResponse.json(
    { error: error instanceof Error ? error.message : 'Generic error message' },
    { status: 500 }
  );
}
```

### 5. Retry Logic (Journal Feedback)
Critical feedback endpoint has retry mechanism:
```typescript
const FEEDBACK_CONFIG = {
  MAX_RETRIES: 3,
  TIMEOUT: 60000, // 60 seconds
  RETRY_DELAY: 2000
};
```

## Environment Setup

Add webhook URLs to `.env.local`:

```bash
# Server-side only (protected from client)
GET_ROLEPLAY_RESPONSE_WEBHOOK_URL=https://auto2.elyandas.com/webhook/roleplay-v1
GET_EXERCISE_CHECK_WEBHOOK_URL=https://auto2.elyandas.com/webhook/exercise-check
GET_ROLEPLAY_ASSESMENT_WEBHOOK_URL=https://auto2.elyandas.com/webhook/roleplay-assesment
GET_GEN_EXERCISE_WEBHOOK_URL=https://auto2.elyandas.com/webhook/gen-exercise

# Client-accessible (NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_SAVE_HIGHLIGHTS_WEBHOOK_URL=https://auto2.elyandas.com/webhook/save-process-highlight-v1
NEXT_PUBLIC_GET_FEEDBACK_WEBHOOK_URL=https://auto2.elyandas.com/webhook/journal-feedback-v1
```

**Security Note**: Server-side webhooks are proxied through API routes to:
- Hide webhook URLs from client-side code
- Prevent CORS issues
- Protect sensitive endpoints
- Inject user authentication/preferences server-side

## Debugging Webhooks

1. **Check Environment Variables**: Ensure all webhook URLs are configured in `.env.local`

2. **Enable Verbose Logging**: All API routes log request/response payloads:
```typescript
console.log('Webhook payload:', JSON.stringify(payload, null, 2));
console.log('Webhook response:', responseText);
```

3. **Test with cURL**:
```bash
curl -X POST https://auto2.elyandas.com/webhook/journal-feedback-v1 \
  -H "Content-Type: application/json" \
  -d '{"user": {"name": "Test", "english_level": "B1", "style": "Conversational"}, "journal_content": "Test content", "title": "Test"}'
```

4. **Monitor Supabase Data**: Check `feedbacks`, `feedback_grammar_items`, and related tables for saved webhook responses

## Adding New Webhooks

1. Add environment variable to `.env.local`
2. Create API route in `app/api/{feature}/route.ts`
3. Implement service in `services/{feature}-service.ts`
4. Add TypeScript types in `types/{feature}.ts`
5. Update this documentation with endpoint details
