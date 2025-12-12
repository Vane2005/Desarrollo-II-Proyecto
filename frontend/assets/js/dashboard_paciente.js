const ejercicios = []
const ejerciciosAsignados = []
const ejerciciosRealizados = []
let historialTerapias = []
let resumenGrupos = []
let gruposEjerciciosAsignados = [] // Nueva variable para ejercicios por grupos
const filtroGrupoActual = "Todos"

let filtroActual = "Todos"
let filtroRealizadosActual = "Todos"
let filtroAllExercisesActual = "Todos" // Nuevo filtro

const API_URL = "http://localhost:8000/paciente"
const AUTH_API_URL = "http://localhost:8000/auth"

// Inicializar
document.addEventListener("DOMContentLoaded", () => {
  initSidebar()
  initNavigation()
  cargarInfoPaciente() // NUEVO: Cargar información del paciente
  initCambiarContrasena() // NUEVO: Inicializar modal de cambio de contraseña
  initEditarPerfil() // Added profile editing initialization
  initCalificacionModal() // Inicializar modal de calificación
  cargarHistorialTerapias()
  cargarResumenGrupos()
  cargarGruposEjerciciosAsignados() // Cargar ejercicios por grupos
  cargarFiltrosAllExercises() // Filtros para todos los ejercicios
  cargarEjerciciosAsignadosDesdeAPI()
  cargarFiltrosRealizados()
  cargarEjerciciosRealizadosDesdeAPI()
})

async function cargarGruposEjerciciosAsignados() {
  const cedula = localStorage.getItem("cedula") || localStorage.getItem("usuario_id")

  if (!cedula) {
    console.error("No se encontró la cédula del paciente")
    return
  }

  try {
    console.log(`📚 Cargando ejercicios asignados por grupos para: ${cedula}`)

    const response = await fetch(`${API_URL}/ejercicios-asignados-por-grupo/${cedula}`)

    if (!response.ok) {
      throw new Error(`Error al cargar ejercicios: ${response.status}`)
    }

    const data = await response.json()

    gruposEjerciciosAsignados = data.grupos || []
    console.log("Grupos de ejercicios asignados:", gruposEjerciciosAsignados)

    mostrarGruposEjerciciosAsignados()
  } catch (error) {
    console.error("Error al cargar grupos de ejercicios asignados:", error)
  }
}

function mostrarGruposEjerciciosAsignados() {
  const container = document.getElementById("gruposEjerciciosAsignados")
  const noMessage = document.getElementById("noEjerciciosAsignados")

  if (gruposEjerciciosAsignados.length === 0) {
    container.style.display = "none"
    noMessage.style.display = "block"
    return
  }

  container.style.display = "grid"
  noMessage.style.display = "none"

  let html = ""

  gruposEjerciciosAsignados.forEach((grupo) => {
    html += `
      <div class="grupo-ejercicios-section" role="listitem">
        <div class="grupo-header-asignados">
          <h4>Grupo de Terapia #${grupo.grupo_terapia}</h4>
          <span class="ejercicios-count">${grupo.ejercicios.length} ejercicio(s)</span>
        </div>
        <div class="ejercicios-en-grupo">
    `

    grupo.ejercicios.forEach((ejercicio) => {
      html += `
        <div class="exercise-card-asignado">
          ${
            ejercicio.url_video
              ? `
            <div class="exercise-video">
              <video controls width="100%" style="border-radius: 8px 8px 0 0;">
                <source src="${ejercicio.url_video}" type="video/mp4">
                Tu navegador no soporta video
              </video>
            </div>
          `
              : `
            <div class="exercise-image">
              <img src="/--ejercicio-nombre-.jpg" alt="${ejercicio.nombre}">
            </div>
          `
          }
          <div class="exercise-content">
            <h5>${ejercicio.nombre}</h5>
            <span class="exercise-category">${ejercicio.extremidad}</span>
            <p class="exercise-description">${ejercicio.descripcion}</p>
            <div class="exercise-details">
              <span><strong>Repeticiones:</strong> ${ejercicio.repeticiones}</span>
              <span><strong>Estado:</strong> ${ejercicio.estado}</span>
            </div>
            <button onclick="marcarComoRealizado(${ejercicio.id_terapia})" 
                    class="btn-marcar-realizado"
                    style="margin-top: 12px; padding: 8px 16px; background: #667eea; 
                           color: white; border: none; border-radius: 6px; cursor: pointer; 
                           font-weight: 500; transition: all 0.3s;">
              Marcar como Realizado
            </button>
          </div>
        </div>
      `
    })

    html += `
        </div>
      </div>
    `
  })

  container.innerHTML = html
}

async function cargarHistorialTerapias() {
  const cedula = localStorage.getItem("cedula") || localStorage.getItem("usuario_id")

  if (!cedula) {
    console.error("No se encontró la cédula del paciente")
    return
  }

  try {
    console.log(`📊 Cargando historial de terapias para: ${cedula}`)

    const response = await fetch(`${API_URL}/historial-terapias/${cedula}`)

    if (!response.ok) {
      throw new Error(`Error al cargar historial: ${response.status}`)
    }

    const data = await response.json()

    historialTerapias = data.historial || []
    console.log("Historial de terapias:", historialTerapias)

    mostrarHistorialTerapias()
  } catch (error) {
    console.error("Error al cargar historial de terapias:", error)
  }
}

