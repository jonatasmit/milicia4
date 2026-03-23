from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="Milícia Digital API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

class PinBase(BaseModel):
    lat: float
    lng: float
    pin_type: Literal["hq", "ally", "enemy"]
    label: Optional[str] = None

class PinCreate(PinBase):
    pass

class PinUpdate(BaseModel):
    lat: Optional[float] = None
    lng: Optional[float] = None
    label: Optional[str] = None

class Pin(PinBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class RouteBase(BaseModel):
    points: List[dict]  # [{lat: float, lng: float}, ...]
    route_type: Literal["attack", "defense", "patrol"]
    label: Optional[str] = None

class RouteCreate(RouteBase):
    pass

class Route(RouteBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ZoneBase(BaseModel):
    lat: float
    lng: float
    radius: float  # in meters
    zone_type: Literal["protection", "danger"]
    label: Optional[str] = None

class ZoneCreate(ZoneBase):
    pass

class Zone(ZoneBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MapState(BaseModel):
    pins: List[Pin]
    routes: List[Route]
    zones: List[Zone]

# ==================== PIN ENDPOINTS ====================

@api_router.get("/pins", response_model=List[Pin])
async def get_pins():
    pins = await db.pins.find({}, {"_id": 0}).to_list(1000)
    for pin in pins:
        if isinstance(pin.get('created_at'), str):
            pin['created_at'] = datetime.fromisoformat(pin['created_at'])
    return pins

@api_router.post("/pins", response_model=Pin)
async def create_pin(pin_data: PinCreate):
    pin = Pin(**pin_data.model_dump())
    doc = pin.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.pins.insert_one(doc)
    return pin

@api_router.put("/pins/{pin_id}", response_model=Pin)
async def update_pin(pin_id: str, pin_update: PinUpdate):
    update_data = {k: v for k, v in pin_update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    
    result = await db.pins.find_one_and_update(
        {"id": pin_id},
        {"$set": update_data},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Pin not found")
    
    result.pop('_id', None)
    if isinstance(result.get('created_at'), str):
        result['created_at'] = datetime.fromisoformat(result['created_at'])
    return Pin(**result)

@api_router.delete("/pins/{pin_id}")
async def delete_pin(pin_id: str):
    result = await db.pins.delete_one({"id": pin_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Pin not found")
    return {"message": "Pin deleted", "id": pin_id}

# ==================== ROUTE ENDPOINTS ====================

@api_router.get("/routes", response_model=List[Route])
async def get_routes():
    routes = await db.routes.find({}, {"_id": 0}).to_list(1000)
    for route in routes:
        if isinstance(route.get('created_at'), str):
            route['created_at'] = datetime.fromisoformat(route['created_at'])
    return routes

@api_router.post("/routes", response_model=Route)
async def create_route(route_data: RouteCreate):
    route = Route(**route_data.model_dump())
    doc = route.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.routes.insert_one(doc)
    return route

@api_router.delete("/routes/{route_id}")
async def delete_route(route_id: str):
    result = await db.routes.delete_one({"id": route_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Route not found")
    return {"message": "Route deleted", "id": route_id}

# ==================== ZONE ENDPOINTS ====================

@api_router.get("/zones", response_model=List[Zone])
async def get_zones():
    zones = await db.zones.find({}, {"_id": 0}).to_list(1000)
    for zone in zones:
        if isinstance(zone.get('created_at'), str):
            zone['created_at'] = datetime.fromisoformat(zone['created_at'])
    return zones

@api_router.post("/zones", response_model=Zone)
async def create_zone(zone_data: ZoneCreate):
    zone = Zone(**zone_data.model_dump())
    doc = zone.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.zones.insert_one(doc)
    return zone

@api_router.delete("/zones/{zone_id}")
async def delete_zone(zone_id: str):
    result = await db.zones.delete_one({"id": zone_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Zone not found")
    return {"message": "Zone deleted", "id": zone_id}

# ==================== MAP STATE ENDPOINTS ====================

@api_router.get("/map-state", response_model=MapState)
async def get_map_state():
    pins = await db.pins.find({}, {"_id": 0}).to_list(1000)
    routes = await db.routes.find({}, {"_id": 0}).to_list(1000)
    zones = await db.zones.find({}, {"_id": 0}).to_list(1000)
    
    for pin in pins:
        if isinstance(pin.get('created_at'), str):
            pin['created_at'] = datetime.fromisoformat(pin['created_at'])
    for route in routes:
        if isinstance(route.get('created_at'), str):
            route['created_at'] = datetime.fromisoformat(route['created_at'])
    for zone in zones:
        if isinstance(zone.get('created_at'), str):
            zone['created_at'] = datetime.fromisoformat(zone['created_at'])
    
    return MapState(pins=pins, routes=routes, zones=zones)

@api_router.delete("/clear-all")
async def clear_all():
    await db.pins.delete_many({})
    await db.routes.delete_many({})
    await db.zones.delete_many({})
    return {"message": "All map data cleared"}

# Health check
@api_router.get("/")
async def root():
    return {"message": "Milícia Digital API Online", "status": "operational"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
