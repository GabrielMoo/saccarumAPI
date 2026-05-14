const Avatar = require('../models/avatar'); 

const guardarAvatar = async (req, res) => {
    try {
        const usuarioId = req.body.usuario;

        if (!req.file) {
            return res.status(400).json({ mensaje: "Por favor, sube una imagen." });
        }

        const imagenUrl = req.file.path; 

        const avatarGuardado = await Avatar.findOneAndUpdate(
            { usuario: usuarioId },
            { imagen_enlace: imagenUrl },
            { new: true, upsert: true }
        );

        console.log("✅ Avatar guardado con éxito para el usuario:", usuarioId);
        
        res.status(201).json({ 
            mensaje: "Avatar guardado exitosamente",
            avatar: avatarGuardado
        });

    } catch (error) {
        console.error("❌ Error al guardar el avatar:", error);
        res.status(500).json({ mensaje: "Hubo un error interno en el servidor", error: error.message });
    }
};

// NUEVA FUNCIÓN: Sirve para buscar el avatar cuando el usuario inicia sesión
const obtenerAvatar = async (req, res) => {
    try {
        const usuarioId = req.params.usuarioId; // Obtenemos el ID de la URL
        
        // Buscamos si existe un avatar para este usuario
        const avatar = await Avatar.findOne({ usuario: usuarioId });

        if (avatar) {
            // Si tiene foto, la enviamos
            res.status(200).json({ exito: true, avatar: avatar });
        } else {
            // Si no tiene foto, avisamos que no hay
            res.status(404).json({ exito: false, mensaje: "El usuario no tiene avatar personalizado" });
        }
    } catch (error) {
        console.error("❌ Error al obtener el avatar:", error);
        res.status(500).json({ exito: false, mensaje: "Error del servidor al buscar el avatar" });
    }
};

// Asegúrate de exportar ambas funciones
module.exports = { guardarAvatar, obtenerAvatar };