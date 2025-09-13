// TypeScript interfaces for taxi analysis data structure and map components

export interface GeoBounds {
  lat_min: number;
  lat_max: number;
  lng_min: number;
  lng_max: number;
  center_lat: number;
  center_lng: number;
}

export interface AnalysisMetadata {
  total_records: number;
  unique_drivers: number;
  bounds: GeoBounds;
  analysis_timestamp: string;
}

// Coordinate point for heatmaps: [lat, lng, intensity]
export type HeatmapPoint = [number, number, number];

// Base layer interface
export interface LayerData {
  type: string;
}

// Popular Routes Layer
export interface RoutesLayerData extends LayerData {
  type: 'heatmap';
  points: HeatmapPoint[];
}

// Hexagonal Grid Base
export interface HexagonData {
  hex_id: string;
  boundary: [number, number][]; // Array of [lat, lng] coordinates
  color: string;
  records: number;
}

// Demand Heatmaps Layer
export interface DemandHexagon extends HexagonData {
  demand_level: string;
  drivers: number;
}

export interface DemandLayerData extends LayerData {
  type: 'hexagonal_grid';
  hexagons: DemandHexagon[];
}

// Driver Distribution Layer
export interface AvailabilityHexagon extends HexagonData {
  availability_level: string;
  drivers: number;
  is_anomaly: boolean;
}

export interface AvailabilityLayerData extends LayerData {
  type: 'hexagonal_grid';
  hexagons: AvailabilityHexagon[];
}

// Speed Violations Layer
export interface SpeedViolation {
  lat: number;
  lng: number;
  speed: number;
  excess: number;
  driver_id: string;
}

export type ViolationsLayerData = SpeedViolation[];

// Unusual Trips Layer
export interface AnomalyTrip {
  lat: number;
  lng: number;
  type: 'speed' | 'geographic' | 'altitude';
  description: string;
  driver_id: string;
}

export type AnomaliesLayerData = AnomalyTrip[];

// Traffic Jams Layer
export interface TrafficJam {
  lat: number;
  lng: number;
  severity: 'low' | 'medium' | 'high' | 'severe';
  color: string;
  radius: number;
  drivers: number;
  avg_speed: number;
  records: number;
}

export type TrafficJamsLayerData = TrafficJam[];

// Speed Zones Layer
export interface SpeedZonesLayerData extends LayerData {
  type: 'speed_heatmap';
  points: HeatmapPoint[];
}

// Main analysis data structure
export interface AnalysisLayers {
  routes: RoutesLayerData;
  traffic_jams: TrafficJamsLayerData;
  demand: DemandLayerData;
  availability: AvailabilityLayerData;
  violations: ViolationsLayerData;
  speed_zones: SpeedZonesLayerData;
  anomalies: AnomaliesLayerData;
}

export interface TaxiAnalysisData {
  metadata: AnalysisMetadata;
  layers: AnalysisLayers;
}

// UI Layer Definition
export interface DataLayer {
  id: keyof AnalysisLayers;
  name: string;
  description: string;
  icon: string;
  color: string;
}

// Map component props
export interface MapComponentProps {
  data: TaxiAnalysisData;
  activeLayers: string[];
  onLayerToggle?: (layerId: string) => void;
}

// Layer component props
export interface LayerComponentProps<T = any> {
  data: T;
  isActive: boolean;
  color: string;
}

// Map context state
export interface MapContextState {
  analysisData: TaxiAnalysisData | null;
  activeLayers: string[];
  isLoading: boolean;
  error: string | null;
}

export interface MapContextActions {
  setAnalysisData: (data: TaxiAnalysisData) => void;
  toggleLayer: (layerId: string) => void;
  setActiveLayers: (layers: string[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export type MapContextValue = MapContextState & MapContextActions;