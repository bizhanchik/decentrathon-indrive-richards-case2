import { HackathonHeader } from '../components';
import { SolutionMap } from '../components/SolutionMap';

export function SolutionPage() {
  return (
    <div className="h-screen bg-white overflow-hidden flex flex-col">
      <HackathonHeader />
      <div className="flex-1 overflow-hidden">
        <SolutionMap />
      </div>
    </div>
  );
}