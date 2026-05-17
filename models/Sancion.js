const { Schema, model } = require('mongoose');

const SancionSchema = new Schema({
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: [true, 'El usuario es obligatorio']
    },
    motivo: {
        type: String,
        required: [true, 'El motivo de la sanción es obligatorio']
    },
    estado: {
        type: String,
        enum: ['Activa', 'Resuelta'],
        default: 'Activa'
    }
}, { timestamps: true });

module.exports = model('Sancion', SancionSchema);