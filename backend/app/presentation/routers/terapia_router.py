from datetime import date
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.data.db import get_db

router = APIRouter(prefix="/paciente", tags=["Paciente"])

@router.put("/marcar-realizado/{id_terapia}")
def marcar_ejercicio_realizado(id_terapia: int, db: Session = Depends(get_db)):
    """
    Marca una terapia (ejercicio asignado) como completada
    """
    try:
        # Verificamos si la terapia existe
        query_select = text("""
            SELECT Estado 
            FROM Terapia_Asignada 
            WHERE Id_terapia = :id_terapia
        """)
        terapia = db.execute(query_select, {"id_terapia": id_terapia}).fetchone()

        if not terapia:
            raise HTTPException(status_code=404, detail="Terapia no encontrada")

        # Actualizamos estado y fecha
        query_update = text("""
            UPDATE Terapia_Asignada
            SET Estado = 'Completado',
                Fecha_realizacion = :fecha
            WHERE Id_terapia = :id_terapia
        """)
        db.execute(query_update, {
            "fecha": date.today(),
            "id_terapia": id_terapia
        })
        db.commit()

        return {"message": "Terapia marcada como completada", "id_terapia": id_terapia}

    except Exception as e:
        db.rollback()
        print("ERROR en /paciente/marcar-realizado:")
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
