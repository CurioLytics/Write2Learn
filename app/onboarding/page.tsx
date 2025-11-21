'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/onboarding/progress-bar';
import { OptionButton } from '@/components/onboarding/option-button';
import { SectionIntro } from '@/components/onboarding/section-intro';
import { StepContainer } from '@/components/onboarding/step-container';
import { 
  ONBOARDING_STEPS, 
  TOTAL_STEPS, 
  type OnboardingData,
  type OnboardingStep 
} from '@/types/onboarding';
import { useAuth } from '@/hooks/auth/use-auth';

const STORAGE_KEY = 'onboarding_progress';

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    journaling_reasons: [],
    journaling_challenges: [],
    english_improvement_reasons: [],
    english_challenges: [],
    english_level: '',
    daily_review_goal: 10,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStep = ONBOARDING_STEPS[currentStepIndex];
  const hasSelection = currentStep.dataKey ? 
    (Array.isArray(data[currentStep.dataKey]) ? 
      (data[currentStep.dataKey] as any[]).length > 0 : 
      !!data[currentStep.dataKey]) : 
    false;

  // Load progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { stepIndex, data: savedData } = JSON.parse(saved);
        setCurrentStepIndex(stepIndex);
        setData(savedData);
      } catch (e) {
        console.error('Failed to load onboarding progress:', e);
      }
    }
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      stepIndex: currentStepIndex,
      data,
    }));
  }, [currentStepIndex, data]);

  const handleNext = async () => {
    if (currentStepIndex < TOTAL_STEPS - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // Last step - save to database
      await handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const handleComplete = async () => {
    if (!user?.id) {
      router.push('/auth');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/profile/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save onboarding data');
      }

      // Clear localStorage
      localStorage.removeItem(STORAGE_KEY);

      // Redirect to home
      router.push('/home');
    } catch (error) {
      console.error('Error saving onboarding:', error);
      alert('Error saving your preferences. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelect = (value: string | number) => {
    if (!currentStep.dataKey) return;

    const key = currentStep.dataKey;

    if (currentStep.type === 'multi-select') {
      const current = (data[key] as any[]) || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      setData({ ...data, [key]: updated });
    } else {
      // single-select
      setData({ ...data, [key]: value });
    }
  };

  const isSelected = (value: string | number): boolean => {
    if (!currentStep.dataKey) return false;
    const current = data[currentStep.dataKey];
    return Array.isArray(current) ? current.includes(value as any) : current === value;
  };

  // Render different step types
  const renderStepContent = () => {
    switch (currentStep.type) {
      case 'welcome':
        return (
          <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center animate-in fade-in duration-500">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              {currentStep.title}
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-md">
              {currentStep.description}
            </p>
            <Button
              onClick={handleNext}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-2xl text-base font-medium"
            >
              Bắt đầu hành trình của bạn
            </Button>
          </div>
        );

      case 'section-intro':
        return (
          <>
            <SectionIntro 
              title={currentStep.title} 
              description={currentStep.description || ''} 
            />
            <div className="flex justify-center pt-8">
              <Button
                onClick={handleNext}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white px-8 rounded-2xl"
              >
                Continue
              </Button>
            </div>
          </>
        );

      case 'multi-select':
      case 'single-select':
        return (
          <StepContainer title={currentStep.title} description={currentStep.description}>
            {currentStep.options?.map((option) => (
              <OptionButton
                key={option.value.toString()}
                label={option.label}
                selected={isSelected(option.value)}
                onClick={() => handleSelect(option.value)}
              />
            ))}
          </StepContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress Bar */}
      {currentStep.type !== 'welcome' && (
        <div className="sticky top-0 bg-white py-6 z-10 border-b">
          <ProgressBar currentStep={currentStepIndex} totalSteps={TOTAL_STEPS} />
        </div>
      )}

      {/* Step Content */}
      <div className="flex-1 flex items-center justify-center">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      {currentStep.type !== 'welcome' && currentStep.type !== 'section-intro' && (
        <div className="sticky bottom-0 bg-white border-t py-6 px-6">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            {/* Back Button */}
            {currentStepIndex > 0 && (
              <Button
                onClick={handleBack}
                variant="ghost"
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back
              </Button>
            )}

            <div className="flex-1" />

            {/* Skip / Continue */}
            <div className="flex gap-3">
              {!hasSelection && (
                <Button
                  onClick={handleSkip}
                  variant="ghost"
                  className="text-gray-600"
                >
                  Skip
                </Button>
              )}
              
              {hasSelection && (
                <Button
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary/90 text-white px-8 rounded-2xl"
                >
                  {isSubmitting ? 'Saving...' : currentStepIndex === TOTAL_STEPS - 1 ? 'Complete' : 'Continue'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
