// frontend/assets/js/registro.js
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

// Validar contraseñas en tiempo real
document.getElementById('confirmarContrasena')?.addEventListener('input', function() {
    const contrasena = document.getElementById('contrasena').value;
    const confirmar = this.value;
    
    if (confirmar && contrasena !== confirmar) {
        this.setCustomValidity('Las contraseñas no coinciden');
        this.style.borderColor = '#ff4444';
    } else {
        this.setCustomValidity('');
        this.style.borderColor = '';
    }
});

// También validar cuando se cambia la contraseña original
document.getElementById('contrasena')?.addEventListener('input', function() {
    const confirmar = document.getElementById('confirmarContrasena');
    if (confirmar.value) {
        confirmar.dispatchEvent(new Event('input'));
    }
});

// Función para registrar fisioterapeuta
async function registrarFisioterapeuta(datos) {
    try {
        console.log('📤 Enviando datos:', datos);
        
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datos)
        });

        const data = await response.json();

        if (!response.ok) {
            // Si es error 422, procesar los errores de validación
            if (response.status === 422 && data.detail) {
                const errores = [];
                
                data.detail.forEach(error => {
                    const campo = error.loc[error.loc.length - 1];
                    let mensaje = error.msg;
                    
                    // Traducir mensajes comunes
                    if (mensaje.includes('at least')) {
                        const minLength = mensaje.match(/\d+/)?.[0];
                        mensaje = `debe tener al menos ${minLength} caracteres`;
                    } else if (mensaje.includes('valid email')) {
                        mensaje = 'debe ser un email válido';
                    } else if (mensaje.includes('missing')) {
                        mensaje = 'es obligatorio';
                    } else if (mensaje.includes('only numbers') || mensaje.includes('solo números')) {
                        mensaje = 'debe contener solo números';
                    }
                    
                    errores.push(`<strong>${campo}</strong>: ${mensaje}`);
                });
                
                throw new Error(errores.join('<br>'));
            }
            
            // Otros errores (400, 500, etc.)
            throw new Error(data.detail || 'Error al registrar usuario');
        }

        return data;
        
    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    }
}

// Manejar el formulario
document.getElementById('registroForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Limpiar mensaje anterior
    document.getElementById('message').style.display = 'none';
    
    // Obtener valores
    const contrasena = document.getElementById('contrasena').value;
    const confirmarContrasena = document.getElementById('confirmarContrasena').value;
    
    // Validar que las contraseñas coincidan
    if (contrasena !== confirmarContrasena) {
        mostrarMensaje('error', '❌ Las contraseñas no coinciden');
        document.getElementById('confirmarContrasena').focus();
        return;
    }
    
    // Preparar datos para enviar
    const datos = {
        cedula: document.getElementById('cedula').value.trim(),
        email: document.getElementById('email').value.trim(),
        nombre: document.getElementById('nombre').value.trim(),
        contrasena: contrasena,
        telefono: document.getElementById('telefono').value.trim()
    };

    // Validar que no haya campos vacíos
    if (!datos.cedula || !datos.email || !datos.nombre || !datos.contrasena || !datos.telefono) {
        mostrarMensaje('error', '❌ Todos los campos son obligatorios');
        return;
    }

    try {
        // Deshabilitar botón mientras se procesa
        const btnSubmit = e.target.querySelector('button[type="submit"]');
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Registrando...';
        
        const resultado = await registrarFisioterapeuta(datos);

        // Guardar el email y nombre para usarlo en el pago
        localStorage.setItem('userEmail', datos.email);
        localStorage.setItem('userName', datos.nombre);

        mostrarMensaje('exito', `
            <strong>✅ Registro exitoso</strong><br>
            ${resultado.mensaje}<br>
            Redirigiendo al pago...
        `);

        // Redirigir a la página de pago después de 2 segundos
        setTimeout(() => {
            window.location.href = 'pago.html';
        }, 2000);
        
    } catch (error) {
        mostrarMensaje('error', `
            <strong>❌ Error en el registro</strong><br>
            ${error.message}
        `);
        
        // Rehabilitar botón solo si hay error
        const btnSubmit = e.target.querySelector('button[type="submit"]');
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Registrar';
    }
});

console.log('✅ Script de registro cargado correctamente');