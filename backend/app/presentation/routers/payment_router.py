# backend/app/presentation/routers/payment_router.py
from fastapi import APIRouter, HTTPException, status
from presentation.schemas.payment_schema import PaymentIntentCreate, PaymentIntentResponse
from logic.payment_service import crear_payment_intent, confirmar_pago
from config.stripe_config import get_stripe_publishable_key
from sqlalchemy.orm import Session
from fastapi import Depends
from data.db import get_db 
from logic.fisio_service import actualizar_estado_fisioterapeuta  


router = APIRouter(prefix="/payments", tags=["Pagos"])

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