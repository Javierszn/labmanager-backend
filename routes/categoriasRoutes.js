const { Router } = require('express');
const { obtenerCategorias, crearCategoria, actualizarCategoria, eliminarCategoria } = require('../controllers/categoriasController');
const { validarJWT } = require('../middlewares/validarJWT'); 

const router = Router();

// Obtener categorías (puede ser público o protegido, depende de tu lógica)
router.get('/', obtenerCategorias);

// Las acciones de modificar requieren ser admin (o al menos estar logueado)
router.post('/', validarJWT, crearCategoria);
router.put('/:id', validarJWT, actualizarCategoria);
router.delete('/:id', validarJWT, eliminarCategoria);

module.exports = router;