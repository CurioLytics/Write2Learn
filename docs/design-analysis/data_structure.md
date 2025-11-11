# 📘 Database Schema Overview

Dưới đây là danh sách các bảng cùng với các cột tương ứng trong cơ sở dữ liệu (cập nhật từ Supabase thực tế).

---

## 🧩 chatbot_sessions
| Column Name | Data Type | Default Value | Constraints |
|--------------|------------|---------------|-------------|
| id | uuid | gen_random_uuid() | Primary Key |
| profile_id | uuid | - | Foreign Key → profiles.id |
| interaction_logs | jsonb | - | nullable |
| created_at | timestamp with time zone | now() | nullable |
| completed_at | timestamp with time zone | - | nullable |

---

## 🧩 feedback_logs
| Column Name | Data Type | Default Value | Constraints |
|--------------|------------|---------------|-------------|
| id | uuid | gen_random_uuid() | Primary Key |
| profile_id | uuid | - | Foreign Key → profiles.id |
| type | text | - | nullable, CHECK: 'grammar' OR 'vocab' |
| grammar_id | text | 'passive_voices' | nullable, Foreign Key → grammar_topics.topic_id |
| vocab_id | text | - | nullable, Foreign Key → vocab_topics.topic_id |
| details | jsonb | - | nullable |
| detected_at | timestamp with time zone | now() | nullable |

---

## 🧩 flashcard
| Column Name | Data Type | Default Value | Constraints |
|--------------|------------|---------------|-------------|
| id | uuid | gen_random_uuid() | Primary Key |
| set_id | uuid | - | Foreign Key → flashcard_set.id |
| word | text | - | - |
| meaning | text | - | - |
| created_at | timestamp with time zone | now() | nullable |
| example | text | - | nullable |
| context_sentence | text | - | nullable |
| journal_entry_id | uuid | - | nullable |
| source | text | 'manual' | nullable, CHECK: 'manual' OR 'journal' |
| updated_at | timestamp with time zone | now() | nullable |

---

## 🧩 flashcard_set
| Column Name | Data Type | Default Value | Constraints |
|--------------|------------|---------------|-------------|
| id | uuid | gen_random_uuid() | Primary Key |
| title | text | - | - |
| created_at | timestamp with time zone | now() | nullable |
| profile_id | uuid | - | nullable, Foreign Key → profiles.id |
| description | text | - | nullable |
| source_type | text | 'manual' | nullable, CHECK: 'manual' OR 'journal' |
| updated_at | timestamp with time zone | now() | nullable |

---

## 🧩 flashcard_status
| Column Name | Data Type | Default Value | Constraints |
|--------------|------------|---------------|-------------|
| id | uuid | gen_random_uuid() | Primary Key |
| flashcard_id | uuid | - | Foreign Key → flashcard.id |
| interval | integer | 1 | - |
| repetitions | integer | 0 | - |
| ease_factor | double precision | 2.5 | - |
| next_review_at | timestamp with time zone | now() | nullable |
| last_review_at | timestamp with time zone | now() | nullable |
| stability | double precision | 0 | nullable |
| difficulty | double precision | 0 | nullable |
| elapsed_days | integer | 0 | nullable |
| scheduled_days | integer | 0 | nullable |
| learning_steps | integer | 0 | nullable |
| lapses | integer | 0 | nullable |
| state | text | 'new' | nullable, CHECK: 'new', 'learning', 'review', 'relearning' |
| updated_at | timestamp with time zone | now() | nullable |

---

## 🧩 fsrs_review_logs
| Column Name | Data Type | Default Value | Constraints |
|--------------|------------|---------------|-------------|
| id | uuid | gen_random_uuid() | Primary Key |
| card_id | uuid | - | nullable, Foreign Key → flashcard_status.id |
| rating | text | - | nullable, CHECK: 'again', 'hard', 'good', 'easy' |
| state | text | - | nullable, CHECK: 'new', 'learning', 'review', 'relearning' |
| review_date | timestamp with time zone | now() | nullable |
| elapsed_days | integer | - | nullable |
| scheduled_days | integer | - | nullable |
| stability_before | double precision | - | nullable |
| difficulty_before | double precision | - | nullable |
| created_at | timestamp with time zone | now() | nullable |