async function cargarResumenGrupos() {
  const cedula = localStorage.getItem("cedula") || localStorage.getItem("usuario_id")

  if (!cedula) {
    console.error("No se encontró la cédula del paciente")
    return
  }

  try {
    console.log(`📈 Cargando resumen de grupos para: ${cedula}`)

    const response = await fetch(`${API_URL}/resumen-grupos/${cedula}`)

    if (!response.ok) {
      throw new Error(`Error al cargar resumen: ${response.status}`)
    }

    const data = await response.json()

    resumenGrupos = data.grupos || []
    console.log("Resumen de grupos:", resumenGrupos)

    mostrarResumenGrupos()
  } catch (error) {
    console.error("Error al cargar resumen de grupos:", error)
  }
}

function mostrarResumenGrupos() {
  const container = document.getElementById("gruposContainer")
  const noMessage = document.getElementById("noGruposMessage")

  if (resumenGrupos.length === 0) {
    container.style.display = "none"
    noMessage.style.display = "block"
    return
  }

  container.style.display = "grid"
  noMessage.style.display = "none"

  container.innerHTML = resumenGrupos
    .map(
      (grupo) => `
        <div class="grupo-card" role="listitem">
            <div class="grupo-header">
                <h4>Grupo de Terapia #${grupo.grupo_terapia}</h4>
                <span class="grupo-status ${grupo.estado.toLowerCase()}">${grupo.estado}</span>
            </div>
            <div class="grupo-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${grupo.progreso_porcentaje}%"></div>
                </div>
                <p class="progress-text">${grupo.completados} de ${grupo.total_ejercicios} completados (${grupo.progreso_porcentaje}%)</p>
            </div>
            <div class="grupo-info">
                <span>Inicio: ${grupo.fecha_inicio || "N/A"}</span>
                ${grupo.fecha_fin ? `<span>Fin: ${grupo.fecha_fin}</span>` : ""}
            </div>
        </div>
    `,
    )
    .join("")
}

function mostrarHistorialTerapias() {
  const container = document.getElementById("historialLista")
  const noMessage = document.getElementById("noHistorialMessage")

  if (historialTerapias.length === 0) {
    container.style.display = "none"
    noMessage.style.display = "block"
    return
  }

  container.style.display = "grid"
  noMessage.style.display = "none"

  // Agrupar por grupo de terapia
  const agrupados = {}
  historialTerapias.forEach((terapia) => {
    const grupo = terapia.grupo_terapia
    if (!agrupados[grupo]) {
      agrupados[grupo] = []
    }
    agrupados[grupo].push(terapia)
  })

  // Mostrar agrupados
  let html = ""
  Object.keys(agrupados)
    .sort((a, b) => b - a)
    .forEach((grupoNum) => {
      const terapias = agrupados[grupoNum]
      html += `
        <div class="grupo-terapias-section" role="listitem">
            <h4 class="grupo-titulo">Grupo de Terapia #${grupoNum}</h4>
            <div class="terapias-en-grupo">
    `

      terapias.forEach((terapia) => {
        html += `
          <div class="historial-item">
              <div class="historial-content">
                  <h5>${terapia.nombre}</h5>
                  <p><strong>Extremidad:</strong> ${terapia.extremidad}</p>
                  <p><strong>Repeticiones:</strong> ${terapia.repeticiones}</p>
                  <p><strong>Fecha realización:</strong> ${formatearFecha(terapia.fecha_realizacion)}</p>
                  ${terapia.observaciones ? `<p><strong>Observaciones:</strong> ${terapia.observaciones}</p>` : ""}
              </div>
              ${
                terapia.url_video
                  ? `
              <div class="historial-video">
                  <video width="150" height="100" controls style="border-radius: 6px;">
                      <source src="${terapia.url_video}" type="video/mp4">
                      Tu navegador no soporta video
                  </video>
              </div>
            `
                  : ""
              }
          </div>
        `
      })

      html += `
            </div>
        </div>
      `
    })

  container.innerHTML = html
}

