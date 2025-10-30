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
  cargarEjerciciosAsignadosDesdeAPI()
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
const ejerciciosAsignados = []

// Datos de ejemplo para ejercicios realizados
const ejerciciosRealizados = []

const filtroActual = "Todos"
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
async function cargarEjerciciosAsignadosDesdeAPI() {
  try {
    // Get patient cedula from localStorage
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

    console.log("[v0] Ejercicios asignados recibidos de la API:", ejerciciosAsignadosAPI)

    // Update the global variable with real data
    ejerciciosAsignados.length = 0 // Clear array
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

async function marcarComoRealizado(idTerapia) {
  try {
    // Llamar al endpoint correcto del backend
    const response = await fetch(`http://127.0.0.1:8000/paciente/marcar-realizado/${idTerapia}`, {
      method: "PUT",
    });

    if (!response.ok) {
      throw new Error(`Error al marcar como realizado (${response.status})`);
    }

    const data = await response.json();
    alert(data.message || " Ejercicio marcado como realizado");

    // 🔄 Actualizar la interfaz
    const boton = document.querySelector(`button[onclick="marcarComoRealizado(${idTerapia})"]`);
    if (boton) {
      boton.textContent = "Completado ";
      boton.style.background = "#2ecc71";
      boton.disabled = true;
    }

    // Recargar listas desde el backend
    await cargarEjerciciosAsignadosDesdeAPI();
    await cargarEjerciciosRealizadosDesdeAPI();

  } catch (error) {
    console.error("Error al marcar como realizado:", error);
    alert(" No se pudo marcar el ejercicio como realizado");
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

// Función para cargar ejercicios asignados en la interfaz
function cargarEjercicios() {
  const grid = document.getElementById("exercisesGrid")
  const noResults = document.getElementById("noResults")

  const ejerciciosFiltrados =
    filtroActual === "Todos" ? ejerciciosAsignados : ejerciciosAsignados.filter((ej) => ej.extremidad === filtroActual)

  console.log("[v0] Ejercicios filtrados para mostrar:", ejerciciosFiltrados)
  console.log(
    "[v0] URLs de video:",
    ejerciciosFiltrados.map((e) => ({ nombre: e.nombre, url: e.urlVideo })),
  )

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
                <img src="${ejercicio.imagen || "/placeholder.svg?height=200&width=300"}" alt="${ejercicio.nombre}">
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
                <button onclick="marcarComoRealizado(${ejercicio.id_terapia})" style="margin-top: 12px; padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; transition: all 0.3s;">Marcar como Realizado</button>
            </div>
        </div>
    `,
    )
    .join("")

}
