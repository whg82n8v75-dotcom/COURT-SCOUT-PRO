from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from pydantic import BaseModel, Field, ConfigDict, BeforeValidator
from typing import List, Dict, Any, Optional, Literal, Annotated
from datetime import datetime, timezone
from pathlib import Path
import os
import json
import uuid
import logging

from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]

app = FastAPI()
api = APIRouter(prefix="/api")
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

PyObjectId = Annotated[str, BeforeValidator(lambda v: str(v) if isinstance(v, ObjectId) else v)]


def now_iso():
    return datetime.now(timezone.utc).isoformat()


class BaseDocument(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")
    id: Optional[PyObjectId] = Field(default=None, alias="_id")

    def to_mongo(self):
        return self.model_dump(by_alias=True, exclude={"id"})

    @classmethod
    def from_mongo(cls, doc):
        return cls.model_validate(doc)


class MatchIn(BaseModel):
    model_config = ConfigDict(extra="ignore")
    my_team: str = "Squadra Casa"
    opponent_team: str = "Avversari"
    venue: Literal["casa", "trasferta"] = "casa"
    date: str = ""
    time: str = ""
    location: str = ""
    quarter: str = "Q1"
    players: List[Dict[str, Any]] = []
    opponent_events: List[Dict[str, Any]] = []


class Match(BaseDocument, MatchIn):
    ai_analysis: str = ""
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)


class RosterIn(BaseModel):
    name: str
    players: List[Dict[str, Any]] = []


class Roster(BaseDocument, RosterIn):
    created_at: str = Field(default_factory=now_iso)


def to_oid(mid: str) -> ObjectId:
    if not ObjectId.is_valid(mid):
        raise HTTPException(404, "Non trovato")
    return ObjectId(mid)


def shot_pts(s):
    return (3 if s.get("is3Point") else 2) if s.get("result") == "made" else 0


def player_points(p):
    return sum(shot_pts(s) for s in p.get("shots", [])) + sum(1 for f in p.get("fts", []) if f.get("made"))


def scores(m):
    ours = sum(player_points(p) for p in m.get("players", []))
    opp = sum(e.get("pts", 0) for e in m.get("opponent_events", []))
    return ours, opp


def build_summary(m):
    players = m.get("players", [])
    pm = {p["id"]: p.get("stats", {}).get("pmAdj", 0) for p in players}

    def add(ids, v):
        for i in ids or []:
            if i in pm:
                pm[i] += v

    quarters = {q: {"nostri": 0, "avversari": 0} for q in ["Q1", "Q2", "Q3", "Q4", "OT"]}
    for p in players:
        for s in p.get("shots", []):
            if s.get("result") == "made":
                add(s.get("onCourt"), shot_pts(s))
                quarters[s.get("quarter", "Q1")]["nostri"] += shot_pts(s)
        for f in p.get("fts", []):
            if f.get("made"):
                add(f.get("onCourt"), 1)
                quarters[f.get("quarter", "Q1")]["nostri"] += 1
    for e in m.get("opponent_events", []):
        add(e.get("onCourt"), -e.get("pts", 0))
        quarters[e.get("quarter", "Q1")]["avversari"] += e.get("pts", 0)

    lines = []
    for p in players:
        shots = p.get("shots", [])
        st = p.get("stats", {})
        fts = p.get("fts", [])
        if not shots and not fts and not any(st.get(k, 0) for k in ["pf", "ro", "rd", "to", "stl", "ast", "blk", "df"]) and pm[p["id"]] == 0:
            continue
        t2 = [s for s in shots if not s.get("is3Point")]
        t3 = [s for s in shots if s.get("is3Point")]
        lines.append({
            "giocatore": f"#{p.get('number')} {p.get('name', '')} {p.get('surname', '')}".strip(),
            "pts": player_points(p),
            "t2": f"{sum(1 for s in t2 if s['result'] == 'made')}/{len(t2)}",
            "t3": f"{sum(1 for s in t3 if s['result'] == 'made')}/{len(t3)}",
            "tl": f"{sum(1 for f in fts if f.get('made'))}/{len(fts)}",
            "ro": st.get("ro", 0), "rd": st.get("rd", 0), "ast": st.get("ast", 0),
            "stl": st.get("stl", 0), "to": st.get("to", 0), "blk": st.get("blk", 0),
            "pf": st.get("pf", 0), "df": st.get("df", 0), "plus_minus": pm[p["id"]],
        })
    ours, opp = scores(m)
    return {
        "nostra_squadra": m.get("my_team"), "avversari": m.get("opponent_team"),
        "sede": "in casa" if m.get("venue") == "casa" else "fuori casa",
        "data": m.get("date"), "punteggio": f"{ours}-{opp}",
        "parziali_per_quarto": quarters, "giocatori": lines,
    }


