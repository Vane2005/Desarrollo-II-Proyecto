# backend/app/logic/payment_service.py
import stripe
from typing import Dict, Any

def crear_payment_intent(amount: int, currency: str, customer_email: str, description: str = None) -> Dict[str, Any]:
    """
    Crea un PaymentIntent en Stripe
    
    Args:
        amount: Monto en centavos (ej: 5000 = $50.00)
        currency: Código de moneda (usd, eur, cop, etc.)
        customer_email: Email del cliente
        description: Descripción del pago
    
    Returns:
        Dict con el client_secret y otros datos
    """
    try:
        # Crear el PaymentIntent
        payment_intent = stripe.PaymentIntent.create(
            amount=amount,
            currency=currency,
            description=description or "Pago TerapiaFisica+",
            receipt_email=customer_email,
            metadata={
                'customer_email': customer_email,
                'description': description
            }
        )
        
        return {
            'id': payment_intent.id,
            'client_secret': payment_intent.client_secret,
            'amount': payment_intent.amount,
            'currency': payment_intent.currency,
            'status': payment_intent.status
        }
    
    except stripe.error.StripeError as e:
        raise Exception(f"Error de Stripe: {str(e)}")

def confirmar_pago(payment_intent_id: str) -> Dict[str, Any]:
    """Verifica el estado de un pago"""
    try:
        payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        return {
            'id': payment_intent.id,
            'status': payment_intent.status,
            'amount': payment_intent.amount,
            'currency': payment_intent.currency
        }
    except stripe.error.StripeError as e:
        raise Exception(f"Error al verificar pago: {str(e)}")

def crear_cliente_stripe(email: str, nombre: str) -> str:
    """Crea un cliente en Stripe y retorna su ID"""
    try:
        customer = stripe.Customer.create(
            email=email,
            name=nombre
        )
        return customer.id
    except stripe.error.StripeError as e:
        raise Exception(f"Error al crear cliente: {str(e)}")