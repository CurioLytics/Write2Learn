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
  { value: 'travel', label: 'Để đi du lịch thoải mái hơn' },
  { value: 'conversation', label: 'Để giao tiếp hàng ngày' },
  { value: 'study_exams', label: 'Để học tập hoặc thi cử' },
  { value: 'professional', label: 'Để giao tiếp chuyên nghiệp' },
  { value: 'express_better', label: 'Để thể hiện bản thân tốt hơn' },
  { value: 'long_term_fluency', label: 'Để xây dựng khả năng thành thạo lâu dài' },
];

// English challenges
export const ENGLISH_CHALLENGES = [
  { value: 'vocabulary', label: 'Từ vựng' },
  { value: 'speaking_fluency', label: 'Lưu loát khi nói' },
  { value: 'grammar_accuracy', label: 'Ngữ pháp' },
  { value: 'forming_ideas', label: 'Diễn đạt ý tưởng bằng tiếng Anh' },
  { value: 'native_content', label: 'Hiểu nội dung ở mức người bản xứ' },
];

// English levels (new detailed options)
export const ENGLISH_LEVELS_NEW = [
  { value: 'beginner', label: 'Mới bắt đầu' },
  { value: 'elementary', label: 'Sơ cấp' },
  { value: 'pre-intermediate', label: 'Tiền trung cấp' },
  { value: 'intermediate', label: 'Trung cấp' },
  { value: 'upper-intermediate', label: 'Trung cao cấp' },
  { value: 'advanced', label: 'Cao cấp' },
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
    description: 'Cùng tìm hiểu lý do bạn đến đây nhé.',
    type: 'welcome',
  },
  {
    id: 'name-input',
    title: 'Mình nên gọi bạn là gì?',
    description: 'Chỉ cần tên riêng thôi là đủ',
    type: 'text-input',
    dataKey: 'name',
    placeholder: 'Nhập tên của bạn',
  },
  {
    id: 'journaling-intro',
    title: 'Nhật ký',
    description: 'Khám phá sức mạnh của việc viết nhật ký hàng ngày và tự bộc lộ bản thân.',
    type: 'section-intro',
  },
  {
    id: 'journaling-reasons',
    title: (data) => data.name ? `Tại sao bạn ở đây, ${data.name}?` : 'Tại sao bạn ở đây?',
    description: 'Chọn lý do phù hợp với bạn',
    type: 'multi-select',
    options: JOURNALING_REASONS,
    dataKey: 'journaling_reasons',
  },
  {
    id: 'journaling-challenges',
    title: 'Bạn gặp khó khăn gì khi viết nhật ký?',
    description: 'Chọn những thử thách bạn gặp phải',
    type: 'multi-select',
    options: JOURNALING_CHALLENGES,
    dataKey: 'journaling_challenges',
  },
  {
    id: 'language-intro',
    title: 'Học ngôn ngữ',
    description: 'Xây dựng sự tự tin tiếng Anh qua luyện tập và phản hồi.',
    type: 'section-intro',
  },
  {
    id: 'english-reasons',
    title: 'Tại sao bạn muốn cải thiện tiếng Anh?',
    description: 'Chọn tất cả phù hợp',
    type: 'multi-select',
    options: ENGLISH_IMPROVEMENT_REASONS,
    dataKey: 'english_improvement_reasons',
  },
  {
    id: 'english-challenges',
    title: 'Hiện tại bạn gặp khó khăn nhất gì?',
    description: 'Chọn những trở ngại lớn nhất',
    type: 'multi-select',
    options: ENGLISH_CHALLENGES,
    dataKey: 'english_challenges',
  },
  {
    id: 'english-level',
    title: 'Trình độ tiếng Anh hiện tại',
    description: 'Chọn mức độ phù hợp với bạn',
    type: 'single-select',
    options: ENGLISH_LEVELS_NEW,
    dataKey: 'english_level',
  },
  {
    id: 'english-tone',
    title: 'Bạn muốn tập trung vào giọng điệu nào?',
    description: 'Chọn phong cách phù hợp mục tiêu học tập',
    type: 'single-select',
    options: ENGLISH_TONES,
    dataKey: 'english_tone',
  },
  {
    id: 'daily-goal',
    title: 'Mục tiêu ôn tập hằng ngày',
    description: 'Bạn muốn ôn bao nhiêu từ mỗi ngày?',
    type: 'text-input',
    dataKey: 'daily_review_goal',
  },
  {
    id: 'goals-intro',
    title: 'Đặt mục tiêu học tập',
    description: 'Cùng xác định thế nào là thành công với bạn.',
    type: 'section-intro',
  },
  {
    id: 'vocab-goal',
    title: 'Mục tiêu từ vựng',
    description: 'Bạn muốn học bao nhiêu từ mới mỗi ngày?',
    type: 'text-input',
    dataKey: 'daily_vocab_goal',
  },
  {
    id: 'journal-goal',
    title: 'Mục tiêu viết nhật ký',
    description: 'Bạn muốn viết bao nhiêu bài mỗi ngày?',
    type: 'text-input',
    dataKey: 'daily_journal_goal',
  },
  {
    id: 'roleplay-goal',
    title: 'Mục tiêu luyện giao tiếp',
    description: 'Bạn muốn luyện bao nhiêu buổi roleplay mỗi ngày?',
    type: 'text-input',
    dataKey: 'daily_roleplay_goal',
  },
];

export const TOTAL_STEPS = ONBOARDING_STEPS.length;

// Helper to get only countable steps (excluding section-intro and welcome)
export const getCountableSteps = () => 
  ONBOARDING_STEPS.filter(step => step.type !== 'section-intro' && step.type !== 'welcome');

export const COUNTABLE_STEPS = getCountableSteps().length; // 8 steps