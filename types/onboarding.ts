// ==================== ONBOARDING FLOW ====================

export interface OnboardingData {
  name: string;
  journaling_reasons: string[];
  journaling_challenges: string[];
  english_improvement_reasons: string[];
  english_challenges: string[];
  english_level: string;
  english_tone: string;
  daily_review_goal: number;
  daily_vocab_goal: number;
  daily_journal_goal: number;
  daily_roleplay_goal: number;
}

export type OnboardingStep = 
  | 'welcome'
  | 'name-input'
  | 'journaling-intro'
  | 'journaling-reasons'
  | 'journaling-challenges'
  | 'language-intro'
  | 'english-reasons'
  | 'english-challenges'
  | 'english-level'
  | 'english-tone'
  | 'daily-goal'
  | 'goals-intro'
  | 'vocab-goal'
  | 'journal-goal'
  | 'roleplay-goal';

export interface StepConfig {
  id: OnboardingStep;
  title: string | ((data: OnboardingData) => string);
  description?: string;
  type: 'welcome' | 'section-intro' | 'multi-select' | 'single-select' | 'text-input';
  options?: { value: string | number; label: string; description?: string }[];
  dataKey?: keyof OnboardingData;
  placeholder?: string;
}

// Journaling reasons options
export const JOURNALING_REASONS = [
  { value: 'mental_clarity', label: 'I want mental clarity' },
  { value: 'express_thoughts', label: 'I want to express my thoughts better' },
  { value: 'build_habit', label: 'I want to build a writing habit' },
  { value: 'explore_self', label: 'I want to explore myself through journaling' },
  { value: 'organize_thoughts', label: 'I want help organizing my thoughts' },
  { value: 'process_emotions', label: 'I want to process emotions' },
  { value: 'reflect_insight', label: 'I want to reflect and gain insight' },
];

// Journaling challenges options
export const JOURNALING_CHALLENGES = [
  { value: 'staying_consistent', label: 'Staying consistent' },
  { value: 'coming_up_ideas', label: 'Coming up with ideas' },
  { value: 'organizing_thoughts', label: 'Organizing my thoughts' },
  { value: 'feeling_stuck', label: 'Feeling stuck' },
  { value: 'emotions_to_words', label: 'Turning emotions into words' },
];

// English improvement reasons
export const ENGLISH_IMPROVEMENT_REASONS = [
  { value: 'travel', label: 'To travel more comfortably' },
  { value: 'conversation', label: 'For everyday conversation' },
  { value: 'study_exams', label: 'For study or exams' },
  { value: 'professional', label: 'For professional communication' },
  { value: 'express_better', label: 'To express myself better' },
  { value: 'long_term_fluency', label: 'To build long-term fluency' },
];

// English challenges
export const ENGLISH_CHALLENGES = [
  { value: 'vocabulary', label: 'Vocabulary' },
  { value: 'speaking_fluency', label: 'Speaking fluency' },
  { value: 'grammar_accuracy', label: 'Grammar accuracy' },
  { value: 'forming_ideas', label: 'Forming ideas in English' },
  { value: 'native_content', label: 'Understanding native-level content' },
];

// English levels (new detailed options)
export const ENGLISH_LEVELS_NEW = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'elementary', label: 'Elementary' },
  { value: 'pre-intermediate', label: 'Pre-intermediate' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'upper-intermediate', label: 'Upper-intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

// English tone and style options
export const ENGLISH_TONES = [
  { 
    value: 'conversational', 
    label: 'Conversational English',
    description: 'English for daily life — casual and friendly tone, informal style'
  },
  { 
    value: 'professional', 
    label: 'Professional English',
    description: 'English for workplace — formal and polite tone, professional style'
  },
  { 
    value: 'academic', 
    label: 'Academic English',
    description: 'English for academic writing — clear and precise tone, structured style'
  },
];



// Onboarding steps configuration
export const ONBOARDING_STEPS: StepConfig[] = [
  {
    id: 'welcome',
    title: 'Welcome to Write2Learn',
    description: "Let's understand what brings you here.",
    type: 'welcome',
  },
  {
    id: 'name-input',
    title: 'How should I call you?',
    description: 'Just your first name is fine',
    type: 'text-input',
    dataKey: 'name',
    placeholder: 'Enter your name',
  },
  {
    id: 'journaling-intro',
    title: 'Journaling',
    description: 'Discover the power of daily reflection and self-expression.',
    type: 'section-intro',
  },
  {
    id: 'journaling-reasons',
    title: (data) => data.name ? `Why are you here, ${data.name}?` : 'Why are you here?',
    description: 'Choose what resonates with you',
    type: 'multi-select',
    options: JOURNALING_REASONS,
    dataKey: 'journaling_reasons',
  },
  {
    id: 'journaling-challenges',
    title: 'What feels hard for you when journaling?',
    description: 'Select the challenges you face',
    type: 'multi-select',
    options: JOURNALING_CHALLENGES,
    dataKey: 'journaling_challenges',
  },
  {
    id: 'language-intro',
    title: 'Language Learning',
    description: 'Build confidence in English through practice and feedback.',
    type: 'section-intro',
  },
  {
    id: 'english-reasons',
    title: 'Why do you want to improve your English?',
    description: 'Select all that apply',
    type: 'multi-select',
    options: ENGLISH_IMPROVEMENT_REASONS,
    dataKey: 'english_improvement_reasons',
  },
  {
    id: 'english-challenges',
    title: 'What challenges you the most right now?',
    description: 'Choose your biggest obstacles',
    type: 'multi-select',
    options: ENGLISH_CHALLENGES,
    dataKey: 'english_challenges',
  },
  {
    id: 'english-level',
    title: 'Your current English level',
    description: 'Choose the level that best describes you',
    type: 'single-select',
    options: ENGLISH_LEVELS_NEW,
    dataKey: 'english_level',
  },
  {
    id: 'english-tone',
    title: 'What tone do you want to focus on?',
    description: 'Choose the style that matches your learning goal',
    type: 'single-select',
    options: ENGLISH_TONES,
    dataKey: 'english_tone',
  },
  {
    id: 'daily-goal',
    title: 'Daily review goal',
    description: 'How many words do you want to review each day?',
    type: 'text-input',
    dataKey: 'daily_review_goal',
  },
  {
    id: 'goals-intro',
    title: 'Set Your Learning Goals',
    description: 'Let\'s define what success looks like for you.',
    type: 'section-intro',
  },
  {
    id: 'vocab-goal',
    title: 'Vocabulary Goal',
    description: 'How many new words do you want to learn per day?',
    type: 'text-input',
    dataKey: 'daily_vocab_goal',
  },
  {
    id: 'journal-goal',
    title: 'Journaling Goal',
    description: 'How many entries do you want to write per day?',
    type: 'text-input',
    dataKey: 'daily_journal_goal',
  },
  {
    id: 'roleplay-goal',
    title: 'Conversation Practice Goal',
    description: 'How many roleplay sessions do you want per day?',
    type: 'text-input',
    dataKey: 'daily_roleplay_goal',
  },
];

export const TOTAL_STEPS = ONBOARDING_STEPS.length;

// Helper to get only countable steps (excluding section-intro and welcome)
export const getCountableSteps = () => 
  ONBOARDING_STEPS.filter(step => step.type !== 'section-intro' && step.type !== 'welcome');

export const COUNTABLE_STEPS = getCountableSteps().length; // 8 steps