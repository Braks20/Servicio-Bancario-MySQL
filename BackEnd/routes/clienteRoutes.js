const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const { verificarToken } = require('../middlewares/auth');
const { verificarRol } = require('../middlewares/roles');

// Todo debe estar protegido
router.use(verificarToken);

// Solo admin y cajeros pueden gestionar clientes
router.use(verificarRol('admin', 'cajero'));

router.get('/', clienteController.listar);
router.get('/:id', clienteController.obtener);
router.post('/', clienteController.crear);
router.put('/:id', clienteController.actualizar);
router.patch('/:id/estado', clienteController.cambiarEstado);

module.exports = router;
