const Sancion = require('../models/Sancion');
const Usuario = require('../models/Usuario');

// Obtener todas las sanciones (para el panel del administrador)
const obtenerSanciones = async (req, res) => {
    try {
        const sanciones = await Sancion.find().populate('usuario', 'nombre matricula correo');
        res.json({ ok: true, sanciones });
    } catch (error) {
        res.status(500).json({ ok: false, msg: 'Error al obtener sanciones' });
    }
};

// Obtener sanciones solo del usuario logueado (para su perfil)
const obtenerMisSanciones = async (req, res) => {
    try {
        const sanciones = await Sancion.find({ usuario: req.userActive._id }).sort({ createdAt: -1 });
        res.json({ ok: true, sanciones });
    } catch (error) {
        res.status(500).json({ ok: false, msg: 'Error al obtener tu historial de sanciones' });
    }
};

// Aplicar una nueva sanción a un alumno
const crearSancion = async (req, res) => {
    try {
        const { usuario, motivo } = req.body;
        const nuevaSancion = new Sancion({ usuario, motivo });
        await nuevaSancion.save();

        // Al mismo tiempo que creamos la sanción, bloqueamos al usuario
        await Usuario.findByIdAndUpdate(usuario, { estado: 'Sancionado' });

        res.status(201).json({ ok: true, sancion: nuevaSancion });
    } catch (error) {
        res.status(500).json({ ok: false, msg: 'Error al aplicar sanción' });
    }
};

// Resolver (Quitar) una sanción
const resolverSancion = async (req, res) => {
    try {
        const sancionId = req.params.id;
        const sancion = await Sancion.findByIdAndUpdate(sancionId, { estado: 'Resuelta' }, { new: true });

        // Al resolver la sanción, le devolvemos el acceso al usuario
        await Usuario.findByIdAndUpdate(sancion.usuario, { estado: 'Activo' });

        res.json({ ok: true, sancion });
    } catch (error) {
        res.status(500).json({ ok: false, msg: 'Error al resolver sanción' });
    }
};

// Eliminar el registro por completo
const eliminarSancion = async (req, res) => {
    try {
        await Sancion.findByIdAndDelete(req.params.id);
        res.json({ ok: true, msg: 'Sanción eliminada del historial' });
    } catch (error) {
        res.status(500).json({ ok: false, msg: 'Error al eliminar' });
    }
};

module.exports = { 
    obtenerSanciones, 
    obtenerMisSanciones, 
    crearSancion, 
    resolverSancion, 
    eliminarSancion 
};