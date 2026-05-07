const express = require('express');
const router = express.Router();
const transaccionController = require('../controllers/transaccionController');
const { verificarToken } = require('../middlewares/auth');
const { verificarRol } = require('../middlewares/roles');

router.use(verificarToken);

// Listar y obtener detalle (admin y cajeros)
// Nota: un cliente debería poder ver solo sus propias transacciones (requeriría lógica extra en el controlador)
router.get('/', verificarRol('admin', 'cajero', 'usuario'), transaccionController.listar);
router.get('/:id', verificarRol('admin', 'cajero', 'usuario'), transaccionController.obtener);

// Operaciones
router.post('/deposito', verificarRol('admin', 'cajero'), transaccionController.deposito);
router.post('/retiro', verificarRol('admin', 'cajero'), transaccionController.retiro);

// Transferencias pueden ser hechas por clientes en la web
router.post('/transferencia', verificarRol('admin', 'cajero', 'usuario'), transaccionController.transferencia);

// Revertir (solo administradores, muy delicado)
router.post('/:id/revertir', verificarRol('admin'), transaccionController.revertir);

module.exports = router;
