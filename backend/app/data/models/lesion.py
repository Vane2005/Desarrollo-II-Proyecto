from sqlalchemy import Column, Integer, String, Boolean
from app.data.db import Base

class User(Base):
    """Modelo SQLAlchemy que representa una lesión.

    Esta clase ORM mapea a la tabla 'lesion' y define los campos persistidos para una entidad de tipo lesión.

    Atributos:
        id_lesion (str): Identificador único de la lesión. Clave primaria e indexada.
        nombre (str): Nombre de la lesión. Campo obligatorio (no nulo).

    Notas:
        - Hereda de la Base declarativa de SQLAlchemy.
        - Las columnas están definidas con sqlalchemy.Column y tipos de cadena.
        - `__tablename__` está establecido en 'lesion'.
    """
    __tablename__ = "lesion"
    id_lesion = Column(String, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
