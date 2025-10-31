/**
 * ======================================================
 * SISTEMA DE REGISTRO DE PACIENTES
 * ======================================================
 *
 * Este módulo gestiona el registro de pacientes en el sistema,
 * validando datos, comunicándose con el backend y mostrando mensajes
 * dinámicos de éxito o error al usuario.
 *
 * Incluye:
 *  - Validación de formulario
 *  - Envío de datos al backend (`/paciente/register`)
 *  - Manejo de errores HTTP y de validación (422)
 *  - Retroalimentación visual al usuario
 */

// ======================================================
// CONFIGURACIÓN GLOBAL
// ======================================================

/**
 * URL base del backend para las peticiones.
 * @constant {string}
 */
const API_URL = 'http://localhost:8000';


// ======================================================
// FUNCIÓN: mostrarMensaje
// ======================================================

/**
 * Muestra un mensaje de estado en el elemento con ID `message`.
 *
 * - Aplica clases CSS para diferenciar entre éxito y error.
 * - En caso de éxito, oculta automáticamente el mensaje tras 5 segundos.
 *
 * @function mostrarMensaje
 * @param {'exito'|'error'} tipo - Tipo de mensaje a mostrar.
 * @param {string} contenido - Texto o HTML del mensaje a desplegar.
 * @example
 * mostrarMensaje('exito', 'Registro completado con éxito');
 */
function mostrarMensaje(tipo, contenido) {
    const messageDiv = document.getElementById('message');
    messageDiv.className = tipo;
    messageDiv.innerHTML = contenido;
    messageDiv.style.display = 'block';

    if (tipo === 'exito') {
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}


// ======================================================
// FUNCIÓN: registrarPaciente
// ======================================================

/**
 * Envía los datos del paciente al backend para su registro.
 *
 * Maneja errores comunes, incluyendo errores de validación (422)
 * y errores de conexión o respuesta inesperada.
 *
 * @async
 * @function registrarPaciente
 * @param {Object} datos - Información del paciente.
 * @param {string} datos.cedula - Cédula del paciente.
 * @param {string} datos.email - Correo electrónico.
 * @param {string} datos.nombre - Nombre completo.
 * @param {string} datos.telefono - Número telefónico.
 * @returns {Promise<Object>} Respuesta del servidor con los datos del registro.
 * @throws {Error} Si ocurre un error de conexión o validación.
 * @example
 * const paciente = { cedula: '12345', email: 'test@mail.com', nombre: 'Ana López', telefono: '3000000000' };
 * const resultado = await registrarPaciente(paciente);
 * console.log(resultado.mensaje);
 */
async function registrarPaciente(datos) {
    try {
        console.log('📨 Enviando datos:', datos);

        const response = await fetch(`${API_URL}/paciente/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        const data = await response.json();

        // Errores de validación (422)
        if (!response.ok) {
            if (response.status === 422 && data.detail) {
                const errores = data.detail.map(error => {
                    const campo = error.loc[error.loc.length - 1];
                    let mensaje = error.msg;

                    if (mensaje.includes('valid email')) mensaje = 'debe ser un email válido';
                    else if (mensaje.includes('missing')) mensaje = 'es obligatorio';
                    else if (mensaje.includes('only numbers')) mensaje = 'debe contener solo números';
                    else if (mensaje.includes('at least')) {
                        const num = mensaje.match(/\d+/)?.[0];
                        mensaje = `debe tener al menos ${num} caracteres`;
                    }

                    return `<strong>${campo}</strong>: ${mensaje}`;
                });

                throw new Error(errores.join('<br>'));
            }

            throw new Error(data.detail || 'Error al registrar paciente');
        }

        return data;

    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    }
}


// ======================================================
// EVENTO: Envío del formulario de registro
// ======================================================

/**
 * Controlador del evento de envío del formulario de registro.
 *
 * - Valida los campos requeridos.
 * - Deshabilita el botón mientras se procesa la solicitud.
 * - Llama a `registrarPaciente()` y muestra los resultados.
 * - Rehabilita el botón después del proceso.
 *
 * @event submit
 * @listens document#registroForm.submit
 */
document.getElementById('registroForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    document.getElementById('message').style.display = 'none';

    // Obtener los valores del formulario
    const datos = {
        cedula: document.getElementById('cedula').value.trim(),
        email: document.getElementById('email').value.trim(),
        nombre: document.getElementById('nombre').value.trim(),
        telefono: document.getElementById('telefono').value.trim()
    };

    // Validar campos vacíos
    if (!datos.cedula || !datos.email || !datos.nombre || !datos.telefono) {
        mostrarMensaje('error', 'Todos los campos son obligatorios');
        return;
    }

    try {
        // Deshabilitar botón mientras se procesa
        const btnSubmit = e.target.querySelector('button[type="submit"]');
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Registrando...';

        const resultado = await registrarPaciente(datos);

        mostrarMensaje('exito', `
            <strong>✅ Registro exitoso</strong><br>
            ${resultado.mensaje}<br><br>
            <strong>Correo:</strong> ${resultado.credenciales.correo}<br>
            <strong>Contraseña generada:</strong> ${resultado.credenciales.contrasena}
        `);

        // Limpiar formulario
        e.target.reset();

        // Rehabilitar botón tras unos segundos
        setTimeout(() => {
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'Registrar';
        }, 2500);

    } catch (error) {
        mostrarMensaje('error', `
            <strong>❌ Error en el registro</strong><br>
            ${error.message}
        `);

        const btnSubmit = e.target.querySelector('button[type="submit"]');
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Registrar';
    }
});


// ======================================================
// CONFIRMACIÓN DE CARGA
// ======================================================

/**
 * Muestra en consola la confirmación de carga del script.
 * @constant
 */
console.log('✅ Script de registro de paciente cargado correctamente');
