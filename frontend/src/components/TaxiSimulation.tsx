import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Polygon, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const ASTANA_CENTER: [number, number] = [51.111339, 71.415581];
const WS_URL = 'ws://localhost:8000/ws';

// Animation configuration
const TAXI_ANIMATION_SPEED = 200; // milliseconds between animation steps (higher = slower)

const createTaxiIcon = (color: string) => {
  const svg = `
    <svg width="32" height="32" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <path fill="${color}" d="M492.797,262.25h-22.109c-10.563,0-23.313-7.594-28.375-16.875l-36.406-67.094c-5.031-9.281-17.813-16.891-28.375-16.891H206.625c-10.563,0-24.5,6.828-30.953,15.203l-54.328,70.438c-6.469,8.375-20.391,15.219-30.938,15.219H60.531c-33.313,0-53.813,15.875-58.609,47.906L0,343.891c0,10.578,8.656,19.234,19.219,19.234H66.5c2.344,26.969,25.031,48.188,52.625,48.188c27.563,0,50.266-21.219,52.609-48.188h186.172c2.313,23.813,22.406,42.438,46.844,42.438s44.531-18.625,46.844-42.438h41.203c10.547,0,19.203-8.656,19.203-19.234v-62.422C512,270.891,503.344,262.25,492.797,262.25z M119.125,382.031c-13,0-23.547-10.531-23.547-23.531s10.547-23.531,23.547-23.531s23.531,10.531,23.531,23.531S132.125,382.031,119.125,382.031z M291.063,261.375H152.125l7.219-9.375l44.375-57.531c3.031-3.906,11.453-8.063,16.406-8.063h70.938V261.375z M314.125,261.375v-74.969h53.844c4.031,0,10.578,3.906,12.516,7.469l34.594,67.5H314.125z M404.75,382.031c-13,0-23.531-10.531-23.531-23.531s10.531-23.531,23.531-23.531s23.531,10.531,23.531,23.531S417.75,382.031,404.75,382.031z"/>
    </svg>
  `;
  return new L.Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svg)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

const ICONS = {
  freeTaxi: createTaxiIcon('#22c55e'),
  busyTaxi: createTaxiIcon('#ef4444'),
  pendingOrder: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
  }),
  assignedPickup: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
  }),
  dropoff: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
  })
};

interface Taxi {
  id: string;
  location: { lat: number; lng: number };
  status: 'free' | 'busy';
}

interface Order {
  id: string;
  pickup: { lat: number; lng: number };
  dropoff: { lat: number; lng: number };
  status: 'pending' | 'assigned' | 'completed';
}

interface Assignment {
  order_id: string;
  taxi_id: string;
  algorithm_used: string;
  to_pickup_route: { path: [number, number][] };
  to_dropoff_route: { path: [number, number][] };
}

interface DemandHexagon {
  hex_id: string;
  boundary: [number, number][];
  color: string;
  demand_level: string;
  orders_count: number;
  taxis_count: number;
  demand_ratio: number;
}

interface SimulationData {
  taxis: Taxi[];
  orders: Order[];
  assignments: Assignment[];
}