---

## 🧩 grammar_topics
| Column Name | Data Type | Default Value | Constraints |
|--------------|------------|---------------|-------------|
| id | uuid | gen_random_uuid() | Primary Key |
| topic_name | text | - | - |
| parent_topic_id | uuid | - | nullable |
| level | text | - | nullable |
| description | text | - | nullable |
| topic_id | text | - | nullable, unique |

---

## 🧩 journal_template
| Column Name | Data Type | Default Value | Constraints |
|--------------|------------|---------------|-------------|
| id | uuid | gen_random_uuid() | Primary Key |
| name | text | - | - |
| other | text | - | nullable |
| content | text | - | nullable |
| tag | ARRAY | - | nullable |
| category | text | - | nullable, CHECK: 'Journaling', 'Productivity', 'Wellness', 'Decision Making', 'Problem Solving', 'Business' |

---

## 🧩 journals
| Column Name | Data Type | Default Value | Constraints |
|--------------|------------|---------------|-------------|
| id | uuid | gen_random_uuid() | Primary Key |
| user_id | uuid | - | nullable, Foreign Key → profiles.id |
| content | text | - | - |
| journal_date | date | CURRENT_DATE | nullable |
| title | text | - | nullable |

---

## 🧩 learning_progress
| Column Name | Data Type | Default Value | Constraints |
|--------------|------------|---------------|-------------|
| profile_id | uuid | - | Primary Key, Foreign Key → profiles.id |
| total_words_learned | integer | 0 | nullable |
| total_journals_completed | integer | 0 | nullable |
| streak_days | integer | 0 | nullable |
| last_update | timestamp with time zone | now() | nullable |

---

## 🧩 profiles
| Column Name | Data Type | Default Value | Constraints |
|--------------|------------|---------------|-------------|
| id | uuid | - | Primary Key, Foreign Key → auth.users.id |
| name | text | - | nullable |
| english_level | text | - | nullable |
| goals | ARRAY | - | nullable |
| writing_types | ARRAY | - | nullable |
| onboarding_completed | boolean | false | nullable |
| updated_at | timestamp with time zone | - | nullable |
| pinned_template_ids | ARRAY | '{}' | nullable |

---

## 🧩 roleplay_scenario
| Column Name | Data Type | Default Value | Constraints |
|--------------|------------|---------------|-------------|
| id | uuid | gen_random_uuid() | Primary Key |
| name | text | - | - |
| context | text | - | - |
| starter_message | text | - | - |
| guide | text | - | nullable |
| level | text | - | nullable |
| topic | text | - | nullable |
| created_at | timestamp without time zone | now() | nullable |
| role1 | text | - | nullable |
| image | text | - | nullable |

---

## 🧩 vocab_topics
| Column Name | Data Type | Default Value | Constraints |
|--------------|------------|---------------|-------------|
| id | uuid | gen_random_uuid() | Primary Key |
| topic_name | text | - | - |
| level | text | - | nullable |
| description | text | - | nullable |
| topic_id | text | - | nullable, unique |

---

## 📊 Database Statistics
- **Total Tables**: 13
- **Total Rows**: ~329 records across all tables
- **RLS Enabled**: journals, profiles, flashcard_set
- **Foreign Key Relationships**: 12 relationships defined

## 🔗 Key Relationships
1. **profiles** ↔ **learning_progress** (1:1)
2. **profiles** ↔ **journals** (1:many) 
3. **profiles** ↔ **flashcard_set** (1:many)
4. **profiles** ↔ **feedback_logs** (1:many)
5. **flashcard_set** ↔ **flashcard** (1:many)
6. **flashcard** ↔ **flashcard_status** (1:1)
7. **flashcard_status** ↔ **fsrs_review_logs** (1:many)
8. **grammar_topics** ↔ **feedback_logs** (1:many)
9. **vocab_topics** ↔ **feedback_logs** (1:many)
