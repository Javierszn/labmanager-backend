const { Router } = require('express');
const { obtenerSanciones, obtenerMisSanciones, crearSancion, resolverSancion, eliminarSancion } = require('../controllers/sancionesController');
const { validarJWT } = require('../middlewares/validarJWT'); 

const router = Router();

// Ruta privada para que el alumno vea sus propias sanciones
router.get('/mis-sanciones', validarJWT, obtenerMisSanciones);

// Rutas protegidas para el administrador
router.get('/', validarJWT, obtenerSanciones);
router.post('/', validarJWT, crearSancion);
router.put('/:id/resolver', validarJWT, resolverSancion);
router.delete('/:id', validarJWT, eliminarSancion);

module.exports = router;