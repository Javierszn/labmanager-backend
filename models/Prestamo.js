const { Schema, model } = require('mongoose');

const PrestamoSchema = new Schema({
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: [true, 'El usuario es obligatorio']
    },
    equipos: [{
        equipo: {
            type: Schema.Types.ObjectId,
            ref: 'Equipo',
            required: [true, 'El equipo es obligatorio']
        },
        cantidad: {
            type: Number,
            required: true,
            default: 1
        }
    }],
    fechaSalida: {
        type: Date,
        required: [true, 'La fecha de salida es obligatoria']
    },
    fechaLimite: {
        type: Date,
        required: [true, 'La fecha límite de entrega es obligatoria']
    },
    estado: {
        type: String,
        enum: ['Pendiente', 'Activo', 'Finalizado', 'Vencido', 'Rechazado', 'Cancelado'],
        default: 'Pendiente'
    }
}, {
    timestamps: true
});

module.exports = model('Prestamo', PrestamoSchema);