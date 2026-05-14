// ============================================================
//  modal.js  –  Sistema de modales para Saccarum
//  Reemplaza: alert(), confirm() y prompt() nativos
// ============================================================

(function () {
    // ── Inyectar HTML del modal al cargar el script ──────────
    const template = `
    <div id="sac-modal-overlay" class="sac-modal-overlay sac-modal-hidden" role="dialog" aria-modal="true">
        <div class="sac-modal-box">
            <div class="sac-modal-icon-wrap" id="sac-modal-icon-wrap">
                <i id="sac-modal-icon" class="bi"></i>
            </div>
            <h3 id="sac-modal-title"></h3>
            <p id="sac-modal-message"></p>
            <!-- Input para prompt -->
            <input id="sac-modal-input" type="text" class="sac-modal-input sac-modal-hidden" placeholder="">
            <div class="sac-modal-actions">
                <button id="sac-modal-cancel" class="sac-btn sac-btn-cancel">Cancelar</button>
                <button id="sac-modal-confirm" class="sac-btn sac-btn-confirm">Aceptar</button>
            </div>
        </div>
    </div>`;

    const div = document.createElement('div');
    div.innerHTML = template;
    document.body.appendChild(div.firstElementChild);

    // ── Referencias ──────────────────────────────────────────
    const overlay     = document.getElementById('sac-modal-overlay');
    const iconWrap    = document.getElementById('sac-modal-icon-wrap');
    const icon        = document.getElementById('sac-modal-icon');
    const titleEl     = document.getElementById('sac-modal-title');
    const messageEl   = document.getElementById('sac-modal-message');
    const inputEl     = document.getElementById('sac-modal-input');
    const btnCancel   = document.getElementById('sac-modal-cancel');
    const btnConfirm  = document.getElementById('sac-modal-confirm');

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !overlay.classList.contains('sac-modal-hidden')) {
            _close();
        }
    });

    function _open() { overlay.classList.remove('sac-modal-hidden'); }
    function _close() { overlay.classList.add('sac-modal-hidden'); }

    function _setup({ titulo, mensaje, tipo, showCancel, showInput, placeholder, confirmText, cancelText }) {
        titleEl.textContent   = titulo || '';
        messageEl.textContent = mensaje || '';

        // Ícono y color según tipo
        const tipos = {
            info:    { iconClass: 'bi-info-circle-fill',   colorVar: '--sac-modal-info'    },
            success: { iconClass: 'bi-check-circle-fill',  colorVar: '--sac-modal-success' },
            error:   { iconClass: 'bi-x-circle-fill',      colorVar: '--sac-modal-error'   },
            warning: { iconClass: 'bi-exclamation-circle-fill', colorVar: '--sac-modal-warning' },
            prompt:  { iconClass: 'bi-pencil-fill',        colorVar: '--sac-modal-info'    },
        };
        const t = tipos[tipo] || tipos.info;
        icon.className = `bi ${t.iconClass}`;
        iconWrap.style.color = `var(${t.colorVar})`;

        // Input de prompt
        if (showInput) {
            inputEl.classList.remove('sac-modal-hidden');
            inputEl.placeholder = placeholder || '';
            inputEl.value = '';
            setTimeout(() => inputEl.focus(), 50);
        } else {
            inputEl.classList.add('sac-modal-hidden');
        }

        // Botones
        btnCancel.textContent = cancelText  || 'Cancelar';
        btnConfirm.textContent = confirmText || 'Aceptar';
        btnCancel.style.display = showCancel ? 'inline-flex' : 'none';

        // Estilo del botón confirmar según tipo
        btnConfirm.className = 'sac-btn sac-btn-confirm';
        if (tipo === 'error' || tipo === 'warning') btnConfirm.classList.add('sac-btn-danger');
        if (tipo === 'success') btnConfirm.classList.add('sac-btn-success');
    }

    // ── API pública ──────────────────────────────────────────

    /**
     * Muestra una alerta informativa (reemplaza alert).
     * @param {string} titulo
     * @param {string} mensaje
     * @param {'info'|'success'|'error'|'warning'} tipo
     * @returns {Promise<void>}
     */
    window.mostrarAlerta = function (titulo, mensaje, tipo = 'info') {
        return new Promise((resolve) => {
            _setup({ titulo, mensaje, tipo, showCancel: false, showInput: false });
            _open();

            btnConfirm.onclick = () => { _close(); resolve(); };
        });
    };

    /**
     * Muestra un diálogo de confirmación (reemplaza confirm).
     * @param {string} titulo
     * @param {string} mensaje
     * @param {string} [confirmText='Confirmar']
     * @param {'warning'|'error'|'info'} [tipo='warning']
     * @returns {Promise<boolean>}
     */
    window.mostrarConfirm = function (titulo, mensaje, confirmText = 'Confirmar', tipo = 'warning') {
        return new Promise((resolve) => {
            _setup({ titulo, mensaje, tipo, showCancel: true, showInput: false, confirmText });
            _open();

            btnCancel.onclick  = () => { _close(); resolve(false); };
            btnConfirm.onclick = () => { _close(); resolve(true);  };
        });
    };

    /**
     * Muestra un diálogo con input de texto (reemplaza prompt).
     * @param {string} titulo
     * @param {string} mensaje
     * @param {string} [placeholder='']
     * @returns {Promise<string|null>}  null si el usuario cancela
     */
    window.mostrarPrompt = function (titulo, mensaje, placeholder = '') {
        return new Promise((resolve) => {
            _setup({ titulo, mensaje, tipo: 'prompt', showCancel: true, showInput: true, placeholder });
            _open();

            // También confirmar con Enter dentro del input
            inputEl.onkeydown = (e) => {
                if (e.key === 'Enter') { _close(); resolve(inputEl.value.trim() || null); }
            };
            btnCancel.onclick  = () => { _close(); resolve(null); };
            btnConfirm.onclick = () => { _close(); resolve(inputEl.value.trim() || null); };
        });
    };

    // Mantener compatibilidad con alerts.js existente (si otros archivos lo usan)
    window.mostrarAlertaPersonalizada = window.mostrarAlerta;
    window.mostrarConfirmacionPersonalizada = function(titulo, mensaje, confirmText = 'Eliminar') {
        return window.mostrarConfirm(titulo, mensaje, confirmText, 'error');
    };
})();
