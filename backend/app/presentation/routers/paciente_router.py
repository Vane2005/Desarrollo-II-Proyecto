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
# 3️⃣ OBTENER LISTA DE EJERCICIOS
# ============================================================
@router.get("/ejercicios")
def obtener_ejercicios(db: Session = Depends(get_db)):
    """
    Devuelve todos los ejercicios disponibles
    """
    try:
        query = text("""
            SELECT id_ejercicio, nombre, descripcion, parte_cuerpo
            FROM Ejercicio
        """)
        ejercicios = db.execute(query).fetchall()

        return [
            {
                "id_ejercicio": e[0],
                "nombre": e[1],
                "descripcion": e[2],
                "parte_cuerpo": e[3]
            }
            for e in ejercicios
        ]
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

        return {"mensaje": "✅ Ejercicios asignados correctamente"}
    except Exception as e:
        db.rollback()
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error al asignar ejercicios: {str(e)}")




