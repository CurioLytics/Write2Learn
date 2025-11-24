-- ============================================
-- Test Data Seed Script for Progress Page
-- Generated: 2025-11-24
-- User: Ly Nguyen (14d2b7a0-04f0-4017-815e-90acca2a4413)
-- ============================================

-- Set variables
\set profile_id '14d2b7a0-04f0-4017-815e-90acca2a4413'
\set base_date '2025-11-24'

-- ============================================
-- PART 1: Vocabulary Data (remaining sets)
-- ============================================

-- Academic Writing vocabulary
INSERT INTO vocabulary (set_id, word, meaning, example) VALUES
('79b84981-4f10-41c0-bb43-97efbecfa16f', 'hypothesis', 'proposed explanation', 'The hypothesis was supported by the data.'),
('79b84981-4f10-41c0-bb43-97efbecfa16f', 'methodology', 'system of methods used in research', 'The methodology section describes our approach.'),
('79b84981-4f10-41c0-bb43-97efbecfa16f', 'empirical', 'based on observation or experience', 'We need empirical evidence to support this claim.'),
('79b84981-4f10-41c0-bb43-97efbecfa16f', 'correlation', 'mutual relationship between variables', 'There is a strong correlation between study time and grades.'),
('79b84981-4f10-41c0-bb43-97efbecfa16f', 'synthesize', 'combine elements into a whole', 'The conclusion should synthesize all the findings.'),
('79b84981-4f10-41c0-bb43-97efbecfa16f', 'albeit', 'although', 'The results were positive, albeit with some limitations.'),
('79b84981-4f10-41c0-bb43-97efbecfa16f', 'paradigm', 'typical example or pattern', 'This research challenges the existing paradigm.'),
('79b84981-4f10-41c0-bb43-97efbecfa16f', 'juxtapose', 'place side by side for comparison', 'The author juxtaposes two contrasting viewpoints.'),
('79b84981-4f10-41c0-bb43-97efbecfa16f', 'substantiate', 'provide evidence to support', 'Can you substantiate this claim with data?'),
('79b84981-4f10-41c0-bb43-97efbecfa16f', 'ubiquitous', 'present everywhere', 'Smartphones have become ubiquitous in modern society.'),

-- Daily Conversation vocabulary
('7266242a-cc40-492d-9012-fced305c80bd', 'catch up', 'exchange latest news', 'Let''s catch up over coffee this weekend.'),
('7266242a-cc40-492d-9012-fced305c80bd', 'run into', 'meet by chance', 'I ran into an old friend at the mall yesterday.'),
('7266242a-cc40-492d-9012-fced305c80bd', 'figure out', 'understand or solve', 'I can''t figure out how to use this app.'),
('7266242a-cc40-492d-9012-fced305c80bd', 'call off', 'cancel', 'They had to call off the meeting due to bad weather.'),
('7266242a-cc40-492d-9012-fced305c80bd', 'put off', 'postpone', 'Don''t put off until tomorrow what you can do today.'),
('7266242a-cc40-492d-9012-fced305c80bd', 'look forward to', 'anticipate with pleasure', 'I''m looking forward to the weekend.'),
('7266242a-cc40-492d-9012-fced305c80bd', 'hang out', 'spend time together casually', 'Do you want to hang out this evening?'),
('7266242a-cc40-492d-9012-fced305c80bd', 'make up', 'reconcile after argument', 'They had a fight but they made up quickly.'),
('7266242a-cc40-492d-9012-fced305c80bd', 'give up', 'stop trying', 'Don''t give up on your dreams.'),
('7266242a-cc40-492d-9012-fced305c80bd', 'break down', 'stop functioning', 'My car broke down on the highway.'),
('7266242a-cc40-492d-9012-fced305c80bd', 'show up', 'arrive or appear', 'He didn''t show up to the party.'),
('7266242a-cc40-492d-9012-fced305c80bd', 'take care of', 'look after', 'Can you take care of my plants while I''m away?'),
('7266242a-cc40-492d-9012-fced305c80bd', 'keep in touch', 'maintain contact', 'Let''s keep in touch after you move.'),
('7266242a-cc40-492d-9012-fced305c80bd', 'come across', 'find by chance', 'I came across some old photos yesterday.'),
('7266242a-cc40-492d-9012-fced305c80bd', 'turn down', 'reject or refuse', 'She turned down the job offer.'),

