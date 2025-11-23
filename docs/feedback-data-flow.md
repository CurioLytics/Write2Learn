# Feedback Data Flow - Database Storage

## Table Structure

### 1. `feedbacks` Table (Main Feedback Record)
```
feedbacks
├── id (UUID, PK)
├── profile_id (UUID, FK -> profiles)
├── source_id (UUID, references journals.id or sessions.session_id)
├── source_type (ENUM: 'journal' | 'roleplay')
├── clarity_feedback (TEXT)
├── vocabulary_feedback (TEXT)
├── ideas_feedback (TEXT)
├── enhanced_version (TEXT)
└── created_at (TIMESTAMP)
```

### 2. `feedback_grammar_items` Table (Grammar Corrections)
```
feedback_grammar_items
├── id (UUID, PK)
├── feedback_id (UUID, FK -> feedbacks.id)
├── grammar_topic_id (TEXT, FK -> grammar_topics.topic_id)
├── description (TEXT) - The correction explanation
├── tags (TEXT[]) - Array of tags like ['past_simple', 'verb_tenses']
└── created_at (TIMESTAMP)
```

## Data Flow on Save

### When User Clicks "Lưu" or "Lưu & Tạo Flashcard"

```
1. Create/Update Journal
   └─> journals table
       ├── title
       ├── content (enhanced version)
       └── enhanced_version

2. Create Feedback Record
   └─> feedbacks table
       ├── profile_id = userId
       ├── source_id = journalId
       ├── source_type = 'journal'
       ├── clarity_feedback = feedback.output.clarity
       ├── vocabulary_feedback = feedback.output.vocabulary
       ├── ideas_feedback = feedback.output.ideas
       └── enhanced_version = enhancedContent

3. Create Grammar Items (for each grammar_detail)
   └─> feedback_grammar_items table
       ├── feedback_id = (from step 2)
       ├── grammar_topic_id = detail.grammar_topic_id
       ├── description = detail.description
       └── tags = detail.tags

4. Generate Flashcards (if highlights exist)
   └─> vocabulary table & vocabulary_status table
```

## Example Webhook Response Structure

```json
{
  "fixed_typo": "corrected content",
  "enhanced_version": "improved content",
  "title": "My Journal Title",
  "summary": "Brief summary",
  "grammar_details": [
    {
      "grammar_topic_id": "verb_tenses",
      "tags": ["past_simple"],
      "description": "'he adjusted' → 'he had adjusted': Use past perfect for earlier action"
    }
  ],
  "output": {
    "clarity": "Your writing is clear and well-structured...",
    "vocabulary": "Consider using more varied vocabulary...",
    "ideas": "Great ideas! You could expand on..."
  }
}
```

## Database Relationships

```
profiles (1) ──< (many) feedbacks
                    │
                    └──< (many) feedback_grammar_items ──> (1) grammar_topics

journals (1) ──< (1) feedbacks (via source_id where source_type='journal')
sessions (1) ──< (1) feedbacks (via source_id where source_type='roleplay')
```

## Service Method: `saveFeedback()`

**Input:**
```typescript
{
  userId: string,
  sourceId: string, // journal_id or session_id
  sourceType: 'journal' | 'roleplay',
  feedbackData: {
    clarity?: string,
    vocabulary?: string,
    ideas?: string,
    enhanced_version?: string
  },
  grammarDetails?: GrammarDetail[]
}
```

**Process:**
1. Insert into `feedbacks` table → Get `feedback_id`
2. For each grammar detail, insert into `feedback_grammar_items` with `feedback_id`

**Output:** `feedback_id` (string)

## Benefits of This Structure

1. ✅ **Normalized Data**: Feedback separated from grammar corrections
2. ✅ **Flexible**: Works for both journals and roleplay sessions
3. ✅ **Queryable**: Easy to query all grammar issues by topic or tag
4. ✅ **Relational**: Maintains proper foreign key relationships
5. ✅ **Scalable**: Can add more feedback types without changing structure
