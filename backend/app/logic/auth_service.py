from logic.email_service import send_recovery_email
from logic.utils import generar_contrasena_aleatoria
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.data.models.user import User_Fisioterapeuta, User_Paciente
from app.config.security import hash_password, verify_password
from app.logic.email_service import send_recovery_email
from app.logic.utils import generar_contrasena_aleatoria


def crear_fisioterapeuta(db: Session, cedula: str, correo: str, nombre: str, contrasena: str, telefono: str):
    try:
        # Hashear contraseña
        contrasena_hash = hash_password(contrasena)
        fisio = User_Fisioterapeuta(
            cedula=cedula, 
            nombre=nombre, 
            correo=correo, 
            contrasena=contrasena_hash,
            telefono=telefono,
            estado="inactivo"  # Por defecto inactivo hasta que pague
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
        return {
            "tipo": "fisio", 
            "id": fisio.cedula, 
            "nombre": fisio.nombre, 
            "email": fisio.correo,
            "estado": fisio.estado  # 👈 IMPORTANTE: Incluir estado
        }
    
    # Buscar en Paciente por cédula
    paciente = db.query(User_Paciente).filter(User_Paciente.cedula == cedula).first()
    if paciente and verify_password(password, paciente.contrasena):
        # Los pacientes no tienen campo estado, siempre activos
        return {
            "tipo": "paciente", 
            "id": paciente.cedula, 
            "nombre": paciente.nombre, 
            "email": paciente.correo,
            "estado": "activo"  # Pacientes siempre activos
        }
    
    return None


def recuperar_contrasena(db: Session, email: str):
    """
    Busca el usuario por email y envía su contraseña por correo.
    """
    # Buscar en Fisioterapeuta
    fisio = db.query(User_Fisioterapeuta).filter(
        User_Fisioterapeuta.correo == email
    ).first()
    
    if fisio:
        nueva_contrasena = generar_contrasena_aleatoria(10)
        fisio.contrasena = hash_password(nueva_contrasena)
        
        db.commit()
        
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
        nueva_contrasena = generar_contrasena_aleatoria(10)
        paciente.contrasena = hash_password(nueva_contrasena)
        
        db.commit()
        
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
    
    raise ValueError("No existe una cuenta registrada con ese correo electrónico")


def cambiar_contrasena(db: Session, email: str, contrasena_actual: str, contrasena_nueva: str):
    """
    Cambia la contraseña de un usuario (fisioterapeuta o paciente)
    """
    print(f"🔐 Intentando cambiar contraseña para: {email}")
    
    # Buscar en Fisioterapeuta
    fisio = db.query(User_Fisioterapeuta).filter(User_Fisioterapeuta.correo == email).first()
    if fisio:
        print(f"✅ Usuario encontrado en tabla Fisioterapeuta")
        
        if not verify_password(contrasena_actual, fisio.contrasena):
            print(f"❌ Contraseña actual incorrecta")
            raise ValueError("La contraseña actual es incorrecta")
        
        if verify_password(contrasena_nueva, fisio.contrasena):
            raise ValueError("La nueva contraseña debe ser diferente a la actual")
        
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
        
        if not verify_password(contrasena_actual, paciente.contrasena):
            print(f"❌ Contraseña actual incorrecta")
            raise ValueError("La contraseña actual es incorrecta")
        
        if verify_password(contrasena_nueva, paciente.contrasena):
            raise ValueError("La nueva contraseña debe ser diferente a la actual")
        
        paciente.contrasena = hash_password(contrasena_nueva)
        db.commit()
        db.refresh(paciente)
        
        print(f"✅ Contraseña actualizada exitosamente para paciente")
        return {
            "tipo": "paciente",
            "nombre": paciente.nombre,
            "email": paciente.correo
        }
    
    print(f"❌ Usuario no encontrado")
    raise ValueError("Usuario no encontrado")