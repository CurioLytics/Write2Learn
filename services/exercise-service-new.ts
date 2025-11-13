import { 
  ExerciseResponse,
  GradingResponse,
  ErrorData,
  GradingRequest
} from '@/types/exercise';

interface ExerciseServiceResult<T> {
  success: boolean;
  data?: T;
  error?: {
    type: 'VALIDATION_ERROR' | 'NETWORK_ERROR' | 'WEBHOOK_ERROR';
    message: string;
    originalError?: Error;
  };
}

class ExerciseService {
  /**
   * Generate exercises based on error data with proper error handling
   */
  async generateExercises(errorData: ErrorData[]): Promise<ExerciseServiceResult<ExerciseResponse>> {
    try {
      // Validation
      if (!errorData || !Array.isArray(errorData) || errorData.length === 0) {
        return {
          success: false,
          error: {
            type: 'VALIDATION_ERROR',
            message: 'Error data is required and must be a non-empty array'
          }
        };
      }

      const response = await fetch('/api/exercises/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errorData }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: {
            type: 'NETWORK_ERROR',
            message: errorData.error || `Request failed with status: ${response.status}`
          }
        };
      }

      const data: ExerciseResponse = await response.json();
      
      return {
        success: true,
        data
      };

    } catch (error) {
      return {
        success: false,
        error: {
          type: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          originalError: error instanceof Error ? error : undefined
        }
      };
    }
  }

  /**
   * Grade exercises with proper error handling
   */
  async gradeExercises(gradingData: GradingRequest): Promise<ExerciseServiceResult<GradingResponse>> {
    try {
      // Validation
      if (!gradingData?.exercises || !Array.isArray(gradingData.exercises) || gradingData.exercises.length === 0) {
        return {
          success: false,
          error: {
            type: 'VALIDATION_ERROR',
            message: 'Grading data with exercises array is required'
          }
        };
      }

      const response = await fetch('/api/exercises/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gradingData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: {
            type: 'NETWORK_ERROR',
            message: errorData.error || `Request failed with status: ${response.status}`
          }
        };
      }

      const data: GradingResponse = await response.json();
      
      return {
        success: true,
        data
      };

    } catch (error) {
      return {
        success: false,
        error: {
          type: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          originalError: error instanceof Error ? error : undefined
        }
      };
    }
  }

  /**
   * Legacy methods for backward compatibility
   * @deprecated Use generateExercises instead which returns ExerciseServiceResult
   */
  async getLegacyExercises(errorData: ErrorData[]): Promise<ExerciseResponse> {
    const result = await this.generateExercises(errorData);
    
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || 'Failed to generate exercises');
    }
    
    return result.data;
  }

  /**
   * Legacy method for grading
   * @deprecated Use gradeExercises instead which returns ExerciseServiceResult
   */
  async getLegacyGrading(gradingData: GradingRequest): Promise<GradingResponse> {
    const result = await this.gradeExercises(gradingData);
    
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || 'Failed to grade exercises');
    }
    
    return result.data;
  }

  /**
   * Check exercises with webhook
   */
  async checkExercises(exercises: { question: string; answer: string }[]): Promise<ExerciseServiceResult<{ corrections: any[] }>> {
    try {
      const response = await fetch('/api/exercises/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exercises }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: {
            type: 'NETWORK_ERROR',
            message: errorData.error || `Request failed with status: ${response.status}`
          }
        };
      }

      const data = await response.json();
      
      return {
        success: true,
        data
      };

    } catch (error) {
      return {
        success: false,
        error: {
          type: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          originalError: error instanceof Error ? error : undefined
        }
      };
    }
  }
}

export const exerciseService = new ExerciseService();