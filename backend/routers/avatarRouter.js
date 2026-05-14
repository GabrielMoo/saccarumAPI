const express = require('express');
const router = express.Router();

// Importamos ambas funciones de nuestro controlador
const { guardarAvatar, obtenerAvatar } = require('../controllers/avatarController');

const upload = require('../middlewares/procesarImagen'); 

// Ruta POST para GUARDAR la foto
router.post('/guardar-avatar', upload.single('imagen'), guardarAvatar);

// NUEVA RUTA GET para OBTENER la foto del usuario
// Recibe el "usuarioId" como parámetro dinámico en la URL
router.get('/obtener-avatar/:usuarioId', obtenerAvatar);

module.exports = router;