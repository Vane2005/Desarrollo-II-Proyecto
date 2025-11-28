from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from presentation.routers.auth_router import get_current_user

from presentation.schemas.usuario_schema import (
    PacienteCreate, 
    ActualizarPerfilPaciente,
    InfoPacienteResponse
)
from data.db import get_db
from sqlalchemy import text
from logic.paciente_service import (
    crear,
    obtener_info_paciente,
    actualizar_perfil_paciente
)
from logic.terapia_service import (
    obtener_historial_terapias_completadas,
    obtener_resumen_grupos_terapia,
    verificar_y_actualizar_estado_paciente,
    obtener_estado_paciente,
    activar_paciente  # Importar la nueva función activar_paciente
)
from datetime import datetime
import traceback
from presentation.routers.auth_router import get_current_user_cedula

router = APIRouter(prefix="/paciente", tags=["Paciente"])

# ============================================================
# 1 REGISTRAR PACIENTE
# ============================================================
from fastapi import Depends

@router.post("/register", status_code=status.HTTP_201_CREATED)
def registrar(
    datos: PacienteCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)   # ← AQUI SE AGREGA
):
    """
    Registra un nuevo Paciente en el sistema y lo asocia al fisioterapeuta que lo crea.
    """
    try:
        # Obtener la cédula del fisioterapeuta que está logueado
        cedula_fisio = current_user.cedula

        usuario, contrasena_generada = crear(
            db=db,
            cedula=datos.cedula,
            correo=datos.email,
            nombre=datos.nombre,
            telefono=datos.telefono,
            historiaclinica=datos.historiaclinica
        )

        # Crear relación en TRATA (unión fisio – paciente)
        query = text("""
            INSERT INTO trata (cedula_fisioterapeuta, cedula_paciente)
            VALUES (:cedula_fisioterapeuta, :cedula_paciente)
        """)
        db.execute(query, {
            "cedula_fisioterapeuta": cedula_fisio,
            "cedula_paciente": datos.cedula
        })
        db.commit()

        return {
            "mensaje": f"Paciente {usuario.nombre} registrado correctamente",
            "cedula_fisio": cedula_fisio,
            "usuario": {
                "id": usuario.cedula,
                "nombre": usuario.nombre,
                "email": usuario.correo
            },
            "credenciales": {
                "correo": usuario.correo,
                "contrasena": contrasena_generada
            }
        }
    
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        print("ERROR COMPLETO:")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al registrar usuario: {str(e)}"
        )

# ============================================================
# 2 OBTENER LISTA DE EJERCICIOS
# ============================================================


@router.get("/ejercicios")
def obtener_ejercicios(db: Session = Depends(get_db)):
    """
    Devuelve todos los ejercicios disponibles con sus videos
    """
    try:
        query = text("""
            SELECT e.id_ejercicio, e.nombre, e.descripcion, e.repeticion, e.url, ext.nombre as extremidad
            FROM Ejercicio e
            LEFT JOIN Extremidad ext ON e.id_extremidad = ext.id_extremidad
        """)
        ejercicios = db.execute(query).fetchall()

        if not ejercicios:
            print(" No hay ejercicios en la base de datos.")
            return []

        return [
            {
                "id_ejercicio": e[0],
                "nombre": e[1],
                "descripcion": e[2],
                "repeticiones": e[3],
                "url_video": e[4],
                "extremidad": e[5] if e[5] else "General"
            }
            for e in ejercicios
        ]
    except Exception as e:
        import traceback, sys
        print(" ERROR EN /paciente/ejercicios:")
        traceback.print_exc(file=sys.stdout)
        return {"error_debug": repr(e)}



# ============================================================
# 3 OBTENER TODOS LOS PACIENTES
# ============================================================
@router.get("/todos")
def obtener_todos_pacientes(
    fisio_id: str,
    db: Session = Depends(get_db)
):
    try:
        query = text("""
            SELECT p.cedula, p.nombre, p.correo, p.telefono, p.estado
            FROM Paciente p
            INNER JOIN trata t ON p.cedula = t.cedula_paciente
            WHERE t.cedula_fisioterapeuta = :fisio_id
            ORDER BY p.nombre
        """)

        pacientes = db.execute(query, {"fisio_id": fisio_id}).fetchall()

        return [
            {
                "cedula": p[0],
                "nombre": p[1],
                "correo": p[2],
                "telefono": p[3],
                "estado": p[4]
            }
            for p in pacientes
        ]

    except Exception as e:
        raise HTTPException(500, f"Error: {str(e)}")



