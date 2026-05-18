const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); 
const nodemailer = require('nodemailer'); 

const generarJWT = (uid, rol) => {
    return jwt.sign({ uid, rol }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

const registrarUsuario = async (req, res) => {
    try {
        const { nombre, correo, password, telefono, institucion, facultad } = req.body;
        
        const existeUsuario = await Usuario.findOne({ correo });
        if (existeUsuario) return res.status(400).json({ ok: false, msg: 'El correo ya está registrado en el sistema' });

        const matriculaGenerada = Math.floor(100000 + Math.random() * 900000).toString();

        const usuario = new Usuario({ 
            nombre, 
            correo, 
            password, 
            matricula: matriculaGenerada, 
            telefono: telefono || '',
            institucion: institucion || 'UASLP',
            facultad: facultad || 'Facultad de Ingeniería'
        });
        
        const salt = bcrypt.genSaltSync(10);
        usuario.password = bcrypt.hashSync(password, salt);

        await usuario.save();
        const token = generarJWT(usuario.id, usuario.rol);

        res.status(201).json({ ok: true, usuario, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error inesperado al registrar usuario.' });
    }
};

const loginUsuario = async (req, res) => {
    try {
        const { correo, password } = req.body;
        const usuario = await Usuario.findOne({ correo });
        if (!usuario) return res.status(400).json({ ok: false, msg: 'Credenciales no válidas - correo' });

        const validPassword = bcrypt.compareSync(password, usuario.password);
        if (!validPassword) return res.status(400).json({ ok: false, msg: 'Credenciales no válidas - password' });

        const token = generarJWT(usuario.id, usuario.rol);
        res.json({ ok: true, usuario, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error inesperado en el login.' });
    }
};

const obtenerMiPerfil = async (req, res) => {
    try {
        res.json({ ok: true, usuario: req.userActive });
    } catch (error) {
        res.status(500).json({ ok: false, msg: 'Error al obtener tu perfil' });
    }
};

const actualizarMiPerfil = async (req, res) => {
    try {
        const uid = req.userActive._id;
        const { nombre, correo, telefono, institucion, facultad, foto } = req.body;
        const usuarioActualizado = await Usuario.findByIdAndUpdate(uid, { nombre, correo, telefono, institucion, facultad, foto }, { new: true }).select('-password');
        res.json({ ok: true, usuario: usuarioActualizado });
    } catch (error) {
        res.status(500).json({ ok: false, msg: 'Error al actualizar perfil' });
    }
};

const actualizarPassword = async (req, res) => {
    try {
        const uid = req.userActive._id;
        const { password } = req.body;
        const salt = bcrypt.genSaltSync(10);
        const passwordHash = bcrypt.hashSync(password, salt);
        await Usuario.findByIdAndUpdate(uid, { password: passwordHash });
        res.json({ ok: true, msg: 'Contraseña actualizada' });
    } catch (error) {
        res.status(500).json({ ok: false, msg: 'Error al actualizar contraseña' });
    }
};

const obtenerAlumnos = async (req, res) => {
    try {
        const alumnos = await Usuario.find({ rol: 'alumno' }).select('-password');
        res.json({ ok: true, alumnos });
    } catch (error) {
        res.status(500).json({ ok: false, msg: 'Error al obtener lista de alumnos' });
    }
};

const actualizarEstado = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body; 
        const usuarioActualizado = await Usuario.findByIdAndUpdate(id, { estado }, { new: true }).select('-password');
        if (!usuarioActualizado) return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
        res.json({ ok: true, usuario: usuarioActualizado });
    } catch (error) {
        res.status(500).json({ ok: false, msg: 'Error al actualizar estado' });
    }
};

const eliminarMiCuenta = async (req, res) => {
    try {
        const uid = req.userActive._id;
        await Usuario.findByIdAndDelete(uid);
        res.json({ ok: true, msg: 'Cuenta eliminada permanentemente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al intentar eliminar la cuenta.' });
    }
};

// ==========================================
// LÓGICA DE RECUPERACIÓN DE CONTRASEÑA
// ==========================================

const solicitarRecuperacion = async (req, res) => {
    try {
        const { correo } = req.body;
        const usuario = await Usuario.findOne({ correo });

        if (!usuario) {
            return res.json({ ok: true, msg: 'Si el correo existe, recibirás un enlace de recuperación.' });
        }

        const token = crypto.randomBytes(20).toString('hex');
        usuario.resetPasswordToken = token;
        usuario.resetPasswordExpires = Date.now() + 1800000; 
        await usuario.save();

        // --- CONFIGURACIÓN OPTIMIZADA PARA PRODUCCIÓN (PORT 587) ---
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // false para puerto 587 (STARTTLS)
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false // Evita que Render rechace la conexión por temas de certificados TLS
            }
        });

        // Verificación de conexión inmediata
        await transporter.verify();

        const mailOptions = {
            from: `"LabManager Soporte" <${process.env.EMAIL_USER}>`,
            to: usuario.correo,
            subject: 'Recuperación de Contraseña - LabManager UASLP',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #004a99; text-align: center;">LabManager UASLP</h2>
                    <p style="font-size: 16px;">Hola <strong>${usuario.nombre}</strong>,</p>
                    <p style="font-size: 16px;">Recibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el botón de abajo para crear una nueva:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://labmanager-front-fjebuqz7y-javiergariv-2192s-projects.vercel.app/login?token=${token}" style="background-color: #004a99; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Restablecer Contraseña</a>
                    </div>
                    <p style="font-size: 14px; color: #555;">Este enlace es seguro y expirará en 30 minutos.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.json({ ok: true, msg: 'Si el correo existe, recibirás un enlace de recuperación.' });

    } catch (error) {
        console.error("❌ Error detallado de Nodemailer:", error);
        res.status(500).json({ ok: false, msg: 'Hubo un error al enviar el correo' });
    }
};

const resetearPasswordOlvidada = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const usuario = await Usuario.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!usuario) {
            return res.status(400).json({ ok: false, msg: 'El enlace de recuperación es inválido o ha expirado.' });
        }

        const salt = bcrypt.genSaltSync(10);
        usuario.password = bcrypt.hashSync(password, salt);
        
        usuario.resetPasswordToken = undefined;
        usuario.resetPasswordExpires = undefined;

        await usuario.save();

        res.json({ ok: true, msg: 'Tu contraseña ha sido restablecida exitosamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al restablecer contraseña' });
    }
};

module.exports = {
    registrarUsuario, loginUsuario, obtenerAlumnos, actualizarEstado, 
    obtenerMiPerfil, actualizarMiPerfil, actualizarPassword,
    solicitarRecuperacion, resetearPasswordOlvidada, eliminarMiCuenta
};