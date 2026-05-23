const { Schema, model } = require('mongoose');

const CategoriaSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre de la categoría es obligatorio'],
        unique: true
    },
    descripcion: {
        type: String,
        default: ''
    }
}, {
    timestamps: true 
});

module.exports = model('Categoria', CategoriaSchema);