const Legend = React.memo(() => {
  const map = useMap();
  
  // useEffect(() => {
  //   const legend = L.control({ position: 'bottomright' });
  //   legend.onAdd = () => {
  //     const div = L.DomUtil.create('div', 'legend');
  //     div.style.cssText = 'background: white; padding: 10px; border: 2px solid #ccc; border-radius: 8px; font-family: Arial, sans-serif; max-width: 200px;';
  //     div.innerHTML = `
  //       <h4 style="margin: 0 0 8px 0; color: #333;">Legend</h4>
  //       <div style="display: flex; align-items: center; margin-bottom: 4px;">
  //         <div style="width: 20px; height: 20px; background: #22c55e; margin-right: 8px; border-radius: 2px;"></div>
  //         <span>Free Taxi</span>
  //       </div>
  //       <div style="display: flex; align-items: center; margin-bottom: 4px;">
  //         <div style="width: 20px; height: 20px; background: #ef4444; margin-right: 8px; border-radius: 2px;"></div>
  //         <span>Busy Taxi</span>
  //       </div>
  //       <div style="display: flex; align-items: center; margin-bottom: 4px;">
  //         <div style="width: 20px; height: 20px; background: #3b82f6; margin-right: 8px; border-radius: 2px;"></div>
  //         <span>Pending Order</span>
  //       </div>
  //       <div style="display: flex; align-items: center; margin-bottom: 4px;">
  //         <div style="width: 20px; height: 20px; background: #eab308; margin-right: 8px; border-radius: 2px;"></div>
  //         <span>Pickup Location</span>
  //       </div>
  //       <div style="display: flex; align-items: center; margin-bottom: 8px;">
  //         <div style="width: 20px; height: 20px; background: #8b5cf6; margin-right: 8px; border-radius: 2px;"></div>
  //         <span>Dropoff Location</span>
  //       </div>
  //       <hr style="margin: 8px 0; border: none; border-top: 1px solid #ddd;">
  //       <h5 style="margin: 4px 0; color: #333; font-size: 12px;">Demand Level</h5>
  //       <div style="display: flex; align-items: center; margin-bottom: 2px;">
  //         <div style="width: 16px; height: 16px; background: #F0F0F0; margin-right: 6px; border: 1px solid #ccc;"></div>
  //         <span style="font-size: 12px;">No Activity</span>
  //       </div>
  //       <div style="display: flex; align-items: center; margin-bottom: 2px;">
  //         <div style="width: 16px; height: 16px; background: #90EE90; margin-right: 6px; border: 1px solid #ccc;"></div>
  //         <span style="font-size: 12px;">Low Demand</span>
  //       </div>
  //       <div style="display: flex; align-items: center; margin-bottom: 2px;">
  //         <div style="width: 16px; height: 16px; background: #FFD700; margin-right: 6px; border: 1px solid #ccc;"></div>
  //         <span style="font-size: 12px;">Moderate</span>
  //       </div>
  //       <div style="display: flex; align-items: center; margin-bottom: 2px;">
  //         <div style="width: 16px; height: 16px; background: #FFA500; margin-right: 6px; border: 1px solid #ccc;"></div>
  //         <span style="font-size: 12px;">High Demand</span>
  //       </div>
  //       <div style="display: flex; align-items: center;">
  //         <div style="width: 16px; height: 16px; background: #FF4500; margin-right: 6px; border: 1px solid #ccc;"></div>
  //         <span style="font-size: 12px;">Very High</span>
  //       </div>
  //       <hr style="margin: 8px 0; border: none; border-top: 1px solid #ddd;">
  //       <h5 style="margin: 4px 0; color: #333; font-size: 12px;">Route Colors</h5>
  //       <div style="display: flex; align-items: center; margin-bottom: 2px;">
  //         <div style="width: 20px; height: 3px; background: #3b82f6; margin-right: 6px; border-radius: 2px;"></div>
  //         <span style="font-size: 12px;">📍 Proximity</span>
  //       </div>
  //       <div style="display: flex; align-items: center; margin-bottom: 2px;">
  //         <div style="width: 20px; height: 3px; background: #f59e0b; margin-right: 6px; border-radius: 2px;"></div>
  //         <span style="font-size: 12px;">📊 Demand</span>
  //       </div>
  //       <div style="display: flex; align-items: center;">
  //         <div style="width: 20px; height: 3px; background: #10b981; margin-right: 6px; border-radius: 2px;"></div>
  //         <span style="font-size: 12px;">🔄 Hybrid</span>
  //       </div>
  //     `;
  //     return div;
  //   };
  //   legend.addTo(map);
  //   return () => legend.remove();
  // }, [map]);
  
  return null;
});