AI_SYSTEM = (
    "Sei un assistente allenatore di pallacanestro esperto di scouting. "
    "Scrivi in italiano un report tattico conciso in Markdown con queste sezioni: "
    "## Sintesi, ## Andamento per quarti, ## Migliori in campo, ## Punti critici, ## Raccomandazioni. "
    "Basati solo sui dati forniti, cita numeri concreti (percentuali, +/-, palle perse). Massimo 350 parole."
)


@api.get("/")
async def root():
    return {"message": "Basket Scout API"}


@api.get("/matches")
async def list_matches():
    docs = await db.matches.find({}, {"ai_analysis": 0}).sort("updated_at", -1).to_list(500)
    out = []
    for d in docs:
        ours, opp = scores(d)
        m = Match.from_mongo(d)
        out.append({"id": m.id, "my_team": m.my_team, "opponent_team": m.opponent_team, "venue": m.venue,
                    "date": m.date, "time": m.time, "location": m.location, "updated_at": m.updated_at,
                    "our_score": ours, "opp_score": opp})
    return out


@api.post("/matches")
async def create_match(body: MatchIn):
    m = Match(**body.model_dump())
    res = await db.matches.insert_one(m.to_mongo())
    m.id = str(res.inserted_id)
    return m.model_dump()


@api.get("/matches/{mid}")
async def get_match(mid: str):
    d = await db.matches.find_one({"_id": to_oid(mid)})
    if not d:
        raise HTTPException(404, "Partita non trovata")
    return Match.from_mongo(d).model_dump()


@api.put("/matches/{mid}")
async def update_match(mid: str, body: MatchIn):
    res = await db.matches.update_one({"_id": to_oid(mid)}, {"$set": {**body.model_dump(), "updated_at": now_iso()}})
    if res.matched_count == 0:
        raise HTTPException(404, "Partita non trovata")
    return {"ok": True}


@api.delete("/matches/{mid}")
async def delete_match(mid: str):
    await db.matches.delete_one({"_id": to_oid(mid)})
    return {"ok": True}


@api.post("/matches/{mid}/analysis")
async def match_analysis(mid: str):
    oid = to_oid(mid)
    d = await db.matches.find_one({"_id": oid})
    if not d:
        raise HTTPException(404, "Partita non trovata")
    summary = build_summary(d)
    chat = LlmChat(api_key=os.environ["EMERGENT_LLM_KEY"], session_id=f"analysis-{mid}-{uuid.uuid4()}",
                   system_message=AI_SYSTEM).with_model("anthropic", "claude-sonnet-5-5")
    prompt = "Dati della partita (JSON):\n" + json.dumps(summary, ensure_ascii=False)

    async def gen():
        full = ""
        try:
            async for ev in chat.stream_message(UserMessage(text=prompt)):
                if isinstance(ev, TextDelta):
                    full += ev.content
                    yield f"data: {json.dumps({'t': ev.content})}\n\n"
                elif isinstance(ev, StreamDone):
                    break
            await db.matches.update_one({"_id": oid}, {"$set": {"ai_analysis": full}})
            yield "data: [DONE]\n\n"
        except Exception as e:
            logger.exception("AI analysis failed")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(gen(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


@api.get("/rosters")
async def list_rosters():
    docs = await db.rosters.find().sort("created_at", -1).to_list(200)
    return [Roster.from_mongo(d).model_dump() for d in docs]


@api.post("/rosters")
async def create_roster(body: RosterIn):
    r = Roster(**body.model_dump())
    res = await db.rosters.insert_one(r.to_mongo())
    r.id = str(res.inserted_id)
    return r.model_dump()


@api.delete("/rosters/{rid}")
async def delete_roster(rid: str):
    await db.rosters.delete_one({"_id": to_oid(rid)})
    return {"ok": True}


app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
