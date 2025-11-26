export interface Exercise {
  id: string;
  question: string;
  correctAnswer?: string;
  topic?: string;
  grammarType?: string;
}

// New webhook response structure with topics
export interface TopicExercise {
  topic_name: string;
  exercise_type: string;
  quizzes: string[];
}

// Webhook response structure
export interface WebhookExerciseResponse {
  questions: string[];
}

export interface ExerciseResponse {
  exercises: TopicExercise[];
}

export interface UserAnswer {
  exerciseId: string;
  userAnswer: string;
}

export interface GradingRequest {
  exercises: { question: string; userAnswer: string; }[];
}

export interface ExerciseFeedback {
  exerciseId: string;
  isCorrect: boolean;
  score: number;
  feedback: string;
  correctAnswer: string;
}

export interface GradingResponse {
  feedback: string; // Plain text feedback from webhook
}

export interface ErrorData {
  topicName: string;
  grammarId: string;
  frequency: number;
  detectedAt: string;
  description?: string; // Add description field for real error data
}