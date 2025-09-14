import type { TaxiAnalysisData } from '../types/mapTypes';

export class DataValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DataValidationError';
  }
}

export class DataService {
  private static instance: DataService;
  private cachedData: TaxiAnalysisData | null = null;

  private constructor() {}

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  /**
   * Load taxi analysis data from JSON file
   */
  public async loadAnalysisData(): Promise<TaxiAnalysisData> {
    if (this.cachedData) {
      return this.cachedData;
    }

    try {
      const response = await fetch('public/taxi_analysis_data.json');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const validatedData = this.validateData(data);
      
      this.cachedData = validatedData;
      return validatedData;
    } catch (error) {
      console.error('Error loading taxi analysis data:', error);
      throw new DataValidationError(`Failed to load analysis data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate the structure of loaded data
   */
  private validateData(data: any): TaxiAnalysisData {
    // Validate top-level structure
    if (!data || typeof data !== 'object') {
      throw new DataValidationError('Invalid data format: expected object');
    }

    if (!data.metadata || !data.layers) {
      throw new DataValidationError('Missing required fields: metadata or layers');
    }

    // Validate metadata
    this.validateMetadata(data.metadata);

    // Validate layers
    this.validateLayers(data.layers);

    return data as TaxiAnalysisData;
  }

  /**
   * Validate metadata structure
   */
  private validateMetadata(metadata: any): void {
    const requiredFields = ['total_records', 'unique_drivers', 'bounds', 'analysis_timestamp'];
    
    for (const field of requiredFields) {
      if (!(field in metadata)) {
        throw new DataValidationError(`Missing required metadata field: ${field}`);
      }
    }

    // Validate bounds
    const bounds = metadata.bounds;
    const requiredBoundsFields = ['lat_min', 'lat_max', 'lng_min', 'lng_max', 'center_lat', 'center_lng'];
    
    for (const field of requiredBoundsFields) {
      if (typeof bounds[field] !== 'number') {
        throw new DataValidationError(`Invalid bounds field: ${field} must be a number`);
      }
    }

    // Validate numeric fields
    if (typeof metadata.total_records !== 'number' || metadata.total_records < 0) {
      throw new DataValidationError('Invalid total_records: must be a non-negative number');
    }

    if (typeof metadata.unique_drivers !== 'number' || metadata.unique_drivers < 0) {
      throw new DataValidationError('Invalid unique_drivers: must be a non-negative number');
    }
  }

  /**
   * Validate layers structure
   */
  private validateLayers(layers: any): void {
    const requiredLayers = ['routes', 'traffic_jams', 'demand', 'availability', 'violations', 'speed_zones', 'anomalies'];
    
    for (const layerName of requiredLayers) {
      if (!(layerName in layers)) {
        console.warn(`Missing layer: ${layerName}`);
      }
    }

    // Validate specific layer structures
    if (layers.routes) {
      this.validateRoutesLayer(layers.routes);
    }

    if (layers.demand) {
      this.validateHexagonalLayer(layers.demand, 'demand');
    }

    if (layers.availability) {
      this.validateHexagonalLayer(layers.availability, 'availability');
    }

    if (layers.violations && Array.isArray(layers.violations)) {
      this.validateViolationsLayer(layers.violations);
    }

    if (layers.anomalies && Array.isArray(layers.anomalies)) {
      this.validateAnomaliesLayer(layers.anomalies);
    }

    if (layers.traffic_jams && Array.isArray(layers.traffic_jams)) {
      this.validateTrafficJamsLayer(layers.traffic_jams);
    }

    if (layers.speed_zones) {
      this.validateSpeedZonesLayer(layers.speed_zones);
    }
  }

  /**
   * Validate routes layer structure
   */
  private validateRoutesLayer(routesData: any): void {
    if (routesData.type !== 'heatmap') {
      throw new DataValidationError('Invalid routes layer: type must be "heatmap"');
    }

    if (!Array.isArray(routesData.points)) {
      throw new DataValidationError('Invalid routes layer: points must be an array');
    }

    // Validate sample points
    const sampleSize = Math.min(10, routesData.points.length);
    for (let i = 0; i < sampleSize; i++) {
      const point = routesData.points[i];
      if (!Array.isArray(point) || point.length !== 3) {
        throw new DataValidationError(`Invalid route point at index ${i}: must be [lat, lng, intensity]`);
      }
      
      if (typeof point[0] !== 'number' || typeof point[1] !== 'number' || typeof point[2] !== 'number') {
        throw new DataValidationError(`Invalid route point at index ${i}: all values must be numbers`);
      }
    }
  }

  /**
   * Validate hexagonal grid layers (demand/availability)
   */
  private validateHexagonalLayer(layerData: any, layerName: string): void {
    if (layerData.type !== 'hexagonal_grid') {
      throw new DataValidationError(`Invalid ${layerName} layer: type must be "hexagonal_grid"`);
    }

    if (!Array.isArray(layerData.hexagons)) {
      throw new DataValidationError(`Invalid ${layerName} layer: hexagons must be an array`);
    }

    // Validate sample hexagons
    const sampleSize = Math.min(5, layerData.hexagons.length);
    for (let i = 0; i < sampleSize; i++) {
      const hex = layerData.hexagons[i];
      
      if (!hex.hex_id || !Array.isArray(hex.boundary) || !hex.color) {
        throw new DataValidationError(`Invalid hexagon at index ${i}: missing required fields`);
      }
      
      if (typeof hex.records !== 'number') {
        throw new DataValidationError(`Invalid hexagon at index ${i}: records must be a number`);
      }
    }
  }

  /**
   * Validate violations layer
   */
  private validateViolationsLayer(violations: any[]): void {
    const sampleSize = Math.min(5, violations.length);
    for (let i = 0; i < sampleSize; i++) {
      const violation = violations[i];
      const requiredFields = ['lat', 'lng', 'speed', 'excess', 'driver_id'];
      
      for (const field of requiredFields) {
        if (!(field in violation)) {
          throw new DataValidationError(`Invalid violation at index ${i}: missing ${field}`);
        }
      }
      
      if (typeof violation.lat !== 'number' || typeof violation.lng !== 'number') {
        throw new DataValidationError(`Invalid violation at index ${i}: lat/lng must be numbers`);
      }
    }
  }

  /**
   * Validate anomalies layer
   */
  private validateAnomaliesLayer(anomalies: any[]): void {
    const sampleSize = Math.min(5, anomalies.length);
    for (let i = 0; i < sampleSize; i++) {
      const anomaly = anomalies[i];
      const requiredFields = ['lat', 'lng', 'type', 'description', 'driver_id'];
      
      for (const field of requiredFields) {
        if (!(field in anomaly)) {
          throw new DataValidationError(`Invalid anomaly at index ${i}: missing ${field}`);
        }
      }
      
      if (!['speed', 'geographic', 'altitude'].includes(anomaly.type)) {
        throw new DataValidationError(`Invalid anomaly at index ${i}: invalid type ${anomaly.type}`);
      }
    }
  }

  /**
   * Validate traffic jams layer
   */
  private validateTrafficJamsLayer(jams: any[]): void {
    const sampleSize = Math.min(5, jams.length);
    for (let i = 0; i < sampleSize; i++) {
      const jam = jams[i];
      const requiredFields = ['lat', 'lng', 'severity', 'color', 'radius'];
      
      for (const field of requiredFields) {
        if (!(field in jam)) {
          throw new DataValidationError(`Invalid traffic jam at index ${i}: missing ${field}`);
        }
      }
      
      if (!['low', 'medium', 'high', 'severe'].includes(jam.severity)) {
        throw new DataValidationError(`Invalid traffic jam at index ${i}: invalid severity ${jam.severity}`);
      }
    }
  }

  /**
   * Validate speed zones layer
   */
  private validateSpeedZonesLayer(speedZones: any): void {
    if (speedZones.type !== 'speed_heatmap') {
      throw new DataValidationError('Invalid speed_zones layer: type must be "speed_heatmap"');
    }

    if (!Array.isArray(speedZones.points)) {
      throw new DataValidationError('Invalid speed_zones layer: points must be an array');
    }
  }

  /**
   * Get layer metadata for UI display
   */
  public getLayerMetadata(): { [key: string]: { count: number; description: string } } {
    if (!this.cachedData) {
      return {};
    }

    const layers = this.cachedData.layers;
    
    return {
      routes: {
        count: layers.routes?.points?.length || 0,
        description: 'High-density taxi movement patterns'
      },
      demand: {
        count: layers.demand?.hexagons?.length || 0,
        description: 'Passenger demand zones with H3 hexagons'
      },
      availability: {
        count: layers.availability?.hexagons?.length || 0,
        description: 'Available driver locations with anomaly detection'
      },
      violations: {
        count: layers.violations?.length || 0,
        description: 'Speed limit violations (>60 km/h)'
      },
      anomalies: {
        count: layers.anomalies?.length || 0,
        description: 'Anomaly detection (speed, geographic, altitude)'
      },
      traffic_jams: {
        count: layers.traffic_jams?.length || 0,
        description: 'Congestion areas (top 30)'
      },
      speed_zones: {
        count: layers.speed_zones?.points?.length || 0,
        description: 'Speed pattern visualization'
      }
    };
  }

  /**
   * Clear cached data
   */
  public clearCache(): void {
    this.cachedData = null;
  }

  /**
   * Get cached data if available
   */
  public getCachedData(): TaxiAnalysisData | null {
    return this.cachedData;
  }
}

// Export singleton instance
export const dataService = DataService.getInstance();