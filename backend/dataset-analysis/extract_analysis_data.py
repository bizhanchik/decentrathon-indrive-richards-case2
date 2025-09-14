# =============================================================================
# TAXI ANALYSIS DATA EXTRACTION
# Extract all analysis results and save to JSON for visualization
# =============================================================================

import pandas as pd
import numpy as np
import json
from sklearn.cluster import DBSCAN
from scipy import stats
import warnings
warnings.filterwarnings('ignore')

print('🚗 EXTRACTING TAXI ANALYSIS DATA...')
print('=' * 50)

# Load and clean data
df = pd.read_csv('geo_locations_astana_hackathon.csv')
df_clean = df[df['spd'] >= 0].copy()
print(f'Processing {len(df_clean):,} records from {df_clean["randomized_id"].nunique():,} drivers')

# Dataset boundaries
bounds = {
    'lat_min': float(df_clean['lat'].min()),
    'lat_max': float(df_clean['lat'].max()),
    'lng_min': float(df_clean['lng'].min()),
    'lng_max': float(df_clean['lng'].max()),
    'center_lat': float(df_clean['lat'].mean()),
    'center_lng': float(df_clean['lng'].mean())
}

# Initialize results dictionary
analysis_data = {
    'metadata': {
        'total_records': int(len(df_clean)),
        'unique_drivers': int(df_clean['randomized_id'].nunique()),
        'bounds': bounds,
        'analysis_timestamp': pd.Timestamp.now().isoformat()
    },
    'layers': {}
}

print('\n🗺️ Creating Popular Routes Heatmap...')
# Popular Routes Analysis - Simple heatmap of taxi record density

# Sample data for performance (use every 10th record for heatmap)
sample_size = min(50000, len(df_clean))  # Max 50K points for performance
df_sample = df_clean.sample(n=sample_size, random_state=42)

# Create heatmap points - just lat, lng, and intensity
heatmap_points = []
for _, row in df_sample.iterrows():
    heatmap_points.append([
        float(row['lat']),
        float(row['lng']),
        1.0  # Each record has equal weight in the heatmap
    ])

# Store as simple coordinate list for heatmap
routes_data = {
    'type': 'heatmap',
    'points': heatmap_points,
    'sample_size': sample_size,
    'total_records': len(df_clean)
}

analysis_data['layers']['routes'] = routes_data
print(f'✅ Created heatmap with {len(heatmap_points):,} sample points (from {len(df_clean):,} total records)')

print('\n🚨 Detecting Traffic Jams...')
# Traffic Jam Detection (Grid-based)
slow_vehicles = df_clean[df_clean['spd'] <= 5].copy()
jam_lat_bins = np.linspace(bounds['lat_min'], bounds['lat_max'], 40)
jam_lng_bins = np.linspace(bounds['lng_min'], bounds['lng_max'], 50)

slow_vehicles['lat_bin'] = pd.cut(slow_vehicles['lat'], jam_lat_bins, labels=False)
slow_vehicles['lng_bin'] = pd.cut(slow_vehicles['lng'], jam_lng_bins, labels=False)

jam_grid = slow_vehicles.groupby(['lat_bin', 'lng_bin']).agg({
    'lat': 'mean', 'lng': 'mean', 'spd': ['mean', 'count'], 'randomized_id': 'nunique'
}).reset_index()

jam_grid.columns = ['lat_bin', 'lng_bin', 'lat', 'lng', 'avg_speed', 'total_records', 'unique_drivers']
traffic_jams = jam_grid[(jam_grid['unique_drivers'] >= 15) & (jam_grid['avg_speed'] <= 3)]

# Sort by unique_drivers descending and take top 30
traffic_jams_sorted = traffic_jams.sort_values('unique_drivers', ascending=False).head(30)

