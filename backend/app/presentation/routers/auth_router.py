# backend/app/presentation/routers/auth_router.py
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from app.presentation.schemas.usuario_schema import FisioCreate
from app.data.db import get_db 
from app.logic.auth_service import crear_fisioterapeuta
import traceback 

router = APIRouter(prefix="/auth", tags=["Autenticación"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
def registrar_fisioterapeuta(datos: FisioCreate, db: Session = Depends(get_db)):
    """
    Registra un nuevo fisioterapeuta en el sistema
    """
    try:
        usuario = crear_fisioterapeuta(
            db=db,
            cedula=datos.cedula,
            correo=datos.email,
            nombre=datos.nombre,
            contrasena=datos.contrasena,
            telefono=datos.telefono
        )
        
        return {
            "mensaje": f"Usuario {usuario.nombre} registrado correctamente",
            "usuario": {
                "id": usuario.cedula,
                "nombre": usuario.nombre,
                "email": usuario.correo
            }
        }
    
    except ValueError as e:
        # Errores de validación
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        print("❌ ERROR COMPLETO:")
        print(traceback.format_exc())
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al registrar usuario: {str(e)}"  # 👈 Muestra el error
        )