"""
Servicio para gestionar terapias, historial de ejercicios y cambio de estado del paciente
"""
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import date


def obtener_historial_terapias_completadas(db: Session, cedula_paciente: str):
    """
    Obtiene todo el historial de terapias completadas de un paciente,
    organizadas por grupo de terapia en orden descendente
    """
    try:
        query = text("""
            SELECT 
                ta.Grupo_terapia,
                e.Id_ejercicio,
                e.Nombre,
                e.Descripcion,
                e.Repeticion,
                e.Url,
                ext.Nombre as Extremidad,
                ta.Fecha_realizacion,
                ta.Observaciones,
                ta.Id_terapia
            FROM Terapia_Asignada ta
            INNER JOIN Ejercicio e ON ta.Id_ejercicio = e.Id_ejercicio
            LEFT JOIN Extremidad ext ON e.Id_extremidad = ext.Id_extremidad
            WHERE ta.Cedula_paciente = :cedula 
            AND ta.Estado = 'Completado'
            ORDER BY ta.Grupo_terapia DESC, ta.Fecha_realizacion DESC
        """)
        
        ejercicios = db.execute(query, {"cedula": cedula_paciente}).fetchall()
        
        if not ejercicios:
            return []
        
        return [
            {
                "id_terapia": e[9],
                "grupo_terapia": e[0],
                "id_ejercicio": e[1],
                "nombre": e[2],
                "descripcion": e[3],
                "repeticiones": e[4],
                "url_video": e[5],
                "extremidad": e[6] if e[6] else "General",
                "fecha_realizacion": e[7].isoformat() if e[7] else None,
                "observaciones": e[8]
            }
            for e in ejercicios
        ]
    except Exception as e:
        print(f"Error en obtener_historial_terapias_completadas: {e}")
        raise e


def obtener_resumen_grupos_terapia(db: Session, cedula_paciente: str):
    """
    Obtiene un resumen de cada grupo de terapia (total, completados, pendientes, progreso)
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
        
        grupos = db.execute(query, {"cedula": cedula_paciente}).fetchall()
        
        if not grupos:
            return []
        
        return [
            {
                "grupo_terapia": g[0],
                "total_ejercicios": g[1],
                "completados": g[2],
                "pendientes": g[1] - (g[2] if g[2] else 0),
                "progreso_porcentaje": round((g[2] / g[1]) * 100, 2) if g[1] > 0 else 0,
                "fecha_inicio": g[3].isoformat() if g[3] else None,
                "fecha_fin": g[4].isoformat() if g[4] else None,
                "estado": "Completado" if g[2] == g[1] else "En Progreso"
            }
            for g in grupos
        ]
    except Exception as e:
        print(f"Error en obtener_resumen_grupos_terapia: {e}")
        raise e


def verificar_y_actualizar_estado_paciente(db: Session, cedula_paciente: str):
    """
    Lógica mejorada: Solo cambia a inactivo si NO hay más terapias pendientes en NINGÚN grupo.
    Si hay cualquier ejercicio pendiente, el paciente permanece activo.
    """
    try:
        # Contar terapias pendientes (Pendiente) o en progreso (Asignadas sin realizar)
        query_pendientes = text("""
            SELECT COUNT(*) as pendientes
            FROM Terapia_Asignada
            WHERE Cedula_paciente = :cedula 
            AND Estado IN ('Pendiente', 'En Progreso')
        """)
        resultado = db.execute(query_pendientes, {"cedula": cedula_paciente}).fetchone()
        
        pendientes_count = resultado[0] if resultado and resultado[0] else 0
        
        if pendientes_count == 0:
            # Solo cambiar a inactivo si NO hay pendientes
            query_update = text("""
                UPDATE Paciente
                SET Estado = 'inactivo'
                WHERE Cedula = :cedula
            """)
            db.execute(query_update, {"cedula": cedula_paciente})
            db.commit()
            
            return {
                "cambio_realizado": True,
                "nuevo_estado": "inactivo",
                "razon": "Todos los ejercicios han sido completados"
            }
        else:
            return {
                "cambio_realizado": False,
                "razon": f"El paciente aún tiene {pendientes_count} ejercicios pendientes",
                "pendientes": pendientes_count
            }
    except Exception as e:
        print(f"Error en verificar_y_actualizar_estado_paciente: {e}")
        db.rollback()
        raise e


def activar_paciente(db: Session, cedula_paciente: str):
    """
    Nueva función: Cambia el estado del paciente a 'activo' cuando se le asignan nuevos ejercicios
    """
    try:
        query_update = text("""
            UPDATE Paciente
            SET Estado = 'activo'
            WHERE Cedula = :cedula
        """)
        db.execute(query_update, {"cedula": cedula_paciente})
        db.commit()
        
        return {
            "cambio_realizado": True,
            "nuevo_estado": "activo",
            "razon": "Se han asignado nuevos ejercicios al paciente"
        }
    except Exception as e:
        print(f"Error en activar_paciente: {e}")
        db.rollback()
        raise e


def obtener_estado_paciente(db: Session, cedula_paciente: str):
    """
    Obtiene el estado actual del paciente (activo/inactivo)
    """
    try:
        query = text("""
            SELECT Estado
            FROM Paciente
            WHERE Cedula = :cedula
        """)
        
        resultado = db.execute(query, {"cedula": cedula_paciente}).fetchone()
        
        if not resultado:
            raise ValueError("Paciente no encontrado")
        
        return {"estado": resultado[0]}
    except Exception as e:
        print(f"Error en obtener_estado_paciente: {e}")
        raise e


def guardar_calificaciones_ejercicio(db: Session, id_terapia: int, dolor: int, sensacion: int, cansancio: int, observaciones: str = None):
    """
    Nueva función para guardar las calificaciones del ejercicio después de realizarlo
    Actualiza los campos de dolor, sensación, cansancio y observaciones en Terapia_Asignada
    """
    try:
        query_update = text("""
            UPDATE Terapia_Asignada
            SET Dolor = :dolor,
                Sensacion = :sensacion,
                Cansancio = :cansancio,
                Observaciones = :observaciones
            WHERE Id_terapia = :id_terapia
        """)
        
        db.execute(query_update, {
            "dolor": dolor,
            "sensacion": sensacion,
            "cansancio": cansancio,
            "observaciones": observaciones,
            "id_terapia": id_terapia
        })
        db.commit()
        
        return {
            "message": "Calificaciones guardadas exitosamente",
            "id_terapia": id_terapia,
            "estado": "Guardado"
        }
    except Exception as e:
        print(f"Error en guardar_calificaciones_ejercicio: {e}")
        db.rollback()
        raise e