function initEditarPerfil() {
  const btnEditProfile = document.getElementById("btnEditProfilePaciente")
  const btnSaveProfile = document.getElementById("btnSaveProfilePaciente")
  const btnCancelEdit = document.getElementById("btnCancelEditPaciente")
  const profileActions = document.getElementById("profileActionsPaciente")

  let originalProfileData = {}

  btnEditProfile.addEventListener("click", () => {
    limpiarErroresPerfil()

    // Save original data
    originalProfileData = {
      nombre: document.getElementById("inputNombrePaciente").value,
      correo: document.getElementById("inputCorreoPaciente").value,
      telefono: document.getElementById("inputTelefonoPaciente").value,
    }

    // Enable editing
    const nombreInput = document.getElementById("inputNombrePaciente")
    const correoInput = document.getElementById("inputCorreoPaciente")
    const telefonoInput = document.getElementById("inputTelefonoPaciente")

    nombreInput.removeAttribute("readonly")
    correoInput.removeAttribute("readonly")
    telefonoInput.removeAttribute("readonly")

    nombreInput.setAttribute("aria-readonly", "false")
    correoInput.setAttribute("aria-readonly", "false")
    telefonoInput.setAttribute("aria-readonly", "false")

    // Add editing styles
    nombreInput.style.borderColor = "#667eea"
    correoInput.style.borderColor = "#667eea"
    telefonoInput.style.borderColor = "#667eea"

    // Show save/cancel buttons
    profileActions.style.display = "block"
    btnEditProfile.style.display = "none"

    nombreInput.focus()
  })

  btnCancelEdit.addEventListener("click", () => {
    // Restore original data
    document.getElementById("inputNombrePaciente").value = originalProfileData.nombre
    document.getElementById("inputCorreoPaciente").value = originalProfileData.correo
    document.getElementById("inputTelefonoPaciente").value = originalProfileData.telefono

    limpiarErroresPerfil()

    // Disable editing
    cancelProfileEdit()
  })

  btnSaveProfile.addEventListener("click", async () => {
    limpiarErroresPerfil()
    ocultarMensajeExitoPerfil()

    const nombre = document.getElementById("inputNombrePaciente").value.trim()
    const correo = document.getElementById("inputCorreoPaciente").value.trim()
    const telefono = document.getElementById("inputTelefonoPaciente").value.trim()

    const errores = []

    if (!nombre) {
      errores.push({
        campo: "inputNombrePaciente",
        mensaje: "El nombre completo es obligatorio. Por favor ingrese su nombre.",
      })
    } else if (nombre.length < 3) {
      errores.push({
        campo: "inputNombrePaciente",
        mensaje: "El nombre debe tener al menos 3 caracteres. Por favor ingrese un nombre válido.",
      })
    }

    if (!correo) {
      errores.push({
        campo: "inputCorreoPaciente",
        mensaje: "El correo electrónico es obligatorio. Por favor ingrese su correo.",
      })
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(correo)) {
        errores.push({
          campo: "inputCorreoPaciente",
          mensaje: "El correo electrónico no es válido. Use el formato: usuario@ejemplo.com",
        })
      }
    }

    if (!telefono) {
      errores.push({
        campo: "inputTelefonoPaciente",
        mensaje: "El teléfono es obligatorio. Por favor ingrese su número de teléfono.",
      })
    } else if (!/^\d{7,10}$/.test(telefono)) {
      errores.push({
        campo: "inputTelefonoPaciente",
        mensaje: "El teléfono debe contener entre 7 y 10 dígitos numéricos. Ejemplo: 3001234567",
      })
    }

    if (errores.length > 0) {
      mostrarErroresPerfil(errores)
      // Focus first error field
      document.getElementById(errores[0].campo).focus()
      return
    }

    const token = localStorage.getItem("token")
    if (!token) {
      mostrarErroresPerfil([
        {
          campo: "inputNombrePaciente",
          mensaje: "No hay sesión activa. Por favor inicie sesión nuevamente.",
        },
      ])
      return
    }

    // Disable button
    btnSaveProfile.disabled = true
    btnSaveProfile.textContent = "Guardando..."

    try {
      const response = await fetch(`${API_URL}/actualizar-perfil`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: nombre,
          correo: correo,
          telefono: telefono,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || "Error al actualizar el perfil")
      }

      mostrarMensajeExitoPerfil("Perfil actualizado correctamente")

      cancelProfileEdit()

      // Reload profile data
      await cargarInfoPaciente()
    } catch (error) {
      console.error("Error al actualizar perfil:", error)
      mostrarErroresPerfil([
        {
          campo: "inputNombrePaciente",
          mensaje: `Error al guardar: ${error.message}. Por favor intente nuevamente.`,
        },
      ])
    } finally {
      btnSaveProfile.disabled = false
      btnSaveProfile.textContent = "Guardar Cambios"
    }
  })

  function cancelProfileEdit() {
    const nombreInput = document.getElementById("inputNombrePaciente")
    const correoInput = document.getElementById("inputCorreoPaciente")
    const telefonoInput = document.getElementById("inputTelefonoPaciente")

    nombreInput.setAttribute("readonly", true)
    correoInput.setAttribute("readonly", true)
    telefonoInput.setAttribute("readonly", true)

    nombreInput.setAttribute("aria-readonly", "true")
    correoInput.setAttribute("aria-readonly", "true")
    telefonoInput.setAttribute("aria-readonly", "true")

    nombreInput.style.borderColor = ""
    correoInput.style.borderColor = ""
    telefonoInput.style.borderColor = ""

    profileActions.style.display = "none"
    btnEditProfile.style.display = "inline-block"
  }
}

function mostrarErroresPerfil(errores) {
  // Show error summary
  const errorSummary = document.getElementById("errorSummaryPerfil")
  const errorList = document.getElementById("errorListPerfil")

  errorList.innerHTML = errores
    .map((error) => `<li><a href="#${error.campo}" class="error-link">${error.mensaje}</a></li>`)
    .join("")

  errorSummary.style.display = "block"

  // Scroll to error summary
  errorSummary.scrollIntoView({ behavior: "smooth", block: "nearest" })

  // Display individual field errors
  errores.forEach((error) => {
    const input = document.getElementById(error.campo)
    const errorDiv = document.getElementById(`error${error.campo.replace("input", "")}`)

    if (input && errorDiv) {
      input.setAttribute("aria-invalid", "true")
      input.classList.add("input-error")
      errorDiv.textContent = error.mensaje
      errorDiv.style.display = "block"
    }
  })
}

function limpiarErroresPerfil() {
  // Hide error summary
  const errorSummary = document.getElementById("errorSummaryPerfil")
  if (errorSummary) {
    errorSummary.style.display = "none"
  }

  // Clear individual field errors
  const campos = ["inputNombrePaciente", "inputCorreoPaciente", "inputTelefonoPaciente"]
  campos.forEach((campoId) => {
    const input = document.getElementById(campoId)
    const errorDiv = document.getElementById(`error${campoId.replace("input", "")}`)

    if (input) {
      input.setAttribute("aria-invalid", "false")
      input.classList.remove("input-error")
    }

    if (errorDiv) {
      errorDiv.textContent = ""
      errorDiv.style.display = "none"
    }
  })
}

