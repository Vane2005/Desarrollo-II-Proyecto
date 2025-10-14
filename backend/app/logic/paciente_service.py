from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.data.models.user import User_Fisioterapeuta, User_Paciente  # Importar ambos modelos
from app.config.security import hash_password, verify_password  # Activar hashing

def crear(db: Session, cedula: str, correo: str, nombre: str, contrasena: str, telefono: str):
    try:
        # Hashear contraseña (¡ACTIVADO!)
        contrasena_hash = hash_password(contrasena)
        paciente = User_Paciente(
            cedula=cedula, 
            nombre=nombre, 
            correo=correo, 
            contrasena=contrasena_hash,  # Usar hash
            telefono=telefono
        )
        db.add(paciente)
        db.commit()
        db.refresh(paciente)
        return paciente
    except Exception as e:
        db.rollback()
        raise e