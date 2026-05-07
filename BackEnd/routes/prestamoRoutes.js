const express = require('express');
const router = express.Router();
const prestamoController = require('../controllers/prestamoController');
const { verificarToken } = require('../middlewares/auth');
const { verificarRol } = require('../middlewares/roles');

router.use(verificarToken);

router.get('/', prestamoController.listar);
router.get('/:id', prestamoController.obtener);

// Solicitar un préstamo (puede hacerlo un cliente o un empleado)
router.post('/', verificarRol('admin', 'cajero', 'usuario'), prestamoController.solicitar);

// Aprobación y activación exclusivas de admin
router.patch('/:id/aprobar', verificarRol('admin'), prestamoController.aprobar);
router.patch('/:id/activar', verificarRol('admin'), prestamoController.activar);

// Pagar cuota (lo puede hacer el cajero o el cliente desde su cuenta)
router.post('/:id/pagar', verificarRol('admin', 'cajero', 'usuario'), prestamoController.pagarCuota);

module.exports = router;
