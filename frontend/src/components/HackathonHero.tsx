import { Highlight } from './Highlight';

export function HackathonHero() {
  return (
    <section className="py-12" style={{ backgroundColor: '#FFFEEB' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="mb-8">
            <a 
              href="https://decentrathon.ai/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 rounded-full text-lg font-semibold hover:opacity-90 transition-opacity cursor-pointer" 
              style={{ backgroundColor: '#C1F21D', color: '#141414' }}
            >
              🏆 Decentrathon 2025 - Team Richards
            </a>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight" style={{ color: '#141414' }}>
            <Highlight>Privacy-First</Highlight><br />
            Geotrack Analytics
          </h1>

          {/* Subheading */}
          <h2 className="text-2xl md:text-3xl font-semibold mb-12" style={{ color: '#141414', opacity: 0.8 }}>
            Developing solutions based on <Highlight>anonymized geotracks</Highlight><br />
            while protecting user privacy
          </h2>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center my-12">
            <button 
              className="px-8 py-4 rounded-lg text-xl font-semibold hover:opacity-90 transition-all shadow-lg"
              style={{ backgroundColor: '#C1F21D', color: '#141414' }}
            >
              View Our Solution
            </button>
            <button 
              className="px-8 py-4 rounded-lg text-xl font-semibold border-2 hover:opacity-80 transition-all"
              style={{ borderColor: '#141414', color: '#141414' }}
            >
              Technical Details
            </button>
          </div>

          {/* Description */}
          <p className="text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed" style={{ color: '#141414', opacity: 0.7 }}>
            Our hackathon solution leverages <Highlight>advanced anonymization methods</Highlight> to analyze 
            mobility patterns without compromising personal information or user privacy.
          </p>
        </div>
      </div>
    </section>
  );
}