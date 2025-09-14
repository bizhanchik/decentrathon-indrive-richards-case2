import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import type { HeatmapPoint } from '../../types/mapTypes';

// Extend Leaflet types for heatLayer
declare module 'leaflet' {
  function heatLayer(latlngs: HeatmapPoint[], options?: any): any;
}

interface HeatmapLayerProps {
  data: HeatmapPoint[];
  options?: {
    radius?: number;
    blur?: number;
    maxZoom?: number;
    max?: number;
    gradient?: { [key: string]: string };
  };
  isActive: boolean;
}

export function HeatmapLayer({ data, options = {}, isActive }: HeatmapLayerProps) {
  const map = useMap();
  const heatLayerRef = useRef<L.Layer | null>(null);

  useEffect(() => {
    if (!map || !data || data.length === 0) return;

    // Default heatmap options
    const defaultOptions = {
      radius: 15,
      blur: 10,
      maxZoom: 17,
      max: 1.0,
      gradient: {
        0.0: 'blue',
        0.2: 'cyan',
        0.4: 'lime',
        0.6: 'yellow',
        0.8: 'orange',
        1.0: 'red'
      },
      ...options
    };

    // Create heatmap layer if it doesn't exist
    if (!heatLayerRef.current) {
      try {
        heatLayerRef.current = L.heatLayer(data, defaultOptions);
      } catch (error) {
        console.error('Error creating heatmap layer:', error);
        return;
      }
    }

    // Add or remove layer based on isActive
    if (isActive && heatLayerRef.current) {
      if (!map.hasLayer(heatLayerRef.current)) {
        map.addLayer(heatLayerRef.current);
      }
    } else if (heatLayerRef.current) {
      if (map.hasLayer(heatLayerRef.current)) {
        map.removeLayer(heatLayerRef.current);
      }
    }

    // Cleanup function
    return () => {
      if (heatLayerRef.current && map.hasLayer(heatLayerRef.current)) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [map, data, isActive, options]);

  // Update layer data when data changes
  useEffect(() => {
    if (heatLayerRef.current && data && data.length > 0) {
      // Remove old layer
      if (map.hasLayer(heatLayerRef.current)) {
        map.removeLayer(heatLayerRef.current);
      }
      
      // Create new layer with updated data
      const defaultOptions = {
        radius: 15,
        blur: 10,
        maxZoom: 17,
        max: 1.0,
        gradient: {
          0.0: 'blue',
          0.2: 'cyan',
          0.4: 'lime',
          0.6: 'yellow',
          0.8: 'orange',
          1.0: 'red'
        },
        ...options
      };

      try {
        heatLayerRef.current = L.heatLayer(data, defaultOptions);
        
        // Add back if should be active
        if (isActive && heatLayerRef.current) {
          map.addLayer(heatLayerRef.current);
        }
      } catch (error) {
        console.error('Error updating heatmap layer:', error);
      }
    }
  }, [data, options, isActive, map]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (heatLayerRef.current && map && map.hasLayer(heatLayerRef.current)) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [map]);

  return null;
}

// Specialized component for popular routes
interface PopularRoutesLayerProps {
  data: HeatmapPoint[];
  isActive: boolean;
}

export function PopularRoutesLayer({ data, isActive }: PopularRoutesLayerProps) {
  const routesOptions = {
    radius: 7,
    blur: 5,
    maxZoom: 17,
    max: 1.0,
    gradient: {
      0.0: 'blue',
      0.2: 'cyan', 
      0.4: 'lime',
      0.6: 'yellow',
      0.8: 'orange',
      1.0: 'red'
    }
  };

  return (
    <HeatmapLayer 
      data={data} 
      options={routesOptions} 
      isActive={isActive}
    />
  );
}

// Specialized component for speed zones
interface SpeedZonesLayerProps {
  data: HeatmapPoint[];
  isActive: boolean;
}

export function SpeedZonesLayer({ data, isActive }: SpeedZonesLayerProps) {
  const speedOptions = {
    radius: 7,
    blur: 3,
    maxZoom: 17,
    max: 0.4,
    gradient: {
      0.0: 'transparent',
      0.05: 'blue',
      0.15: 'cyan',
      0.25: 'lime', 
      0.35: 'yellow',
      0.4: 'red'
    }
  };

  return (
    <HeatmapLayer 
      data={data} 
      options={speedOptions} 
      isActive={isActive}
    />
  );
}