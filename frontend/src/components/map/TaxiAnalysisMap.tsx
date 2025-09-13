import React from 'react';
import { BaseMap } from './BaseMap';
import { PopularRoutesLayer, SpeedZonesLayer } from './HeatmapLayer';
import { DemandLayer, AvailabilityLayer } from './HexagonalGridLayer';
import { SpeedViolationsLayer, AnomaliesLayer, TrafficJamsLayer } from './PointMarkersLayer';
import { useLayerData } from '../../contexts/MapContext';

interface TaxiAnalysisMapProps {
  className?: string;
  activeLayers: string[];
}

export function TaxiAnalysisMap({ className, activeLayers }: TaxiAnalysisMapProps) {
  // Get layer data using custom hooks
  const routesLayer = useLayerData('routes');
  const demandLayer = useLayerData('demand');
  const availabilityLayer = useLayerData('availability');
  const violationsLayer = useLayerData('violations');
  const anomaliesLayer = useLayerData('anomalies');
  const trafficJamsLayer = useLayerData('traffic_jams');
  const speedZonesLayer = useLayerData('speed_zones');

  return (
    <BaseMap className={className}>
      {/* Popular Routes Heatmap Layer */}
      {routesLayer.data && (
        <PopularRoutesLayer
          data={routesLayer.data.points}
          isActive={activeLayers.includes('routes')}
        />
      )}

      {/* Speed Zones Heatmap Layer */}
      {speedZonesLayer.data && (
        <SpeedZonesLayer
          data={speedZonesLayer.data.points}
          isActive={activeLayers.includes('speed_zones')}
        />
      )}

      {/* Demand Hexagonal Grid Layer */}
      {demandLayer.data && (
        <DemandLayer
          data={demandLayer.data.hexagons}
          isActive={activeLayers.includes('demand')}
          onHexagonClick={(hexagon) => {
            console.log('Demand hexagon clicked:', hexagon);
          }}
        />
      )}

      {/* Driver Availability Hexagonal Grid Layer */}
      {availabilityLayer.data && (
        <AvailabilityLayer
          data={availabilityLayer.data.hexagons}
          isActive={activeLayers.includes('availability')}
          onHexagonClick={(hexagon) => {
            console.log('Availability hexagon clicked:', hexagon);
          }}
        />
      )}

      {/* Speed Violations Point Markers Layer */}
      {violationsLayer.data && (
        <SpeedViolationsLayer
          data={violationsLayer.data}
          isActive={activeLayers.includes('violations')}
          onViolationClick={(violation) => {
            console.log('Speed violation clicked:', violation);
          }}
        />
      )}

      {/* Unusual Trips Anomaly Markers Layer */}
      {anomaliesLayer.data && (
        <AnomaliesLayer
          data={anomaliesLayer.data}
          isActive={activeLayers.includes('anomalies')}
          onAnomalyClick={(anomaly) => {
            console.log('Anomaly clicked:', anomaly);
          }}
        />
      )}

      {/* Traffic Jams Circle Overlays Layer */}
      {trafficJamsLayer.data && (
        <TrafficJamsLayer
          data={trafficJamsLayer.data}
          isActive={activeLayers.includes('traffic_jams')}
          onJamClick={(jam) => {
            console.log('Traffic jam clicked:', jam);
          }}
        />
      )}
    </BaseMap>
  );
}