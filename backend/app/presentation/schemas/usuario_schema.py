from pydantic import BaseModel, EmailStr, Field

class FisioCreate(BaseModel):
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
    id: str
    email: str
    nombre: str
    contrasena: str
    telefono: str
    mensaje: str

    class Config:
        from_attributes = True  

class LoginCreate(BaseModel):
    cedula: str = Field(..., min_length=6, max_length=20, description="Cédula del usuario")
    contrasena: str = Field(..., min_length=4, description="Contraseña")
    class Config:
        json_schema_extra = {
            "example": {
                "cedula": "1234567890",
                "contrasena": "miPassword123"
            }
        }

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    tipo_usuario: str
    nombre: str
    email: str
    class Config:
        from_attributes = True     

class PacienteCreate(BaseModel):
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
    email: EmailStr = Field(..., description="Email del usuario")
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "usuario@ejemplo.com"
            }
        }

class RecuperarContrasenaResponse(BaseModel):
    mensaje: str
    email: str


class CambiarContrasenaRequest(BaseModel):
    contrasena_actual: str = Field(..., min_length=4, description="Contraseña actual")
    nueva_contrasena: str = Field(..., min_length=8, max_length=72, description="Nueva contraseña (mínimo 8 caracteres)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "contrasena_actual": "miPassword123",
                "nueva_contrasena": "nuevaPassword456"
            }
        }


class InfoFisioterapeutaResponse(BaseModel):
    cedula: str
    nombre: str
    correo: str
    telefono: str
    estado: str
    
    class Config:
        from_attributes = True

class ActualizarPerfilFisioterapeuta(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=100, description="Nombre completo")
    correo: EmailStr = Field(..., description="Email del fisioterapeuta")
    telefono: str = Field(..., min_length=7, max_length=15, description="Número de teléfono")
    
    class Config:
        json_schema_extra = {
            "example": {
                "nombre": "Juan Pérez",
                "correo": "fisio@ejemplo.com",
                "telefono": "3001234567"
            }
        }


class ActualizarPerfilPaciente(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=100, description="Nombre completo")
    correo: EmailStr = Field(..., description="Email del paciente")
    telefono: str = Field(..., min_length=7, max_length=15, description="Número de teléfono")
    
    class Config:
        json_schema_extra = {
            "example": {
                "nombre": "María García",
                "correo": "paciente@ejemplo.com",
                "telefono": "3009876543"
            }
        }


class InfoPacienteResponse(BaseModel):
    cedula: str
    nombre: str
    correo: str
    telefono: str
    
    class Config:
        from_attributes = True
