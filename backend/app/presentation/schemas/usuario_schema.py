# backend/app/presentation/schemas/usuario_schema.py
from pydantic import BaseModel, EmailStr, Field

class FisioCreate(BaseModel):
    #Schema para crear un fisioterapeuta
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
    #Schema para respuesta del fisioterapeuta
    id: str
    email: str
    nombre: str
    contrasena: str
    telefono: str
    mensaje: str

    class Config:
        from_attributes = True  

class LoginCreate(BaseModel):
    """Schema para login"""
    email: EmailStr = Field(..., description="Email del usuario")
    contrasena: str = Field(..., min_length=4, description="Contraseña")
    class Config:
        json_schema_extra = {
            "example": {
                "email": "fisio@ejemplo.com",
                "contrasena": "miPassword123"
            }
        }
class LoginResponse(BaseModel):
    """Schema para respuesta de login"""
    access_token: str
    token_type: str = "bearer"
    tipo_usuario: str  # "fisio" o "paciente"
    nombre: str
    email: str
    class Config:
        from_attributes = True     

class PacienteCreate(BaseModel):
    #Schema para crear un fisioterapeuta
    cedula: str = Field(..., min_length=6, max_length=20, description="Cédula")
    email: EmailStr = Field(..., description="Email ")
    nombre: str = Field(..., min_length=2, max_length=100, description="Nombre completo")
   
    telefono: str = Field(..., min_length=7, max_length=15, description="Número de teléfono")

    class Config:
        json_schema_extra = {
            "example": {
                "cedula": "1234567890",
                "email": "paciente@ejemplo.com",
                "nombre": "Juan Pérez",
            
                "telefono": "3001234567"
            }
        }   

class RecuperarContrasenaRequest(BaseModel):
    """Schema para solicitud de recuperación de contraseña"""
    email: EmailStr = Field(..., description="Email del usuario")
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "usuario@ejemplo.com"
            }
        }

class RecuperarContrasenaResponse(BaseModel):
    """Schema para respuesta de recuperación de contraseña"""
    mensaje: str
    email: str

class CambiarContrasenaRequest(BaseModel):
    """Schema para solicitud de cambio de contraseña"""
    contrasena_actual: str = Field(..., min_length=4, description="Contraseña actual")
    contrasena_nueva: str = Field(..., min_length=8, description="Nueva contraseña (mínimo 8 caracteres)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "contrasena_actual": "password123",
                "contrasena_nueva": "newPassword456"
            }
        }

class CambiarContrasenaResponse(BaseModel):
    """Schema para respuesta de cambio de contraseña"""
    mensaje: str
    email: str


