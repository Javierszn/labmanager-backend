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

        const existeUsuario = await Usuario.findOne({ correo });
        if (existeUsuario) {
            return res.status(400).json({
                ok: false,
                msg: 'El correo ya está registrado en el sistema'
            });
        }

        // Se guarda el estado por defecto 'Activo' desde el modelo
        const usuario = new Usuario({ nombre, correo, password, matricula });

        const salt = bcrypt.genSaltSync(10);
        usuario.password = bcrypt.hashSync(password, salt);

        await usuario.save();

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

        const usuario = await Usuario.findOne({ correo });
        if (!usuario) {
            return res.status(400).json({ ok: false, msg: 'Credenciales no válidas - correo' });
        }

        const validPassword = bcrypt.compareSync(password, usuario.password);
        if (!validPassword) {
            return res.status(400).json({ ok: false, msg: 'Credenciales no válidas - password' });
        }

        const token = generarJWT(usuario.id, usuario.rol);

        res.json({ ok: true, usuario, token });

    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error inesperado en el login.' });
    }
};

// ==========================================
// NUEVAS FUNCIONES PARA EL ADMINISTRADOR
// ==========================================

// TRAER LA LISTA DE ALUMNOS
const obtenerAlumnos = async (req, res) => {
    try {
        // Buscamos solo a los que tienen rol de 'alumno' y ocultamos la contraseña en la respuesta
        const alumnos = await Usuario.find({ rol: 'alumno' }).select('-password');
        
        res.json({
            ok: true,
            alumnos
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al obtener lista de alumnos' });
    }
};

// BLOQUEAR / DESBLOQUEAR ALUMNO
const actualizarEstado = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body; // Recibiremos 'Activo' o 'Sancionado'

        const usuarioActualizado = await Usuario.findByIdAndUpdate(
            id,
            { estado },
            { new: true } // Para que nos devuelva el registro ya actualizado
        ).select('-password');

        if (!usuarioActualizado) {
            return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
        }

        res.json({
            ok: true,
            usuario: usuarioActualizado
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al actualizar el estado del usuario' });
    }
};

module.exports = {
    registrarUsuario,
    loginUsuario,
    obtenerAlumnos,
    actualizarEstado
};