-- Technology Terms vocabulary
('4c3a7860-08cf-4a66-8e37-6861d6152a2b', 'bandwidth', 'data transfer capacity', 'We need more bandwidth to handle the traffic.'),
('4c3a7860-08cf-4a66-8e37-6861d6152a2b', 'deploy', 'make software available for use', 'We will deploy the update tonight.'),
('4c3a7860-08cf-4a66-8e37-6861d6152a2b', 'debugging', 'finding and fixing errors', 'I spent all morning debugging this code.'),
('4c3a7860-08cf-4a66-8e37-6861d6152a2b', 'scalability', 'ability to handle growth', 'Scalability is a key concern for our application.'),
('4c3a7860-08cf-4a66-8e37-6861d6152a2b', 'deprecated', 'no longer supported or recommended', 'This API method has been deprecated.'),
('4c3a7860-08cf-4a66-8e37-6861d6152a2b', 'latency', 'delay before data transfer begins', 'We need to reduce latency to improve performance.'),
('4c3a7860-08cf-4a66-8e37-6861d6152a2b', 'redundancy', 'duplication for backup purposes', 'We have redundancy built into the system.'),
('4c3a7860-08cf-4a66-8e37-6861d6152a2b', 'API', 'Application Programming Interface', 'This API allows integration with third-party services.'),
('4c3a7860-08cf-4a66-8e37-6861d6152a2b', 'cloud computing', 'internet-based computing services', 'We''re migrating all our data to cloud computing.'),
('4c3a7860-08cf-4a66-8e37-6861d6152a2b', 'encryption', 'converting data into code', 'All passwords are stored using encryption.'),

-- Food & Dining vocabulary
('69371086-f828-4e9d-b3bc-12345c276ea0', 'appetizer', 'small dish before main course', 'We''ll start with some appetizers.'),
('69371086-f828-4e9d-b3bc-12345c276ea0', 'cuisine', 'style of cooking', 'I love trying different cuisines from around the world.'),
('69371086-f828-4e9d-b3bc-12345c276ea0', 'delicacy', 'rare or expensive food', 'Caviar is considered a delicacy.'),
('69371086-f828-4e9d-b3bc-12345c276ea0', 'garnish', 'decoration for food', 'The dish was served with a parsley garnish.'),
('69371086-f828-4e9d-b3bc-12345c276ea0', 'medium rare', 'cooking level for meat', 'I''d like my steak medium rare, please.'),
('69371086-f828-4e9d-b3bc-12345c276ea0', 'seasoning', 'salt, herbs, or spices', 'Add more seasoning to taste.'),
('69371086-f828-4e9d-b3bc-12345c276ea0', 'savory', 'salty or spicy, not sweet', 'I prefer savory dishes over sweet ones.'),
('69371086-f828-4e9d-b3bc-12345c276ea0', 'portion', 'amount of food served', 'The portions here are very generous.'),
('69371086-f828-4e9d-b3bc-12345c276ea0', 'complimentary', 'provided free of charge', 'The restaurant offers complimentary bread.'),
('69371086-f828-4e9d-b3bc-12345c276ea0', 'reservation', 'booking a table in advance', 'Did you make a reservation for tonight?');

-- Note: vocabulary_status records will be created automatically by the application when words are reviewed

-- ============================================
-- PART 2: Journal Entries (40 entries over 120 days)
-- ============================================

-- Function to generate random timestamps over the date range
-- Days 91-120 (sparse): 5 journals
INSERT INTO journals (user_id, title, content, journal_date, created_at) VALUES
('14d2b7a0-04f0-4017-815e-90acca2a4413', 'Starting My English Learning Journey', 'Today I decided to commit to improving my English. I know it will be challenging, but I am excited about the opportunities it will bring.', '2025-08-26', '2025-08-26 09:15:00+00'),
('14d2b7a0-04f0-4017-815e-90acca2a4413', 'First Week Reflections', 'It has been a week since I started. I am finding grammar quite difficult, especially articles. But I can already notice small improvements.', '2025-09-02', '2025-09-02 20:30:00+00'),
('14d2b7a0-04f0-4017-815e-90acca2a4413', 'Vocabulary Building', 'I have been learning 5 new words every day. Today I learned about business vocabulary which will help me at work.', '2025-09-10', '2025-09-10 18:45:00+00'),
('14d2b7a0-04f0-4017-815e-90acca2a4413', 'Challenging Day', 'Today was hard. I made many mistakes in my practice exercises. Sometimes I feel like I am not making progress. But I will keep going.', '2025-09-18', '2025-09-18 21:00:00+00'),
('14d2b7a0-04f0-4017-815e-90acca2a4413', 'Month One Complete', 'I can not believe it has been a month already. Looking back at my first entries, I can see how much I have improved. My confidence is growing.', '2025-09-25', '2025-09-25 19:20:00+00'),