function mostrarMensajeExitoPerfil(mensaje) {
  const successBox = document.getElementById("successMessagePerfil")
  const successText = document.getElementById("successTextPerfil")

  if (successBox && successText) {
    successText.textContent = mensaje
    successBox.style.display = "flex"

    // Auto-hide after 5 seconds
    setTimeout(() => {
      ocultarMensajeExitoPerfil()
    }, 5000)
  }
}

function ocultarMensajeExitoPerfil() {
  const successBox = document.getElementById("successMessagePerfil")
  if (successBox) {
    successBox.style.display = "none"
  }
}

async function cargarInfoPaciente() {
  const cedula = localStorage.getItem("cedula") || localStorage.getItem("usuario_id")

  if (!cedula) {
    console.error("No se encontró la cédula del paciente")
    alert("Error: No se pudo cargar la información del paciente")
    return
  }

  try {
    console.log(`📋 Cargando información del paciente: ${cedula}`)

    const response = await fetch(`${API_URL}/solo/${cedula}`);


    if (!response.ok) {
      throw new Error(`Error al obtener información: ${response.status}`)
    }

    const data = await response.json()

    console.log("Información del paciente cargada:", data)

    // Llenar los campos del formulario
    document.getElementById("inputNombrePaciente").value = data.nombre || "N/A"
    document.getElementById("inputDocumentoPaciente").value = cedula
    document.getElementById("inputCorreoPaciente").value = data.correo || "N/A"
    document.getElementById("inputTelefonoPaciente").value = data.telefono || "N/A"
  } catch (error) {
    console.error("Error al cargar información del paciente:", error)
    alert("Error al cargar tu información. Por favor, inicia sesión nuevamente.")
  }
}

function initCambiarContrasena() {
  const btnChangePassword = document.getElementById("btnChangePasswordPaciente")
  const changePasswordModal = document.getElementById("changePasswordModalPaciente")
  const closePasswordModal = document.getElementById("closePasswordModalPaciente")
  const cancelPasswordChange = document.getElementById("cancelPasswordChangePaciente")
  const changePasswordForm = document.getElementById("changePasswordFormPaciente")
  const passwordMessage = document.getElementById("passwordMessagePaciente")

  // Abrir modal
  btnChangePassword.addEventListener("click", () => {
    changePasswordModal.classList.add("active")
    changePasswordModal.setAttribute("aria-hidden", "false")
    changePasswordForm.reset()
    limpiarErroresPassword()
    passwordMessage.classList.remove("visible")

    document.getElementById("currentPasswordPaciente").focus()
  })

  // Cerrar modal
  function closeModal() {
    changePasswordModal.classList.remove("active")
    changePasswordModal.setAttribute("aria-hidden", "true")
    changePasswordForm.reset()
    limpiarErroresPassword()
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

  document.getElementById("newPasswordPaciente").addEventListener("input", function () {
    const errorDiv = document.getElementById("errorNewPassword")

    if (this.value && this.value.length < 8) {
      this.setAttribute("aria-invalid", "true")
      this.classList.add("input-error")
      errorDiv.textContent = "La contraseña debe tener al menos 8 caracteres"
      errorDiv.style.display = "block"
    } else {
      this.setAttribute("aria-invalid", "false")
      this.classList.remove("input-error")
      errorDiv.textContent = ""
      errorDiv.style.display = "none"
    }
  })

  document.getElementById("confirmPasswordPaciente").addEventListener("input", function () {
    const newPassword = document.getElementById("newPasswordPaciente").value
    const errorDiv = document.getElementById("errorConfirmPassword")

    if (this.value && newPassword !== this.value) {
      this.setAttribute("aria-invalid", "true")
      this.classList.add("input-error")
      errorDiv.textContent = "Las contraseñas no coinciden. Por favor verifique."
      errorDiv.style.display = "block"
    } else {
      this.setAttribute("aria-invalid", "false")
      this.classList.remove("input-error")
      errorDiv.textContent = ""
      errorDiv.style.display = "none"
    }
  })

  // Enviar cambio de contraseña
  changePasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    limpiarErroresPassword()

    const currentPassword = document.getElementById("currentPasswordPaciente").value
    const newPassword = document.getElementById("newPasswordPaciente").value
    const confirmPassword = document.getElementById("confirmPasswordPaciente").value

    const errores = []

    if (!currentPassword) {
      errores.push({
        campo: "currentPasswordPaciente",
        mensaje: "La contraseña actual es obligatoria. Por favor ingrésela.",
      })
    } else if (currentPassword.length < 4) {
      errores.push({
        campo: "currentPasswordPaciente",
        mensaje: "La contraseña actual debe tener al menos 4 caracteres.",
      })
    }

    if (!newPassword) {
      errores.push({
        campo: "newPasswordPaciente",
        mensaje: "La nueva contraseña es obligatoria. Por favor ingrésela.",
      })
    } else if (newPassword.length < 8) {
      errores.push({
        campo: "newPasswordPaciente",
        mensaje: "La nueva contraseña debe tener al menos 8 caracteres.",
      })
    }

    if (!confirmPassword) {
      errores.push({
        campo: "confirmPasswordPaciente",
        mensaje: "Debe confirmar la nueva contraseña. Por favor ingrésela nuevamente.",
      })
    } else if (newPassword !== confirmPassword) {
      errores.push({
        campo: "confirmPasswordPaciente",
        mensaje: "Las contraseñas no coinciden. Verifique que ambas sean iguales.",
      })
    }

    if (errores.length > 0) {
      mostrarErroresPassword(errores)
      document.getElementById(errores[0].campo).focus()
      return
    }

    const token = localStorage.getItem("token")
    if (!token) {
      mostrarMensajePassword("error", "No hay sesión activa. Por favor inicie sesión nuevamente.")
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

      mostrarMensajePassword("success", `✅ ${data.mensaje}<br>Se ha enviado una notificación a tu correo.`)

      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        closeModal()
      }, 2000)
    } catch (error) {
      console.error("Error al cambiar contraseña:", error)
      mostrarMensajePassword("error", `Error: ${error.message}. Por favor intente nuevamente.`)
    } finally {
      submitBtn.disabled = false
      submitBtn.textContent = "Cambiar Contraseña"
    }
  })
}

