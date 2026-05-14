// controllers/diagnosticoController.js
const Diagnostico = require('../models/diagnostico');

const guardarDiagnostico = async (req, res) => {
    try {
        const { usuario, resultado, confianza } = req.body;

        if (!req.file) {
            return res.status(400).json({ mensaje: "Falta la imagen del diagnóstico." });
        }

        const imagenUrl = req.file.path; // Cloudinary URL

        const nuevoDiagnostico = new Diagnostico({
            usuario,
            imagen_enlace: imagenUrl,
            resultado,
            confianza,
            // fecha se asigna por defecto
        });

        await nuevoDiagnostico.save();

        console.log("✅ Diagnóstico guardado para el usuario:", usuario);
        res.status(201).json({
            mensaje: "Diagnóstico guardado exitosamente",
            diagnostico: nuevoDiagnostico
        });
    } catch (error) {
        console.error("❌ Error al guardar diagnóstico:", error);
        res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
    }
};

module.exports = { guardarDiagnostico };