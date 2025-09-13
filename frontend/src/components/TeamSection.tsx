import { Highlight } from './Highlight';

export function TeamSection() {
  return (
    <section className="py-20" style={{ backgroundColor: '#FFFEEB' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <h2 id="team" className="text-4xl md:text-5xl font-bold mb-6 pt-32" style={{ color: '#141414', marginTop: '-8rem' }}>
            Meet Team <Highlight>Richards</Highlight>
          </h2>
          <p className="text-xl max-w-3xl mx-auto" style={{ color: '#141414', opacity: 0.8 }}>
            A dedicated team of developers and privacy experts working on 
            <Highlight>innovative geotrack solutions</Highlight> for Decentrathon 2025
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Team Stats */}
          <div className="text-center p-8 bg-white rounded-2xl shadow-sm">
            <div className="text-4xl font-bold mb-2" style={{ color: '#C1F21D' }}>100%</div>
            <p style={{ color: '#141414', opacity: 0.8 }}>Privacy Focused</p>
          </div>
          
          <div className="text-center p-8 bg-white rounded-2xl shadow-sm">
            <div className="text-4xl font-bold mb-2" style={{ color: '#C1F21D' }}>0</div>
            <p style={{ color: '#141414', opacity: 0.8 }}>Personal Data Exposed</p>
          </div>
          
          <div className="text-center p-8 bg-white rounded-2xl shadow-sm">
            <div className="text-4xl font-bold mb-2" style={{ color: '#C1F21D' }}>∞</div>
            <p style={{ color: '#141414', opacity: 0.8 }}>Possibilities</p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="p-8 rounded-2xl" style={{ backgroundColor: '#C1F21D' }}>
            <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#141414' }}>
              Ready to see our <Highlight>solution</Highlight>?
            </h3>
            <p className="text-lg mb-6" style={{ color: '#141414', opacity: 0.8 }}>
              Discover how we're revolutionizing geotrack analytics while protecting privacy
            </p>
            <button 
              className="px-8 py-4 rounded-lg text-lg font-semibold hover:opacity-90 transition-all text-white"
              style={{ backgroundColor: '#141414' }}
            >
              View Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}