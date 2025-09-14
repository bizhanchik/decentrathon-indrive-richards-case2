import time
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
import json
import math
import random
from typing import Dict, List, Set, Optional
import h3
from dataclasses import dataclass, asdict
from enum import Enum
from scipy.optimize import linear_sum_assignment
import numpy as np
import requests
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(_: FastAPI):
    order_task = asyncio.create_task(order_simulator())
    assignment_task = asyncio.create_task(assignment_processor())
    demand_task = asyncio.create_task(demand_processor())
    yield
    order_task.cancel()
    assignment_task.cancel()
    demand_task.cancel()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ORS_API_KEYS = [
    "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImVkNDRmNWVkYmM2MDRkMmQ5Y2FmZTEwODVlNzQ2NmQzIiwiaCI6Im11cm11cjY0In0=",
    "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjYyZGM5NTY5MGE3NDRlNWI4NjcyMWViYTMwMTk2MDcxIiwiaCI6Im11cm11cjY0In0=",
    "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImYwYjNmNTU5MjhlODRhN2FhNGJhZTc0ZWE3ZTI3N2E0IiwiaCI6Im11cm11cjY0In0=",
    "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjBkYmI4NGU5YWUxMDQyY2Q4NTM3MDA4YjY3MWY4MGRlIiwiaCI6Im11cm11cjY0In0=",
    "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImI0NzM5YjUxNmJmZDRlNTc5OTAwYTgzNGJmNzE0MGNlIiwiaCI6Im11cm11cjY0In0="
]

CENTER_LAT = 51.111339
CENTER_LNG = 71.415581

# System configuration constants
MAX_TAXIS = 10
MAX_PENDING_ORDERS = 50
MAX_COMPLETED_ORDERS = 2
H3_RESOLUTION = 7  # ~1.2km hex diameter for city-wide coverage

USE_ROUTES_PLANNER = True

class TaxiStatus(Enum):
    FREE = "free"
    BUSY = "busy"

class OrderStatus(Enum):
    PENDING = "pending"
    ASSIGNED = "assigned"
    COMPLETED = "completed"

@dataclass
class Location:
    lat: float
    lng: float

@dataclass
class Route:
    path: List[List[float]]
    duration: float

@dataclass
class Taxi:
    id: str
    location: Location
    status: TaxiStatus

@dataclass
class Order:
    id: str
    pickup: Location
    dropoff: Location
    status: OrderStatus

@dataclass
class Assignment:
    taxi_id: str
    order_id: str
    to_pickup_route: Route
    to_dropoff_route: Route
    algorithm_used: str = "hybrid"  # Track which algorithm created this assignment

@dataclass
class DemandHexagon:
    hex_id: str
    center: List[float]  # [lat, lng]
    boundary: List[List[float]]  # [[lat, lng], ...]
    orders_count: int
    taxis_count: int
    demand_ratio: float
    color: str
    demand_level: str