# ============================================================
# 4 BUSCAR PACIENTE POR CÉDULA
# ============================================================
@router.get("/{cedula}")
def obtener_paciente(
    cedula: str,
    fisio_id: str,
    db: Session = Depends(get_db)
):
    try:
        query = text("""
            SELECT p.nombre, p.correo, p.telefono, p.historiaclinica
            FROM Paciente p
            INNER JOIN trata t ON p.cedula = t.cedula_paciente
            WHERE p.cedula = :cedula
            AND t.cedula_fisioterapeuta = :fisio_id
        """)

        paciente = db.execute(query, {
            "cedula": cedula,
            "fisio_id": fisio_id
        }).fetchone()

        if not paciente:
            raise HTTPException(404, "Paciente no encontrado o no pertenece a este fisioterapeuta")

        return {
            "nombre": paciente[0],
            "correo": paciente[1],
            "telefono": paciente[2],
            "historiaclinica": paciente[3]
        }

    except Exception as e:
        raise HTTPException(500, str(e))


    

    
@router.get("/info-paciente", response_model=InfoPacienteResponse)
def obtener_info_paciente_endpoint(
    cedula: str = Depends(get_current_user_cedula),
    db: Session = Depends(get_db)
):
    """
    Obtiene la información del paciente autenticado
    """
    try:
        info = obtener_info_paciente(db, cedula)
        return info
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        print("ERROR AL OBTENER INFO PACIENTE:", traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al obtener información del paciente"
        )

@router.put("/actualizar-perfil", response_model=InfoPacienteResponse)
def actualizar_perfil_paciente_endpoint(
    datos: ActualizarPerfilPaciente,
    cedula: str = Depends(get_current_user_cedula),
    db: Session = Depends(get_db)
):
    """
    Actualiza el perfil del paciente autenticado (nombre, correo, teléfono)
    """
    try:
        info_actualizada = actualizar_perfil_paciente(
            db=db,
            cedula=cedula,
            nombre=datos.nombre,
            correo=datos.correo,
            telefono=datos.telefono
        )
        
        return info_actualizada
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        print("ERROR AL ACTUALIZAR PERFIL PACIENTE:", traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al actualizar el perfil del paciente"
        )

# ============================================================
# 5 ASIGNAR EJERCICIOS A PACIENTE
# ============================================================
@router.post("/asignar-ejercicio")
def asignar_ejercicio(payload: dict, db: Session = Depends(get_db)):
    """
    Asigna uno o varios ejercicios a un paciente con número de grupo de terapia automático
    y activa al paciente si estaba inactivo
    """
    cedula = payload.get("cedula_paciente")
    ejercicios = payload.get("ejercicios", [])

    if not cedula:
        raise HTTPException(status_code=400, detail="Debe proporcionar una cédula de paciente.")
    if not ejercicios:
        raise HTTPException(status_code=400, detail="Debe seleccionar al menos un ejercicio.")

    try:
        query_ultimo_grupo = text("""
            SELECT COALESCE(MAX(Grupo_terapia), 0) as ultimo_grupo
            FROM Terapia_Asignada
            WHERE Cedula_paciente = :cedula
        """)
        resultado = db.execute(query_ultimo_grupo, {"cedula": cedula}).fetchone()
        ultimo_grupo = resultado[0] if resultado else 0
        
        nuevo_grupo = ultimo_grupo + 1
        
        print(f"[DEBUG] Paciente {cedula}: Último grupo = {ultimo_grupo}, Nuevo grupo = {nuevo_grupo}")

        for id_ejercicio in ejercicios:
            query = text("""
                INSERT INTO Terapia_Asignada (Grupo_terapia, Cedula_paciente, Id_ejercicio, Estado, Fecha_asignacion)
                VALUES (:grupo, :cedula, :id_ejercicio, 'Pendiente', :fecha)
            """)
            db.execute(query, {
                "grupo": nuevo_grupo,
                "cedula": cedula,
                "id_ejercicio": id_ejercicio,
                "fecha": datetime.now().date()
            })
        db.commit()

        estado_resultado = activar_paciente(db, cedula)

        return {
            "mensaje": "Ejercicios asignados correctamente",
            "grupo_terapia": nuevo_grupo,
            "total_ejercicios": len(ejercicios),
            "estado_paciente": estado_resultado
        }
    except Exception as e:
        db.rollback()
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error al asignar ejercicios: {str(e)}")

