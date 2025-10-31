/**
 * ======================================================
 * SISTEMA DE PAGOS STRIPE PARA FISIOTERAPEUTAS - COLOMBIA
 * ======================================================
 * 
 * Este módulo maneja el proceso completo de pago para la activación
 * de cuentas de fisioterapeutas mediante Stripe. Incluye:
 * 
 *  - Inicialización de Stripe y creación del elemento de tarjeta
 *  - Creación de PaymentIntent en el backend
 *  - Confirmación del pago con Stripe
 *  - Activación automática de la cuenta del fisioterapeuta tras un pago exitoso
 *  - Manejo de errores y mensajes en la interfaz
 */

// ======================================================
// 🔧 CONFIGURACIÓN GLOBAL
// ======================================================

/**
 * URL base del backend del sistema.
 * @constant {string}
 */
const API_URL = 'http://localhost:8000';

/**
 * Instancia principal de Stripe (inicializada dinámicamente).
 * @type {Stripe}
 */
let stripe;

/**
 * Elementos de Stripe (inputs de pago).
 * @type {stripe.elements.Elements}
 */
let elements;

/**
 * Elemento de tarjeta de crédito de Stripe.
 * @type {stripe.elements.Element}
 */
let cardElement;

/**
 * Configuración del monto y moneda del pago.
 * @constant
 * @type {Object}
 * @property {number} amount - Monto total en centavos de peso colombiano.
 * @property {string} currency - Código ISO de la moneda (COP).
 * @property {string} displayAmount - Monto mostrado en pantalla.
 */
const PAYMENT_CONFIG = {
    amount: 19999900,  // $199,999 COP en centavos
    currency: 'cop',
    displayAmount: '$199,999 COP'
};


// ======================================================
// ⚙️ INICIALIZACIÓN DE STRIPE
// ======================================================

/**
 * Inicializa Stripe y el elemento de tarjeta de crédito en el DOM.
 * 
 * - Obtiene la clave pública desde el backend.
 * - Configura el campo de tarjeta con estilos personalizados.
 * - Escucha los errores del input y los muestra dinámicamente.
 * 
 * @async
 * @function inicializarStripe
 * @throws {Error} Si no se puede conectar con el backend o inicializar Stripe.
 */
async function inicializarStripe() {
    try {
        const response = await fetch(`${API_URL}/payments/config`);
        const { publishable_key } = await response.json();

        stripe = Stripe(publishable_key);
        elements = stripe.elements();

        // Crear el elemento de tarjeta
        cardElement = elements.create('card', {
            style: {
                base: {
                    fontSize: '16px',
                    color: '#32325d',
                    fontFamily: 'Arial, sans-serif',
                    '::placeholder': { color: '#aab7c4' }
                },
                invalid: {
                    color: '#fa755a',
                    iconColor: '#fa755a'
                }
            }
        });

        // Montar en el DOM
        cardElement.mount('#card-element');

        // Escuchar errores en tiempo real
        cardElement.on('change', (event) => {
            const displayError = document.getElementById('card-errors');
            displayError.textContent = event.error ? event.error.message : '';
        });

    } catch (error) {
        console.error('Error al inicializar Stripe:', error);
        mostrarMensaje('error', 'Error al cargar el sistema de pagos');
    }
}


// ======================================================
// CREACIÓN DEL PAYMENT INTENT
// ======================================================

/**
 * Crea un `PaymentIntent` en el backend para iniciar el proceso de pago.
 * 
 * @async
 * @function crearPaymentIntent
 * @returns {Promise<Object>} Objeto con la información del PaymentIntent (`client_secret`).
 * @throws {Error} Si la solicitud al backend falla o devuelve error.
 */
