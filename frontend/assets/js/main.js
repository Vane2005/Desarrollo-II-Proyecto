document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm")
  const errorDiv = document.getElementById("error-message")

  // --- Verificar si el usuario ya tiene sesión activa ---
  const token = localStorage.getItem("token")
  const tipo = localStorage.getItem("tipo_usuario")
  if (token && tipo) {
    if (tipo === "fisio") {
      window.location.href = "dashboard_fisio.html"
    } else if (tipo === "paciente") {
      window.location.href = "dashboard_paciente.html"
    }
    return
  }

  // --- Manejador del formulario de login ---
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const cedula = document.getElementById("usuario").value.trim()
    const contrasena = document.getElementById("contrasena").value.trim()

    if (!cedula || !contrasena) {
      showError("Por favor, completa todos los campos.")
      return
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cedula: cedula, // Enviando cédula en lugar de email
          contrasena: contrasena,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // --- Guardar token y datos ---
        localStorage.setItem("token", data.access_token)
        localStorage.setItem("tipo_usuario", data.tipo_usuario)
        localStorage.setItem("nombre", data.nombre || "Usuario")
        localStorage.setItem("cedula", cedula)

        // --- Redirigir según tipo ---
        if (data.tipo_usuario === "fisio") {
          window.location.href = "dashboard_fisio.html"
        } else if (data.tipo_usuario === "paciente") {
          window.location.href = "dashboard_paciente.html"
        } else {
          showError("Tipo de usuario no reconocido.")
        }
      } else {
        // Mostrar error del servidor
        showError(data.detail || "Cédula o contraseña incorrecta.")
      }
    } catch (error) {
      console.error("Error de conexión:", error)
      showError("No se pudo conectar con el servidor. Verifica que esté corriendo.")
    }
  })

  // --- Link "Recuperar contraseña" ---
  document.querySelector(".forgot-password").addEventListener("click", (e) => {
    e.preventDefault()
    window.location.href = "recuperar-contrasena.html"
  })

  // --- Link "Registrarse" ---
  document.querySelector(".register-link").addEventListener("click", (e) => {
    e.preventDefault()
    window.location.href = "registro.html"
  })

  // --- Mostrar mensajes de error ---
  function showError(message) {
    if (errorDiv) {
      errorDiv.textContent = message
      errorDiv.style.display = "block"
      errorDiv.style.color = "red"
    } else {
      alert(message)
    }
  }
})
