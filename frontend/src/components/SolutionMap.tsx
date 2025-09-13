import { useState } from 'react';
import { Highlight } from './Highlight';

interface DataLayer {
  id: string;
  name: string;
  description: string;
  icon: string;
  active: boolean;
  color: string;
}

export function SolutionMap() {
  const [activeLayers, setActiveLayers] = useState<string[]>(['popular-routes']);
  const [isMobileLayersOpen, setIsMobileLayersOpen] = useState(false);
  
  const dataLayers: DataLayer[] = [
    {
      id: 'popular-routes',
      name: 'Popular Routes',
      description: 'Most frequently used transportation paths',
      icon: '🛣️',
      active: true,
      color: '#C1F21D'
    },
    {
      id: 'demand-heatmaps',
      name: 'Demand Heatmaps',
      description: 'High-demand areas for transportation services',
      icon: '🔥',
      active: false,
      color: '#FF6B6B'
    },
    {
      id: 'driver-distribution',
      name: 'Driver Distribution',
      description: 'Current driver availability across regions',
      icon: '🚗',
      active: false,
      color: '#4ECDC4'
    },
    {
      id: 'speed-violations',
      name: 'Speed Violations',
      description: 'Routes with excessive speed incidents',
      icon: '⚡',
      active: false,
      color: '#FF4757'
    },
    {
      id: 'unusual-trips',
      name: 'Unusual Trips',
      description: 'Anomaly detection in travel patterns',
      icon: '⚠️',
      active: false,
      color: '#FFE66D'
    }
  ];

  const toggleLayer = (layerId: string) => {
    setActiveLayers(prev => 
      prev.includes(layerId) 
        ? prev.filter(id => id !== layerId)
        : [...prev, layerId]
    );
  };

  return (
    <div className="h-full bg-white overflow-hidden">
      <div className="flex h-full">
        {/* Desktop Sidebar - Hidden on Mobile */}
        <div className="hidden lg:flex w-80 bg-white border-r border-gray-200 flex-col h-full animate-in slide-in-from-left duration-800 delay-300">
          {/* Scrollable Data Layers Section - Limited Height */}
          <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-6 transition-transform duration-300 hover:scale-105" style={{ color: '#141414' }}>
                Data Layers
              </h2>
              
              <div className="space-y-4">
                {dataLayers.map((layer, index) => (
                  <div
                    key={layer.id}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer hover:scale-[1.02] transform animate-in slide-in-from-left delay-${(index + 1) * 100} ${
                      activeLayers.includes(layer.id) 
                        ? 'border-opacity-100 shadow-lg' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ 
                      borderColor: activeLayers.includes(layer.id) ? layer.color : undefined,
                      backgroundColor: activeLayers.includes(layer.id) ? `${layer.color}10` : 'white',
                      animationDelay: `${600 + (index * 100)}ms`
                    }}
                    onClick={() => toggleLayer(layer.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl transition-transform duration-300 hover:scale-110 hover:rotate-12">
                          {layer.icon}
                        </span>
                        <div>
                          <h3 className="font-semibold transition-colors duration-300 hover:opacity-80" style={{ color: '#141414' }}>
                            {layer.name}
                          </h3>
                        </div>
                      </div>
                      <div 
                        className={`w-5 h-5 rounded-full border-2 transition-all duration-300 hover:scale-110 ${
                          activeLayers.includes(layer.id) 
                            ? 'bg-current border-current' 
                            : 'border-gray-300'
                        }`}
                        style={{ 
                          color: activeLayers.includes(layer.id) ? layer.color : undefined 
                        }}
                      >
                        {activeLayers.includes(layer.id) && (
                          <div className="w-full h-full flex items-center justify-center animate-in zoom-in duration-200">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm opacity-80 transition-opacity duration-300 hover:opacity-100" style={{ color: '#141414' }}>
                      {layer.description}
                    </p>
                    {activeLayers.includes(layer.id) && (
                      <div className="mt-3 pt-3 border-t border-gray-200 animate-in slide-in-from-bottom duration-300">
                        <div className="flex items-center justify-between text-xs">
                          <span style={{ color: layer.color }} className="font-medium transition-all duration-300 hover:scale-105">
                            ● Active
                          </span>
                          <span className="opacity-60 transition-opacity duration-300 hover:opacity-90" style={{ color: '#141414' }}>
                            Real-time data
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Fixed Controls at Bottom - Guaranteed Space */}
          <div className="border-t border-gray-200 p-4 bg-white animate-in slide-in-from-bottom duration-800 delay-1000 flex-shrink-0" style={{ minHeight: '140px' }}>
            <div className="space-y-3">
              <button
                onClick={() => setActiveLayers(dataLayers.map(l => l.id))}
                className="w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-lg transform"
                style={{ backgroundColor: '#C1F21D', color: '#141414' }}
              >
                Enable All Layers
              </button>
              <button
                onClick={() => setActiveLayers([])}
                className="w-full px-4 py-3 rounded-lg text-sm font-medium border-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg transform hover:bg-gray-50"
                style={{ borderColor: '#141414', color: '#141414' }}
              >
                Clear All Layers
              </button>
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative animate-in slide-in-from-right duration-800 delay-500">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
            {/* Map Placeholder */}
            <div className="text-center max-w-md mx-auto p-8 animate-in fade-in duration-1000 delay-800">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center text-4xl transition-all duration-300 hover:scale-110 hover:rotate-12 transform" style={{ backgroundColor: '#FFFEEB' }}>
                🗺️
              </div>
              <h3 className="text-2xl font-bold mb-4 transition-transform duration-300 hover:scale-105" style={{ color: '#141414' }}>
                Interactive Map Coming Soon
              </h3>
              <p className="text-lg opacity-80 mb-6 transition-opacity duration-300 hover:opacity-100" style={{ color: '#141414' }}>
                Our <Highlight>privacy-first</Highlight> geotrack visualization will display here once backend integration is complete.
              </p>
              <div className="space-y-3 text-sm opacity-60" style={{ color: '#141414' }}>
                <div className="flex items-center justify-center space-x-2 transition-all duration-300 hover:opacity-100 hover:scale-105 transform">
                  <span>🔐</span>
                  <span>Fully anonymized data processing</span>
                </div>
                <div className="flex items-center justify-center space-x-2 transition-all duration-300 hover:opacity-100 hover:scale-105 transform">
                  <span>⚡</span>
                  <span>Real-time analytics engine</span>
                </div>
                <div className="flex items-center justify-center space-x-2 transition-all duration-300 hover:opacity-100 hover:scale-105 transform">
                  <span>🎯</span>
                  <span>Advanced pattern recognition</span>
                </div>
              </div>
            </div>

            {/* Active Layers Overlay */}
            {activeLayers.length > 0 && (
              <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs animate-in slide-in-from-top duration-500 delay-1000 hidden lg:block">
                <h4 className="font-semibold mb-2 transition-colors duration-300 hover:opacity-80" style={{ color: '#141414' }}>
                  Active Data Layers
                </h4>
                <div className="space-y-2">
                  {dataLayers
                    .filter(layer => activeLayers.includes(layer.id))
                    .map((layer, index) => (
                      <div key={layer.id} className="flex items-center space-x-2 text-sm transition-all duration-300 hover:scale-105 transform" style={{ animationDelay: `${1200 + (index * 100)}ms` }}>
                        <div 
                          className="w-3 h-3 rounded-full transition-transform duration-300 hover:scale-125" 
                          style={{ backgroundColor: layer.color }}
                        ></div>
                        <span className="transition-opacity duration-300 hover:opacity-80" style={{ color: '#141414' }}>{layer.name}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Mobile Bottom Panel */}
            <div className="lg:hidden absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
              {/* Mobile Data Layers Toggle Button */}
              <div className="p-4 border-b border-gray-200">
                <button
                  onClick={() => setIsMobileLayersOpen(!isMobileLayersOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg transition-all duration-300 hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">📊</span>
                    <span className="font-medium" style={{ color: '#141414' }}>
                      Data Layers ({activeLayers.length} active)
                    </span>
                  </div>
                  <svg 
                    className={`w-5 h-5 transition-transform duration-300 ${isMobileLayersOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    style={{ color: '#141414' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Mobile Data Layers Panel */}
              {isMobileLayersOpen && (
                <div className="max-h-80 overflow-y-auto animate-in slide-in-from-bottom duration-300">
                  <div className="p-4 space-y-3">
                    {/* Quick Controls */}
                    <div className="flex space-x-2 mb-4">
                      <button
                        onClick={() => setActiveLayers(dataLayers.map(l => l.id))}
                        className="flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 hover:scale-[1.02]"
                        style={{ backgroundColor: '#C1F21D', color: '#141414' }}
                      >
                        Enable All
                      </button>
                      <button
                        onClick={() => setActiveLayers([])}
                        className="flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-300 hover:scale-[1.02] hover:bg-gray-50"
                        style={{ borderColor: '#141414', color: '#141414' }}
                      >
                        Clear All
                      </button>
                    </div>

                    {/* Compact Layer List */}
                    {dataLayers.map((layer) => (
                      <button
                        key={layer.id}
                        onClick={() => toggleLayer(layer.id)}
                        className={`w-full p-3 rounded-lg border-2 transition-all duration-300 text-left ${
                          activeLayers.includes(layer.id) 
                            ? 'border-opacity-100 shadow-sm' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{ 
                          borderColor: activeLayers.includes(layer.id) ? layer.color : undefined,
                          backgroundColor: activeLayers.includes(layer.id) ? `${layer.color}15` : 'white'
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">{layer.icon}</span>
                            <div>
                              <h4 className="text-sm font-semibold" style={{ color: '#141414' }}>
                                {layer.name}
                              </h4>
                              <p className="text-xs opacity-70" style={{ color: '#141414' }}>
                                {layer.description}
                              </p>
                            </div>
                          </div>
                          <div 
                            className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                              activeLayers.includes(layer.id) 
                                ? 'bg-current border-current' 
                                : 'border-gray-300'
                            }`}
                            style={{ 
                              color: activeLayers.includes(layer.id) ? layer.color : undefined 
                            }}
                          >
                            {activeLayers.includes(layer.id) && (
                              <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}