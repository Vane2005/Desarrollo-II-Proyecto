const API_URL = 'http://localhost:8000';
// ===============================
// DASHBOARD FISIO JS COMPLETO
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "http://localhost:8000/paciente";

  const navItems = document.querySelectorAll(".nav-item");
  const sections = document.querySelectorAll(".content-section");
  const sectionTitle = document.getElementById("section-title");
  const logoutBtn = document.querySelector(".btn-logout");
  const toggleSidebarBtn = document.getElementById("toggleSidebar");
  const sidebar = document.getElementById("sidebar");

  const sectionTitles = {
    "informacion-personal": "Información Personal",
    "asignar-ejercicios": "Asignar Ejercicios",
    "avance-paciente": "Avance Paciente",
  };

  // === Toggle Sidebar ===
  toggleSidebarBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
  });

  // === Navegación entre secciones ===
  navItems.forEach((item) => {
    item.addEventListener("click", function () {
      const targetSection = this.getAttribute("data-section");
      navItems.forEach((nav) => nav.classList.remove("active"));
      sections.forEach((section) => section.classList.remove("active"));

      this.classList.add("active");
      document.getElementById(targetSection).classList.add("active");
      sectionTitle.textContent = sectionTitles[targetSection];
    });
  });

  // === Logout CORREGIDO ===
  logoutBtn.addEventListener("click", () => {
    if (confirm("¿Desea cerrar sesión?")) {
      // 🔴 IMPORTANTE: Limpiar TODO el localStorage
      localStorage.clear();
      
      // Redirigir al login
      window.location.href = "index.html";
    }
  });

  // ==========================================
  // 🔍 BUSCAR PACIENTE POR CÉDULA
  // ==========================================
 // debug: buscar paciente y mostrar status + body en consola
const btnBuscar = document.getElementById("btnBuscarCedula");
if (btnBuscar) {
  btnBuscar.addEventListener("click", async () => {
    const cedula = document.getElementById("cedulaInput").value.trim();
    if (!cedula) return alert("Por favor ingrese una cédula");

    try {
      const res = await fetch(`${API_URL}/${cedula}`);
      // debug: ver status y texto
      console.log("FETCH /paciente status:", res.status);
      const text = await res.text();
      console.log("FETCH /paciente body (raw):", text);

      // Luego parsear si es JSON válido
      if (!res.ok) {
        // intenta mostrar JSON si viene así
        try {
          const errJson = JSON.parse(text);
          alert("No encontrado: " + (errJson.detail || JSON.stringify(errJson)));
        } catch (e) {
          alert("No encontrado (status " + res.status + ")");
        }
        document.getElementById("infoPaciente").style.display = "none";
        return;
      }

      const data = JSON.parse(text);
      document.getElementById("infoPaciente").style.display = "block";
      document.getElementById("pacienteNombre").textContent = data.nombre;
      document.getElementById("pacienteCorreo").textContent = data.correo;
      window.pacienteCedula = cedula;
      console.log("Paciente encontrado:", data);
    } catch (error) {
      console.error("Error fetch paciente:", error);
      alert("❌ Error de conexión con el servidor");
      document.getElementById("infoPaciente").style.display = "none";
    }
  });
}


  // ==========================================
  // 🏋️ CARGAR EJERCICIOS DISPONIBLES
  // ==========================================
  async function cargarEjercicios() {
    try {
      const res = await fetch(`${API_URL}/ejercicios`);
      const ejercicios = await res.json();

      const container = document.getElementById("exercisesGrid");
      container.innerHTML = "";

      ejercicios.forEach((e) => {
        const card = document.createElement("div");
        card.classList.add("exercise-card");
        card.innerHTML = `
          <label class="exercise-item">
            <input type="checkbox" class="exercise-checkbox" value="${e.id_ejercicio}">
            <h3>${e.nombre}</h3>
            <p>${e.descripcion}</p>
            <small>${e.categoria}</small>
          </label>
        `;
        container.appendChild(card);
      });
    } catch (err) {
      console.error("Error cargando ejercicios:", err);
    }
  }

  cargarEjercicios();

