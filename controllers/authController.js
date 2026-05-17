const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// GENERADOR DE TOKEN
const generarJWT = (uid, rol) => {
    return jwt.sign({ uid, rol }, process.env.JWT_SECRET, {
        expiresIn: '24h' 
    });
};

// REGISTRO DE NUEVOS ALUMNOS
const registrarUsuario = async (req, res) => {
    try {
        const { nombre, correo, password, matricula } = req.body;

        const existeUsuario = await Usuario.findOne({ correo });
        if (existeUsuario) {
            return res.status(400).json({ ok: false, msg: 'El correo ya está registrado en el sistema' });
        }

        const usuario = new Usuario({ nombre, correo, password, matricula });
        const salt = bcrypt.genSaltSync(10);
        usuario.password = bcrypt.hashSync(password, salt);

        await usuario.save();
        const token = generarJWT(usuario.id, usuario.rol);

        res.status(201).json({ ok: true, usuario, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error inesperado al registrar usuario. Hable con el administrador' });
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

// OBTENER EL PERFIL DEL USUARIO LOGUEADO
const obtenerMiPerfil = async (req, res) => {
    try {
        res.json({ ok: true, usuario: req.userActive });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al obtener tu perfil' });
    }
};

// --- NUEVA: ACTUALIZAR DATOS DEL PERFIL ---
const actualizarMiPerfil = async (req, res) => {
    try {
        const uid = req.userActive._id;
        // Extraemos solo lo que sí pueden editar (dejamos fuera matricula, estado, rol y password)
        const { nombre, correo, telefono, institucion, facultad, foto } = req.body;

        const usuarioActualizado = await Usuario.findByIdAndUpdate(
            uid,
            { nombre, correo, telefono, institucion, facultad, foto },
            { new: true }
        ).select('-password');

        res.json({ ok: true, usuario: usuarioActualizado });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al actualizar perfil' });
    }
};

// --- NUEVA: ACTUALIZAR CONTRASEÑA ---
const actualizarPassword = async (req, res) => {
    try {
        const uid = req.userActive._id;
        const { password } = req.body;

        const salt = bcrypt.genSaltSync(10);
        const passwordHash = bcrypt.hashSync(password, salt);

        await Usuario.findByIdAndUpdate(uid, { password: passwordHash });
        res.json({ ok: true, msg: 'Contraseña actualizada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al actualizar contraseña' });
    }
};

// TRAER LA LISTA DE ALUMNOS (ADMIN)
const obtenerAlumnos = async (req, res) => {
    try {
        const alumnos = await Usuario.find({ rol: 'alumno' }).select('-password');
        res.json({ ok: true, alumnos });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al obtener lista de alumnos' });
    }
};

// BLOQUEAR / DESBLOQUEAR ALUMNO (ADMIN)
const actualizarEstado = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body; 

        const usuarioActualizado = await Usuario.findByIdAndUpdate(id, { estado }, { new: true }).select('-password');
        if (!usuarioActualizado) return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });

        res.json({ ok: true, usuario: usuarioActualizado });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al actualizar el estado del usuario' });
    }
};

module.exports = {
    registrarUsuario,
    loginUsuario,
    obtenerAlumnos,
    actualizarEstado,
    obtenerMiPerfil,
    actualizarMiPerfil,
    actualizarPassword
};