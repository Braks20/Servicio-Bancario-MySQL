const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { verificarToken } = require('../middlewares/auth');
const { verificarRol } = require('../middlewares/roles');

// Todas las operaciones de usuarios requieren autenticación
router.use(verificarToken);

// Solo el rol 'admin' puede gestionar usuarios masivamente
router.get('/', verificarRol('admin'), usuarioController.listar);
router.patch('/:id/estado', verificarRol('admin'), usuarioController.cambiarEstado);
router.post('/:id/desbloquear', verificarRol('admin'), usuarioController.desbloquear);

module.exports = router;
