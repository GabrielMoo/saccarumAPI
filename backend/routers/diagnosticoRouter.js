// routers/diagnosticoRouter.js
const express = require('express');
const router = express.Router();
const { guardarDiagnostico } = require('../controllers/diagnosticoController');
const upload = require('../middlewares/procesarImagen');  // mismo middleware de Cloudinary

// Ruta POST para guardar un diagnóstico con imagen
router.post('/guardar', upload.single('imagen'), guardarDiagnostico);

module.exports = router;