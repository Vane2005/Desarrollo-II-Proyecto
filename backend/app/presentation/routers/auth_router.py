from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from app.presentation.schemas.usuario_schema import FisioCreate, LoginCreate, LoginResponse, RecuperarContrasenaRequest, RecuperarContrasenaResponse, CambiarContrasenaRequest, CambiarContrasenaResponse
from app.data.db import get_db 
from app.logic.auth_service import crear_fisioterapeuta, authenticate_user, recuperar_contrasena, cambiar_contrasena
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
                "email": usuario.correo,
                "estado": usuario.estado  # Devolver el estado
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
    Inicia sesión y verifica tipo de usuario y estado de pago.
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
        
        # Crear token JWT con tipo de usuario y estado
        access_token_expires = timedelta(minutes=30)
        access_token = create_access_token(
            data={
                "sub": user_data["email"], 
                "tipo": user_data["tipo"],
                "estado": user_data.get("estado", "activo")  # Incluir estado
            }, 
            expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "tipo_usuario": user_data["tipo"],
            "nombre": user_data["nombre"],
            "email": user_data["email"],
            "estado": user_data.get("estado", "activo")  # Devolver estado
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
async def verify_token(token: str = Depends(oauth2_scheme)):
    return {"message": "Token válido", "tipo_usuario": get_current_user(token).tipo_usuario}


@router.post("/recuperar-contrasena", response_model=RecuperarContrasenaResponse)
def recuperar_contrasena_endpoint(
    datos: RecuperarContrasenaRequest, 
    db: Session = Depends(get_db)
):
    """
    Recupera la contraseña de un usuario enviándola por email.
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


@router.post("/cambiar-contrasena", response_model=CambiarContrasenaResponse)
def cambiar_contrasena_endpoint(
    datos: CambiarContrasenaRequest,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """
    Cambia la contraseña de un usuario autenticado.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        
        if not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido: email no encontrado",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        print(f"📧 Usuario autenticado: {email}")
        
        resultado = cambiar_contrasena(
            db=db,
            email=email,
            contrasena_actual=datos.contrasena_actual,
            contrasena_nueva=datos.contrasena_nueva
        )
        
        return {
            "mensaje": "Contraseña actualizada exitosamente",
            "email": resultado["email"]
        }
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    except Exception as e:
        print("ERROR EN CAMBIAR CONTRASEÑA:", traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al cambiar contraseña: {str(e)}"
        )
