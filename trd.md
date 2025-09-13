# Technical Requirements Document (TRD)
# Taxi Analysis Visualization Integration

## Overview
This document provides step-by-step technical requirements for integrating taxi analysis visualization layers into your existing frontend application. The integration will enable layer-by-layer insights visualization on an interactive map using the `taxi_analysis_data.json` data file.

## Table of Contents
1. [Data Structure Overview](#data-structure-overview)
2. [Required Dependencies](#required-dependencies)
3. [Map Integration Setup](#map-integration-setup)
4. [Layer Implementation Guide](#layer-implementation-guide)
5. [UI Controls Integration](#ui-controls-integration)
6. [Performance Considerations](#performance-considerations)
7. [Testing & Validation](#testing--validation)

## Data Structure Overview

### Core Data File: `taxi_analysis_data.json`
```json
{
  "metadata": {
    "total_records": 1247811,
    "unique_drivers": 6693,
    "bounds": {
      "lat_min": 51.0758091,
      "lat_max": 51.10269,
      "lng_min": 71.3949483,
      "lng_max": 71.4378942,
      "center_lat": 51.09139131987066,
      "center_lng": 71.41726608326648
    },
    "analysis_timestamp": "2025-09-13T22:00:03.301922"
  },
  "layers": {
    "routes": {...},
    "traffic_jams": [...],
    "demand": {...},
    "availability": {...},
    "violations": [...],
    "speed_zones": {...},
    "anomalies": [...]
  }
}
```

### Available Analysis Layers
| Layer | Type | Description | Count |
|-------|------|-------------|--------|
| **Popular Routes** | Heatmap | High-density taxi movement patterns | 50K points |
| **Demand Heatmaps** | Hexagonal Grid | Passenger demand zones with H3 hexagons | 70 hexagons |
| **Driver Distribution** | Hexagonal Grid | Available driver locations with anomaly detection | 70 hexagons |
| **Speed Violations** | Point Markers | Speed limit violations (>60 km/h) | 1 violation |
| **Unusual Trips** | Point Markers | Anomaly detection (speed, geographic, altitude) | 50 anomalies |
| **Traffic Jams** | Circle Overlays | Congestion areas (top 30) | 30 jam areas |
| **Speed Zones** | Heatmap | Speed pattern visualization | 12K points |

## Required Dependencies

### JavaScript Libraries
```html
<!-- Leaflet Map Library -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

<!-- Leaflet Heatmap Plugin -->
<script src="https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js"></script>
```

### NPM Installation (if using build system)
```bash
npm install leaflet leaflet.heat
```

## Map Integration Setup

### Step 1: Initialize Base Map
```javascript
// Initialize Leaflet map
const map = L.map('map-container').setView([51.0914, 71.4173], 12);

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Load analysis data
let analysisData = null;

async function loadAnalysisData() {
    const response = await fetch('taxi_analysis_data.json');
    analysisData = await response.json();
    
    // Set map bounds based on data
    const bounds = analysisData.metadata.bounds;
    map.fitBounds([
        [bounds.lat_min, bounds.lng_min],
        [bounds.lat_max, bounds.lng_max]
    ]);
}
```

### Step 2: Create Layer Management System
```javascript
class LayerManager {
    constructor(map) {
        this.map = map;
        this.layers = {};
        this.activeLayers = new Set();
    }

    addLayer(name, layerGroup) {
        this.layers[name] = layerGroup;
    }

    showLayer(name) {
        if (this.layers[name]) {
            this.layers[name].addTo(this.map);
            this.activeLayers.add(name);
        }
    }

    hideLayer(name) {
        if (this.layers[name]) {
            this.map.removeLayer(this.layers[name]);
            this.activeLayers.delete(name);
        }
    }

    toggleLayer(name) {
        if (this.activeLayers.has(name)) {
            this.hideLayer(name);
        } else {
            this.showLayer(name);
        }
    }
}

const layerManager = new LayerManager(map);
```

## Layer Implementation Guide

### Layer 1: Popular Routes (Heatmap)
```javascript
function createPopularRoutesLayer(data) {
    const routesLayer = L.layerGroup();
    
    if (data.type === 'heatmap') {
        const heatmapLayer = L.heatLayer(data.points, {
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
            }
        });
        routesLayer.addLayer(heatmapLayer);
    }
    
    return routesLayer;
}
```

### Layer 2: Demand Heatmaps (H3 Hexagons)
```javascript
function createDemandLayer(data) {
    const demandLayer = L.layerGroup();
    
    if (data.type === 'hexagonal_grid') {
        data.hexagons.forEach(hex => {
            const hexPolygon = L.polygon(hex.boundary, {
                color: hex.color,
                fillColor: hex.color,
                fillOpacity: 0.6,
                weight: 1,
                opacity: 0.8
            }).bindPopup(`
                <b>📊 Demand Hexagon</b><br>
                Demand Level: ${hex.demand_level}<br>
                Drivers: ${hex.drivers}<br>
                Records: ${hex.records}<br>
                H3 ID: ${hex.hex_id}
            `);
            demandLayer.addLayer(hexPolygon);
        });
    }
    
    return demandLayer;
}
```

### Layer 3: Driver Distribution (H3 Hexagons with Anomalies)
```javascript
function createAvailabilityLayer(data) {
    const availabilityLayer = L.layerGroup();
    
    if (data.type === 'hexagonal_grid') {
        data.hexagons.forEach(hex => {
            const hexPolygon = L.polygon(hex.boundary, {
                color: hex.is_anomaly ? '#FF0000' : hex.color,  // Red border for anomalies
                fillColor: hex.color,
                fillOpacity: 0.7,
                weight: hex.is_anomaly ? 4 : 1,  // Thicker border for anomalies
                opacity: hex.is_anomaly ? 1.0 : 0.8,
                dashArray: hex.is_anomaly ? '10,5' : null  // Dashed border for anomalies
            }).bindPopup(`
                <b>🟢 Driver Availability Hexagon</b><br>
                ${hex.is_anomaly ? '<b style="color: red;">⚠️ ANOMALY DETECTED!</b><br>' : ''}
                Availability Level: ${hex.availability_level}<br>
                Available Drivers: ${hex.drivers}<br>
                Records: ${hex.records}<br>
                ${hex.is_anomaly ? '<br><b>Excessive driver concentration!</b>' : ''}
            `);
            availabilityLayer.addLayer(hexPolygon);
        });
    }
    
    return availabilityLayer;
}
```

### Layer 4: Speed Violations (Point Markers)
```javascript
function createViolationsLayer(data) {
    const violationsLayer = L.layerGroup();
    
    data.forEach(violation => {
        const marker = L.marker([violation.lat, violation.lng], {
            icon: L.divIcon({
                html: '🚨',
                className: 'violation-icon',
                iconSize: [20, 20]
            })
        }).bindPopup(`
            <b>🚨 SPEED VIOLATION</b><br>
            Speed: ${violation.speed.toFixed(1)} km/h<br>
            Legal Limit: 60 km/h<br>
            Excess: ${violation.excess.toFixed(1)} km/h<br>
            Driver: ${violation.driver_id}
        `);
        violationsLayer.addLayer(marker);

        // Add danger zone circle
        const dangerZone = L.circle([violation.lat, violation.lng], {
            color: 'red',
            fillColor: 'red',
            fillOpacity: 0.2,
            radius: 200
        });
        violationsLayer.addLayer(dangerZone);
    });
    
    return violationsLayer;
}
```

### Layer 5: Unusual Trips (Anomaly Points)
```javascript
function createAnomaliesLayer(data) {
    const anomaliesLayer = L.layerGroup();
    
    const iconMap = {
        speed: '📊',
        geographic: '📍',
        altitude: '⛰️'
    };

    data.forEach(anomaly => {
        const marker = L.marker([anomaly.lat, anomaly.lng], {
            icon: L.divIcon({
                html: iconMap[anomaly.type] || '❓',
                className: 'anomaly-icon',
                iconSize: [20, 20]
            })
        }).bindPopup(`
            <b>🔍 ${anomaly.type.toUpperCase()} Anomaly</b><br>
            ${anomaly.description}<br>
            Driver: ${anomaly.driver_id}
        `);
        anomaliesLayer.addLayer(marker);
    });
    
    return anomaliesLayer;
}
```

### Layer 6: Traffic Jams (Circle Overlays)
```javascript
function createTrafficJamsLayer(data) {
    const jamsLayer = L.layerGroup();
    
    data.forEach(jam => {
        const circle = L.circle([jam.lat, jam.lng], {
            color: jam.color,
            fillColor: jam.color,
            fillOpacity: 0.4,
            radius: jam.radius
        }).bindPopup(`
            <b>🚨 Traffic Jam</b><br>
            Severity: ${jam.severity.toUpperCase()}<br>
            Drivers: ${jam.drivers}<br>
            Avg Speed: ${jam.avg_speed.toFixed(1)} km/h<br>
            Records: ${jam.records}
        `);
        jamsLayer.addLayer(circle);
    });
    
    return jamsLayer;
}
```

### Layer 7: Speed Zones (Heatmap)
```javascript
function createSpeedZonesLayer(data) {
    const speedLayer = L.layerGroup();
    
    if (data.type === 'speed_heatmap') {
        const speedHeatmapLayer = L.heatLayer(data.points, {
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
        });
        speedLayer.addLayer(speedHeatmapLayer);
    }
    
    return speedLayer;
}
```

## UI Controls Integration

### Step 1: Layer Control Component Structure
Based on your existing UI, modify your layer controls to match this structure:

```html
<div class="data-layers">
    <div class="layer-item" data-layer="routes">
        <div class="layer-toggle">
            <input type="checkbox" id="routes-toggle" />
            <span class="toggle-slider"></span>
        </div>
        <div class="layer-info">
            <h3>Popular Routes</h3>
            <p>Most frequently used transportation paths</p>
            <span class="layer-status">Real-time data</span>
        </div>
    </div>
    
    <div class="layer-item" data-layer="demand">
        <div class="layer-toggle">
            <input type="checkbox" id="demand-toggle" />
            <span class="toggle-slider"></span>
        </div>
        <div class="layer-info">
            <h3>Demand Heatmaps</h3>
            <p>High-demand areas for transportation services</p>
        </div>
    </div>
    
    <!-- Repeat for other layers -->
</div>
```

### Step 2: Layer Control JavaScript
```javascript
// Initialize all layers
async function initializeLayers() {
    await loadAnalysisData();
    
    // Create all layer instances
    const routesLayer = createPopularRoutesLayer(analysisData.layers.routes);
    const demandLayer = createDemandLayer(analysisData.layers.demand);
    const availabilityLayer = createAvailabilityLayer(analysisData.layers.availability);
    const violationsLayer = createViolationsLayer(analysisData.layers.violations);
    const anomaliesLayer = createAnomaliesLayer(analysisData.layers.anomalies);
    const jamsLayer = createTrafficJamsLayer(analysisData.layers.traffic_jams);
    const speedLayer = createSpeedZonesLayer(analysisData.layers.speed_zones);
    
    // Add to layer manager
    layerManager.addLayer('routes', routesLayer);
    layerManager.addLayer('demand', demandLayer);
    layerManager.addLayer('availability', availabilityLayer);
    layerManager.addLayer('violations', violationsLayer);
    layerManager.addLayer('anomalies', anomaliesLayer);
    layerManager.addLayer('traffic_jams', jamsLayer);
    layerManager.addLayer('speed_zones', speedLayer);
    
    // Setup event listeners
    setupLayerControls();
}

function setupLayerControls() {
    document.querySelectorAll('.layer-item').forEach(item => {
        const layerName = item.dataset.layer;
        const checkbox = item.querySelector('input[type="checkbox"]');
        
        // Handle toggle clicks
        checkbox.addEventListener('change', (e) => {
            layerManager.toggleLayer(layerName);
            updateActiveLayersDisplay();
        });
        
        // Handle item clicks (excluding checkbox)
        item.addEventListener('click', (e) => {
            if (e.target !== checkbox) {
                checkbox.checked = !checkbox.checked;
                layerManager.toggleLayer(layerName);
                updateActiveLayersDisplay();
            }
        });
    });
}

function updateActiveLayersDisplay() {
    const activeLayersList = document.querySelector('.active-layers-list');
    const activeLayers = Array.from(layerManager.activeLayers);
    
    if (activeLayers.length === 0) {
        activeLayersList.innerHTML = '<p>No active layers</p>';
        return;
    }
    
    const layerNames = {
        'routes': 'Popular Routes',
        'demand': 'Demand Heatmaps', 
        'availability': 'Driver Distribution',
        'violations': 'Speed Violations',
        'anomalies': 'Unusual Trips',
        'traffic_jams': 'Traffic Jams',
        'speed_zones': 'Speed Zones'
    };
    
    activeLayersList.innerHTML = activeLayers
        .map(layer => `<span class="active-layer-tag">${layerNames[layer]}</span>`)
        .join('');
}
```

### Step 3: Bulk Actions Implementation
```javascript
// Enable All Layers button
function enableAllLayers() {
    const allLayers = ['routes', 'demand', 'availability', 'violations', 'anomalies', 'traffic_jams', 'speed_zones'];
    
    allLayers.forEach(layerName => {
        layerManager.showLayer(layerName);
        const checkbox = document.querySelector(`[data-layer="${layerName}"] input[type="checkbox"]`);
        if (checkbox) checkbox.checked = true;
    });
    
    updateActiveLayersDisplay();
}

// Clear All Layers button
function clearAllLayers() {
    const allLayers = ['routes', 'demand', 'availability', 'violations', 'anomalies', 'traffic_jams', 'speed_zones'];
    
    allLayers.forEach(layerName => {
        layerManager.hideLayer(layerName);
        const checkbox = document.querySelector(`[data-layer="${layerName}"] input[type="checkbox"]`);
        if (checkbox) checkbox.checked = false;
    });
    
    updateActiveLayersDisplay();
}

// Attach to buttons
document.getElementById('enable-all-btn').addEventListener('click', enableAllLayers);
document.getElementById('clear-all-btn').addEventListener('click', clearAllLayers);
```

## Performance Considerations

### 1. Lazy Loading
```javascript
// Only create layers when needed
const layerFactories = {
    'routes': () => createPopularRoutesLayer(analysisData.layers.routes),
    'demand': () => createDemandLayer(analysisData.layers.demand),
    // ... other factories
};

function getLayer(name) {
    if (!layerManager.layers[name]) {
        layerManager.layers[name] = layerFactories[name]();
    }
    return layerManager.layers[name];
}
```

### 2. Memory Management
```javascript
function cleanupLayers() {
    Object.values(layerManager.layers).forEach(layer => {
        if (layer) {
            layer.clearLayers();
        }
    });
}

// Call cleanup when switching datasets or unmounting component
window.addEventListener('beforeunload', cleanupLayers);
```

### 3. Viewport-Based Loading
```javascript
function shouldLoadLayer(layerName) {
    const zoom = map.getZoom();
    
    // Only load detailed layers at higher zoom levels
    const zoomThresholds = {
        'violations': 13,
        'anomalies': 14,
        'demand': 12,
        'availability': 12
    };
    
    return zoom >= (zoomThresholds[layerName] || 10);
}
```

## Testing & Validation

### 1. Data Validation
```javascript
function validateAnalysisData(data) {
    const required = ['metadata', 'layers'];
    const requiredLayers = ['routes', 'traffic_jams', 'demand', 'availability', 'violations', 'speed_zones', 'anomalies'];
    
    // Check top-level structure
    for (const key of required) {
        if (!data[key]) {
            throw new Error(`Missing required field: ${key}`);
        }
    }
    
    // Check layer structure
    for (const layer of requiredLayers) {
        if (!data.layers[layer]) {
            console.warn(`Missing layer: ${layer}`);
        }
    }
    
    return true;
}
```

### 2. Layer Rendering Tests
```javascript
function testLayerRendering() {
    const testResults = {};
    
    Object.keys(layerManager.layers).forEach(layerName => {
        try {
            layerManager.showLayer(layerName);
            layerManager.hideLayer(layerName);
            testResults[layerName] = 'PASS';
        } catch (error) {
            testResults[layerName] = `FAIL: ${error.message}`;
        }
    });
    
    console.table(testResults);
    return testResults;
}
```

## Implementation Checklist

- [ ] Add required dependencies (Leaflet + Leaflet.heat)
- [ ] Implement base map initialization
- [ ] Create LayerManager class
- [ ] Implement all 7 layer rendering functions
- [ ] Setup layer control UI event handlers
- [ ] Add bulk action buttons (Enable/Clear All)
- [ ] Implement active layers display update
- [ ] Add performance optimizations
- [ ] Implement data validation
- [ ] Add error handling and fallbacks
- [ ] Test layer rendering and interactions
- [ ] Optimize for mobile responsiveness
- [ ] Add loading states and progress indicators

## Support & Troubleshooting

### Common Issues

1. **Heatmap not displaying**: Ensure leaflet.heat plugin is loaded after leaflet.js
2. **Hexagons not rendering**: Check that boundary coordinates are in [lat, lng] format
3. **Performance issues**: Implement viewport-based loading and layer lazy loading
4. **Memory leaks**: Call clearLayers() when switching datasets

### Data Format Requirements

- All coordinates must be in [latitude, longitude] format
- Heatmap points: `[lat, lng, intensity]` arrays
- Hexagon boundaries: Array of `[lat, lng]` coordinate pairs
- Colors: Valid CSS color strings (hex, rgb, named colors)

This TRD provides a complete integration guide for your taxi analysis visualization system. Follow the steps sequentially for best results.