jams_data = []
for _, row in traffic_jams_sorted.iterrows():
    severity = 'severe' if row['unique_drivers'] >= 50 else 'major' if row['unique_drivers'] >= 30 else 'moderate' if row['unique_drivers'] >= 20 else 'minor'
    color = 'darkred' if row['unique_drivers'] >= 50 else 'red' if row['unique_drivers'] >= 30 else 'orange'
    # Make circles smaller - reduced from * 4 to * 2 and max from 200 to 120
    radius = max(30, min(120, row['unique_drivers'] * 2))
    
    jams_data.append({
        'lat': float(row['lat']),
        'lng': float(row['lng']),
        'severity': severity,
        'color': color,
        'radius': int(radius),
        'drivers': int(row['unique_drivers']),
        'avg_speed': float(row['avg_speed']),
        'records': int(row['total_records'])
    })

analysis_data['layers']['traffic_jams'] = jams_data
print(f'✅ Found {len(jams_data)} traffic jam areas')

print('\n📊 Creating Demand Heatmap with H3 Hexagons...')
# Demand Analysis using H3 hexagonal grid for continuous coverage

# Create comprehensive hexagonal coverage of the entire area
import h3

h3_resolution = 9  # ~174m hex diameter, good for city-level analysis

# Get all H3 hexagons that cover the bounding box area
def get_hexagons_in_bounds(bounds, resolution):
    # Create LatLngPoly for H3
    from h3 import LatLngPoly
    
    bbox_polygon = LatLngPoly([
        (bounds['lat_min'], bounds['lng_min']),
        (bounds['lat_min'], bounds['lng_max']),
        (bounds['lat_max'], bounds['lng_max']),
        (bounds['lat_max'], bounds['lng_min'])
    ])
    
    # Get all hexagons that intersect with this polygon
    hexagons = h3.polygon_to_cells(bbox_polygon, resolution)
    return list(hexagons)

# Get all hexagons in the area
all_hexagons = get_hexagons_in_bounds(bounds, h3_resolution)
print(f'Generated {len(all_hexagons)} hexagons for complete area coverage')

# Map taxi records to H3 hexagons
df_clean['h3_hex'] = df_clean.apply(
    lambda row: h3.latlng_to_cell(row['lat'], row['lng'], h3_resolution), 
    axis=1
)

# Calculate demand per hexagon
hex_demand = df_clean.groupby('h3_hex').agg({
    'randomized_id': 'nunique',
    'lat': 'count'
}).reset_index()
hex_demand.columns = ['h3_hex', 'unique_drivers', 'total_records']

# Create demand mapping for all hexagons (including those with zero demand)
demand_map = {}
for _, row in hex_demand.iterrows():
    demand_map[row['h3_hex']] = {
        'drivers': int(row['unique_drivers']),
        'records': int(row['total_records'])
    }

# Calculate color scale
max_demand = hex_demand['unique_drivers'].max() if len(hex_demand) > 0 else 1
min_demand = 0  # Include zero-demand areas

def get_demand_color(demand, max_val):
    if max_val == 0:
        return '#F0F0F0'  # Light gray for no data
    
    normalized = demand / max_val
    
    # Use a more intuitive color scale
    if demand == 0:
        return '#F0F0F0'  # Light gray - no taxi activity
    elif normalized < 0.1:
        return '#E8F4FD'  # Very light blue - minimal activity
    elif normalized < 0.3:
        return '#81C4E7'  # Light blue - low activity
    elif normalized < 0.5:
        return '#43A2CA'  # Medium blue - moderate activity  
    elif normalized < 0.7:
        return '#2166AC'  # Dark blue - good activity
    elif normalized < 0.9:
        return '#FF8C00'  # Orange - high activity
    else:
        return '#FF4500'  # Red-orange - very high activity

