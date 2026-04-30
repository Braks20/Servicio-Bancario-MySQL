const express = require('express');
const router = express.Router();
const auditoriaController = require('../controllers/auditoriaController');
const { verificarToken } = require('../middlewares/auth');
const { verificarRol } = require('../middlewares/roles');

// Todo el acceso a auditoría requiere autenticación y ser admin
router.use(verificarToken);
router.use(verificarRol('admin'));

router.get('/', auditoriaController.listar);
router.get('/:id', auditoriaController.obtener);

module.exports = router;
