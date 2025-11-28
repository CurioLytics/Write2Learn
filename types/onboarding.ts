// ==================== ONBOARDING FLOW ====================

export interface OnboardingData {
  name: string;
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
  | 'name'
  | 'english-reasons'
  | 'english-challenges'
  | 'english-level'
  | 'english-tone'
  | 'features-intro'
  | 'daily-goal'
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
  { value: 'mental_clarity', label: 'Mình muốn rõ ràng hơn về tinh thần' },
  { value: 'express_thoughts', label: 'Mình muốn bày tỏ suy nghĩ tốt hơn' },
  { value: 'build_habit', label: 'Mình muốn xây thói quen viết' },
  { value: 'explore_self', label: 'Mình muốn khám phá bản thân qua viết nhật ký' },
  { value: 'organize_thoughts', label: 'Mình muốn sắp xếp suy nghĩ tốt hơn' },
  { value: 'process_emotions', label: 'Mình muốn xử lý cảm xúc' },
  { value: 'reflect_insight', label: 'Mình muốn phản ánh và nhận ra điều mới' },
];

// Journaling challenges options
export const JOURNALING_CHALLENGES = [
  { value: 'staying_consistent', label: 'Giữ thói quen đều đặn' },
  { value: 'coming_up_ideas', label: 'Khó nghĩ ra ý tưởng' },
  { value: 'organizing_thoughts', label: 'Khó sắp xếp suy nghĩ' },
  { value: 'feeling_stuck', label: 'Cảm giác bế tắc' },
  { value: 'emotions_to_words', label: 'Chuyển cảm xúc thành lời' },
];

// English improvement reasons
export const ENGLISH_IMPROVEMENT_REASONS = [
  { value: 'travel', label: 'Đi du lịch' },
  { value: 'conversation', label: 'Giao tiếp hàng ngày' },
  { value: 'study_exams', label: 'Học tập, thi cử' },
  { value: 'professional', label: 'Công việc' },
  { value: 'express_better', label: 'Thể hiện bản thân' },
  { value: 'long_term_fluency', label: 'Thành thạo lâu dài' },
];

// English challenges
export const ENGLISH_CHALLENGES = [
  { value: 'vocabulary', label: 'Từ vựng' },
  { value: 'speaking_fluency', label: 'Lưu loát khi nói' },
  { value: 'grammar_accuracy', label: 'Ngữ pháp' },
  { value: 'forming_ideas', label: 'Diễn đạt ý tưởng bằng tiếng Anh' },
];

// English levels (new detailed options)
export const ENGLISH_LEVELS_NEW = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'elementary', label: 'Elementary' },
  { value: 'pre-intermediate', label: 'Pre-Intermediate' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'upper-intermediate', label: 'Upper-Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

// English tone and style options
export const ENGLISH_TONES = [
  { 
    value: 'conversational', 
    label: 'Tiếng Anh đời thường',
    description: 'Dùng cho cuộc sống hằng ngày — giọng thân thiện, phong cách không chính thức'
  },
  { 
    value: 'professional', 
    label: 'Tiếng Anh chuyên nghiệp',
    description: 'Dùng cho công việc — giọng lịch sự, phong cách chuyên nghiệp'
  },
  { 
    value: 'academic', 
    label: 'Tiếng Anh học thuật',
    description: 'Dùng cho viết học thuật — giọng rõ ràng, chính xác, cấu trúc tốt'
  },
];



// Onboarding steps configuration
export const ONBOARDING_STEPS: StepConfig[] = [
  {
    id: 'welcome',
    title: 'Chào mừng đến với Write2Learn',
    description: 'Cùng cá nhân hóa trải nghiệm học tiếng Anh của bạn.',
    type: 'welcome',
  },
  {
    id: 'name' as OnboardingStep,
    title: 'Bạn tên là gì?',
    description: 'Chúng mình sẽ gọi bạn thế này nhé',
    type: 'text-input',
    dataKey: 'name',
    placeholder: 'Nhập tên của bạn...',
  },
  {
    id: 'english-reasons',
    title: 'Tại sao bạn muốn học tiếng Anh?',
    description: 'Chọn tất cả phù hợp với bạn',
    type: 'multi-select',
    options: ENGLISH_IMPROVEMENT_REASONS,
    dataKey: 'english_improvement_reasons',
  },
  {
    id: 'english-challenges',
    title: 'Bạn gặp khó khăn gì khi học tiếng Anh?',
    description: 'Chọn những thử thách lớn nhất',
    type: 'multi-select',
    options: ENGLISH_CHALLENGES,
    dataKey: 'english_challenges',
  },
  {
    id: 'english-level',
    title: 'Trình độ tiếng Anh',
    description: 'Chọn mức độ phù hợp nhất',
    type: 'single-select',
    options: ENGLISH_LEVELS_NEW,
    dataKey: 'english_level',
  },
  {
    id: 'english-tone',
    title: 'Bạn muốn tập trung vào phong cách nào?',
    description: 'Chọn giọng điệu phù hợp mục tiêu',
    type: 'single-select',
    options: ENGLISH_TONES,
    dataKey: 'english_tone',
  },
  {
    id: 'features-intro',
    title: 'Write2Learn giúp bạn học như thế nào?',
    description: '📝 Viết với phản hồi chi tiết\n\n📚 Học từ vựng thông minh với spaced repetition\n\n🎭 Luyện giao tiếp thực tế qua roleplay\n\n📊 Theo dõi tiến trình và phân tích lỗi',
    type: 'section-intro',
  },
  {
    id: 'vocab-goal',
    title: 'Từ vựng',
    description: 'Bạn muốn học bao nhiêu từ mới mỗi ngày?',
    type: 'text-input',
    dataKey: 'daily_vocab_goal',
  },
  {
    id: 'journal-goal',
    title: 'Viết',
    description: 'Bạn muốn viết bao nhiêu bài mỗi ngày?',
    type: 'text-input',
    dataKey: 'daily_journal_goal',
  },
  {
    id: 'roleplay-goal',
    title: 'Luyện giao tiếp',
    description: 'Bạn muốn luyện bao nhiêu buổi mỗi ngày?',
    type: 'text-input',
    dataKey: 'daily_roleplay_goal',
  },
];

export const TOTAL_STEPS = ONBOARDING_STEPS.length;

// Helper to get only countable steps (excluding section-intro and welcome)
export const getCountableSteps = () => 
  ONBOARDING_STEPS.filter(step => step.type !== 'section-intro' && step.type !== 'welcome');

export const COUNTABLE_STEPS = getCountableSteps().length; // 8 steps