# Create hexagon data for all hexagons in the area
demand_data = []
for hex_id in all_hexagons:
    # Get hexagon boundaries
    boundary = h3.cell_to_boundary(hex_id)
    boundary_coords = [[lat, lng] for lat, lng in boundary]
    center = h3.cell_to_latlng(hex_id)
    
    # Get demand data (or zero if no taxis in this hexagon)
    hex_data = demand_map.get(hex_id, {'drivers': 0, 'records': 0})
    demand = hex_data['drivers']
    
    color = get_demand_color(demand, max_demand)
    
    demand_data.append({
        'type': 'hexagon',
        'hex_id': hex_id,
        'boundary': boundary_coords,
        'center': [float(center[0]), float(center[1])],
        'color': color,
        'drivers': hex_data['drivers'],
        'records': hex_data['records'],
        'demand_level': 'Very High' if demand >= max_demand * 0.9 else 
                      'High' if demand >= max_demand * 0.7 else
                      'Moderate' if demand >= max_demand * 0.5 else
                      'Low' if demand >= max_demand * 0.3 else
                      'Very Low' if demand > 0 else 'None'
    })

analysis_data['layers']['demand'] = {
    'type': 'hexagonal_grid',
    'hexagons': demand_data,
    'h3_resolution': h3_resolution,
    'max_demand': int(max_demand),
    'total_hexagons': len(demand_data),
    'active_hexagons': len([h for h in demand_data if h['drivers'] > 0])
}

print(f'✅ Created continuous hexagonal grid: {len(demand_data)} hexagons total, {len([h for h in demand_data if h["drivers"] > 0])} with taxi activity')

print('\n🟢 Analyzing Driver Availability with H3 Hexagons...')
# Driver Availability - Use same hexagonal grid as demand
available_drivers = df_clean[df_clean['spd'] <= 1].copy()
print(f'Found {len(available_drivers):,} available drivers (≤1 km/h)...')

# Map available drivers to H3 hexagons
available_drivers['h3_hex'] = available_drivers.apply(
    lambda row: h3.latlng_to_cell(row['lat'], row['lng'], h3_resolution), 
    axis=1
)

# Calculate availability per hexagon
hex_availability = available_drivers.groupby('h3_hex').agg({
    'randomized_id': 'nunique',
    'lat': 'count'
}).reset_index()
hex_availability.columns = ['h3_hex', 'unique_drivers', 'total_records']

# Create availability mapping for all hexagons (including those with zero availability)
availability_map = {}
for _, row in hex_availability.iterrows():
    availability_map[row['h3_hex']] = {
        'drivers': int(row['unique_drivers']),
        'records': int(row['total_records'])
    }

# Calculate statistics for anomaly detection
driver_counts = [data['drivers'] for data in availability_map.values()]
if len(driver_counts) > 0:
    mean_drivers = np.mean(driver_counts)
    std_drivers = np.std(driver_counts)
    max_drivers = max(driver_counts)
    # Anomaly threshold: more than 2 standard deviations above mean
    anomaly_threshold = mean_drivers + 2 * std_drivers
    print(f'Availability stats: mean={mean_drivers:.1f}, std={std_drivers:.1f}, anomaly_threshold={anomaly_threshold:.1f}')
else:
    max_drivers = 1
    anomaly_threshold = 0

def get_availability_color(drivers, max_val):
    if max_val == 0:
        return '#F0F0F0'  # Light gray for no data
    
    normalized = drivers / max_val
    
    # Use green color scale for availability
    if drivers == 0:
        return '#F0F0F0'  # Light gray - no available drivers
    elif normalized < 0.2:
        return '#E8F5E8'  # Very light green - minimal availability
    elif normalized < 0.4:
        return '#A8E6A3'  # Light green - low availability
    elif normalized < 0.6:
        return '#68C968'  # Medium green - moderate availability  
    elif normalized < 0.8:
        return '#32B032'  # Dark green - good availability
    else:
        return '#00FF00'  # Bright green - high availability

