const { Router } = require('express');
const { registrarUsuario, loginUsuario, obtenerAlumnos, actualizarEstado } = require('../controllers/authController');
const { validarJWT } = require('../middlewares/validarJWT');

const router = Router();

// Endpoint para registrar alumno: POST /api/auth/registro
router.post('/registro', registrarUsuario);

// Endpoint para iniciar sesión: POST /api/auth/login
router.post('/login', loginUsuario);

// ==========================================
// NUEVAS RUTAS PARA EL ADMINISTRADOR
// ==========================================

// Endpoint para traer a todos los alumnos: GET /api/auth/alumnos
router.get('/alumnos', validarJWT, obtenerAlumnos);

// Endpoint para cambiar el estado (Activo/Sancionado): PUT /api/auth/alumnos/:id/estado
router.put('/alumnos/:id/estado', validarJWT, actualizarEstado);

module.exports = router;