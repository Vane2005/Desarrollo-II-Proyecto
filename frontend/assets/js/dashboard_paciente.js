/**
 * ==========================================
 * 📘 SISTEMA DE GESTIÓN DE EJERCICIOS PACIENTE
 * ==========================================
 * Este script maneja la interacción del paciente con la plataforma:
 *  - Carga de información personal
 *  - Visualización y filtrado de ejercicios asignados
 *  - Visualización y filtrado de ejercicios realizados
 *  - Cambio de contraseña
 *  - Cierre de sesión

 */

// ==========================================
// VARIABLES GLOBALES
// ==========================================

/** @type {Array} Lista de ejercicios disponibles en el sistema */
const ejercicios = []

/** @type {Array} Ejercicios asignados al paciente */
const ejerciciosAsignados = []

/** @type {Array} Ejercicios ya realizados por el paciente */
const ejerciciosRealizados = []

/** @type {string} Filtro actual para ejercicios asignados */
let filtroActual = "Todos"

/** @type {string} Filtro actual para ejercicios realizados */
let filtroRealizadosActual = "Todos"

/** @constant {string} URL base del API de pacientes */
const API_URL = "http://localhost:8000/paciente"

/** @constant {string} URL base del API de autenticación */
const AUTH_API_URL = "http://localhost:8000/auth"


// ==========================================
// INICIALIZACIÓN DEL SISTEMA
// ==========================================

/**
 * Ejecuta las funciones iniciales al cargar la página:
 *  - Inicializa sidebar y navegación
 *  - Carga datos del paciente
 *  - Inicializa el modal de cambio de contraseña
 *  - Carga filtros y ejercicios
 */
document.addEventListener("DOMContentLoaded", () => {
  initSidebar()
  initNavigation()
  cargarInfoPaciente() // NUEVO: Cargar información del paciente
  initCambiarContrasena() // NUEVO: Inicializar modal de cambio de contraseña
  initEditarPerfil() // Added profile editing initialization
  cargarFiltros()
  cargarEjerciciosAsignadosDesdeAPI()
  cargarFiltrosRealizados()
  cargarEjerciciosRealizadosDesdeAPI()
})

function initEditarPerfil() {
  const btnEditProfile = document.getElementById("btnEditProfilePaciente")
  const btnSaveProfile = document.getElementById("btnSaveProfilePaciente")
  const btnCancelEdit = document.getElementById("btnCancelEditPaciente")
  const profileActions = document.getElementById("profileActionsPaciente")

  let originalProfileData = {}

  btnEditProfile.addEventListener("click", () => {
    // Save original data
    originalProfileData = {
      nombre: document.getElementById("inputNombrePaciente").value,
      correo: document.getElementById("inputCorreoPaciente").value,
      telefono: document.getElementById("inputTelefonoPaciente").value,
    }

    // Enable editing
    document.getElementById("inputNombrePaciente").removeAttribute("readonly")
    document.getElementById("inputCorreoPaciente").removeAttribute("readonly")
    document.getElementById("inputTelefonoPaciente").removeAttribute("readonly")

    // Add editing styles
    document.getElementById("inputNombrePaciente").style.borderColor = "#667eea"
    document.getElementById("inputCorreoPaciente").style.borderColor = "#667eea"
    document.getElementById("inputTelefonoPaciente").style.borderColor = "#667eea"

    // Show save/cancel buttons
    profileActions.style.display = "block"
    btnEditProfile.style.display = "none"
  })

  btnCancelEdit.addEventListener("click", () => {
    // Restore original data
    document.getElementById("inputNombrePaciente").value = originalProfileData.nombre
    document.getElementById("inputCorreoPaciente").value = originalProfileData.correo
    document.getElementById("inputTelefonoPaciente").value = originalProfileData.telefono

    // Disable editing
    cancelProfileEdit()
  })

  btnSaveProfile.addEventListener("click", async () => {
    const nombre = document.getElementById("inputNombrePaciente").value.trim()
    const correo = document.getElementById("inputCorreoPaciente").value.trim()
    const telefono = document.getElementById("inputTelefonoPaciente").value.trim()

    // Validate fields
    if (!nombre || !correo || !telefono) {
      alert("Por favor complete todos los campos")
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(correo)) {
      alert("Por favor ingrese un correo electrónico válido")
      return
    }

    const token = localStorage.getItem("token")
    if (!token) {
      alert("No hay sesión activa. Por favor inicie sesión nuevamente.")
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

      alert("✅ Perfil actualizado correctamente")
      cancelProfileEdit()

      // Reload profile data
      await cargarInfoPaciente()
    } catch (error) {
      console.error("Error al actualizar perfil:", error)
      alert(`❌ ${error.message}`)
    } finally {
      btnSaveProfile.disabled = false
      btnSaveProfile.textContent = "Guardar Cambios"
    }
  })

  function cancelProfileEdit() {
    document.getElementById("inputNombrePaciente").setAttribute("readonly", true)
    document.getElementById("inputCorreoPaciente").setAttribute("readonly", true)
    document.getElementById("inputTelefonoPaciente").setAttribute("readonly", true)

    document.getElementById("inputNombrePaciente").style.borderColor = ""
    document.getElementById("inputCorreoPaciente").style.borderColor = ""
    document.getElementById("inputTelefonoPaciente").style.borderColor = ""

    profileActions.style.display = "none"
    btnEditProfile.style.display = "inline-block"
  }
}

