const Sancion = require('../models/Sancion');

// 1. Creación: Registrar una nueva sanción (Solo Admin)
const crearSancion = async (req, res) => {
    const sancion = new Sancion(req.body);
    try {
        const sancionGuardada = await sancion.save();
        res.status(201).json({
            ok: true,
            sancion: sancionGuardada
        });
    } catch (error) {
        res.status(500).json({ ok: false, msg: 'Error al crear la sanción' });
    }
};

// 2. Lectura: Obtener la lista de sanciones
const obtenerSanciones = async (req, res) => {
    try {
        const sanciones = await Sancion.find()
            .populate('usuario', 'nombre correo matricula')
            .populate('prestamo');
        res.json({ ok: true, sanciones });
    } catch (error) {
        res.status(500).json({ ok: false, msg: 'Error al obtener las sanciones' });
    }
};

// 3. Actualización: Modificar una sanción (ej. marcarla como inactiva/resuelta)
const actualizarSancion = async (req, res) => {
    const sancionId = req.params.id;
    try {
        const sancionActualizada = await Sancion.findByIdAndUpdate(
            sancionId, 
            req.body, 
            { new: true }
        );
        if (!sancionActualizada) {
            return res.status(404).json({ ok: false, msg: 'Sanción no encontrada' });
        }
        res.json({ ok: true, sancion: sancionActualizada });
    } catch (error) {
        res.status(500).json({ ok: false, msg: 'Error al actualizar la sanción' });
    }
};

// 4. Eliminación: Borrar un registro de sanción
const eliminarSancion = async (req, res) => {
    const sancionId = req.params.id;
    try {
        const sancionEliminada = await Sancion.findByIdAndDelete(sancionId);
        if (!sancionEliminada) {
            return res.status(404).json({ ok: false, msg: 'Sanción no encontrada' });
        }
        res.json({ ok: true, msg: 'Sanción eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ ok: false, msg: 'Error al eliminar la sanción' });
    }
};

module.exports = {
    crearSancion,
    obtenerSanciones,
    actualizarSancion,
    eliminarSancion
};