function mostrarErroresPassword(errores) {
  // Show error summary
  const errorSummary = document.getElementById("errorSummaryPassword")
  const errorList = document.getElementById("errorListPassword")

  errorList.innerHTML = errores
    .map((error) => `<li><a href="#${error.campo}" class="error-link">${error.mensaje}</a></li>`)
    .join("")

  errorSummary.style.display = "block"

  // Scroll to error summary
  errorSummary.scrollIntoView({ behavior: "smooth", block: "nearest" })

  // Display individual field errors
  errores.forEach((error) => {
    const input = document.getElementById(error.campo)
    const errorDiv = document.getElementById(`error${error.campo.replace("Paciente", "")}`)

    if (input && errorDiv) {
      input.setAttribute("aria-invalid", "true")
      input.classList.add("input-error")
      errorDiv.textContent = error.mensaje
      errorDiv.style.display = "block"
    }
  })
}

function limpiarErroresPassword() {
  // Hide error summary
  const errorSummary = document.getElementById("errorSummaryPassword")
  if (errorSummary) {
    errorSummary.style.display = "none"
  }

  // Clear individual field errors
  const campos = ["currentPasswordPaciente", "newPasswordPaciente", "confirmPasswordPaciente"]
  campos.forEach((campoId) => {
    const input = document.getElementById(campoId)
    const errorDiv = document.getElementById(`error${campoId.replace("Paciente", "")}`)

    if (input) {
      input.setAttribute("aria-invalid", "false")
      input.classList.remove("input-error")
    }

    if (errorDiv) {
      errorDiv.textContent = ""
      errorDiv.style.display = "none"
    }
  })
}

function mostrarMensajePassword(tipo, mensaje) {
  const passwordMessage = document.getElementById("passwordMessagePaciente")
  passwordMessage.textContent = mensaje
  passwordMessage.classList.add(tipo)
  passwordMessage.classList.remove(tipo === "success" ? "error" : "success")
  passwordMessage.classList.add("visible")
}

// ==========================================
// NAVEGACIÓN Y SIDEBAR
// ==========================================

function initSidebar() {
  const toggleBtn = document.getElementById("toggleSidebar")
  const sidebar = document.getElementById("sidebar")

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed")
    })
  }
}

function initNavigation() {
  const navItems = document.querySelectorAll(".nav-item")

  navItems.forEach((item) => {
    item.addEventListener("click", function () {
      const sectionId = this.getAttribute("data-section")
      cambiarSeccion(sectionId)
    })
  })
}

function cambiarSeccion(sectionId) {
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active")
  })
  document.querySelector(`[data-section="${sectionId}"]`).classList.add("active")

  document.querySelectorAll(".content-section").forEach((section) => {
    section.classList.remove("active")
  })
  document.getElementById(sectionId).classList.add("active")

  const titles = {
    "informacion-personal": "Información Personal",
    "ejercicios-asignados": "Ejercicios Asignados",
    "ejercicios-realizados": "Ejercicios Realizados",
    "historial-terapias": "Historial de Terapias",
    "resumen-grupos": "Resumen de Grupos",
  }
  document.getElementById("section-title").textContent = titles[sectionId]
}

// ==========================================
// EJERCICIOS ASIGNADOS - FILTRADO
// ==========================================

function cargarFiltrosAllExercises() {
  const filtersContainer = document.getElementById("filtersAllExercises")
  const extremidades = [
    "Todos",
    "Brazo",
    "Hombro",
    "Codo",
    "Muñeca",
    "Mano",
    "Pierna",
    "Rodilla",
    "Tobillo",
    "Pie",
    "Cervical",
    "Lumbar",
    "Tronco",
    "Cadera",
  ]

  filtersContainer.innerHTML = extremidades
    .map(
      (ext) => `
        <button class="filter-btn ${ext === "Todos" ? "active" : ""}" 
                onclick="filtrarTodosEjercicios('${ext}')">
          ${ext}
        </button>
      `,
    )
    .join("")
}

function filtrarTodosEjercicios(extremidad) {
  filtroAllExercisesActual = extremidad

  document.querySelectorAll("#filtersAllExercises .filter-btn").forEach((btn) => {
    btn.classList.remove("active")
    if (btn.textContent.trim() === extremidad) {
      btn.classList.add("active")
    }
  })

  cargarTodosEjercicios()
}

