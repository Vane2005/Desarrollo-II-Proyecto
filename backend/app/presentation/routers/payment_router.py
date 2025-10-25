from fastapi import APIRouter, HTTPException, status, Depends
from app.presentation.schemas.payment_schema import PaymentIntentCreate, PaymentIntentResponse, PaymentConfirmRequest
from app.logic.payment_service import crear_payment_intent, confirmar_pago
from app.config.stripe_config import get_stripe_publishable_key
from sqlalchemy.orm import Session
from app.data.db import get_db 
from app.logic.fisio_service import actualizar_estado_fisioterapeuta


router = APIRouter(prefix="/payments", tags=["Pagos"])

@router.post("/create-payment-intent", response_model=PaymentIntentResponse)
def create_payment_intent(datos: PaymentIntentCreate):
    """
    Crea un PaymentIntent de Stripe para procesar un pago
    """
    try:
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

@router.post("/confirm-payment")
def confirm_payment_and_activate(datos: PaymentConfirmRequest, db: Session = Depends(get_db)):
    """
    Confirma el pago y activa al usuario fisioterapeuta
    """
    try:
        # Verificar el pago en Stripe
        pago = confirmar_pago(datos.payment_intent_id)
        
        if pago['status'] != 'succeeded':
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El pago no fue exitoso"
            )
        
        # Activar al fisioterapeuta
        fisio = actualizar_estado_fisioterapeuta(db, datos.cedula, "activo")
        
        if not fisio:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Fisioterapeuta no encontrado"
            )
        
        return {
            "success": True,
            "mensaje": "Pago confirmado y usuario activado",
            "usuario": {
                "cedula": fisio.cedula,
                "nombre": fisio.nombre,
                "estado": fisio.estado
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al confirmar pago: {str(e)}"
        )

@router.get("/config")
def get_stripe_config():
    """
    Retorna la clave pública de Stripe para el frontend
    """
    return {
        "publishable_key": get_stripe_publishable_key()
    }