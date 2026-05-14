// Requiere config.js y modal.js cargados antes en el HTML

document.addEventListener('DOMContentLoaded', () => {
    const usuarioGuardado = getUsuario();
    if (!usuarioGuardado || !usuarioGuardado.id) {
        mostrarAlerta("Sesión requerida", "Debes iniciar sesión para ver tu historial.", "warning")
            .then(() => { window.location.href = "login-register.html"; });
        return;
    }

    const usuarioId = usuarioGuardado.id;
    let diagnosticos = [];
    let currentPage = 1;
    const rowsPerPage = 5;

    const tbody = document.getElementById('contenido-tabla');
    const pageNumbersContainer = document.getElementById('page-numbers');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const searchInput = document.getElementById('inputBuscar');

    fetch(`${API_NODE}/api/diagnosticos?usuarioId=${usuarioId}`)
        .then(res => {
            if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);
            return res.json();
        })
        .then(data => {
            diagnosticos = data;
            updateUI();
        })
        .catch(err => {
            console.error('Error al cargar historial:', err);
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">Error al cargar los diagnósticos.</td></tr>';
        });

    function renderTable(page, filteredData = diagnosticos) {
        tbody.innerHTML = '';
        const start = (page - 1) * rowsPerPage;
        const paginatedItems = filteredData.slice(start, start + rowsPerPage);

        if (paginatedItems.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">No se encontraron diagnósticos.</td></tr>';
            return;
        }

        paginatedItems.forEach(diag => {
            const fecha = new Date(diag.fecha);
            const fechaStr = fecha.toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' });
            const horaStr = fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
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
        btnNext.disabled = currentPage === totalPages;
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
