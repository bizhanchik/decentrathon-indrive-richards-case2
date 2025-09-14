import { useState, useCallback, useEffect } from 'react';
import { type CallBackProps, STATUS } from 'react-joyride';
import { isFirstTimeVisitor, markTourAsCompleted } from '../utils/cookies';

export interface UseTourReturn {
  isTourOpen: boolean;
  currentStep: number;
  startTour: () => void;
  stopTour: () => void;
  handleJoyrideCallback: (data: CallBackProps) => void;
}

export const useTour = (): UseTourReturn => {
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Auto-start tour for first-time visitors
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isFirstTimeVisitor()) {
        setIsTourOpen(true);
      }
    }, 1000); // Small delay to ensure page is fully loaded

    return () => clearTimeout(timer);
  }, []);

  const startTour = useCallback(() => {
    setIsTourOpen(true);
  }, []);

  const stopTour = useCallback(() => {
    setIsTourOpen(false);
    setCurrentStep(0);
    markTourAsCompleted();
  }, []);

  const handleJoyrideCallback = useCallback((data: CallBackProps) => {
    const { status, type, action, index } = data;

    // Update current step
    setCurrentStep(index);

    // Custom scrolling for mobile layer cards (steps 4-10)
    if (type === 'step:before' && index >= 4 && index <= 10) {
      // Check if we're on mobile (screen width < 1024px)
      if (window.innerWidth < 1024) {
        setTimeout(() => {
          // Find the mobile layers container
          const mobileContainer = document.querySelector('.max-h-80.overflow-y-auto');
          if (mobileContainer) {
            // Find the target layer card
            const targetId = `#tour-layer-${['routes', 'demand', 'availability', 'violations', 'anomalies', 'traffic_jams', 'speed_zones'][index - 4]}`;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
              // Scroll the target into view within the mobile container
              targetElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center',
                inline: 'nearest'
              });
            }
          }
        }, 100);
      }
    }

    // Handle outside clicks (overlay clicks) as skip - close the tour immediately
    if (action === 'close' || (type === 'step:after' && action === 'skip')) {
      setIsTourOpen(false);
      setCurrentStep(0);
      markTourAsCompleted();
      return;
    }

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setIsTourOpen(false);
      setCurrentStep(0);
      markTourAsCompleted();
    }

    // Optional: Add analytics or other side effects here
    console.log('Tour event:', { status, type, action, index });
  }, []);

  return {
    isTourOpen,
    currentStep,
    startTour,
    stopTour,
    handleJoyrideCallback,
  };
};