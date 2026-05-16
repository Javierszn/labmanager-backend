const { Router } = require('express');
const { 
    crearSancion, 
    obtenerSanciones, 
    actualizarSancion, 
    eliminarSancion 
} = require('../controllers/sancionesController');
const { validarJWT, verifyAdminRole } = require('../middlewares/validarJWT');

const router = Router();

// Aplicamos los middlewares de seguridad para validar token y rol de administrador
router.post('/', [validarJWT, verifyAdminRole], crearSancion);
router.get('/', [validarJWT, verifyAdminRole], obtenerSanciones);
router.put('/:id', [validarJWT, verifyAdminRole], actualizarSancion);
router.delete('/:id', [validarJWT, verifyAdminRole], eliminarSancion);

module.exports = router;