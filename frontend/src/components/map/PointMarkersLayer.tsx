import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { SpeedViolation, AnomalyTrip, TrafficJam } from '../../types/mapTypes';

interface PointMarkersLayerProps<T> {
  data: T[];
  isActive: boolean;
  createMarker: (item: T) => L.Marker | L.Circle | L.LayerGroup;
  onMarkerClick?: (item: T) => void;
}

function PointMarkersLayer<T>({ 
  data, 
  isActive, 
  createMarker,
  onMarkerClick 
}: PointMarkersLayerProps<T>) {
  const map = useMap();
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!map) return;

    // Create layer group if it doesn't exist
    if (!layerGroupRef.current) {
      layerGroupRef.current = L.layerGroup();
    }

    // Clear existing markers
    layerGroupRef.current.clearLayers();

    // Add markers to the layer group
    if (data && data.length > 0) {
      data.forEach((item, index) => {
        try {
          const marker = createMarker(item);

          // Add click handler if provided
          if (onMarkerClick) {
            marker.on('click', () => onMarkerClick(item));
          }

          // Add to layer group
          layerGroupRef.current!.addLayer(marker);
        } catch (error) {
          console.error(`Error creating marker ${index}:`, error);
        }
      });
    }

    // Add or remove layer group based on isActive
    if (isActive && layerGroupRef.current) {
      if (!map.hasLayer(layerGroupRef.current)) {
        map.addLayer(layerGroupRef.current);
      }
    } else if (layerGroupRef.current) {
      if (map.hasLayer(layerGroupRef.current)) {
        map.removeLayer(layerGroupRef.current);
      }
    }

    // Cleanup function
    return () => {
      if (layerGroupRef.current && map.hasLayer(layerGroupRef.current)) {
        map.removeLayer(layerGroupRef.current);
      }
    };
  }, [map, data, isActive, createMarker, onMarkerClick]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (layerGroupRef.current && map && map.hasLayer(layerGroupRef.current)) {
        map.removeLayer(layerGroupRef.current);
      }
    };
  }, [map]);

  return null;
}

// Speed Violations Layer
interface SpeedViolationsLayerProps {
  data: SpeedViolation[];
  isActive: boolean;
  onViolationClick?: (violation: SpeedViolation) => void;
}

export function SpeedViolationsLayer({ data, isActive, onViolationClick }: SpeedViolationsLayerProps) {
  const createViolationMarker = (violation: SpeedViolation): L.LayerGroup => {
    const layerGroup = L.layerGroup();

    // Create danger zone circle
    const dangerZone = L.circle([violation.lat, violation.lng], {
      color: 'red',
      fillColor: 'red',
      fillOpacity: 0.2,
      radius: 200,
      weight: 2
    });

    // Create violation marker
    const violationIcon = L.divIcon({
      html: '🚨',
      className: 'violation-marker',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    const marker = L.marker([violation.lat, violation.lng], {
      icon: violationIcon
    });

    // Add popup to marker
    const popupContent = `
      <div class="p-2">
        <div class="font-bold text-lg mb-2 text-red-600">🚨 SPEED VIOLATION</div>
        <div class="space-y-1 text-sm">
          <div><strong>Speed:</strong> ${violation.speed.toFixed(1)} km/h</div>
          <div><strong>Legal Limit:</strong> 60 km/h</div>
          <div class="text-red-600"><strong>Excess:</strong> ${violation.excess.toFixed(1)} km/h</div>
          <div><strong>Driver:</strong> ${violation.driver_id}</div>
        </div>
      </div>
    `;

    marker.bindPopup(popupContent);

    // Add both to layer group
    layerGroup.addLayer(dangerZone);
    layerGroup.addLayer(marker);

    return layerGroup as any; // Type assertion for compatibility
  };

  return (
    <PointMarkersLayer
      data={data}
      isActive={isActive}
      createMarker={createViolationMarker}
      onMarkerClick={onViolationClick}
    />
  );
}

// Unusual Trips (Anomalies) Layer
interface AnomaliesLayerProps {
  data: AnomalyTrip[];
  isActive: boolean;
  onAnomalyClick?: (anomaly: AnomalyTrip) => void;
}

export function AnomaliesLayer({ data, isActive, onAnomalyClick }: AnomaliesLayerProps) {
  const iconMap = {
    speed: '📊',
    geographic: '📍',
    altitude: '⛰️'
  };

  const createAnomalyMarker = (anomaly: AnomalyTrip): L.Marker => {
    const icon = iconMap[anomaly.type] || '❓';
    
    const anomalyIcon = L.divIcon({
      html: icon,
      className: 'anomaly-marker',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    const marker = L.marker([anomaly.lat, anomaly.lng], {
      icon: anomalyIcon
    });

    // Add popup
    const popupContent = `
      <div class="p-2">
        <div class="font-bold text-lg mb-2">🔍 ${anomaly.type.toUpperCase()} Anomaly</div>
        <div class="space-y-1 text-sm">
          <div class="mb-2">${anomaly.description}</div>
          <div><strong>Driver:</strong> ${anomaly.driver_id}</div>
        </div>
      </div>
    `;

    marker.bindPopup(popupContent);

    return marker;
  };

  return (
    <PointMarkersLayer
      data={data}
      isActive={isActive}
      createMarker={createAnomalyMarker}
      onMarkerClick={onAnomalyClick}
    />
  );
}

// Traffic Jams Layer (Circle overlays)
interface TrafficJamsLayerProps {
  data: TrafficJam[];
  isActive: boolean;
  onJamClick?: (jam: TrafficJam) => void;
}

export function TrafficJamsLayer({ data, isActive, onJamClick }: TrafficJamsLayerProps) {
  const createJamMarker = (jam: TrafficJam): L.Circle => {
    const circle = L.circle([jam.lat, jam.lng], {
      color: jam.color,
      fillColor: jam.color,
      fillOpacity: 0.4,
      radius: jam.radius,
      weight: 2
    });

    // Add popup
    const popupContent = `
      <div class="p-2">
        <div class="font-bold text-lg mb-2">🚨 Traffic Jam</div>
        <div class="space-y-1 text-sm">
          <div><strong>Severity:</strong> <span class="uppercase font-medium">${jam.severity}</span></div>
          <div><strong>Drivers:</strong> ${jam.drivers}</div>
          <div><strong>Avg Speed:</strong> ${jam.avg_speed.toFixed(1)} km/h</div>
          <div><strong>Records:</strong> ${jam.records}</div>
        </div>
      </div>
    `;

    circle.bindPopup(popupContent);

    return circle;
  };

  return (
    <PointMarkersLayer
      data={data}
      isActive={isActive}
      createMarker={createJamMarker}
      onMarkerClick={onJamClick}
    />
  );
}