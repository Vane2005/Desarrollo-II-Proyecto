from sqlalchemy.orm import Session
from data.models.user import User_Fisioterapeuta


def actualizar_estado_fisioterapeuta(db: Session, cedula: str, nuevo_estado: str):
    """
    Actualiza solo el campo 'estado' de un fisioterapeuta por su cédula.
    """
    try:
        print(f"🔍 Buscando fisioterapeuta con cédula: {cedula}")
        
        # Buscar el fisioterapeuta
        fisio = db.query(User_Fisioterapeuta).filter(
            User_Fisioterapeuta.cedula == cedula
        ).first()
        
        if not fisio:
            print(f"No se encontró fisioterapeuta con cédula: {cedula}")
            return None
        
        print(f"Fisioterapeuta encontrado: {fisio.nombre}")
        print(f"   Estado actual: {fisio.estado}")
        
        # Actualizar el estado
        fisio.estado = nuevo_estado
        db.commit()
        db.refresh(fisio)
        
        print(f"Estado actualizado a: {fisio.estado}")
        
        return fisio

    except Exception as e:
        print(f"Error en actualizar_estado_fisioterapeuta: {e}")
        db.rollback()
        raise e