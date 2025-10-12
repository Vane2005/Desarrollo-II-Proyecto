/* // Login form handler
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const usuario = document.getElementById('usuario').value;
    const contrasena = document.getElementById('contrasena').value;
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: usuario,
                password: contrasena
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store token
            localStorage.setItem('token', data.access_token);
            // Redirect to dashboard
            window.location.href = '/dashboard.html';
        } else {
            alert('Error: ' + (data.detail || 'Credenciales inválidas'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al conectar con el servidor');
    }
});

// Forgot password link handler
document.querySelector('.forgot-password').addEventListener('click', (e) => {
    e.preventDefault();
    // Redirect to password recovery page
    window.location.href = '/recuperar-contrasena.html';
});

// Register link handler
document.querySelector('.register-link').addEventListener('click', (e) => {
    e.preventDefault();
    // Redirect to registration page
    window.location.href = '/registro.html';
});


document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('usuario').value;  // Cambia 'usuario' a email si actualizas HTML
    const contrasena = document.getElementById('contrasena').value;
    
    try {
        const response = await fetch('http://localhost:8000/auth/login', {  // Endpoint correcto
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,  // Usa email en lugar de username
                contrasena: contrasena
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Guardar token y datos de usuario
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('userType', data.tipo_usuario);
            localStorage.setItem('userName', data.nombre);
            localStorage.setItem('userEmail', data.email);
            
            // Redirigir según tipo
            if (data.tipo_usuario === 'fisio') {
                window.location.href = '/dashboard_fisio.html';  // Crea este archivo si no existe
            } else if (data.tipo_usuario === 'paciente') {
                window.location.href = '/dashboard_paciente.html';  // Crea este archivo si no existe
            } else {
                alert('Tipo de usuario desconocido');
            }
        } else {
            alert('Error: ' + (data.detail || 'Credenciales inválidas'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al conectar con el servidor');
    }
});
 */

document.addEventListener('DOMContentLoaded', function() {
const loginForm = document.getElementById('loginForm');  // Asume ID del form en index.html
const errorDiv = document.getElementById('error-message');  // Agrega un <div id="error-message"></div> en index.html para errores

loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
    showError('Por favor, completa todos los campos.');
    return;
    }

    try {
    const response = await fetch('http://localhost:8000/auth/login', {  // Asume backend en puerto 8000
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: email, contrasena: password })  // Usa 'correo' y 'contrasena' como en schema
    });

    if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('tipo_usuario', data.tipo_usuario);
        localStorage.setItem('nombre', data.nombre || 'Usuario');

        // Verificación y redirección
        if (data.tipo_usuario === 'fisio') {
        window.location.href = 'dashboard_fisio.html';
        } else if (data.tipo_usuario === 'paciente') {
        window.location.href = 'dashboard_paciente.html';
        } else {
        showError('Tipo de usuario no reconocido.');
        }
    } else {
        const errorData = await response.json();
        showError(errorData.detail || 'Error en el login. Intenta de nuevo.');
    }
    } catch (error) {
    showError('Error de conexión. Verifica que el servidor esté corriendo.');
    console.error('Login error:', error);
    }
});

function showError(message) {
    if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    errorDiv.style.color = 'red';
    } else {
    alert(message);  // Fallback si no agregas el div
    }
}

// Opcional: Verificar si ya está logueado al cargar la página
const token = localStorage.getItem('token');
const tipo = localStorage.getItem('tipo_usuario');
if (token && tipo) {
    if (tipo === 'fisio') window.location.href = 'dashboard_fisio.html';
    else if (tipo === 'paciente') window.location.href = 'dashboard_paciente.html';
}
});
