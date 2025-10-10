from app.data.models.user import User_Fisioterapeuta
from sqlalchemy.orm import Session
from app.utils.security import hash_password

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
        raise e