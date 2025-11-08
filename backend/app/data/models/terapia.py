from sqlalchemy import Column, Integer, String, Date, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.data.db import Base

class TerapiaAsignada(Base):
    """
    Representa una terapia asignada a un paciente.

    Modelo SQLAlchemy que mapea la tabla "terapia_asignada". Cada instancia corresponde
    a una asignación de un ejercicio terapéutico a un paciente, con información sobre
    fechas, estado y observaciones.

    Atributos (columnas):
    - Id_terapia (int): Clave primaria de la asignación.
    - Cedula_paciente (str): Cédula del paciente. Llave foránea a paciente.Cedula. No nulo.
    - Id_ejercicio (int): Identificador del ejercicio asignado. Llave foránea a ejercicio.Id_ejercicio. No nulo.
    - Estado (str): Estado de la asignación. Valor por defecto "Pendiente". (p. ej. "Pendiente", "Completada", "Cancelada")
    - Fecha_asignacion (date): Fecha en que se asignó la terapia.
    - Fecha_realizacion (date): Fecha en que se realizó o completó la terapia.
    - Observaciones (str): Campo de texto libre para comentarios adicionales.

    Relaciones:
    - paciente: relación hacia el modelo Paciente (back_populates="terapias"), permite acceder a los datos del paciente asociado.
    - ejercicio: relación hacia el modelo Ejercicio, permite acceder a los detalles del ejercicio asignado.

    Consideraciones:
    - Las fechas deben ser objetos datetime.date.
    - Validaciones adicionales (p. ej. rango de fechas, formatos de cédula, estados válidos) deben implementarse en la lógica de negocio o mediante validadores/constraints si se requiere.
    - Diseñado para integrarse con sesiones de SQLAlchemy para persistencia y consultas.
    """
    __tablename__ = "terapia_asignada"

    Id_terapia = Column(Integer, primary_key=True, index=True)
    Grupo_terapia = Column(Integer, nullable=False, default=1)
    Cedula_paciente = Column(String(20), ForeignKey("paciente.Cedula"), nullable=False)
    Id_ejercicio = Column(Integer, ForeignKey("ejercicio.Id_ejercicio"), nullable=False)
    Estado = Column(String(20), default="Pendiente")
    Fecha_asignacion = Column(Date)
    Fecha_realizacion = Column(Date)
    Observaciones = Column(Text)

    # Relaciones (opcional)
    paciente = relationship("Paciente", back_populates="terapias")
    ejercicio = relationship("Ejercicio")
