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
    matricula: {
        type: String,
        default: '000000'
    },
    estado: {
        type: String,
        enum: ['Activo', 'Sancionado'],
        default: 'Activo'
    },
    telefono: { type: String, default: '' },
    institucion: { type: String, default: 'UASLP' },
    facultad: { type: String, default: 'Facultad de Ingeniería' },
    foto: { type: String, default: 'https://placehold.co/128x128/003b5c/ffffff?text=Perfil' },
    
    // --- CAMPOS PARA RECUPERACIÓN DE CONTRASEÑA ---
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }
}, {
    timestamps: true
});

UsuarioSchema.methods.toJSON = function() {
    const { __v, password, resetPasswordToken, resetPasswordExpires, ...usuario } = this.toObject();
    return usuario;
};

module.exports = model('Usuario', UsuarioSchema);