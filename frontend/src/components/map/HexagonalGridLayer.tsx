import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { DemandHexagon, AvailabilityHexagon } from '../../types/mapTypes';

interface HexagonalGridLayerProps<T> {
  data: T[];
  isActive: boolean;
  onHexagonClick?: (hexagon: T) => void;
  getPopupContent: (hexagon: T) => string;
}

function HexagonalGridLayer<T extends { boundary: [number, number][]; color: string; hex_id: string }>({ 
  data, 
  isActive, 
  onHexagonClick,
  getPopupContent 
}: HexagonalGridLayerProps<T>) {
  const map = useMap();
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!map) return;

    // Create layer group if it doesn't exist
    if (!layerGroupRef.current) {
      layerGroupRef.current = L.layerGroup();
    }

    // Clear existing hexagons
    layerGroupRef.current.clearLayers();

    // Add hexagons to the layer group
    if (data && data.length > 0) {
      data.forEach((hexagon, index) => {
        try {
          // Create polygon from boundary coordinates
          const polygon = L.polygon(hexagon.boundary, {
            color: hexagon.color,
            fillColor: hexagon.color,
            fillOpacity: 0.6,
            weight: 1,
            opacity: 0.8
          });

          // Add popup
          const popupContent = getPopupContent(hexagon);
          polygon.bindPopup(popupContent);

          // Add click handler if provided
          if (onHexagonClick) {
            polygon.on('click', () => onHexagonClick(hexagon));
          }

          // Add to layer group
          layerGroupRef.current!.addLayer(polygon);
        } catch (error) {
          console.error(`Error creating hexagon ${index}:`, error);
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
  }, [map, data, isActive, onHexagonClick, getPopupContent]);

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

// Specialized component for demand heatmaps
interface DemandLayerProps {
  data: DemandHexagon[];
  isActive: boolean;
  onHexagonClick?: (hexagon: DemandHexagon) => void;
}

export function DemandLayer({ data, isActive, onHexagonClick }: DemandLayerProps) {
  const getPopupContent = (hexagon: DemandHexagon): string => {
    return `
      <div class="p-2">
        <div class="font-bold text-lg mb-2">📊 Demand Hexagon</div>
        <div class="space-y-1 text-sm">
          <div><strong>Demand Level:</strong> ${hexagon.demand_level}</div>
          <div><strong>Drivers:</strong> ${hexagon.drivers}</div>
          <div><strong>Records:</strong> ${hexagon.records}</div>
          <div><strong>H3 ID:</strong> <code class="text-xs">${hexagon.hex_id}</code></div>
        </div>
      </div>
    `;
  };

  return (
    <HexagonalGridLayer
      data={data}
      isActive={isActive}
      onHexagonClick={onHexagonClick}
      getPopupContent={getPopupContent}
    />
  );
}

// Specialized component for driver availability with anomaly detection
interface AvailabilityLayerProps {
  data: AvailabilityHexagon[];
  isActive: boolean;
  onHexagonClick?: (hexagon: AvailabilityHexagon) => void;
}

export function AvailabilityLayer({ data, isActive, onHexagonClick }: AvailabilityLayerProps) {
  const map = useMap();
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!map) return;

    // Create layer group if it doesn't exist
    if (!layerGroupRef.current) {
      layerGroupRef.current = L.layerGroup();
    }

    // Clear existing hexagons
    layerGroupRef.current.clearLayers();

    // Add hexagons with anomaly styling
    if (data && data.length > 0) {
      data.forEach((hexagon, index) => {
        try {
          // Create polygon with special styling for anomalies
          const polygon = L.polygon(hexagon.boundary, {
            color: hexagon.is_anomaly ? '#FF0000' : hexagon.color, // Red border for anomalies
            fillColor: hexagon.color,
            fillOpacity: 0.7,
            weight: hexagon.is_anomaly ? 4 : 1, // Thicker border for anomalies
            opacity: hexagon.is_anomaly ? 1.0 : 0.8,
            dashArray: hexagon.is_anomaly ? '10,5' : undefined // Dashed border for anomalies
          });

          // Enhanced popup for availability with anomaly info
          const popupContent = `
            <div class="p-2">
              <div class="font-bold text-lg mb-2">🟢 Driver Availability Hexagon</div>
              ${hexagon.is_anomaly ? '<div class="text-red-600 font-bold mb-2">⚠️ ANOMALY DETECTED!</div>' : ''}
              <div class="space-y-1 text-sm">
                <div><strong>Availability Level:</strong> ${hexagon.availability_level}</div>
                <div><strong>Available Drivers:</strong> ${hexagon.drivers}</div>
                <div><strong>Records:</strong> ${hexagon.records}</div>
                ${hexagon.is_anomaly ? '<div class="text-red-600 font-bold">Excessive driver concentration!</div>' : ''}
                <div><strong>H3 ID:</strong> <code class="text-xs">${hexagon.hex_id}</code></div>
              </div>
            </div>
          `;

          polygon.bindPopup(popupContent);

          // Add click handler if provided
          if (onHexagonClick) {
            polygon.on('click', () => onHexagonClick(hexagon));
          }

          // Add to layer group
          layerGroupRef.current!.addLayer(polygon);
        } catch (error) {
          console.error(`Error creating availability hexagon ${index}:`, error);
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
  }, [map, data, isActive, onHexagonClick]);

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