// ==========================================
// INFORMACIÓN DEL PACIENTE
// ==========================================

/**
 * Carga la información del paciente desde la API y la muestra en el formulario.
 */
async function cargarInfoPaciente() {
  const cedula = localStorage.getItem("cedula") || localStorage.getItem("usuario_id")

  if (!cedula) {
    console.error("No se encontró la cédula del paciente")
    alert("Error: No se pudo cargar la información del paciente")
    return
  }

  try {
    console.log(`📋 Cargando información del paciente: ${cedula}`)

    const response = await fetch(`${API_URL}/${cedula}`)

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
    changePasswordForm.reset()
    passwordMessage.classList.remove("visible")
  })

  // Función para cerrar modal
  function closeModal() {
    changePasswordModal.classList.remove("active")
    changePasswordForm.reset()
    passwordMessage.classList.remove("visible")
  }

  // Cerrar modal con botones o clic fuera
  closePasswordModal.addEventListener("click", closeModal)
  cancelPasswordChange.addEventListener("click", closeModal)
  changePasswordModal.addEventListener("click", (e) => {
    if (e.target === changePasswordModal) closeModal()
  })

  // Validar contraseñas en tiempo real
  document.getElementById("confirmPasswordPaciente").addEventListener("input", function () {
    const newPassword = document.getElementById("newPasswordPaciente").value
    const confirmPassword = this.value
    if (confirmPassword && newPassword !== confirmPassword) {
      this.setCustomValidity("Las contraseñas no coinciden")
      this.style.borderColor = "#ff4444"
    } else {
      this.setCustomValidity("")
      this.style.borderColor = ""
    }
  })

  // Envío del formulario
  changePasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const currentPassword = document.getElementById("currentPasswordPaciente").value
    const newPassword = document.getElementById("newPasswordPaciente").value
    const confirmPassword = document.getElementById("confirmPasswordPaciente").value

    if (newPassword !== confirmPassword) {
      mostrarMensajePassword("error", "Las contraseñas no coinciden")
      return
    }

    if (newPassword.length < 8) {
      mostrarMensajePassword("error", "La nueva contraseña debe tener al menos 8 caracteres")
      return
    }

    const token = localStorage.getItem("token")
    if (!token) {
      mostrarMensajePassword("error", "No hay sesión activa")
      return
    }

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
      if (!response.ok) throw new Error(data.detail || "Error al cambiar la contraseña")

      mostrarMensajePassword("success", `✅ ${data.mensaje}<br>Se ha enviado una notificación a tu correo.`)

      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        closeModal()
      }, 2000)
    } catch (error) {
      console.error("Error al cambiar contraseña:", error)
      mostrarMensajePassword("error", error.message)
    } finally {
      submitBtn.disabled = false
      submitBtn.textContent = "Cambiar Contraseña"
    }
  })
}

