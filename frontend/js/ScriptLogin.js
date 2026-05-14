// Requiere config.js y modal.js cargados antes en el HTML

const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');
const formRegister = document.getElementById('form-registro');
const formLogin = document.getElementById('form-sesion');

// ── Mostrar panel correcto según ?mode= o ?error= ─────────
const params = new URLSearchParams(window.location.search);
const mode = params.get('mode');
if (mode === 'register') container.classList.add("active");

// Si Google devolvió un error, mostramos aviso
if (params.get('error') === 'google') {
    mostrarAlerta("Error con Google", "No se pudo iniciar sesión con Google. Intenta de nuevo.", "error");
}

// ── Si Google redirigió con datos del usuario, guardamos y entramos ──
const googleUserParam = params.get('googleUser');
if (googleUserParam) {
    try {
        const usuario = JSON.parse(decodeURIComponent(googleUserParam));
        // Asegurar que la bandera exista (por compatibilidad)
        if (typeof usuario.hasPassword === 'undefined') usuario.hasPassword = false;
        localStorage.setItem('usuarioSaccarum', JSON.stringify(usuario));
        window.location.replace("index.html");
    } catch (e) {
        console.error("Error al procesar datos de Google:", e);
        mostrarAlerta("Error", "Ocurrió un error al iniciar sesión con Google.", "error");
    }
}

// ── Botones para cambiar panel ─────────────────────────────
registerBtn.addEventListener('click', () => container.classList.add("active"));
loginBtn.addEventListener('click', () => container.classList.remove("active"));

// ── Registro con email / contraseña ───────────────────────
formRegister.addEventListener('submit', async function (evento) {
    evento.preventDefault();
    const nombre = document.getElementById('reg-nombre').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const contrasena = document.getElementById('reg-contrasena').value;

    if (!nombre) {
        await mostrarAlerta("Campo requerido", "El nombre no puede estar vacío.", "warning");
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        await mostrarAlerta("Correo inválido", "Escribe un correo electrónico válido.", "warning");
        return;
    }
    if (contrasena.length < 6) {
        await mostrarAlerta("Contraseña muy corta", "La contraseña debe tener al menos 6 caracteres.", "warning");
        return;
    }

    try {
        const respuesta = await fetch(`${API_NODE}/registro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, email, contrasena })
        });
        if (!respuesta.ok) {
            const data = await respuesta.json().catch(() => ({}));
            throw new Error(data.mensaje || `Error ${respuesta.status}`);
        }
        await mostrarAlerta("¡Registro exitoso!", "Ya puedes iniciar sesión con tu cuenta.", "success");
        formRegister.reset();
        container.classList.remove("active");
    } catch (error) {
        console.error("Error al registrar:", error);
        mostrarAlerta("Error", error.message || "Hubo un problema al registrar. Intenta de nuevo.", "error");
    }
});

// ── Login con email / contraseña ──────────────────────────
formLogin.addEventListener('submit', async function (evento) {
    evento.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const contrasena = document.getElementById('login-contrasena').value;

    if (!email || !contrasena) {
        await mostrarAlerta("Campos incompletos", "Por favor llena todos los campos.", "warning");
        return;
    }

    try {
        const respuesta = await fetch(`${API_NODE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, contrasena })
        });

        // El servidor puede devolver texto o JSON según el tipo de error
        const contentType = respuesta.headers.get('content-type') || '';
        const datos = contentType.includes('application/json')
            ? await respuesta.json()
            : { mensaje: await respuesta.text() };

        if (!respuesta.ok) {
            await mostrarAlerta("Error al iniciar sesión", datos.mensaje, "error");
            return;
        }

        if (datos.exito === true) {
            localStorage.setItem('usuarioSaccarum', JSON.stringify(datos.usuario));
            window.location.href = "index.html";
        } else {
            mostrarAlerta("Error al iniciar sesión", datos.mensaje, "error");
        }
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        mostrarAlerta("Error de conexión", "Hubo un problema al conectar con el servidor.", "error");
    }
});

// ── Mostrar/ocultar contraseña ─────────────────────────────
function configurarOjo(idInput, idIcono) {
    const input = document.getElementById(idInput);
    const icono = document.getElementById(idIcono);
    if (input && icono) {
        icono.addEventListener('click', function () {
            if (input.type === 'password') {
                input.type = 'text';
                icono.innerHTML = '<i class="bi bi-eye-slash"></i>';
            } else {
                input.type = 'password';
                icono.innerHTML = '<i class="bi bi-eye"></i>';
            }
        });
    }
}

configurarOjo('reg-contrasena', 'icono-ojo');
configurarOjo('login-contrasena', 'icono-ojo-login');
