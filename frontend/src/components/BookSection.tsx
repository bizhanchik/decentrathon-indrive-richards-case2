import { Highlight } from './Highlight';

export function BookSection() {
  return (
    <section className="py-16" style={{ backgroundColor: '#141414' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="order-2 lg:order-1">
            <div className="mb-8">
              <button 
                className="px-6 py-3 rounded-2xl font-semibold hover:opacity-90 transition-all border-2"
                style={{ 
                  backgroundColor: '#C1F21D', 
                  color: '#141414', 
                  borderColor: '#C1F21D' 
                }}
              >
                Download
              </button>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight text-white">
              From <Highlight>underdog</Highlight> to{' '}
              <Highlight>global company</Highlight>
            </h2>
            
            <p className="text-lg mb-8 leading-relaxed text-white opacity-90">
              The true history of the <Highlight>technological phenomenon</Highlight> that is inDrive, 
              as told by its CEO
            </p>
          </div>

          {/* Right Image */}
          <div className="order-1 lg:order-2">
            <div className="relative">
              <div 
                className="w-full h-80 rounded-lg shadow-lg flex items-center justify-center"
                style={{ backgroundColor: '#FFFEEB' }}
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-2xl font-bold" style={{ color: '#141414' }}>
                    CEO's <Highlight>Story</Highlight>
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}