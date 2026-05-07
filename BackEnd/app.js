require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { sequelize } = require('./models');
const routes = require('./routes');
const { initCronJobs } = require('./cronJobs');

const app = express();

// Middleware de logging para ver qué peticiones llegan
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  next();
});

// Middlewares
app.use(cors({
  origin: function (origin, callback) {
    // Permitir peticiones sin origin (como apps móviles o curl)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175',
      'http://127.0.0.1:5173', 'http://127.0.0.1:5174', 'http://127.0.0.1:5175'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS bloqueado para origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

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
      // Inicializar tareas programadas
      initCronJobs();
    });
  } catch (error) {
    console.error('No se pudo iniciar el servidor:', error);
  }
};

startServer();
