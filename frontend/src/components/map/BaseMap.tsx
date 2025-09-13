import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapStyles.css';
import { useMap as useMapContext } from '../../contexts/MapContext';

// Fix for default markers in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle map bounds and initialization
function MapController() {
  const map = useMap();
  const { analysisData } = useMapContext();

  useEffect(() => {
    if (!analysisData || !map) return;

    const bounds = analysisData.metadata.bounds;
    
    // Set map bounds based on data
    const leafletBounds = L.latLngBounds(
      [bounds.lat_min, bounds.lng_min],
      [bounds.lat_max, bounds.lng_max]
    );
    
    map.fitBounds(leafletBounds, {
      padding: [20, 20],
      maxZoom: 15,
    });
  }, [analysisData, map]);

  return null;
}

interface BaseMapProps {
  children?: React.ReactNode;
  className?: string;
}

export function BaseMap({ children, className = '' }: BaseMapProps) {
  const { analysisData, isLoading, error } = useMapContext();
  const mapRef = useRef<L.Map | null>(null);

  // Default center (Almaty coordinates)
  const defaultCenter: [number, number] = [51.0914, 71.4173];
  const defaultZoom = 12;

  // Calculate center from data if available
  const center: [number, number] = analysisData 
    ? [analysisData.metadata.bounds.center_lat, analysisData.metadata.bounds.center_lng]
    : defaultCenter;

  // Loading state
  if (isLoading) {
    return (
      <div className={`relative bg-gray-100 ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading map data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`relative bg-red-50 border-2 border-red-200 ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center max-w-md px-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to Load Map Data</h3>
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={center}
        zoom={defaultZoom}
        className="h-full w-full"
        ref={mapRef}
        zoomControl={true}
        attributionControl={true}
        style={{ height: '100%', width: '100%' }}
      >
        {/* Base tile layer */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={18}
        />
        
        {/* Map controller for bounds management */}
        <MapController />
        
        {/* Layer components will be rendered here */}
        {children}
      </MapContainer>
      
      {/* Map attribution overlay */}
      <div className="absolute bottom-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs text-gray-600 pointer-events-none">
        Taxi Analysis Visualization
      </div>
    </div>
  );
}