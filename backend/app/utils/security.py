# backend/app/utils/security.py
from passlib.context import CryptContext

# Configurar bcrypt SIN validación de longitud
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12  # Opcional: número de rondas
)

def hash_password(password: str) -> str:
    """
    Hashea una contraseña usando bcrypt.
    IMPORTANTE: Trunca a 72 caracteres antes de hashear.
    """
    # Truncar ANTES de pasar a passlib
    password_truncated = password[:72] if len(password) > 72 else password
    return pwd_context.hash(password_truncated)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifica si una contraseña coincide con el hash.
    """
    # Truncar también en la verificación
    plain_password_truncated = plain_password[:72] if len(plain_password) > 72 else plain_password
    return pwd_context.verify(plain_password_truncated, hashed_password)