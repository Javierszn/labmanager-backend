const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// MIDDLEWARE 1: Verificar que el token sea válido
const validarJWT = async (req, res, next) => {
    // Leer el token de los headers (usaremos la cabecera 'x-token')
    const token = req.header('x-token');

    if (!token) {
        return res.status(401).json({
            ok: false,
            msg: 'No hay token en la petición'
        });
    }

    try {
        // Verificar el payload del token con nuestra clave secreta
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        // Buscamos en la BD el usuario al que pertenece ese ID
        const usuario = await Usuario.findById(payload.uid);

        if (!usuario) {
            return res.status(401).json({
                ok: false,
                msg: 'Token no válido - el usuario no existe en la base de datos'
            });
        }

        // Añadimos esta información al objeto de la petición exactamente como en tus apuntes
        req.userActive = usuario;

        next();
    } catch (error) {
        return res.status(401).json({
            ok: false,
            msg: 'Token invalido'
        });
    }
};

// MIDDLEWARE 2: Verificar que el usuario tenga rol de Administrador
const verifyAdminRole = (req, res, next) => {
    // Verificamos si validarJWT ya colocó al usuario en la petición
    if (!req.userActive) {
        return res.status(401).json({
            ok: false,
            msg: 'Token invalido'
        });
    }

    // Validamos el rol para el control total de los módulos
    if (req.userActive.rol !== 'admin') {
        return res.status(401).json({
            ok: false,
            msg: 'Permiso denegado - Requiere privilegios de administrador'
        });
    }

    next();
};

module.exports = {
    validarJWT,
    verifyAdminRole
};