// config.js - URLs base del proyecto Saccarum
// Cambia estos valores al momento de desplegar a producción
const API_NODE = 'http://localhost:2000';
const API_ML   = 'http://127.0.0.1:8000';

// Función auxiliar segura para leer el usuario del localStorage
function getUsuario() {
    try {
        return JSON.parse(localStorage.getItem('usuarioSaccarum'));
    } catch {
        return null;
    }
}
