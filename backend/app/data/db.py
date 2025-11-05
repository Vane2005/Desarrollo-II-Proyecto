from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# URL de conexión a PostgreSQL
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:1234@localhost:5432/app_medica"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """
    Generador que provee una sesión de base de datos y garantiza su cierre.

    Crea una nueva sesión usando la fábrica SessionLocal, la cede al llamador
    (p. ej. como dependencia en FastAPI) y asegura que la sesión se cierre en
    el bloque finally, incluso si ocurre una excepción.

    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()