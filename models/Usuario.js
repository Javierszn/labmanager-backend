const { Schema, model } = require('mongoose');

const UsuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio']
    },
    correo: {
        type: String,
        required: [true, 'El correo es obligatorio'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria']
    },
    rol: {
        type: String,
        enum: ['alumno', 'admin'],
        default: 'alumno'
    },
    // --- ESTOS SON LOS 2 CAMPOS NUEVOS ---
    matricula: {
        type: String,
        default: '000000'
    },
    estado: {
        type: String,
        enum: ['Activo', 'Sancionado'],
        default: 'Activo'
    }
}, {
    timestamps: true
});

// Ocultar la contraseña en las respuestas JSON
UsuarioSchema.methods.toJSON = function() {
    const { __v, password, ...usuario } = this.toObject();
    return usuario;
};

module.exports = model('Usuario', UsuarioSchema);