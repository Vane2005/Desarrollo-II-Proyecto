# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from presentation.routers.auth_router import router as auth_router  
from presentation.routers.payment_router import router as payment_router
from presentation.routers.paciente_router import router as paciente_router
from config import jwt_config  # Asegura que la configuración JWT se cargue

app = FastAPI()

# CORS SETTINGS - Asegúrate de que esto esté antes de include_router
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # <-- Usa "*" para permitir todo temporalmente (luego puedes restringirlo)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registra routers
app.include_router(auth_router)
app.include_router(payment_router)
app.include_router(paciente_router)

@app.get("/")
def read_root():
    return {"mensaje": "Backend activo 🚀"}
