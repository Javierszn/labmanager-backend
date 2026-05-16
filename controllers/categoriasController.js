const Categoria = require('../models/Categoria');

const obtenerCategorias = async (req, res) => {
    const categorias = await Categoria.find();
    res.json({ ok: true, categorias });
};

const crearCategoria = async (req, res) => {
    const categoria = new Categoria(req.body);
    try {
        const categoriaGuardada = await categoria.save();
        res.status(201).json({ ok: true, categoria: categoriaGuardada });
    } catch (error) {
        res.status(500).json({ ok: false, msg: 'Error al crear categoría' });
    }
};

module.exports = { obtenerCategorias, crearCategoria };