// models/diagnostico.js
const mongoose = require('mongoose');

const diagnosticoSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    imagen_enlace: {
        type: String,
        required: true
    },
    resultado: {
        type: String,
        required: true
    },
    confianza: {
        type: String,
        required: true
    },
    fecha: {
        type: Date,
        default: Date.now   // guarda fecha y hora automáticamente
    }
});

module.exports = mongoose.model('Diagnostico', diagnosticoSchema);