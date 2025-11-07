from sqlalchemy import Column, Integer, String, Date, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.infrastructure.database import Base

class TerapiaAsignada(Base):
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
