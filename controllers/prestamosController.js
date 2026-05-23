const Prestamo = require('../models/Prestamo');
const Equipo = require('../models/Equipo');


const crearPrestamo = async (req, res) => {
    try {

        if (!req.userActive) {
            return res.status(401).json({
                ok: false,
                msg: '🔒 Acción denegada: Debes iniciar sesión para poder realizar solicitudes de materiales.'
            });
        }

        
        if (req.userActive.estado === 'Sancionado') {
            return res.status(403).json({
                ok: false,
                msg: '⚠️ No puedes solicitar material porque tu cuenta está Sancionada. Acude con el laboratorista.'
            });
        }

        const { equipos, fechaSalida, fechaLimite } = req.body;
        const usuarioId = req.userActive._id; 

        
        for (let item of equipos) {
            const equipoDB = await Equipo.findById(item.equipo);
            if (!equipoDB || equipoDB.stockDisponible < item.cantidad) {
                return res.status(400).json({
                    ok: false,
                    msg: `No hay stock suficiente para el equipo: ${equipoDB ? equipoDB.nombre : item.equipo}`
                });
            }
        }

        
        const nuevoPrestamo = new Prestamo({
            usuario: usuarioId,
            equipos,
            fechaSalida,
            fechaLimite
        });

        const prestamoGuardado = await nuevoPrestamo.save();

        
        for (let item of equipos) {
            await Equipo.findByIdAndUpdate(item.equipo, {
                $inc: { stockDisponible: -item.cantidad }
            });
        }

        res.status(201).json({
            ok: true,
            prestamo: prestamoGuardado
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al procesar el préstamo' });
    }
};


const obtenerTodosPrestamos = async (req, res) => {
    try {
        const prestamos = await Prestamo.find()
            .populate('usuario', 'nombre correo matricula')
            .populate('equipos.equipo', 'nombre');
            
        res.json({ ok: true, prestamos });
    } catch (error) {
        res.status(500).json({ ok: false, msg: 'Error al obtener los préstamos' });
    }
};


const obtenerPrestamosUsuario = async (req, res) => {
    try {
        const prestamos = await Prestamo.find({ usuario: req.userActive._id })
            .populate('equipos.equipo', 'nombre');
            
        res.json({ ok: true, prestamos });
    } catch (error) {
        res.status(500).json({ ok: false, msg: 'Error al obtener tu historial' });
    }
};


const actualizarEstadoPrestamo = async (req, res) => {
    try {
        const { estado } = req.body;
        const prestamoId = req.params.id;

        const prestamoActualizado = await Prestamo.findByIdAndUpdate(
            prestamoId, 
            { estado }, 
            { new: true }
        );

        res.json({ ok: true, prestamo: prestamoActualizado });
    } catch (error) {
        res.status(500).json({ ok: false, msg: 'Error al actualizar estado' });
    }
};


const cancelarPrestamo = async (req, res) => {
    try {
        const prestamoId = req.params.id;
        const prestamo = await Prestamo.findById(prestamoId);

        if (!prestamo) {
            return res.status(404).json({ ok: false, msg: 'Préstamo no encontrado' });
        }

        if (prestamo.estado !== 'Pendiente') {
            return res.status(400).json({ ok: false, msg: 'Solo se pueden cancelar préstamos pendientes' });
        }

        prestamo.estado = 'Cancelado';
        await prestamo.save();

        for (let item of prestamo.equipos) {
            await Equipo.findByIdAndUpdate(item.equipo, {
                $inc: { stockDisponible: item.cantidad }
            });
        }

        res.json({ ok: true, msg: 'Préstamo cancelado y stock devuelto' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Hubo un error al cancelar en el servidor' });
    }
};

module.exports = {
    crearPrestamo,
    obtenerTodosPrestamos,
    obtenerPrestamosUsuario,
    actualizarEstadoPrestamo,
    cancelarPrestamo
};