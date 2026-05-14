// Nota: Agregamos "async" aquí para poder usar await en el fetch inicial
document.addEventListener("DOMContentLoaded", async () => {
    const usuarioStr = localStorage.getItem('usuarioSaccarum');
    
    if (!usuarioStr) {
        window.location.href = "login-register.html";
        return;
    }

    const usuario = JSON.parse(usuarioStr);

    // Verificamos que los elementos existan antes de asignarles valor para evitar errores en la consola
    const elementoNombre = document.getElementById("perfil-nombre");
    if (elementoNombre) elementoNombre.textContent = usuario.nombre;
    
    const elementoEmail = document.getElementById("perfil-email");
    if (elementoEmail) elementoEmail.textContent = usuario.email;

    const inputFoto = document.getElementById("input-foto");
    const imgPerfil = document.getElementById("img-perfil");
    const btnGuardarFoto = document.getElementById("btn-guardar-foto");
    
    let archivoSeleccionado = null;

    // === NUEVO: CARGAR LA FOTO DESDE LA BASE DE DATOS ===
    try {
        // Le pedimos al servidor el avatar de este usuario en específico
        const respuesta = await fetch(`/api/avatar/obtener-avatar/${usuario.id}`);
        const datos = await respuesta.json();

        // Si la petición fue exitosa y el usuario tiene un avatar
        if (datos.exito && datos.avatar && imgPerfil) {
            // Reemplazamos la imagen por defecto por la que está en Cloudinary
            imgPerfil.src = datos.avatar.imagen_enlace; 
        }
    } catch (error) {
        console.error("Error al intentar cargar la foto de perfil:", error);
    }
    // ====================================================

    // Lógica para previsualizar la foto subida
    if (inputFoto) {
        inputFoto.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                archivoSeleccionado = file; 
                btnGuardarFoto.style.display = "inline-block"; 

                const reader = new FileReader();
                reader.onload = (evento) => {
                    imgPerfil.src = evento.target.result; 
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Lógica para guardar la foto en la Base de Datos
    if (btnGuardarFoto) {
        btnGuardarFoto.addEventListener("click", async () => {
            if (!archivoSeleccionado) return;

            const formData = new FormData();
            formData.append('imagen', archivoSeleccionado);
            formData.append('usuario', usuario.id); 

            try {
                btnGuardarFoto.textContent = "Guardando...";
                btnGuardarFoto.disabled = true;

                const response = await fetch('/api/avatar/guardar-avatar', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (response.ok) {
                    alert("¡Foto de perfil actualizada exitosamente!");
                    btnGuardarFoto.style.display = "none"; 
                } else {
                    alert("Error al guardar: " + data.mensaje);
                }
            } catch (error) {
                console.error("Error en la petición:", error);
                alert("Hubo un problema de conexión con el servidor.");
            } finally {
                btnGuardarFoto.textContent = "Guardar Foto";
                btnGuardarFoto.disabled = false;
            }
        });
    }

    // Cerrar Sesión (CORREGIDO)
    const btnCerrarSesion = document.getElementById("btn-cerrar-sesion");
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener("click", () => {
            localStorage.removeItem('usuarioSaccarum');
            window.location.href = "login-register.html";
        });
    }

    // Botón Eliminar (CORREGIDO)
    const btnEliminarCuenta = document.getElementById("btn-eliminar-cuenta");
    if (btnEliminarCuenta) {
        btnEliminarCuenta.addEventListener("click", () => {
            if(confirm("¿Estás seguro de que deseas eliminar tu cuenta permanentemente?")) {
                alert(`Aquí enviarías un fetch a DELETE /eliminar/${usuario.id}`);
            }
        });
    }

    // === NUEVA LÓGICA: CAMBIAR CONTRASEÑA (MOVIDA ADENTRO DEL SCOPE) ===
    const btnCambiarPass = document.getElementById("btn-cambiar-pass");
    
    if (btnCambiarPass) {
        btnCambiarPass.addEventListener("click", async () => {
            const passActual = document.getElementById("pass-actual").value;
            const passNueva = document.getElementById("pass-nueva").value;

            // Validamos que los campos no estén vacíos
            if (!passActual || !passNueva) {
                alert("Por favor, llena ambos campos de contraseña.");
                return;
            }

            try {
                btnCambiarPass.textContent = "Actualizando...";
                btnCambiarPass.disabled = true;

                const response = await fetch('/cambiar-contrasena', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        usuarioId: usuario.id, // Enviamos el ID para saber a quién actualizar
                        contrasenaActual: passActual,
                        nuevaContrasena: passNueva
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    alert("¡" + data.mensaje + "!");
                    // Limpiamos los inputs si fue exitoso
                    document.getElementById("pass-actual").value = "";
                    document.getElementById("pass-nueva").value = "";
                } else {
                    alert("Error: " + data.mensaje);
                }

            } catch (error) {
                console.error("Error al cambiar contraseña:", error);
                alert("Hubo un problema al conectar con el servidor.");
            } finally {
                btnCambiarPass.textContent = "Confirmar Cambio";
                btnCambiarPass.disabled = false;
            }
        });
    }

}); // <-- EL DOMContentLoaded CIERRA CORRECTAMENTE AQUÍ

// Función maestra para ocultar/mostrar cualquier contraseña (Se queda fuera)
function configurarOjo(idInput, idIcono) {
    const input = document.getElementById(idInput);
    const icono = document.getElementById(idIcono);

    // CORREGIDO: Verificamos que los inputs existan en la pantalla antes de agregarles el evento
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

// ¡Ahora solo llamamos a la función para cada formulario!
configurarOjo('pass-actual', 'icono-ojo');
configurarOjo('pass-nueva', 'icono-ojo-comprobar');