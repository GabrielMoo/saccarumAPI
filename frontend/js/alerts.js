// --- REFERENCIAS AL DOM DEL MODAL ---
const modalOverlay = document.getElementById('modal-overlay');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const btnCancel = document.getElementById('modal-btn-cancel');
const btnConfirm = document.getElementById('modal-btn-confirm');
const closeIcon = document.getElementById('modal-close-icon');

// --- FUNCIÓN PARA ALERTAS INFORMATIVAS (Reemplaza el alert nativo) ---
function mostrarAlertaPersonalizada(titulo, mensaje, tipo = 'info') {
    return new Promise((resolve) => {
        // Configurar contenido
        modalTitle.textContent = titulo;
        modalMessage.textContent = mensaje;
        
        // Ocultar botón cancelar
        btnCancel.style.display = 'none';
        
        // Configurar botón confirmar
        btnConfirm.textContent = 'Aceptar';
        btnConfirm.className = 'btn-confirm';
        if (tipo === 'success') btnConfirm.classList.add('btn-success');
        if (tipo === 'error') btnConfirm.classList.add('btn-danger'); // Rojo
        if (tipo === 'info') btnConfirm.classList.add('btn-primary'); // Azul/Marrón

        // Mostrar modal
        modalOverlay.classList.remove('hidden');

        // Lógica al hacer click en aceptar
        btnConfirm.onclick = () => {
            modalOverlay.classList.add('hidden');
            resolve(); // Resuelve la promesa para continuar el código
        };
    });
}

// --- FUNCIÓN PARA CONFIRMACIONES (Reemplaza el confirm nativo) ---
function mostrarConfirmacionPersonalizada(titulo, mensaje, textoBotonConfirm = 'Eliminar') {
    return new Promise((resolve) => {
        // Configurar contenido
        modalTitle.textContent = titulo;
        modalMessage.textContent = mensaje;
        
        // Mostrar botón cancelar
        btnCancel.style.display = 'inline-block';
        
        // Configurar botón confirmar (Por defecto rojo estilo Delete)
        btnConfirm.textContent = textoBotonConfirm;
        btnConfirm.className = 'btn-confirm'; 
        
        // Mostrar modal
        modalOverlay.classList.remove('hidden');

        // Resolver la promesa dependiendo del botón presionado
        btnCancel.onclick = () => {
            modalOverlay.classList.add('hidden');
            resolve(false); // El usuario canceló
        };

        btnConfirm.onclick = () => {
            modalOverlay.classList.add('hidden');
            resolve(true); // El usuario confirmó
        };
    });
}