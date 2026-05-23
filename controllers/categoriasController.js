const Categoria = require('../models/Categoria');


const obtenerCategorias = async (req, res) => {
    try {
        const categorias = await Categoria.find();
        
        res.json({
            ok: true,
            categorias 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al obtener categorías' });
    }
};


const crearCategoria = async (req, res) => {
    try {
        const nuevaCategoria = new Categoria(req.body);
        const categoriaGuardada = await nuevaCategoria.save();

        res.status(201).json({
            ok: true,
            categoria: categoriaGuardada
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al crear la categoría' });
    }
};


const actualizarCategoria = async (req, res) => {
    try {
        const categoriaId = req.params.id;
        const categoriaActualizada = await Categoria.findByIdAndUpdate(
            categoriaId, 
            req.body, 
            { new: true }
        );

        if (!categoriaActualizada) {
            return res.status(404).json({ ok: false, msg: 'Categoría no encontrada' });
        }

        res.json({ ok: true, categoria: categoriaActualizada });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al actualizar categoría' });
    }
};


const eliminarCategoria = async (req, res) => {
    try {
        const categoriaId = req.params.id;
        const categoriaEliminada = await Categoria.findByIdAndDelete(categoriaId);

        if (!categoriaEliminada) {
            return res.status(404).json({ ok: false, msg: 'Categoría no encontrada' });
        }

        res.json({ ok: true, msg: 'Categoría eliminada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al eliminar categoría' });
    }
};

module.exports = {
    obtenerCategorias,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria
};