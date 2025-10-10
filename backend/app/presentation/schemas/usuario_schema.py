# backend/app/presentation/schemas/usuario_schema.py
from pydantic import BaseModel, EmailStr, Field

class FisioCreate(BaseModel):
    """Schema para crear un fisioterapeuta"""
    cedula: str = Field(..., min_length=6, max_length=20, description="Cédula del fisioterapeuta")
    email: EmailStr = Field(..., description="Email del usuario")
    nombre: str = Field(..., min_length=2, max_length=100, description="Nombre completo")
    contrasena: str = Field(..., min_length=4, description="Contraseña (mínimo 4 caracteres)")
    telefono: str = Field(..., min_length=7, max_length=15, description="Número de teléfono")

    class Config:
        json_schema_extra = {
            "example": {
                "cedula": "1234567890",
                "email": "fisio@ejemplo.com",
                "nombre": "Juan Pérez",
                "contrasena": "miPassword123",
                "telefono": "3001234567"
            }
        }

class FisioResponse(BaseModel):
    """Schema para respuesta del fisioterapeuta"""
    id: str
    email: str
    nombre: str
    contrasena: str
    telefono: str
    mensaje: str

    class Config:
        from_attributes = True  # Antes era orm_mode = True