from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import secrets
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Milícia Digital API")
api_router = APIRouter(prefix="/api")
security = HTTPBasic()

# Admin credentials
ADMIN_USER = "admin"
ADMIN_PASS = "0972044108A!bc"

def verify_admin(credentials: HTTPBasicCredentials = Depends(security)):
    correct_user = secrets.compare_digest(credentials.username, ADMIN_USER)
    correct_pass = secrets.compare_digest(credentials.password, ADMIN_PASS)
    if not (correct_user and correct_pass):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    return credentials.username

# ==================== MODELS ====================

class EventCreate(BaseModel):
    event_type: str  # page_view, click_play, mission_start, mission_complete, whatsapp_click, cupom_view
    session_id: str
    user_agent: Optional[str] = None
    referrer: Optional[str] = None
    mission_id: Optional[int] = None
    xp: Optional[int] = None
    creditos: Optional[int] = None
    extra_data: Optional[dict] = None

class Event(EventCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AnalyticsSummary(BaseModel):
    total_visits: int
    unique_sessions: int
    play_clicks: int
    missions_started: int
    missions_completed: int
    whatsapp_clicks: int
    cupom_views: int
    conversion_rate: float
    avg_xp: float
    avg_creditos: float

# ==================== ANALYTICS ENDPOINTS ====================

@api_router.post("/events")
async def track_event(event_data: EventCreate):
    """Track user events for analytics"""
    event = Event(**event_data.model_dump())
    doc = event.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.events.insert_one(doc)
    return {"status": "tracked", "id": event.id}

@api_router.get("/admin/analytics", response_model=AnalyticsSummary)
async def get_analytics(credentials: HTTPBasicCredentials = Depends(verify_admin)):
    """Get analytics summary (admin only)"""
    
    # Total page views
    total_visits = await db.events.count_documents({"event_type": "page_view"})
    
    # Unique sessions
    pipeline = [
        {"$group": {"_id": "$session_id"}},
        {"$count": "count"}
    ]
    unique_result = await db.events.aggregate(pipeline).to_list(1)
    unique_sessions = unique_result[0]["count"] if unique_result else 0
    
    # Event counts
    play_clicks = await db.events.count_documents({"event_type": "click_play"})
    missions_started = await db.events.count_documents({"event_type": "mission_start"})
    missions_completed = await db.events.count_documents({"event_type": "mission_complete"})
    whatsapp_clicks = await db.events.count_documents({"event_type": "whatsapp_click"})
    cupom_views = await db.events.count_documents({"event_type": "cupom_view"})
    
    # Conversion rate (whatsapp clicks / visits)
    conversion_rate = (whatsapp_clicks / total_visits * 100) if total_visits > 0 else 0
    
    # Average XP and credits
    xp_pipeline = [
        {"$match": {"xp": {"$exists": True, "$ne": None}}},
        {"$group": {"_id": None, "avg": {"$avg": "$xp"}}}
    ]
    xp_result = await db.events.aggregate(xp_pipeline).to_list(1)
    avg_xp = xp_result[0]["avg"] if xp_result else 0
    
    cred_pipeline = [
        {"$match": {"creditos": {"$exists": True, "$ne": None}}},
        {"$group": {"_id": None, "avg": {"$avg": "$creditos"}}}
    ]
    cred_result = await db.events.aggregate(cred_pipeline).to_list(1)
    avg_creditos = cred_result[0]["avg"] if cred_result else 0
    
    return AnalyticsSummary(
        total_visits=total_visits,
        unique_sessions=unique_sessions,
        play_clicks=play_clicks,
        missions_started=missions_started,
        missions_completed=missions_completed,
        whatsapp_clicks=whatsapp_clicks,
        cupom_views=cupom_views,
        conversion_rate=round(conversion_rate, 2),
        avg_xp=round(avg_xp or 0, 1),
        avg_creditos=round(avg_creditos or 0, 2)
    )

@api_router.get("/admin/events")
async def get_events(
    limit: int = 100,
    event_type: Optional[str] = None,
    credentials: HTTPBasicCredentials = Depends(verify_admin)
):
    """Get recent events (admin only)"""
    query = {}
    if event_type:
        query["event_type"] = event_type
    
    events = await db.events.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    return events

@api_router.get("/admin/funnel")
async def get_funnel(credentials: HTTPBasicCredentials = Depends(verify_admin)):
    """Get conversion funnel data (admin only)"""
    
    # Funil de conversão
    page_views = await db.events.count_documents({"event_type": "page_view"})
    play_clicks = await db.events.count_documents({"event_type": "click_play"})
    missions_started = await db.events.count_documents({"event_type": "mission_start"})
    step_completed = await db.events.count_documents({"event_type": "step_complete"})
    missions_completed = await db.events.count_documents({"event_type": "mission_complete"})
    whatsapp_clicks = await db.events.count_documents({"event_type": "whatsapp_click"})
    
    funnel = [
        {"step": "1. Visitou", "count": page_views, "rate": 100},
        {"step": "2. Clicou Jogar", "count": play_clicks, "rate": round(play_clicks/page_views*100, 1) if page_views else 0},
        {"step": "3. Iniciou Missão", "count": missions_started, "rate": round(missions_started/page_views*100, 1) if page_views else 0},
        {"step": "4. Completou Passo", "count": step_completed, "rate": round(step_completed/page_views*100, 1) if page_views else 0},
        {"step": "5. Completou Missão", "count": missions_completed, "rate": round(missions_completed/page_views*100, 1) if page_views else 0},
        {"step": "6. Clicou WhatsApp", "count": whatsapp_clicks, "rate": round(whatsapp_clicks/page_views*100, 1) if page_views else 0},
    ]
    
    return {"funnel": funnel, "total_visits": page_views}

@api_router.get("/admin/insights")
async def get_insights(credentials: HTTPBasicCredentials = Depends(verify_admin)):
    """Get AI-powered insights (admin only)"""
    
    # Coleta de dados
    page_views = await db.events.count_documents({"event_type": "page_view"})
    play_clicks = await db.events.count_documents({"event_type": "click_play"})
    missions_started = await db.events.count_documents({"event_type": "mission_start"})
    missions_completed = await db.events.count_documents({"event_type": "mission_complete"})
    whatsapp_clicks = await db.events.count_documents({"event_type": "whatsapp_click"})
    
    insights = []
    
    # Insight 1: Taxa de início de jogo
    if page_views > 0:
        play_rate = play_clicks / page_views * 100
        if play_rate < 30:
            insights.append({
                "type": "critical",
                "title": "Taxa de Início Baixa",
                "message": f"Apenas {play_rate:.1f}% dos visitantes clicam em JOGAR. Sugestão: Botão maior, mais chamativo, adicionar animação pulsante.",
                "metric": f"{play_rate:.1f}%"
            })
    
    # Insight 2: Abandono na primeira missão
    if play_clicks > 0:
        mission_rate = missions_started / play_clicks * 100
        if mission_rate < 50:
            insights.append({
                "type": "warning",
                "title": "Abandono na Seleção",
                "message": f"Apenas {mission_rate:.1f}% escolhem uma missão. Sugestão: Mostrar preview da missão, tutorial inicial mais claro.",
                "metric": f"{mission_rate:.1f}%"
            })
    
    # Insight 3: Conclusão de missões
    if missions_started > 0:
        complete_rate = missions_completed / missions_started * 100
        if complete_rate < 40:
            insights.append({
                "type": "warning",
                "title": "Missões não Completadas",
                "message": f"Apenas {complete_rate:.1f}% completam as missões. Sugestão: Missões mais curtas, feedback mais claro, dicas mais visíveis.",
                "metric": f"{complete_rate:.1f}%"
            })
    
    # Insight 4: Conversão WhatsApp
    if missions_completed > 0:
        whatsapp_rate = whatsapp_clicks / missions_completed * 100
        if whatsapp_rate < 20:
            insights.append({
                "type": "critical",
                "title": "Baixa Conversão WhatsApp",
                "message": f"Apenas {whatsapp_rate:.1f}% clicam no WhatsApp após completar. Sugestão: CTA mais urgente, mostrar produto específico, countdown timer.",
                "metric": f"{whatsapp_rate:.1f}%"
            })
        elif whatsapp_rate >= 20:
            insights.append({
                "type": "success",
                "title": "Boa Conversão WhatsApp",
                "message": f"{whatsapp_rate:.1f}% clicam no WhatsApp. Continue otimizando o fluxo!",
                "metric": f"{whatsapp_rate:.1f}%"
            })
    
    # Insight 5: Sem dados
    if page_views == 0:
        insights.append({
            "type": "info",
            "title": "Sem Dados Suficientes",
            "message": "Ainda não há dados suficientes para gerar insights. Continue promovendo o jogo!",
            "metric": "0"
        })
    
    return {"insights": insights, "raw": {
        "page_views": page_views,
        "play_clicks": play_clicks,
        "missions_started": missions_started,
        "missions_completed": missions_completed,
        "whatsapp_clicks": whatsapp_clicks
    }}

@api_router.delete("/admin/clear-events")
async def clear_events(credentials: HTTPBasicCredentials = Depends(verify_admin)):
    """Clear all events (admin only)"""
    result = await db.events.delete_many({})
    return {"message": f"Deleted {result.deleted_count} events"}

# Health check
@api_router.get("/")
async def root():
    return {"message": "Milícia Digital API", "status": "online"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
