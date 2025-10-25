// ===============================
// DASHBOARD PACIENTE JS
// ===============================

// Simulación de ejercicios (puedes reemplazar esto con datos del backend)
const ejercicios = [
  {
    id: 1,
    nombre: "Elevación de pierna",
    descripcion: "Fortalece los músculos del muslo y mejora la movilidad de la pierna.",
    parteCuerpo: "Pierna",
    imagen: "assets/img/ejercicios/pierna1.jpg",
  },
  {
    id: 2,
    nombre: "Flexión de rodilla",
    descripcion: "Ejercicio suave para fortalecer la articulación de la rodilla.",
    parteCuerpo: "Pierna",
    imagen: "assets/img/ejercicios/pierna2.jpg",
  },
  {
    id: 3,
    nombre: "Rotación de hombros",
    descripcion: "Mejora la movilidad y flexibilidad del hombro.",
    parteCuerpo: "Brazo",
    imagen: "assets/img/ejercicios/brazo1.jpg",
  },
  {
    id: 4,
    nombre: "Extensión de codo",
    descripcion: "Fortalece los músculos del brazo y el antebrazo.",
    parteCuerpo: "Brazo",
    imagen: "assets/img/ejercicios/brazo2.jpg",
  },
  {
    id: 5,
    nombre: "Torsión de tronco",
    descripcion: "Ayuda a la movilidad del torso y la columna.",
    parteCuerpo: "Tronco",
    imagen: "assets/img/ejercicios/tronco1.jpg",
  },
]

// Elementos del DOM
const filtersContainer = document.getElementById("filters")
const exercisesGrid = document.getElementById("exercisesGrid")
const noResults = document.getElementById("noResults")

const API_URL = "http://localhost:8000/paciente"

// Inicializar
document.addEventListener("DOMContentLoaded", () => {
  generarFiltros()
  mostrarEjercicios(ejercicios)
  initSidebar()
  initNavigation()
  cargarFiltros()
  cargarEjercicios()
  cargarFiltrosRealizados()
  cargarEjerciciosRealizadosDesdeAPI()
})

// Generar los botones de filtro dinámicamente
function generarFiltros() {
  const partes = [...new Set(ejercicios.map((e) => e.parteCuerpo))]
  filtersContainer.innerHTML = ""

  // Botón "Todos"
  const btnTodos = document.createElement("button")
  btnTodos.textContent = "Todos"
  btnTodos.classList.add("filter-btn", "active")
  btnTodos.addEventListener("click", () => filtrarEjercicios(null, btnTodos))
  filtersContainer.appendChild(btnTodos)

  // Botones de cada parte del cuerpo
  partes.forEach((parte) => {
    const btn = document.createElement("button")
    btn.textContent = parte
    btn.classList.add("filter-btn")
    btn.addEventListener("click", () => filtrarEjercicios(parte, btn))
    filtersContainer.appendChild(btn)
  })
}

// Mostrar ejercicios en la cuadrícula
function mostrarEjercicios(lista) {
  exercisesGrid.innerHTML = ""

  if (lista.length === 0) {
    noResults.style.display = "block"
    return
  }

  noResults.style.display = "none"

  lista.forEach((e) => {
    const card = document.createElement("div")
    card.classList.add("exercise-card")

    card.innerHTML = `
      <img src="${e.imagen}" alt="${e.nombre}" class="exercise-image">
      <div class="exercise-content">
        <span class="exercise-body-part">${e.parteCuerpo}</span>
        <h3 class="exercise-title">${e.nombre}</h3>
        <p class="exercise-description">${e.descripcion}</p>
      </div>
    `

    exercisesGrid.appendChild(card)
  })
}

// Filtrar ejercicios según parte del cuerpo
function filtrarEjercicios(parte, boton) {
  document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"))
  boton.classList.add("active")

  if (!parte) {
    mostrarEjercicios(ejercicios)
    return
  }

  const filtrados = ejercicios.filter((e) => e.parteCuerpo === parte)
  mostrarEjercicios(filtrados)
}

