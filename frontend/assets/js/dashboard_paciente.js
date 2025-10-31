const ejercicios = []
const ejerciciosAsignados = []
const ejerciciosRealizados = []

let filtroActual = "Todos"
let filtroRealizadosActual = "Todos"

const API_URL = "http://localhost:8000/paciente"
const AUTH_API_URL = "http://localhost:8000/auth"

// Inicializar
document.addEventListener("DOMContentLoaded", () => {
  initSidebar()
  initNavigation()
  cargarInfoPaciente() // NUEVO: Cargar información del paciente
  initCambiarContrasena() // NUEVO: Inicializar modal de cambio de contraseña
  cargarFiltros()
  cargarEjerciciosAsignadosDesdeAPI()
  cargarFiltrosRealizados()
  cargarEjerciciosRealizadosDesdeAPI()
})


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
  document.getElementById("confirmPasswordPaciente").addEventListener("input", function() {
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

  // Enviar cambio de contraseña
  changePasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const currentPassword = document.getElementById("currentPasswordPaciente").value
    const newPassword = document.getElementById("newPasswordPaciente").value
    const confirmPassword = document.getElementById("confirmPasswordPaciente").value

    // Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
      mostrarMensajePassword("error", "Las contraseñas no coinciden")
      return
    }

    // Validar longitud mínima
    if (newPassword.length < 8) {
      mostrarMensajePassword("error", "La nueva contraseña debe tener al menos 8 caracteres")
      return
    }

    const token = localStorage.getItem("token")
    if (!token) {
      mostrarMensajePassword("error", "No hay sesión activa")
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
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contrasena_actual: currentPassword,
          nueva_contrasena: newPassword
        })
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
      mostrarMensajePassword("error", error.message)
    } finally {
      submitBtn.disabled = false
      submitBtn.textContent = "Cambiar Contraseña"
    }
  })
}

function mostrarMensajePassword(tipo, contenido) {
  const passwordMessage = document.getElementById("passwordMessagePaciente")
  passwordMessage.className = `form-message ${tipo} visible`
  passwordMessage.innerHTML = contenido
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
  }
  document.getElementById("section-title").textContent = titles[sectionId]
}

// ==========================================
// EJERCICIOS ASIGNADOS - FILTRADO
// ==========================================

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
      `
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
      }))
    )

    cargarEjercicios()
  } catch (error) {
    console.error("Error al cargar ejercicios asignados:", error)
    mostrarMensajeErrorAsignados("Error al cargar los ejercicios asignados")
  }
}

function cargarEjercicios() {
  const grid = document.getElementById("exercisesGrid")
  const noResults = document.getElementById("noResults")

  const ejerciciosFiltrados =
    filtroActual === "Todos"
      ? ejerciciosAsignados
      : ejerciciosAsignados.filter((ej) => ej.extremidad === filtroActual)

  console.log(`🔍 Filtro activo: ${filtroActual}`)
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
    `
    )
    .join("")
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
      `
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
      }))
    )

    cargarEjerciciosRealizados()
  } catch (error) {
    console.error("Error al cargar ejercicios completados:", error)
    mostrarMensajeError("Error al cargar los ejercicios completados")
  }
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
    `
    )
    .join("")
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

    await cargarEjerciciosAsignadosDesdeAPI()
    await cargarEjerciciosRealizadosDesdeAPI()
  } catch (error) {
    console.error("Error al marcar como realizado:", error)
    alert("No se pudo marcar el ejercicio como realizado")
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