// config.js - URLs base del proyecto Saccarum
// Cambia estos valores al momento de desplegar a producción
const API_NODE = '';
const API_ML   = 'https://galahad28-saccarum.hf.space';

// Función auxiliar segura para leer el usuario del localStorage
function getUsuario() {
    try {
        return JSON.parse(localStorage.getItem('usuarioSaccarum'));
    } catch {
        return null;
    }
}
