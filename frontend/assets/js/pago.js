const API_URL = 'http://localhost:8000';

let stripe;
let elements;
let cardElement;

// Configuración de pago para Colombia
const PAYMENT_CONFIG = {
    amount: 19999900,  // $199,999 COP en centavos
    currency: 'cop', 
    displayAmount: '$199,999 COP'  
};

// Verificar si el usuario está logueado y es fisioterapeuta
function verificarUsuario() {
    const email = localStorage.getItem('email');
    const tipo = localStorage.getItem('tipo_usuario');
    const estado = localStorage.getItem('estado');
    
    if (!email || tipo !== 'fisio') {
        alert('⚠️ Debes estar registrado como fisioterapeuta para acceder a esta página');
        window.location.href = 'index.html';
        return false;
    }
    
    if (estado === 'activo') {
        alert('✅ Tu cuenta ya está activa');
        window.location.href = 'dashboard_fisio.html';
        return false;
    }
    
    return true;
}

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
    const userEmail = localStorage.getItem('email') || 'cliente@ejemplo.com';
    
    const response = await fetch(`${API_URL}/payments/create-payment-intent`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            amount: PAYMENT_CONFIG.amount,  
            currency: PAYMENT_CONFIG.currency,  
            description: 'Activación de cuenta TerapiaFisica+',
            customer_email: userEmail
        })
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al crear el intento de pago');
    }
    
    return await response.json();
}

// Función para activar la cuenta después del pago
async function activarCuenta(paymentIntentId) {
    const userEmail = localStorage.getItem('email');
    
    // Primero obtener la cédula del usuario desde el backend
    const token = localStorage.getItem('token');
    
    // Decodificar el payload del JWT para obtener info adicional
    // O hacer una petición al backend para obtener la cédula
    
    // Por simplicidad, asumimos que guardamos la cédula en el registro
    const cedula = localStorage.getItem('cedula');
    
    if (!cedula) {
        // Si no tenemos la cédula, la obtenemos del token o backend
        throw new Error('No se pudo obtener la cédula del usuario');
    }
    
    const response = await fetch(`${API_URL}/payments/confirm-payment`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            payment_intent_id: paymentIntentId,
            cedula: cedula
        })
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al activar la cuenta');
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
                    email: localStorage.getItem('email') || 'cliente@ejemplo.com'
                }
            }
        });
        
        if (error) {
            // Mostrar error
            mostrarMensaje('error', `Error: ${error.message}`);
        } else if (paymentIntent.status === 'succeeded') {
            console.log('✅ Pago exitoso, activando cuenta...');
            
            // Activar la cuenta en el backend
            try {
                const resultado = await activarCuenta(paymentIntent.id);
                
                console.log('Cuenta activada:', resultado);
                
                // Actualizar el estado en localStorage
                localStorage.setItem('estado', 'activo');
                
                // Mostrar mensaje de éxito
                mostrarMensaje('exito', `¡Pago exitoso y cuenta activada! Redirigiendo al dashboard...`);
                
                // Redirigir al dashboard después de 2 segundos
                setTimeout(() => {
                    window.location.href = 'dashboard_fisio.html';
                }, 2000);
                
            } catch (activationError) {
                console.error('Error al activar cuenta:', activationError);
                mostrarMensaje('error', `Pago exitoso pero error al activar cuenta: ${activationError.message}. Por favor contacta a soporte.`);
            }
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
    // Verificar usuario antes de cargar Stripe
    if (!verificarUsuario()) {
        return;
    }
    
    inicializarStripe();
    
    // Actualizar el texto del botón con el monto correcto
    const submitButton = document.getElementById('submit-button');
    submitButton.textContent = `Pagar ${PAYMENT_CONFIG.displayAmount}`;
    
    // Manejar el formulario
    document.getElementById('payment-form').addEventListener('submit', procesarPago);
});

console.log('Script de pago cargado correctamente');