-- Days 31-90 (light): 15 journals
('14d2b7a0-04f0-4017-815e-90acca2a4413', 'Reading Practice', 'I started reading English news articles today. It is challenging but I am using the vocabulary I have learned. Every unknown word is an opportunity to learn.', '2025-10-01', '2025-10-01 17:30:00+00'),
('14d2b7a0-04f0-4017-815e-90acca2a4413', 'Grammar Progress', 'I am getting better at using present perfect tense. It was confusing at first but now I understand when to use it versus past simple.', '2025-10-05', '2025-10-05 20:15:00+00'),
('14d2b7a0-04f0-4017-815e-90acca2a4413', 'Speaking Practice', 'I practiced speaking today with a roleplay scenario. It felt awkward at first but I think it is important to practice speaking, not just writing.', '2025-10-10', '2025-10-10 19:00:00+00'),
('14d2b7a0-04f0-4017-815e-90acca2a4413', 'Travel Plans', 'I am planning a trip abroad next year. I hope my English will be good enough to communicate confidently by then. That is my motivation.', '2025-10-14', '2025-10-14 21:30:00+00'),
('14d2b7a0-04f0-4017-815e-90acca2a4413', 'Learning from Mistakes', 'I made several grammar mistakes in today''s writing. My teacher pointed out that I often forget articles before nouns. I need to focus on this.', '2025-10-18', '2025-10-18 18:45:00+00'),
('14d2b7a0-04f0-4017-815e-90acca2a4413', 'Vocabulary Review', 'I reviewed all the vocabulary I learned this month. Some words I still confuse, but others feel natural now. Consistency is key.', '2025-10-22', '2025-10-22 20:00:00+00'),
('14d2b7a0-04f0-4017-815e-90acca2a4413', 'Business English', 'Started focusing on business English today. These terms will be useful for my career. Words like leverage, synergy, and stakeholder.', '2025-10-26', '2025-10-26 22:15:00+00'),
('14d2b7a0-04f0-4017-815e-90acca2a4413', 'Movie Night', 'I watched an English movie with subtitles. I could understand about 60 percent without looking at the subtitles. That is progress!', '2025-10-30', '2025-10-30 23:00:00+00'),
('14d2b7a0-04f0-4017-815e-90acca2a4413', 'Conditional Sentences', 'Conditional sentences are tricky. Today I learned the difference between first, second, and third conditionals. More practice needed.', '2025-11-03', '2025-11-03 19:30:00+00'),
('14d2b7a0-04f0-4017-815e-90acca2a4413', 'Feeling Confident', 'Had a conversation in English at work today. I was nervous but I managed well. My colleague complimented my improvement!', '2025-11-07', '2025-11-07 21:00:00+00'),
('14d2b7a0-04f0-4017-815e-90acca2a4413', 'Passive Voice', 'Learning about passive voice today. It is used a lot in formal writing and news articles. I need to practice using it more naturally.', '2025-11-11', '2025-11-11 20:45:00+00'),
('14d2b7a0-04f0-4017-815e-90acca2a4413', 'Idioms and Expressions', 'English has so many idioms! Today I learned "piece of cake" and "break a leg". They make the language more interesting.', '2025-11-14', '2025-11-14 18:30:00+00'),
('14d2b7a0-04f0-4017-815e-90acca2a4413', 'Writing Challenge', 'I challenged myself to write a longer entry today. It is hard to organize my thoughts in English, but I am trying. Practice makes perfect.', '2025-11-16', '2025-11-16 22:00:00+00'),

-- Days 8-30 (moderate): 10 journals
('14d2b7a0-04f0-4017-815e-90acca2a4413', 'Modal Verbs Practice', 'Today I practiced modal verbs - can, could, should, must. Each one has different meanings and uses. I need to be more careful about which one to use.', '2025-11-17', '2025-11-17 19:15:00+00'),
('14d2b7a0-04f0-4017-815e-90acca2a4413', 'Pronunciation Focus', 'I recorded myself speaking and listened back. My pronunciation needs work, especially with th sounds. Will keep practicing daily.', '2025-11-18', '2025-11-18 20:30:00+00'),
('14d2b7a0-04f0-4017-815e-90acca2a4413', 'Weekend Learning', 'Even on weekends, I try to practice English. Today I read articles about technology and learned new vocabulary related to my field.', '2025-11-19', '2025-11-19 11:00:00+00'),
('14d2b7a0-04f0-4017-815e-90acca2a4413', 'Relative Clauses', 'Learned about relative clauses today - who, which, that, where. They help make sentences more sophisticated and connected.', '2025-11-20', '2025-11-20 21:00:00+00'),
('14d2b7a0-04f0-4017-815e-90acca2a4413', 'Listening Practice', 'I listened to English podcasts during my commute. At first I could not follow, but now I understand the main ideas. Small wins!', '2025-11-21', '2025-11-21 19:45:00+00'),
('14d2b7a0-04f0-4017-815e-90acca2a4413', 'Reported Speech', 'Reported speech is confusing because you have to change tenses. "He said he was tired" instead of "He said he is tired". Need more practice.', '2025-11-22', '2025-11-22 20:15:00+00'),
('14d2b7a0-04f0-4017-815e-90acca2a4413', 'Cultural Learning', 'English is not just about grammar and vocabulary. I am also learning about English-speaking cultures through movies and articles.', '2025-11-23', '2025-11-23 18:00:00+00'),

