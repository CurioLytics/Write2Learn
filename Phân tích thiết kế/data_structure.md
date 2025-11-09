# 📘 Database Schema Overview

Dưới đây là danh sách các bảng cùng với các cột tương ứng trong cơ sở dữ liệu.

---

## 🧩 chatbot_sessions
| Column Name | Data Type |
|--------------|------------|
| id | uuid |
| profile_id | uuid |
| interaction_logs | jsonb |
| created_at | timestamp with time zone |
| completed_at | timestamp with time zone |

---

## 🧩 feedback_logs
| Column Name | Data Type |
|--------------|------------|
| id | uuid |
| profile_id | uuid |
| type | text | (grammar/vocab)
| grammar_topic_id | uuid |
| vocab_topic_id | uuid |
| details | jsonb |
| detected_at | timestamp with time zone |

---

## 🧩 flashcard
| Column Name | Data Type |
|--------------|------------|
| id | uuid |
| set_id | uuid |
| word | text |
| meaning | text |
| created_at | timestamp with time zone |
| example | text |
| context_sentence | text |
| journal_entry_id | uuid |
| source | text |
| updated_at | timestamp with time zone |

---

## 🧩 flashcard_set
| Column Name | Data Type |
|--------------|------------|
| id | uuid |
| title | text |
| created_at | timestamp with time zone |
| profile_id | uuid |
| description | text |
| source_type | text |
| updated_at | timestamp with time zone |

---

## 🧩 flashcard_status
| Column Name | Data Type |
|--------------|------------|
| id | uuid |
| flashcard_id | uuid |
| interval | integer |
| repetitions | integer |
| ease_factor | double precision |
| next_review_at | timestamp with time zone |
| last_review_at | timestamp with time zone |
| stability | double precision |
| difficulty | double precision |
| elapsed_days | integer |
| scheduled_days | integer |
| learning_steps | integer |
| lapses | integer |
| state | text |
| updated_at | timestamp with time zone |

---

## 🧩 fsrs_review_logs
| Column Name | Data Type |
|--------------|------------|
| id | uuid |
| card_id | uuid |
| rating | text |
| state | text |
| review_date | timestamp with time zone |
| elapsed_days | integer |
| scheduled_days | integer |
| stability_before | double precision |
| difficulty_before | double precision |
| created_at | timestamp with time zone |

---

## 🧩 grammar_topics
| Column Name | Data Type |
|--------------|------------|
| id | uuid |
| topic_name | text |
| parent_topic_id | uuid |
| level | text |
| description | text |

---

## 🧩 journal_template
| Column Name | Data Type |
|--------------|------------|
| id | uuid |
| name | text |
| other | text |
| content | text |
| tag | ARRAY |
| category | text |

---

## 🧩 journals
| Column Name | Data Type |
|--------------|------------|
| id | uuid |
| user_id | uuid |
| content | text |
| journal_date | date |
| title | text |

---

## 🧩 learning_progress
| Column Name | Data Type |
|--------------|------------|
| profile_id | uuid |
| total_words_learned | integer |
| total_journals_completed | integer |
| streak_days | integer |
| last_update | timestamp with time zone |

---

## 🧩 profiles
| Column Name | Data Type |
|--------------|------------|
| id | uuid |
| name | text |
| english_level | text |
| goals | ARRAY |
| writing_types | ARRAY |
| onboarding_completed | boolean |
| updated_at | timestamp with time zone |
| pinned_template_ids | ARRAY |

---

## 🧩 roleplay_scenario
| Column Name | Data Type |
|--------------|------------|
| id | uuid |
| name | text |
| context | text |
| starter_message | text |
| guide | text |
| level | text |
| topic | text |
| created_at | timestamp without time zone |
| role1 | text |
| image | text |

---

## 🧩 vocab_topics
| Column Name | Data Type |
|--------------|------------|
| id | uuid |
| topic_name | text |
| level | text |
| description | text |

---
