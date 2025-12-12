// frontend/assets/js/registro_paciente.js
const API_URL = 'http://localhost:8000';

// Función para mostrar mensajes
function mostrarMensaje(tipo, contenido) {
    const messageDiv = document.getElementById('message');

    messageDiv.className = tipo; // 'exito' o 'error'
    messageDiv.innerHTML = contenido;
    messageDiv.style.display = 'block';

    if (tipo === 'exito') {
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 7000);
    }
}

// Función para registrar paciente
async function registrarPaciente(datos) {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Token no encontrado. Inicie sesión nuevamente.");
        }

        const response = await fetch(`${API_URL}/paciente/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(datos)
        });

        const data = await response.json();

        // Si hay errores de validación (422)
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
        console.error('Error:', error);
        throw error;
    }
}

// 🔥 LISTENER ÚNICO (NO SE DUPLICA NUNCA)
document.getElementById('registroForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const fisioId = localStorage.getItem("cedula"); // 🚀 Cédula del Fisio

    if (!token) {
        mostrarMensaje('error', 'Debe iniciar sesión nuevamente. Token no encontrado.');
        return;
    }

    if (!fisioId) {
        mostrarMensaje('error', 'No se encontró la cédula del fisioterapeuta. Inicie sesión nuevamente.');
        return;
    }

    document.getElementById('message').style.display = 'none';

    // 📌 DATOS QUE SE ENVIAN AL BACKEND
    const datos = {
        cedula: document.getElementById('cedula').value.trim(),
        email: document.getElementById('email').value.trim(),
        nombre: document.getElementById('nombre').value.trim(),
        telefono: document.getElementById('telefono').value.trim(),
        historiaclinica: document.getElementById('historiaclinica').value.trim(),
        fisio_id: fisioId   // 🚀 AQUI SE ENVIA PARA LA TABLA TRATA
    };

    // Validar campos vacíos
    if (!datos.cedula || !datos.email || !datos.nombre || !datos.telefono) {
        mostrarMensaje('error', 'Todos los campos son obligatorios');
        return;
    }

        // Validar cédula: solo números y entre 6 y 20 dígitos
    if (!/^[0-9]+$/.test(datos.cedula)) {
        mostrarMensaje('error', 'La cédula debe contener solo números');
        return;
    }
    if (datos.cedula.length < 6 || datos.cedula.length > 20) {
        mostrarMensaje('error', 'La cédula debe tener entre 6 y 20 dígitos');
        return;
    }

    // Validar nombre: mínimo 2 caracteres
    if (datos.nombre.length < 2) {
        mostrarMensaje('error', 'El nombre debe tener al menos 2 caracteres');
        return;
    }

    // Validar email con expresión regular
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) {
        mostrarMensaje('error', 'El email no es válido');
        return;
    }

    // Validar teléfono: solo números y entre 7 y 15 dígitos
    if (!/^[0-9]+$/.test(datos.telefono)) {
        mostrarMensaje('error', 'El teléfono debe contener solo números');
        return;
    }
    if (datos.telefono.length < 7 || datos.telefono.length > 15) {
        mostrarMensaje('error', 'El teléfono debe tener entre 7 y 15 dígitos');
        return;
    }

    try {
        // Deshabilitar botón
        const btnSubmit = e.target.querySelector('button[type="submit"]');
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Registrando...';

        // Registrar en backend
        const resultado = await registrarPaciente(datos);

        mostrarMensaje('exito',
        `<strong>Registro exitoso</strong><br>
        Las credenciales han sido enviadas al correo del paciente.`
            );



        e.target.reset();

        setTimeout(() => {
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'Registrar';
        }, 2500);

    } catch (error) {
        mostrarMensaje('error', `
            <strong>Error en el registro</strong><br>
            ${error.message}
        `);

        const btnSubmit = e.target.querySelector('button[type="submit"]');
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Registrar';
    }
});

console.log('Script de registro de paciente cargado correctamente');
