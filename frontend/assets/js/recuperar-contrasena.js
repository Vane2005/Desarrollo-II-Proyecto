/**
 * ======================================================
 * SISTEMA DE RECUPERACIÓN DE CONTRASEÑA
 * ======================================================
 *
 * Este script permite a los usuarios recuperar su contraseña
 * de manera segura mediante correo electrónico. Incluye:
 *
 *  - Validación de correo electrónico en tiempo real
 *  - Confirmación de correos coincidentes
 *  - Envío seguro de solicitud al backend
 *  - Mensajes visuales de éxito o error
 *  - Redirección automática al inicio de sesión
 */

// ======================================================
// CONFIGURACIÓN GLOBAL
// ======================================================

/**
 * URL base del backend.
 * @constant {string}
 */
const API_URL = 'http://localhost:8000';


// ======================================================
// FUNCIÓN: mostrarMensaje
// ======================================================

/**
 * Muestra un mensaje en pantalla dentro del elemento con ID `mensaje`.
 *
 * - Aplica estilos visuales según el tipo de mensaje.
 * - En caso de éxito, oculta el mensaje automáticamente tras 10 segundos.
 *
 * @function mostrarMensaje
 * @param {'exito'|'error'} tipo - Tipo de mensaje (éxito o error).
 * @param {string} contenido - Contenido HTML o texto a mostrar.
 */
function mostrarMensaje(tipo, contenido) {
    const messageDiv = document.getElementById('mensaje');
    messageDiv.className = `mensaje ${tipo}`;
    messageDiv.innerHTML = contenido;
    messageDiv.style.display = 'block';

    if (tipo === 'exito') {
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 10000);
    }
}


// ======================================================
// FUNCIÓN: esEmailValido
// ======================================================

/**
 * Verifica si una cadena de texto tiene el formato de un correo electrónico válido.
 *
 * @function esEmailValido
 * @param {string} email - Correo electrónico a validar.
 * @returns {boolean} `true` si el formato es válido, `false` en caso contrario.
 * @example
 * esEmailValido("usuario@dominio.com"); // true
 */
function esEmailValido(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}


// ======================================================
// VALIDACIÓN EN TIEMPO REAL
// ======================================================

/**
 * Escucha cambios en el campo "confirmarCorreo" para validar
 * que coincida con el correo principal en tiempo real.
 */
document.getElementById('confirmarCorreo')?.addEventListener('input', function() {
    const correo = document.getElementById('correo').value;
    const confirmar = this.value;

    if (confirmar && correo !== confirmar) {
        this.setCustomValidity('Los correos no coinciden');
        this.style.borderColor = '#ff4444';
    } else {
        this.setCustomValidity('');
        this.style.borderColor = '';
    }
});


/**
 * Escucha cambios en el campo "correo" y valida el formato de email.
 * Además, fuerza la revalidación del campo de confirmación si ya tiene valor.
 */
document.getElementById('correo')?.addEventListener('input', function() {
    const confirmar = document.getElementById('confirmarCorreo');

    if (this.value && !esEmailValido(this.value)) {
        this.style.borderColor = '#ff4444';
    } else {
        this.style.borderColor = '';
    }

    if (confirmar.value) {
        confirmar.dispatchEvent(new Event('input'));
    }
});


// ======================================================
// FUNCIÓN PRINCIPAL: Recuperar Contraseña
// ======================================================

/**
 * Maneja el proceso completo de recuperación de contraseña:
 *
 * 1. Valida los correos y su formato.
 * 2. Envía una solicitud POST al backend.
 * 3. Muestra mensajes de éxito o error.
 * 4. Redirige al inicio de sesión tras un éxito.
 *
 * @async
 * @event submit
 * @param {SubmitEvent} e - Evento del formulario.
 * @listens document#recuperarForm.submit
 */
document.getElementById('recuperarForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    document.getElementById('mensaje').style.display = 'none';

    const correo = document.getElementById('correo').value.trim();
    const confirmarCorreo = document.getElementById('confirmarCorreo').value.trim();

    // Validaciones previas
    if (!esEmailValido(correo)) {
        mostrarMensaje('error', 'Por favor ingresa un correo electrónico válido');
        document.getElementById('correo').focus();
        return;
    }

    if (correo !== confirmarCorreo) {
        mostrarMensaje('error', 'Los correos electrónicos no coinciden');
        document.getElementById('confirmarCorreo').focus();
        return;
    }

    const btnRecuperar = document.getElementById('btnRecuperar');
    const textoOriginal = btnRecuperar.textContent;
    btnRecuperar.disabled = true;
    btnRecuperar.textContent = 'Procesando...';

    try {
        const response = await fetch(`${API_URL}/auth/recuperar-contrasena`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: correo })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Error al recuperar contraseña');
        }

        mostrarMensaje('exito', `
            <strong>¡Contraseña enviada!</strong><br>
            ${data.mensaje}<br><br>
            <strong>Revisa tu bandeja de entrada y spam</strong><br>
            Correo: <strong>${correo}</strong>
        `);

        document.getElementById('recuperarForm').reset();

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 5000);

    } catch (error) {
        console.error('Error:', error);
        let mensajeError = error.message;

        if (mensajeError.includes('Failed to fetch')) {
            mensajeError = 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.';
        } else if (mensajeError.includes('No existe una cuenta')) {
            mensajeError = 'No existe una cuenta registrada con ese correo electrónico.';
        }

        mostrarMensaje('error', `
            <strong>Error</strong><br>
            ${mensajeError}
        `);

    } finally {
        btnRecuperar.disabled = false;
        btnRecuperar.textContent = textoOriginal;
    }
});


// ======================================================
// MENSAJE DE CONFIRMACIÓN DE CARGA
// ======================================================

/**
 * Mensaje en consola que confirma la carga exitosa del script.
 */
console.log('Script de recuperar contraseña cargado correctamente');
