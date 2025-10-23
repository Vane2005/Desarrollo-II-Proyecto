""" from app.data.models.user import User_Fisioterapeuta
from sqlalchemy.orm import Session
from app.config.security import hash_password

def crear_fisioterapeuta(db:Session, cedula: str, correo: str,  nombre:str, contrasena: str, telefono:str):
    try:
        # Hashear contraseña
        #contrasena_hash = hash_password(contrasena)
        fisio = User_Fisioterapeuta(cedula=cedula, nombre=nombre, correo=correo, contrasena=contrasena, telefono=telefono)
        # Usar la sesión recibida
        db.add(fisio)
        db.commit()
        db.refresh(fisio)
        
        return fisio


    except Exception as e:
        db.rollback()
        raise e """

from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.data.models.user import User_Fisioterapeuta, User_Paciente  # Importar ambos modelos
from app.config.security import hash_password, verify_password  # Activar hashing
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.data.models.user import User_Fisioterapeuta, User_Paciente
from app.logic.email_service import send_recovery_email
from app.logic.utils import generar_contrasena_aleatoria 


def crear_fisioterapeuta(db: Session, cedula: str, correo: str, nombre: str, contrasena: str, telefono: str):
    try:
        # Hashear contraseña (¡ACTIVADO!)
        contrasena_hash = hash_password(contrasena)
        fisio = User_Fisioterapeuta(
            cedula=cedula, 
            nombre=nombre, 
            correo=correo, 
            contrasena=contrasena_hash,  # Usar hash
            telefono=telefono
        )
        db.add(fisio)
        db.commit()
        db.refresh(fisio)
        return fisio
    except Exception as e:
        db.rollback()
        raise e

def authenticate_user(db: Session, email: str, password: str):
    """
    Autentica usuario y retorna tipo si es válido.
    Busca en ambas tablas (Fisioterapeuta y Paciente).
    """
    # Buscar en Fisioterapeuta
    fisio = db.query(User_Fisioterapeuta).filter(User_Fisioterapeuta.correo == email).first()
    if fisio and verify_password(password, fisio.contrasena):
        return {"tipo": "fisio", "id": fisio.cedula, "nombre": fisio.nombre, "email": fisio.correo}
    
   
    paciente = db.query(User_Paciente).filter(User_Paciente.correo == email).first()
    if paciente and verify_password(password, paciente.contrasena):
       return {"tipo": "paciente", "id": paciente.cedula, "nombre": paciente.nombre, "email": paciente.correo}
    
    return None  # Credenciales inválidas (si las datos ingresados no coinciden)


def recuperar_contrasena(db: Session, email: str):
    """
    Busca el usuario por email y envía su contraseña por correo.
    Busca en ambas tablas (Fisioterapeuta y Paciente).
    
    Args:
        db: Sesión de la base de datos
        email: Email del usuario
        
    Returns:
        dict con información del resultado
        
    Raises:
        ValueError: Si el usuario no existe
        Exception: Si hay error al enviar el email
    """
    # Buscar en Fisioterapeuta
    fisio = db.query(User_Fisioterapeuta).filter(
        User_Fisioterapeuta.correo == email
    ).first()
    
    if fisio:
        # Usuario encontrado como fisioterapeuta
        # NOTA: La contraseña está hasheada, no podemos recuperarla
        # En un sistema real, deberías generar un token de restablecimiento
        # Por ahora, generaremos una nueva contraseña temporal
        
        
        
        nueva_contrasena = generar_contrasena_aleatoria(10)
        fisio.contrasena = hash_password(nueva_contrasena)
        
        db.commit()
        
        # Enviar email con la nueva contraseña
        send_recovery_email(
            to=fisio.correo,
            contrasena=nueva_contrasena,
            nombre=fisio.nombre
        )
        
        return {
            "tipo": "fisio",
            "nombre": fisio.nombre,
            "email": fisio.correo,
            "contrasena_temporal": nueva_contrasena
        }
    
    # Buscar en Paciente
    paciente = db.query(User_Paciente).filter(
        User_Paciente.correo == email
    ).first()
    
    if paciente:
        # Usuario encontrado como paciente
        from app.logic.utils import generar_contrasena_aleatoria
        from app.config.security import hash_password
        
        nueva_contrasena = generar_contrasena_aleatoria(10)
        paciente.contrasena = hash_password(nueva_contrasena)
        
        db.commit()
        
        # Enviar email con la nueva contraseña
        send_recovery_email(
            to=paciente.correo,
            contrasena=nueva_contrasena,
            nombre=paciente.nombre
        )
        
        return {
            "tipo": "paciente",
            "nombre": paciente.nombre,
            "email": paciente.correo,
            "contrasena_temporal": nueva_contrasena
        }
    
    # No se encontró el usuario
    raise ValueError("No existe una cuenta registrada con ese correo electrónico")