const TaxiAnimation = React.memo<{ assignment: Assignment; onComplete: (orderId: string) => void }>(({ assignment, onComplete }) => {
  const map = useMap();
  const [hasStarted, setHasStarted] = React.useState(false);
  
  // Get route colors based on algorithm used (only pickup route varies)
  const getRouteColors = (algorithmUsed: string) => {
    const dropoffColor = '#22c55e'; // Consistent green for all dropoff routes
    
    switch(algorithmUsed) {
      case 'proximity':
        return { pickup: '#3b82f6', dropoff: dropoffColor }; // Blue pickup
      case 'demand':
        return { pickup: '#f59e0b', dropoff: dropoffColor }; // Orange pickup
      case 'hybrid':
        return { pickup: '#10b981', dropoff: dropoffColor }; // Green pickup
      default:
        return { pickup: 'blue', dropoff: dropoffColor }; // Default fallback
    }
  };
  
  useEffect(() => {
    // Only start animation once per assignment
    if (hasStarted || !assignment?.to_pickup_route?.path || !assignment?.to_dropoff_route?.path) return;
    
    setHasStarted(true);
    let taxiMarker: L.Marker | null = null;
    let currentPolyline: L.Polyline | null = null;
    let animationId: NodeJS.Timeout | null = null;
    let isDestroyed = false;
    
    const cleanup = () => {
      isDestroyed = true;
      if (animationId) clearTimeout(animationId);
      if (taxiMarker && map.hasLayer(taxiMarker)) map.removeLayer(taxiMarker);
      if (currentPolyline && map.hasLayer(currentPolyline)) map.removeLayer(currentPolyline);
    };
    
    const animateRoute = (route: { path: [number, number][] }, color: string, onRouteComplete?: () => void) => {
      if (isDestroyed || !route?.path?.length) {
        onRouteComplete?.();
        return;
      }
      
      const points = route.path;
      // Get dash pattern based on algorithm (only pickup route varies)
      const getDashPattern = (algorithmUsed: string, routeType: string) => {
        if (routeType === 'dropoff') {
          return undefined; // Solid line for all dropoff routes
        }
      
        return '5, 5'; // Dashed for proximity
      };
      
      const isPickupRoute = color === colors.pickup;
      const dashArray = getDashPattern(assignment.algorithm_used, isPickupRoute ? 'pickup' : 'dropoff');
      
      const polyline = L.polyline(points, { 
        color, 
        weight: 3, 
        opacity: 0.8,
        dashArray
      }).addTo(map);
      currentPolyline = polyline;
      
      let currentIndex = 0;
      const totalSteps = points.length;
      const stepDelay = TAXI_ANIMATION_SPEED; // Use global animation speed setting
      
      const animateStep = () => {
        if (isDestroyed) return;
        
        if (currentIndex < totalSteps) {
          const [lat, lng] = points[currentIndex];
          if (taxiMarker) {
            taxiMarker.setLatLng([lat, lng]);
          }
          currentIndex++;
          animationId = setTimeout(animateStep, stepDelay);
        } else {
          if (currentPolyline && map.hasLayer(currentPolyline)) {
            map.removeLayer(currentPolyline);
          }
          onRouteComplete?.();
        }
      };
      
      animateStep();
    };
    
    // Initialize taxi marker
    const startPos = assignment.to_pickup_route.path[0];
    taxiMarker = L.marker([startPos[0], startPos[1]], { 
      icon: ICONS.busyTaxi,
      zIndexOffset: 1000
    }).addTo(map);
    
    // Get algorithm-specific colors
    const colors = getRouteColors(assignment.algorithm_used);
    
    // Start animation sequence
    animateRoute(assignment.to_pickup_route, colors.pickup, () => {
      if (isDestroyed) return;
      animateRoute(assignment.to_dropoff_route, colors.dropoff, () => {
        if (isDestroyed) return;
        onComplete?.(assignment.order_id);
        
        // Change taxi icon to free (green) and keep it at final position
        if (taxiMarker && !isDestroyed) {
          taxiMarker.setIcon(ICONS.freeTaxi);
        }
        
        // Delay cleanup to prevent flickering until WebSocket update arrives
        setTimeout(() => {
          if (!isDestroyed) cleanup();
        }, 800);
      });
    });
    
    return cleanup;
  }, [assignment?.order_id, map]); // Only depend on order_id, not the entire assignment object
  
  return null;
});

