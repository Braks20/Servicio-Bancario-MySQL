const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { verificarToken } = require('../middlewares/auth');
const { verificarRol } = require('../middlewares/roles');

// Todas las rutas de estadísticas requieren ser administrador
router.get('/dashboard', verificarToken, verificarRol('admin'), statsController.getDashboardStats);

module.exports = router;
