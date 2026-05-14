// js/diagCultivo.js
// Requiere config.js y modal.js cargados antes en el HTML

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const cultivoId = params.get("id");
    const cultivoNombre = params.get("nombre");

    if (!cultivoId || !cultivoNombre) {
        mostrarAlerta("Cultivo no seleccionado", "No se ha seleccionado correctamente el cultivo.", "warning")
            .then(() => { window.location.href = "cultivos.html"; });
        return;
    }

    console.log("ID:", cultivoId);
    console.log("Nombre:", cultivoNombre);
    document.getElementById('nameCultivo').innerText = "Diagnosticos del Cultivo: " + cultivoNombre;

    const usuarioGuardado = getUsuario();
    if (!usuarioGuardado || !usuarioGuardado.id) {
        mostrarAlerta("Sesión requerida", "Debes iniciar sesión para ver esta información.", "warning")
            .then(() => { window.location.href = "login-register.html"; });
        return;
    }

    let diagnosticos = [];
    let currentPage = 1;
    const rowsPerPage = 5;

    const tbody = document.getElementById('contenido-tabla');
    const pageNumbersContainer = document.getElementById('page-numbers');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const searchInput = document.getElementById('inputBuscar');

    fetch(`${API_NODE}/api/cultivos/diagnosticos/${cultivoId}`)
        .then(res => {
            if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);
            return res.json();
        })
        .then(data => {
            diagnosticos = data;
            updateUI();
        })
        .catch(err => {
            console.error('Error al cargar historial del cultivo:', err);
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px;">Error al cargar los datos del cultivo.</td></tr>';
        });

    function renderTable(page, filteredData = diagnosticos) {
        tbody.innerHTML = '';
        const start = (page - 1) * rowsPerPage;
        const paginatedItems = filteredData.slice(start, start + rowsPerPage);

        if (paginatedItems.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px;">Este cultivo aún no tiene diagnósticos vinculados.</td></tr>';
            return;
        }

        paginatedItems.forEach(diag => {
            const fecha = new Date(diag.fecha);
            const fechaStr = fecha.toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' });
            const horaStr = fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="col-foto">
                    <img src="${diag.imagen_enlace}" alt="Diagnóstico" onerror="this.src='https://via.placeholder.com/60'">
                </td>
                <td>${fechaStr}</td>
                <td>${horaStr}</td>
                <td>${diag.resultado}</td>
                <td>${diag.confianza}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    function renderPagination(totalItems) {
        const totalPages = Math.ceil(totalItems / rowsPerPage);
        pageNumbersContainer.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.classList.add('btn-page');
            if (i === currentPage) btn.classList.add('active');
            btn.innerText = i;
            btn.addEventListener('click', () => { currentPage = i; updateUI(); });
            pageNumbersContainer.appendChild(btn);
        }
        btnPrev.disabled = currentPage === 1;
        btnNext.disabled = currentPage === totalPages || totalPages === 0;
    }

    function updateUI(filtered = diagnosticos) {
        renderTable(currentPage, filtered);
        renderPagination(filtered.length);
    }

    btnPrev.addEventListener('click', () => { if (currentPage > 1) { currentPage--; updateUI(); } });
    btnNext.addEventListener('click', () => {
        if (currentPage < Math.ceil(diagnosticos.length / rowsPerPage)) { currentPage++; updateUI(); }
    });

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        const filtered = term ? diagnosticos.filter(d => d.resultado.toLowerCase().includes(term)) : diagnosticos;
        currentPage = 1;
        updateUI(filtered);
    });
});
