const mongoose = require('mongoose')

const avatarSchema = new mongoose.Schema({

    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },

    imagen_enlace: {
        type: String,
        required: true
    },

});

module.exports = mongoose.model('Avatar', avatarSchema);