function cargarFiltros() {
  const filtersContainer = document.getElementById("filters")
  const extremidades = [
    "Todos",
    "Brazo",
    "Hombro",
    "Codo",
    "Muñeca",
    "Mano",
    "Pierna",
    "Rodilla",
    "Tobillo",
    "Pie",
    "Cervical",
    "Lumbar",
    "Tronco",
    "Cadera",
  ]

  filtersContainer.innerHTML = extremidades
    .map(
      (ext) => `
        <button class="filter-btn ${ext === "Todos" ? "active" : ""}" 
                onclick="filtrarEjerciciosAsignados('${ext}')">
          ${ext}
        </button>
      `,
    )
    .join("")
}

function filtrarEjerciciosAsignados(extremidad) {
  filtroActual = extremidad

  document.querySelectorAll("#filters .filter-btn").forEach((btn) => {
    btn.classList.remove("active")
    if (btn.textContent.trim() === extremidad) {
      btn.classList.add("active")
    }
  })

  cargarEjercicios()
}

async function cargarTodosEjercicios() {
  const grid = document.getElementById("exercisesGrid")
  const noResults = document.getElementById("noResults")

  const ejerciciosFiltrados =
    filtroAllExercisesActual === "Todos"
      ? ejerciciosAsignados
      : ejerciciosAsignados.filter((ej) => ej.extremidad === filtroAllExercisesActual)

  console.log(`🔍 Filtro activo: ${filtroAllExercisesActual}`)
  console.log(`📋 Ejercicios filtrados: ${ejerciciosFiltrados.length}`)

  if (ejerciciosFiltrados.length === 0) {
    grid.style.display = "none"
    noResults.style.display = "block"
    return
  }

  grid.style.display = "grid"
  noResults.style.display = "none"

  grid.innerHTML = ejerciciosFiltrados
    .map(
      (ejercicio) => `
        <div class="exercise-card">
            ${
              ejercicio.urlVideo
                ? `
              <div class="exercise-video">
                <video controls width="100%" style="border-radius: 8px 8px 0 0;">
                  <source src="${ejercicio.urlVideo}" type="video/mp4">
                  Tu navegador no soporta el elemento de video.
                </video>
              </div>
            `
                : `
              <div class="exercise-image">
                <img src="${ejercicio.imagen}" alt="${ejercicio.nombre}">
              </div>
            `
            }
            <div class="exercise-content">
                <h3 class="exercise-title">${ejercicio.nombre}</h3>
                <span class="exercise-category">${ejercicio.extremidad}</span>
                <p class="exercise-description">${ejercicio.descripcion}</p>
                <div class="exercise-details">
                    <span><strong>Repeticiones:</strong> ${ejercicio.repeticiones}</span>
                </div>
                <button onclick="marcarComoRealizado(${ejercicio.id_terapia})" 
                        style="margin-top: 12px; padding: 8px 16px; background: #667eea; 
                               color: white; border: none; border-radius: 6px; cursor: pointer; 
                               font-weight: 500; transition: all 0.3s;">
                    Marcar como Realizado
                </button>
            </div>
        </div>
    `,
    )
    .join("")
}

function cargarEjercicios() {
  // Esta función ahora se llama cargarTodosEjercicios()
  cargarTodosEjercicios()
}

async function cargarEjerciciosAsignadosDesdeAPI() {
  try {
    const cedula = localStorage.getItem("cedula") || localStorage.getItem("usuario_id")

    if (!cedula) {
      console.error("No se encontró la cédula del paciente")
      mostrarMensajeErrorAsignados("No se pudo identificar al paciente")
      return
    }

    const response = await fetch(`${API_URL}/ejercicios-asignados/${cedula}`)

    if (!response.ok) {
      throw new Error(`Error al cargar ejercicios: ${response.status}`)
    }

    const ejerciciosAsignadosAPI = await response.json()

    console.log("Ejercicios asignados recibidos:", ejerciciosAsignadosAPI)

    ejerciciosAsignados.length = 0
    ejerciciosAsignados.push(
      ...ejerciciosAsignadosAPI.map((ej) => ({
        id_terapia: ej.id_terapia,
        id_ejercicio: ej.id_ejercicio,
        nombre: ej.nombre,
        extremidad: ej.extremidad,
        descripcion: ej.descripcion,
        repeticiones: ej.repeticiones,
        urlVideo: ej.url_video,
        imagen: ej.url_video || "/placeholder.svg?height=200&width=300",
      })),
    )

    cargarTodosEjercicios()
  } catch (error) {
    console.error("Error al cargar ejercicios asignados:", error)
    mostrarMensajeErrorAsignados("Error al cargar los ejercicios asignados")
  }
}

// ==========================================
// EJERCICIOS REALIZADOS - FILTRADO
// ==========================================

function cargarFiltrosRealizados() {
  const filtersContainer = document.getElementById("filtersRealizados")
  const extremidades = [
    "Todos",
    "Brazo",
    "Hombro",
    "Codo",
    "Muñeca",
    "Mano",
    "Pierna",
    "Rodilla",
    "Tobillo",
    "Pie",
    "Cervical",
    "Lumbar",
    "Tronco",
    "Cadera",
  ]

  filtersContainer.innerHTML = extremidades
    .map(
      (ext) => `
        <button class="filter-btn ${ext === "Todos" ? "active" : ""}" 
                onclick="filtrarEjerciciosRealizados('${ext}')">
          ${ext}
        </button>
      `,
    )
    .join("")
}

