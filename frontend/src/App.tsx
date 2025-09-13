import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { 
  HackathonHeader, 
  HackathonHero, 
  SolutionOverview, 
  TeamSection, 
  HackathonFooter 
} from './components';
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
