const { Router } = require('express');
const { registrarUsuario, loginUsuario, obtenerAlumnos, actualizarEstado, obtenerMiPerfil, actualizarMiPerfil, actualizarPassword, solicitarRecuperacion, resetearPasswordOlvidada } = require('../controllers/authController');
const { validarJWT } = require('../middlewares/validarJWT');

const router = Router();

router.post('/registro', registrarUsuario);
router.post('/login', loginUsuario);

// --- RUTAS PÚBLICAS PARA RECUPERACIÓN DE CONTRASEÑA ---
router.post('/recuperar', solicitarRecuperacion);
router.post('/reset-password/:token', resetearPasswordOlvidada);

// Rutas privadas del alumno
router.get('/me', validarJWT, obtenerMiPerfil);
router.put('/me', validarJWT, actualizarMiPerfil);             
router.put('/me/password', validarJWT, actualizarPassword);    

// Rutas del admin
router.get('/alumnos', validarJWT, obtenerAlumnos);
router.put('/alumnos/:id/estado', validarJWT, actualizarEstado);

module.exports = router;