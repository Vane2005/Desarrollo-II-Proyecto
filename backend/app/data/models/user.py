from sqlalchemy import Column, Integer, String, Boolean
from app.data.db import Base

class User_Fisioterapeuta(Base):
    __tablename__ = "fisioterapeuta"
    cedula = Column(String, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    correo = Column(String, unique=True, index=True, nullable=False)
    contrasena = Column(String, nullable=False)
    estado = Column(String, nullable=False)
    telefono = Column(String, nullable=False)


class User_Paciente(Base):
    __tablename__ = "paciente"
    cedula = Column(String, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    correo = Column(String, unique=True, index=True, nullable=False)
    contrasena = Column(String, nullable=False)
    telefono = Column(String, nullable=False)