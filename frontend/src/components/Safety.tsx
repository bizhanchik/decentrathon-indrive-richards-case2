import { Highlight } from './Highlight';
import type { SafetyProps } from '../types';

export function Safety({ features }: SafetyProps) {
  return (
    <section className="py-16" style={{ backgroundColor: '#FFFEEB' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#141414' }}>
            Your <Highlight>safety</Highlight> is our priority
          </h2>
          <p className="text-xl max-w-3xl mx-auto" style={{ color: '#141414', opacity: 0.8 }}>
            We've built comprehensive <Highlight>safety features</Highlight> into every aspect of the inDrive experience, 
            ensuring you feel <Highlight>secure</Highlight> whether you're riding, driving, or sending packages.
          </p>
        </div>

        {/* Safety Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-lg transition-all group"
            >
              {/* Icon */}
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-bold mb-3" style={{ color: '#141414' }}>
                {feature.title}
              </h3>
              <p style={{ color: '#141414', opacity: 0.7 }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Safety Statistics */}
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#141414' }}>
              Safety by the <Highlight>numbers</Highlight>
            </h3>
            <p className="max-w-2xl mx-auto" style={{ color: '#141414', opacity: 0.7 }}>
              Our commitment to safety is reflected in our track record and the <Highlight>trust</Highlight> 
              our community places in us every day.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: '#C1F21D' }}>99.9%</div>
              <p style={{ color: '#141414', opacity: 0.7 }}>Safe trips completed</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: '#C1F21D' }}>100%</div>
              <p style={{ color: '#141414', opacity: 0.7 }}>Drivers background checked</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: '#C1F21D' }}>24/7</div>
              <p style={{ color: '#141414', opacity: 0.7 }}>Safety support available</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: '#C1F21D' }}>&lt;2min</div>
              <p style={{ color: '#141414', opacity: 0.7 }}>Emergency response time</p>
            </div>
          </div>
        </div>

        {/* Emergency Contact Section */}
        <div 
          className="mt-12 border rounded-2xl p-8"
          style={{ backgroundColor: '#C1F21D', borderColor: '#C1F21D', opacity: 0.9 }}
        >
          <div className="flex items-center justify-between flex-col md:flex-row gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold mb-2" style={{ color: '#141414' }}>
                Emergency? Need <Highlight>immediate help</Highlight>?
              </h3>
              <p style={{ color: '#141414', opacity: 0.8 }}>
                Use our in-app emergency button or contact local emergency services directly
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                className="px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all text-white"
                style={{ backgroundColor: '#141414' }}
              >
                Emergency Button
              </button>
              <button 
                className="border-2 px-6 py-3 rounded-lg font-semibold hover:opacity-80 transition-all"
                style={{ borderColor: '#141414', color: '#141414' }}
              >
                Safety Center
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}