// Requiere config.js cargado antes en el HTML

const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const preview = document.getElementById("preview");
let diagnosticoActualContexto = "";
cargarCultivos();

dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
});
dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
});
dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    handleFiles(e.dataTransfer.files);
});
fileInput.addEventListener("change", () => {
    handleFiles(fileInput.files);
});

async function cargarCultivos() {
    try {
        const usuarioGuardado = getUsuario();
        if (!usuarioGuardado) return;
        const res = await fetch(`${API_NODE}/api/cultivos/usuario/${usuarioGuardado.id}`);
        if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);
        const cultivos = await res.json();
        const select = document.getElementById('selectCultivo');
        select.innerHTML = '<option value="">-- Selecciona un cultivo --</option>';
        cultivos.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c._id;
            opt.text = `${c.nombre}`;
            select.appendChild(opt);
        });
    } catch (e) {
        console.error("Error al cargar cultivos:", e);
    }
}

function probarSelector(){
    const select = document.getElementById('selectCultivo').value;
    console.log("opcion seleccionada:",select)
    if(select === ""){
        return false; 
    }
    return true; 

}

    async function vincular(idDiag) {
        const cultivoId = document.getElementById('selectCultivo').value;
        console.log("ccultivo: ", cultivoId); 
        const diagnosticoId = idDiag; 
        console.log("id Diagnostico",idDiag); 
        if (!diagnosticoId) { mostrarAlerta("ID requerido", "No se encontró un ID de diagnóstico válido.", "warning"); return; }

        try {
            const res = await fetch(`${API_NODE}/api/cultivos/vincular`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cultivoId, diagnosticoId })
            });
            const data = await res.json();
            displayJSON(data);
            showMsg("🔗 Vinculado con éxito", "#e3f2fd", "#0d47a1");
        } catch (e) { e }
    }

function removeImage() {
    preview.innerHTML = "";
    fileInput.value = "";
}

