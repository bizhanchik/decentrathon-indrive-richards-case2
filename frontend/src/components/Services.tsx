import { Highlight } from './Highlight';
import type { ServicesProps } from '../types';

export function Services({ services }: ServicesProps) {
  return (
    <section className="py-16" style={{ backgroundColor: '#FFFEEB' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#141414' }}>
            Everything you need in <Highlight>one app</Highlight>
          </h2>
          <p className="text-xl max-w-3xl mx-auto" style={{ color: '#141414', opacity: 0.8 }}>
            Whether you need a ride, want to <Highlight>earn money</Highlight>, or send packages across the city, 
            inDrive has you covered with <Highlight>fair pricing</Highlight> and reliable service.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-lg transition-shadow group cursor-pointer"
            >
              {/* Icon */}
              <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">
                {service.icon}
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-bold mb-3" style={{ color: '#141414' }}>
                {service.title}
              </h3>
              <p className="mb-6" style={{ color: '#141414', opacity: 0.7 }}>
                {service.description}
              </p>
              
              {/* CTA */}
              <button 
                className="px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all w-full"
                style={{ backgroundColor: '#C1F21D', color: '#141414' }}
              >
                Get started
              </button>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h3 className="text-2xl font-bold mb-4" style={{ color: '#141414' }}>
              Why choose <Highlight>inDrive</Highlight>?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              <div className="text-center">
                <div className="text-3xl mb-4">💰</div>
                <h4 className="font-bold mb-2" style={{ color: '#141414' }}>
                  <Highlight>Fair Pricing</Highlight>
                </h4>
                <p style={{ color: '#141414', opacity: 0.7 }}>Set your own price and negotiate directly with drivers</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-4">🛡️</div>
                <h4 className="font-bold mb-2" style={{ color: '#141414' }}>Safety First</h4>
                <p style={{ color: '#141414', opacity: 0.7 }}>All drivers are verified with background checks</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-4">🌍</div>
                <h4 className="font-bold mb-2" style={{ color: '#141414' }}>
                  <Highlight>Global Reach</Highlight>
                </h4>
                <p style={{ color: '#141414', opacity: 0.7 }}>Available in 47 countries worldwide</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}