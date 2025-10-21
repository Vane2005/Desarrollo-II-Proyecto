// frontend/assets/js/pago.js
const API_URL = 'http://localhost:8000';

let stripe;
let elements;
let cardElement;

// Configuración de pago para Colombia
const PAYMENT_CONFIG = {
    amount: 19999900,  // $15,999 COP en centavos (15999 * 100)  
    currency: 'cop', 
    displayAmount: '$199,999 COP'  
};

// Inicializar Stripe
async function inicializarStripe() {
    try {
        // Obtener la clave pública de Stripe desde el backend
        const response = await fetch(`${API_URL}/payments/config`);
        const { publishable_key } = await response.json();
        
        // Inicializar Stripe
        stripe = Stripe(publishable_key);
        elements = stripe.elements();
        
        // Crear el elemento de tarjeta
        cardElement = elements.create('card', {
            style: {
                base: {
                    fontSize: '16px',
                    color: '#32325d',
                    fontFamily: 'Arial, sans-serif',
                    '::placeholder': {
                        color: '#aab7c4'
                    }
                },
                invalid: {
                    color: '#fa755a',
                    iconColor: '#fa755a'
                }
            }
        });
        
        // Montar el elemento en el DOM
        cardElement.mount('#card-element');
        
        // Escuchar cambios en la tarjeta
        cardElement.on('change', function(event) {
            const displayError = document.getElementById('card-errors');
            if (event.error) {
                displayError.textContent = event.error.message;
            } else {
                displayError.textContent = '';
            }
        });
        
    } catch (error) {
        console.error('Error al inicializar Stripe:', error);
        mostrarMensaje('error', 'Error al cargar el sistema de pagos');
    }
}

// Función para crear el PaymentIntent
async function crearPaymentIntent() {
    // Obtener email del usuario (del localStorage o sessionStorage)
    const userEmail = localStorage.getItem('userEmail') || 'cliente@ejemplo.com';
    
    const response = await fetch(`${API_URL}/payments/create-payment-intent`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            amount: PAYMENT_CONFIG.amount,  
            currency: PAYMENT_CONFIG.currency,  
            description: 'Suscripción mensual TerapiaFisica+',
            customer_email: userEmail
        })
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al crear el intento de pago');
    }
    
    return await response.json();
}

// Función para procesar el pago
async function procesarPago(event) {
    event.preventDefault();
    
    const submitButton = document.getElementById('submit-button');
    const spinner = document.getElementById('spinner');
    
    // Deshabilitar botón y mostrar spinner
    submitButton.disabled = true;
    submitButton.textContent = 'Procesando...';
    spinner.style.display = 'block';
    
    try {
        // Crear el PaymentIntent
        const { client_secret } = await crearPaymentIntent();
        
        // Confirmar el pago con Stripe
        const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
            payment_method: {
                card: cardElement,
                billing_details: {
                    email: localStorage.getItem('userEmail') || 'cliente@ejemplo.com'
                }
            }
        });
        
        if (error) {
            // Mostrar error
            mostrarMensaje('error', `Error: ${error.message}`);
        } else if (paymentIntent.status === 'succeeded') {
            // Pago exitoso
            mostrarMensaje('exito', `¡Pago de ${PAYMENT_CONFIG.displayAmount} exitoso! Redirigiendo...`);  // 👈 Cambio
            
            // Guardar info del pago (opcional)
            localStorage.setItem('payment_status', 'completed');
            localStorage.setItem('payment_id', paymentIntent.id);
            localStorage.setItem('payment_amount', PAYMENT_CONFIG.displayAmount);
            
            // Redirigir al dashboard después de 2 segundos
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
        
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('error', `Error al procesar el pago: ${error.message}`);
    } finally {
        // Rehabilitar botón y ocultar spinner
        submitButton.disabled = false;
        submitButton.textContent = `Pagar ${PAYMENT_CONFIG.displayAmount}`;
        spinner.style.display = 'none';
    }
}

// Función para mostrar mensajes
function mostrarMensaje(tipo, contenido) {
    const mensajeDiv = document.getElementById('mensaje');
    mensajeDiv.className = `mensaje ${tipo}`;
    mensajeDiv.textContent = contenido;
    mensajeDiv.style.display = 'block';
}

// Inicializar cuando cargue la página
document.addEventListener('DOMContentLoaded', function() {
    inicializarStripe();
    
    // Actualizar el texto del botón con el monto correcto
    const submitButton = document.getElementById('submit-button');
    submitButton.textContent = `Pagar ${PAYMENT_CONFIG.displayAmount}`;
    
    // Manejar el formulario
    document.getElementById('payment-form').addEventListener('submit', procesarPago);
});

console.log('✅ Script de pago cargado correctamente');