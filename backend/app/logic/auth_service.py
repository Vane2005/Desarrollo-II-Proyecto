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
