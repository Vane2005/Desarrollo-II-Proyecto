from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from presentation.schemas.usuario_schema import (
    FisioCreate, LoginCreate, LoginResponse, 
    RecuperarContrasenaRequest, RecuperarContrasenaResponse,
    CambiarContrasenaRequest, InfoFisioterapeutaResponse
)
from data.db import get_db 
from logic.auth_service import (
    crear_fisioterapeuta, authenticate_user, 
    recuperar_contrasena, cambiar_contrasena, 
    obtener_info_fisioterapeuta
)
from config.jwt_config import create_access_token, verify_token
from datetime import timedelta
import traceback 
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from config.jwt_config import SECRET_KEY, ALGORITHM
from data.models.user import User_Fisioterapeuta


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

router = APIRouter(prefix="/auth", tags=["Autenticación"])

def get_current_user_cedula(token: str = Depends(oauth2_scheme)):
    """
    Obtiene la cédula del usuario actual desde el token JWT
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        cedula = payload.get("cedula")
        if cedula is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido: cédula no encontrada"
            )
        return cedula
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )


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
            estado="inactivo",
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


@router.post("/login", response_model=LoginResponse)
def login_user(datos: LoginCreate, db: Session = Depends(get_db)):
    """
    Inicia sesión verificando la cédula en las tablas Fisioterapeuta y Paciente.
    Permite el acceso a fisioterapeutas inactivos para que puedan realizar el pago.
    """
    try:
        user_data = authenticate_user(db, datos.cedula, datos.contrasena)
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Cédula o contraseña incorrecta",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Obtener estado del fisioterapeuta (pero NO bloquear el acceso)
        estado = "activo"  # Por defecto para pacientes
        if user_data["tipo"] == "fisio":
            fisio = db.query(User_Fisioterapeuta).filter(
                User_Fisioterapeuta.cedula == user_data["id"]
            ).first()
            estado = fisio.estado.lower()
        
        # Crear token JWT con tipo de usuario y estado
        access_token_expires = timedelta(minutes=30)
        access_token = create_access_token(
            data={
                "sub": user_data["email"], 
                "tipo": user_data["tipo"], 
                "cedula": user_data["id"],
                "estado": estado
            }, 
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
        print("ERROR EN LOGIN:", traceback.format_exc())
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


@router.get("/verify")
async def verify_token_endpoint(token: str = Depends(oauth2_scheme)):
    return {"message": "Token válido", "tipo_usuario": get_current_user(token).tipo_usuario}


@router.post("/recuperar-contrasena", response_model=RecuperarContrasenaResponse)
def recuperar_contrasena_endpoint(
    datos: RecuperarContrasenaRequest, 
    db: Session = Depends(get_db)
):
    """
    Recupera la contraseña de un usuario enviándola por email.
    Genera una nueva contraseña temporal y la envía al correo registrado.
    """
    try:
        resultado = recuperar_contrasena(db, datos.email)
        
        return {
            "mensaje": f"Se ha enviado una nueva contraseña temporal a {datos.email}",
            "email": datos.email
        }
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    
    except Exception as e:
        print("ERROR EN RECUPERAR CONTRASEÑA:", traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al procesar la solicitud: {str(e)}"
        )


@router.post("/cambiar-contrasena")
def cambiar_contrasena_endpoint(
    datos: CambiarContrasenaRequest,
    cedula: str = Depends(get_current_user_cedula),
    db: Session = Depends(get_db)
):
    """
    Cambia la contraseña del fisioterapeuta autenticado
    """
    try:
        resultado = cambiar_contrasena(
            db=db,
            cedula=cedula,
            contrasena_actual=datos.contrasena_actual,
            nueva_contrasena=datos.nueva_contrasena
        )
        
        return {
            "mensaje": resultado["mensaje"],
            "email": resultado["email"]
        }
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        print("ERROR EN CAMBIAR CONTRASEÑA:", traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al cambiar la contraseña"
        )


@router.get("/info-fisioterapeuta", response_model=InfoFisioterapeutaResponse)
def obtener_info_fisioterapeuta_endpoint(
    cedula: str = Depends(get_current_user_cedula),
    db: Session = Depends(get_db)
):
    """
    Obtiene la información del fisioterapeuta autenticado
    """
    try:
        info = obtener_info_fisioterapeuta(db, cedula)
        return info
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        print("ERROR AL OBTENER INFO:", traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al obtener información"
        )