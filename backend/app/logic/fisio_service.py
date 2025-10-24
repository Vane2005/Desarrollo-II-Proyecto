from sqlalchemy.orm import Session
from app.data.models.user import User_Fisioterapeuta


def actualizar_estado_fisioterapeuta(db: Session, cedula: str, nuevo_estado: str):
    """
    Actualiza solo el campo 'estado' de un fisioterapeuta por su cédula.
    """
    try:
        # Buscar el fisioterapeuta
        fisio = db.query(User_Fisioterapeuta).filter(User_Fisioterapeuta.cedula == cedula).first()
        
        if not fisio:
            return None  # No se encontró el fisioterapeuta
        
        # Actualizar el estado
        fisio.estado = nuevo_estado
        db.commit()
        db.refresh(fisio)
        
        return fisio  # Retorna el objeto actualizado

    except Exception as e:
        db.rollback()
        raise e