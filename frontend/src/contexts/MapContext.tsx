import React, { createContext, useContext, useReducer, useCallback, useEffect, ReactNode } from 'react';
import type { TaxiAnalysisData, MapContextValue, AnalysisLayers } from '../types/mapTypes';
import { dataService, DataValidationError } from '../services/dataService';

// Action types
type MapAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ANALYSIS_DATA'; payload: TaxiAnalysisData }
  | { type: 'TOGGLE_LAYER'; payload: string }
  | { type: 'SET_ACTIVE_LAYERS'; payload: string[] }
  | { type: 'CLEAR_DATA' };

// Initial state
interface MapState {
  analysisData: TaxiAnalysisData | null;
  activeLayers: string[];
  isLoading: boolean;
  error: string | null;
}

const initialState: MapState = {
  analysisData: null,
  activeLayers: ['routes'], // Default to popular routes
  isLoading: false,
  error: null,
};

// Reducer
function mapReducer(state: MapState, action: MapAction): MapState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_ANALYSIS_DATA':
      return { 
        ...state, 
        analysisData: action.payload, 
        isLoading: false, 
        error: null 
      };
    
    case 'TOGGLE_LAYER':
      const layerId = action.payload;
      const isActive = state.activeLayers.includes(layerId);
      
      return {
        ...state,
        activeLayers: isActive 
          ? state.activeLayers.filter(id => id !== layerId)
          : [...state.activeLayers, layerId]
      };
    
    case 'SET_ACTIVE_LAYERS':
      return { ...state, activeLayers: action.payload };
    
    case 'CLEAR_DATA':
      return { ...initialState };
    
    default:
      return state;
  }
}

// Context
const MapContext = createContext<MapContextValue | undefined>(undefined);

// Provider component
interface MapProviderProps {
  children: ReactNode;
}

export function MapProvider({ children }: MapProviderProps) {
  const [state, dispatch] = useReducer(mapReducer, initialState);

  // Actions
  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const setAnalysisData = useCallback((data: TaxiAnalysisData) => {
    dispatch({ type: 'SET_ANALYSIS_DATA', payload: data });
  }, []);

  const toggleLayer = useCallback((layerId: string) => {
    // Validate layer exists in analysis data
    if (state.analysisData && !(layerId in state.analysisData.layers)) {
      console.warn(`Layer "${layerId}" does not exist in analysis data`);
      return;
    }
    
    dispatch({ type: 'TOGGLE_LAYER', payload: layerId });
  }, [state.analysisData]);

  const setActiveLayers = useCallback((layers: string[]) => {
    // Filter out invalid layer IDs
    const validLayers = state.analysisData 
      ? layers.filter(layerId => layerId in state.analysisData!.layers)
      : layers;
    
    if (validLayers.length !== layers.length) {
      console.warn('Some layer IDs were invalid and filtered out');
    }
    
    dispatch({ type: 'SET_ACTIVE_LAYERS', payload: validLayers });
  }, [state.analysisData]);

  const clearData = useCallback(() => {
    dispatch({ type: 'CLEAR_DATA' });
    dataService.clearCache();
  }, []);

  // Load data on mount
  const loadAnalysisData = useCallback(async () => {
    // Check if data is already cached
    const cachedData = dataService.getCachedData();
    if (cachedData) {
      setAnalysisData(cachedData);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await dataService.loadAnalysisData();
      setAnalysisData(data);
    } catch (error) {
      const errorMessage = error instanceof DataValidationError 
        ? error.message 
        : 'Failed to load taxi analysis data';
      
      console.error('Error loading analysis data:', error);
      setError(errorMessage);
    }
  }, [setAnalysisData, setLoading, setError]);

  // Auto-load data on mount
  useEffect(() => {
    loadAnalysisData();
  }, [loadAnalysisData]);

  // Helper functions for layer management
  const enableAllLayers = useCallback(() => {
    if (!state.analysisData) return;
    
    const allLayerIds = Object.keys(state.analysisData.layers);
    setActiveLayers(allLayerIds);
  }, [state.analysisData, setActiveLayers]);

  const clearAllLayers = useCallback(() => {
    setActiveLayers([]);
  }, [setActiveLayers]);

  const isLayerActive = useCallback((layerId: string): boolean => {
    return state.activeLayers.includes(layerId);
  }, [state.activeLayers]);

  const getLayerData = useCallback(<T = any>(layerId: keyof AnalysisLayers): T | null => {
    if (!state.analysisData) return null;
    
    return (state.analysisData.layers[layerId] as T) || null;
  }, [state.analysisData]);

  const getActiveLayerCount = useCallback((): number => {
    return state.activeLayers.length;
  }, [state.activeLayers]);

  // Context value
  const contextValue: MapContextValue = {
    // State
    analysisData: state.analysisData,
    activeLayers: state.activeLayers,
    isLoading: state.isLoading,
    error: state.error,
    
    // Actions
    setAnalysisData,
    toggleLayer,
    setActiveLayers,
    setLoading,
    setError,
    
    // Helper methods (extending the interface)
    ...{
      loadAnalysisData,
      clearData,
      enableAllLayers,
      clearAllLayers,
      isLayerActive,
      getLayerData,
      getActiveLayerCount,
    }
  };

  return (
    <MapContext.Provider value={contextValue}>
      {children}
    </MapContext.Provider>
  );
}

// Hook to use map context
export function useMap() {
  const context = useContext(MapContext);
  
  if (context === undefined) {
    throw new Error('useMap must be used within a MapProvider');
  }
  
  return context;
}

// Hook for specific layer data
export function useLayerData<T = any>(layerId: keyof AnalysisLayers) {
  const { analysisData, isLayerActive } = useMap();
  
  const data = analysisData?.layers[layerId] as T | undefined;
  const isActive = isLayerActive(layerId);
  
  return {
    data: data || null,
    isActive,
    isAvailable: !!data,
  };
}

// Hook for layer metadata
export function useLayerMetadata() {
  const { analysisData } = useMap();
  
  if (!analysisData) {
    return {};
  }
  
  return dataService.getLayerMetadata();
}