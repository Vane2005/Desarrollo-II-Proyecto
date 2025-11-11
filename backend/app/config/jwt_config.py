from datetime import datetime, timedelta
from jose import JWTError, jwt
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

# Claves secretas (usa .env para producción)
SECRET_KEY = os.getenv("SECRET_KEY", "IGQ4JP6vw9ZGE1aVEY2sGYpHTNS2dpFt7BkiAsIA2-LKgAFVPdixs5o_dtbX_3EWcVv1bKHyTl0BjuzpvtY5aA") # Clave por defecto para desarrollo 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # 30 minutos por defecto

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """
    Crea un token JWT con los datos del usuario.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    """
    Verifica y decodifica un token JWT.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload if payload else None
    except JWTError:
        return None
