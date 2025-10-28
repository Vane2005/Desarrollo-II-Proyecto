from ..logic.email_service import send_recovery_email, send_password_change_notification
from ..logic.utils import generar_contrasena_aleatoria
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.data.models.user import User_Fisioterapeuta, User_Paciente
from ..config.security import hash_password, verify_password

def crear_fisioterapeuta(db: Session, cedula: str, correo: str, nombre: str, contrasena: str, estado: str, telefono: str):
    try:
        contrasena_hash = hash_password(contrasena)
        fisio = User_Fisioterapeuta(
            cedula=cedula, 
            nombre=nombre, 
            correo=correo, 
            contrasena=contrasena_hash,  
            estado=estado,
            telefono=telefono
        )
        db.add(fisio)
        db.commit()
        db.refresh(fisio)
        return fisio
    except Exception as e:
        db.rollback()
        raise e


def authenticate_user(db: Session, cedula: str, password: str):
    """
    Autentica un usuario buscando por cédula en ambas tablas (Fisioterapeuta y Paciente).
    Retorna el tipo de usuario y sus datos si las credenciales son correctas.
    """
    # Buscar en Fisioterapeuta por cédula
    fisio = db.query(User_Fisioterapeuta).filter(User_Fisioterapeuta.cedula == cedula).first()
    if fisio and verify_password(password, fisio.contrasena):
        return {"tipo": "fisio", "id": fisio.cedula, "nombre": fisio.nombre, "email": fisio.correo}
    
    # Buscar en Paciente por cédula
    paciente = db.query(User_Paciente).filter(User_Paciente.cedula == cedula).first()
    if paciente and verify_password(password, paciente.contrasena):
       return {"tipo": "paciente", "id": paciente.cedula, "nombre": paciente.nombre, "email": paciente.correo}
    
    return None


def recuperar_contrasena(db: Session, email: str):
    """
    Busca el usuario por email y envía contraseña temporal por correo.
    """
    # Buscar en Fisioterapeuta
    fisio = db.query(User_Fisioterapeuta).filter(
        User_Fisioterapeuta.correo == email
    ).first()
    
    if fisio:
        # Generar nueva contraseña temporal
        nueva_contrasena = generar_contrasena_aleatoria(10)
        fisio.contrasena = hash_password(nueva_contrasena)
        
        db.commit()
        
        # Enviar email
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
        # Generar nueva contraseña temporal
        nueva_contrasena = generar_contrasena_aleatoria(10)
        paciente.contrasena = hash_password(nueva_contrasena)
        
        db.commit()
        
        # Enviar email
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


def cambiar_contrasena(db: Session, cedula: str, contrasena_actual: str, nueva_contrasena: str):
    """
    Cambia la contraseña del fisioterapeuta verificando la contraseña actual.
    """
    # Buscar fisioterapeuta
    fisio = db.query(User_Fisioterapeuta).filter(
        User_Fisioterapeuta.cedula == cedula
    ).first()
    
    if not fisio:
        raise ValueError("Fisioterapeuta no encontrado")
    
    # Verificar contraseña actual
    if not verify_password(contrasena_actual, fisio.contrasena):
        raise ValueError("La contraseña actual es incorrecta")
    
    # Actualizar contraseña
    fisio.contrasena = hash_password(nueva_contrasena)
    db.commit()
    
    # Enviar notificación por email
    send_password_change_notification(
        to=fisio.correo,
        nombre=fisio.nombre
    )
    
    return {
        "mensaje": "Contraseña actualizada exitosamente",
        "email": fisio.correo
    }


def obtener_info_fisioterapeuta(db: Session, cedula: str):
    """
    Obtiene la información completa del fisioterapeuta por cédula.
    """
    fisio = db.query(User_Fisioterapeuta).filter(
        User_Fisioterapeuta.cedula == cedula
    ).first()
    
    if not fisio:
        raise ValueError("Fisioterapeuta no encontrado")
    
    return {
        "cedula": fisio.cedula,
        "nombre": fisio.nombre,
        "correo": fisio.correo,
        "telefono": fisio.telefono,
        "estado": fisio.estado
    }