import React, { useMemo } from 'react';
import Joyride from 'react-joyride';
import { createTourSteps, tourConfig } from '../data/tourSteps';
import { useTourContext } from '../contexts/TourContext';

export interface GuidedTourProps {
  className?: string;
}

export const GuidedTour: React.FC<GuidedTourProps> = () => {
  const { isTourOpen, handleJoyrideCallback } = useTourContext();

  // Create tour steps with current screen size when tour opens
  const tourSteps = useMemo(() => {
    return createTourSteps();
  }, [isTourOpen]);

  return (
    <Joyride
      steps={tourSteps}
      run={isTourOpen}
      continuous={tourConfig.continuous}
      showProgress={tourConfig.showProgress}
      showSkipButton={tourConfig.showSkipButton}
      scrollToFirstStep={tourConfig.scrollToFirstStep}
      scrollOffset={tourConfig.scrollOffset}
      disableOverlay={tourConfig.disableOverlay}
      disableOverlayClose={tourConfig.disableOverlayClose}
      hideCloseButton={tourConfig.hideCloseButton}
      spotlightClicks={tourConfig.spotlightClicks}
      callback={handleJoyrideCallback}
      styles={tourConfig.styles}
      locale={tourConfig.locale}
    />
  );
};

export interface StartTourButtonProps {
  className?: string;
  variant?: 'primary' | 'secondary' | 'icon';
  size?: 'sm' | 'md' | 'lg';
}

export const StartTourButton: React.FC<StartTourButtonProps> = ({ 
  className = '', 
  variant = 'primary',
  size = 'md'
}) => {
  const { startTour } = useTourContext();

  const getButtonClasses = () => {
    const baseClasses = 'transition-all duration-300 hover:scale-105 transform font-medium rounded-lg';
    
    const sizeClasses = {
      sm: 'px-3 py-2 text-xs',
      md: 'px-4 py-3 text-sm',
      lg: 'px-6 py-4 text-base'
    };

    const variantClasses = {
      primary: 'hover:shadow-lg',
      secondary: 'border-2 hover:bg-gray-50',
      icon: 'p-2 rounded-full hover:shadow-md'
    };

    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;
  };

  const getButtonStyle = () => {
    if (variant === 'primary') {
      return { backgroundColor: '#C1F21D', color: '#141414' };
    }
    if (variant === 'secondary') {
      return { borderColor: '#141414', color: '#141414' };
    }
    if (variant === 'icon') {
      return { backgroundColor: '#C1F21D', color: '#141414' };
    }
    return {};
  };

  const getButtonContent = () => {
    if (variant === 'icon') {
      return (
        <span className="text-lg" title="Start Guided Tour">
          🎯
        </span>
      );
    }
    return (
      <>
        <span className="mr-2">🎯</span>
        Start Tour
      </>
    );
  };

  return (
    <button
      onClick={startTour}
      className={getButtonClasses()}
      style={getButtonStyle()}
      title="Start Guided Tour"
    >
      {getButtonContent()}
    </button>
  );
};