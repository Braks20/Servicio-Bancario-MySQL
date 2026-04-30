const express = require('express');
const router = express.Router();
const cuentaController = require('../controllers/cuentaController');
const { verificarToken } = require('../middlewares/auth');
const { verificarRol } = require('../middlewares/roles');

router.use(verificarToken);

// Consultar saldo permitido para clientes y empleados
router.get('/:id/saldo', cuentaController.consultarSaldo);

// Listar y ver detalles (admin y cajeros)
router.get('/', verificarRol('admin', 'cajero'), cuentaController.listar);
router.get('/:id', verificarRol('admin', 'cajero'), cuentaController.obtener);

// Crear y cambiar estado (solo admin o roles autorizados)
router.post('/', verificarRol('admin'), cuentaController.crear);
router.patch('/:id/estado', verificarRol('admin'), cuentaController.actualizarEstado);

module.exports = router;
