from datetime import date
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from data.db import get_db
from logic.terapia_service import verificar_y_actualizar_estado_paciente

router = APIRouter(prefix="/paciente", tags=["Paciente"])

@router.put("/marcar-realizado/{id_terapia}")
def marcar_ejercicio_realizado(id_terapia: int, db: Session = Depends(get_db)):
    """
    Marca una terapia (ejercicio asignado) como completada
    y verifica si el paciente debe cambiar de estado a inactivo
    """
    try:
        # Verificamos si la terapia existe y obtenemos la cédula del paciente
        query_select = text("""
            SELECT Estado, Cedula_paciente
            FROM Terapia_Asignada 
            WHERE Id_terapia = :id_terapia
        """)
        terapia = db.execute(query_select, {"id_terapia": id_terapia}).fetchone()

        if not terapia:
            raise HTTPException(status_code=404, detail="Terapia no encontrada")

        cedula_paciente = terapia[1]

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

        estado_resultado = verificar_y_actualizar_estado_paciente(db, cedula_paciente)

        return {
            "message": "Terapia marcada como completada",
            "id_terapia": id_terapia,
            "estado_paciente": estado_resultado
        }

    except Exception as e:
        db.rollback()
        print("ERROR en /paciente/marcar-realizado:")
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/ejercicios-por-grupo/{cedula}")
def obtener_ejercicios_por_grupo(cedula: str, db: Session = Depends(get_db)):
    """
    Obtiene todos los ejercicios de un paciente agrupados por número de grupo de terapia
    """
    try:
        query = text("""
            SELECT 
                ta.Grupo_terapia,
                COUNT(*) as total_ejercicios,
                SUM(CASE WHEN ta.Estado = 'Completado' THEN 1 ELSE 0 END) as completados,
                MIN(ta.Fecha_asignacion) as fecha_inicio,
                MAX(ta.Fecha_realizacion) as fecha_fin
            FROM Terapia_Asignada ta
            WHERE ta.Cedula_paciente = :cedula
            GROUP BY ta.Grupo_terapia
            ORDER BY ta.Grupo_terapia DESC
        """)
        
        grupos = db.execute(query, {"cedula": cedula}).fetchall()
        
        if not grupos:
            return []
        
        return [
            {
                "grupo_terapia": g[0],
                "total_ejercicios": g[1],
                "completados": g[2],
                "pendientes": g[1] - g[2],
                "progreso_porcentaje": round((g[2] / g[1]) * 100, 2) if g[1] > 0 else 0,
                "fecha_inicio": g[3].isoformat() if g[3] else None,
                "fecha_fin": g[4].isoformat() if g[4] else None,
                "estado": "Completado" if g[2] == g[1] else "En Progreso"
            }
            for g in grupos
        ]
        
    except Exception as e:
        print("ERROR en /paciente/ejercicios-por-grupo:")
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
