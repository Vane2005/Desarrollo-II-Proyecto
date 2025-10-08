// Datos de ejemplo (en producción, estos vendrían de una API)
let patients = [
  {
    id: 1,
    nombre: "Juan",
    apellido: "Pérez",
    correo: "juan.perez@email.com",
    telefono: "3001234567",
    fechaNacimiento: "1985-05-15",
    cc: "1234567890",
    diagnostico: "Lesión de rodilla derecha",
    fechaRegistro: "2024-01-15",
  },
  {
    id: 2,
    nombre: "María",
    apellido: "González",
    correo: "maria.gonzalez@email.com",
    telefono: "3009876543",
    fechaNacimiento: "1990-08-22",
    cc: "0987654321",
    diagnostico: "Dolor lumbar crónico",
    fechaRegistro: "2024-01-20",
  },
]

// Cargar pacientes al iniciar
document.addEventListener("DOMContentLoaded", () => {
  renderPatients()
})

// Renderizar lista de pacientes
function renderPatients() {
  const patientsList = document.getElementById("patientsList")

  if (patients.length === 0) {
    patientsList.innerHTML = `
            <div class="empty-state">
                <p>No hay pacientes registrados</p>
                <small>Agrega tu primer paciente usando el botón "Agregar Paciente"</small>
            </div>
        `
    return
  }

  patientsList.innerHTML = patients
    .map(
      (patient) => `
        <div class="patient-card" data-patient-id="${patient.id}">
            <div class="patient-header">
                <h3 class="patient-name">${patient.nombre} ${patient.apellido}</h3>
                <span class="patient-status">Activo</span>
            </div>
            <div class="patient-info">
                <div class="patient-info-item">
                    <strong>Correo:</strong> ${patient.correo}
                </div>
                <div class="patient-info-item">
                    <strong>Teléfono:</strong> ${patient.telefono}
                </div>
                <div class="patient-info-item">
                    <strong>Cédula:</strong> ${patient.cc}
                </div>
                <div class="patient-info-item">
                    <strong>Fecha Nacimiento:</strong> ${formatDate(patient.fechaNacimiento)}
                </div>
            </div>
            ${
              patient.diagnostico
                ? `
                <div class="patient-info-item" style="margin-top: 0.5rem;">
                    <strong>Diagnóstico:</strong> ${patient.diagnostico}
                </div>
            `
                : ""
            }
            <div class="patient-actions">
                <button class="btn-action btn-send-email" onclick="sendEmailToPatient(${patient.id})">
                    Enviar Invitación
                </button>
                <button class="btn-action btn-delete" onclick="deletePatient(${patient.id})">
                    Eliminar
                </button>
            </div>
        </div>
    `,
    )
    .join("")
}

// Filtrar pacientes
function filterPatients() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase()
  const patientCards = document.querySelectorAll(".patient-card")

  patientCards.forEach((card) => {
    const text = card.textContent.toLowerCase()
    if (text.includes(searchTerm)) {
      card.style.display = "block"
    } else {
      card.style.display = "none"
    }
  })
}

// Abrir modal
function openAddPatientModal() {
  const modal = document.getElementById("addPatientModal")
  modal.classList.add("active")
}

// Cerrar modal
function closeAddPatientModal() {
  const modal = document.getElementById("addPatientModal")
  modal.classList.remove("active")
  document.getElementById("addPatientForm").reset()
}

// Cerrar modal al hacer clic fuera
window.onclick = (event) => {
  const modal = document.getElementById("addPatientModal")
  if (event.target === modal) {
    closeAddPatientModal()
  }
}

// Manejar envío del formulario
document.getElementById("addPatientForm").addEventListener("submit", (e) => {
  e.preventDefault()

  const formData = new FormData(e.target)
  const sendEmail = document.getElementById("sendEmail").checked

  const newPatient = {
    id: patients.length + 1,
    nombre: formData.get("nombre"),
    apellido: formData.get("apellido"),
    correo: formData.get("correo"),
    telefono: formData.get("telefono"),
    fechaNacimiento: formData.get("fechaNacimiento"),
    cc: formData.get("cc"),
    diagnostico: formData.get("diagnostico"),
    fechaRegistro: new Date().toISOString().split("T")[0],
  }

  patients.push(newPatient)

  if (sendEmail) {
    sendEmailToPatient(newPatient.id)
  }

  renderPatients()
  closeAddPatientModal()

  alert("Paciente agregado exitosamente" + (sendEmail ? " y correo enviado" : ""))
})

// Enviar correo a paciente
function sendEmailToPatient(patientId) {
  const patient = patients.find((p) => p.id === patientId)

  if (!patient) {
    alert("Paciente no encontrado")
    return
  }

  // Aquí iría la lógica real para enviar el correo
  // Por ahora, solo simulamos el envío
  console.log("[v0] Enviando correo a:", patient.correo)
  console.log("[v0] Datos del paciente:", patient)

  // Simular envío de correo
  alert(
    `Invitación enviada a ${patient.nombre} ${patient.apellido} (${patient.correo})\n\nEl paciente recibirá un correo con sus credenciales de acceso.`,
  )
}

// Eliminar paciente
function deletePatient(patientId) {
  if (confirm("¿Estás seguro de que deseas eliminar este paciente?")) {
    patients = patients.filter((p) => p.id !== patientId)
    renderPatients()
    alert("Paciente eliminado exitosamente")
  }
}

// Cerrar sesión
function logout() {
  if (confirm("¿Deseas cerrar sesión?")) {
    window.location.href = "index.html"
  }
}

// Formatear fecha
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}
