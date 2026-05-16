const { Router } = require('express');
const { obtenerCategorias, crearCategoria } = require('../controllers/categoriasController');
const { validarJWT, verifyAdminRole } = require('../middlewares/validarJWT');

const router = Router();

router.get('/', validarJWT, obtenerCategorias);
router.post('/', [validarJWT, verifyAdminRole], crearCategoria);

module.exports = router;