// assets/js/detalle_paciente.js
document.addEventListener("DOMContentLoaded", async () => {
    const PACIENTE_API = "http://localhost:8000/paciente";
    const AUTH_API = "http://localhost:8000/auth";

    // Helpers UI
    function showPageError(text) {
        // crea un mensaje visible en la parte superior
        let wrapper = document.getElementById("errorWrapper");
        if (!wrapper) {
            wrapper = document.createElement("div");
            wrapper.id = "errorWrapper";
            wrapper.style.cssText = "background:#ffe6e6;color:#900;padding:12px;border-radius:6px;margin:10px 0;";
            document.querySelector(".page-container")?.prepend(wrapper);
        }
        wrapper.innerText = text;
    }

    function clearPageError() {
        const wrapper = document.getElementById("errorWrapper");
        if (wrapper) wrapper.remove();
    }

    // 1) Leer parámetros y localStorage
    const params = new URLSearchParams(window.location.search);
    const cedulaFromUrl = params.get("cedula");
    let fisioId = params.get("fisio_id") || localStorage.getItem("fisioId");

    console.log("DEBUG - URL search:", window.location.search);
    console.log("DEBUG - cedulaFromUrl:", cedulaFromUrl, "fisioId (initial):", fisioId);

    // 2) Si no hay fisioId intentar obtenerlo desde /auth/info-fisioterapeuta si hay token
    async function obtenerFisioIdPorToken() {
        try {
            const token = localStorage.getItem("token");
            if (!token) return null;

            const res = await fetch(`${AUTH_API}/info-fisioterapeuta`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!res.ok) {
                console.warn("No se pudo obtener info-fisioterapeuta con token:", res.status);
                return null;
            }

            const data = await res.json();
            // asumo que la respuesta contiene la cedula del fisio en data.cedula o data.id
            console.log("DEBUG - info-fisioterapeuta:", data);
            return data.cedula || data.id || null;
        } catch (err) {
            console.warn("Error al pedir info-fisioterapeuta:", err);
            return null;
        }
    }

    if (!fisioId) {
        // intentar leer desde token
        fisioId = await obtenerFisioIdPorToken();
        console.log("DEBUG - fisioId from token:", fisioId);
        if (fisioId) {
            // opcional: guardar para próximas páginas
            try { localStorage.setItem("fisioId", fisioId); } catch (e) { /* ignore */ }
        }
    }

    // 3) Validación final: si no hay cedula o fisioId mostrar error visible y detener
    if (!cedulaFromUrl || !fisioId) {
        console.error("Faltan parámetros: cedula o fisio_id", { cedulaFromUrl, fisioId });
        showPageError("No se pudo cargar los datos: falta la cédula del paciente o la cédula del fisioterapeuta (fisio_id). " +
            "Asegúrate de abrir esta página desde la lista de pacientes o de estar autenticado.");
        return;
    }

    clearPageError();

    const cedula = cedulaFromUrl;

    // añadir título si existe
    const tituloEl = document.getElementById("tituloCedula");
    if (tituloEl) tituloEl.innerText = `Paciente: ${cedula}`;

    // función segura para setear texto sólo si el elemento existe
    function setTextIfExists(id, text) {
        const el = document.getElementById(id);
        if (el) el.innerText = text ?? "";
    }

    // 4) Cargar info real del paciente
    try {
        const urlPaciente = `${PACIENTE_API}/${encodeURIComponent(cedula)}?fisio_id=${encodeURIComponent(fisioId)}`;
        console.log("DEBUG - urlPaciente:", urlPaciente);

        const res = await fetch(urlPaciente);
        if (!res.ok) {
            // intentar leer body para mensaje de error
            let body = "";
            try { body = await res.text(); } catch (e) { /* ignore */ }
            console.error("Error al obtener paciente:", res.status, body);
            showPageError("No autorizado o paciente no pertenece al fisioterapeuta.");
            return;
        }

        const paciente = await res.json();
        console.log("DEBUG - paciente:", paciente);

        setTextIfExists("pacienteNombre", paciente.nombre || "—");
        // el endpoint actual no devuelve cedula; la cédula la tenemos en la URL
        setTextIfExists("pacienteCedula", cedula);
        setTextIfExists("pacienteCorreo", paciente.correo || "—");
        setTextIfExists("pacienteTelefono", paciente.telefono || "—");
        // el campo se llama 'historiaclinica' en tu backend según lo mostrado; probar ambas variantes
        setTextIfExists("pacienteHistoria", paciente.historiaclinica ?? paciente.historia_clinica ?? "No registrada");

    } catch (err) {
        console.error("Error cargando info del paciente:", err);
        showPageError("Error al cargar la información del paciente. Revisa la consola para más detalles.");
        return;
    }

    // 5) Cargar ejercicios por grupo (con fisio_id)
    try {
        const urlProgreso = `${PACIENTE_API}/ejercicios-por-grupo/${encodeURIComponent(cedula)}?fisio_id=${encodeURIComponent(fisioId)}`;
        console.log("DEBUG - urlProgreso:", urlProgreso);

        const res2 = await fetch(urlProgreso);
        if (!res2.ok) {
            const txt = await res2.text().catch(() => "");
            console.error("Error al obtener progreso por grupo:", res2.status, txt);
            showPageError("No fue posible obtener el progreso del paciente.");
            return;
        }

        const data = await res2.json();

        const tabla = document.getElementById("tablaProgreso");
        if (tabla) {
            tabla.innerHTML = data
                .map(g => `
                    <tr>
                        <td>${g.grupo_terapia ?? ""}</td>
                        <td>${g.total_ejercicios ?? 0}</td>
                        <td>${g.completados ?? 0}</td>
                        <td>${g.pendientes ?? 0}</td>
                        <td>${g.progreso_porcentaje ?? 0}%</td>
                    </tr>
                `).join("");
        }

        // gráfica si existe canvas
        const ctx = document.getElementById("graficaProgreso");
        if (ctx && Array.isArray(data)) {
            // destruir instancia previa si existe (si usas Chart.js global)
            try {
                if (ctx._chartInstance) {
                    ctx._chartInstance.destroy();
                    ctx._chartInstance = null;
                }
            } catch (e) { /* ignore */ }

            const chart = new Chart(ctx, {
                type: "line",
                data: {
                    labels: data.map(g => `Grupo ${g.grupo_terapia}`),
                    datasets: [{
                        label: "Progreso %",
                        data: data.map(g => g.progreso_porcentaje ?? 0),
                        borderWidth: 3,
                        tension: 0.35,
                        borderColor: "#16a085",
                        backgroundColor: "rgba(22,160,133,0.2)",
                        pointBackgroundColor: "#16a085",
                        pointRadius: 5
                    }]
                },
                options: {
                    scales: {
                        y: { beginAtZero: true, max: 100 }
                    }
                }
            });

            // guardar referencia para posible destrucción más adelante
            ctx._chartInstance = chart;
        }

    } catch (err) {
        console.error("Error cargando progreso por grupo:", err);
        showPageError("Error al cargar el progreso del paciente.");
        return;
    }

    async function cargarCalificaciones() {
    try {
        const url = `${PACIENTE_API}/calificaciones/${encodeURIComponent(cedula)}`;

        console.log("DEBUG calificaciones URL:", url);

        const res = await fetch(url);

        if (!res.ok) {
            console.error("Error al obtener calificaciones", res.status);
            return;
        }

        const datos = await res.json();
        console.log("DEBUG calificaciones:", datos);

        mostrarCalificaciones(datos);

    } catch (error) {
        console.error("Error cargando calificaciones:", error);
    }
}
function mostrarCalificaciones(lista) {
    const tbody = document.getElementById("tablaCalificaciones");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!lista || lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6">Este paciente aún no ha calificado ejercicios.</td></tr>`;
        return;
    }

    lista.forEach(item => {
        const tr = document.createElement("tr");

        const fecha = item.fecha_realizado
            ? item.fecha_realizado.split("T")[0]
            : "—";

        tr.innerHTML = `
            <td>${item.ejercicio}</td>
            <td>${item.dolor ?? "—"}</td>
            <td>${item.sensacion ?? "—"}</td>
            <td>${item.cansancio ?? "—"}</td>
            <td>${item.observaciones ?? "—"}</td>
            <td>${fecha}</td>
        `;

        tbody.appendChild(tr);
    });
}

cargarCalificaciones();

});