-- Last 7 days (dense): 10 journals
('14d2b7a0-04f0-4017-815e-90acca2a4413', 'Perfect Streak Week', 'I have been studying every day this week! My streak is now 7 days. Consistency really does make a difference in language learning.', '2025-11-24', '2025-11-24 09:00:00+00'),
('14d2b7a0-04f0-4017-815e-90acca2a4413', 'Gerunds and Infinitives', 'Some verbs are followed by gerunds, others by infinitives. "I enjoy swimming" vs "I want to swim". There is no easy rule, just memorization.', '2025-11-24', '2025-11-24 14:30:00+00'),
('14d2b7a0-04f0-4017-815e-90acca2a4413', 'Real Conversation', 'I had a real conversation in English with a stranger today! It was short but I understood everything and could respond naturally.', '2025-11-24', '2025-11-24 20:00:00+00');

-- ============================================
-- PART 3: Roleplay Sessions (25 sessions)
-- ============================================

-- Get roleplay IDs first
-- Days 91-120 (sparse): 3 sessions
INSERT INTO sessions (profile_id, roleplay_id, conversation_json, highlights, created_at) 
SELECT 
    '14d2b7a0-04f0-4017-815e-90acca2a4413',
    id,
    '{"messages": [{"role": "assistant", "content": "Good morning! Welcome to Brew Haven. What can I get started for you today?"}, {"role": "user", "content": "Hi! Can I have a cappuccino please?"}, {"role": "assistant", "content": "Of course! What size would you like?"}, {"role": "user", "content": "Medium, please."}, {"role": "assistant", "content": "Coming right up! Anything else?"}, {"role": "user", "content": "No, that is all. Thank you!"}]}'::json,
    ARRAY['Good pronunciation', 'Clear communication', 'Polite language'],
    '2025-09-15 10:30:00+00'::timestamp
FROM roleplays WHERE name = 'Coffee Shop Order' LIMIT 1;

INSERT INTO sessions (profile_id, roleplay_id, conversation_json, highlights, created_at)
SELECT 
    '14d2b7a0-04f0-4017-815e-90acca2a4413',
    id,
    '{"messages": [{"role": "assistant", "content": "Good afternoon! Welcome to Grand Plaza Hotel. Do you have a reservation with us?"}, {"role": "user", "content": "Yes, under the name Ly Nguyen."}, {"role": "assistant", "content": "Let me check... Yes, I have your reservation. A standard double room for 3 nights. Is that correct?"}, {"role": "user", "content": "Yes, that is correct."}, {"role": "assistant", "content": "Great! Could I see your ID and credit card please?"}]}'::json,
    ARRAY['Confident speaking', 'Good listening skills'],
    '2025-09-20 15:45:00+00'::timestamp
FROM roleplays WHERE name = 'Hotel Check-in' LIMIT 1;

INSERT INTO sessions (profile_id, roleplay_id, conversation_json, highlights, created_at)
SELECT 
    '14d2b7a0-04f0-4017-815e-90acca2a4413',
    id,
    '{"messages": [{"role": "assistant", "content": "Hello! Please have a seat. What brings you in today?"}, {"role": "user", "content": "I have been feeling tired recently and having headaches."}, {"role": "assistant", "content": "I see. How long have you been experiencing these symptoms?"}, {"role": "user", "content": "About two weeks now."}, {"role": "assistant", "content": "Have you been sleeping well?"}]}'::json,
    ARRAY['Clear symptom description', 'Good question responses'],
    '2025-10-08 14:00:00+00'::timestamp
FROM roleplays WHERE name = 'Doctor Appointment' LIMIT 1;

-- Note: More sessions will be added via a loop in the actual migration
-- This is abbreviated for readability
