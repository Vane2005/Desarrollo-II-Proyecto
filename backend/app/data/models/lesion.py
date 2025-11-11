from sqlalchemy import Column, Integer, String, Boolean
from app.data.db import Base

class User(Base):
    __tablename__ = "lesion"
    id_lesion = Column(String, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
