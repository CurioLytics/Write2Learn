'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/onboarding/progress-bar';
import { OptionButton } from '@/components/onboarding/option-button';
import { 
  ONBOARDING_STEPS, 
  TOTAL_STEPS,
  COUNTABLE_STEPS,
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
    name: '',
    journaling_reasons: [],
    journaling_challenges: [],
    english_improvement_reasons: [],
    english_challenges: [],
    english_level: '',
    english_tone: '',
    daily_review_goal: 10,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSetup, setIsLoadingSetup] = useState(false);

  const currentStep = ONBOARDING_STEPS[currentStepIndex];
  
  // Calculate the countable step number (excluding section-intro and welcome steps)
  const getCountableStepNumber = (stepIndex: number) => {
    return ONBOARDING_STEPS.slice(0, stepIndex + 1)
      .filter(step => step.type !== 'section-intro' && step.type !== 'welcome').length;
  };
  
  const countableStepNumber = getCountableStepNumber(currentStepIndex);
  
  const hasSelection = currentStep.dataKey ? 
    (currentStep.type === 'text-input' ?
      !!(data[currentStep.dataKey] as string)?.trim() :
      Array.isArray(data[currentStep.dataKey]) ? 
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
      // Last step - show loading state then save
      setIsLoadingSetup(true);
      
      // Simulate setup time (you can adjust or remove this)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
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
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-normal text-gray-900 mb-4 tracking-tight">
              {typeof currentStep.title === 'function' ? currentStep.title(data) : currentStep.title}
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-md italic">
              {currentStep.description}
            </p>
            <Button
              onClick={handleNext}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-2xl text-base font-normal"
            >
              Start your journey
            </Button>
          </div>
        );

      case 'section-intro':
        return (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <h1 className="text-5xl font-normal text-gray-900 mb-4 tracking-tight italic">
              {typeof currentStep.title === 'function' ? currentStep.title(data) : currentStep.title}
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-md">
              {currentStep.description}
            </p>
            <Button
              onClick={handleNext}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white px-8 rounded-2xl font-normal"
            >
              Continue
            </Button>
          </div>
        );

      case 'text-input':
        return (
          <div className="py-8">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-normal text-gray-900 mb-2">
                {typeof currentStep.title === 'function' ? currentStep.title(data) : currentStep.title}
              </h2>
              {currentStep.description && (
                <p className="text-base text-gray-600 italic">
                  {currentStep.description}
                </p>
              )}
            </div>
            <div className="max-w-md mx-auto">
              <input
                type="text"
                value={(currentStep.dataKey ? data[currentStep.dataKey] : '') as string}
                onChange={(e) => {
                  if (currentStep.dataKey) {
                    setData({ ...data, [currentStep.dataKey]: e.target.value });
                  }
                }}
                placeholder={currentStep.placeholder}
                className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
                autoFocus
              />
            </div>
          </div>
        );

      case 'multi-select':
      case 'single-select':
        return (
          <div className="py-8">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-normal text-gray-900 mb-2">
                {typeof currentStep.title === 'function' ? currentStep.title(data) : currentStep.title}
              </h2>
              {currentStep.description && (
                <p className="text-base text-gray-600 italic">
                  {currentStep.description}
                </p>
              )}
            </div>
            <div className="space-y-3">
              {currentStep.options?.map((option) => (
                <OptionButton
                  key={option.value.toString()}
                  label={option.label}
                  description={option.description}
                  selected={isSelected(option.value)}
                  onClick={() => handleSelect(option.value)}
                />
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center px-4 py-10 w-full min-h-screen">
      {/* Loading Setup State */}
      {isLoadingSetup && (
        <div className="w-full max-w-3xl bg-white shadow rounded-2xl p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-6"></div>
            <h2 className="text-2xl font-normal text-gray-900 mb-2">
              Setting up your profile...
            </h2>
            <p className="text-gray-600 max-w-md italic">
              Great — let's build a journal that fits your mind and learning journey.
            </p>
          </div>
        </div>
      )}

      {/* Normal Onboarding Flow */}
      {!isLoadingSetup && (
        <>
          {/* Progress Bar */}
          {currentStep.type !== 'welcome' && currentStep.type !== 'section-intro' && (
            <div className="w-full max-w-3xl mb-8">
              <ProgressBar currentStep={countableStepNumber} totalSteps={COUNTABLE_STEPS} />
            </div>
          )}

          {/* Main Content Container */}
          <div className="w-full max-w-3xl bg-white shadow rounded-2xl p-6 mb-8">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          {currentStep.type !== 'welcome' && currentStep.type !== 'section-intro' && currentStep.type !== 'text-input' && (
            <div className="w-full max-w-3xl bg-white shadow rounded-2xl p-6">
              <div className="flex items-center justify-between">
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
                      className="bg-primary hover:bg-primary/90 text-white px-8 rounded-2xl font-normal"
                    >
                      {isSubmitting ? 'Saving...' : currentStepIndex === TOTAL_STEPS - 1 ? 'Complete' : 'Continue'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Text Input Navigation */}
          {currentStep.type === 'text-input' && (
            <div className="w-full max-w-3xl bg-white shadow rounded-2xl p-6">
              <div className="flex items-center justify-center">
                <Button
                  onClick={handleNext}
                  disabled={!hasSelection}
                  className="bg-primary hover:bg-primary/90 text-white px-8 rounded-2xl font-normal disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
