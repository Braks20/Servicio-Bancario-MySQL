require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const routes = require('./routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Montar todas las rutas
app.use('/api', routes);

// Manejo de errores básico
app.use((err, req, res, next) => {
  console.error('Error global:', err.stack);
  res.status(500).json({ error: 'Algo salió mal en el servidor.' });
});

// Inicialización
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Validar conexión a BD
    await sequelize.authenticate();
    console.log('Conexión a MySQL establecida correctamente.');

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`Servidor bancario escuchando en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('No se pudo iniciar el servidor:', error);
  }
};

startServer();
