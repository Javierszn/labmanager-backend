const { Router } = require('express');
const { registrarUsuario, loginUsuario } = require('../controllers/authController');

const router = Router();

// Endpoint para registrar alumno: POST /api/auth/registro
router.post('/registro', registrarUsuario);

// Endpoint para iniciar sesión: POST /api/auth/login
router.post('/login', loginUsuario);

module.exports = router;