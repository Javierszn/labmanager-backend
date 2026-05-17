const { Router } = require('express');
const { obtenerSanciones, crearSancion, resolverSancion, eliminarSancion } = require('../controllers/sancionesController');
const { validarJWT } = require('../middlewares/validarJWT'); 

const router = Router();

// Todas las rutas protegidas para el administrador
router.get('/', validarJWT, obtenerSanciones);
router.post('/', validarJWT, crearSancion);
router.put('/:id/resolver', validarJWT, resolverSancion);
router.delete('/:id', validarJWT, eliminarSancion);

module.exports = router;