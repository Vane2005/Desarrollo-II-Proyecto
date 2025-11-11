document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm")
  const cedulaInput = document.getElementById("usuario")
  const contrasenaInput = document.getElementById("contrasena")

  // Verificar sesión activa
  const token = localStorage.getItem("token")
  const tipo = localStorage.getItem("tipo_usuario")
  if (token && tipo) {
    window.location.href = tipo === "fisio" ? "dashboard_fisio.html" : "dashboard_paciente.html"
    return
  }

  // Funciones de utilidad
  function mostrarError(input, mensaje) {
    const errorDiv = input.nextElementSibling
    if (errorDiv && errorDiv.classList.contains('error-message')) {
      errorDiv.textContent = `⚠️ ${mensaje}`
      errorDiv.classList.add('visible')
    }
    input.classList.add('input-error')
    input.classList.add('shake')
    setTimeout(() => input.classList.remove('shake'), 500)
  }

  function limpiarError(input) {
    const errorDiv = input.nextElementSibling
    if (errorDiv && errorDiv.classList.contains('error-message')) {
      errorDiv.textContent = ''
      errorDiv.classList.remove('visible')
    }
    input.classList.remove('input-error')
  }

  function limpiarErrores() {
    limpiarError(cedulaInput)
    limpiarError(contrasenaInput)
  }

  function mostrarErrorGeneral(mensaje) {
    const errorDiv = document.getElementById('error-general')
    if (errorDiv) {
      errorDiv.innerHTML = `
        <span class="error-icon">⚠️</span>
        <span>${mensaje}</span>
      `
      errorDiv.classList.add('visible')
    }
  }

  function limpiarErrorGeneral() {
    const errorDiv = document.getElementById('error-general')
    if (errorDiv) {
      errorDiv.classList.remove('visible')
    }
  }

  // Validación en tiempo real
  cedulaInput.addEventListener('input', function() {
    limpiarError(this)
    limpiarErrorGeneral()
    
    const valor = this.value.trim()
    
    if (valor && !/^\d+$/.test(valor)) {
      mostrarError(this, 'La cédula debe contener solo números')
    }
  })

  contrasenaInput.addEventListener('input', function() {
    limpiarError(this)
    limpiarErrorGeneral()
  })

  // Validar al perder foco
  cedulaInput.addEventListener('blur', function() {
    const valor = this.value.trim()
    
    if (!valor) {
      mostrarError(this, 'La cédula es obligatoria')
    } else if (valor.length < 6) {
      mostrarError(this, 'La cédula debe tener al menos 6 dígitos')
    } else if (valor.length > 20) {
      mostrarError(this, 'La cédula no puede tener más de 20 dígitos')
    }
  })

  contrasenaInput.addEventListener('blur', function() {
    const valor = this.value.trim()
    
    if (!valor) {
      mostrarError(this, 'La contraseña es obligatoria')
    } else if (valor.length < 4) {
      mostrarError(this, 'La contraseña debe tener al menos 4 caracteres')
    }
  })

  // Manejo del formulario
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault()
    
    limpiarErrores()
    limpiarErrorGeneral()

    const cedula = cedulaInput.value.trim()
    const contrasena = contrasenaInput.value.trim()

    // Validaciones previas
    let hayErrores = false

    if (!cedula) {
      mostrarError(cedulaInput, 'Por favor ingrese su cédula')
      hayErrores = true
    } else if (!/^\d+$/.test(cedula)) {
      mostrarError(cedulaInput, 'La cédula debe contener solo números')
      hayErrores = true
    } else if (cedula.length < 6 || cedula.length > 20) {
      mostrarError(cedulaInput, 'La cédula debe tener entre 6 y 20 dígitos')
      hayErrores = true
    }

    if (!contrasena) {
      mostrarError(contrasenaInput, 'Por favor ingrese su contraseña')
      hayErrores = true
    } else if (contrasena.length < 4) {
      mostrarError(contrasenaInput, 'La contraseña debe tener al menos 4 caracteres')
      hayErrores = true
    }

    if (hayErrores) {
      // Enfocar el primer campo con error
      if (cedulaInput.classList.contains('input-error')) {
        cedulaInput.focus()
      } else if (contrasenaInput.classList.contains('input-error')) {
        contrasenaInput.focus()
      }
      return
    }

    // Deshabilitar botón y mostrar estado de carga
    const submitBtn = loginForm.querySelector('button[type="submit"]')
    const textoOriginal = submitBtn.textContent
    submitBtn.disabled = true
    submitBtn.textContent = 'Iniciando sesión...'

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cedula, contrasena })
      })

      const data = await response.json()

      if (response.ok) {
        // Guardar datos de sesión
        localStorage.setItem("token", data.access_token)
        localStorage.setItem("tipo_usuario", data.tipo_usuario)
        localStorage.setItem("nombre", data.nombre || "Usuario")
        localStorage.setItem("cedula", cedula)

        // Mostrar mensaje de éxito (opcional)
        mostrarErrorGeneral('✅ Inicio de sesión exitoso. Redirigiendo...')
        document.getElementById('error-general').classList.add('success-message')
        document.getElementById('error-general').classList.remove('error-message')

        // Redirigir después de 1 segundo
        setTimeout(() => {
          if (data.tipo_usuario === "fisio") {
            window.location.href = "dashboard_fisio.html"
          } else if (data.tipo_usuario === "paciente") {
            window.location.href = "dashboard_paciente.html"
          }
        }, 1000)
      } else {
        // Manejar errores del servidor
        if (response.status === 401) {
          mostrarError(cedulaInput, 'Cédula o contraseña incorrecta')
          mostrarError(contrasenaInput, 'Cédula o contraseña incorrecta')
          cedulaInput.focus()
        } else if (response.status === 400) {
          mostrarErrorGeneral(data.detail || 'Datos incorrectos. Verifica tu información.')
        } else if (response.status >= 500) {
          mostrarErrorGeneral('Error del servidor. Por favor, intenta más tarde.')
        } else {
          mostrarErrorGeneral(data.detail || 'Error al iniciar sesión. Intenta nuevamente.')
        }
      }
    } catch (error) {
      console.error("Error de conexión:", error)
      mostrarErrorGeneral('No se pudo conectar con el servidor. Verifica tu conexión a internet.')
    } finally {
      // Rehabilitar botón
      submitBtn.disabled = false
      submitBtn.textContent = textoOriginal
    }
  })

  // Link de recuperar contraseña
  const forgotPasswordLink = document.querySelector(".forgot-password")
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", (e) => {
      e.preventDefault()
      window.location.href = "recuperar-contrasena.html"
    })
  }

  // Link de registro
  const registerLink = document.querySelector(".register-link")
  if (registerLink) {
    registerLink.addEventListener("click", (e) => {
      e.preventDefault()
      window.location.href = "registro.html"
    })
  }
})