function filtrarEjerciciosRealizados(extremidad) {
  filtroRealizadosActual = extremidad

  document.querySelectorAll("#filtersRealizados .filter-btn").forEach((btn) => {
    btn.classList.remove("active")
    if (btn.textContent.trim() === extremidad) {
      btn.classList.add("active")
    }
  })

  cargarEjerciciosRealizados()
}

function cargarEjerciciosRealizados() {
  const grid = document.getElementById("exercisesGridRealizados")
  const noResults = document.getElementById("noResultsRealizados")

  const ejerciciosFiltrados =
    filtroRealizadosActual === "Todos"
      ? ejerciciosRealizados
      : ejerciciosRealizados.filter((ej) => ej.extremidad === filtroRealizadosActual)

  if (ejerciciosFiltrados.length === 0) {
    grid.style.display = "none"
    noResults.style.display = "block"
    return
  }

  grid.style.display = "grid"
  noResults.style.display = "none"

  grid.innerHTML = ejerciciosFiltrados
    .map(
      (ejercicio) => `
        <div class="exercise-card completed">
            ${
              ejercicio.urlVideo
                ? `
              <div class="exercise-video">
                <video controls width="100%" style="border-radius: 8px 8px 0 0;">
                  <source src="${ejercicio.urlVideo}" type="video/mp4">
                  Tu navegador no soporta el elemento de video.
                </video>
              </div>
            `
                : `
              <div class="exercise-image">
                <img src="${ejercicio.imagen || "/placeholder.svg?height=200&width=300"}" alt="${ejercicio.nombre}">
                <div class="completed-badge">✓ Completado</div>
              </div>
            `
            }
            <div class="exercise-content">
                <h3 class="exercise-title">${ejercicio.nombre}</h3>
                <span class="exercise-category">${ejercicio.extremidad}</span>
                <p class="exercise-description">${ejercicio.descripcion}</p>
                <div class="exercise-details">
                    <span><strong>Repeticiones:</strong> ${ejercicio.repeticiones}</span>
                    <span><strong>Fecha:</strong> ${formatearFecha(ejercicio.fechaRealizacion)}</span>
                </div>
                ${
                  ejercicio.observaciones
                    ? `
                  <div class="exercise-observations">
                    <strong>Observaciones:</strong> ${ejercicio.observaciones}
                  </div>
                `
                    : ""
                }
            </div>
        </div>
    `,
    )
    .join("")
}

async function cargarEjerciciosRealizadosDesdeAPI() {
  try {
    const cedula = localStorage.getItem("cedula") || localStorage.getItem("usuario_id")

    if (!cedula) {
      console.error("No se encontró la cédula del paciente")
      mostrarMensajeError("No se pudo identificar al paciente")
      return
    }

    const response = await fetch(`${API_URL}/ejercicios-completados/${cedula}`)

    if (!response.ok) {
      throw new Error(`Error al cargar ejercicios: ${response.status}`)
    }

    const ejerciciosCompletados = await response.json()

    ejerciciosRealizados.length = 0
    ejerciciosRealizados.push(
      ...ejerciciosCompletados.map((ej) => ({
        id: ej.id_ejercicio,
        nombre: ej.nombre,
        extremidad: ej.extremidad,
        descripcion: ej.descripcion,
        repeticiones: ej.repeticiones,
        fechaRealizacion: ej.fecha_realizacion,
        completado: true,
        urlVideo: ej.url_video,
        observaciones: ej.observaciones,
      })),
    )

    cargarEjerciciosRealizados()
  } catch (error) {
    console.error("Error al cargar ejercicios completados:", error)
    mostrarMensajeError("Error al cargar los ejercicios completados")
  }
}

// ==========================================
// MARCAR COMO REALIZADO
// ==========================================

async function marcarComoRealizado(idTerapia) {
  try {
    const response = await fetch(`http://127.0.0.1:8000/paciente/marcar-realizado/${idTerapia}`, {
      method: "PUT",
    })

    if (!response.ok) {
      throw new Error(`Error al marcar como realizado (${response.status})`)
    }

    const data = await response.json()
    alert(data.message || "Ejercicio marcado como realizado")

    const boton = document.querySelector(`button[onclick="marcarComoRealizado(${idTerapia})"]`)
    if (boton) {
      boton.textContent = "✅ Completado"
      boton.style.background = "#2ecc71"
      boton.disabled = true
    }

    abrirModalCalificacion(idTerapia)

    await cargarGruposEjerciciosAsignados()
    await cargarEjerciciosAsignadosDesdeAPI()
    await cargarEjerciciosRealizadosDesdeAPI()
    await cargarResumenGrupos()
  } catch (error) {
    console.error("Error al marcar como realizado:", error)
    alert("No se pudo marcar el ejercicio como realizado")
  }
}

// ==========================================
// MODAL DE CALIFICACIÓN
// ==========================================

function initCalificacionModal() {
  const modal = document.getElementById("calificacionModalEjercicio")
  const closeBtn = document.getElementById("closeCalificacionModal")
  const cancelBtn = document.getElementById("cancelCalificacionBtn")
  const form = document.getElementById("calificacionForm")
  const observacionesInput = document.getElementById("observacionesInput")
  const charCount = document.getElementById("charCount")

  // Cerrar modal al hacer clic en X
  if (closeBtn) {
    closeBtn.addEventListener("click", () => cerrarModalCalificacion())
  }

  // Cerrar modal al hacer clic en Cancelar
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => cerrarModalCalificacion())
  }

  // Cerrar modal al hacer clic fuera de él
  if (modal) {
    window.addEventListener("click", (event) => {
      if (event.target === modal) {
        cerrarModalCalificacion()
      }
    })
  }

  // Contador de caracteres en observaciones
  if (observacionesInput) {
    observacionesInput.addEventListener("input", () => {
      const count = observacionesInput.value.length
      charCount.textContent = `${count}/500 caracteres`
    })
  }

  // Manejar envío del formulario
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault()
      await enviarCalificacion()
    })
  }
}

