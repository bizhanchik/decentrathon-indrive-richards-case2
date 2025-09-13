import { 
  HackathonHeader, 
  HackathonHero, 
  SolutionOverview, 
  TeamSection, 
  HackathonFooter 
} from './components';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <HackathonHeader />
      
      <main>
        <HackathonHero />
        <SolutionOverview />
        <TeamSection />
      </main>
      
      <HackathonFooter />
    </div>
  );
}

export default App;
