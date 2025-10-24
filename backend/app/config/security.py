# backend/app/utils/security.py
import bcrypt

def hash_password(password: str) -> str:
    """
    Hashea una contraseña usando bcrypt.
    IMPORTANTE: Trunca a 72 caracteres antes de hashear.
    """
    # Truncar ANTES de pasar a passlib
    password_truncated = password[:72] if len(password) > 72 else password
    return bcrypt.hashpw(password_truncated.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifica si una contraseña coincide con el hash.
    """
    # Truncar también en la verificación
    plain_password_truncated = plain_password[:72] if len(plain_password) > 72 else plain_password
    return bcrypt.chechpw(
        plain_password_truncated.encode("utf-8"),
        hashed_password.encode("utf-8"),
    )