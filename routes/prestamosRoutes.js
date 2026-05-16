const { Router } = require('express');
const { 
    crearPrestamo, 
    obtenerTodosPrestamos, 
    obtenerPrestamosUsuario, 
    actualizarEstadoPrestamo,
    cancelarPrestamo // <-- Importamos la nueva función
} = require('../controllers/prestamosController');
const { validarJWT, verifyAdminRole } = require('../middlewares/validarJWT');

const router = Router();

// Rutas para Alumnos (Requieren estar logueados)
router.post('/', validarJWT, crearPrestamo);
router.get('/mis-prestamos', validarJWT, obtenerPrestamosUsuario);
router.put('/cancelar/:id', validarJWT, cancelarPrestamo); // <-- Nueva ruta de cancelación

// Rutas de Administración (Requieren rol de admin)
router.get('/admin', [validarJWT, verifyAdminRole], obtenerTodosPrestamos);
router.put('/admin/:id', [validarJWT, verifyAdminRole], actualizarEstadoPrestamo);

module.exports = router;