// Datos de ejemplo para ejercicios asignados
const ejerciciosAsignados = [
  {
    id: 1,
    nombre: "Flexión de Rodilla",
    extremidad: "Rodilla",
    descripcion: "Ejercicio para fortalecer los músculos de la rodilla",
    repeticiones: 10,
    imagen: "/knee-flexion-exercise.jpg",
  },
  {
    id: 2,
    nombre: "Elevación de Brazo",
    extremidad: "Brazo",
    descripcion: "Ejercicio para mejorar la movilidad del hombro",
    repeticiones: 15,
    imagen: "/arm-elevation-exercise.jpg",
  },
  {
    id: 3,
    nombre: "Rotación de Cuello",
    extremidad: "Cervical",
    descripcion: "Ejercicio para mejorar la movilidad cervical",
    repeticiones: 10,
    imagen: "/neck-rotation-exercise.png",
  },
  {
    id: 4,
    nombre: "Extensión de Tobillo",
    extremidad: "Tobillo",
    descripcion: "Ejercicio para fortalecer los músculos del tobillo",
    repeticiones: 12,
    imagen: "/ankle-extension-exercise.jpg",
  },
  {
    id: 5,
    nombre: "Flexión de Codo",
    extremidad: "Codo",
    descripcion: "Ejercicio para fortalecer el bíceps",
    repeticiones: 10,
    imagen: "/elbow-flexion-exercise.jpg",
  },
]

// Datos de ejemplo para ejercicios realizados
const ejerciciosRealizados = []

let filtroActual = "Todos"
let filtroRealizadosActual = "Todos"

// Funcionalidad del sidebar
function initSidebar() {
  const toggleBtn = document.getElementById("toggleSidebar")
  const sidebar = document.getElementById("sidebar")

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed")
    })
  }
}

// Navegación entre secciones
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
  // Actualizar navegación activa
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active")
  })
  document.querySelector(`[data-section="${sectionId}"]`).classList.add("active")

  // Actualizar secciones de contenido
  document.querySelectorAll(".content-section").forEach((section) => {
    section.classList.remove("active")
  })
  document.getElementById(sectionId).classList.add("active")

  // Actualizar título
  const titles = {
    "ejercicios-asignados": "Ejercicios Asignados",
    "ejercicios-realizados": "Ejercicios Realizados",
  }
  document.getElementById("section-title").textContent = titles[sectionId]
}

// Cargar filtros para ejercicios asignados
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

// Cargar ejercicios asignados
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
            <div class="exercise-image">
                <img src="${ejercicio.imagen}" alt="${ejercicio.nombre}">
            </div>
            <div class="exercise-content">
                <h3 class="exercise-title">${ejercicio.nombre}</h3>
                <span class="exercise-category">${ejercicio.extremidad}</span>
                <p class="exercise-description">${ejercicio.descripcion}</p>
                <div class="exercise-details">
                    <span><strong>Repeticiones:</strong> ${ejercicio.repeticiones}</span>
                </div>
                <button class="btn-primary" onclick="marcarComoRealizado(${ejercicio.id})">
                    Marcar como Realizado
                </button>
            </div>
        </div>
    `,
    )
    .join("")
}

// Filtrar ejercicios asignados
function filtrarEjerciciosAsignados(extremidad) {
  filtroActual = extremidad

  // Actualizar botones activos
  document.querySelectorAll("#filters .filter-btn").forEach((btn) => {
    btn.classList.remove("active")
  })
  event.target.classList.add("active")

  cargarEjercicios()
}

// Cargar filtros para ejercicios realizados
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

async function cargarEjerciciosRealizadosDesdeAPI() {
  try {
    // Get patient cedula from localStorage (assuming it's stored during login)
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

    // Update the global variable with real data
    ejerciciosRealizados.length = 0 // Clear array
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

    // Reload the UI with real data
    cargarEjerciciosRealizados()
  } catch (error) {
    console.error("Error al cargar ejercicios completados:", error)
    mostrarMensajeError("Error al cargar los ejercicios completados")
  }
}

// Cerrar sesión (ejemplo)
function logout() {
    if (confirm("¿Seguro que deseas cerrar sesión?")) {
        localStorage.clear(); 
        window.location.href = "index.html";
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

// Filtrar ejercicios realizados
function filtrarEjerciciosRealizados(extremidad) {
  filtroRealizadosActual = extremidad

  // Actualizar botones activos
  document.querySelectorAll("#filtersRealizados .filter-btn").forEach((btn) => {
    btn.classList.remove("active")
  })
  event.target.classList.add("active")

  cargarEjerciciosRealizados()
}

// Marcar ejercicio como realizado
function marcarComoRealizado(id) {
  const ejercicio = ejerciciosAsignados.find((ej) => ej.id === id)
  if (ejercicio) {
    const ejercicioRealizado = {
      ...ejercicio,
      fechaRealizacion: new Date().toISOString().split("T")[0],
      completado: true,
    }
    ejerciciosRealizados.unshift(ejercicioRealizado)
    cargarFiltrosRealizados()
    cargarEjerciciosRealizados()
    alert("¡Ejercicio marcado como realizado!")
  }
}

// Formatear fecha
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

// Cerrar sesión
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
