ReCo — Backend (FastAPI) — Esqueleto de desenvolvimento

Requisitos mínimos
- Python 3.11+ (recomendado)
- pip

Instalação
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Executando o servidor (modo dev)
```powershell
# a partir da pasta backend
uvicorn main:app --reload --port 8000
```

Endpoints de exemplo
- GET /api/health -> {"status":"ok"}
- POST /api/login (body: {"email":"..."}) -> retorna token fake
- GET /api/items -> lista de itens de exemplo
- POST /api/contact -> eco do payload

Integração com o frontend
- O frontend (Vite) em `http://localhost:5173` pode consumir esses endpoints.
- Caso o frontend rode em outro host/porta, atualize `origins` em `main.py`.

Próximos passos
- Trocar os stubs por integração real com Supabase (ou seu banco).
- Adicionar autenticação real, persistência e rotas do marketplace.
