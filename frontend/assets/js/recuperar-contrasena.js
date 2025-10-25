const API_URL = 'http://localhost:8000';

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

// Validar formato de email
function esEmailValido(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Validar correos en tiempo real
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

document.getElementById('correo')?.addEventListener('input', function() {
    const confirmar = document.getElementById('confirmarCorreo');
    
    // Validar formato de email
    if (this.value && !esEmailValido(this.value)) {
        this.style.borderColor = '#ff4444';
    } else {
        this.style.borderColor = '';
    }
    
    // Revalidar confirmación si ya tiene valor
    if (confirmar.value) {
        confirmar.dispatchEvent(new Event('input'));
    }
});

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
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: correo })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Error al recuperar contraseña');
        }

        mostrarMensaje('exito', `
            <strong> ¡Contraseña enviada!</strong><br>
            ${data.mensaje}<br><br>
            <strong>Revisa tu bandeja de entrada y spam</strong><br>
            Correo: <strong>${correo}</strong>
        `);

        document.getElementById('recuperarForm').reset();

        // Redirigir al login después de 5 segundos
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 5000);

    } catch (error) {
        console.error('Error:', error);
        
        let mensajeError = error.message;
        
        // Personalizar mensajes de error comunes
        if (mensajeError.includes('Failed to fetch')) {
            mensajeError = 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.';
        } else if (mensajeError.includes('No existe una cuenta')) {
            mensajeError = 'No existe una cuenta registrada con ese correo electrónico.';
        }
        
        mostrarMensaje('error', `
            <strong> Error</strong><br>
            ${mensajeError}
        `);
    } finally {
        btnRecuperar.disabled = false;
        btnRecuperar.textContent = textoOriginal;
    }
});

console.log('Script de recuperar contraseña cargado correctamente');