const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');


const validarJWT = async (req, res, next) => {
    
    const token = req.header('x-token');

    if (!token) {
        return res.status(401).json({
            ok: false,
            msg: 'No hay token en la petición'
        });
    }

    try {
        
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        
        const usuario = await Usuario.findById(payload.uid);

        if (!usuario) {
            return res.status(401).json({
                ok: false,
                msg: 'Token no válido - el usuario no existe en la base de datos'
            });
        }

        
        req.userActive = usuario;

        next();
    } catch (error) {
        return res.status(401).json({
            ok: false,
            msg: 'Token invalido'
        });
    }
};


const verifyAdminRole = (req, res, next) => {
 
    if (!req.userActive) {
        return res.status(401).json({
            ok: false,
            msg: 'Token invalido'
        });
    }

    
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