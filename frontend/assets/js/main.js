// Login form handler
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
