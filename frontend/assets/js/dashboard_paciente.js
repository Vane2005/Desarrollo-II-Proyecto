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
        imagen: "assets/img/ejercicios/pierna1.jpg"
    },
    {
        id: 2,
        nombre: "Flexión de rodilla",
        descripcion: "Ejercicio suave para fortalecer la articulación de la rodilla.",
        parteCuerpo: "Pierna",
        imagen: "assets/img/ejercicios/pierna2.jpg"
    },
    {
        id: 3,
        nombre: "Rotación de hombros",
        descripcion: "Mejora la movilidad y flexibilidad del hombro.",
        parteCuerpo: "Brazo",
        imagen: "assets/img/ejercicios/brazo1.jpg"
    },
    {
        id: 4,
        nombre: "Extensión de codo",
        descripcion: "Fortalece los músculos del brazo y el antebrazo.",
        parteCuerpo: "Brazo",
        imagen: "assets/img/ejercicios/brazo2.jpg"
    },
    {
        id: 5,
        nombre: "Torsión de tronco",
        descripcion: "Ayuda a la movilidad del torso y la columna.",
        parteCuerpo: "Tronco",
        imagen: "assets/img/ejercicios/tronco1.jpg"
    }
];

// Elementos del DOM
const filtersContainer = document.getElementById('filters');
const exercisesGrid = document.getElementById('exercisesGrid');
const noResults = document.getElementById('noResults');

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    generarFiltros();
    mostrarEjercicios(ejercicios);
});

// Generar los botones de filtro dinámicamente
function generarFiltros() {
    const partes = [...new Set(ejercicios.map(e => e.parteCuerpo))];
    filtersContainer.innerHTML = '';

    // Botón "Todos"
    const btnTodos = document.createElement('button');
    btnTodos.textContent = 'Todos';
    btnTodos.classList.add('filter-btn', 'active');
    btnTodos.addEventListener('click', () => filtrarEjercicios(null, btnTodos));
    filtersContainer.appendChild(btnTodos);

    // Botones de cada parte del cuerpo
    partes.forEach(parte => {
        const btn = document.createElement('button');
        btn.textContent = parte;
        btn.classList.add('filter-btn');
        btn.addEventListener('click', () => filtrarEjercicios(parte, btn));
        filtersContainer.appendChild(btn);
    });
}

// Mostrar ejercicios en la cuadrícula
function mostrarEjercicios(lista) {
    exercisesGrid.innerHTML = '';

    if (lista.length === 0) {
        noResults.style.display = 'block';
        return;
    }

    noResults.style.display = 'none';

    lista.forEach(e => {
        const card = document.createElement('div');
        card.classList.add('exercise-card');

        card.innerHTML = `
            <img src="${e.imagen}" alt="${e.nombre}" class="exercise-image">
            <div class="exercise-content">
                <span class="exercise-body-part">${e.parteCuerpo}</span>
                <h3 class="exercise-title">${e.nombre}</h3>
                <p class="exercise-description">${e.descripcion}</p>
            </div>
        `;

        exercisesGrid.appendChild(card);
    });
}

// Filtrar ejercicios según parte del cuerpo
function filtrarEjercicios(parte, boton) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    boton.classList.add('active');

    if (!parte) {
        mostrarEjercicios(ejercicios);
        return;
    }

    const filtrados = ejercicios.filter(e => e.parteCuerpo === parte);
    mostrarEjercicios(filtrados);
}

// Cerrar sesión (ejemplo)
function logout() {
    if (confirm("¿Seguro que deseas cerrar sesión?")) {
        localStorage.clear(); 
        window.location.href = "index.html";
    }
}
