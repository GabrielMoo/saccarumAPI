const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    nombre:{
        type: String,
        required: true
    },

    email:{
        type: String,
        required: true,
        unique: true
    },

    contrasena:{
        type: String,
        default: null,
        sparse: true 
    },
        googleId: {
        type: String,
        default: null,
        sparse: true   // permite múltiples docs con null sin conflicto de índice único
    }
});

module.exports = mongoose.model('Usuario', userSchema);