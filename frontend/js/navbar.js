class SaccarumHeader extends HTMLElement {
  async connectedCallback() { 
    const usuario = getUsuario();
    const sesionActiva = usuario && usuario.nombre;

    const botonesAuth = sesionActiva
      ? `<li>
          <div class="user-profile-container">
            <img id="img-perfil2" src="./media/default-avatar.png" alt="Foto de perfil">
            <div class="user-info">
              <span class="welcome">Hola,</span>
              <span class="user-name">${usuario.nombre}</span>
            </div>
          </div>
        </li>
        <li><a href="perfil.html"><button class="btn-sesion"><i class="bi bi-person-bounding-box"></i> Mi perfil</button></a></li>
        <li><button class="btn-registro" id="btn-nav-logout"><i class="bi bi-box-arrow-right"></i> Cerrar sesión</button></li>`
      : `<li><a href="login-register.html"><button class="btn-sesion"><i class="bi bi-box-arrow-in-left"></i> Iniciar sesión</button></a></li>
         <li><a href="login-register.html?mode=register"><button class="btn-registro"><i class="bi bi-person-plus-fill"></i> Registrarse</button></a></li>`;

    this.innerHTML = `
      <header>
        <nav>
          <div class="nav-container">
            <a href="index.html" class="logo">
              <img src="./media/unnamed.png" alt="Saccarum" class="logo">
            </a>
            <ul class="nav-links" id="navLinks">
              <li> <a href="index.html"><i class="bi bi-house"></i> Inicio</a></li>
              <li><a href="cultivos.html"><i class="bi bi-leaf"></i> Cultivos</a></li>
              <li><a href="historial.html"><i class="bi bi-clock-history"></i> Historial</a></li>
              ${botonesAuth}
            </ul>
          </div>
        </nav>
      </header>
    `;

    // Lógica de carga de avatar
    if (sesionActiva) {
      await this.cargarAvatar(usuario.id);
    }

    this.setActiveLink();

    const btnLogout = this.querySelector('#btn-nav-logout');
    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        localStorage.removeItem('usuarioSaccarum');
        window.location.href = "login-register.html";
      });
    }
  }

  async cargarAvatar(usuarioId) {
    try {
      const respuesta = await fetch(`${API_NODE}/api/avatar/obtener-avatar/${usuarioId}`);
      const datos = await respuesta.json();
      const imgPerfil = this.querySelector('#img-perfil2');
      
      if (datos.exito && datos.avatar && imgPerfil) {
        imgPerfil.src = datos.avatar.imagen_enlace;
      }
    } catch (error) {
      console.error("Error al cargar la foto de perfil:", error);
    }
  }

  setActiveLink() {
    const path = window.location.pathname;
    const links = this.querySelectorAll('.nav-links a');
    links.forEach(link => {
      const href = link.getAttribute('href');
      let isActive = path.endsWith(href);
      if (href === 'cultivos.html' && path.includes('DiagnosticoPorCultivo.html')) {
        isActive = true;
      }
      isActive ? link.classList.add('active') : link.classList.remove('active');
    });
  }
}

customElements.define('main-navbar', SaccarumHeader);