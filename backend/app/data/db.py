# backend/app/data/db.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Tu URL de conexión a PostgreSQL
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:1234@localhost:5432/app_medica"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 👇 Esta función es IMPORTANTE
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()