async function crearPaymentIntent() {
    const userEmail = localStorage.getItem('userEmail') || 'cliente@ejemplo.com';

    const response = await fetch(`${API_URL}/payments/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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


// ======================================================
// PROCESAMIENTO DEL PAGO
// ======================================================

/**
 * Procesa el flujo completo de pago:
 * 
 * 1. Crea un PaymentIntent en el backend.
 * 2. Confirma el pago con Stripe usando la tarjeta del usuario.
 * 3. Activa la cuenta del fisioterapeuta si el pago fue exitoso.
 * 
 * @async
 * @function procesarPago
 * @param {Event} event - Evento de envío del formulario.
 */
async function procesarPago(event) {
    event.preventDefault();

    const submitButton = document.getElementById('submit-button');
    const spinner = document.getElementById('spinner');
    const cedulaFisio = localStorage.getItem('cedula_pendiente');

    console.log('🧍 Cédula recuperada del localStorage:', cedulaFisio);

    if (!cedulaFisio) {
        mostrarMensaje('error', 'Error: No se encontró la información del fisioterapeuta. Por favor, regístrese nuevamente.');
        return;
    }

    // Bloquear botón mientras se procesa
    submitButton.disabled = true;
    submitButton.textContent = 'Procesando...';
    spinner.style.display = 'block';

    try {
        console.log('💳 Paso 1: Creando PaymentIntent...');
        const { client_secret } = await crearPaymentIntent();
        console.log('✅ PaymentIntent creado');

        console.log('💳 Paso 2: Confirmando pago con Stripe...');
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

        console.log('✅ Pago confirmado:', paymentIntent);

        if (paymentIntent.status === 'succeeded') {
            console.log('🔄 Activando cuenta del fisioterapeuta...');

            try {
                const activacionResponse = await fetch(`${API_URL}/payments/activate-fisioterapeuta`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        payment_intent_id: paymentIntent.id,
                        cedula: cedulaFisio
                    })
                });

                const responseText = await activacionResponse.text();
                let activacionData;

                try {
                    activacionData = JSON.parse(responseText);
                } catch {
                    throw new Error('Respuesta inválida del servidor');
                }

                if (!activacionResponse.ok) {
                    throw new Error(activacionData.detail || 'Error al activar cuenta');
                }

                console.log('✅ Cuenta activada exitosamente:', activacionData);

                mostrarMensaje('exito', `
                    ✅ ¡Pago de ${PAYMENT_CONFIG.displayAmount} exitoso!
                    Tu cuenta ha sido activada. Redirigiendo al inicio de sesión...
                `);

                localStorage.setItem('payment_status', 'completed');
                localStorage.setItem('payment_id', paymentIntent.id);
                localStorage.setItem('fisio_estado', 'Activo');

                localStorage.removeItem('cedula_pendiente');
                localStorage.removeItem('userEmail');

                setTimeout(() => window.location.href = 'index.html', 3000);

            } catch (activacionError) {
                console.error('❌ Error al activar cuenta:', activacionError);

                mostrarMensaje('error', `
                    ⚠️ Pago procesado correctamente, pero hubo un problema al activar tu cuenta.
                    Error: ${activacionError.message}
                    Por favor, contacta a soporte con este ID: ${paymentIntent.id}
                `);

                localStorage.setItem('payment_id_pending_activation', paymentIntent.id);
                localStorage.setItem('cedula_pending_activation', cedulaFisio);
            }
        }

    } catch (error) {
        console.error('❌ Error general:', error);
        mostrarMensaje('error', `Error al procesar el pago: ${error.message}`);
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = `Pagar ${PAYMENT_CONFIG.displayAmount}`;
        spinner.style.display = 'none';
    }
}


// ======================================================
// MENSAJES DE INTERFAZ
// ======================================================

/**
 * Muestra mensajes visuales en pantalla (éxito o error).
 * 
 * @function mostrarMensaje
 * @param {'exito'|'error'} tipo - Tipo de mensaje.
 * @param {string} contenido - Texto del mensaje a mostrar.
 */
function mostrarMensaje(tipo, contenido) {
    const mensajeDiv = document.getElementById('mensaje');
    mensajeDiv.className = `mensaje ${tipo}`;
    mensajeDiv.textContent = contenido;
    mensajeDiv.style.display = 'block';
}


// ======================================================
// INICIALIZACIÓN AUTOMÁTICA
// ======================================================

/**
 * Configura el entorno de pago al cargar la página.
 * 
 * - Inicializa Stripe.
 * - Configura el botón con el monto correcto.
 * - Asocia el evento del formulario.
 */
document.addEventListener('DOMContentLoaded', () => {
    inicializarStripe();

    const submitButton = document.getElementById('submit-button');
    submitButton.textContent = `Pagar ${PAYMENT_CONFIG.displayAmount}`;

    document.getElementById('payment-form').addEventListener('submit', procesarPago);
});

console.log('✅ Script de pago cargado correctamente');