function abrirModalCalificacion(idTerapia) {
  const modal = document.getElementById("calificacionModalEjercicio")
  const form = document.getElementById("calificacionForm")
  const idTerapiaInput = document.getElementById("idTerapiaCalificacion")
  const messageDiv = document.getElementById("calificacionMessage")

  // Guardar el ID de la terapia
  if (idTerapiaInput) {
    idTerapiaInput.value = idTerapia
  }

  // Limpiar el formulario
  if (form) {
    form.reset()
  }

  // Limpiar mensaje previo
  if (messageDiv) {
    messageDiv.textContent = ""
    messageDiv.className = "form-message"
  }

  // Mostrar modal
  if (modal) {
    modal.style.display = "block"
    modal.setAttribute("aria-hidden", "false")
    // Enfocar en el primer input
    const primerInput = form.querySelector("input[type='radio']")
    if (primerInput) {
      setTimeout(() => primerInput.focus(), 100)
    }
  }
}

function cerrarModalCalificacion() {
  const modal = document.getElementById("calificacionModalEjercicio")
  const form = document.getElementById("calificacionForm")
  const messageDiv = document.getElementById("calificacionMessage")

  if (modal) {
    modal.style.display = "none"
    modal.setAttribute("aria-hidden", "true")
  }

  if (form) {
    form.reset()
  }

  if (messageDiv) {
    messageDiv.textContent = ""
    messageDiv.className = "form-message"
  }
}

async function enviarCalificacion() {
  const form = document.getElementById("calificacionForm")
  const messageDiv = document.getElementById("calificacionMessage")
  const submitBtn = form.querySelector('button[type="submit"]')

  // Validar que todos los campos requeridos estén seleccionados
  const dolor = form.querySelector('input[name="dolor"]:checked')
  const sensacion = form.querySelector('input[name="sensacion"]:checked')
  const cansancio = form.querySelector('input[name="cansancio"]:checked')

  if (!dolor || !sensacion || !cansancio) {
    mostrarMensajeCalificacion(messageDiv, "Por favor, completa todas las calificaciones", "error")
    return
  }

  const idTerapia = document.getElementById("idTerapiaCalificacion").value
  const observaciones = document.getElementById("observacionesInput").value

  // Deshabilitar botón durante el envío
  if (submitBtn) {
    submitBtn.disabled = true
    submitBtn.textContent = "Enviando..."
  }

  try {
    const response = await fetch("http://127.0.0.1:8000/paciente/calificar-ejercicio", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id_terapia: parseInt(idTerapia),
        dolor: parseInt(dolor.value),
        sensacion: parseInt(sensacion.value),
        cansancio: parseInt(cansancio.value),
        observaciones: observaciones || null,
      }),
    })

    if (!response.ok) {
      throw new Error(`Error al guardar calificaciones (${response.status})`)
    }

    const data = await response.json()

    // Mostrar mensaje de éxito
    mostrarMensajeCalificacion(
      messageDiv,
      "✓ Calificación guardada exitosamente",
      "success"
    )

    // Cerrar modal después de 2 segundos
    setTimeout(() => {
      cerrarModalCalificacion()
      // Recargar los datos
      cargarGruposEjerciciosAsignados()
      cargarEjerciciosAsignadosDesdeAPI()
      cargarEjerciciosRealizadosDesdeAPI()
      cargarResumenGrupos()
    }, 2000)
  } catch (error) {
    console.error("Error al enviar calificación:", error)
    mostrarMensajeCalificacion(
      messageDiv,
      "Error al guardar la calificación. Intenta de nuevo.",
      "error"
    )
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false
      submitBtn.textContent = "Enviar Calificación"
    }
  }
}

function mostrarMensajeCalificacion(messageDiv, mensaje, tipo) {
  if (messageDiv) {
    messageDiv.textContent = mensaje
    messageDiv.className = `form-message ${tipo}`
  }
}

// ==========================================
// UTILIDADES
// ==========================================

function formatearFecha(fecha) {
  const date = new Date(fecha)
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function mostrarMensajeError(mensaje) {
  const grid = document.getElementById("exercisesGridRealizados")
  if (grid) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
        <p style="color: #e74c3c; font-size: 1.1rem;">${mensaje}</p>
      </div>
    `
  }
}

function mostrarMensajeErrorAsignados(mensaje) {
  const grid = document.getElementById("exercisesGrid")
  if (grid) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
        <p style="color: #e74c3c; font-size: 1.1rem;">${mensaje}</p>
      </div>
    `
  }
}

function cerrarSesion() {
  if (!confirm("¿Desea cerrar sesión?")) return

  try {
    localStorage.removeItem("token")
    localStorage.removeItem("tipo_usuario")
    localStorage.removeItem("nombre")
    localStorage.removeItem("cedula")
    localStorage.removeItem("usuario_id")
  } catch (e) {
    console.warn("Error limpiando localStorage al cerrar sesión", e)
  }
  window.location.replace("index.html")
}
