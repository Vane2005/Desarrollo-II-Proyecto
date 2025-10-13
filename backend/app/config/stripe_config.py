# backend/app/config/stripe_config.py
import stripe
import os
from dotenv import load_dotenv

load_dotenv()

# Configurar Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_PUBLISHABLE_KEY = os.getenv("STRIPE_PUBLISHABLE_KEY")

def get_stripe_publishable_key():
    """Retorna la clave pública de Stripe"""
    return STRIPE_PUBLISHABLE_KEY