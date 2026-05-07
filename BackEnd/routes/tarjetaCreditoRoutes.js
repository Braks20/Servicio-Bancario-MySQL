const express = require('express');
const router = express.Router();
const tarjetaCreditoController = require('../controllers/tarjetaCreditoController');
const { verificarToken } = require('../middlewares/auth');
const { verificarRol } = require('../middlewares/roles');

router.use(verificarToken);

router.get('/', tarjetaCreditoController.listar);
router.get('/:id', tarjetaCreditoController.obtener);

// Emisión y estado (solo admin)
router.post('/', verificarRol('admin'), tarjetaCreditoController.crear);
router.patch('/:id/estado', verificarRol('admin'), tarjetaCreditoController.actualizarEstado);

// Pagar saldo (cajero o cliente)
router.post('/:id/pagar', verificarRol('admin', 'cajero', 'usuario'), tarjetaCreditoController.pagarSaldo);

module.exports = router;
