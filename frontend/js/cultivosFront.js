// Requiere config.js y modal.js cargados antes en el HTML

document.addEventListener('DOMContentLoaded', () => {
    const usuarioGuardado = getUsuario();
    if (!usuarioGuardado || !usuarioGuardado.id) {
        mostrarAlerta("Sesión requerida", "Debes iniciar sesión para gestionar tus cultivos.", "warning")
            .then(() => { window.location.href = "login-register.html"; });
        return;
    }

    const usuarioId = usuarioGuardado.id;
    let cultivos = [];
    let currentPage = 1;
    const cardsPerPage = 6;

    const contenedor = document.getElementById('contenedor-cultivos');
    const pageNumbersContainer = document.getElementById('page-numbers');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');

    function fetchCultivos() {
        fetch(`${API_NODE}/api/cultivos/usuario/${usuarioId}`)
            .then(res => {
                if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);
                return res.json();
            })
            .then(data => {
                cultivos = data;
                updateUI();
            })
            .catch(err => {
                console.error('Error al cargar cultivos:', err);
                contenedor.innerHTML = '<p>Error al conectar con el servidor.</p>';
            });
    }

    function renderCards(page) {
        contenedor.innerHTML = '';
        const start = (page - 1) * cardsPerPage;
        const paginatedItems = cultivos.slice(start, start + cardsPerPage);

        if (paginatedItems.length === 0) {
            contenedor.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">Aún no tienes cultivos registrados.</p>';
            return;
        }

        paginatedItems.forEach(cultivo => {
            const card = document.createElement('div');
            card.className = 'cultivo-card';
            card.innerHTML = `
                <div class="cultivo-info">
                    <h2><i class="bi bi-leaf-fill"></i> ${cultivo.nombre}</h2>
                    <p><i class="bi bi-hash"></i> ID: ${cultivo._id.substring(18).toUpperCase()}</p>
                    <p><i class="bi bi-clipboard-check"></i> Diagnósticos: ${cultivo.diagnosticos.length}</p>
                </div>
                <div class="card-acciones">
                    <button class="btn-card btn-edit" onclick="editarCultivo('${cultivo._id}')">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn-card btn-delete" onclick="eliminarCultivo('${cultivo._id}')">
                        <i class="bi bi-trash3"></i>
                    </button>
                    <button class="btn-card btn-view" onclick="verCultivo('${cultivo._id}', '${cultivo.nombre}')">
                        <i class="bi bi-eye"></i>
                    </button>
                </div>
            `;
            contenedor.appendChild(card);
        });
    }

    window.verCultivo = function (idcultivo, nombre) {
        window.location.href = `DiagnosticoPorCultivo.html?id=${idcultivo}&nombre=${encodeURIComponent(nombre)}`;
    };

    function renderPagination() {
        const totalPages = Math.ceil(cultivos.length / cardsPerPage);
        pageNumbersContainer.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.classList.add('btn-page');
            if (i === currentPage) btn.classList.add('active');
            btn.innerText = i;
            btn.onclick = () => { currentPage = i; updateUI(); };
            pageNumbersContainer.appendChild(btn);
        }
        btnPrev.disabled = currentPage === 1;
        btnNext.disabled = currentPage === totalPages || totalPages === 0;
    }

    function updateUI() {
        renderCards(currentPage);
        renderPagination();
    }

    btnPrev.onclick = () => { if (currentPage > 1) { currentPage--; updateUI(); } };
    btnNext.onclick = () => {
        if (currentPage < Math.ceil(cultivos.length / cardsPerPage)) {
            currentPage++; updateUI();
        }
    };

    window.abrirModalCrear = async () => {
        const nombre = await mostrarPrompt(
            "Nuevo Cultivo",
            "Ingresa el nombre del nuevo cultivo o lote:",
            "Ej: Lote Norte, Parcela 3..."
        );
        if (!nombre || !nombre.trim()) return;
        try {
            const res = await fetch(API_NODE + '/api/cultivos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario: usuarioId, nombre: nombre.trim() })
            });
            if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);
            fetchCultivos();
        } catch (err) {
            console.error('Error al crear cultivo:', err);
            mostrarAlerta("Error", "No se pudo crear el cultivo. Intenta de nuevo.", "error");
        }
    };

    window.editarCultivo = async (id) => {
        const nuevoNombre = await mostrarPrompt(
            "Editar Cultivo",
            "Ingresa el nuevo nombre para el cultivo:",
            "Nuevo nombre..."
        );
        if (!nuevoNombre || !nuevoNombre.trim()) return;
        try {
            const res = await fetch(`${API_NODE}/api/cultivos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre: nuevoNombre.trim() })
            });
            if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);
            fetchCultivos();
        } catch (err) {
            console.error('Error al editar cultivo:', err);
            mostrarAlerta("Error", "No se pudo editar el cultivo. Intenta de nuevo.", "error");
        }
    };

    window.eliminarCultivo = async (id) => {
        const confirmado = await mostrarConfirm(
            "Eliminar Cultivo",
            "¿Deseas eliminar este cultivo? Esta acción no se puede deshacer.",
            "Eliminar",
            "error"
        );
        if (!confirmado) return;
        try {
            const res = await fetch(`${API_NODE}/api/cultivos/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);
            fetchCultivos();
        } catch (err) {
            console.error('Error al eliminar cultivo:', err);
            mostrarAlerta("Error", "No se pudo eliminar el cultivo. Intenta de nuevo.", "error");
        }
    };

    fetchCultivos();
});
