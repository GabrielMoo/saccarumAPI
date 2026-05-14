// Requiere config.js y modal.js cargados antes en el HTML

document.addEventListener("DOMContentLoaded", async () => {
    const usuarioStr = localStorage.getItem('usuarioSaccarum');

    if (!usuarioStr) {
        window.location.href = "login-register.html";
        return;
    }

    const usuario = getUsuario();
    if (!usuario) {
        window.location.href = "login-register.html";
        return;
    }

    if (usuario && usuario.hasPassword === false) {
        const passActual = document.getElementById("pass-actual");
        const passNueva = document.getElementById("pass-nueva");
        const btnCambiar = document.getElementById("btn-cambiar-pass");
        const mensajeDiv = document.getElementById("mensaje-google-warning");

        if (passActual) passActual.disabled = true;
        if (passNueva) passNueva.disabled = true;
        if (btnCambiar) btnCambiar.disabled = true;
        if (mensajeDiv) {
            mensajeDiv.innerHTML = "Función no válida para usuarios que iniciaron sesión con Google.";
        }
    }

    const elementoNombre = document.getElementById("perfil-nombre");
    if (elementoNombre) elementoNombre.textContent = usuario.nombre;

    const elementoEmail = document.getElementById("perfil-email");
    if (elementoEmail) elementoEmail.textContent = usuario.email;

    const inputFoto = document.getElementById("input-foto");
    const imgPerfil = document.getElementById("img-perfil");
    const btnGuardarFoto = document.getElementById("btn-guardar-foto");

    let archivoSeleccionado = null;

    // Cargar foto de perfil desde la BD
    try {
        const respuesta = await fetch(`${API_NODE}/api/avatar/obtener-avatar/${usuario.id}`);
        if (!respuesta.ok) throw new Error(`Error del servidor: ${respuesta.status}`);
        const datos = await respuesta.json();
        if (datos.exito && datos.avatar && imgPerfil) {
            imgPerfil.src = datos.avatar.imagen_enlace;
        }
    } catch (error) {
        console.error("Error al cargar la foto de perfil:", error);
    }

    if (inputFoto) {
        inputFoto.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                archivoSeleccionado = file;
                btnGuardarFoto.style.display = "inline-block";
                const reader = new FileReader();
                reader.onload = (evento) => { imgPerfil.src = evento.target.result; };
                reader.readAsDataURL(file);
            }
        });
    }

    if (btnGuardarFoto) {
        btnGuardarFoto.addEventListener("click", async () => {
            if (!archivoSeleccionado) return;
            const formData = new FormData();
            formData.append('imagen', archivoSeleccionado);
            formData.append('usuario', usuario.id);

            try {
                btnGuardarFoto.textContent = "Guardando...";
                btnGuardarFoto.disabled = true;
                const response = await fetch(`${API_NODE}/api/avatar/guardar-avatar`, {
                    method: 'POST',
                    body: formData
                });
                if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
                await response.json();
                await mostrarAlerta("¡Listo!", "Foto de perfil actualizada exitosamente.", "success");
                btnGuardarFoto.style.display = "none";
            } catch (error) {
                console.error("Error al guardar foto:", error);
                mostrarAlerta("Error de conexión", "Hubo un problema de conexión con el servidor.", "error");
            } finally {
                btnGuardarFoto.textContent = "Guardar Foto";
                btnGuardarFoto.disabled = false;
            }
        });
    }

    // Cerrar sesión
    const btnCerrarSesion = document.getElementById("btn-cerrar-sesion");
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener("click", () => {
            localStorage.removeItem('usuarioSaccarum');
            window.location.href = "login-register.html";
        });
    }

    // Eliminar cuenta
    const btnEliminarCuenta = document.getElementById("btn-eliminar-cuenta");
    if (btnEliminarCuenta) {
        btnEliminarCuenta.addEventListener("click", async () => {
            const confirmado = await mostrarConfirm(
                "Eliminar Cuenta",
                "¿Estás seguro de que deseas eliminar tu cuenta permanentemente? Esta acción no se puede deshacer.",
                "Eliminar cuenta",
                "error"
            );
            if (!confirmado) return;
            try {
                const response = await fetch(`${API_NODE}/eliminar/${usuario.id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
                await mostrarAlerta("Cuenta eliminada", "Tu cuenta ha sido eliminada correctamente.", "info");
                localStorage.removeItem('usuarioSaccarum');
                window.location.href = "login-register.html";
            } catch (error) {
                console.error("Error al eliminar cuenta:", error);
                mostrarAlerta("Error", "No se pudo eliminar la cuenta. Intenta de nuevo.", "error");
            }
        });
    }

    // Cambiar contraseña
    const btnCambiarPass = document.getElementById("btn-cambiar-pass");
    if (btnCambiarPass) {
        btnCambiarPass.addEventListener("click", async () => {
            const passActual = document.getElementById("pass-actual").value;
            const passNueva = document.getElementById("pass-nueva").value;

            if (!passActual || !passNueva) {
                await mostrarAlerta("Campos incompletos", "Por favor, llena ambos campos de contraseña.", "warning");
                return;
            }
            if (passNueva.length < 6) {
                await mostrarAlerta("Contraseña muy corta", "La nueva contraseña debe tener al menos 6 caracteres.", "warning");
                return;
            }

            try {
                btnCambiarPass.textContent = "Actualizando...";
                btnCambiarPass.disabled = true;
                const response = await fetch(`${API_NODE}/cambiar-contrasena`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        usuarioId: usuario.id,
                        contrasenaActual: passActual,
                        nuevaContrasena: passNueva
                    })
                });
                if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
                const data = await response.json();
                await mostrarAlerta("¡Listo!", data.mensaje, "success");
                document.getElementById("pass-actual").value = "";
                document.getElementById("pass-nueva").value = "";
            } catch (error) {
                console.error("Error al cambiar contraseña:", error);
                mostrarAlerta("Error de conexión", "Hubo un problema al conectar con el servidor.", "error");
            } finally {
                btnCambiarPass.textContent = "Confirmar Cambio";
                btnCambiarPass.disabled = false;
            }
        });
    }
});

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

configurarOjo('pass-actual', 'icono-ojo');
configurarOjo('pass-nueva', 'icono-ojo-comprobar');
