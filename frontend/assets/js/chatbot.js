// ===============================
// ELEMENTOS DEL DOM
// ===============================
const chatBtn = document.getElementById("chatCircleBtn");
const chatWindow = document.getElementById("chatWindow");
const closeChat = document.getElementById("closeChat");
const chatMessages = document.getElementById("chatMessages");
const chatOptions = document.getElementById("chatOptions");


// ===============================
// FUNCIÓN PARA AGREGAR MENSAJES
// ===============================
function addMessage(text, type) {
    const msg = document.createElement("div");
    msg.classList.add("message", type);
    msg.innerText = text;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}


// ===============================
// INICIO DEL CHAT
// ===============================
chatBtn.addEventListener("click", () => {
    chatWindow.style.display = "flex";
    startChat();
});

closeChat.addEventListener("click", () => {
    chatWindow.style.display = "none";
});

function startChat() {
    chatMessages.innerHTML = "";
    addMessage("Hola 👋 ¿De qué quieres hablar hoy?", "bot-msg");
    showOptions("inicio");
}



// ===============================
// BOTONES SEGÚN EL ESTADO
// ===============================
function showOptions(state) {
    chatOptions.innerHTML = "";

    let options = [];

    if (state === "inicio") {
        options = [
            { text: "💪 Motivación para mi terapia", value: "motivacion" },
            { text: "🧠 Quiero aprender sobre mi salud", value: "aprender" },
            { text: "📘 Quiero informarme", value: "info" },
            { text: "🏋️ Consejos para mis ejercicios", value: "ejercicios" }
        ];
    }

    if (state === "motivacion") {
        options = [
            { text: "✨ Dame una frase motivadora", value: "frase" },
            { text: "💡 Dame un consejo", value: "consejo" },
            { text: "🔥 Dame un mini reto", value: "reto" },
            { text: "😊 Necesito ánimo", value: "animo" },
            { text: "🏠 Volver al inicio", value: "inicio" }
        ];
    }

    if (state === "aprender") {
        options = [
            { text: "¿Por qué duelen los músculos?", value: "dolor" },
            { text: "¿Cómo ayuda la fisioterapia?", value: "beneficio" },
            { text: "Háblame de hábitos saludables", value: "habitos" },
            { text: "🏠 Volver al inicio", value: "inicio" }
        ];
    }

    if (state === "info") {
        options = [
            { text: "¿Qué es la fisioterapia?", value: "que_es" },
            { text: "¿Cómo sé si voy mejorando?", value: "progreso" },
            { text: "¿Cada cuánto debo hacer mis ejercicios?", value: "frecuencia" },
            { text: "🏠 Volver al inicio", value: "inicio" }
        ];
    }

    if (state === "ejercicios") {
        options = [
            { text: "Dame un tip", value: "tip" },
            { text: "Dame varios tips", value: "multi_tip" },
            { text: "¿Qué hago si siento molestias?", value: "molestias" },
            { text: "🏠 Volver al inicio", value: "inicio" }
        ];
    }

    // Crear botones
    options.forEach(opt => {
        const b = document.createElement("button");
        b.classList.add("chat-option");
        b.innerText = opt.text;
        b.dataset.value = opt.value;
        b.addEventListener("click", () => handleOption(opt.value, opt.text));
        chatOptions.appendChild(b);
    });
}



// ===============================
// BASES DE DATOS DE RESPUESTAS
// ===============================

// ⚡ Muchísimas frases motivadoras
const frases = [
    "Cada paso que das te acerca a tu mejor versión 💛",
    "Eres más fuerte de lo que crees 💪✨",
    "Tu constancia te llevará lejos, sigue así ❤️",
    "Los pequeños avances se convierten en grandes resultados ✨",
    "Lo estás haciendo muy bien, aunque no lo veas aún 🌟",
    "Hoy es un buen día para avanzar un poquito más 🚀",
    "Tu cuerpo y tu salud merecen este esfuerzo 🌱",
    "Tú puedes con esto, confía en ti 💚"
];

// 🟦 Consejos motivacionales y de bienestar
const consejos = [
    "Haz tus ejercicios suavemente, sin dolor intenso.",
    "Hidrátate bien, tus músculos lo necesitan.",
    "Apunta tu progreso, te motivará mucho.",
    "Respira profundo antes de empezar cada ejercicio.",
    "Haz estiramientos lentos y controlados.",
    "Evita hacer movimientos bruscos.",
    "Toma pausas cortas si lo necesitas."
];

// 🔥 Mini retos positivos
const retos = [
    "Hoy intenta hacer 3 respiraciones profundas antes de empezar 💨",
    "Intenta 1 minuto más de estiramiento del habitual.",
    "Haz tu ejercicio favorito pero más lento y consciente.",
    "Intenta mantener tu postura recta por 2 minutos.",
    "Hoy proponte terminar tu rutina sin distraerte."
];

// 💛 Mensajes de apoyo emocional
const animos = [
    "Está bien sentirse así, lo importante es que sigues aquí 💛",
    "Un mal día no borra tu progreso 🌤️",
    "Estoy contigo, cuéntame qué te preocupa 🤗",
    "Tu salud mental también es importante, respira ✨",
    "Poco a poco, un día a la vez 💚"
];

