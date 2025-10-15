// Datos de ejercicios
const exercises = [
  {
    id: 1,
    title: "Rotación de Hombro",
    bodyPart: "Hombro",
    description: "Ejercicio de movilidad para mejorar el rango de movimiento del hombro y reducir la rigidez.",
    duration: "10 min",
    repetitions: "3 series de 15",
    difficulty: "Fácil",
    image: "assets/images/shoulder-rotation-exercise.png",
  },
  {
    id: 2,
    title: "Extensión de Rodilla",
    bodyPart: "Rodilla",
    description: "Fortalecimiento del cuádriceps para mejorar la estabilidad de la rodilla.",
    duration: "15 min",
    repetitions: "3 series de 12",
    difficulty: "Medio",
    image: "assets/images/knee-extension-exercise.png",
  },
  {
    id: 3,
    title: "Flexión Plantar de Tobillo",
    bodyPart: "Tobillo",
    description: "Ejercicio para fortalecer los músculos de la pantorrilla y mejorar la movilidad del tobillo.",
    duration: "8 min",
    repetitions: "3 series de 20",
    difficulty: "Fácil",
    image: "assets/images/ankle-plantar-flexion-exercise.jpg",
  },
  {
    id: 4,
    title: "Elevación Lateral de Hombro",
    bodyPart: "Hombro",
    description: "Fortalecimiento del deltoides lateral para mejorar la fuerza y estabilidad del hombro.",
    duration: "12 min",
    repetitions: "3 series de 10",
    difficulty: "Medio",
    image: "assets/images/lateral-shoulder-raise-exercise.jpg",
  },
  {
    id: 5,
    title: "Sentadilla Asistida",
    bodyPart: "Rodilla",
    description: "Ejercicio funcional para fortalecer rodillas y mejorar la movilidad de las extremidades inferiores.",
    duration: "10 min",
    repetitions: "3 series de 8",
    difficulty: "Medio",
    image: "assets/images/assisted-squat-exercise.jpg",
  },
  {
    id: 6,
    title: "Estiramiento de Codo",
    bodyPart: "Codo",
    description: "Ejercicio de flexibilidad para mejorar el rango de movimiento del codo.",
    duration: "8 min",
    repetitions: "3 series de 15",
    difficulty: "Fácil",
    image: "assets/images/elbow-stretch-exercise.jpg",
  },
  {
    id: 7,
    title: "Fortalecimiento de Muñeca",
    bodyPart: "Muñeca",
    description: "Ejercicio con resistencia para fortalecer los músculos flexores y extensores de la muñeca.",
    duration: "10 min",
    repetitions: "3 series de 12",
    difficulty: "Medio",
    image: "assets/images/wrist-strengthening-exercise.jpg",
  },
  {
    id: 8,
    title: "Puente de Cadera",
    bodyPart: "Cadera",
    description: "Fortalecimiento de glúteos y estabilizadores de cadera para mejorar la postura.",
    duration: "12 min",
    repetitions: "3 series de 15",
    difficulty: "Medio",
    image: "assets/images/hip-bridge-exercise.png",
  },
  {
    id: 9,
    title: "Estiramiento Lumbar",
    bodyPart: "Espalda",
    description: "Ejercicio de movilidad para aliviar la tensión en la zona lumbar.",
    duration: "10 min",
    repetitions: "3 series de 10",
    difficulty: "Fácil",
    image: "assets/images/lumbar-stretch-exercise.jpg",
  },
  {
    id: 10,
    title: "Rotación de Cuello",
    bodyPart: "Cuello",
    description: "Ejercicio suave para mejorar la movilidad cervical y reducir la tensión.",
    duration: "5 min",
    repetitions: "3 series de 8",
    difficulty: "Fácil",
    image: "assets/images/neck-rotation-exercise.png",
  },
  {
    id: 11,
    title: "Equilibrio en Tobillo",
    bodyPart: "Tobillo",
    description: "Ejercicio de propiocepción para mejorar el equilibrio y prevenir lesiones de tobillo.",
    duration: "10 min",
    repetitions: "3 series de 30 seg",
    difficulty: "Medio",
    image: "assets/images/ankle-balance-exercise.jpg",
  },
  {
    id: 12,
    title: "Fortalecimiento Dorsal",
    bodyPart: "Espalda",
    description: "Ejercicio para fortalecer la musculatura de la espalda alta y mejorar la postura.",
    duration: "15 min",
    repetitions: "3 series de 12",
    difficulty: "Medio",
    image: "assets/images/upper-back-strengthening-exercise.jpg",
  },
]

// Estado de la aplicación
let currentFilter = "Todos"

