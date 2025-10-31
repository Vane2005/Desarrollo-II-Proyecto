from sqlalchemy import Column, Integer, String, Boolean
from app.data.db import Base

class User_Fisioterapeuta(Base):
    """
    Modelo SQLAlchemy que representa a un fisioterapeuta en la base de datos.

    Atributos:
        __tablename__ (str): Nombre de la tabla asociada: "fisioterapeuta".
        cedula (str): Identificador único del fisioterapeuta. Clave primaria e indexado.
        nombre (str): Nombre completo del fisioterapeuta. Campo obligatorio.
        correo (str): Correo electrónico del fisioterapeuta. Debe ser único e indexado.
        contrasena (str): Contraseña (debe almacenarse como hash seguro). Campo obligatorio.
        estado (str): Estado del usuario (por ejemplo, "activo" o "inactivo"). Campo obligatorio.
        telefono (str): Número telefónico del fisioterapeuta. Campo obligatorio.

    """
    __tablename__ = "fisioterapeuta"
    cedula = Column(String, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    correo = Column(String, unique=True, index=True, nullable=False)
    contrasena = Column(String, nullable=False)
    estado = Column(String, nullable=False)
    telefono = Column(String, nullable=False)


class User_Paciente(Base):
    """
    Modelo SQLAlchemy que representa la tabla "paciente".

    Clase:
        User_Paciente -- mapea la entidad paciente en la base de datos.

    Descripción:
        Esta clase define la estructura de la tabla "paciente" con los campos
        básicos de un usuario/paciente. Está pensada para usarse con SQLAlchemy
        como modelo declarativo (Base).

    Atributos (columnas):
        cedula (str): Identificador único del paciente. Clave primaria y con índice.
        nombre (str): Nombre completo del paciente. No puede ser nulo.
        correo (str): Correo electrónico del paciente. Debe ser único, con índice y no nulo.
        contrasena (str): Contraseña del paciente. No puede ser nula.
                         NOTA: por seguridad, nunca almacenar contraseñas en texto plano;
                         almacenar únicamente valores hasheados (por ejemplo, bcrypt).
        telefono (str): Número de teléfono del paciente. No puede ser nulo.

    """
    __tablename__ = "paciente"
    cedula = Column(String, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    correo = Column(String, unique=True, index=True, nullable=False)
    contrasena = Column(String, nullable=False)
    telefono = Column(String, nullable=False)