async function handleFiles(files) {
    const file = files[0];
    if (!file || !file.type.startsWith("image/")) return;

    // Vista previa
    const reader = new FileReader();
    reader.onload = (e) => {
        preview.innerHTML = `
            <div style="position: relative; display: inline-block; margin-top: 15px;">
                <img src="${e.target.result}" style="max-width: 150px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
                <button onclick="removeImage()" style="position: absolute; top: -10px; right: -10px; background: #d32f2f; color: white; border: none; border-radius: 50%; width: 25px; height: 30px; cursor: pointer; display: flex; justify-content: center; align-items: center"><i class="bi bi-x-lg"></i></button>
            </div>
        `;
    };
    reader.readAsDataURL(file);

    // --- NUEVO: Elementos de la interfaz ---
    const loader = document.getElementById("loader");
    const seccion = document.getElementById("seccion-resultados");
    const btnSubir = document.querySelector(".btn-subir");

    // 1. Ocultar resultados viejos si los hubiera
    seccion.classList.remove("mostrar");

    // 2. Mostrar el Loader y ocultar el botón de subir momentáneamente para evitar doble clic
    loader.style.display = "block";
    btnSubir.style.display = "none";

    // --- Enviar al Backend ---
    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch(`${API_ML}/predict`, {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        // script.js (dentro de handleFiles, después de const data = await response.json();)

        // Guardar diagnóstico en la BD si el usuario está logueado
        const usuarioGuardado = JSON.parse(localStorage.getItem('usuarioSaccarum'));
        if (usuarioGuardado && usuarioGuardado.id) {
            // Crear FormData con la misma imagen y los datos del diagnóstico
            const formDataDB = new FormData();
            formDataDB.append('imagen', file);             // el archivo original
            formDataDB.append('usuario', usuarioGuardado.id);
            formDataDB.append('resultado', data.resultado);
            formDataDB.append('confianza', data.confianza);

            fetch(`${API_NODE}/api/diagnosticos/guardar`, {
                method: 'POST',
                body: formDataDB
            })
                .then(res => res.json())
                .then(respuestaGuardado => {
                    console.log('✅ Diagnóstico guardado en historial:', respuestaGuardado);
                    if(probarSelector()){
                        vincular(respuestaGuardado.diagnostico._id);
                        console.log("se guardo en el cultivo"); 
                    }else{
                        console.log("No hay cultivo para vincular"); 
                    }
                })
                .catch(err => {
                    console.error('❌ No se pudo guardar el diagnóstico:', err);
                });
        }

        // Guardamos el diagnóstico para el chat
        diagnosticoActualContexto = data.resultado;

        // Reiniciamos el chat con un mensaje de bienvenida
        const chatMensajes = document.getElementById("chat-mensajes");
        chatMensajes.innerHTML = `
    <div class="mensaje bot">
        ¡Hola! Soy tu asistente virtual. El resultado del diagnostico en tu muestra de caña es <strong>${data.resultado}</strong>. ¿Tienes alguna pregunta específica sobre qué hacer ahora?
    </div>
`;

        // --- NUEVO: Ocultar Loader y regresar botón ---
        loader.style.display = "none";
        btnSubir.style.display = "inline-block";

        // Elementos de la nueva sección
        const encabezado = document.getElementById("encabezado-diagnostico");
        const contenedorTarjetas = document.getElementById("tarjetas-recomendaciones");

        // Mostrar la sección con animación
        seccion.classList.add("mostrar");

        // Renderizar Diagnóstico Principal
        encabezado.innerHTML = `
            <div style="text-align: center;">
                <h2 style="color: darkgreen; font-size: 2.5rem; margin-bottom: 10px;">Resultado: ${data.resultado}</h2>
                <span style="font-size: 1.1rem; background: #fff; color: darkgreen; padding: 5px 15px; border-radius: 20px; font-weight: bold;">
                    Confianza del modelo: ${data.confianza}
                </span>
                <p style="font-size: 1.4rem; color: black; max-width: 800px; margin: 25px auto; line-height: 1.6;">
                    ${data.recomendaciones.resumen}
                </p>
            </div>
        `;

        // Renderizar Tarjetas de Recomendación
        const recs = data.recomendaciones;
        contenedorTarjetas.innerHTML = `
            <div class="tarjeta-recom">
                <h3><i class="bi bi-leaf-fill"></i> Acciones Inmediatas</h3>
                <ul>${recs.acciones_inmediatas.map(a => `<li>${a}</li>`).join('')}</ul>
            </div>
            <div class="tarjeta-recom">
                <h3><i class="bi bi-heart-pulse-fill"></i> Tratamiento Sugerido</h3>
                <ul>${recs.tratamiento.map(t => `<li>${t}</li>`).join('')}</ul>
            </div>
            <div class="tarjeta-recom">
                <h3><i class="bi bi-shield-fill-exclamation"></i> Prevención Futura</h3>
                <ul>${recs.prevencion.map(p => `<li>${p}</li>`).join('')}</ul>
            </div>
        `;

        // DESPLAZAMIENTO SUAVE (Scroll)
        setTimeout(() => {
            seccion.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);

    } catch (error) {
        console.error("Error:", error);
        // --- NUEVO: Ocultar Loader y regresar botón en caso de error ---
        loader.style.display = "none";
        btnSubir.style.display = "inline-block";
        // Reemplaza la línea con el alert de error:
        // ANTES: alert("Hubo un error al procesar la imagen...");
        // DESPUÉS:
        await mostrarAlerta('Error al procesar', 'Hubo un error al procesar la imagen. Por favor, intenta de nuevo.', 'error');
    }
}

function manejarEnter(event) {
    if (event.key === "Enter") {
        enviarMensajeChat();
    }
}

async function enviarMensajeChat() {
    const input = document.getElementById("chat-input");
    const mensajeTexto = input.value.trim();
    if (!mensajeTexto) return;

    const chatMensajes = document.getElementById("chat-mensajes");

    // FIX: textContent para evitar XSS
    const divUsuario = document.createElement("div");
    divUsuario.className = "mensaje usuario";
    divUsuario.textContent = mensajeTexto;
    chatMensajes.appendChild(divUsuario);

    input.value = "";
    chatMensajes.scrollTop = chatMensajes.scrollHeight;

    const idEscribiendo = "escribiendo-" + Date.now();
    chatMensajes.innerHTML += `<div id="${idEscribiendo}" class="mensaje bot" style="font-style: italic; opacity: 0.7;">Analizando tu pregunta...</div>`;
    chatMensajes.scrollTop = chatMensajes.scrollHeight;

    try {
        const response = await fetch(`${API_ML}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mensaje: mensajeTexto, diagnostico: diagnosticoActualContexto })
        });
        if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
        const data = await response.json();

        document.getElementById(idEscribiendo).remove();
        const textoFormateado = data.respuesta.replace(/\n/g, "<br>");
        chatMensajes.innerHTML += `<div class="mensaje bot">${textoFormateado}</div>`;
        chatMensajes.scrollTop = chatMensajes.scrollHeight;

    } catch (error) {
        console.error("Error en chat:", error);
        document.getElementById(idEscribiendo).remove();
        chatMensajes.innerHTML += `<div class="mensaje bot" style="color: red;">Ocurrió un error al conectar con el servidor.</div>`;
    }
}