# Create hexagon data for all hexagons in the area
availability_data = []
for hex_id in all_hexagons:
    # Get hexagon boundaries
    boundary = h3.cell_to_boundary(hex_id)
    boundary_coords = [[lat, lng] for lat, lng in boundary]
    center = h3.cell_to_latlng(hex_id)
    
    # Get availability data (or zero if no available drivers in this hexagon)
    hex_data = availability_map.get(hex_id, {'drivers': 0, 'records': 0})
    drivers = hex_data['drivers']
    
    color = get_availability_color(drivers, max_drivers)
    
    # Check for anomaly
    is_anomaly = drivers > anomaly_threshold and drivers > 0
    
    availability_data.append({
        'type': 'hexagon',
        'hex_id': hex_id,
        'boundary': boundary_coords,
        'center': [float(center[0]), float(center[1])],
        'color': color,
        'drivers': hex_data['drivers'],
        'records': hex_data['records'],
        'is_anomaly': bool(is_anomaly),  # Ensure JSON serializable
        'availability_level': 'Very High' if drivers >= max_drivers * 0.8 else 
                           'High' if drivers >= max_drivers * 0.6 else
                           'Moderate' if drivers >= max_drivers * 0.4 else
                           'Low' if drivers >= max_drivers * 0.2 else
                           'Very Low' if drivers > 0 else 'None'
    })

analysis_data['layers']['availability'] = {
    'type': 'hexagonal_grid',
    'hexagons': availability_data,
    'h3_resolution': h3_resolution,
    'max_availability': int(max_drivers),
    'anomaly_threshold': float(anomaly_threshold),
    'anomaly_count': sum(1 for h in availability_data if h['is_anomaly']),
    'total_hexagons': len(availability_data),
    'active_hexagons': len([h for h in availability_data if h['drivers'] > 0])
}

print(f'✅ Created availability hexagonal grid: {len(availability_data)} hexagons total, {len([h for h in availability_data if h["drivers"] > 0])} with available drivers')
print(f'🚨 Found {sum(1 for h in availability_data if h["is_anomaly"])} anomaly hexagons with excessive driver concentration')

print('\n⚡ Analyzing Speed Patterns & Violations...')
# Speed Violations
violations = df_clean[df_clean['spd'] > 60]
violations_data = []

for _, violation in violations.iterrows():
    violations_data.append({
        'lat': float(violation['lat']),
        'lng': float(violation['lng']),
        'speed': float(violation['spd']),
        'excess': float(violation['spd'] - 60),
        'driver_id': str(violation['randomized_id']),
        'direction': float(violation['azm'])
    })

analysis_data['layers']['violations'] = violations_data

# Speed Heatmap Analysis
print('Creating speed heatmap visualization...')
moving_df = df_clean[df_clean['spd'] > 0].copy()

# Sample data for performance - reduced density to prevent oversaturation
sample_size = min(12000, len(moving_df))  # Reduced from 30K to 12K points
df_speed_sample = moving_df.sample(n=sample_size, random_state=42)

print(f'Creating speed heatmap with {len(df_speed_sample):,} sample points...')

# Create speed heatmap points - lat, lng, and speed as intensity
# Higher speeds = higher intensity (more red)
speed_heatmap_points = []
max_speed = df_speed_sample['spd'].max()

for _, row in df_speed_sample.iterrows():
    # Normalize speed to 0-0.4 range to prevent oversaturation
    # Lower max intensity prevents false hotspots from overlapping points
    normalized_speed = float(row['spd']) / max_speed
    intensity = min(0.4, normalized_speed * 0.4)  # Max intensity 0.4 instead of 1.0
    
    speed_heatmap_points.append([
        float(row['lat']),
        float(row['lng']),
        intensity  # Speed normalized as lower intensity
    ])

