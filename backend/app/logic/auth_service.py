from sqlalchemy.orm import Session
from sqlalchemy import or_
from data.models.user import User_Fisioterapeuta, User_Paciente  # Importar ambos modelos
from config.security import hash_password, verify_password  # Activar hashing

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


def authenticate_user(db: Session, email: str, password: str):

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