class TaxiDispatchSystem:
    def __init__(self):
        self.taxis: Dict[str, Taxi] = {}
        self.orders: Dict[str, Order] = {}
        self.assignments: Dict[str, Assignment] = {}
        self.connected_clients: Set[WebSocket] = set()
        self.order_counter = 0
        self.demand_hexagons: Dict[str, DemandHexagon] = {}
        self.all_hexagons: Set[str] = set()
        
        # Algorithm configuration
        self.algorithm_config = {
            'use_proximity': True,
            'use_supply_demand': True
        }
        
        self._initialize_taxis()
        self._initialize_hexagon_grid()

    def _initialize_taxis(self):
        for i in range(MAX_TAXIS):
            taxi_id = f"taxi_{i+1}"
            location = Location(
                lat=CENTER_LAT + random.uniform(-0.035, 0.035),
                lng=CENTER_LNG + random.uniform(-0.035, 0.035)
            )
            self.taxis[taxi_id] = Taxi(id=taxi_id, location=location, status=TaxiStatus.FREE)

    def _initialize_hexagon_grid(self):
        """Create continuous H3 hexagon grid covering the operational area"""
        # Define large area around Astana center  
        area_radius = 0.10  # ~10km radius for extended city coverage
        
        # Create bounding box
        lat_min = CENTER_LAT - area_radius
        lat_max = CENTER_LAT + area_radius
        lng_min = CENTER_LNG - area_radius  
        lng_max = CENTER_LNG + area_radius
        
        # Get all H3 hexagons covering this area
        # Use a simpler approach - get hexagons from grid sampling
        hexagons = set()
        
        # Sample grid points across the bounding box and get their hexagons
        lat_steps = 20
        lng_steps = 25
        
        for i in range(lat_steps):
            for j in range(lng_steps):
                lat = lat_min + (lat_max - lat_min) * i / (lat_steps - 1)
                lng = lng_min + (lng_max - lng_min) * j / (lng_steps - 1)
                hex_id = h3.latlng_to_cell(lat, lng, H3_RESOLUTION)
                hexagons.add(hex_id)
        self.all_hexagons = hexagons
        
        # Initialize all hexagons with zero demand
        for hex_id in self.all_hexagons:
            center = h3.cell_to_latlng(hex_id)
            boundary = h3.cell_to_boundary(hex_id)
            boundary_coords = [[lat, lng] for lat, lng in boundary]
            
            self.demand_hexagons[hex_id] = DemandHexagon(
                hex_id=hex_id,
                center=[center[0], center[1]],
                boundary=boundary_coords,
                orders_count=0,
                taxis_count=0,
                demand_ratio=0.0,
                color='#F0F0F0',  # Light gray for no activity
                demand_level='None'
            )
        
        logger.info(f"Initialized {len(self.all_hexagons)} H3 hexagons with resolution {H3_RESOLUTION}")

    def get_distance(self, loc1: Location, loc2: Location) -> float:
        R = 6371
        dLat = math.radians(loc2.lat - loc1.lat)
        dLon = math.radians(loc2.lng - loc1.lng)
        a = (math.sin(dLat / 2) ** 2 + 
             math.cos(math.radians(loc1.lat)) * math.cos(math.radians(loc2.lat)) * 
             math.sin(dLon / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    async def get_route(self, start: Location, end: Location) -> Route:
        max_retries = 4
        base_delay = 2

        used_api_key = random.choice(ORS_API_KEYS)
        
        if USE_ROUTES_PLANNER:
            for attempt in range(max_retries):
                try:
                    url = "https://api.openrouteservice.org/v2/directions/driving-car/geojson"
                    body = {"coordinates": [[start.lng, start.lat], [end.lng, end.lat]]}
                    response = requests.post(
                        url, 
                        json=body, 
                        params={"api_key": used_api_key},
                        headers={"Content-Type": "application/json"},
                        timeout=15  # Increased timeout
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        if "features" in data and data["features"]:
                            coords = data["features"][0]["geometry"]["coordinates"]
                            path = [[lat, lng] for lng, lat in coords]
                            duration = data["features"][0]["properties"]["summary"]["duration"]
                            logger.info(f"Route constructed successfully on attempt {attempt + 1}")
                            return Route(path=path, duration=duration)
                    
                    # Rate limiting or temporary error
                    if response.status_code == 429:
                        if attempt >= 3:
                            used_api_key = random.choice(ORS_API_KEYS)
                            logger.warning(f"Using different API key: {used_api_key}")

                        delay = base_delay * (2 ** attempt)
                        logger.warning(f"Rate limited, waiting {delay}s before retry {attempt + 1}")
                        await asyncio.sleep(delay)
                        continue
                        
                except Exception as e:
                    delay = base_delay * (2 ** attempt)
                    logger.warning(f"ORS API attempt {attempt + 1} failed: {e}, retrying in {delay}s")
                    await asyncio.sleep(delay)
        
        logger.error("All route construction attempts failed, using fallback")
        return self._create_fallback_route(start, end)

    def _create_fallback_route(self, start: Location, end: Location, steps: int = 20) -> Route:
        path = []
        for i in range(steps + 1):
            frac = i / steps
            lat = start.lat + (end.lat - start.lat) * frac
            lng = start.lng + (end.lng - start.lng) * frac
            path.append([lat, lng])
        return Route(path=path, duration=60)

    def create_order(self) -> Optional[Order]:
        # Check if we've reached the pending orders limit
        pending_count = len([o for o in self.orders.values() if o.status == OrderStatus.PENDING])
        if pending_count >= MAX_PENDING_ORDERS:
            logger.warning(f"Maximum pending orders ({MAX_PENDING_ORDERS}) reached, skipping order creation")
            return None
        
        self.order_counter += 1
        order_id = f"order_{self.order_counter}"
        
        # Generate pickup location randomly within ~3.5km radius of city center
        # 0.07 degrees is approximately 7km total range (3.5km in each direction)
        pickup = Location(
            lat=CENTER_LAT + (random.random() - 0.5) * 0.07,  # Random offset from center latitude
            lng=CENTER_LNG + (random.random() - 0.5) * 0.07   # Random offset from center longitude
        )
        
        # Generate dropoff location as an offset from pickup location
        # This creates a trip with random direction and distance (up to ~3.5km from pickup)
        dropoff = Location(
            lat=pickup.lat + (random.random() - 0.5) * 0.07,  # Random offset from pickup latitude
            lng=pickup.lng + (random.random() - 0.5) * 0.07   # Random offset from pickup longitude
        )
        order = Order(id=order_id, pickup=pickup, dropoff=dropoff, status=OrderStatus.PENDING)
        self.orders[order_id] = order
        
        self._cleanup_old_orders()
        return order

    def _cleanup_old_orders(self):
        completed_orders = [o for o in self.orders.values() if o.status == OrderStatus.COMPLETED]
        if len(completed_orders) > MAX_COMPLETED_ORDERS:
            oldest_order = min(completed_orders, key=lambda o: o.id)
            del self.orders[oldest_order.id]


    async def assign_taxis_hybrid(self) -> List[Assignment]:
        """Hybrid algorithm combining distance and demand factors"""
        start_time = time.time()
        
        # Update demand hexagons to get the latest supply-demand ratios
        self.update_demand_hexagons()

        # Filter pending orders and free taxis
        pending_orders = [o for o in self.orders.values() if o.status == OrderStatus.PENDING]
        free_taxis = [t for t in self.taxis.values() if t.status == TaxiStatus.FREE]

        if not pending_orders or not free_taxis:
            return []

        num_taxis = len(free_taxis)
        num_orders = len(pending_orders)
        cost_matrix = np.zeros((num_taxis, num_orders))

        # Map orders to hex IDs
        order_hexes = {order.id: h3.latlng_to_cell(order.pickup.lat, order.pickup.lng, H3_RESOLUTION) 
                        for order in pending_orders}

        # Define weights for cost components
        WEIGHT_DISTANCE = 0.6  # 60% weight on distance
        WEIGHT_DEMAND = 0.4   # 40% weight on demand ratio (inverse)

        # Calculate demand-weighted cost matrix
        for i, taxi in enumerate(free_taxis):
            for j, order in enumerate(pending_orders):
                # Base distance cost
                distance_cost = self.get_distance(taxi.location, order.pickup)
                
                # Get demand ratio for the order's hexagon
                hex_id = order_hexes[order.id]
                demand_ratio = (self.demand_hexagons[hex_id].demand_ratio 
                                if hex_id in self.demand_hexagons and self.demand_hexagons[hex_id].taxis_count > 0 
                                else float('inf') if self.demand_hexagons[hex_id].orders_count > 0 else 1.0)
                
                # Inverse demand weighting (higher demand lowers cost)
                demand_weight = min(1.0, 1.0 / (demand_ratio + 1e-6))
                
                # Combined cost: weighted sum of distance and demand influence
                combined_cost = (WEIGHT_DISTANCE * distance_cost + 
                                WEIGHT_DEMAND * distance_cost * (1 - demand_weight))
                
                cost_matrix[i][j] = combined_cost

        # Perform assignment using Hungarian algorithm
        row_ind, col_ind = linear_sum_assignment(cost_matrix)

        # Create assignments and routes
        new_assignments = []
        for row, col in zip(row_ind, col_ind):
            if col < num_orders:
                taxi = free_taxis[row]
                order = pending_orders[col]
                
                taxi.status = TaxiStatus.BUSY
                order.status = OrderStatus.ASSIGNED
                
                logger.info(f"Constructing routes for taxi {taxi.id} to order {order.id}...")
                
                # Wait for proper route construction with retries
                to_pickup = await self.get_route(taxi.location, order.pickup)
                to_dropoff = await self.get_route(order.pickup, order.dropoff)
                
                assignment = Assignment(
                    taxi_id=taxi.id,
                    order_id=order.id,
                    to_pickup_route=to_pickup,
                    to_dropoff_route=to_dropoff,
                    algorithm_used="hybrid"
                )
                
                self.assignments[order.id] = assignment
                new_assignments.append(assignment)

        total_time = time.time() - start_time
        logger.info(f"  └─ TOTAL hybrid assignment: {total_time:.3f}s")
        return new_assignments

    async def assign_taxis_optimally(self) -> List[Assignment]:
        """Dynamic algorithm router based on configuration"""
        config = self.algorithm_config
        algorithm_name = self.get_current_algorithm_name()
        
        logger.info(f"Using algorithm: {algorithm_name}")
        
        if config['use_proximity'] and config['use_supply_demand']:
            return await self.assign_taxis_hybrid()
        elif config['use_proximity']:
            return await self.assign_taxis_proximity_only()
        elif config['use_supply_demand']:
            return await self.assign_taxis_demand_only()
        else:
            # Default to proximity if nothing selected
            return await self.assign_taxis_proximity_only()

    async def assign_taxis_proximity_only(self) -> List[Assignment]:
        """Original proximity-based assignment algorithm"""
        start_time = time.time()
        
        # Filter pending orders and free taxis
        pending_orders = [o for o in self.orders.values() if o.status == OrderStatus.PENDING]
        free_taxis = [t for t in self.taxis.values() if t.status == TaxiStatus.FREE]
        
        if not pending_orders or not free_taxis:
            return []

        # Simple distance-based cost matrix
        cost_matrix = np.zeros((len(free_taxis), len(pending_orders)))
        for i, taxi in enumerate(free_taxis):
            for j, order in enumerate(pending_orders):
                cost_matrix[i, j] = self.get_distance(taxi.location, order.pickup)

        row_ind, col_ind = linear_sum_assignment(cost_matrix)
        
        new_assignments = []
        for row, col in zip(row_ind, col_ind):
            if col < len(pending_orders):
                taxi = free_taxis[row]
                order = pending_orders[col]
                
                taxi.status = TaxiStatus.BUSY
                order.status = OrderStatus.ASSIGNED
                
                logger.info(f"Constructing routes for taxi {taxi.id} to order {order.id}...")
                
                # Wait for proper route construction with retries
                to_pickup = await self.get_route(taxi.location, order.pickup)
                to_dropoff = await self.get_route(order.pickup, order.dropoff)
                
                assignment = Assignment(
                    taxi_id=taxi.id,
                    order_id=order.id,
                    to_pickup_route=to_pickup,
                    to_dropoff_route=to_dropoff,
                    algorithm_used="proximity"
                )
                
                self.assignments[order.id] = assignment
                new_assignments.append(assignment)

        total_time = time.time() - start_time
        logger.info(f"  └─ TOTAL proximity-only assignment: {total_time:.3f}s")
        return new_assignments

    async def assign_taxis_demand_only(self) -> List[Assignment]:
        """Supply-demand based assignment algorithm"""
        start_time = time.time()
        
        # Update demand hexagons
        self.update_demand_hexagons()

        # Filter pending orders and free taxis
        pending_orders = [o for o in self.orders.values() if o.status == OrderStatus.PENDING]
        free_taxis = [t for t in self.taxis.values() if t.status == TaxiStatus.FREE]
        
        if not pending_orders or not free_taxis:
            return []

        # Demand-based cost matrix
        cost_matrix = np.zeros((len(free_taxis), len(pending_orders)))
        for i, taxi in enumerate(free_taxis):
            for j, order in enumerate(pending_orders):
                # Get demand ratio for the order's hexagon
                hex_id = h3.latlng_to_cell(order.pickup.lat, order.pickup.lng, H3_RESOLUTION)
                if hex_id in self.demand_hexagons:
                    demand_ratio = self.demand_hexagons[hex_id].demand_ratio
                    if demand_ratio == float('inf'):
                        cost_matrix[i, j] = 0.1  # Very low cost for high unmet demand
                    elif demand_ratio > 0:
                        cost_matrix[i, j] = 1.0 / (demand_ratio + 1e-6)  # Inverse demand cost
                    else:
                        cost_matrix[i, j] = 1.0  # Normal cost for no demand
                else:
                    cost_matrix[i, j] = 1.0  # Default cost

        row_ind, col_ind = linear_sum_assignment(cost_matrix)
        
        new_assignments = []
        for row, col in zip(row_ind, col_ind):
            if col < len(pending_orders):
                taxi = free_taxis[row]
                order = pending_orders[col]
                
                taxi.status = TaxiStatus.BUSY
                order.status = OrderStatus.ASSIGNED
                
                logger.info(f"Constructing routes for taxi {taxi.id} to order {order.id}...")
                
                to_pickup = await self.get_route(taxi.location, order.pickup)
                to_dropoff = await self.get_route(order.pickup, order.dropoff)
                
                assignment = Assignment(
                    taxi_id=taxi.id,
                    order_id=order.id,
                    to_pickup_route=to_pickup,
                    to_dropoff_route=to_dropoff,
                    algorithm_used="demand"
                )
                
                self.assignments[order.id] = assignment
                new_assignments.append(assignment)

        total_time = time.time() - start_time
        logger.info(f"  └─ TOTAL demand-only assignment: {total_time:.3f}s")
        return new_assignments

    def complete_assignment(self, order_id: str):
        if order_id in self.assignments:
            assignment = self.assignments[order_id]
            
            if assignment.taxi_id in self.taxis:
                taxi = self.taxis[assignment.taxi_id]
                taxi.status = TaxiStatus.FREE
                
                last_point = assignment.to_dropoff_route.path[-1]
                taxi.location = Location(lat=last_point[0], lng=last_point[1])
            
            if order_id in self.orders:
                self.orders[order_id].status = OrderStatus.COMPLETED
            
            del self.assignments[order_id]

    async def broadcast_state(self):
        if not self.connected_clients:
            return
        
        def serialize_enum(obj):
            if isinstance(obj, dict):
                return {k: serialize_enum(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [serialize_enum(item) for item in obj]
            elif hasattr(obj, 'value'):  # Enum
                return obj.value
            else:
                return obj
            
        state = {
            "type": "state_update",
            "taxis": [serialize_enum(asdict(taxi)) for taxi in self.taxis.values()],
            "orders": [serialize_enum(asdict(order)) for order in self.orders.values()],
            "assignments": [serialize_enum(asdict(assignment)) for assignment in self.assignments.values()]
        }
        
        message = json.dumps(state)
        disconnected = set()
        
        for client in self.connected_clients:
            try:
                await client.send_text(message)
            except:
                disconnected.add(client)
        
        self.connected_clients -= disconnected

    def update_demand_hexagons(self):
        """Calculate real-time demand for all hexagons"""
        # Reset all hexagon counts
        for hex_data in self.demand_hexagons.values():
            hex_data.orders_count = 0
            hex_data.taxis_count = 0
        
        # Count pending orders per hexagon
        for order in self.orders.values():
            if order.status == OrderStatus.PENDING:
                hex_id = h3.latlng_to_cell(order.pickup.lat, order.pickup.lng, H3_RESOLUTION)
                if hex_id in self.demand_hexagons:
                    self.demand_hexagons[hex_id].orders_count += 1
        
        # Count free taxis per hexagon
        for taxi in self.taxis.values():
            if taxi.status == TaxiStatus.FREE:
                hex_id = h3.latlng_to_cell(taxi.location.lat, taxi.location.lng, H3_RESOLUTION)
                if hex_id in self.demand_hexagons:
                    self.demand_hexagons[hex_id].taxis_count += 1
        
        # Calculate demand ratio and colors for each hexagon
        for hex_data in self.demand_hexagons.values():
            orders = hex_data.orders_count
            taxis = hex_data.taxis_count
            
            if orders == 0 and taxis == 0:
                hex_data.demand_ratio = 0.0
                hex_data.color = '#F0F0F0'  # Light gray - no activity
                hex_data.demand_level = 'None'
            elif orders == 0:
                hex_data.demand_ratio = 0.0
                hex_data.color = '#90EE90'  # Light green - only taxis
                hex_data.demand_level = 'Supply Only'
            elif taxis == 0:
                hex_data.demand_ratio = float('inf')
                hex_data.color = '#FF4500'  # Red-orange - unmet demand
                hex_data.demand_level = 'High Unmet Demand'
            else:
                hex_data.demand_ratio = orders / taxis
                hex_data.color = self._get_demand_color(hex_data.demand_ratio)
                hex_data.demand_level = self._get_demand_level(hex_data.demand_ratio)

    def _get_demand_color(self, ratio: float) -> str:
        """Get color based on demand ratio (orders/taxis)"""
        if ratio == 0:
            return '#F0F0F0'  # Light gray - no demand
        elif ratio < 0.5:
            return '#90EE90'  # Light green - low demand
        elif ratio < 1.0:
            return '#FFD700'  # Gold - moderate demand
        elif ratio < 2.0:
            return '#FFA500'  # Orange - high demand
        else:
            return '#FF4500'  # Red-orange - very high demand

    def _get_demand_level(self, ratio: float) -> str:
        """Get demand level description"""
        if ratio == 0:
            return 'No Demand'
        elif ratio < 0.5:
            return 'Low Demand'
        elif ratio < 1.0:
            return 'Moderate Demand'
        elif ratio < 2.0:
            return 'High Demand'
        else:
            return 'Very High Demand'

    async def broadcast_demand_update(self):
        """Send demand hexagon updates via separate WebSocket message"""
        if not self.connected_clients:
            return
        
        self.update_demand_hexagons()
        
        # Prepare demand data for frontend - send ALL hexagons
        hexagons_data = []
        for hex_data in self.demand_hexagons.values():
            hexagons_data.append({
                'hex_id': hex_data.hex_id,
                'center': hex_data.center,
                'boundary': hex_data.boundary,
                'orders_count': hex_data.orders_count,
                'taxis_count': hex_data.taxis_count,
                'demand_ratio': hex_data.demand_ratio if hex_data.demand_ratio != float('inf') else -1,
                'color': hex_data.color,
                'demand_level': hex_data.demand_level
            })
        
        demand_message = {
            'type': 'demand_update',
            'hexagons': hexagons_data,
            'total_hexagons': len(self.all_hexagons),
            'active_hexagons': len(hexagons_data),
            'h3_resolution': H3_RESOLUTION
        }
        
        message = json.dumps(demand_message)
        disconnected = set()
        
        for client in self.connected_clients:
            try:
                await client.send_text(message)
            except:
                disconnected.add(client)
        
        self.connected_clients -= disconnected

    def update_algorithm_config(self, proximity: bool, supply_demand: bool):
        """Update algorithm configuration"""
        self.algorithm_config = {
            'use_proximity': proximity,
            'use_supply_demand': supply_demand
        }
        algorithm_name = self.get_current_algorithm_name()
        logger.info(f"Algorithm configuration updated: {algorithm_name}")

    def get_current_algorithm_name(self) -> str:
        """Get the current algorithm name for logging"""
        config = self.algorithm_config
        if config['use_proximity'] and config['use_supply_demand']:
            return "Distance + Demand (Hybrid)"
        elif config['use_proximity']:
            return "Distance-Based (Proximity Only)"
        elif config['use_supply_demand']:
            return "Demand-Based (Supply-Demand Only)"
        else:
            return "Distance-Based (Default)"

    def add_client(self, websocket: WebSocket):
        self.connected_clients.add(websocket)
        logger.info(f"Client connected. Total clients: {len(self.connected_clients)}")

    def remove_client(self, websocket: WebSocket):
        self.connected_clients.discard(websocket)
        logger.info(f"Client disconnected. Total clients: {len(self.connected_clients)}")
        
        # If no clients remain, clean up simulation state to save resources
        if not self.connected_clients:
            logger.info("No clients connected - entering idle mode")
            self._cleanup_simulation_state()

    def _cleanup_simulation_state(self):
        """Clean up simulation state when no clients are connected"""
        # Keep existing completed orders but clear pending orders and assignments
        pending_orders = [o_id for o_id, order in self.orders.items() if order.status == OrderStatus.PENDING]
        for order_id in pending_orders:
            del self.orders[order_id]
            
        # Clear all assignments and set all taxis to free
        self.assignments.clear()
        for taxi in self.taxis.values():
            taxi.status = TaxiStatus.FREE
            
        logger.info(f"Cleaned up {len(pending_orders)} pending orders and all assignments")

dispatch_system = TaxiDispatchSystem()

async def order_simulator():
    while True:
        # Only generate orders if there are connected clients
        if dispatch_system.connected_clients:
            order = dispatch_system.create_order()
            if order:
                logger.info(f"Created order: {order.id}")
                await dispatch_system.broadcast_state()
        else:
            logger.debug("No connected clients, skipping order generation")
        await asyncio.sleep(3)

async def assignment_processor():
    while True:
        # Only process assignments if there are connected clients
        if dispatch_system.connected_clients:
            logger.info(f"Assigning taxis optimally...")
            time_start = time.time()
            assignments = await dispatch_system.assign_taxis_optimally()
            time_end = time.time()
            logger.info(f"Time taken to assign taxis: {time_end - time_start} seconds")
            if assignments:
                logger.info(f"Created {len(assignments)} assignments")
                await dispatch_system.broadcast_state()
        else:
            logger.debug("No connected clients, skipping taxi assignment")
        await asyncio.sleep(5)

async def demand_processor():
    """Process demand hexagon updates separately from main simulation"""
    while True:
        # Only update demand if there are connected clients
        if dispatch_system.connected_clients:
            await dispatch_system.broadcast_demand_update()
        else:
            logger.debug("No connected clients, skipping demand update")
        await asyncio.sleep(2)  # Update demand every 2 seconds


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    dispatch_system.add_client(websocket)
    
    await dispatch_system.broadcast_state()
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "complete_assignment":
                order_id = message.get("order_id")
                if order_id:
                    dispatch_system.complete_assignment(order_id)
                    await dispatch_system.broadcast_state()
            elif message.get("type") == "algorithm_config":
                proximity = message.get("proximity", True)
                supply_demand = message.get("supply_demand", False)
                dispatch_system.update_algorithm_config(proximity, supply_demand)
                    
    except WebSocketDisconnect:
        dispatch_system.remove_client(websocket)

@app.get("/")
async def root():
    return {"message": "Taxi Dispatch System API"}