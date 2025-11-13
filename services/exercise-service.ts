import { ExerciseResponse, GradingRequest, GradingResponse, ErrorData, WebhookExerciseResponse, Exercise } from '@/types/exercise';

export class ExerciseService {
  private static readonly GEN_EXERCISE_URL = '/api/exercises/generate';
  private static readonly GRADE_EXERCISE_URL = '/api/exercises/grade';

  static async generateExercises(errors: ErrorData[]): Promise<ExerciseResponse> {
    try {
      const response = await fetch(this.GEN_EXERCISE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          errorData: errors.map(error => ({
            topic_name: error.topicName,
            grammar_id: error.grammarId,
            frequency: error.frequency,
            detected_at: error.detectedAt
          }))
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const webhookResponse: WebhookExerciseResponse = await response.json();
      
      // Return the questions directly in the format expected by PracticeDialog
      return {
        questions: webhookResponse.questions
      };
    } catch (error) {
      console.error('Error generating exercises:', error);
      if (error instanceof Error) {
        throw new Error(`Lỗi tạo bài tập: ${error.message}`);
      }
      throw new Error('Không thể tạo bài tập. Vui lòng thử lại.');
    }
  }

  static async gradeExercises(gradingRequest: GradingRequest): Promise<GradingResponse> {
    try {
      const response = await fetch(this.GRADE_EXERCISE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exercises: gradingRequest.exercises
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error grading exercises:', error);
      if (error instanceof Error) {
        throw new Error(`Lỗi chấm bài: ${error.message}`);
      }
      throw new Error('Không thể chấm bài. Vui lòng thử lại.');
    }
  }
}