/**
 * Muestra un mensaje en el modal de cambio de contraseña.
 * @param {"success"|"error"} tipo Tipo del mensaje
 * @param {string} contenido Texto o HTML del mensaje
 */
function mostrarMensajePassword(tipo, contenido) {
  const passwordMessage = document.getElementById("passwordMessagePaciente")
  passwordMessage.className = `form-message ${tipo} visible`
  passwordMessage.innerHTML = contenido
}


// ==========================================
// SIDEBAR Y NAVEGACIÓN
// ==========================================

/** Inicializa el comportamiento del sidebar (mostrar/ocultar) */
function initSidebar() {
  const toggleBtn = document.getElementById("toggleSidebar")
  const sidebar = document.getElementById("sidebar")

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed")
    })
  }
}

/** Asocia los botones de navegación con sus secciones */
function initNavigation() {
  const navItems = document.querySelectorAll(".nav-item")

  navItems.forEach((item) => {
    item.addEventListener("click", function () {
      const sectionId = this.getAttribute("data-section")
      cambiarSeccion(sectionId)
    })
  })
}

/**
 * Cambia entre las secciones visibles de la interfaz.
 * @param {string} sectionId ID de la sección a mostrar
 */
function cambiarSeccion(sectionId) {
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"))
  document.querySelector(`[data-section="${sectionId}"]`).classList.add("active")

  document.querySelectorAll(".content-section").forEach((section) => section.classList.remove("active"))
  document.getElementById(sectionId).classList.add("active")

  const titles = {
    "informacion-personal": "Información Personal",
    "ejercicios-asignados": "Ejercicios Asignados",
    "ejercicios-realizados": "Ejercicios Realizados",
  }
  document.getElementById("section-title").textContent = titles[sectionId]
}


// ==========================================
// EJERCICIOS ASIGNADOS
// ==========================================

/**
 * Genera los botones de filtro por extremidad para ejercicios asignados.
 */