# ============================================================
# 6 OBTENER EJERCICIOS COMPLETADOS DE UN PACIENTE
# ============================================================
@router.get("/ejercicios-completados/{cedula}")
def obtener_ejercicios_completados(cedula: str, db: Session = Depends(get_db)):
    """
    Obtiene todos los ejercicios completados de un paciente específico
    incluyendo la URL del video de Cloudinary y el grupo de terapia
    """
    try:
        query = text("""
            SELECT 
                e.Id_ejercicio,
                e.Nombre,
                e.Descripcion,
                e.Repeticion,
                e.Url,
                ext.Nombre as Extremidad,
                ta.Fecha_realizacion,
                ta.Observaciones,
                ta.Grupo_terapia
            FROM Terapia_Asignada ta
            INNER JOIN Ejercicio e ON ta.Id_ejercicio = e.Id_ejercicio
            LEFT JOIN Extremidad ext ON e.Id_extremidad = ext.Id_extremidad
            WHERE ta.Cedula_paciente = :cedula 
            AND ta.Estado = 'Completado'
            ORDER BY ta.Grupo_terapia DESC, ta.Fecha_realizacion DESC
        """)
        
        ejercicios = db.execute(query, {"cedula": cedula}).fetchall()
        
        if not ejercicios:
            return []
        
        return [
            {
                "id_ejercicio": e[0],
                "nombre": e[1],
                "descripcion": e[2],
                "repeticiones": e[3],
                "url_video": e[4],
                "extremidad": e[5] if e[5] else "General",
                "fecha_realizacion": e[6].isoformat() if e[6] else None,
                "observaciones": e[7],
                "grupo_terapia": e[8]
            }
            for e in ejercicios
        ]
        
    except Exception as e:
        print("ERROR EN /paciente/ejercicios-completados:")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500, 
            detail=f"Error al obtener ejercicios completados: {str(e)}"
        )

# ============================================================
# 7 OBTENER EJERCICIOS ASIGNADOS DE UN PACIENTE
# ============================================================
@router.get("/ejercicios-asignados/{cedula}")
def obtener_ejercicios_asignados(cedula: str, db: Session = Depends(get_db)):
    """
    Obtiene todos los ejercicios asignados (estado Pendiente) de un paciente específico
    incluyendo la URL del video de Cloudinary y el grupo de terapia
    """
    try:
        query = text("""
            SELECT 
                e.Id_ejercicio,
                e.Nombre,
                e.Descripcion,
                e.Repeticion,
                e.Url,
                ext.Nombre as Extremidad,
                ta.Fecha_asignacion,
                ta.Id_terapia,
                ta.Grupo_terapia
            FROM Terapia_Asignada ta
            INNER JOIN Ejercicio e ON ta.Id_ejercicio = e.Id_ejercicio
            LEFT JOIN Extremidad ext ON e.Id_extremidad = ext.Id_extremidad
            WHERE ta.Cedula_paciente = :cedula 
            AND ta.Estado = 'Pendiente'
            ORDER BY ta.Grupo_terapia DESC, ta.Fecha_asignacion DESC
        """)
        
        ejercicios = db.execute(query, {"cedula": cedula}).fetchall()
        
        if not ejercicios:
            return []
        
        return [
            {
                "id_ejercicio": e[0],
                "nombre": e[1],
                "descripcion": e[2],
                "repeticiones": e[3],
                "url_video": e[4],
                "extremidad": e[5] if e[5] else "General",
                "fecha_asignacion": e[6].isoformat() if e[6] else None,
                "id_terapia": e[7],
                "grupo_terapia": e[8]
            }
            for e in ejercicios
        ]
        
    except Exception as e:
        print("ERROR EN /paciente/ejercicios-asignados:")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500, 
            detail=f"Error al obtener ejercicios asignados: {str(e)}"
        )

# ============================================================
# 8 OBTENER HISTORIAL DE TERAPIAS
# ============================================================
@router.get("/historial-terapias/{cedula}")
def obtener_historial_terapias(cedula: str, db: Session = Depends(get_db)):
    """
    Obtiene el historial completo de terapias completadas de un paciente
    organizadas por grupo de terapia
    """
    try:
        historial = obtener_historial_terapias_completadas(db, cedula)
        return {
            "cedula": cedula,
            "total_terapias_completadas": len(historial),
            "historial": historial
        }
    except Exception as e:
        print("ERROR EN /paciente/historial-terapias:")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener historial de terapias: {str(e)}"
        )

