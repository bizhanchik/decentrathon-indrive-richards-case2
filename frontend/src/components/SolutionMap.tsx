import { useState } from 'react';
import { Highlight } from './Highlight';
import { TaxiAnalysisMap } from './map/TaxiAnalysisMap';
import { MapProvider, useMap, useLayerMetadata } from '../contexts/MapContext';

interface DataLayer {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

function SolutionMapContent() {
  const [isMobileLayersOpen, setIsMobileLayersOpen] = useState(false);
  const { 
    activeLayers, 
    toggleLayer, 
    enableAllLayers, 
    clearAllLayers, 
    isLoading, 
    error,
    analysisData 
  } = useMap();
  
  const layerMetadata = useLayerMetadata();
  
  // Updated data layers with correct IDs matching the analysis data
  const dataLayers: DataLayer[] = [
    {
      id: 'routes',
      name: 'Popular Routes',
      description: layerMetadata.routes?.description || 'Most frequently used transportation paths',
      icon: '🛣️',
      color: '#C1F21D'
    },
    {
      id: 'demand',
      name: 'Demand Visualization',
      description: layerMetadata.demand?.description || 'High-demand areas for transportation services',
      icon: '🔥',
      color: '#FF6B6B'
    },
    {
      id: 'availability',
      name: 'Driver Distribution',
      description: layerMetadata.availability?.description || 'Current driver availability across regions',
      icon: '🚗',
      color: '#4ECDC4'
    },
    {
      id: 'violations',
      name: 'Speed Violations',
      description: layerMetadata.violations?.description || 'Routes with excessive speed incidents',
      icon: '⚡',
      color: '#FF4757'
    },
    {
      id: 'anomalies',
      name: 'Unusual Trips',
      description: layerMetadata.anomalies?.description || 'Anomaly detection in travel patterns',
      icon: '⚠️',
      color: '#FFE66D'
    },
    {
      id: 'traffic_jams',
      name: 'Traffic Jams',
      description: layerMetadata.traffic_jams?.description || 'Congestion areas identification',
      icon: '🚦',
      color: '#E74C3C'
    },
    {
      id: 'speed_zones',
      name: 'Speed Zones',
      description: layerMetadata.speed_zones?.description || 'Speed pattern visualization',
      icon: '📈',
      color: '#9B59B6'
    }
  ];

  // Filter layers based on available data
  const availableLayers = dataLayers.filter(layer => {
    const layerData = analysisData?.layers[layer.id as keyof typeof analysisData.layers];
    if (!layerData) return false;
    
    // Check if it's an array (for violations, anomalies, traffic_jams)
    if (Array.isArray(layerData) && layerData.length > 0) {
      return true;
    }
    
    // Check if it has points property (for routes, speed_zones)
    if ('points' in layerData && layerData.points && layerData.points.length > 0) {
      return true;
    }
    
    // Check if it has hexagons property (for demand, availability)
    if ('hexagons' in layerData && layerData.hexagons && layerData.hexagons.length > 0) {
      return true;
    }
    
    return false;
  });

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
                {availableLayers.map((layer, index) => (
                  <div
                    key={layer.id}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer hover:scale-[1.02] transform animate-in slide-in-from-left ${
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
                onClick={enableAllLayers}
                className="w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-lg transform"
                style={{ backgroundColor: '#C1F21D', color: '#141414' }}
              >
                Enable All Layers
              </button>
              <button
                onClick={clearAllLayers}
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
          <>
            {/* Loading State */}
            {isLoading && (
            <div className="absolute inset-0 bg-gray-50 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#141414' }}>Loading Analysis Data</h3>
                <p className="text-sm opacity-70" style={{ color: '#141414' }}>Preparing taxi visualization layers...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="absolute inset-0 bg-red-50 flex items-center justify-center">
              <div className="text-center max-w-md mx-auto p-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 text-red-800">Data Loading Failed</h3>
                <p className="text-sm text-red-600 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reload Page
                </button>
              </div>
            </div>
          )}

          {/* Success State - Real Map */}
          {!isLoading && !error && analysisData && (
            <TaxiAnalysisMap 
              className="h-full w-full" 
              activeLayers={activeLayers}
            />
          )}

          {/* Fallback State */}
          {!isLoading && !error && !analysisData && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
              <div className="text-center max-w-md mx-auto p-8 animate-in fade-in duration-1000 delay-800">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center text-4xl transition-all duration-300 hover:scale-110 hover:rotate-12 transform" style={{ backgroundColor: '#FFFEEB' }}>
                  🗺️
                </div>
                <h3 className="text-2xl font-bold mb-4 transition-transform duration-300 hover:scale-105" style={{ color: '#141414' }}>
                  No Analysis Data Available
                </h3>
                <p className="text-lg opacity-80 mb-6 transition-opacity duration-300 hover:opacity-100" style={{ color: '#141414' }}>
                  Our <Highlight>privacy-first</Highlight> taxi analysis system is ready to visualize data.
                </p>
              </div>
            </div>
          )}

          {/* Active Layers Overlay */}
          {activeLayers.length > 0 && analysisData && (
            <div className="active-layers-overlay absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs animate-in slide-in-from-top duration-500 delay-1000 hidden lg:block" style={{ zIndex: 1000 }}>
                <h4 className="font-semibold mb-2 transition-colors duration-300 hover:opacity-80" style={{ color: '#141414' }}>
                  Active Data Layers
                </h4>
                <div className="space-y-2">
                  {availableLayers
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

          {/* Current Layer Legend - Bottom Right */}
          {activeLayers.length > 0 && analysisData && (
            <div className="layer-legend absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm hidden lg:block" style={{ zIndex: 1000 }}>
              <h4 className="font-semibold mb-2 transition-colors duration-300 hover:opacity-80" style={{ color: '#141414' }}>
                Current Layer Description
              </h4>
              <div className="space-y-2">
                {availableLayers
                  .filter(layer => activeLayers.includes(layer.id))
                  .map((layer) => {
                    // Get layer-specific descriptions
                    const getLayerDescription = (layerId: string) => {
                      switch (layerId) {
                        case 'routes':
                          return 'Most frequently used transportation paths (heatmap)';
                        case 'demand':
                          return 'High-demand areas for transportation services';
                        case 'availability':
                          return 'Current driver availability across regions';
                        case 'violations':
                          return 'Speed limit violations (>60 km/h)';
                        case 'anomalies':
                          return 'Unusual trip patterns and anomalies';
                        case 'traffic_jams':
                          return 'Traffic congestion areas';
                        case 'speed_zones':
                          return 'Speed pattern visualization (heatmap)';
                        default:
                          return layer.description;
                      }
                    };

                    return (
                      <div key={layer.id} className="layer-legend-item flex items-start space-x-3 transition-all duration-300 hover:scale-105 transform">
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <div 
                            className="w-4 h-4 rounded-sm flex-shrink-0" 
                            style={{ backgroundColor: layer.color }}
                          ></div>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm transition-colors duration-300 hover:opacity-80" style={{ color: '#141414' }}>
                            {layer.name}
                          </div>
                          <div className="text-xs mt-1 transition-colors duration-300 hover:opacity-90" style={{ color: '#141414', opacity: 0.8 }}>
                            {getLayerDescription(layer.id)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
              
              {/* Data info */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-xs transition-colors duration-300 hover:opacity-90" style={{ color: '#141414', opacity: 0.6 }}>
                  Total Records: {analysisData.metadata.total_records.toLocaleString()}
                </div>
                <div className="text-xs transition-colors duration-300 hover:opacity-90" style={{ color: '#141414', opacity: 0.6 }}>
                  Active Layers: {activeLayers.length} of {availableLayers.length}
                </div>
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
                        onClick={enableAllLayers}
                        className="flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 hover:scale-[1.02]"
                        style={{ backgroundColor: '#C1F21D', color: '#141414' }}
                      >
                        Enable All
                      </button>
                      <button
                        onClick={clearAllLayers}
                        className="flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-300 hover:scale-[1.02] hover:bg-gray-50"
                        style={{ borderColor: '#141414', color: '#141414' }}
                      >
                        Clear All
                      </button>
                    </div>

                    {/* Compact Layer List */}
                    {availableLayers.map((layer) => (
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
          </>
        </div>
      </div>
    </div>
  );
}

export function SolutionMap() {
  return (
    <MapProvider>
      <SolutionMapContent />
    </MapProvider>
  );
}