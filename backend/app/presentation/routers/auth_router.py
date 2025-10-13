# backend/app/presentation/routers/auth_router.py
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from app.presentation.schemas.usuario_schema import FisioCreate, LoginCreate, LoginResponse
from app.data.db import get_db 
from app.logic.auth_service import crear_fisioterapeuta, authenticate_user
from app.config.jwt_config import create_access_token
from datetime import timedelta
import traceback 
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from app.config.jwt_config import SECRET_KEY, ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

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


@router.post("/login", response_model=LoginResponse)
def login_user(datos: LoginCreate, db: Session = Depends(get_db)):
    """
    Inicia sesión y verifica tipo de usuario.
    """
    try:
        # Autenticar
        user_data = authenticate_user(db, datos.email, datos.contrasena)
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales inválidas",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Crear token JWT con tipo de usuario
        access_token_expires = timedelta(minutes=30)  # Ajusta según sea necesario
        access_token = create_access_token(
            data={"sub": user_data["email"], "tipo": user_data["tipo"]}, 
            expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "tipo_usuario": user_data["tipo"],
            "nombre": user_data["nombre"],
            "email": user_data["email"]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print("❌ ERROR EN LOGIN:", traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno al iniciar sesión"
        )


def get_current_user(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        tipo_usuario = payload.get("tipo")
        if tipo_usuario is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido: tipo de usuario no encontrado",
                headers={"WWW-Authenticate": "Bearer"},
            )
        # Puedes retornar un objeto o dict con tipo_usuario
        class User:
            def __init__(self, tipo_usuario):
                self.tipo_usuario = tipo_usuario
        return User(tipo_usuario)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.get("/auth/verify")
async def verify_token(token: str = Depends(oauth2_scheme)):  # Usa OAuth2PasswordBearer de FastAPI
    return {"message": "Token válido", "tipo_usuario": get_current_user(token).tipo_usuario}  # Implementa get_current_user con jwt.decode
