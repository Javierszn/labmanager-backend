const { Schema, model } = require('mongoose');

const EquipoSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre del equipo es obligatorio']
    },
    descripcion: {
        type: String,
        required: [true, 'La descripción es obligatoria']
    },
    stockTotal: {
        type: Number,
        required: [true, 'El stock total es obligatorio'],
        default: 1
    },
    stockDisponible: {
        type: Number,
        required: [true, 'El stock disponible es obligatorio'],
        default: 1
    },
    imagenUrl: {
        type: String,
        default: ''
    },
    categoria: {
        type: Schema.Types.ObjectId,
        ref: 'Categoria',
        required: [true, 'La categoría es obligatoria']
    }
}, {
    timestamps: true
});

module.exports = model('Equipo', EquipoSchema);