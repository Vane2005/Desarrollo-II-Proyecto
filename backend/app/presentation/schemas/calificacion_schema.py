from pydantic import BaseModel, Field
from typing import Optional

class CalificacionEjercicio(BaseModel):
    """
    Esquema para calificar un ejercicio después de completarlo
    Escala de 1 a 5 para dolor, sensación y cansancio
    """
    id_terapia: int = Field(..., description="ID de la terapia asignada")
    dolor: int = Field(..., ge=1, le=5, description="Nivel de dolor (1-5)")
    sensacion: int = Field(..., ge=1, le=5, description="Nivel de sensación (1-5)")
    cansancio: int = Field(..., ge=1, le=5, description="Nivel de cansancio (1-5)")
    observaciones: Optional[str] = Field(None, max_length=500, description="Observaciones adicionales")

    class Config:
        json_schema_extra = {
            "example": {
                "id_terapia": 1,
                "dolor": 3,
                "sensacion": 2,
                "cansancio": 4,
                "observaciones": "El ejercicio fue más difícil de lo esperado"
            }
        }


class CalificacionResponse(BaseModel):
    """
    Respuesta después de guardar las calificaciones
    """
    message: str
    id_terapia: int
    estado: str

    class Config:
        from_attributes = True