function cargarFiltros() {
  const filtersContainer = document.getElementById("filters")
  const extremidades = [
    "Todos","Brazo","Hombro","Codo","Muñeca","Mano",
    "Pierna","Rodilla","Tobillo","Pie","Cervical","Lumbar","Tronco","Cadera"
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

/**
 * Filtra los ejercicios asignados según la extremidad seleccionada.
 * @param {string} extremidad Nombre de la extremidad
 */
function filtrarEjerciciosAsignados(extremidad) {
  filtroActual = extremidad
  document.querySelectorAll("#filters .filter-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.textContent.trim() === extremidad)
  })
  cargarEjercicios()
}

/**
 * Obtiene los ejercicios asignados desde la API.
 */
async function cargarEjerciciosAsignadosDesdeAPI() {
  try {
    const cedula = localStorage.getItem("cedula") || localStorage.getItem("usuario_id")
    if (!cedula) throw new Error("No se encontró la cédula del paciente")

    const response = await fetch(`${API_URL}/ejercicios-asignados/${cedula}`)
    if (!response.ok) throw new Error(`Error al cargar ejercicios: ${response.status}`)

    const ejerciciosAsignadosAPI = await response.json()
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
    cargarEjercicios()
  } catch (error) {
    console.error("Error al cargar ejercicios asignados:", error)
    mostrarMensajeErrorAsignados("Error al cargar los ejercicios asignados")
  }
}

/**
 * Muestra los ejercicios asignados filtrados.
 */
function cargarEjercicios() {
  const grid = document.getElementById("exercisesGrid")
  const noResults = document.getElementById("noResults")

  const ejerciciosFiltrados =
    filtroActual === "Todos" ? ejerciciosAsignados : ejerciciosAsignados.filter((ej) => ej.extremidad === filtroActual)

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


// ==========================================
// EJERCICIOS REALIZADOS
// ==========================================

/**
 * Genera los botones de filtro para ejercicios realizados.
 */
function cargarFiltrosRealizados() {
  const filtersContainer = document.getElementById("filtersRealizados")
  const extremidades = [
    "Todos","Brazo","Hombro","Codo","Muñeca","Mano",
    "Pierna","Rodilla","Tobillo","Pie","Cervical","Lumbar","Tronco","Cadera"
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

/**
 * Filtra los ejercicios realizados según extremidad.
 * @param {string} extremidad
 */
function filtrarEjerciciosRealizados(extremidad) {
  filtroRealizadosActual = extremidad
  document.querySelectorAll("#filtersRealizados .filter-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.textContent.trim() === extremidad)
  })
  cargarEjerciciosRealizados()
}

/**
 * Carga los ejercicios realizados desde la API.
 */
async function cargarEjerciciosRealizadosDesdeAPI() {
  try {
    const cedula = localStorage.getItem("cedula") || localStorage.getItem("usuario_id")
    if (!cedula) throw new Error("No se encontró la cédula del paciente")

    const response = await fetch(`${API_URL}/ejercicios-completados/${cedula}`)
    if (!response.ok) throw new Error(`Error al cargar ejercicios: ${response.status}`)

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

/**
 * Muestra la lista de ejercicios realizados en pantalla.
 */
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


// ==========================================
// MARCAR COMO REALIZADO
// ==========================================

/**
 * Marca un ejercicio como realizado y actualiza las listas.
 * @param {number} idTerapia ID de la terapia a marcar como realizada
 */
async function marcarComoRealizado(idTerapia) {
  try {
    const response = await fetch(`${API_URL}/marcar-realizado/${idTerapia}`, { method: "PUT" })
    if (!response.ok) throw new Error(`Error al marcar como realizado (${response.status})`)

    const data = await response.json()
    alert(data.message || "Ejercicio marcado como realizado")

    const boton = document.querySelector(`button[onclick="marcarComoRealizado(${idTerapia})"]`)
    if (boton) {
      boton.textContent = "✅ Completado"
      boton.style.background = "#2ecc71"
      boton.disabled = true
    }

    await cargarEjerciciosAsignadosDesdeAPI()
    await cargarEjerciciosRealizadosDesdeAPI()
  } catch (error) {
    console.error("Error al marcar como realizado:", error)
    alert("Error al marcar el ejercicio como realizado")
  }
}


// ==========================================
// UTILIDADES
// ==========================================

/**
 * Muestra un mensaje de error en los ejercicios asignados.
 * @param {string} mensaje Texto del error
 */
function mostrarMensajeErrorAsignados(mensaje) {
  const grid = document.getElementById("exercisesGrid")
  const noResults = document.getElementById("noResults")
  grid.style.display = "none"
  noResults.style.display = "block"
  noResults.textContent = mensaje
}

/**
 * Muestra un mensaje de error en los ejercicios realizados.
 * @param {string} mensaje Texto del error
 */
function mostrarMensajeError(mensaje) {
  const grid = document.getElementById("exercisesGridRealizados")
  const noResults = document.getElementById("noResultsRealizados")
  grid.style.display = "none"
  noResults.style.display = "block"
  noResults.textContent = mensaje
}

/**
 * Da formato legible a una fecha ISO.
 * @param {string} fecha Fecha ISO (YYYY-MM-DD)
 * @returns {string} Fecha en formato "dd/mm/yyyy"
 */
function formatearFecha(fecha) {
  return fecha ? new Date(fecha).toLocaleDateString("es-ES") : "Sin fecha"
}


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
