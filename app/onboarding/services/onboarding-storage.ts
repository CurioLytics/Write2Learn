export const ONBOARDING_KEY = 'onboardingData';

export const onboardingStorage = {
  save(data: any) {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(ONBOARDING_KEY, JSON.stringify(data));
    }
  },
  load() {
    if (typeof window === 'undefined') return null;
    const raw = sessionStorage.getItem(ONBOARDING_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  clear() {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(ONBOARDING_KEY);
    }
  }
};
