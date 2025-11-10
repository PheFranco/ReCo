from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="ReCo API (dev stub)")

# Ajuste os origins conforme seu ambiente (Vite roda em http://localhost:5173)
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoginRequest(BaseModel):
    email: str


class ItemCreate(BaseModel):
    title: str
    description: str
    category: Optional[str] = None
    location: Optional[str] = None


# In-memory items store for dev
_ITEMS = [
    {"id": 1, "title": "Cadeira", "description": "Boa condição", "donor": "João", "category": "Móveis", "location": "Brasília"},
    {"id": 2, "title": "Mesa", "description": "Pequenas marcas", "donor": "Maria", "category": "Móveis", "location": "Goiânia"},
]
_NEXT_ID = 3


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.post("/api/login")
async def login(req: LoginRequest):
    # Endpoint de exemplo: em produção trocar pela integração real com Supabase
    return {"access_token": "fake-token-123", "user_id": "user-abc-1"}


@app.get("/api/items")
async def list_items():
    return {"items": _ITEMS}


@app.post("/api/items")
async def create_item(item: ItemCreate):
    global _NEXT_ID
    new_item = {
        "id": _NEXT_ID,
        "title": item.title,
        "description": item.description,
        "donor": "dev",
        "category": item.category or "Outros",
        "location": item.location or "",
        "photo_url": None,
        "status": "disponível",
        "created_at": "now",
    }
    _ITEMS.append(new_item)
    _NEXT_ID += 1
    return {"ok": True, "item": new_item}


@app.delete("/api/items/{item_id}")
async def delete_item(item_id: int):
    global _ITEMS
    before = len(_ITEMS)
    _ITEMS = [it for it in _ITEMS if int(it.get("id")) != int(item_id)]
    if len(_ITEMS) == before:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"ok": True}


@app.post("/api/contact")
async def contact(payload: dict):
    # Apenas retorna o payload como eco para o stub
    return {"ok": True, "payload": payload}

# Executar com: uvicorn backend.main:app --reload --port 8000
