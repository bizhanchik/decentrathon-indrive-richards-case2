import { Highlight } from './Highlight';
import type { ImpactProps } from '../types';

export function Impact({ cards }: ImpactProps) {
  return (
    <section className="py-16" style={{ backgroundColor: '#FFFEEB' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            {/* Statistics Cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="rounded-lg p-4 text-center shadow-sm" style={{ backgroundColor: '#C1F21D', opacity: 0.8 }}>
                <div className="text-2xl font-bold mb-1" style={{ color: '#141414' }}>8</div>
                <p className="text-sm" style={{ color: '#141414' }}>international awards</p>
              </div>
              <div className="bg-blue-100 rounded-lg p-4 text-center shadow-sm">
                <div className="text-2xl font-bold mb-1" style={{ color: '#141414' }}>21</div>
                <p className="text-sm" style={{ color: '#141414' }}>countries</p>
              </div>
              <div className="bg-purple-100 rounded-lg p-4 text-center shadow-sm">
                <div className="text-2xl font-bold mb-1" style={{ color: '#141414' }}>7</div>
                <p className="text-sm" style={{ color: '#141414' }}>projects</p>
              </div>
            </div>

            {/* Main Heading */}
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight" style={{ color: '#141414' }}>
              Social impact: making{' '}
              <Highlight>a difference</Highlight>
            </h2>

            {/* Description */}
            <p className="text-lg mb-6" style={{ color: '#141414' }}>
              To maximize our positive impact, we created a hub called <Highlight>inVision</Highlight>
            </p>

            {/* CTA Link */}
            <a href="#" className="font-medium flex items-center hover:underline" style={{ color: '#141414' }}>
              Learn more about inVision
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>

            {/* Impact Badge */}
            <div className="mt-8">
              <span className="bg-white rounded-full px-4 py-2 text-sm font-medium" style={{ border: `1px solid #141414`, color: '#141414' }}>
                Impact
              </span>
            </div>
          </div>

          {/* Right Grid - Impact Cards */}
          <div className="grid grid-cols-2 gap-4">
            {cards.map((card) => (
              <div
                key={card.id}
                className="relative group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-xl aspect-square">
                  <img
                    src={card.image}
                    alt={card.description}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-70"></div>
                  
                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <div className="text-white">
                      <div className="text-3xl font-bold mb-2" style={{ color: '#C1F21D' }}>
                        {card.statistic}
                      </div>
                      <p className="text-sm font-medium">
                        {card.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}