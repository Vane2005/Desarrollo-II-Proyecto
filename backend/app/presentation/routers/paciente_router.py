from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from presentation.schemas.usuario_schema import PacienteCreate
from data.db import get_db 
from logic.paciente_service import crear
from datetime import timedelta
import traceback 
from config.jwt_config import SECRET_KEY, ALGORITHM

router = APIRouter(prefix="/paciente")

@router.post("/register", status_code=status.HTTP_201_CREATED)
def registrar(datos: PacienteCreate, db: Session = Depends(get_db)):
    """
    Registra un nuevo Paciente en el sistema
    """
    try:
        usuario, contrasena_generada = crear(
            db=db,
            cedula=datos.cedula,
            correo=datos.email,
            nombre=datos.nombre,
            
            telefono=datos.telefono
        )
        
        return {
            "mensaje": f"Usuario {usuario.nombre} registrado correctamente",
            "usuario": {
                "id": usuario.cedula,
                "nombre": usuario.nombre,
                "email": usuario.correo
            },
            "credenciales": {
                "correo": usuario.correo,
                "contrasena": contrasena_generada
            }
        }
    
    except ValueError as e:
        # Errores de validación
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        print("ERROR COMPLETO:")
        print(traceback.format_exc())
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al registrar usuario: {str(e)}" 
        )