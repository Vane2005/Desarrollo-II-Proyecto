document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');  
    const errorDiv = document.getElementById('error-message');  

    // --- NOTA: NO verificar sesión previa aquí ---
    // Esto permite que el usuario siempre vea el login primero

    // --- Manejador del formulario de login ---
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const usuario = document.getElementById('usuario').value.trim();
        const contrasena = document.getElementById('contrasena').value.trim();

        if (!usuario || !contrasena) {
            showError('Por favor, completa todos los campos.');
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: usuario,
                    contrasena: contrasena
                })
            });

            const data = await response.json();

            if (response.ok) {
                // --- Guardar token y datos ---
                localStorage.setItem('token', data.access_token);
                localStorage.setItem('tipo_usuario', data.tipo_usuario);
                localStorage.setItem('nombre', data.nombre || 'Usuario');

                // --- Redirigir según tipo ---
                if (data.tipo_usuario === 'fisio') {
                    window.location.href = 'dashboard_fisio.html';
                } else if (data.tipo_usuario === 'paciente') {
                    window.location.href = 'dashboard_paciente.html';
                } else {
                    showError('Tipo de usuario no reconocido.');
                }
            } else {
                showError(data.detail || 'Credenciales incorrectas');
            }

        } catch (error) {
            console.error('Error de conexión:', error);
            showError('No se pudo conectar con el servidor. Verifica que esté corriendo.');
        }
    });

    // --- Link "Recuperar contraseña" ---
    document.querySelector('.forgot-password').addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'recuperar-contrasena.html';
    });

    // --- Link "Registrarse" ---
    document.querySelector('.register-link').addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'registro.html';
    });

    // --- Mostrar mensajes de error ---
    function showError(message) {
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            errorDiv.style.color = 'red';
        } else {
            alert(message);
        }
    }
});