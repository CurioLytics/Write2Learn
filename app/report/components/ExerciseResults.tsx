'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, XCircle, Trophy, Target } from 'lucide-react';
import { GradingV2Response, TopicExercise } from '@/types/exercise';

interface ExerciseResultsProps {
  exercises: TopicExercise[];
  userAnswers: { [key: string]: string };
  gradingResults: GradingV2Response;
  onClose: () => void;
  onRetry: () => void;
}

export function ExerciseResults({ 
  exercises, 
  userAnswers, 
  gradingResults, 
  onClose, 
  onRetry 
}: ExerciseResultsProps) {
  // Calculate statistics
  let totalQuizzes = 0;
  let correctAnswers = 0;

  Object.values(gradingResults).forEach(results => {
    totalQuizzes += results.length;
    correctAnswers += results.filter(r => r.correct).length;
  });

  const scorePercentage = totalQuizzes > 0 ? Math.round((correctAnswers / totalQuizzes) * 100) : 0;
  const isPerfect = correctAnswers === totalQuizzes;
  const isGood = scorePercentage >= 70;

  return (
    <>
      {/* Header with Score */}
      <div className="px-6 pb-4 border-b shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Kết quả bài tập</h2>
            <p className="text-sm text-gray-600 mt-1">
              {exercises.length} chủ đề • {totalQuizzes} bài tập
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isPerfect && (
              <Trophy className="w-8 h-8 text-yellow-500" />
            )}
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                {correctAnswers}/{totalQuizzes}
              </div>
              <div className="text-sm text-gray-600">
                {scorePercentage}% chính xác
              </div>
            </div>
          </div>
        </div>

        {/* Motivational message */}
        {isPerfect && (
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm font-medium text-yellow-900 text-center">
              🎉 Hoàn hảo! Bạn đã làm đúng tất cả các câu!
            </p>
          </div>
        )}
        {!isPerfect && isGood && (
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm font-medium text-blue-900 text-center">
              👏 Tốt lắm! Tiếp tục cố gắng nhé!
            </p>
          </div>
        )}
        {!isGood && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3">
            <p className="text-sm font-medium text-purple-900 text-center">
              💪 Cần cố gắng thêm! Hãy xem lại các lỗi sai bên dưới nhé!
            </p>
          </div>
        )}
      </div>

      {/* Results by Topic */}
      <ScrollArea className="flex-1">
        <div className="space-y-6 py-4 px-6">
          {exercises.map((topic, topicIndex) => {
            const topicResults = gradingResults[topic.topic_name] || [];
            const topicCorrect = topicResults.filter(r => r.correct).length;
            const topicTotal = topicResults.length;
            const topicScore = topicTotal > 0 ? Math.round((topicCorrect / topicTotal) * 100) : 0;

            return (
              <Card key={topicIndex} className="border-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-lg">{topic.topic_name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={topicScore === 100 ? 'default' : topicScore >= 70 ? 'secondary' : 'destructive'}
                        className="shrink-0"
                      >
                        {topicCorrect}/{topicTotal}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topic.quizzes.map((quiz, quizIndex) => {
                    const answerKey = `${topicIndex}-${quizIndex}`;
                    const userAnswer = userAnswers[answerKey] || '';
                    const result = topicResults[quizIndex];
                    const isCorrect = result?.correct || false;
                    const correctAnswer = result?.correct_answer;

                    return (
                      <div key={quizIndex} className="space-y-2">
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 pt-1">
                            {isCorrect ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                          </div>
                          <div className="flex-1 space-y-2">
                            <p className="text-gray-900 font-medium">{quiz}</p>
                            
                            {/* User's answer */}
                            <div className={`p-3 rounded-lg border ${
                              isCorrect 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-red-50 border-red-200'
                            }`}>
                              <div className="flex items-start gap-2">
                                <span className="text-xs font-semibold text-gray-600 mt-0.5">
                                  Câu trả lời của bạn:
                                </span>
                                <span className={`flex-1 text-sm font-medium ${
                                  isCorrect ? 'text-green-700' : 'text-red-700'
                                }`}>
                                  {userAnswer || <span className="italic text-gray-400">(Chưa trả lời)</span>}
                                </span>
                              </div>
                            </div>

                            {/* Correct answer (if incorrect) */}
                            {!isCorrect && correctAnswer && (
                              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                                <div className="flex items-start gap-2">
                                  <Target className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <span className="text-xs font-semibold text-blue-600 block mb-1">
                                      Đáp án đúng:
                                    </span>
                                    <span className="text-sm font-medium text-blue-900">
                                      {correctAnswer}
                                    </span>
                                  </div>
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
            );
          })}
        </div>
      </ScrollArea>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end pt-4 px-6 pb-6 border-t shrink-0">
        <Button onClick={onRetry} variant="outline">
          Làm lại
        </Button>
        <Button onClick={onClose}>
          Đóng
        </Button>
      </div>
    </>
  );
}
