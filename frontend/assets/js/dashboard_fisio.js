// Navigation functionality
document.addEventListener("DOMContentLoaded", () => {
  const navItems = document.querySelectorAll(".nav-item")
  const sections = document.querySelectorAll(".content-section")
  const sectionTitle = document.getElementById("section-title")
  const logoutBtn = document.querySelector(".btn-logout")
  const toggleSidebarBtn = document.getElementById("toggleSidebar")
  const sidebar = document.getElementById("sidebar")

  // Section titles mapping
  const sectionTitles = {
    "informacion-personal": "Información Personal",
    "asignar-ejercicios": "Asignar Ejercicios",
    "avance-paciente": "Avance Paciente",
    "biblioteca-ejercicios": "Biblioteca de Ejercicios",
  }

  toggleSidebarBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed")
  })

  // Handle navigation clicks
  navItems.forEach((item) => {
    item.addEventListener("click", function () {
      const targetSection = this.getAttribute("data-section")

      // Remove active class from all nav items and sections
      navItems.forEach((nav) => nav.classList.remove("active"))
      sections.forEach((section) => section.classList.remove("active"))

      // Add active class to clicked nav item and corresponding section
      this.classList.add("active")
      document.getElementById(targetSection).classList.add("active")

      // Update section title
      sectionTitle.textContent = sectionTitles[targetSection]
    })
  })

  // Handle logout - CORREGIDO
  logoutBtn.addEventListener("click", () => {
    if (confirm("¿Está seguro que desea cerrar sesión?")) {
      console.log("🚪 Cerrando sesión...")
      
      // Limpiar COMPLETAMENTE el localStorage
      localStorage.clear()
      
      // También puedes eliminar items específicos si prefieres:
      // localStorage.removeItem('token')
      // localStorage.removeItem('tipo_usuario')
      // localStorage.removeItem('nombre')
      // localStorage.removeItem('email')
      
      console.log("✅ LocalStorage limpiado")
      
      // Redirigir al login
      window.location.href = "index.html"
    }
  })

  // Handle search buttons
  const searchButtons = document.querySelectorAll(".btn-search")
  searchButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const input = this.previousElementSibling
      if (input.value.trim()) {
        console.log("🔍 Buscando:", input.value)
        alert("Función de búsqueda: " + input.value)
      } else {
        alert("Por favor ingrese un término de búsqueda")
      }
    })
  })

  // Handle edit button
  const editBtn = document.querySelector(".btn-edit")
  if (editBtn) {
    editBtn.addEventListener("click", () => {
      alert("Función de edición de información personal")
    })
  }

  // Handle patient action buttons
  const actionButtons = document.querySelectorAll(".btn-action")
  actionButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const action = this.textContent.trim()
      console.log("✅ Acción:", action)
      alert("Función: " + action)
    })
  })

  const assignExercisesBtn = document.getElementById("assignSelectedExercises")
  if (assignExercisesBtn) {
    assignExercisesBtn.addEventListener("click", () => {
      const selectedPatients = document.querySelectorAll(".patient-checkbox:checked")
      const selectedExercises = document.querySelectorAll(".exercise-checkbox:checked")

      if (selectedPatients.length === 0) {
        alert("Por favor seleccione al menos un paciente")
        return
      }

      if (selectedExercises.length === 0) {
        alert("Por favor seleccione al menos un ejercicio")
        return
      }

      const patientNames = Array.from(selectedPatients)
        .map((cb) => cb.nextElementSibling.textContent)
        .join(", ")

      const exerciseNames = Array.from(selectedExercises)
        .map((cb) => cb.closest(".exercise-item").querySelector(".exercise-name").textContent)
        .join(", ")

      console.log("📋 Asignando ejercicios:", exerciseNames)
      console.log("👥 A pacientes:", patientNames)

      alert(`Asignando ejercicios:\n${exerciseNames}\n\nA pacientes:\n${patientNames}`)

      // Desmarcar checkboxes después de asignar
      selectedPatients.forEach((cb) => (cb.checked = false))
      selectedExercises.forEach((cb) => (cb.checked = false))
    })
  }

  const selectAllPatientsBtn = document.createElement("button")
  selectAllPatientsBtn.textContent = "Seleccionar Todos"
  selectAllPatientsBtn.className = "btn-action"
  selectAllPatientsBtn.style.marginBottom = "1rem"

  const patientsCard = document.querySelector("#asignar-ejercicios .patients-card")
  if (patientsCard) {
    patientsCard.insertBefore(selectAllPatientsBtn, patientsCard.querySelector(".patient-item"))

    selectAllPatientsBtn.addEventListener("click", () => {
      const checkboxes = document.querySelectorAll(".patient-checkbox")
      const allChecked = Array.from(checkboxes).every((cb) => cb.checked)

      checkboxes.forEach((cb) => (cb.checked = !allChecked))
      selectAllPatientsBtn.textContent = allChecked ? "Seleccionar Todos" : "Deseleccionar Todos"
    })
  }

  const selectAllExercisesBtn = document.createElement("button")
  selectAllExercisesBtn.textContent = "Seleccionar Todos"
  selectAllExercisesBtn.className = "btn-action"
  selectAllExercisesBtn.style.marginBottom = "1rem"

  const exercisesCard = document.querySelector("#biblioteca-ejercicios .exercises-card")
  if (exercisesCard) {
    exercisesCard.insertBefore(selectAllExercisesBtn, exercisesCard.querySelector(".exercises-grid"))

    selectAllExercisesBtn.addEventListener("click", () => {
      const checkboxes = document.querySelectorAll(".exercise-checkbox")
      const allChecked = Array.from(checkboxes).every((cb) => cb.checked)

      checkboxes.forEach((cb) => (cb.checked = !allChecked))
      selectAllExercisesBtn.textContent = allChecked ? "Seleccionar Todos" : "Deseleccionar Todos"
    })
  }
})

console.log("Script dashboard_fisio.js cargado correctamente")