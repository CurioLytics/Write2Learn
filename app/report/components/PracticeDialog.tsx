'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, AlertCircle } from 'lucide-react';
import { exerciseService } from '@/services/exercise-service-new';
import { ErrorData } from '@/types/exercise';

interface PracticeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  errorData: ErrorData[];
}

export function PracticeDialog({ isOpen, onClose, errorData }: PracticeDialogProps) {
  const [questions, setQuestions] = useState<string[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [corrections, setCorrections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && errorData?.length > 0) {
      loadExercises();
    }
  }, [isOpen, errorData]);

  const loadExercises = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await exerciseService.generateExercises(errorData);
      
      if (!result.success) {
        setError(result.error?.message || 'Lỗi tạo bài tập');
        return;
      }

      if (!result.data?.questions || result.data.questions.length === 0) {
        setError('Không có bài tập nào được tạo');
        return;
      }

      setQuestions(result.data.questions);
      setUserAnswers({});
      setCorrections([]);
    } catch (error) {
      console.error('Error loading exercises:', error);
      setError(error instanceof Error ? error.message : 'Lỗi không xác định');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex: number, value: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: value
    }));
  };

  const handleCheck = async () => {
    try {
      setIsChecking(true);
      setError(null);

      const exerciseData = questions.map((question, index) => ({
        question,
        answer: userAnswers[index] || ''
      }));

      const result = await exerciseService.checkExercises(exerciseData);

      if (!result.success) {
        setError(result.error?.message || 'Lỗi kiểm tra bài tập');
        return;
      }

      setCorrections(result.data?.corrections || []);
    } catch (error) {
      console.error('Error checking exercises:', error);
      setError(error instanceof Error ? error.message : 'Lỗi không xác định khi kiểm tra bài tập');
    } finally {
      setIsChecking(false);
    }
  };

  const handleRetry = () => {
    setCorrections([]);
    setError(null);
  };

  const handleClose = () => {
    setQuestions([]);
    setUserAnswers({});
    setCorrections([]);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ôn tập từ lỗi sai</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Sắp có cái làm rùii</span>
            </div>
          )}

          {error && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-700 flex-1">{error}</span>
              </div>
              <div className="flex justify-center">
                <Button onClick={loadExercises} variant="outline">
                  Tải lại
                </Button>
              </div>
            </div>
          )}

          {!isLoading && !error && questions.map((question, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-start gap-3 mb-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="text-gray-900">{question}</p>
                </div>
              </div>
              
              <Input
                type="text"
                value={userAnswers[index] || ''}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                placeholder="Nhập câu trả lời..."
                className="w-full mb-3"
              />

              {corrections[index] && (
                <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="text-sm text-orange-800">
                    <strong>Feedback:</strong> {corrections[index]}
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="flex gap-3 justify-end pt-4">
            {corrections.length === 0 ? (
              <>
                <Button
                  onClick={handleCheck}
                  disabled={isChecking || questions.length === 0}
                >
                  {isChecking ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang kiểm tra...
                    </>
                  ) : (
                    'Xong'
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setUserAnswers({});
                    setCorrections([]);
                    loadExercises();
                  }}
                >
                  Làm lại
                </Button>
                <Button onClick={handleClose}>
                  Xong
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}