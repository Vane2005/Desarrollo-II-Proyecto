// frontend/assets/js/recuperar-contrasena.js
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
    if (confirmar.value) {
        confirmar.dispatchEvent(new Event('input'));
    }
});

document.getElementById('recuperarForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    document.getElementById('mensaje').style.display = 'none';
    
    const correo = document.getElementById('correo').value.trim();
    const confirmarCorreo = document.getElementById('confirmarCorreo').value.trim();
    
    // Validar que los correos coincidan
    if (correo !== confirmarCorreo) {
        mostrarMensaje('error', 'Los correos electrónicos no coinciden');
        document.getElementById('confirmarCorreo').focus();
        return;
    }

    const btnRecuperar = document.getElementById('btnRecuperar');
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
            ${data.mensaje}<br>
            Revisa tu bandeja de entrada (y spam) en ${correo}
        `);

        document.getElementById('recuperarForm').reset();

    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('error', `
            <strong> Error</strong><br>
            ${error.message}
        `);
    } finally {
        btnRecuperar.disabled = false;
        btnRecuperar.textContent = 'Recuperar Contraseña';
    }
});

console.log('✅ Script de recuperar contraseña cargado correctamente');