// ==========================================
// ✅ ASIGNAR EJERCICIOS A PACIENTE
// ==========================================
const assignBtn = document.getElementById("assignSelectedExercises");
if (assignBtn) {
  assignBtn.addEventListener("click", async () => {
    if (!window.pacienteCedula) {
      alert("Primero busque un paciente por cédula.");
      return;
    }

    const seleccionados = Array.from(
      document.querySelectorAll(".exercise-checkbox:checked")
    ).map((cb) => parseInt(cb.value));

    if (seleccionados.length === 0) {
      alert("Seleccione al menos un ejercicio.");
      return;
    }

    console.log("✅ Ejercicios seleccionados:", seleccionados); // debug

    try {
      const res = await fetch(`${API_URL}/asignar-ejercicio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cedula_paciente: window.pacienteCedula,
          ejercicios: seleccionados,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Error desconocido");

      alert("✅ Ejercicios asignados correctamente");
      document
        .querySelectorAll(".exercise-checkbox:checked")
        .forEach((cb) => (cb.checked = false));
    } catch (error) {
      console.error("❌ Error al asignar ejercicios:", error);
      alert("❌ Error al asignar ejercicios");
    }
  });
}

});


// Manejo del botón Realizar Pago
document.getElementById('btnRealizarPago')?.addEventListener('click', () => {
  if (confirm('¿Desea proceder con el pago de su suscripción mensual?')) {
    console.log('[v0] Redirigiendo a página de pago...')
    // Aquí puedes redirigir a tu página de pagos
    window.location.href = 'pago.html'
  }
})

// Manejo del botón Cambiar Contraseña
document.getElementById('btnCambiarContrasena')?.addEventListener('click', () => {
  mostrarModalCambiarContrasena();
});


// Función para mostrar modal de cambio de contraseña
function mostrarModalCambiarContrasena() {
  const modalHTML = `
    <div class="modal-overlay" id="modalCambiarContrasena">
      <div class="modal-password-change">
        <div class="modal-header">
          <h3>Cambiar Contraseña</h3>
          <button class="close-btn" onclick="cerrarModalContrasena()">&times;</button>
        </div>
        <form id="formCambiarContrasena" class="password-form">
          <div class="form-group">
            <label for="contrasenaActual">Contraseña Actual</label>
            <div class="password-input-wrapper">
              <input type="password" id="contrasenaActual" required minlength="4">
              <button type="button" class="toggle-password" onclick="togglePasswordVisibility('contrasenaActual')">
                👁️
              </button>
            </div>
          </div>
          
          <div class="form-group">
            <label for="contrasenaNueva">Nueva Contraseña</label>
            <div class="password-input-wrapper">
              <input type="password" id="contrasenaNueva" required minlength="8">
              <button type="button" class="toggle-password" onclick="togglePasswordVisibility('contrasenaNueva')">
                👁️
              </button>
            </div>
            <div class="password-strength" id="passwordStrength"></div>
          </div>
          
          <div class="form-group">
            <label for="contrasenaConfirmar">Confirmar Nueva Contraseña</label>
            <div class="password-input-wrapper">
              <input type="password" id="contrasenaConfirmar" required minlength="8">
              <button type="button" class="toggle-password" onclick="togglePasswordVisibility('contrasenaConfirmar')">
                👁️
              </button>
            </div>
          </div>
          
          <div class="password-requirements">
            <p><strong>Requisitos de contraseña:</strong></p>
            <ul>
              <li id="req-length">✗ Mínimo 8 caracteres</li>
              <li id="req-match">✗ Las contraseñas deben coincidir</li>
            </ul>
          </div>
          
          <div id="error-message-password" class="error-message" style="display: none;"></div>
          
          <div class="modal-actions">
            <button type="button" class="btn-cancel" onclick="cerrarModalContrasena()">Cancelar</button>
            <button type="submit" class="btn-submit" id="btnSubmitPassword">Cambiar Contraseña</button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Event listeners
  document.getElementById('formCambiarContrasena').addEventListener('submit', cambiarContrasena);
  document.getElementById('contrasenaNueva').addEventListener('input', validarContrasena);
  document.getElementById('contrasenaConfirmar').addEventListener('input', validarContrasena);
}

// Función para cerrar modal
function cerrarModalContrasena() {
  const modal = document.getElementById('modalCambiarContrasena');
  if (modal) {
    modal.remove();
  }
}

// Toggle visibilidad de contraseña
function togglePasswordVisibility(inputId) {
  const input = document.getElementById(inputId);
  const button = input.nextElementSibling;
  
  if (input.type === 'password') {
    input.type = 'text';
    button.textContent = '🙈';
  } else {
    input.type = 'password';
    button.textContent = '👁️';
  }
}

// Validar contraseña en tiempo real
function validarContrasena() {
  const contrasenaNueva = document.getElementById('contrasenaNueva').value;
  const contrasenaConfirmar = document.getElementById('contrasenaConfirmar').value;
  
  // Validar longitud
  const reqLength = document.getElementById('req-length');
  if (contrasenaNueva.length >= 8) {
    reqLength.textContent = '✓ Mínimo 8 caracteres';
    reqLength.style.color = '#16a085';
  } else {
    reqLength.textContent = '✗ Mínimo 8 caracteres';
    reqLength.style.color = '#e74c3c';
  }
  
  // Validar coincidencia
  const reqMatch = document.getElementById('req-match');
  if (contrasenaConfirmar && contrasenaNueva === contrasenaConfirmar) {
    reqMatch.textContent = '✓ Las contraseñas coinciden';
    reqMatch.style.color = '#16a085';
  } else if (contrasenaConfirmar) {
    reqMatch.textContent = '✗ Las contraseñas no coinciden';
    reqMatch.style.color = '#e74c3c';
  } else {
    reqMatch.textContent = '✗ Las contraseñas deben coincidir';
    reqMatch.style.color = '#666';
  }
  
  // Mostrar fortaleza de contraseña
  mostrarFortalezaContrasena(contrasenaNueva);
}

// Mostrar fortaleza de contraseña
function mostrarFortalezaContrasena(password) {
  const strengthDiv = document.getElementById('passwordStrength');
  
  if (!password) {
    strengthDiv.innerHTML = '';
    return;
  }
  
  let strength = 0;
  let tips = [];
  
  // Criterios de fortaleza
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    strength++;
  } else {
    tips.push('Usa mayúsculas y minúsculas');
  }
  if (/\d/.test(password)) {
    strength++;
  } else {
    tips.push('Incluye números');
  }
  if (/[^a-zA-Z0-9]/.test(password)) {
    strength++;
  } else {
    tips.push('Incluye caracteres especiales (!@#$%&*)');
  }
  
  // Determinar nivel
  let level, color, text;
  if (strength < 2) {
    level = 'weak';
    color = '#e74c3c';
    text = 'Débil';
  } else if (strength < 4) {
    level = 'medium';
    color = '#f39c12';
    text = 'Media';
  } else {
    level = 'strong';
    color = '#16a085';
    text = 'Fuerte';
  }
  
  strengthDiv.innerHTML = `
    <div class="strength-bar">
      <div class="strength-fill" style="width: ${(strength / 5) * 100}%; background-color: ${color};"></div>
    </div>
    <span style="color: ${color}; font-weight: 600;">Fortaleza: ${text}</span>
    ${tips.length > 0 ? `<p style="font-size: 0.875rem; color: #666; margin-top: 0.5rem;">💡 ${tips.join(', ')}</p>` : ''}
  `;
}

// Función principal para cambiar contraseña
async function cambiarContrasena(e) {
  e.preventDefault();
  
  const contrasenaActual = document.getElementById('contrasenaActual').value;
  const contrasenaNueva = document.getElementById('contrasenaNueva').value;
  const contrasenaConfirmar = document.getElementById('contrasenaConfirmar').value;
  const errorDiv = document.getElementById('error-message-password');
  const btnSubmit = document.getElementById('btnSubmitPassword');
  
  // Limpiar errores previos
  errorDiv.style.display = 'none';
  errorDiv.textContent = '';
  
  // Validar que las contraseñas coincidan
  if (contrasenaNueva !== contrasenaConfirmar) {
    errorDiv.textContent = '❌ Las contraseñas nuevas no coinciden';
    errorDiv.style.display = 'block';
    return;
  }
  
  // Validar longitud mínima
  if (contrasenaNueva.length < 8) {
    errorDiv.textContent = '❌ La contraseña debe tener al menos 8 caracteres';
    errorDiv.style.display = 'block';
    return;
  }
  
  // Deshabilitar botón
  btnSubmit.disabled = true;
  btnSubmit.textContent = 'Cambiando...';
  
  try {
    // Obtener token del localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No hay sesión activa. Por favor inicia sesión nuevamente.');
    }
    
    console.log('🔐 Enviando solicitud de cambio de contraseña...');
    
    const response = await fetch(`${API_URL}/auth/cambiar-contrasena`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        contrasena_actual: contrasenaActual,
        contrasena_nueva: contrasenaNueva
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || 'Error al cambiar contraseña');
    }
    
    console.log('✅ Contraseña cambiada exitosamente');
    
    // Mostrar mensaje de éxito
    alert('✅ Contraseña actualizada exitosamente\n\nPor seguridad, se cerrará tu sesión.');
    
    // Cerrar modal
    cerrarModalContrasena();
    
    // Cerrar sesión y redirigir al login
    localStorage.clear();
    window.location.href = 'index.html';
    
  } catch (error) {
    console.error('❌ Error:', error);
    
    let errorMessage = error.message;
    
    // Personalizar mensajes de error
    if (errorMessage.includes('contraseña actual es incorrecta')) {
      errorMessage = '❌ La contraseña actual es incorrecta';
    } else if (errorMessage.includes('Token inválido')) {
      errorMessage = '❌ Sesión expirada. Por favor inicia sesión nuevamente.';
    } else if (errorMessage.includes('Failed to fetch')) {
      errorMessage = '❌ No se pudo conectar con el servidor';
    }
    
    errorDiv.textContent = errorMessage;
    errorDiv.style.display = 'block';
    
  } finally {
    // Rehabilitar botón
    btnSubmit.disabled = false;
    btnSubmit.textContent = 'Cambiar Contraseña';
  }
}

console.log('✅ Funcionalidad de cambio de contraseña cargada');