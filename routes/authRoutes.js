const { Router } = require('express');
const { registrarUsuario, loginUsuario, obtenerAlumnos, actualizarEstado, obtenerMiPerfil, actualizarMiPerfil, actualizarPassword } = require('../controllers/authController');
const { validarJWT } = require('../middlewares/validarJWT');

const router = Router();

// Endpoints públicos
router.post('/registro', registrarUsuario);
router.post('/login', loginUsuario);

// Endpoints privados para el perfil del alumno
router.get('/me', validarJWT, obtenerMiPerfil);
router.put('/me', validarJWT, actualizarMiPerfil);             // <-- Guardar info
router.put('/me/password', validarJWT, actualizarPassword);    // <-- Cambiar contraseña

// Endpoints para el administrador
router.get('/alumnos', validarJWT, obtenerAlumnos);
router.put('/alumnos/:id/estado', validarJWT, actualizarEstado);

module.exports = router;