# ============================================================
# 9 OBTENER RESUMEN DE GRUPOS DE TERAPIA
# ============================================================
@router.get("/resumen-grupos/{cedula}")
def obtener_resumen_grupos(cedula: str, db: Session = Depends(get_db)):
    """
    Obtiene un resumen de los grupos de terapia de un paciente
    con información de progreso y estado
    """
    try:
        resumen = obtener_resumen_grupos_terapia(db, cedula)
        return {
            "cedula": cedula,
            "total_grupos": len(resumen),
            "grupos": resumen
        }
    except Exception as e:
        print("ERROR EN /paciente/resumen-grupos:")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener resumen de grupos: {str(e)}"
        )

# ============================================================
# 10 OBTENER ESTADO DEL PACIENTE
# ============================================================
@router.get("/estado/{cedula}")
def obtener_estado(cedula: str, db: Session = Depends(get_db)):
    """
    Obtiene el estado actual del paciente (activo/inactivo)
    """
    try:
        estado = obtener_estado_paciente(db, cedula)
        return estado
    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )
    except Exception as e:
        print("ERROR EN /paciente/estado:")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener estado: {str(e)}"
        )

# ============================================================
# 11 VERIFICAR Y ACTUALIZAR ESTADO DEL PACIENTE
# ============================================================
@router.post("/verificar-estado/{cedula}")
def verificar_estado(cedula: str, db: Session = Depends(get_db)):
    """
    Verifica y actualiza el estado del paciente basado en sus terapias completadas.
    Si ha completado todos sus grupos, lo marca como inactivo.
    """
    try:
        resultado = verificar_y_actualizar_estado_paciente(db, cedula)
        return resultado
    except Exception as e:
        print("ERROR EN /paciente/verificar-estado:")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Error al verificar estado: {str(e)}"
        )

@router.get("/ejercicios-asignados-por-grupo/{cedula}")
def obtener_ejercicios_asignados_por_grupo(cedula: str, db: Session = Depends(get_db)):
    """
    Obtiene todos los ejercicios asignados de un paciente organizados por grupo de terapia
    Incluye solo ejercicios en estado 'Pendiente' o 'En Progreso'
    """
    try:
        query = text("""
            SELECT 
                ta.Grupo_terapia,
                ta.Id_terapia,
                e.Id_ejercicio,
                e.Nombre,
                e.Descripcion,
                e.Repeticion,
                e.Url,
                ext.Nombre as Extremidad,
                ta.Estado,
                ta.Fecha_asignacion
            FROM Terapia_Asignada ta
            INNER JOIN Ejercicio e ON ta.Id_ejercicio = e.Id_ejercicio
            LEFT JOIN Extremidad ext ON e.Id_extremidad = ext.Id_extremidad
            WHERE ta.Cedula_paciente = :cedula 
            AND ta.Estado IN ('Pendiente', 'En Progreso')
            ORDER BY ta.Grupo_terapia DESC, ta.Fecha_asignacion DESC
        """)
        
        ejercicios = db.execute(query, {"cedula": cedula}).fetchall()
        
        if not ejercicios:
            return {"grupos": []}
        
        # Agrupar por Grupo_terapia
        grupos_dict = {}
        for e in ejercicios:
            grupo_num = e[0]
            if grupo_num not in grupos_dict:
                grupos_dict[grupo_num] = {
                    "grupo_terapia": grupo_num,
                    "ejercicios": []
                }
            
            grupos_dict[grupo_num]["ejercicios"].append({
                "id_terapia": e[1],
                "id_ejercicio": e[2],
                "nombre": e[3],
                "descripcion": e[4],
                "repeticiones": e[5],
                "url_video": e[6],
                "extremidad": e[7] if e[7] else "General",
                "estado": e[8],
                "fecha_asignacion": e[9].isoformat() if e[9] else None
            })
        
        # Convertir a lista ordenada por grupo descendente
        grupos_list = sorted(grupos_dict.values(), key=lambda x: x["grupo_terapia"], reverse=True)
        
        return {"grupos": grupos_list}
        
    except Exception as e:
        print("ERROR en /paciente/ejercicios-asignados-por-grupo:")
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
