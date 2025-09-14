// import { HackathonHeader } from '../components';
import { HackathonHeader } from '../components/HackathonHeader';
import { SolutionMap } from '../components/SolutionMap';
import { GuidedTour } from '../components/GuidedTour';
import { TourProvider } from '../contexts/TourContext';

export function SolutionPage() {
  return (
    <TourProvider>
      <div className="h-screen bg-white overflow-hidden flex flex-col">
        <HackathonHeader />
        <div className="flex-1 overflow-hidden">
          <SolutionMap />
        </div>
        <GuidedTour />
      </div>
    </TourProvider>
  );
}