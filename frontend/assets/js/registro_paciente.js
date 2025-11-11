// frontend/assets/js/registro_paciente.js
const API_URL = 'http://localhost:8000';

// Función para mostrar mensajes
function mostrarMensaje(tipo, contenido) {
    const messageDiv = document.getElementById('message');
    messageDiv.className = tipo; // 'exito' o 'error'
    messageDiv.innerHTML = contenido;
    messageDiv.style.display = 'block';
    
    // Auto-ocultar después de 5 segundos si es éxito
    if (tipo === 'exito') {
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}

// Función para registrar paciente
async function registrarPaciente(datos) {
    try {
        console.log(' Enviando datos:', datos);
        
        const response = await fetch(`${API_URL}/paciente/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datos)
        });

        const data = await response.json();

        if (!response.ok) {
            // Si es error 422 (validación), procesar los errores
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
        console.error(' Error:', error);
        throw error;
    }
}

// Manejar el formulario
document.getElementById('registroForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    document.getElementById('message').style.display = 'none';
    
    // Obtener valores
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
            <strong> Registro exitoso</strong><br>
            ${resultado.mensaje}<br>
            <br>
            <strong>Correo:</strong> ${resultado.credenciales.correo}<br>
            <strong>Contraseña generada:</strong> ${resultado.credenciales.contrasena}
        `);

        // Limpiar formulario
        e.target.reset();

        // Rehabilitar botón
        setTimeout(() => {
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'Registrar';
        }, 2500);
        
    } catch (error) {
        mostrarMensaje('error', `
            <strong> Error en el registro</strong><br>
            ${error.message}
        `);

        // Rehabilitar botón
        const btnSubmit = e.target.querySelector('button[type="submit"]');
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Registrar';
    }
});

console.log(' Script de registro de paciente cargado correctamente');
