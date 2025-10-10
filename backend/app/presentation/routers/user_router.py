from fastapi import FastAPI
from pydantic import BaseModel
from app.presentation.schemas.usuario_schema import FisioCreate

app = FastAPI()

@app.post("/auth/register")
def registrar_usuario(usuario: FisioCreate):
    # Aquí guardarías en BD
    return {"message": f"Usuario {usuario.nombre} registrado con éxito"}
