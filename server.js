const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { dbConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Conectar a la base de datos
dbConnection();

// ==========================================
// MIDDLEWARES GLOBALES (Deben ir primero)
// ==========================================
app.use(cors());
app.use(express.json());

// ==========================================
// RUTAS DEL SISTEMA
// ==========================================
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/equipos', require('./routes/equiposRoutes'));
app.use('/api/categorias', require('./routes/categoriasRoutes'));
app.use('/api/prestamos', require('./routes/prestamosRoutes'));
app.use('/api/sanciones', require('./routes/sancionesRoutes'));

// Ruta base de prueba
app.get('/api', (req, res) => {
    res.json({ msg: 'API de LabManager funcionando correctamente' });
});

// Arrancar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});