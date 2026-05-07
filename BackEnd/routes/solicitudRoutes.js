const express = require('express');
const router = express.Router();
const solicitudController = require('../controllers/solicitudController');
const { verificarToken } = require('../middlewares/auth');
const { verificarRol } = require('../middlewares/roles');

router.use(verificarToken);

// Usuarios pueden crear solicitudes
router.post('/', verificarRol('usuario'), solicitudController.crear);

// Admin puede ver todas, usuarios solo las suyas
router.get('/', verificarRol('admin', 'usuario'), solicitudController.listar);
router.patch('/:id/procesar', verificarRol('admin'), solicitudController.procesar);

module.exports = router;
