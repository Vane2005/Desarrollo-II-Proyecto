// frontend/assets/js/login.js
/*document.getElementById("loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("usuario").value.trim();
  const contrasena = document.getElementById("contrasena").value.trim();
  const errorDiv = document.getElementById("error-message");

  try {
    const response = await fetch("http://127.0.0.1:8000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        contrasena: contrasena
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Error en las credenciales");
    }

    const data = await response.json();

    // Guardamos el token en localStorage
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("nombre", data.nombre);
    localStorage.setItem("tipo_usuario", data.tipo_usuario);

    alert("Inicio de sesión exitoso ✅");
    window.location.href = "index.html"; // redirige donde tú quieras

  } catch (error) {
    console.error("Error en login:", error);
    errorDiv.style.display = "block";
    errorDiv.textContent = error.message || "Error al conectar con el servidor.";
  }
});
*/