from pydantic import BaseModel, Field
from typing import Optional

class PaymentIntentCreate(BaseModel):
    amount: int = Field(..., description="Monto en centavos (ej: 19999900 = $199,999 COP)")
    currency: str = Field(default="cop", description="Moneda (cop para pesos colombianos)")  
    description: Optional[str] = Field(None, description="Descripción del pago")
    customer_email: str = Field(..., description="Email del cliente")
    
    class Config:
        json_schema_extra = {
            "example": {
                "amount": 19999900,  
                "currency": "cop",  
                "description": "Compra única TerapiaFisica+",
                "customer_email": "cliente@ejemplo.com"
            }
        }

class PaymentIntentResponse(BaseModel):
    client_secret: str
    publishable_key: str
    amount: int
    currency: str

class PaymentConfirmRequest(BaseModel):
    #Schema para confirmar pago y activar usuario
    payment_intent_id: str = Field(..., description="ID del PaymentIntent de Stripe")
    cedula: str = Field(..., description="Cédula del fisioterapeuta a activar")
    
    class Config:
        json_schema_extra = {
            "example": {
                "payment_intent_id": "pi_1234567890",
                "cedula": "1234567890"
            }
        }