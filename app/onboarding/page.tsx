'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { StepIndicator } from './components/step-indicator';
import { NameStep } from './components/name-step';
import { EnglishLevelStep } from './components/english-level-step';
import { GoalsStep } from './components/goals-step';
import { WritingTypesStep } from './components/writing-types-step';
import { CongratulationStep } from './components/congratulation-step';
import { TemplateSelectionStep } from './components/template-selection-step';
import { useOnboardingFlow } from './hooks/use-onboarding-flow';
import type { UserProfile } from '@/types/onboarding';

export default function OnboardingPage() {
  const router = useRouter();
  const {
    step,
    profile,
    selectedTemplates,
    updateProfile,
    toggleTemplate,
    nextStep,
    prevStep,
    reset,
  } = useOnboardingFlow();

  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const canProceed = (): boolean => {
    switch (step) {
      case 1:
        return !!profile.name?.trim();
      case 2:
        return !!profile.englishLevel;
      case 3:
        return Array.isArray(profile.goals) && profile.goals.length > 0;
      case 4:
        return Array.isArray(profile.writingTypes) && profile.writingTypes.length > 0;
      case 5:
      case 6:
        return true;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (isSubmitting) return;

    // ✅ Nếu chưa đến bước cuối, chỉ tiến step
    if (step < 6) {
      nextStep();
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // ✅ Lưu lại toàn bộ thông tin (đã có sẵn trong useOnboardingFlow)
      // → Không cần sessionStorage trực tiếp ở đây
      // (vì hook đã tự save mỗi khi update)
      if (selectedTemplates.length > 0) {
        router.replace(`/journal/new?templateId=${selectedTemplates[0]}`);
      } else {
        router.replace('/journal/new');
      }
    } catch (err) {
      console.error('Error saving onboarding:', err);
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div
        className="w-full max-w-md bg-card rounded-2xl shadow-sm p-8 space-y-8"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        {/* ✅ Step Indicator */}
        {step <= 5 && <StepIndicator currentStep={Math.min(step, 5)} totalSteps={5} />}

        {/* ✅ Step Components */}
        {step === 1 && (
          <NameStep
            name={profile.name || ''}
            onNameChange={(name) => updateProfile({ name })}
          />
        )}
        {step === 2 && (
          <EnglishLevelStep
            selectedLevel={profile.englishLevel || null}
            onSelect={(level) => updateProfile({ englishLevel: level })}
          />
        )}
        {step === 3 && (
          <GoalsStep
            selectedGoals={profile.goals || []}
            onToggleGoal={(goal) => {
              const goals = profile.goals || [];
              updateProfile({
                goals: goals.includes(goal)
                  ? goals.filter((g) => g !== goal)
                  : [...goals, goal],
              });
            }}
          />
        )}
        {step === 4 && (
          <WritingTypesStep
            selectedTypes={profile.writingTypes || []}
            onToggleType={(type) => {
              const types = profile.writingTypes || [];
              updateProfile({
                writingTypes: types.includes(type)
                  ? types.filter((t) => t !== type)
                  : [...types, type],
              });
            }}
          />
        )}
        {step === 5 && <CongratulationStep name={profile.name || ''} />}
        {step === 6 && (
          <TemplateSelectionStep
            selectedTemplates={selectedTemplates}
            onToggleTemplate={(id) => toggleTemplate(id)}
          />
        )}

        {/* ✅ Error Message */}
        {error && (
          <div className="text-red-600 text-sm bg-red-50 rounded-lg p-3 text-center">
            {error}
          </div>
        )}

        {/* ✅ Navigation */}
        <div className="flex items-center justify-between pt-8">
          {step > 1 && (
            <button
              onClick={prevStep}
              className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm transition"
              disabled={isSubmitting}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
              Quay lại
            </button>
          )}

          <Button
            onClick={handleNext}
            disabled={!canProceed() || isSubmitting}
            className="ml-auto"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <span>Đang xử lý...</span>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            ) : step === 6 ? (
              selectedTemplates.length > 0 ? 'Bắt đầu viết' : 'Viết tự do'
            ) : step === 5 ? (
              'Chọn mẫu nhật ký'
            ) : (
              'Tiếp tục'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
