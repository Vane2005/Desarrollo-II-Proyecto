from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.data.models.user import User_Fisioterapeuta, User_Paciente
from app.config.security import hash_password, verify_password
from app.logic.email_service import send_recovery_email
from app.logic.utils import generar_contrasena_aleatoria  # ✅ AGREGAR ESTE IMPORT


def crear_fisioterapeuta(db: Session, cedula: str, correo: str, nombre: str, contrasena: str, telefono: str):
    try:
        # Hashear contraseña
        contrasena_hash = hash_password(contrasena)
        fisio = User_Fisioterapeuta(
            cedula=cedula, 
            nombre=nombre, 
            correo=correo, 
            contrasena=contrasena_hash,
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
    
    # Buscar en Paciente
    paciente = db.query(User_Paciente).filter(User_Paciente.correo == email).first()
    if paciente and verify_password(password, paciente.contrasena):
       return {"tipo": "paciente", "id": paciente.cedula, "nombre": paciente.nombre, "email": paciente.correo}
    
    return None


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
        # Generar nueva contraseña temporal
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
        # Generar nueva contraseña temporal
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


def cambiar_contrasena(db: Session, email: str, contrasena_actual: str, contrasena_nueva: str):
    """
    Cambia la contraseña de un usuario (fisioterapeuta o paciente)
    
    Args:
        db: Sesión de base de datos
        email: Email del usuario
        contrasena_actual: Contraseña actual para verificar
        contrasena_nueva: Nueva contraseña a establecer
    
    Returns:
        Dict con información del usuario actualizado
    
    Raises:
        ValueError: Si el usuario no existe o la contraseña actual es incorrecta
    """
    print(f"🔐 Intentando cambiar contraseña para: {email}")
    
    # Buscar en Fisioterapeuta
    fisio = db.query(User_Fisioterapeuta).filter(User_Fisioterapeuta.correo == email).first()
    if fisio:
        print(f"✅ Usuario encontrado en tabla Fisioterapeuta")
        
        # Verificar contraseña actual
        if not verify_password(contrasena_actual, fisio.contrasena):
            print(f"❌ Contraseña actual incorrecta")
            raise ValueError("La contraseña actual es incorrecta")
        
        # Validar que la nueva contraseña sea diferente
        if verify_password(contrasena_nueva, fisio.contrasena):
            raise ValueError("La nueva contraseña debe ser diferente a la actual")
        
        # Actualizar contraseña
        fisio.contrasena = hash_password(contrasena_nueva)
        db.commit()
        db.refresh(fisio)
        
        print(f"✅ Contraseña actualizada exitosamente para fisioterapeuta")
        return {
            "tipo": "fisio",
            "nombre": fisio.nombre,
            "email": fisio.correo
        }
    
    # Buscar en Paciente
    paciente = db.query(User_Paciente).filter(User_Paciente.correo == email).first()
    if paciente:
        print(f"✅ Usuario encontrado en tabla Paciente")
        
        # Verificar contraseña actual
        if not verify_password(contrasena_actual, paciente.contrasena):
            print(f"❌ Contraseña actual incorrecta")
            raise ValueError("La contraseña actual es incorrecta")
        
        # Validar que la nueva contraseña sea diferente
        if verify_password(contrasena_nueva, paciente.contrasena):
            raise ValueError("La nueva contraseña debe ser diferente a la actual")
        
        # Actualizar contraseña
        paciente.contrasena = hash_password(contrasena_nueva)
        db.commit()
        db.refresh(paciente)
        
        print(f"✅ Contraseña actualizada exitosamente para paciente")
        return {
            "tipo": "paciente",
            "nombre": paciente.nombre,
            "email": paciente.correo
        }
    
    # No se encontró el usuario
    print(f"❌ Usuario no encontrado")
    raise ValueError("Usuario no encontrado")

