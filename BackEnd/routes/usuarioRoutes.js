const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { verificarToken } = require('../middlewares/auth');
const { verificarRol } = require('../middlewares/roles');

// Todas las operaciones de usuarios requieren autenticación
router.use(verificarToken);

// Solo el rol 'admin' puede desbloquear cuentas
router.post('/:id/desbloquear', verificarRol('admin'), usuarioController.desbloquear);

module.exports = router;
