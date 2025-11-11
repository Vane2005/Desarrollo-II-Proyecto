from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from presentation.schemas.payment_schema import PaymentIntentCreate, PaymentIntentResponse
from logic.payment_service import crear_payment_intent, confirmar_pago
from config.stripe_config import get_stripe_publishable_key
from data.db import get_db 
from logic.fisio_service import actualizar_estado_fisioterapeuta
from pydantic import BaseModel

router = APIRouter(prefix="/payments", tags=["Pagos"])

# Schema para el request de activación
class ActivarFisioterapeutaRequest(BaseModel):
    payment_intent_id: str
    cedula: str

@router.post("/create-payment-intent", response_model=PaymentIntentResponse)
def create_payment_intent(datos: PaymentIntentCreate):
    """
    Crea un PaymentIntent de Stripe para procesar un pago
    """
    try:
        # Crear el payment intent
        payment = crear_payment_intent(
            amount=datos.amount,
            currency=datos.currency,
            customer_email=datos.customer_email,
            description=datos.description
        )
        
        return {
            "client_secret": payment['client_secret'],
            "publishable_key": get_stripe_publishable_key(),
            "amount": payment['amount'],
            "currency": payment['currency']
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/verify-payment/{payment_intent_id}")
def verify_payment(payment_intent_id: str):
    """
    Verifica el estado de un pago
    """
    try:
        pago = confirmar_pago(payment_intent_id)
        return {
            "success": pago['status'] == 'succeeded',
            "status": pago['status'],
            "amount": pago['amount'],
            "currency": pago['currency']
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/config")
def get_stripe_config():
    """
    Retorna la clave pública de Stripe para el frontend
    """
    return {
        "publishable_key": get_stripe_publishable_key()
    }

# Activar fisioterapeuta después del pago
@router.post("/activate-fisioterapeuta")
async def activate_fisioterapeuta_after_payment(
    datos: ActivarFisioterapeutaRequest,
    db: Session = Depends(get_db)
):
    """
    Activa un fisioterapeuta después de verificar el pago exitoso
    """
    try:
        print(f"🔍 Recibida solicitud de activación:")
        print(f"   Payment Intent ID: {datos.payment_intent_id}")
        print(f"   Cédula: {datos.cedula}")
        
        # 1. Verificar que el pago fue exitoso
        try:
            pago = confirmar_pago(datos.payment_intent_id)
            print(f"✅ Pago verificado - Estado: {pago['status']}")
        except Exception as e:
            print(f"❌ Error verificando pago: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Error al verificar el pago: {str(e)}"
            )
        
        if pago['status'] != 'succeeded':
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El pago no fue exitoso. Estado: {pago['status']}"
            )
        
        # 2. Activar el fisioterapeuta
        try:
            fisio_actualizado = actualizar_estado_fisioterapeuta(
                db=db,
                cedula=datos.cedula,
                nuevo_estado="Activo"
            )
            print(f"Fisioterapeuta actualizado: {fisio_actualizado}")
        except Exception as e:
            print(f"Error actualizando fisioterapeuta: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al actualizar el estado: {str(e)}"
            )
        
        if not fisio_actualizado:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No se encontró fisioterapeuta con cédula {datos.cedula}"
            )
        
        print(f"🎉 Fisioterapeuta activado exitosamente")
        
        return {
            "success": True,
            "mensaje": "Fisioterapeuta activado correctamente",
            "fisioterapeuta": {
                "cedula": fisio_actualizado.cedula,
                "nombre": fisio_actualizado.nombre,
                "estado": fisio_actualizado.estado
            },
            "pago": {
                "id": pago['id'],
                "amount": pago['amount'],
                "currency": pago['currency']
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error inesperado: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al activar fisioterapeuta: {str(e)}"
        )

