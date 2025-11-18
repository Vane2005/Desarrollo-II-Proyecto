document.addEventListener("DOMContentLoaded", async () => {
    const API_URL = "http://localhost:8000/paciente";

    // Obtener cédula del URL
    const cedula = new URLSearchParams(window.location.search).get("cedula");
    document.getElementById("tituloCedula").innerText = `Paciente: ${cedula}`;

    // Obtener datos del backend
    const response = await fetch(`${API_URL}/ejercicios-por-grupo/${cedula}`);
    const data = await response.json();

    // Renderizar tabla
    const tabla = document.getElementById("tablaProgreso");
    tabla.innerHTML = data
        .map(
            g => `
        <tr>
            <td>${g.grupo_terapia}</td>
            <td>${g.total_ejercicios}</td>
            <td>${g.completados}</td>
            <td>${g.pendientes}</td>
            <td>${g.progreso_porcentaje}%</td>
        </tr>
    `
        )
        .join("");

    // Renderizar gráfica de línea
    const ctx = document.getElementById("graficaProgreso");

    new Chart(ctx, {
        type: "line",
        data: {
            labels: data.map(g => `Grupo ${g.grupo_terapia}`),
            datasets: [
                {
                    label: "Progreso %",
                    data: data.map(g => g.progreso_porcentaje),
                    borderWidth: 3,
                    tension: 0.35,
                    borderColor: "#16a085",
                    backgroundColor: "rgba(22,160,133,0.2)",
                    pointBackgroundColor: "#16a085",
                    pointRadius: 5
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
});
