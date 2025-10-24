// ===============================
// DASHBOARD FISIO JS COMPLETO
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "http://localhost:8000/paciente";

  const navItems = document.querySelectorAll(".nav-item");
  const sections = document.querySelectorAll(".content-section");
  const sectionTitle = document.getElementById("section-title");
  const logoutBtn = document.querySelector(".btn-logout");
  const toggleSidebarBtn = document.getElementById("toggleSidebar");
  const sidebar = document.getElementById("sidebar");

  const sectionTitles = {
    "informacion-personal": "Información Personal",
    "asignar-ejercicios": "Asignar Ejercicios",
    "avance-paciente": "Avance Paciente",
  };

  // === Toggle Sidebar ===
  toggleSidebarBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
  });

  // === Navegación entre secciones ===
  navItems.forEach((item) => {
    item.addEventListener("click", function () {
      const targetSection = this.getAttribute("data-section");
      navItems.forEach((nav) => nav.classList.remove("active"));
      sections.forEach((section) => section.classList.remove("active"));

      this.classList.add("active");
      document.getElementById(targetSection).classList.add("active");
      sectionTitle.textContent = sectionTitles[targetSection];
    });
  });

  // === Logout ===
  logoutBtn.addEventListener("click", () => {
    if (confirm("¿Desea cerrar sesión?")) window.location.href = "login.html";
  });

  // ==========================================
  // 🔍 BUSCAR PACIENTE POR CÉDULA
  // ==========================================
 // debug: buscar paciente y mostrar status + body en consola
const btnBuscar = document.getElementById("btnBuscarCedula");
if (btnBuscar) {
  btnBuscar.addEventListener("click", async () => {
    const cedula = document.getElementById("cedulaInput").value.trim();
    if (!cedula) return alert("Por favor ingrese una cédula");

    try {
      const res = await fetch(`${API_URL}/${cedula}`);
      // debug: ver status y texto
      console.log("FETCH /paciente status:", res.status);
      const text = await res.text();
      console.log("FETCH /paciente body (raw):", text);

      // Luego parsear si es JSON válido
      if (!res.ok) {
        // intenta mostrar JSON si viene así
        try {
          const errJson = JSON.parse(text);
          alert("No encontrado: " + (errJson.detail || JSON.stringify(errJson)));
        } catch (e) {
          alert("No encontrado (status " + res.status + ")");
        }
        document.getElementById("infoPaciente").style.display = "none";
        return;
      }

      const data = JSON.parse(text);
      document.getElementById("infoPaciente").style.display = "block";
      document.getElementById("pacienteNombre").textContent = data.nombre;
      document.getElementById("pacienteCorreo").textContent = data.correo;
      window.pacienteCedula = cedula;
      console.log("Paciente encontrado:", data);
    } catch (error) {
      console.error("Error fetch paciente:", error);
      alert("❌ Error de conexión con el servidor");
      document.getElementById("infoPaciente").style.display = "none";
    }
  });
}


  // ==========================================
  // 🏋️ CARGAR EJERCICIOS DISPONIBLES
  // ==========================================
  async function cargarEjercicios() {
    try {
      const res = await fetch(`${API_URL}/ejercicios`);
      const ejercicios = await res.json();

      const container = document.getElementById("exercisesGrid");
      container.innerHTML = "";

      ejercicios.forEach((e) => {
        const card = document.createElement("div");
        card.classList.add("exercise-card");
        card.innerHTML = `
          <label class="exercise-item">
            <input type="checkbox" class="exercise-checkbox" value="${e.id_ejercicio}">
            <h3>${e.nombre}</h3>
            <p>${e.descripcion}</p>
            <small>${e.parte_cuerpo}</small>
          </label>
        `;
        container.appendChild(card);
      });
    } catch (err) {
      console.error("Error cargando ejercicios:", err);
    }
  }

  cargarEjercicios();

  // ==========================================
  // ✅ ASIGNAR EJERCICIOS A PACIENTE
  // ==========================================
  const assignBtn = document.getElementById("assignSelectedExercises");
  if (assignBtn) {
    assignBtn.addEventListener("click", async () => {
      if (!window.pacienteCedula) {
        alert("Primero busque un paciente por cédula.");
        return;
      }

      const seleccionados = Array.from(
        document.querySelectorAll(".exercise-checkbox:checked")
      ).map((cb) => parseInt(cb.value));

      if (seleccionados.length === 0) {
        alert("Seleccione al menos un ejercicio.");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/asignar-ejercicio`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cedula_paciente: window.pacienteCedula,
            ejercicios: seleccionados,
          }),
        });

        if (!res.ok) throw new Error("Error al asignar");
        alert("✅ Ejercicios asignados correctamente");
        document
          .querySelectorAll(".exercise-checkbox:checked")
          .forEach((cb) => (cb.checked = false));
      } catch (error) {
        alert("❌ Error al asignar ejercicios");
        console.error(error);
      }
    });
  }
});
