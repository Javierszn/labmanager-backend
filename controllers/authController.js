const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// GENERADOR DE TOKEN (Función auxiliar)
const generarJWT = (uid, rol) => {
    return jwt.sign({ uid, rol }, process.env.JWT_SECRET, {
        expiresIn: '24h' // El token expirará en 24 horas
    });
};

// REGISTRO DE NUEVOS ALUMNOS
const registrarUsuario = async (req, res) => {
    try {
        const { nombre, correo, password, matricula } = req.body;

        // 1. Verificar si el correo ya está registrado
        const existeUsuario = await Usuario.findOne({ correo });
        if (existeUsuario) {
            return res.status(400).json({
                ok: false,
                msg: 'El correo ya está registrado en el sistema'
            });
        }

        // 2. Crear la instancia del usuario (por defecto será rol 'alumno')
        const usuario = new Usuario({ nombre, correo, password, matricula });

        // 3. Encriptar la contraseña
        const salt = bcrypt.genSaltSync(10);
        usuario.password = bcrypt.hashSync(password, salt);

        // 4. Guardar en la base de datos
        await usuario.save();

        // 5. Generar su JWT para que quede logueado de inmediato
        const token = generarJWT(usuario.id, usuario.rol);

        res.status(201).json({
            ok: true,
            usuario,
            token
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado al registrar usuario. Hable con el administrador'
        });
    }
};

// LOGIN DE USUARIOS
const loginUsuario = async (req, res) => {
    try {
        const { correo, password } = req.body;

        // 1. Verificar si el correo existe
        const usuario = await Usuario.findOne({ correo });
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                msg: 'Credenciales no válidas - correo'
            });
        }

        // 2. Confirmar si la contraseña hace match con el hash
        const validPassword = bcrypt.compareSync(password, usuario.password);
        if (!validPassword) {
            return res.status(400).json({
                ok: false,
                msg: 'Credenciales no válidas - password'
            });
        }

        // 3. Generar el JWT
        const token = generarJWT(usuario.id, usuario.rol);

        res.json({
            ok: true,
            usuario,
            token
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado en el login. Hable con el administrador'
        });
    }
};

module.exports = {
    registrarUsuario,
    loginUsuario
};