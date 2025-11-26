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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, AlertCircle } from 'lucide-react';
import { exerciseService } from '@/services/exercise-service-new';
import { ErrorData, TopicExercise } from '@/types/exercise';

interface PracticeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  errorData: ErrorData[];
  grammarTopics?: Record<string, string[]>; // { grammar_topic_id: [tags] }
}

export function PracticeDialog({ isOpen, onClose, errorData, grammarTopics }: PracticeDialogProps) {
  const [exercises, setExercises] = useState<TopicExercise[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});
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
    console.log('🎯 [Dialog] loadExercises called');
    console.log('🎯 [Dialog] grammarTopics prop:', JSON.stringify(grammarTopics, null, 2));
    console.log('🎯 [Dialog] grammarTopics type:', typeof grammarTopics);
    console.log('🎯 [Dialog] grammarTopics keys:', grammarTopics ? Object.keys(grammarTopics) : 'null/undefined');
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🚀 [Dialog] Calling exerciseService.generateExercises');
      const result = await exerciseService.generateExercises(errorData, grammarTopics);
      
      console.log('✅ [Dialog] Result received:', result);
      
      if (!result.success) {
        setError('Tạm thời đang có lỗi, bạn học phần khác trước nhé');
        return;
      }

      if (!result.data?.exercises || result.data.exercises.length === 0) {
        setError('Tạm thời đang có lỗi, bạn học phần khác trước nhé');
        return;
      }

      setExercises(result.data.exercises);
      setUserAnswers({});
      setCorrections([]);
    } catch (error) {
      console.error('❌ [Dialog] Error loading exercises:', error);
      setError('Tạm thời đang có lỗi, bạn học phần khác trước nhé');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (topicIndex: number, quizIndex: number, value: string) => {
    const key = `${topicIndex}-${quizIndex}`;
    setUserAnswers(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleClose = () => {
    setExercises([]);
    setUserAnswers({});
    setCorrections([]);
    setError(null);
    onClose();
  };

  // Calculate total number of quizzes across all topics
  const totalQuizzes = exercises.reduce((sum, topic) => sum + topic.quizzes.length, 0);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Ôn tập từ lỗi sai</DialogTitle>
          {totalQuizzes > 0 && (
            <DialogDescription>
              {exercises.length} chủ đề • {totalQuizzes} bài tập
            </DialogDescription>
          )}
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Đang cook bài tập cho bạn</span>
          </div>
        )}

        {error && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span className="text-red-700 flex-1">{error}</span>
            </div>
            <div className="flex justify-center">
              <Button onClick={loadExercises} variant="outline">
                Thử lại
              </Button>
            </div>
          </div>
        )}

        {!isLoading && !error && exercises.length > 0 && (
          <>
            <ScrollArea className="h-[calc(85vh-220px)] pr-4">
              <div className="space-y-6 py-2">
                {exercises.map((topic, topicIndex) => (
                  <Card key={topicIndex} className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between gap-3">
                        <CardTitle className="text-lg">{topic.topic_name}</CardTitle>
                        <Badge variant="secondary" className="shrink-0">
                          {topic.exercise_type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {topic.quizzes.map((quiz, quizIndex) => {
                        const answerKey = `${topicIndex}-${quizIndex}`;
                        const globalIndex = exercises
                          .slice(0, topicIndex)
                          .reduce((sum, t) => sum + t.quizzes.length, 0) + quizIndex + 1;
                        
                        return (
                          <div key={quizIndex} className="space-y-2">
                            <div className="flex gap-3">
                              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                                {globalIndex}
                              </span>
                              <div className="flex-1">
                                <p className="text-gray-900 mb-2">{quiz}</p>
                                <Input
                                  type="text"
                                  value={userAnswers[answerKey] || ''}
                                  onChange={(e) => handleAnswerChange(topicIndex, quizIndex, e.target.value)}
                                  placeholder="Nhập câu trả lời..."
                                  className="w-full"
                                />
                                {corrections[globalIndex - 1] && (
                                  <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                    <div className="text-sm text-orange-800">
                                      <strong>Feedback:</strong> {corrections[globalIndex - 1]}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                onClick={() => {
                  setUserAnswers({});
                  setCorrections([]);
                  loadExercises();
                }}
                variant="outline"
              >
                Làm lại
              </Button>
              <Button onClick={handleClose}>
                Xong
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}