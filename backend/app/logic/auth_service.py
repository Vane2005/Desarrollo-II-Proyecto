from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.data.models.user import User_Fisioterapeuta, User_Paciente
from app.config.security import hash_password, verify_password
from app.logic.email_service import send_recovery_email
from app.logic.utils import generar_contrasena_aleatoria

def crear_fisioterapeuta(db: Session, cedula: str, correo: str, nombre: str, contrasena: str, estado: str, telefono: str):
    """
    Crea un nuevo fisioterapeuta en la base de datos
    """
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


def authenticate_user(db: Session, email: str, password: str):
    """
    Autentica un usuario (fisioterapeuta o paciente) verificando email y contraseña
    Retorna un diccionario con los datos del usuario si las credenciales son correctas
    """
    print(f"🔍 Intentando autenticar usuario: {email}")
    
    # Buscar en Fisioterapeuta
    fisio = db.query(User_Fisioterapeuta).filter(User_Fisioterapeuta.correo == email).first()
    if fisio:
        print(f"✅ Usuario encontrado en tabla Fisioterapeuta")
        print(f"🔐 Verificando contraseña...")
        if verify_password(password, fisio.contrasena):
            print(f"✅ Contraseña correcta - Login exitoso como fisioterapeuta")
            return {
                "tipo": "fisio", 
                "id": fisio.cedula, 
                "nombre": fisio.nombre, 
                "email": fisio.correo
            }
        else:
            print(f"❌ Contraseña incorrecta para fisioterapeuta")
    
    # Buscar en Paciente
    paciente = db.query(User_Paciente).filter(User_Paciente.correo == email).first()
    if paciente:
        print(f"✅ Usuario encontrado en tabla Paciente")
        print(f"🔐 Verificando contraseña...")
        if verify_password(password, paciente.contrasena):
            print(f"✅ Contraseña correcta - Login exitoso como paciente")
            return {
                "tipo": "paciente", 
                "id": paciente.cedula, 
                "nombre": paciente.nombre, 
                "email": paciente.correo
            }
        else:
            print(f"❌ Contraseña incorrecta para paciente")
    
    print(f"❌ Usuario no encontrado en ninguna tabla")
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