const useWebSocket = (url: string, onDemandUpdate: (hexagons: DemandHexagon[]) => void) => {
  const [data, setData] = useState<SimulationData>({
    taxis: [],
    orders: [],
    assignments: []
  });
  const [isConnected, setIsConnected] = useState(false);
  
  const sendMessage = useCallback((message: any) => {
    if ((window as any).wsRef?.readyState === WebSocket.OPEN) {
      (window as any).wsRef.send(JSON.stringify(message));
    }
  }, []);
  
  useEffect(() => {
    const connect = () => {
      try {
        const ws = new WebSocket(url);
        (window as any).wsRef = ws;
        
        ws.onopen = () => {
          setIsConnected(true);
          console.log('WebSocket connected successfully');
        };
        
        ws.onmessage = (event) => {
          console.log('Raw WebSocket message received:', event.data);
          try {
            const message = JSON.parse(event.data);
            console.log('Parsed message:', message);
            if (message.type === 'state_update') {
              console.log('State update received - taxis:', message.taxis?.length, 'orders:', message.orders?.length);
              setData({
                taxis: message.taxis || [],
                orders: message.orders || [],
                assignments: message.assignments || []
              });
            } else if (message.type === 'demand_update') {
              console.log('Demand update received - hexagons:', message.hexagons?.length);
              onDemandUpdate?.(message.hexagons || []);
            } else {
              console.log('Unknown message type:', message.type);
            }
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error, event.data);
          }
        };
        
        ws.onclose = (event) => {
          setIsConnected(false);
          console.log('WebSocket closed:', event.code, event.reason, 'reconnecting in 3s...');
          setTimeout(connect, 3000);
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setIsConnected(false);
        };
        
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        setTimeout(connect, 3000);
      }
    };
    
    connect();
    
    return () => {
      if ((window as any).wsRef) {
        (window as any).wsRef.close();
        (window as any).wsRef = null;
      }
    };
  }, [url, onDemandUpdate]);
  
  return { data, isConnected, sendMessage };
};

interface TaxiSimulationProps {
  className?: string;
  showDemandLayer?: boolean;
  onDemandUpdate?: (hexagons: DemandHexagon[]) => void;
  useProximity?: boolean;
  useSupplyDemand?: boolean;
}

