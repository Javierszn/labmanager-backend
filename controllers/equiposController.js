const Equipo = require('../models/Equipo');


const obtenerEquipos = async (req, res) => {
    try {
        
        const equipos = await Equipo.find().populate('categoria', 'nombre');
        res.json({
            ok: true,
            equipos
        });
    } catch (error) {
        res.status(500).json({ ok: false, msg: 'Error al obtener equipos' });
    }
};


const crearEquipo = async (req, res) => {
    const equipo = new Equipo(req.body);
    try {
        const equipoGuardado = await equipo.save();
        res.status(201).json({
            ok: true,
            equipo: equipoGuardado
        });
    } catch (error) {
        res.status(500).json({ ok: false, msg: 'Error al crear el equipo' });
    }
};


const actualizarEquipo = async (req, res) => {
    const equipoId = req.params.id;
    try {
        const equipo = await Equipo.findById(equipoId);
        if (!equipo) {
            return res.status(404).json({ ok: false, msg: 'Equipo no encontrado' });
        }
        const equipoActualizado = await Equipo.findByIdAndUpdate(equipoId, req.body, { new: true });
        res.json({ ok: true, equipo: equipoActualizado });
    } catch (error) {
        res.status(500).json({ ok: false, msg: 'Error al actualizar equipo' });
    }
};


const eliminarEquipo = async (req, res) => {
    const equipoId = req.params.id;
    try {
        const equipo = await Equipo.findById(equipoId);
        if (!equipo) {
            return res.status(404).json({ ok: false, msg: 'Equipo no encontrado' });
        }
        await Equipo.findByIdAndDelete(equipoId);
        res.json({ ok: true, msg: 'Equipo eliminado' });
    } catch (error) {
        res.status(500).json({ ok: false, msg: 'Error al eliminar equipo' });
    }
};

module.exports = {
    obtenerEquipos,
    crearEquipo,
    actualizarEquipo,
    eliminarEquipo
};