// 📘 Información educativa
const aprender = {
    dolor: [
        "El dolor muscular aparece por micro desgarros normales al ejercitarte. Con descanso y constancia mejora 💪",
        "El dolor tardío es normal cuando un músculo se está adaptando.",
        "Si el dolor es punzante o muy fuerte, detén el ejercicio y avisa a tu fisioterapeuta."
    ],
    beneficio: [
        "La fisioterapia reduce dolor, mejora movilidad y fortalece tu cuerpo 💛",
        "Ayuda a recuperar movimientos perdidos después de lesiones.",
        "Previene futuras molestias mejorando tu postura y fuerza."
    ],
    habitos: [
        "Dormir bien mejora tu recuperación muscular.",
        "Tomar agua ayuda a tus articulaciones.",
        "Caminar 10–15 minutos al día mejora tu circulación.",
        "La constancia es la clave del progreso."
    ]
};

// ℹ️ Información general
const info = {
    que_es: [
        "La fisioterapia es una disciplina que ayuda a recuperar movilidad, reducir dolor y mejorar tu calidad de vida 💛",
        "Incluye ejercicios, masajes, estiramientos y técnicas para tu bienestar."
    ],
    progreso: [
        "Si te duele menos, te mueves más o recuperas fuerza, ¡estás progresando! 🙌",
        "El progreso no siempre es lineal, pero cada esfuerzo suma."
    ],
    frecuencia: [
        "Lo ideal es hacer tus ejercicios 4–6 veces por semana, según tu fisioterapeuta.",
        "La constancia vale más que la intensidad."
    ]
};

// 🏋️ Tips de ejercicios
const tips = [
    "Mantén una respiración suave mientras haces cada movimiento 💨",
    "Activa tu abdomen para proteger tu espalda.",
    "Haz los movimientos lentos y controlados.",
    "Evita compensar con otras partes del cuerpo.",
    "Haz una pausa de 30 segundos entre series."
];

const molestias = [
    "Si sientes molestias leves, baja el ritmo y controla la respiración.",
    "Si es un dolor fuerte o punzante, detén el ejercicio.",
    "Puedes usar hielo 10–15 minutos si hay inflamación."
];



// ===============================
// MANEJO DE OPCIONES DEL USUARIO
// ===============================
function handleOption(value, label) {
    addMessage("Tú: " + label, "user-msg");

    let response = "";
    let nextState = "inicio";

    switch (value) {

        // ===== MOTIVACIÓN =====
        case "motivacion":
            response = "¡Genial! La motivación es clave. ¿Qué te gustaría?";
            nextState = "motivacion";
            break;

        case "frase":
            response = frases[Math.floor(Math.random() * frases.length)];
            nextState = "motivacion";
            break;

        case "consejo":
            response = consejos[Math.floor(Math.random() * consejos.length)];
            nextState = "motivacion";
            break;

        case "reto":
            response = retos[Math.floor(Math.random() * retos.length)];
            nextState = "motivacion";
            break;

        case "animo":
            response = animos[Math.floor(Math.random() * animos.length)];
            nextState = "motivacion";
            break;


        // ===== APRENDER =====
        case "aprender":
            response = "Perfecto, ¿qué quieres aprender hoy?";
            nextState = "aprender";
            break;

        case "dolor":
            response = aprender.dolor[Math.floor(Math.random() * aprender.dolor.length)];
            nextState = "aprender";
            break;

        case "beneficio":
            response = aprender.beneficio[Math.floor(Math.random() * aprender.beneficio.length)];
            nextState = "aprender";
            break;

        case "habitos":
            response = aprender.habitos[Math.floor(Math.random() * aprender.habitos.length)];
            nextState = "aprender";
            break;


        // ===== INFORMACIÓN =====
        case "info":
            response = "Claro, ¿qué información necesitas?";
            nextState = "info";
            break;

        case "que_es":
            response = info.que_es[Math.floor(Math.random() * info.que_es.length)];
            nextState = "info";
            break;

        case "progreso":
            response = info.progreso[Math.floor(Math.random() * info.progreso.length)];
            nextState = "info";
            break;

        case "frecuencia":
            response = info.frecuencia[Math.floor(Math.random() * info.frecuencia.length)];
            nextState = "info";
            break;


        // ===== EJERCICIOS =====
        case "ejercicios":
            response = "Perfecto, ¿qué necesitas?";
            nextState = "ejercicios";
            break;

        case "tip":
            response = tips[Math.floor(Math.random() * tips.length)];
            nextState = "ejercicios";
            break;

        case "multi_tip":
            response = 
                "Aquí tienes varios tips:\n• " +
                tips.slice(0, 3).join("\n• ");
            nextState = "ejercicios";
            break;

        case "molestias":
            response = molestias[Math.floor(Math.random() * molestias.length)];
            nextState = "ejercicios";
            break;


        // ===== VOLVER AL INICIO =====
        case "inicio":
            return startChat();


        // ===== DEFAULT =====
        default:
            response = "Aún no tengo una respuesta para eso, pero puedo ayudarte con motivación, ejercicios o información 😊";
            nextState = "inicio";
    }

    addMessage(response, "bot-msg");
    showOptions(nextState);
}
