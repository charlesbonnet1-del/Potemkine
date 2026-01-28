'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Bienvenue sur TaskFlow !',
    description: 'Nous sommes ravis de vous avoir parmi nous. Suivez ce guide rapide pour découvrir les fonctionnalités principales.',
    icon: (
      <svg className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
  {
    id: 'projects',
    title: 'Créez votre premier projet',
    description: 'Organisez votre travail en créant des projets. Chaque projet peut contenir des tâches organisées en colonnes (À faire, En cours, Terminé).',
    icon: (
      <svg className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
  },
  {
    id: 'team',
    title: 'Invitez votre équipe',
    description: 'Collaborez efficacement en invitant vos collègues. Assignez des tâches et suivez la progression ensemble.',
    icon: (
      <svg className="h-12 w-12 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    id: 'reports',
    title: 'Suivez vos performances',
    description: 'Visualisez les rapports pour comprendre la productivité de votre équipe et identifier les axes d\'amélioration.',
    icon: (
      <svg className="h-12 w-12 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

export function OnboardingModal() {
  const { user, completeOnboarding } = useAuth();
  const { track } = useAnalytics();
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user && !user.onboardingCompleted) {
      setIsOpen(true);
      track('signup_completed', { plan: user.subscription.planId });
    }
  }, [user, track]);

  const handleNext = () => {
    track('onboarding_step_completed', { step: onboardingSteps[currentStep].id });

    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    track('onboarding_step_completed', { step: 'skipped', skippedAt: onboardingSteps[currentStep].id });
    handleComplete();
  };

  const handleComplete = () => {
    track('onboarding_completed');
    completeOnboarding();
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const step = onboardingSteps[currentStep];

  return (
    <Modal isOpen={isOpen} onClose={() => {}} size="lg">
      <div className="text-center py-6">
        <div className="flex justify-center mb-6">{step.icon}</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">{step.description}</p>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {onboardingSteps.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === currentStep ? 'bg-blue-600' : index < currentStep ? 'bg-blue-300' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        <div className="flex justify-center gap-3">
          <Button variant="ghost" onClick={handleSkip}>
            Passer
          </Button>
          <Button variant="primary" onClick={handleNext}>
            {currentStep < onboardingSteps.length - 1 ? 'Suivant' : 'Commencer'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
