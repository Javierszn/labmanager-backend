const { Router } = require('express');
const { obtenerEquipos, crearEquipo, actualizarEquipo, eliminarEquipo } = require('../controllers/equiposController');
const { validarJWT, verifyAdminRole } = require('../middlewares/validarJWT');

const router = Router();

// Todos pueden ver los equipos, pero deben estar logueados
router.get('/', validarJWT, obtenerEquipos);

// Solo el Administrador puede realizar cambios (CRUD)
router.post('/', [validarJWT, verifyAdminRole], crearEquipo);
router.put('/:id', [validarJWT, verifyAdminRole], actualizarEquipo);
router.delete('/:id', [validarJWT, verifyAdminRole], eliminarEquipo);

module.exports = router;