export const TaxiSimulation: React.FC<TaxiSimulationProps> = ({ 
  className, 
  showDemandLayer: externalShowDemandLayer, 
  onDemandUpdate: externalOnDemandUpdate,
  useProximity: externalUseProximity,
  useSupplyDemand: externalUseSupplyDemand
}) => {
  const [demandHexagons, setDemandHexagons] = useState<DemandHexagon[]>([]);
  
  // Use external props if provided, otherwise use defaults
  const showDemandLayer = externalShowDemandLayer ?? false;
  const useProximity = externalUseProximity ?? true;
  const useSupplyDemand = externalUseSupplyDemand ?? true;
  
  const handleDemandUpdate = useCallback((hexagons: DemandHexagon[]) => {
    setDemandHexagons(hexagons);
    // Also call external callback if provided
    externalOnDemandUpdate?.(hexagons);
  }, [externalOnDemandUpdate]);
  
  const { data, isConnected, sendMessage } = useWebSocket(WS_URL, handleDemandUpdate);
  const [completedAnimations, setCompletedAnimations] = useState(new Set<string>());
  const [hiddenOrders, setHiddenOrders] = useState(new Set<string>());
  
  const handleAnimationComplete = useCallback((orderId: string) => {
    setCompletedAnimations(prev => new Set(prev).add(orderId));
    sendMessage({
      type: 'complete_assignment',
      order_id: orderId
    });
    
    // Hide order pins after 1 second
    setTimeout(() => {
      setHiddenOrders(prev => new Set(prev).add(orderId));
    }, 1000);
  }, [sendMessage]);

  // Note: Algorithm configuration is now handled by parent component

  const getAlgorithmName = () => {
    if (useProximity && useSupplyDemand) {
      return '🔄 Distance + Demand';
    } else if (useProximity) {
      return '📍 Distance-Based';
    } else if (useSupplyDemand) {
      return '📊 Demand-Based';
    } else {
      return '❌ None Selected';
    }
  };

  const getAlgorithmColor = () => {
    if (useProximity && useSupplyDemand) {
      return '#10b981'; // Green for hybrid
    } else if (useProximity) {
      return '#3b82f6'; // Blue for proximity
    } else if (useSupplyDemand) {
      return '#f59e0b'; // Orange for demand
    } else {
      return '#ef4444'; // Red for none
    }
  };
  
  const pendingOrders = useMemo(() => 
    data.orders.filter(order => order.status === 'pending'),
    [data.orders]
  );
  
  const completedOrders = useMemo(() => 
    data.orders.filter(order => order.status === 'completed'),
    [data.orders]
  );
  
  const assignedOrders = useMemo(() => 
    data.orders.filter(order => 
      order.status === 'assigned' && !hiddenOrders.has(order.id)
    ),
    [data.orders, hiddenOrders]
  );
  
  const activeAssignments = useMemo(() => 
    data.assignments.filter(assignment => 
      !completedAnimations.has(assignment.order_id)
    ),
    [data.assignments, completedAnimations]
  );

  return (
    <div className={`relative ${className}`}>
      <MapContainer 
        center={ASTANA_CENTER} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        
        {/* Render Taxis */}
        {data.taxis.map(taxi => {
          // Hide static taxi marker if it's currently being animated
          const isAnimating = activeAssignments.some(assignment => assignment.taxi_id === taxi.id);
          if (isAnimating) return null;
          
          return (
            <Marker
              key={`taxi-${taxi.id}`}
              position={[taxi.location.lat, taxi.location.lng]}
              icon={taxi.status === 'free' ? ICONS.freeTaxi : ICONS.busyTaxi}
            />
          );
        })}
        
        {/* Render Pending Orders */}
        {pendingOrders.map(order => {
          const lat = order.pickup?.lat;
          const lng = order.pickup?.lng;
          if (!lat || !lng) return null;
          return (
            <Marker
              key={`pending-${order.id}`}
              position={[lat, lng]}
              icon={ICONS.pendingOrder}
            />
          );
        })}
        
        {/* Render Assigned Orders (both pickup and dropoff) */}
        {assignedOrders.map(order => {
          const pickupLat = order.pickup?.lat;
          const pickupLng = order.pickup?.lng;
          const dropoffLat = order.dropoff?.lat;
          const dropoffLng = order.dropoff?.lng;
          if (!pickupLat || !pickupLng || !dropoffLat || !dropoffLng) return null;
          
          return (
            <React.Fragment key={`assigned-${order.id}`}>
              <Marker
                key={`assigned-pickup-${order.id}`}
                position={[pickupLat, pickupLng]}
                icon={ICONS.assignedPickup}
              />
              <Marker
                key={`assigned-dropoff-${order.id}`}
                position={[dropoffLat, dropoffLng]}
                icon={ICONS.dropoff}
              />
            </React.Fragment>
          );
        })}
        
        {/* Render Completed Orders (hidden after 1 second) */}
        {completedOrders.filter(order => !hiddenOrders.has(order.id)).map(order => {
          const pickupLat = order.pickup?.lat;
          const pickupLng = order.pickup?.lng;
          const dropoffLat = order.dropoff?.lat;
          const dropoffLng = order.dropoff?.lng;
          if (!pickupLat || !pickupLng || !dropoffLat || !dropoffLng) return null;
          return (
            <React.Fragment key={`completed-${order.id}`}>
              <Marker
                key={`pickup-${order.id}`}
                position={[pickupLat, pickupLng]}
                icon={ICONS.assignedPickup}
              />
              <Marker
                key={`dropoff-${order.id}`}
                position={[dropoffLat, dropoffLng]}
                icon={ICONS.dropoff}
              />
            </React.Fragment>
          );
        })}
        
        {/* Render Active Animations */}
        {activeAssignments.map(assignment => (
          <TaxiAnimation
            key={`animation-${assignment.order_id}`}
            assignment={assignment}
            onComplete={handleAnimationComplete}
          />
        ))}
        
        {/* Render Demand Hexagons */}
        {showDemandLayer && demandHexagons.map(hexagon => (
          <Polygon
            key={`hex-${hexagon.hex_id}`}
            positions={hexagon.boundary}
            pathOptions={{
              fillColor: hexagon.color,
              fillOpacity: 0.6,
              weight: 1,
              color: hexagon.color,
              opacity: 0.8
            }}
          >
            <Tooltip permanent={false} sticky={true}>
              <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
                <strong>Demand Level: {hexagon.demand_level}</strong><br/>
                <hr style={{ margin: '4px 0', border: 'none', borderTop: '1px solid #ddd' }} />
                📍 Orders: {hexagon.orders_count}<br/>
                🚗 Taxis: {hexagon.taxis_count}<br/>
                📊 Ratio: {hexagon.demand_ratio === -1 ? '∞' : hexagon.demand_ratio.toFixed(2)}<br/>
                <small style={{ color: '#666' }}>H3: {hexagon.hex_id.slice(0, 8)}...</small>
              </div>
            </Tooltip>
          </Polygon>
        ))}
        
        <Legend />
      </MapContainer>
      
      {/* Connection Status */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 1000
      }}>
        <div style={{
          background: isConnected ? '#22c55e' : '#ef4444',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '6px 6px 0 0',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
        
        {/* Algorithm Status */}
        <div style={{
          background: getAlgorithmColor(),
          color: 'white',
          padding: '6px 12px',
          borderRadius: '0 0 6px 6px',
          fontSize: '12px',
          fontWeight: 'bold',
          borderTop: '1px solid rgba(255,255,255,0.3)'
        }}>
          {getAlgorithmName()}
        </div>
      </div>
      
      {/* Demand Layer Toggle
      <div style={{
        position: 'absolute',
        top: '60px',
        right: '10px',
        zIndex: 1000
      }}>
        <button
          onClick={() => setShowDemandLayer(!showDemandLayer)}
          style={{
            background: showDemandLayer ? '#3b82f6' : '#6b7280',
            color: 'white',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          {showDemandLayer ? 'Hide' : 'Show'} Demand ({demandHexagons.length})
        </button>
      </div> */}
    </div>
  );
};

// Export the controls as separate components for integration
export const SimulationAlgorithmControls: React.FC<{
  useProximity: boolean;
  useSupplyDemand: boolean;
  onProximityChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSupplyDemandChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  getAlgorithmName: () => string;
  getAlgorithmColor: () => string;
}> = ({
  useProximity,
  useSupplyDemand,
  onProximityChange,
  onSupplyDemandChange,
  getAlgorithmName,
  getAlgorithmColor
}) => (
  <div style={{
    background: 'white',
    padding: '12px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    fontFamily: 'Arial, sans-serif',
    minWidth: '200px'
  }}>
    <h4 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '16px' }}>
      🚗 Assignment Algorithm
    </h4>
    
    <div style={{ marginBottom: '8px' }}>
      <label style={{ 
        display: 'flex', 
        alignItems: 'center', 
        cursor: 'pointer',
        fontSize: '14px'
      }}>
        <input 
          type="checkbox" 
          checked={useProximity} 
          onChange={onProximityChange}
          style={{ marginRight: '6px' }}
        />
        📍 Proximity 
        <span 
          title="Assigns taxis based on shortest distance to pickup location"
          style={{
            marginLeft: '4px',
            cursor: 'help',
            color: '#6b7280',
            fontSize: '12px'
          }}
        >
          ℹ️
        </span>
      </label>
    </div>

    <div style={{ marginBottom: '10px' }}>
      <label style={{ 
        display: 'flex', 
        alignItems: 'center', 
        cursor: 'pointer',
        fontSize: '14px'
      }}>
        <input 
          type="checkbox" 
          checked={useSupplyDemand} 
          onChange={onSupplyDemandChange}
          style={{ marginRight: '6px' }}
        />
        📊 Supply-Demand Ratio
        <span 
          title="Considers demand density and taxi availability in each hexagon area"
          style={{
            marginLeft: '4px',
            cursor: 'help',
            color: '#6b7280',
            fontSize: '12px'
          }}
        >
          ℹ️
        </span>
      </label>
    </div>

    <div style={{
      padding: '6px 8px',
      background: getAlgorithmColor(),
      borderRadius: '4px',
      fontSize: '12px',
      color: 'white',
      fontWeight: 'bold',
      textAlign: 'center',
      marginTop: '4px'
    }}>
      Active: {getAlgorithmName()}
    </div>
  </div>
);

export const SimulationDemandToggle: React.FC<{
  showDemandLayer: boolean;
  onToggle: () => void;
  demandCount: number;
}> = ({ showDemandLayer, onToggle, demandCount }) => (
  <button
    onClick={onToggle}
    style={{
      background: showDemandLayer ? '#3b82f6' : '#6b7280',
      color: 'white',
      border: 'none',
      padding: '10px 16px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: 'bold',
      cursor: 'pointer',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    }}
  >
    {showDemandLayer ? 'Hide' : 'Show'} Demand ({demandCount})
  </button>
);