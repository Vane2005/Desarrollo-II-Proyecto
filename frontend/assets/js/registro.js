const API_URL = 'http://localhost:8000';

// Funciones de utilidad para mensajes
function mostrarError(input, mensaje) {
    const errorDiv = input.nextElementSibling;
    if (errorDiv && errorDiv.classList.contains('error-message')) {
        errorDiv.textContent = `⚠️ ${mensaje}`;
        errorDiv.classList.add('visible');
    }
    input.classList.add('input-error');
    input.classList.add('shake');
    setTimeout(() => input.classList.remove('shake'), 500);
}

function limpiarError(input) {
    const errorDiv = input.nextElementSibling;
    if (errorDiv && errorDiv.classList.contains('error-message')) {
        errorDiv.textContent = '';
        errorDiv.classList.remove('visible');
    }
    input.classList.remove('input-error');
}

function mostrarMensajeGeneral(tipo, contenido) {
    const messageDiv = document.getElementById('message');
    messageDiv.className = tipo === 'exito' ? 'success-message visible' : 'error-message visible';
    messageDiv.innerHTML = contenido;
    
    if (tipo === 'exito') {
        setTimeout(() => {
            messageDiv.classList.remove('visible');
        }, 5000);
    }
}

// Validaciones en tiempo real
document.getElementById('cedula')?.addEventListener('input', function() {
    limpiarError(this);
    const valor = this.value.trim();
    
    if (valor && !/^\d+$/.test(valor)) {
        mostrarError(this, 'La cédula debe contener solo números');
    } else if (valor && (valor.length < 6 || valor.length > 20)) {
        mostrarError(this, 'La cédula debe tener entre 6 y 20 dígitos');
    }
});

document.getElementById('email')?.addEventListener('input', function() {
    limpiarError(this);
    const valor = this.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (valor && !emailRegex.test(valor)) {
        mostrarError(this, 'Ingrese un email válido (ej: usuario@ejemplo.com)');
    }
});

document.getElementById('nombre')?.addEventListener('input', function() {
    limpiarError(this);
    const valor = this.value.trim();
    
    if (valor && valor.length < 2) {
        mostrarError(this, 'El nombre debe tener al menos 2 caracteres');
    }
});

document.getElementById('telefono')?.addEventListener('input', function() {
    limpiarError(this);
    const valor = this.value.trim();
    
    if (valor && !/^\d+$/.test(valor)) {
        mostrarError(this, 'El teléfono debe contener solo números');
    } else if (valor && (valor.length < 7 || valor.length > 15)) {
        mostrarError(this, 'El teléfono debe tener entre 7 y 15 dígitos');
    }
});

document.getElementById('contrasena')?.addEventListener('input', function() {
    limpiarError(this);
    const valor = this.value;
    
    if (valor && valor.length < 8) {
        mostrarError(this, 'La contraseña debe tener al menos 8 caracteres');
    }
    
    // Revalidar confirmación si ya tiene valor
    const confirmar = document.getElementById('confirmarContrasena');
    if (confirmar && confirmar.value) {
        limpiarError(confirmar);
        if (valor !== confirmar.value) {
            mostrarError(confirmar, 'Las contraseñas no coinciden');
        }
    }
});

document.getElementById('confirmarContrasena')?.addEventListener('input', function() {
    limpiarError(this);
    const contrasena = document.getElementById('contrasena').value;
    const confirmar = this.value;
    
    if (confirmar && contrasena !== confirmar) {
        mostrarError(this, 'Las contraseñas no coinciden');
    }
});

// Función para registrar fisioterapeuta
async function registrarFisioterapeuta(datos) {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datos)
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 422 && data.detail) {
                const errores = data.detail.map(error => {
                    const campo = error.loc[error.loc.length - 1];
                    let mensaje = error.msg;
                    
                    if (mensaje.includes('at least')) {
                        const minLength = mensaje.match(/\d+/)?.[0];
                        mensaje = `debe tener al menos ${minLength} caracteres`;
                    } else if (mensaje.includes('valid email')) {
                        mensaje = 'debe ser un email válido';
                    } else if (mensaje.includes('missing')) {
                        mensaje = 'es obligatorio';
                    }
                    
                    return `<strong>${campo}</strong>: ${mensaje}`;
                });
                
                throw new Error(errores.join('<br>'));
            }
            
            throw new Error(data.detail || 'Error al registrar usuario');
        }

        return data;
        
    } catch (error) {
        throw error;
    }
}

