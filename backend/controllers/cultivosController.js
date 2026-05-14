// 1. IMPORTACIONES (Solo una vez al principio)
const Cultivos = require('../models/cultivos');
const Diagnostico = require('../models/diagnostico');

// 2. FUNCIONES DEL CONTROLADOR

// CREAR UN CULTIVO
const crearCultivo = async (req, res) => {
    try {
        const { usuario, nombre } = req.body; 
        const nuevoCultivo = new Cultivos({
            usuario,
            nombre,
            diagnosticos: [] 
        });

        await nuevoCultivo.save();

        res.status(201).json({
            mensaje: "Cultivo creado exitosamente",
            cultivo: nuevoCultivo
        });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al crear el cultivo", error: error.message });
    }
};

// VINCULAR DIAGNÓSTICO (Esta es la función que activa tu botón)
const vincularDiagnostico = async (req, res) => {
    try {
        const { cultivoId, diagnosticoId } = req.body;

        const cultivoActualizado = await Cultivos.findByIdAndUpdate(
            cultivoId,
            { $addToSet: { diagnosticos: diagnosticoId } }, // Evita duplicados
            { new: true }
        ).populate('diagnosticos');

        if (!cultivoActualizado) {
            return res.status(404).json({ mensaje: "Cultivo no encontrado" });
        }

        res.json({ mensaje: "Diagnóstico vinculado con éxito", cultivo: cultivoActualizado });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al vincular", error: error.message });
    }
};

// EDITAR CULTIVO
const editarCultivo = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const cultivoActualizado = await Cultivos.findByIdAndUpdate(id, updates, { new: true });

        if (!cultivoActualizado) {
            return res.status(404).json({ mensaje: "Cultivo no encontrado" });
        }

        res.json({ mensaje: "Cultivo actualizado", cultivo: cultivoActualizado });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al editar", error: error.message });
    }
};

// ELIMINAR CULTIVO
const eliminarCultivo = async (req, res) => {
    try {
        const { id } = req.params;

        const cultivoEliminado = await Cultivos.findByIdAndDelete(id);

        if (!cultivoEliminado) {
            return res.status(404).json({ mensaje: "Cultivo no encontrado" });
        }

        // Opcional: Borrar diagnósticos asociados
        await Diagnostico.deleteMany({ _id: { $in: cultivoEliminado.diagnosticos } });

        res.json({ mensaje: "Cultivo y sus diagnósticos eliminados correctamente" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al eliminar", error: error.message });
    }
};

// OBTENER CULTIVOS DE UN USUARIO
const obtenerCultivosUsuario = async (req, res) => {
    try {
        const { usuarioId } = req.params;
        const cultivos = await Cultivos.find({ usuario: usuarioId })
            .populate('diagnosticos'); 

        res.json(cultivos);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener cultivos", error: error.message });
    }
};

// OBTENER DIAGNÓSTICOS DE UN CULTIVO ESPECÍFICO
const obtenerDiagnosticoCultivo = async (req, res) => {
    try {
        // Obtenemos el ID del cultivo de los parámetros de la URL
        const { id } = req.params; 

        // Buscamos el cultivo por su ID y "poblamos" el array de diagnósticos
        // Esto trae la información completa de cada diagnóstico en lugar de solo el ID
        const cultivoConDetalles = await Cultivos.findById(id)
            .populate('diagnosticos'); 

        // Validamos si el cultivo existe
        if (!cultivoConDetalles) {
            return res.status(404).json({ 
                mensaje: "El cultivo solicitado no existe." 
            });
        }

        // Devolvemos únicamente el array de diagnósticos poblados
        // Esto facilita el trabajo al frontend ya que recibe directamente la lista
        res.json(cultivoConDetalles.diagnosticos);

    } catch (error) {
        console.error("❌ Error en obtenerDiagnosticoCultivo:", error);
        res.status(500).json({ 
            mensaje: "Error interno al recuperar los diagnósticos", 
            error: error.message 
        });
    }
};

// 3. EXPORTACIÓN
module.exports = {
    crearCultivo,
    vincularDiagnostico,
    editarCultivo,
    eliminarCultivo,
    obtenerCultivosUsuario,
    obtenerDiagnosticoCultivo
};