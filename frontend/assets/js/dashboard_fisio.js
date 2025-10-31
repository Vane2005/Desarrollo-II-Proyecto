// ===============================
// DASHBOARD FISIO JS COMPLETO
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "http://localhost:8000"
  const PACIENTE_API_URL = `${API_URL}/paciente`
  const AUTH_API_URL = `${API_URL}/auth`

  const navItems = document.querySelectorAll(".nav-item")
  const sections = document.querySelectorAll(".content-section")
  const sectionTitle = document.getElementById("section-title")
  const logoutBtn = document.querySelector(".btn-logout")
  const toggleSidebarBtn = document.getElementById("toggleSidebar")
  const sidebar = document.getElementById("sidebar")

  const sectionTitles = {
    "informacion-personal": "Información Personal",
    "asignar-ejercicios": "Asignar Ejercicios",
    "avance-paciente": "Avance Paciente",
  }

  // === Toggle Sidebar ===
  toggleSidebarBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed")
  })

  // === Navegación entre secciones ===
  navItems.forEach((item) => {
    item.addEventListener("click", function () {
      const targetSection = this.getAttribute("data-section")
      navItems.forEach((nav) => nav.classList.remove("active"))
      sections.forEach((section) => section.classList.remove("active"))

      this.classList.add("active")
      document.getElementById(targetSection).classList.add("active")
      sectionTitle.textContent = sectionTitles[targetSection]
    })
  })

  // === Logout ===
  logoutBtn.addEventListener("click", async () => {
    if (!confirm("¿Desea cerrar sesión?")) return

    try {
      localStorage.removeItem("token")
      localStorage.removeItem("tipo_usuario")
      localStorage.removeItem("nombre")
      localStorage.removeItem("cedula")
    } catch (e) {
      console.warn("Error limpiando localStorage al cerrar sesión", e)
    }
    window.location.replace("index.html")
  })

  // ==========================================
  // CARGAR INFORMACIÓN DEL FISIOTERAPEUTA
  // ==========================================
  async function cargarInfoFisioterapeuta() {
    const token = localStorage.getItem("token")
    if (!token) {
      console.error("No hay token de autenticación")
      clearSessionAndRedirect()
      return
    }

    try {
      const response = await fetch(`${AUTH_API_URL}/info-fisioterapeuta`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          console.error("Token inválido o expirado")
          clearSessionAndRedirect()
          return
        }
        throw new Error("Error al obtener información del fisioterapeuta")
      }

      const data = await response.json()

      // Llenar los campos del formulario
      document.getElementById("inputNombre").value = data.nombre
      document.getElementById("inputDocumento").value = data.cedula
      document.getElementById("inputCorreo").value = data.correo
      document.getElementById("inputTelefono").value = data.telefono

      // Mostrar/ocultar botón de pago según el estado
      const btnRealizarPago = document.getElementById("btnRealizarPago")
      if (data.estado.toLowerCase() === "inactivo") {
        btnRealizarPago.style.display = "inline-block"
      } else {
        btnRealizarPago.style.display = "none"
      }
    } catch (error) {
      console.error("Error al cargar información:", error)
      clearSessionAndRedirect()
    }
  }

  function clearSessionAndRedirect() {
    // Clear all authentication data
    localStorage.removeItem("token")
    localStorage.removeItem("tipo_usuario")
    localStorage.removeItem("nombre")
    localStorage.removeItem("cedula")

    // Redirect to login page
    window.location.replace("index.html")
  }

  // Cargar información al iniciar
  cargarInfoFisioterapeuta()

  // ==========================================
  // BOTÓN REALIZAR PAGO
  // ==========================================
  const btnRealizarPago = document.getElementById("btnRealizarPago")
  if (btnRealizarPago) {
    btnRealizarPago.addEventListener("click", () => {
      const cedula = document.getElementById("inputDocumento").value
      const email = document.getElementById("inputCorreo").value

      // Guardar datos para el proceso de pago
      localStorage.setItem("cedula_pendiente", cedula)
      localStorage.setItem("userEmail", email)

      // Redirigir a página de pago
      window.location.href = "pago.html"
    })
  }

  // ==========================================
  // MODAL CAMBIAR CONTRASEÑA
  // ==========================================
  const btnChangePassword = document.getElementById("btnChangePassword")
  const changePasswordModal = document.getElementById("changePasswordModal")
  const closePasswordModal = document.getElementById("closePasswordModal")
  const cancelPasswordChange = document.getElementById("cancelPasswordChange")
  const changePasswordForm = document.getElementById("changePasswordForm")
  const passwordMessage = document.getElementById("passwordMessage")

  // Abrir modal
  btnChangePassword.addEventListener("click", () => {
    changePasswordModal.classList.add("active")
    changePasswordForm.reset()
    passwordMessage.classList.remove("visible")
  })

  // Cerrar modal
  function closeModal() {
    changePasswordModal.classList.remove("active")
    changePasswordForm.reset()
    passwordMessage.classList.remove("visible")
  }

  closePasswordModal.addEventListener("click", closeModal)
  cancelPasswordChange.addEventListener("click", closeModal)

  // Cerrar modal al hacer clic fuera
  changePasswordModal.addEventListener("click", (e) => {
    if (e.target === changePasswordModal) {
      closeModal()
    }
  })

  // Validar contraseñas en tiempo real
  document.getElementById("confirmPassword").addEventListener("input", function () {
    const newPassword = document.getElementById("newPassword").value
    const confirmPassword = this.value

    if (confirmPassword && newPassword !== confirmPassword) {
      this.setCustomValidity("Las contraseñas no coinciden")
      this.style.borderColor = "#ff4444"
    } else {
      this.setCustomValidity("")
      this.style.borderColor = ""
    }
  })

  // Enviar cambio de contraseña
  changePasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const currentPassword = document.getElementById("currentPassword").value
    const newPassword = document.getElementById("newPassword").value
    const confirmPassword = document.getElementById("confirmPassword").value

    // Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
      mostrarMensaje("error", "Las contraseñas no coinciden")
      return
    }

    // Validar longitud mínima
    if (newPassword.length < 8) {
      mostrarMensaje("error", "La nueva contraseña debe tener al menos 8 caracteres")
      return
    }

    const token = localStorage.getItem("token")
    if (!token) {
      mostrarMensaje("error", "No hay sesión activa")
      return
    }

    // Deshabilitar botón
    const submitBtn = changePasswordForm.querySelector('button[type="submit"]')
    submitBtn.disabled = true
    submitBtn.textContent = "Cambiando..."

    try {
      const response = await fetch(`${AUTH_API_URL}/cambiar-contrasena`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contrasena_actual: currentPassword,
          nueva_contrasena: newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || "Error al cambiar la contraseña")
      }

      mostrarMensaje("success", `✅ ${data.mensaje}<br>Se ha enviado una notificación a tu correo.`)

      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        closeModal()
      }, 2000)
    } catch (error) {
      console.error("Error al cambiar contraseña:", error)
      mostrarMensaje("error", error.message)
    } finally {
      submitBtn.disabled = false
      submitBtn.textContent = "Cambiar Contraseña"
    }
  })

  function mostrarMensaje(tipo, contenido) {
    passwordMessage.className = `form-message ${tipo} visible`
    passwordMessage.innerHTML = contenido
  }

  // ==========================================
  // BUSCAR PACIENTE POR CÉDULA
  // ==========================================
  const btnBuscar = document.getElementById("btnBuscarCedula")
  if (btnBuscar) {
    btnBuscar.addEventListener("click", async () => {
      const cedula = document.getElementById("cedulaInput").value.trim()
      if (!cedula) return alert("Por favor ingrese una cédula")

      try {
        const res = await fetch(`${PACIENTE_API_URL}/${cedula}`)
        console.log("FETCH /paciente status:", res.status)
        const text = await res.text()
        console.log("FETCH /paciente body (raw):", text)

        if (!res.ok) {
          try {
            const errJson = JSON.parse(text)
            alert("No encontrado: " + (errJson.detail || JSON.stringify(errJson)))
          } catch (e) {
            alert("No encontrado (status " + res.status + ")")
          }
          document.getElementById("infoPaciente").style.display = "none"
          return
        }

        const data = JSON.parse(text)
        document.getElementById("infoPaciente").style.display = "block"
        document.getElementById("pacienteNombre").textContent = data.nombre
        document.getElementById("pacienteCorreo").textContent = data.correo
        window.pacienteCedula = cedula
        console.log("Paciente encontrado:", data)
      } catch (error) {
        console.error("Error fetch paciente:", error)
        alert("❌ Error de conexión con el servidor")
        document.getElementById("infoPaciente").style.display = "none"
      }
    })
  }

  // ==========================================
  // CARGAR EJERCICIOS DISPONIBLES
  // ==========================================
  async function cargarEjercicios() {
    try {
      const res = await fetch(`${PACIENTE_API_URL}/ejercicios`)
      const ejercicios = await res.json()

      const container = document.getElementById("exercisesGrid")
      container.innerHTML = ""

      ejercicios.forEach((e) => {
        const card = document.createElement("div")
        card.classList.add("exercise-card")
        card.innerHTML = `
          <label class="exercise-item">
            <input type="checkbox" class="exercise-checkbox" value="${e.id_ejercicio}">
            ${
              e.url_video
                ? `
              <div class="exercise-video">
                <video width="100%" style="border-radius: 8px 8px 0 0; max-height: 250px;">
                  <source src="${e.url_video}" type="video/mp4">
                  Tu navegador no soporta el elemento de video.
                </video>
              </div>
            `
                : `
              <div class="exercise-image-placeholder">
                <span>📹</span>
              </div>
            `
            }
            <div class="exercise-content">
              <h3 class="exercise-title">${e.nombre}</h3>
              <span class="exercise-category">${e.extremidad}</span>
              <p class="exercise-description">${e.descripcion}</p>
              <div class="exercise-details">
                <span><strong>Repeticiones:</strong> ${e.repeticiones || "N/A"}</span>
              </div>
            </div>
          </label>
        `
        container.appendChild(card)
      })
    } catch (err) {
      console.error("Error cargando ejercicios:", err)
    }
  }

  cargarEjercicios()

  // ==========================================
  // ASIGNAR EJERCICIOS A PACIENTE
  // ==========================================
  const assignBtn = document.getElementById("assignSelectedExercises")
  if (assignBtn) {
    assignBtn.addEventListener("click", async () => {
      if (!window.pacienteCedula) {
        alert("Primero busque un paciente por cédula.")
        return
      }

      const seleccionados = Array.from(document.querySelectorAll(".exercise-checkbox:checked")).map((cb) =>
        Number.parseInt(cb.value),
      )

      if (seleccionados.length === 0) {
        alert("Seleccione al menos un ejercicio.")
        return
      }

      console.log("✅ Ejercicios seleccionados:", seleccionados)

      try {
        const res = await fetch(`${PACIENTE_API_URL}/asignar-ejercicio`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cedula_paciente: window.pacienteCedula,
            ejercicios: seleccionados,
          }),
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.detail || "Error desconocido")

        alert("✅ Ejercicios asignados correctamente")
        document.querySelectorAll(".exercise-checkbox:checked").forEach((cb) => (cb.checked = false))
      } catch (error) {
        console.error("❌ Error al asignar ejercicios:", error)
        alert("❌ Error al asignar ejercicios")
      }
    })
  }

  // ==========================================
  // AVANCE PACIENTE - BUSCAR POR CÉDULA
  // ==========================================

  async function calcularAvancePaciente(cedula) {
    try {
      // Fetch patient info
      const pacienteRes = await fetch(`${PACIENTE_API_URL}/${cedula}`)
      if (!pacienteRes.ok) {
        throw new Error("Paciente no encontrado")
      }
      const pacienteData = await pacienteRes.json()

      // Fetch completed therapies
      const completadosRes = await fetch(`${PACIENTE_API_URL}/ejercicios-completados/${cedula}`)
      const completados = await completadosRes.json()
      const numCompletados = Array.isArray(completados) ? completados.length : 0

      // Fetch pending therapies
      const asignadosRes = await fetch(`${PACIENTE_API_URL}/ejercicios-asignados/${cedula}`)
      const asignados = await asignadosRes.json()
      const numAsignados = Array.isArray(asignados) ? asignados.length : 0

      // Calculate total and percentage
      const totalTerapias = numCompletados + numAsignados
      const porcentaje = totalTerapias > 0 ? Math.round((numCompletados / totalTerapias) * 100) : 0

      return {
        cedula: cedula,
        nombre: pacienteData.nombre,
        porcentaje: porcentaje,
        completados: numCompletados,
        pendientes: numAsignados,
        total: totalTerapias,
      }
    } catch (error) {
      console.error("Error calculando avance:", error)
      throw error
    }
  }

  function mostrarAvancePaciente(pacienteInfo) {
    const container = document.getElementById("patientProgressList")

    const progressItem = document.createElement("div")
    progressItem.classList.add("patient-progress-item")
    progressItem.innerHTML = `
      <div class="progress-info">
        <p class="patient-name">${pacienteInfo.nombre}</p>
        <p class="progress-label">
          Avance: <span class="progress-percentage">${pacienteInfo.porcentaje}%</span>
          <span style="font-size: 0.9em; color: #666; margin-left: 10px;">
            (${pacienteInfo.completados} completados / ${pacienteInfo.total} total)
          </span>
        </p>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${pacienteInfo.porcentaje}%"></div>
      </div>
      <div class="patient-actions">
        <button class="btn-action btn-details" data-cedula="${pacienteInfo.cedula}">Ver Detalles</button>
        <button class="btn-action btn-edit-paciente" data-cedula="${pacienteInfo.cedula}">Editar Paciente</button>
        <button class="btn-action btn-disable" data-cedula="${pacienteInfo.cedula}">Inhabilitar Paciente</button>
      </div>
    `

    container.appendChild(progressItem)
  }

  const btnBuscarAvance = document.getElementById("btnBuscarAvance")
  if (btnBuscarAvance) {
    btnBuscarAvance.addEventListener("click", async () => {
      const cedula = document.getElementById("cedulaAvanceInput").value.trim()
      if (!cedula) {
        alert("Por favor ingrese una cédula")
        return
      }

      const container = document.getElementById("patientProgressList")
      container.innerHTML = '<p style="text-align: center; color: #666;">Cargando...</p>'

      try {
        const pacienteInfo = await calcularAvancePaciente(cedula)
        container.innerHTML = ""
        mostrarAvancePaciente(pacienteInfo)
      } catch (error) {
        console.error("Error buscando paciente:", error)
        container.innerHTML =
          '<p style="text-align: center; color: #ff4444;">❌ Paciente no encontrado o sin terapias asignadas</p>'
      }
    })
  }

  const btnMostrarTodos = document.getElementById("btnMostrarTodos")
  if (btnMostrarTodos) {
    btnMostrarTodos.addEventListener("click", async () => {
      const container = document.getElementById("patientProgressList")
      container.innerHTML = '<p style="text-align: center; color: #666;">Cargando todos los pacientes...</p>'

      try {
        // Fetch all patients from backend
        const response = await fetch(`${PACIENTE_API_URL}/todos`)
        if (!response.ok) {
          throw new Error("Error al obtener lista de pacientes")
        }

        const pacientes = await response.json()

        if (!Array.isArray(pacientes) || pacientes.length === 0) {
          container.innerHTML = '<p style="text-align: center; color: #666;">No hay pacientes registrados</p>'
          return
        }

        container.innerHTML = ""

        // Calculate and display progress for each patient
        for (const paciente of pacientes) {
          try {
            const pacienteInfo = await calcularAvancePaciente(paciente.cedula)
            mostrarAvancePaciente(pacienteInfo)
          } catch (error) {
            console.error(`Error calculando avance para paciente ${paciente.cedula}:`, error)
            // Continue with next patient even if one fails
          }
        }

        if (container.children.length === 0) {
          container.innerHTML =
            '<p style="text-align: center; color: #666;">No se pudo cargar información de pacientes</p>'
        }
      } catch (error) {
        console.error("Error mostrando todos los pacientes:", error)
        container.innerHTML =
          '<p style="text-align: center; color: #ff4444;">❌ Error al cargar la lista de pacientes</p>'
      }
    })
  }
})