// Manejo del formulario
document.getElementById('registroForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Limpiar errores previos
    document.querySelectorAll('.error-message').forEach(div => {
        div.classList.remove('visible');
        div.textContent = '';
    });
    document.querySelectorAll('.input-error').forEach(input => {
        input.classList.remove('input-error');
    });
    
    // Obtener valores
    const cedula = document.getElementById('cedula').value.trim();
    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const contrasena = document.getElementById('contrasena').value;
    const confirmarContrasena = document.getElementById('confirmarContrasena').value;
    
    // Validaciones
    let hayErrores = false;
    
    if (!cedula) {
        mostrarError(document.getElementById('cedula'), 'La cédula es obligatoria');
        hayErrores = true;
    } else if (!/^\d+$/.test(cedula)) {
        mostrarError(document.getElementById('cedula'), 'La cédula debe contener solo números');
        hayErrores = true;
    } else if (cedula.length < 6 || cedula.length > 20) {
        mostrarError(document.getElementById('cedula'), 'La cédula debe tener entre 6 y 20 dígitos');
        hayErrores = true;
    }
    
    if (!nombre) {
        mostrarError(document.getElementById('nombre'), 'El nombre es obligatorio');
        hayErrores = true;
    } else if (nombre.length < 2) {
        mostrarError(document.getElementById('nombre'), 'El nombre debe tener al menos 2 caracteres');
        hayErrores = true;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
        mostrarError(document.getElementById('email'), 'El email es obligatorio');
        hayErrores = true;
    } else if (!emailRegex.test(email)) {
        mostrarError(document.getElementById('email'), 'Ingrese un email válido');
        hayErrores = true;
    }
    
    if (!telefono) {
        mostrarError(document.getElementById('telefono'), 'El teléfono es obligatorio');
        hayErrores = true;
    } else if (!/^\d+$/.test(telefono)) {
        mostrarError(document.getElementById('telefono'), 'El teléfono debe contener solo números');
        hayErrores = true;
    } else if (telefono.length < 7 || telefono.length > 15) {
        mostrarError(document.getElementById('telefono'), 'El teléfono debe tener entre 7 y 15 dígitos');
        hayErrores = true;
    }
    
    if (!contrasena) {
        mostrarError(document.getElementById('contrasena'), 'La contraseña es obligatoria');
        hayErrores = true;
    } else if (contrasena.length < 8) {
        mostrarError(document.getElementById('contrasena'), 'La contraseña debe tener al menos 8 caracteres');
        hayErrores = true;
    }
    
    if (!confirmarContrasena) {
        mostrarError(document.getElementById('confirmarContrasena'), 'Debe confirmar la contraseña');
        hayErrores = true;
    } else if (contrasena !== confirmarContrasena) {
        mostrarError(document.getElementById('confirmarContrasena'), 'Las contraseñas no coinciden');
        hayErrores = true;
    }
    
    if (hayErrores) {
        // Enfocar el primer campo con error
        const primerError = document.querySelector('.input-error');
        if (primerError) primerError.focus();
        return;
    }

    const datos = { cedula, email, nombre, contrasena, telefono };

    try {
        const btnSubmit = e.target.querySelector('button[type="submit"]');
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Registrando...';
        
        const resultado = await registrarFisioterapeuta(datos);

        localStorage.setItem('cedula_pendiente', datos.cedula);
        localStorage.setItem('userEmail', datos.email);
        localStorage.setItem('userName', datos.nombre);

        mostrarMensajeGeneral('exito', `
            <strong>✅ Registro exitoso</strong><br>
            ${resultado.mensaje}<br>
            <strong>Tu cuenta está en estado "Inactivo"</strong><br>
            Completa el pago para activarla.<br>
            Redirigiendo al pago...
        `);

        setTimeout(() => {
            window.location.href = 'pago.html';
        }, 2000);
        
    } catch (error) {
        mostrarMensajeGeneral('error', `
            <strong>❌ Error en el registro</strong><br>
            ${error.message}
        `);
        
        const btnSubmit = e.target.querySelector('button[type="submit"]');
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Registrar';
    }
});

console.log('✅ Script de registro cargado correctamente');