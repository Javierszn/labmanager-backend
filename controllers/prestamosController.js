const Prestamo = require('../models/Prestamo');
const Equipo = require('../models/Equipo');

// 1. Crear una solicitud de préstamo (Alumno)
const crearPrestamo = async (req, res) => {
    try {
        const { equipos, fechaSalida, fechaLimite } = req.body;
        const usuarioId = req.userActive._id; // Obtenido del middleware validarJWT

        // Validar stock disponible de cada equipo antes de confirmar
        for (let item of equipos) {
            const equipoDB = await Equipo.findById(item.equipo);
            if (!equipoDB || equipoDB.stockDisponible < item.cantidad) {
                return res.status(400).json({
                    ok: false,
                    msg: `No hay stock suficiente para el equipo: ${equipoDB ? equipoDB.nombre : item.equipo}`
                });
            }
        }

        // Crear el préstamo con estado por defecto "Pendiente"
        const nuevoPrestamo = new Prestamo({
            usuario: usuarioId,
            equipos,
            fechaSalida,
            fechaLimite
        });

        const prestamoGuardado = await nuevoPrestamo.save();

        // Restar temporalmente el stock disponible
        for (let item of equipos) {
            await Equipo.findByIdAndUpdate(item.equipo, {
                $inc: { stockDisponible: -item.cantidad } // Resta la cantidad solicitada
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

// 2. Obtener todos los préstamos (Para el panel del Laboratorista)
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

// 3. Obtener préstamos de un alumno específico (Historial)
const obtenerPrestamosUsuario = async (req, res) => {
    try {
        const prestamos = await Prestamo.find({ usuario: req.userActive._id })
            .populate('equipos.equipo', 'nombre');
            
        res.json({ ok: true, prestamos });
    } catch (error) {
        res.status(500).json({ ok: false, msg: 'Error al obtener tu historial' });
    }
};

// 4. Actualizar estado del préstamo (Aprobar/Rechazar - Solo Admin)
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

// 5. NUEVO: Cancelar préstamo (Alumno)
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

        // Cambiamos el estado a Cancelado
        prestamo.estado = 'Cancelado';
        await prestamo.save();

        // Le regresamos el stock a los equipos en el catálogo
        for (let item of prestamo.equipos) {
            await Equipo.findByIdAndUpdate(item.equipo, {
                $inc: { stockDisponible: item.cantidad } // Suma la cantidad devuelta
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
    cancelarPrestamo // <-- Exportamos la nueva función
};