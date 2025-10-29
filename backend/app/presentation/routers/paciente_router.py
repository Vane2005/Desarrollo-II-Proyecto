from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from app.presentation.schemas.usuario_schema import PacienteCreate
from app.data.db import get_db
from sqlalchemy import text
from app.logic.paciente_service import crear
from datetime import datetime
import traceback

router = APIRouter(prefix="/paciente", tags=["Paciente"])

# ============================================================
# 1️⃣ REGISTRAR PACIENTE
# ============================================================
@router.post("/register", status_code=status.HTTP_201_CREATED)
def registrar(datos: PacienteCreate, db: Session = Depends(get_db)):
    """
    Registra un nuevo Paciente en el sistema
    """
    try:
        usuario, contrasena_generada = crear(
            db=db,
            cedula=datos.cedula,
            correo=datos.email,
            nombre=datos.nombre,
            telefono=datos.telefono
        )
        
        return {
            "mensaje": f"Usuario {usuario.nombre} registrado correctamente",
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
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error al registrar usuario: {str(e)}")



# ============================================================
# 3️⃣ OBTENER LISTA DE EJERCICIOS
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
# 2️⃣ BUSCAR PACIENTE POR CÉDULA
# ============================================================
@router.get("/{cedula}")
def obtener_paciente(cedula: str, db: Session = Depends(get_db)):
    """
    Obtiene la información de un paciente por su cédula
    """
    try:
        query = text("""
            SELECT nombre, correo, telefono
            FROM Paciente
            WHERE cedula = :cedula
        """)
        paciente = db.execute(query, {"cedula": cedula}).fetchone()

        if not paciente:
            raise HTTPException(status_code=404, detail="Paciente no encontrado")

        # Ver cuántas columnas llegaron realmente
        print("Resultado SQL:", paciente)

        # Si solo tiene 2 columnas (nombre, correo)
        if len(paciente) == 2:
            return {
                "nombre": paciente[0],
                "correo": paciente[1],
                "telefono": None
            }

        # Si tiene 3 columnas (nombre, correo, telefono)
        return {
            "nombre": paciente[0],
            "correo": paciente[1],
            "telefono": paciente[2]
        }

    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))










# ============================================================
# 4️⃣ ASIGNAR EJERCICIOS A PACIENTE
# ============================================================
@router.post("/asignar-ejercicio")
def asignar_ejercicio(payload: dict, db: Session = Depends(get_db)):
    """
    Asigna uno o varios ejercicios a un paciente
    """
    cedula = payload.get("cedula_paciente")
    ejercicios = payload.get("ejercicios", [])

    if not cedula:
        raise HTTPException(status_code=400, detail="Debe proporcionar una cédula de paciente.")
    if not ejercicios:
        raise HTTPException(status_code=400, detail="Debe seleccionar al menos un ejercicio.")

    try:
        for id_ejercicio in ejercicios:
            query = text("""
                INSERT INTO Terapia_Asignada (Cedula_paciente, Id_ejercicio, Estado, Fecha_asignacion)
                VALUES (:cedula, :id_ejercicio, 'Pendiente', :fecha)
            """)
            db.execute(query, {
                "cedula": cedula,
                "id_ejercicio": id_ejercicio,
                "fecha": datetime.now().date()
            })
        db.commit()

        return {"mensaje": " Ejercicios asignados correctamente"}
    except Exception as e:
        db.rollback()
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error al asignar ejercicios: {str(e)}")
    
        # ============================================================
    # OBTENER EJERCICIOS ASIGNADOS A UN PACIENTE
    # ============================================================
    @router.get("/{cedula}/ejercicios-asignados")
    def obtener_ejercicios_asignados(cedula: str, db: Session = Depends(get_db)):
        try:
            print(f"[DEBUG] solicitando ejercicios asignados para cedula={cedula}")
            query = text("""
                SELECT E.id_ejercicio, E.nombre, E.descripcion, E.categoria
                FROM Ejercicio E
                INNER JOIN Terapia_Asignada T
                    ON E.id_ejercicio = T.Id_ejercicio
                WHERE T.Cedula_paciente = :cedula
            """)
            resultados = db.execute(query, {"cedula": cedula}).fetchall()
            print("[DEBUG] resultados:", resultados)
            if not resultados:
                return []
            return [
                {"id_ejercicio": r[0], "nombre": r[1], "descripcion": r[2], "categoria": r[3]}
                for r in resultados
            ]
        except Exception as e:
            import traceback, sys
            print("ERROR en /{cedula}/ejercicios-asignados:", repr(e))
            traceback.print_exc(file=sys.stdout)
            raise HTTPException(status_code=500, detail=str(e))

    




# ============================================================
# 5️⃣ OBTENER EJERCICIOS COMPLETADOS DE UN PACIENTE
# ============================================================
@router.get("/ejercicios-completados/{cedula}")
def obtener_ejercicios_completados(cedula: str, db: Session = Depends(get_db)):
    """
    Obtiene todos los ejercicios completados de un paciente específico
    incluyendo la URL del video de Cloudinary
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
                ta.Observaciones
            FROM Terapia_Asignada ta
            INNER JOIN Ejercicio e ON ta.Id_ejercicio = e.Id_ejercicio
            LEFT JOIN Extremidad ext ON e.Id_extremidad = ext.Id_extremidad
            WHERE ta.Cedula_paciente = :cedula 
            AND ta.Estado = 'Completado'
            ORDER BY ta.Fecha_realizacion DESC
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
                "observaciones": e[7]
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
# 6️⃣ OBTENER EJERCICIOS ASIGNADOS DE UN PACIENTE
# ============================================================
@router.get("/ejercicios-asignados/{cedula}")
def obtener_ejercicios_asignados(cedula: str, db: Session = Depends(get_db)):
    """
    Obtiene todos los ejercicios asignados (estado Pendiente) de un paciente específico
    incluyendo la URL del video de Cloudinary
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
                ta.Id_terapia
            FROM Terapia_Asignada ta
            INNER JOIN Ejercicio e ON ta.Id_ejercicio = e.Id_ejercicio
            LEFT JOIN Extremidad ext ON e.Id_extremidad = ext.Id_extremidad
            WHERE ta.Cedula_paciente = :cedula 
            AND ta.Estado = 'Pendiente'
            ORDER BY ta.Fecha_asignacion DESC
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
                "id_terapia": e[7]
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
