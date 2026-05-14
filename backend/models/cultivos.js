const mongoose = require('mongoose');

const cultivosSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    nombre: { 
        type: String, 
        required: true 
    },
    // MongoDB asignará el _id automáticamente, no necesitas declararlo aquí
    diagnosticos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Diagnostico'
    }]
});

module.exports = mongoose.model('Cultivos', cultivosSchema);