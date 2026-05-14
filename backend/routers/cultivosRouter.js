const express = require('express');
const router = express.Router();
const cultivoCtrl = require('../controllers/cultivosController');

// 1. Crear un nuevo cultivo (Inicia con array de diagnósticos vacío)
router.post('/', cultivoCtrl.crearCultivo); 

// 2. RUTA PARA EL BOTÓN: Vincula un diagnóstico existente a un cultivo
router.post('/vincular', cultivoCtrl.vincularDiagnostico); 

// 3. Editar información del cultivo (ej. cambiar el nombre)
router.put('/:id', cultivoCtrl.editarCultivo); 

// 4. Eliminar el cultivo
router.delete('/:id', cultivoCtrl.eliminarCultivo); 

// 5. Obtener todos los cultivos de un usuario (con sus diagnósticos vinculados)
router.get('/usuario/:usuarioId', cultivoCtrl.obtenerCultivosUsuario); 

router.get('/diagnosticos/:id', cultivoCtrl.obtenerDiagnosticoCultivo);

module.exports = router;