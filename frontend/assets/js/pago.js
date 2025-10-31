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
            description: 'Suscripción TerapiaFisica+',
            customer_email: userEmail
        })
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al crear el intento de pago');
    }
    
    return await response.json();
}


async function procesarPago(event) {
    event.preventDefault();
    
    const submitButton = document.getElementById('submit-button');
    const spinner = document.getElementById('spinner');
    
    // Obtener la cédula del fisioterapeuta (guardada en registro)
    const cedulaFisio = localStorage.getItem('cedula_pendiente');
    
    console.log(' Cédula recuperada del localStorage:', cedulaFisio);
    
    if (!cedulaFisio) {
        mostrarMensaje('error', 'Error: No se encontró la información del fisioterapeuta. Por favor, regístrese nuevamente.');
        return;
    }
    
    // Deshabilitar botón y mostrar spinner
    submitButton.disabled = true;
    submitButton.textContent = 'Procesando...';
    spinner.style.display = 'block';
    
    try {
        console.log('💳 Paso 1: Creando PaymentIntent...');
        
        // 1. Crear el PaymentIntent
        const { client_secret } = await crearPaymentIntent();
        
        console.log('✅ PaymentIntent creado');
        console.log('💳 Paso 2: Confirmando pago con Stripe...');
        
        // 2. Confirmar el pago con Stripe
        const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
            payment_method: {
                card: cardElement,
                billing_details: {
                    email: localStorage.getItem('userEmail') || 'cliente@ejemplo.com'
                }
            }
        });
        
        if (error) {
            console.error('❌ Error en el pago:', error);
            mostrarMensaje('error', `Error: ${error.message}`);
            return;
        } 
        
        console.log('✅ Pago confirmado por Stripe');
        console.log('   Payment Intent ID:', paymentIntent.id);
        console.log('   Status:', paymentIntent.status);
        
        if (paymentIntent.status === 'succeeded') {
            console.log('🔄 Paso 3: Activando cuenta del fisioterapeuta...');
            
            // 3. Activar el fisioterapeuta
            try {
                const activacionResponse = await fetch(`${API_URL}/payments/activate-fisioterapeuta`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        payment_intent_id: paymentIntent.id,
                        cedula: cedulaFisio
                    })
                });
                
                console.log('📡 Respuesta del servidor:', activacionResponse.status);
                
                // Leer la respuesta como texto primero para debugging
                const responseText = await activacionResponse.text();
                console.log('📄 Respuesta cruda:', responseText);
                
                let activacionData;
                try {
                    activacionData = JSON.parse(responseText);
                } catch (e) {
                    console.error('❌ Error parseando JSON:', e);
                    throw new Error('Respuesta inválida del servidor');
                }
                
                if (!activacionResponse.ok) {
                    console.error('❌ Error en activación:', activacionData);
                    throw new Error(activacionData.detail || 'Error al activar cuenta');
                }
                
                console.log('✅ Cuenta activada exitosamente:', activacionData);
                
                // Pago exitoso y cuenta activada
                mostrarMensaje('exito', `
                    ✅ ¡Pago de ${PAYMENT_CONFIG.displayAmount} exitoso!
                    Tu cuenta ha sido activada.
                    Redirigiendo al inicio de sesión...
                `);
                
                // Guardar info del pago
                localStorage.setItem('payment_status', 'completed');
                localStorage.setItem('payment_id', paymentIntent.id);
                localStorage.setItem('fisio_estado', 'Activo');
                
                // Limpiar datos temporales
                localStorage.removeItem('cedula_pendiente');
                localStorage.removeItem('userEmail');
                
                // Redirigir al login después de 3 segundos
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 3000);
                
            } catch (activacionError) {
                console.error('❌ Error al activar cuenta:', activacionError);
                console.error('   Mensaje:', activacionError.message);
                
                // El pago fue exitoso pero hubo error en la activación
                mostrarMensaje('error', `
                    ⚠️ Pago procesado correctamente
                    Sin embargo, hubo un problema al activar tu cuenta
                    Error: ${activacionError.message}
                    
                    Por favor, contacta a soporte con este ID de pago: ${paymentIntent.id}
                    Tu cuenta será activada manualmente.
                `);
                
                // Guardar info para soporte
                localStorage.setItem('payment_id_pending_activation', paymentIntent.id);
                localStorage.setItem('cedula_pending_activation', cedulaFisio);
            }
        }
        
    } catch (error) {
        console.error('❌ Error general:', error);
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