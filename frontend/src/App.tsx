import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { 
//   HackathonHeader, 
//   HackathonHero, 
//   SolutionOverview, 
//   TeamSection, 
//   HackathonFooter 
// } from './components';

import { HackathonHeader } from './components/HackathonHeader';
import { HackathonHero } from './components/HackathonHero';
import { HackathonFooter } from './components/HackathonFooter';
import { SolutionOverview } from './components/SolutionOverview';
import { TeamSection } from './components/TeamSection';
import { SolutionPage } from './pages/SolutionPage';

function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <HackathonHeader />
      
      <main>
        <HackathonHero />
        <SolutionOverview />
        <TeamSection />
        <HackathonFooter />
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/solution" element={<SolutionPage />} />
      </Routes>
    </Router>
  );
}

export default App;
