import React, { createContext, useContext, type ReactNode } from 'react';
import { useTour, type UseTourReturn } from '../hooks/useTour';

interface TourProviderProps {
  children: ReactNode;
}

const TourContext = createContext<UseTourReturn | undefined>(undefined);

export const TourProvider: React.FC<TourProviderProps> = ({ children }) => {
  const tourState = useTour();
  
  return (
    <TourContext.Provider value={tourState}>
      {children}
    </TourContext.Provider>
  );
};

export const useTourContext = (): UseTourReturn => {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTourContext must be used within a TourProvider');
  }
  return context;
};