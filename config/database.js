const mongoose = require('mongoose');

const dbConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Base de datos MongoDB conectada exitosamente');
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
        throw new Error('Error al inicializar la base de datos');
    }
};

module.exports = { dbConnection };