# Calculate speed statistics
speed_stats = {
    'min_speed': float(df_speed_sample['spd'].min()),
    'max_speed': float(df_speed_sample['spd'].max()), 
    'avg_speed': float(df_speed_sample['spd'].mean()),
    'sample_size': sample_size,
    'total_records': len(moving_df),
    'speed_categories': {
        'Very Slow (0-5)': int(len(df_speed_sample[df_speed_sample['spd'] <= 5])),
        'Slow (5-15)': int(len(df_speed_sample[(df_speed_sample['spd'] > 5) & (df_speed_sample['spd'] <= 15)])),
        'Moderate (15-25)': int(len(df_speed_sample[(df_speed_sample['spd'] > 15) & (df_speed_sample['spd'] <= 25)])),
        'Normal (25-35)': int(len(df_speed_sample[(df_speed_sample['spd'] > 25) & (df_speed_sample['spd'] <= 35)])),
        'Fast (35-45)': int(len(df_speed_sample[(df_speed_sample['spd'] > 35) & (df_speed_sample['spd'] <= 45)])),
        'Very Fast (45+)': int(len(df_speed_sample[df_speed_sample['spd'] > 45]))
    }
}

analysis_data['layers']['speed_zones'] = {
    'type': 'speed_heatmap',
    'points': speed_heatmap_points,
    'stats': speed_stats,
    'sample_size': sample_size,
    'total_records': len(moving_df)
}
print(f'✅ Found {len(violations_data)} violations and created speed heatmap with {sample_size:,} points')

print('\n🔍 Detecting Anomalies...')
# Anomaly Detection
anomalies = []

# Speed anomalies
speed_z_scores = np.abs(stats.zscore(df_clean['spd']))
speed_anomalies = df_clean[speed_z_scores > 2.5]

for _, row in speed_anomalies.head(20).iterrows():
    anomalies.append({
        'type': 'speed',
        'lat': float(row['lat']),
        'lng': float(row['lng']),
        'value': float(row['spd']),
        'description': f'Unusual speed: {row["spd"]:.1f} km/h',
        'driver_id': str(row['randomized_id'])
    })

# Geographic anomalies
center_lat, center_lng = bounds['center_lat'], bounds['center_lng']
df_clean['dist_from_center'] = np.sqrt(
    (df_clean['lat'] - center_lat)**2 + (df_clean['lng'] - center_lng)**2
)
geo_z_scores = np.abs(stats.zscore(df_clean['dist_from_center']))
geo_anomalies = df_clean[geo_z_scores > 2.5]

for _, row in geo_anomalies.head(15).iterrows():
    anomalies.append({
        'type': 'geographic',
        'lat': float(row['lat']),
        'lng': float(row['lng']),
        'value': float(row['dist_from_center']),
        'description': 'Isolated location',
        'driver_id': str(row['randomized_id'])
    })

# Altitude anomalies
alt_z_scores = np.abs(stats.zscore(df_clean['alt']))
alt_anomalies = df_clean[alt_z_scores > 2.5]

for _, row in alt_anomalies.head(15).iterrows():
    anomalies.append({
        'type': 'altitude',
        'lat': float(row['lat']),
        'lng': float(row['lng']),
        'value': float(row['alt']),
        'description': f'Unusual altitude: {row["alt"]:.0f}m',
        'driver_id': str(row['randomized_id'])
    })

analysis_data['layers']['anomalies'] = anomalies
print(f'✅ Found {len(anomalies)} anomalies')

# Save to JSON
with open("taxi_analysis_data.json", 'w') as f:
    json.dump(analysis_data, f, indent=2)

print('\n' + '='*60)
print('🎉 DATA EXTRACTION COMPLETED!')
print('='*60)
print(f'📊 Processed {len(df_clean):,} records')
print(f'🗺️ Routes: {len(routes_data)} corridors')
print(f'🚨 Traffic Jams: {len(jams_data)} areas')
print(f'📊 Demand Zones: {len(demand_data)} zones')
print(f'🟢 Availability: {len(availability_data)} zones')
print(f'⚡ Speed Violations: {len(violations_data)} cases')
print(f'⚡ Speed Heatmap: {sample_size:,} sample points')
print(f'🔍 Anomalies: {len(anomalies)} cases')
print(f'\n💾 Data saved to: taxi_analysis_data.json')
print('✅ Ready for HTML visualization!')