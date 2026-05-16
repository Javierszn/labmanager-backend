const { Schema, model } = require('mongoose');

const SancionSchema = new Schema({
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: [true, 'El usuario sancionado es obligatorio']
    },
    prestamo: {
        type: Schema.Types.ObjectId,
        ref: 'Prestamo',
        required: false
    },
    motivo: {
        type: String,
        required: [true, 'El motivo de la sanción es obligatorio']
    },
    activa: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = model('Sancion', SancionSchema);