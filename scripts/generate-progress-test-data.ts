/**
 * Script to generate comprehensive test data for Progress page analytics
 * Run with: npx tsx scripts/generate-progress-test-data.ts
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

// Configuration
const PROFILE_ID = '14d2b7a0-04f0-4017-815e-90acca2a4413'; // Ly Nguyen
const BASE_DATE = new Date('2025-11-24T00:00:00Z');
const DAYS_BACK = 120;

// Initialize Supabase client
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for admin operations
);

// Helper: Get date N days ago
function getDaysAgo(days: number): Date {
  const date = new Date(BASE_DATE);
  date.setDate(date.getDate() - days);
  return date;
}

// Helper: Random number between min and max
function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper: Random element from array
function randomElement<T>(arr: T[]): T {
  return arr[random(0, arr.length - 1)];
}

async function main() {
  console.log('🚀 Starting test data generation...\n');

  // Step 1: Generate journals
  console.log('📝 Generating journal entries...');
  const journals = await generateJournals();
  console.log(`   ✓ Created ${journals.length} journal entries\n`);

  // Step 2: Generate roleplay sessions
  console.log('🎭 Generating roleplay sessions...');
  const sessions = await generateSessions();
  console.log(`   ✓ Created ${sessions.length} roleplay sessions\n`);

  // Step 3: Generate feedbacks
  console.log('💬 Generating feedbacks...');
  const feedbacks = await generateFeedbacks(journals, sessions);
  console.log(`   ✓ Created ${feedbacks.length} feedback records\n`);

  // Step 4: Generate grammar error items
  console.log('📚 Generating grammar error items...');
  const grammarItems = await generateGrammarItems(feedbacks);
  console.log(`   ✓ Created ${grammarItems.length} grammar error items\n`);

  // Step 5: Generate learning events
  console.log('📊 Generating learning events...');
  await generateLearningEvents(journals, sessions);
  console.log(`   ✓ Learning events created\n`);

  console.log('✅ Test data generation complete!');
  console.log('\n📈 Summary:');
  console.log(`   - Journals: ${journals.length}`);
  console.log(`   - Sessions: ${sessions.length}`);
  console.log(`   - Feedbacks: ${feedbacks.length}`);
  console.log(`   - Grammar Items: ${grammarItems.length}`);
  console.log(`   - Learning Events: ~800-1000 (estimated)`);
}

async function generateJournals() {
  const journalData = [
    // Sparse period (days 91-120): 5 journals
    { days: 118, title: 'Starting My English Learning Journey', content: 'Today I decided to commit to improving my English...' },
    { days: 112, title: 'First Week Reflections', content: 'It has been a week since I started...' },
    { days: 105, title: 'Vocabulary Building', content: 'I have been learning 5 new words every day...' },
    { days: 97, title: 'Challenging Day', content: 'Today was hard. I made many mistakes...' },
    { days: 90, title: 'Month One Complete', content: 'I cannot believe it has been a month already...' },
    
    // Light period (days 31-90): 15 journals
    { days: 84, title: 'Reading Practice', content: 'I started reading English news articles today...' },
    { days: 80, title: 'Grammar Progress', content: 'I am getting better at using present perfect tense...' },
    { days: 75, title: 'Speaking Practice', content: 'I practiced speaking today with a roleplay scenario...' },
    { days: 71, title: 'Travel Plans', content: 'I am planning a trip abroad next year...' },
    { days: 67, title: 'Learning from Mistakes', content: 'I made several grammar mistakes in today\'s writing...' },
    { days: 63, title: 'Vocabulary Review', content: 'I reviewed all the vocabulary I learned this month...' },
    { days: 59, title: 'Business English', content: 'Started focusing on business English today...' },
    { days: 55, title: 'Movie Night', content: 'I watched an English movie with subtitles...' },
    { days: 52, title: 'Conditional Sentences', content: 'Conditional sentences are tricky...' },
    { days: 48, title: 'Feeling Confident', content: 'Had a conversation in English at work today...' },
    { days: 44, title: 'Passive Voice', content: 'Learning about passive voice today...' },
    { days: 41, title: 'Idioms and Expressions', content: 'English has so many idioms!...' },
    { days: 38, title: 'Writing Challenge', content: 'I challenged myself to write a longer entry today...' },
    { days: 35, title: 'Phrasal Verbs', content: 'Phrasal verbs are everywhere in English...' },
    { days: 31, title: 'Progress Check', content: 'Looking back at my progress over the past months...' },
    
    // Moderate period (days 8-30): 10 journals
    { days: 28, title: 'Modal Verbs Practice', content: 'Today I practiced modal verbs - can, could, should, must...' },
    { days: 26, title: 'Pronunciation Focus', content: 'I recorded myself speaking and listened back...' },
    { days: 24, title: 'Weekend Learning', content: 'Even on weekends, I try to practice English...' },
    { days: 22, title: 'Relative Clauses', content: 'Learned about relative clauses today...' },
    { days: 20, title: 'Listening Practice', content: 'I listened to English podcasts during my commute...' },
    { days: 18, title: 'Reported Speech', content: 'Reported speech is confusing because you have to change tenses...' },
    { days: 16, title: 'Cultural Learning', content: 'English is not just about grammar and vocabulary...' },
    { days: 14, title: 'Comparatives Review', content: 'Reviewing comparatives and superlatives today...' },
    { days: 11, title: 'Email Writing', content: 'Practiced writing professional emails in English...' },
    { days: 8, title: 'Week Summary', content: 'This has been a productive week of learning...' },
    
    // Dense period (last 7 days): 10 journals
    { days: 6, title: 'Perfect Streak Week', content: 'I have been studying every day this week!...' },
    { days: 5, title: 'Gerunds and Infinitives', content: 'Some verbs are followed by gerunds, others by infinitives...' },
    { days: 4, title: 'Real Conversation', content: 'I had a real conversation in English with a stranger today!...' },
    { days: 3, title: 'Preposition Practice', content: 'Prepositions are so tricky in English...' },
    { days: 2, title: 'News Reading', content: 'Read several news articles today and understood most of them...' },
    { days: 1, title: 'Confidence Growing', content: 'I feel much more confident speaking English now...' },
    { days: 0, title: 'Today\'s Practice', content: 'Another day of consistent practice. Progress is visible!...' },
  ];

  const { data, error } = await supabase
    .from('journals')
    .insert(
      journalData.map((j) => {
        const date = getDaysAgo(j.days);
        return {
          user_id: PROFILE_ID,
          title: j.title,
          content: j.content,
          journal_date: date.toISOString().split('T')[0],
          created_at: date.toISOString(),
        };
      })
    )
    .select('id, created_at');

  if (error) throw error;
  return data || [];
}

async function generateSessions() {
  // Get roleplay IDs
  const { data: roleplays } = await supabase
    .from('roleplays')
    .select('id, name')
    .limit(8);

  if (!roleplays) throw new Error('No roleplays found');

  const sessionDays = [
    115, 110, 100, 92, // Sparse period
    85, 78, 72, 68, 64, 60, 56, 51, 46, 42, 37, 32, // Light period
    29, 27, 25, 23, 21, 19, 17, 15, 12, 9, // Moderate period
    6, 5, 4, 3, 2, 1, 0, // Dense period
  ];

  const { data, error } = await supabase
    .from('sessions')
    .insert(
      sessionDays.map((days) => {
        const date = getDaysAgo(days);
        const roleplay = randomElement(roleplays);
        return {
          profile_id: PROFILE_ID,
          roleplay_id: roleplay.id,
          conversation_json: {
            messages: [
              { role: 'assistant', content: 'Hello! How can I help you today?' },
              { role: 'user', content: 'Hi! I would like to practice.' },
            ],
          },
          highlights: ['Good effort', 'Clear communication'],
          created_at: date.toISOString(),
        };
      })
    )
    .select('session_id, created_at');

  if (error) throw error;
  return data || [];
}

async function generateFeedbacks(
  journals: { id: string; created_at: string }[],
  sessions: { session_id: string; created_at: string }[]
) {
  const feedbacks: any[] = [];

  // Create feedbacks for 60% of journals
  const journalFeedbacks = journals.slice(0, Math.floor(journals.length * 0.6)).map((j) => ({
    profile_id: PROFILE_ID,
    source_type: 'journal' as const,
    source_id: j.id,
    clarity_feedback: 'Your ideas are mostly clear, but some sentences could be more concise.',
    ideas_feedback: 'Good topic choice and interesting perspective.',
    vocabulary_feedback: 'Consider using more varied vocabulary.',
    created_at: j.created_at,
  }));

  // Create feedbacks for 80% of sessions
  const sessionFeedbacks = sessions.slice(0, Math.floor(sessions.length * 0.8)).map((s) => ({
    profile_id: PROFILE_ID,
    source_type: 'roleplay' as const,
    source_id: s.session_id,
    clarity_feedback: 'Your pronunciation is improving!',
    ideas_feedback: 'Good conversational flow.',
    vocabulary_feedback: 'Nice use of natural expressions.',
    created_at: s.created_at,
  }));

  feedbacks.push(...journalFeedbacks, ...sessionFeedbacks);

  const { data, error } = await supabase
    .from('feedbacks')
    .insert(feedbacks)
    .select('id, created_at');

  if (error) throw error;
  return data || [];
}

async function generateGrammarItems(feedbacks: { id: string; created_at: string }[]) {
  // Get grammar topics
  const { data: topics } = await supabase
    .from('grammar_topics')
    .select('topic_id, topic_name')
    .limit(20);

  if (!topics) throw new Error('No grammar topics found');

  // Pareto distribution: top 3 topics get 15-20 errors each
  const topTopics = topics.slice(0, 3);
  const middleTopics = topics.slice(3, 8);
  const bottomTopics = topics.slice(8);

  const grammarItems: any[] = [];
  const errorDescriptions = [
    'Missing article before noun',
    'Incorrect verb tense',
    'Subject-verb agreement error',
    'Wrong preposition used',
    'Incorrect word order',
    'Missing auxiliary verb',
    'Incorrect plural form',
    'Wrong pronoun reference',
  ];

  feedbacks.forEach((feedback) => {
    const numErrors = random(2, 5);
    for (let i = 0; i < numErrors; i++) {
      let topic;
      const rand = Math.random();
      if (rand < 0.6) {
        topic = randomElement(topTopics);
      } else if (rand < 0.9) {
        topic = randomElement(middleTopics);
      } else {
        topic = randomElement(bottomTopics);
      }

      grammarItems.push({
        feedback_id: feedback.id,
        grammar_topic_id: topic.topic_id,
        description: `${randomElement(errorDescriptions)} - ${topic.topic_name}`,
        created_at: feedback.created_at,
      });
    }
  });

  const { data, error } = await supabase
    .from('feedback_grammar_items')
    .insert(grammarItems)
    .select('id');

  if (error) throw error;
  return data || [];
}

async function generateLearningEvents(
  journals: { id: string; created_at: string }[],
  sessions: { session_id: string; created_at: string }[]
) {
  const events: any[] = [];
  const eventTypes = ['vocab_created', 'vocab_reviewed', 'journal_created', 'roleplay_completed'] as const;

  // Generate session_active events for each unique day
  const uniqueDays = new Set<string>();
  
  for (let days = 0; days < DAYS_BACK; days++) {
    const date = getDaysAgo(days);
    const dateStr = date.toISOString().split('T')[0];
    
    // Probability of activity based on period
    let activityProb = 0;
    if (days <= 7) activityProb = 1.0; // 100% - perfect streak
    else if (days <= 30) activityProb = 0.85; // 85% - few gaps
    else if (days <= 90) activityProb = 0.7; // 70% - some gaps
    else activityProb = 0.5; // 50% - many gaps

    if (Math.random() < activityProb) {
      uniqueDays.add(dateStr);
      events.push({
        profile_id: PROFILE_ID,
        event_type: 'session_active',
        created_at: date.toISOString(),
      });
    }
  }

  // Generate activity events
  for (let days = 0; days < DAYS_BACK; days++) {
    const date = getDaysAgo(days);
    let numEvents = 0;

    if (days <= 7) numEvents = random(25, 35); // Dense
    else if (days <= 30) numEvents = random(12, 18); // Moderate
    else if (days <= 90) numEvents = random(5, 10); // Light
    else numEvents = random(1, 4); // Sparse

    for (let i = 0; i < numEvents; i++) {
      const eventType = randomElement(eventTypes);
      const eventDate = new Date(date);
      eventDate.setHours(random(8, 22), random(0, 59), random(0, 59));

      events.push({
        profile_id: PROFILE_ID,
        event_type: eventType,
        reference_id: eventType === 'journal_created' && journals.length > 0 
          ? randomElement(journals).id 
          : eventType === 'roleplay_completed' && sessions.length > 0
          ? randomElement(sessions).session_id
          : null,
        created_at: eventDate.toISOString(),
      });
    }
  }

  // Batch insert (Supabase handles duplicates with unique constraint)
  const batchSize = 500;
  for (let i = 0; i < events.length; i += batchSize) {
    const batch = events.slice(i, i + batchSize);
    const { error } = await supabase.from('learning_events').insert(batch);
    if (error && !error.message.includes('duplicate')) {
      console.error('Error inserting learning events:', error);
    }
    console.log(`   Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(events.length / batchSize)}`);
  }

  console.log(`   Total events generated: ${events.length}`);
  console.log(`   Unique active days: ${uniqueDays.size}`);
}

// Run the script
main().catch((error) => {
  console.error('❌ Error generating test data:', error);
  process.exit(1);
});
