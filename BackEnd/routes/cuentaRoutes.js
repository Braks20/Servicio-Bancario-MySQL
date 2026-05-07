const express = require('express');
const router = express.Router();
const cuentaController = require('../controllers/cuentaController');
const { verificarToken } = require('../middlewares/auth');
const { verificarRol } = require('../middlewares/roles');

router.use(verificarToken);

// Consultar saldo permitido para clientes y empleados
router.get('/:id/saldo', cuentaController.consultarSaldo);

// Listar y ver detalles (admin, cajeros y el propio usuario)
router.get('/', verificarRol('admin', 'cajero', 'usuario'), cuentaController.listar);
router.get('/:id', verificarRol('admin', 'cajero', 'usuario'), cuentaController.obtener);

// Crear y cambiar estado
router.post('/', verificarRol('admin', 'usuario'), cuentaController.crear);
router.patch('/:id/estado', verificarRol('admin'), cuentaController.actualizarEstado);

module.exports = router;
