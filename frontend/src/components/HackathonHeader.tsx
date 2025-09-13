import { Highlight } from './Highlight';

export function HackathonHeader() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="block">
              <h1 className="text-2xl font-bold hover:opacity-90 transition-opacity cursor-pointer" style={{ color: '#141414' }}>
                Team <span style={{ color: '#C1F21D' }}>Richards</span>
              </h1>
            </a>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#approach" className="px-3 py-2 text-sm font-medium transition-colors hover:opacity-75" style={{ color: '#141414' }}>
              Approach
            </a>
            <a href="#team" className="px-3 py-2 text-sm font-medium transition-colors hover:opacity-75" style={{ color: '#141414' }}>
              Team
            </a>
          </nav>

          {/* CTA */}
          <div className="hidden md:flex">
            <a 
              href="https://decentrathon.ai/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer" 
              style={{ backgroundColor: '#C1F21D', color: '#141414' }}
            >
              <Highlight>Decentrathon 2025</Highlight>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}