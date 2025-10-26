'use client';

import { useState, useEffect } from 'react';
import { onboardingStorage } from '../services/onboarding-storage';
import type { UserProfile } from '@/types/onboarding';

export function useOnboardingFlow() {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);

  // ✅ Resume progress if available
  useEffect(() => {
    const saved = onboardingStorage.load();
    if (saved?.profile) {
      setProfile(saved.profile);
      setSelectedTemplates(saved.selectedTemplates || []);
      if (saved.currentStep) setStep(saved.currentStep);
    }
  }, []);

  const updateProfile = (updates: Partial<UserProfile>) => {
    const updated = { ...profile, ...updates };
    setProfile(updated);
    onboardingStorage.save({ profile: updated, selectedTemplates, currentStep: step });
  };

  const nextStep = () => {
    setStep((prev) => {
      const newStep = prev + 1;
      onboardingStorage.save({ profile, selectedTemplates, currentStep: newStep });
      return newStep;
    });
  };

  const prevStep = () => setStep((prev) => Math.max(1, prev - 1));

  const toggleTemplate = (id: string) => {
    const newTemplates = selectedTemplates.includes(id) ? [] : [id];
    setSelectedTemplates(newTemplates);
    onboardingStorage.save({ profile, selectedTemplates: newTemplates, currentStep: step });
  };

  return {
    step,
    profile,
    selectedTemplates,
    updateProfile,
    toggleTemplate,
    nextStep,
    prevStep,
    reset: onboardingStorage.clear
  };
}