// Inicializar la aplicación
function init() {
  console.log("[v0] Iniciando aplicación...")

  // Cargar nombre de usuario
  const userName = localStorage.getItem("userName") || "Usuario"
  const userNameElement = document.getElementById("userName")

  if (userNameElement) {
    userNameElement.textContent = userName
    console.log("[v0] Nombre de usuario cargado:", userName)
  } else {
    console.error("[v0] No se encontró el elemento userName")
  }

  // Generar filtros
  generateFilters()

  // Mostrar todos los ejercicios inicialmente
  renderExercises(exercises)

  console.log("[v0] Aplicación inicializada correctamente")
}

// Generar botones de filtro
function generateFilters() {
  console.log("[v0] Generando filtros...")
  const filtersContainer = document.getElementById("filters")

  if (!filtersContainer) {
    console.error("[v0] No se encontró el contenedor de filtros")
    return
  }

  // Obtener todas las extremidades únicas
  const bodyParts = ["Todos", ...new Set(exercises.map((ex) => ex.bodyPart))]
  console.log("[v0] Extremidades encontradas:", bodyParts)

  // Crear botones de filtro
  bodyParts.forEach((bodyPart) => {
    const button = document.createElement("button")
    button.className = "filter-btn"
    button.textContent = bodyPart

    // Marcar "Todos" como activo por defecto
    if (bodyPart === "Todos") {
      button.classList.add("active")
    }

    // Agregar evento de clic
    button.addEventListener("click", () => filterExercises(bodyPart, button))

    filtersContainer.appendChild(button)
  })

  console.log("[v0] Filtros generados:", bodyParts.length)
}

// Filtrar ejercicios
function filterExercises(bodyPart, clickedButton) {
  console.log("[v0] Filtrando por:", bodyPart)

  // Actualizar estado del filtro
  currentFilter = bodyPart

  // Actualizar botones activos
  const allButtons = document.querySelectorAll(".filter-btn")
  allButtons.forEach((btn) => btn.classList.remove("active"))
  clickedButton.classList.add("active")

  // Filtrar ejercicios
  const filteredExercises = bodyPart === "Todos" ? exercises : exercises.filter((ex) => ex.bodyPart === bodyPart)
  console.log("[v0] Ejercicios filtrados:", filteredExercises.length)

  // Renderizar ejercicios filtrados
  renderExercises(filteredExercises)
}

// Renderizar ejercicios
function renderExercises(exercisesToRender) {
  console.log("[v0] Renderizando ejercicios:", exercisesToRender.length)

  const grid = document.getElementById("exercisesGrid")
  const noResults = document.getElementById("noResults")

  if (!grid || !noResults) {
    console.error("[v0] No se encontraron los elementos del grid o noResults")
    return
  }

  // Limpiar grid
  grid.innerHTML = ""

  // Mostrar mensaje si no hay resultados
  if (exercisesToRender.length === 0) {
    grid.style.display = "none"
    noResults.style.display = "block"
    console.log("[v0] No hay ejercicios para mostrar")
    return
  }

  // Ocultar mensaje de no resultados
  grid.style.display = "grid"
  noResults.style.display = "none"

  // Crear tarjetas de ejercicios
  exercisesToRender.forEach((exercise) => {
    const card = createExerciseCard(exercise)
    grid.appendChild(card)
  })

  console.log("[v0] Ejercicios renderizados correctamente")
}

// Crear tarjeta de ejercicio
function createExerciseCard(exercise) {
  const card = document.createElement("div")
  card.className = "exercise-card"

  // Crear placeholder si la imagen no existe
  const placeholderSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23667eea'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='white'%3E${exercise.bodyPart}%3C/text%3E%3C/svg%3E`

  card.innerHTML = `
        <img src="${exercise.image}" 
             alt="${exercise.title}" 
             class="exercise-image"
             onerror="this.src='${placeholderSvg}'">
        <div class="exercise-content">
            <h3 class="exercise-title">${exercise.title}</h3>
            <span class="exercise-body-part">${exercise.bodyPart}</span>
            <p class="exercise-description">${exercise.description}</p>
            <div class="exercise-details">
                <div class="exercise-detail">
                    <strong>Duración:</strong> ${exercise.duration}
                </div>
                <div class="exercise-detail">
                    <strong>Repeticiones:</strong> ${exercise.repetitions}
                </div>
                <div class="exercise-detail">
                    <strong>Dificultad:</strong> ${exercise.difficulty}
                </div>
            </div>
        </div>
    `

  return card
}

// Función de logout
function logout() {
  console.log("[v0] Cerrando sesión...")
  localStorage.clear()
  window.location.href = "index.html"
}

// Inicializar cuando el DOM esté listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init)
} else {
  // DOM ya está listo
  init()
}

console.log("[v0] Script cargado correctamente")
