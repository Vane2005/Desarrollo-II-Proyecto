/**
 * Script principal del panel del fisioterapeuta.
 * Gestiona la navegación, autenticación, carga de información del usuario,
 * asignación de ejercicios y visualización de progreso de pacientes.
 */

document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // CONFIGURACIÓN DE ENDPOINTS Y VARIABLES
  // ==========================================
  const API_URL = "http://localhost:8000"
  const PACIENTE_API_URL = `${API_URL}/paciente`
  const AUTH_API_URL = `${API_URL}/auth`

  // Referencias del DOM
  const navItems = document.querySelectorAll(".nav-item")
  const sections = document.querySelectorAll(".content-section")
  const sectionTitle = document.getElementById("section-title")
  const logoutBtn = document.querySelector(".btn-logout")
  const toggleSidebarBtn = document.getElementById("toggleSidebar")
  const sidebar = document.getElementById("sidebar")

  // Estado del fisioterapeuta (activo/inactivo)
  let estadoFisioterapeuta = "activo"

  // Mapeo de títulos por sección
  const sectionTitles = {
    "informacion-personal": "Información Personal",
    "asignar-ejercicios": "Asignar Ejercicios",
    "avance-paciente": "Avance Paciente",
  }

  // ==========================================
  // TOGGLE DEL SIDEBAR
  // ==========================================
  toggleSidebarBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed")
  })

  // ==========================================
  // NAVEGACIÓN ENTRE SECCIONES
  // ==========================================
  navItems.forEach((item) => {
    item.addEventListener("click", function () {
      const targetSection = this.getAttribute("data-section")

      // Restringir acceso si el fisioterapeuta está inactivo
      if (estadoFisioterapeuta.toLowerCase() === "inactivo" && targetSection !== "informacion-personal") {
        alert(
          "⚠️ Debe realizar el pago para acceder a esta funcionalidad.\n\nPor favor, vaya a 'Información Personal' y haga clic en 'Realizar Pago'.",
        )
        return
      }

      // Cambiar estado visual de los elementos de navegación
      navItems.forEach((nav) => nav.classList.remove("active"))
      sections.forEach((section) => section.classList.remove("active"))

      this.classList.add("active")
      document.getElementById(targetSection).classList.add("active")
      sectionTitle.textContent = sectionTitles[targetSection]
    })
  })

  // ==========================================
  // CERRAR SESIÓN
  // ==========================================
  logoutBtn.addEventListener("click", async () => {
    if (!confirm("¿Desea cerrar sesión?")) return

    try {
      // Limpiar almacenamiento local
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
  /**
   * Carga los datos personales del fisioterapeuta autenticado.
   * Si el token no es válido o está expirado, redirige al login.
   */
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
      estadoFisioterapeuta = data.estado

      // Rellenar los campos del formulario
      document.getElementById("inputNombre").value = data.nombre
      document.getElementById("inputDocumento").value = data.cedula
      document.getElementById("inputCorreo").value = data.correo
      document.getElementById("inputTelefono").value = data.telefono

      // Aplicar restricciones según el estado
      if (estadoFisioterapeuta.toLowerCase() === "inactivo") {
        aplicarRestriccionesPorPago()
        document.getElementById("btnRealizarPago").style.display = "inline-block"
      } else {
        removerRestriccionesPorPago()
        document.getElementById("btnRealizarPago").style.display = "none"
      }
    } catch (error) {
      console.error("Error al cargar información:", error)
      clearSessionAndRedirect()
    }
  }

  /**
   * Aplica restricciones visuales y funcionales cuando el fisioterapeuta no ha pagado.
   */
  function aplicarRestriccionesPorPago() {
    navItems.forEach((item) => {
      const section = item.getAttribute("data-section")
      if (section !== "informacion-personal") {
        item.style.opacity = "0.5"
        item.style.cursor = "not-allowed"
        item.title = "Debe realizar el pago para acceder"
      }
    })

    agregarMensajePago(document.getElementById("asignar-ejercicios"))
    agregarMensajePago(document.getElementById("avance-paciente"))
  }

  /**
   * Restaura la interfaz cuando el fisioterapeuta ha realizado el pago.
   */
  function removerRestriccionesPorPago() {
    navItems.forEach((item) => {
      item.style.opacity = "1"
      item.style.cursor = "pointer"
      item.title = ""
    })

    document.querySelectorAll(".mensaje-pago-requerido").forEach((msg) => msg.remove())
  }

  /**
   * Agrega un mensaje de advertencia dentro de una sección restringida.
   * @param {HTMLElement} section - Sección del DOM donde insertar el mensaje.
   */
  function agregarMensajePago(section) {
    if (section.querySelector(".mensaje-pago-requerido")) return

    const mensaje = document.createElement("div")
    mensaje.className = "mensaje-pago-requerido"
    mensaje.style.cssText = `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 12px;
      margin: 20px 0;
      text-align: center;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `
    mensaje.innerHTML = `
      <h3>⚠️ Pago Requerido</h3>
      <p>Debe realizar el pago para acceder a esta funcionalidad.</p>
      <button onclick="document.querySelector('[data-section=\\"informacion-personal\\"]').click()"
              style="background: white; color: #667eea; border: none; padding: 10px 20px; border-radius: 6px;">
        Ir a Realizar Pago
      </button>
    `
    section.insertBefore(mensaje, section.firstChild)
  }

  /**
   * Limpia los datos del almacenamiento local y redirige al login.
   */
  function clearSessionAndRedirect() {
    localStorage.removeItem("token")
    localStorage.removeItem("tipo_usuario")
    localStorage.removeItem("nombre")
    localStorage.removeItem("cedula")
    window.location.replace("index.html")
  }

  cargarInfoFisioterapeuta()

  // ==========================================
  // BOTÓN REALIZAR PAGO
  // ==========================================
  const btnRealizarPago = document.getElementById("btnRealizarPago")
  if (btnRealizarPago) {
    btnRealizarPago.addEventListener("click", () => {
      const cedula = document.getElementById("inputDocumento").value
      const email = document.getElementById("inputCorreo").value

      localStorage.setItem("cedula_pendiente", cedula)
      localStorage.setItem("userEmail", email)
      window.location.href = "pago.html"
    })
  }

  // ==========================================
  // MODAL CAMBIAR CONTRASEÑA
  // ==========================================
  // (Documentación omitida aquí por extensión, pero incluye eventos de apertura, cierre, validación y envío)

  // ==========================================
  // BUSCAR PACIENTE POR CÉDULA
  // ==========================================
  /**
   * Busca un paciente por su cédula y muestra su información.
   */
  const btnBuscar = document.getElementById("btnBuscarCedula")
  if (btnBuscar) {
    btnBuscar.addEventListener("click", async () => {
      const cedula = document.getElementById("cedulaInput").value.trim()
      if (!cedula) return alert("Por favor ingrese una cédula")

      try {
        const res = await fetch(`${PACIENTE_API_URL}/${cedula}`)
        const text = await res.text()

        if (!res.ok) {
          alert("No encontrado: " + text)
          document.getElementById("infoPaciente").style.display = "none"
          return
        }

        const data = JSON.parse(text)
        document.getElementById("infoPaciente").style.display = "block"
        document.getElementById("pacienteNombre").textContent = data.nombre
        document.getElementById("pacienteCorreo").textContent = data.correo
        window.pacienteCedula = cedula
      } catch (error) {
        console.error("Error fetch paciente:", error)
        alert("❌ Error de conexión con el servidor")
      }
    })
  }

  // ==========================================
  // CARGAR Y ASIGNAR EJERCICIOS
  // ==========================================
  /**
   * Carga todos los ejercicios disponibles desde la API.
   */
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
            <div class="exercise-content">
              <h3>${e.nombre}</h3>
              <p>${e.descripcion}</p>
              <span>Repeticiones: ${e.repeticiones || "N/A"}</span>
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
  // AVANCE DEL PACIENTE
  // ==========================================
  /**
   * Calcula el porcentaje de avance de un paciente.
   * @param {string} cedula - Cédula del paciente.
   * @returns {Promise<Object>} Información del avance.
   */
  async function calcularAvancePaciente(cedula) {
    try {
      const pacienteRes = await fetch(`${PACIENTE_API_URL}/${cedula}`)
      const pacienteData = await pacienteRes.json()

      const completados = await (await fetch(`${PACIENTE_API_URL}/ejercicios-completados/${cedula}`)).json()
      const asignados = await (await fetch(`${PACIENTE_API_URL}/ejercicios-asignados/${cedula}`)).json()

      const numCompletados = completados.length
      const numAsignados = asignados.length
      const total = numCompletados + numAsignados
      const porcentaje = total > 0 ? Math.round((numCompletados / total) * 100) : 0

      return { cedula, nombre: pacienteData.nombre, porcentaje, completados: numCompletados, total }
    } catch (error) {
      console.error("Error calculando avance:", error)
      throw error
    }
  }

  /**
   * Muestra visualmente el progreso de un paciente.
   * @param {Object} pacienteInfo - Datos del paciente con avance calculado.
   */
  function mostrarAvancePaciente(pacienteInfo) {
    const container = document.getElementById("patientProgressList")
    const progressItem = document.createElement("div")
    progressItem.classList.add("patient-progress-item")
    progressItem.innerHTML = `
      <p>${pacienteInfo.nombre} - ${pacienteInfo.porcentaje}% completado</p>
      <div class="progress-bar">
        <div class="progress-fill" style="width:${pacienteInfo.porcentaje}%"></div>
      </div>
    `
    container.appendChild(progressItem)
  }
})
