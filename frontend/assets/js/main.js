/* document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');  
    const errorDiv = document.getElementById('error-message');  

    // --- Verificar si el usuario ya tiene sesión activa ---
    const token = localStorage.getItem('token');
    const tipo = localStorage.getItem('tipo_usuario');
    if (token && tipo) {
        if (tipo === 'fisio') {
            window.location.href = 'dashboard_fisio.html';
        } else if (tipo === 'paciente') {
            window.location.href = 'dashboard_paciente.html';
        }
        return;
    }

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
                    email: usuario,      // Asegúrate de que tu backend espere "correo"
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
 */


document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');  
    const errorDiv = document.getElementById('error-message');  

    // --- Verificar si el usuario ya tiene sesión activa ---
    const token = localStorage.getItem('token');
    const tipo = localStorage.getItem('tipo_usuario');
    
    if (token && tipo) {
        console.log('✅ Sesión activa detectada:', tipo);
        if (tipo === 'fisio') {
            window.location.href = 'dashboard_fisio.html';
        } else if (tipo === 'paciente') {
            window.location.href = 'dashboard_paciente.html';
        }
        return;
    }

    // --- Manejador del formulario de login ---
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const usuario = document.getElementById('usuario').value.trim();
        const contrasena = document.getElementById('contrasena').value.trim();

        // Validación de campos vacíos
        if (!usuario || !contrasena) {
            showError('Por favor, completa todos los campos.');
            return;
        }

        // Deshabilitar botón mientras se procesa
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Iniciando sesión...';

        try {
            console.log('📤 Enviando credenciales al servidor...');
            
            const response = await fetch('http://127.0.0.1:8000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: usuario,
                    contrasena: contrasena
                })
            });

            const data = await response.json();
            console.log('📥 Respuesta del servidor:', data);

            if (response.ok) {
                // --- Guardar token y datos ---
                localStorage.setItem('token', data.access_token);
                localStorage.setItem('tipo_usuario', data.tipo_usuario);
                localStorage.setItem('nombre', data.nombre || 'Usuario');
                localStorage.setItem('email', data.email);

                console.log('✅ Login exitoso. Tipo de usuario:', data.tipo_usuario);

                // Mostrar mensaje de éxito
                showError('¡Inicio de sesión exitoso! Redirigiendo...', 'success');

                // --- Redirigir según tipo ---
                setTimeout(() => {
                    if (data.tipo_usuario === 'fisio') {
                        window.location.href = 'dashboard_fisio.html';
                    } else if (data.tipo_usuario === 'paciente') {
                        window.location.href = 'dashboard_paciente.html';
                    } else {
                        showError('Tipo de usuario no reconocido.');
                    }
                }, 1000);
            } else {
                // Manejar errores específicos del servidor
                let errorMessage = data.detail || 'Credenciales inválidas';
                
                if (response.status === 401) {
                    errorMessage = 'Usuario o contraseña incorrectos';
                } else if (response.status === 500) {
                    errorMessage = 'Error en el servidor. Intenta más tarde';
                }
                
                showError(errorMessage);
                submitBtn.disabled = false;
                submitBtn.textContent = 'Ingresar';
            }

        } catch (error) {
            console.error('❌ Error de conexión:', error);
            showError('No se pudo conectar con el servidor. Verifica que esté corriendo en http://127.0.0.1:8000');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Ingresar';
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

    // --- Mostrar mensajes de error o éxito ---
    function showError(message, type = 'error') {
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            errorDiv.style.padding = '10px';
            errorDiv.style.borderRadius = '5px';
            errorDiv.style.marginTop = '15px';
            
            if (type === 'error') {
                errorDiv.style.backgroundColor = '#f8d7da';
                errorDiv.style.color = '#721c24';
                errorDiv.style.border = '1px solid #f5c6cb';
            } else {
                errorDiv.style.backgroundColor = '#d4edda';
                errorDiv.style.color = '#155724';
                errorDiv.style.border = '1px solid #c3e6cb';
            }

            // Auto-ocultar después de 5 segundos
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 5000);
        } else {
            alert(message);
        }
    }
});

console.log('✅ Script main.js cargado correctamente');