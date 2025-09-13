import { useMemo, useCallback } from 'react';
import { useMap } from '../contexts/MapContext';
import type { AnalysisLayers } from '../types/mapTypes';

/**
 * Custom hook for managing map layers with performance optimizations
 */
export function useMapLayers() {
  const {
    activeLayers,
    toggleLayer,
    setActiveLayers,
    enableAllLayers,
    clearAllLayers,
    getActiveLayerCount,
    analysisData,
    isLoading,
    error
  } = useMap();

  // Memoized layer data to prevent unnecessary re-renders
  const layersWithData = useMemo(() => {
    if (!analysisData) return [];

    const layers = analysisData.layers;
    
    return Object.entries(layers).map(([id, data]) => {
      let count = 0;
      let hasData = false;

      if (Array.isArray(data)) {
        count = data.length;
        hasData = data.length > 0;
      } else if (data && typeof data === 'object') {
        if ('points' in data && Array.isArray(data.points)) {
          count = data.points.length;
          hasData = data.points.length > 0;
        } else if ('hexagons' in data && Array.isArray(data.hexagons)) {
          count = data.hexagons.length;
          hasData = data.hexagons.length > 0;
        }
      }

      return {
        id,
        data,
        count,
        hasData,
        isActive: activeLayers.includes(id)
      };
    }).filter(layer => layer.hasData);
  }, [analysisData, activeLayers]);

  // Memoized available layer IDs
  const availableLayerIds = useMemo(() => {
    return layersWithData.map(layer => layer.id);
  }, [layersWithData]);

  // Performance-optimized layer toggle with batching
  const toggleLayerOptimized = useCallback((layerId: string) => {
    // Batch state updates to prevent excessive re-renders
    requestAnimationFrame(() => {
      toggleLayer(layerId);
    });
  }, [toggleLayer]);

  // Bulk operations with performance considerations
  const enableLayersWithLimit = useCallback((layerIds: string[], maxConcurrent = 3) => {
    // Limit concurrent layers to prevent performance issues
    const layersToEnable = layerIds.slice(0, maxConcurrent);
    setActiveLayers(layersToEnable);
  }, [setActiveLayers]);

  // Smart layer management based on zoom level or viewport
  const getRecommendedLayers = useCallback((zoomLevel?: number) => {
    if (!layersWithData.length) return [];

    // Default recommendations
    let recommended = ['routes'];

    if (zoomLevel) {
      if (zoomLevel > 12) {
        recommended = [...recommended, 'demand', 'availability'];
      }
      if (zoomLevel > 14) {
        recommended = [...recommended, 'violations', 'traffic_jams'];
      }
      if (zoomLevel > 16) {
        recommended = [...recommended, 'anomalies'];
      }
    }

    return recommended.filter(id => availableLayerIds.includes(id));
  }, [layersWithData, availableLayerIds]);

  // Layer statistics for UI display
  const layerStats = useMemo(() => {
    return layersWithData.reduce((stats, layer) => {
      stats[layer.id] = {
        count: layer.count,
        isActive: layer.isActive,
        hasData: layer.hasData
      };
      return stats;
    }, {} as Record<string, { count: number; isActive: boolean; hasData: boolean }>);
  }, [layersWithData]);

  // Performance metrics
  const performanceStats = useMemo(() => {
    const totalDataPoints = layersWithData.reduce((total, layer) => total + layer.count, 0);
    const activeDataPoints = layersWithData
      .filter(layer => layer.isActive)
      .reduce((total, layer) => total + layer.count, 0);

    return {
      totalLayers: layersWithData.length,
      activeLayers: getActiveLayerCount(),
      totalDataPoints,
      activeDataPoints,
      memoryUsageEstimate: Math.round(activeDataPoints * 0.1) // Rough estimate in KB
    };
  }, [layersWithData, getActiveLayerCount]);

  return {
    // Layer data
    layersWithData,
    availableLayerIds,
    layerStats,
    
    // Layer controls
    activeLayers,
    toggleLayer: toggleLayerOptimized,
    setActiveLayers,
    enableAllLayers,
    clearAllLayers,
    enableLayersWithLimit,
    
    // Smart recommendations
    getRecommendedLayers,
    
    // Performance metrics
    performanceStats,
    
    // State
    isLoading,
    error,
    hasData: layersWithData.length > 0
  };
}

/**
 * Hook for layer-specific data with performance optimizations
 */
export function useOptimizedLayerData<T = any>(layerId: keyof AnalysisLayers, options?: {
  enableCaching?: boolean;
  sampleSize?: number;
}) {
  const { getLayerData, isLayerActive } = useMap();
  const { enableCaching = true, sampleSize } = options || {};

  const layerData = useMemo(() => {
    const data = getLayerData<T>(layerId);
    
    if (!data) return null;

    // Apply sampling for large datasets if specified
    if (sampleSize && Array.isArray(data)) {
      return data.slice(0, sampleSize) as T;
    }
    
    if (sampleSize && typeof data === 'object' && 'points' in data && Array.isArray(data.points)) {
      return {
        ...data,
        points: data.points.slice(0, sampleSize)
      } as T;
    }

    return data;
  }, [getLayerData, layerId, sampleSize]);

  const isActive = isLayerActive(layerId);

  return {
    data: layerData,
    isActive,
    isAvailable: !!layerData,
    isSampled: sampleSize ? true : false
  };
}