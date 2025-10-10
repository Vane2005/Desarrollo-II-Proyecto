# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.presentation.routers.auth_router import router as auth_router  # 👈 importa tu router

app = FastAPI()

# --- CORS para permitir conexión desde el front ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", 
        "http://localhost:5500"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Incluye el router de autenticación ---
app.include_router(auth_router)

@app.get("/")
def read_root():
    return {"mensaje": "Backend activo 🚀"}
