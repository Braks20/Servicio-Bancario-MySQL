const express = require('express');
const router = express.Router();
const notificacionController = require('../controllers/notificacionController');
const { verificarToken } = require('../middlewares/auth');

router.use(verificarToken);

router.get('/', notificacionController.listar);
router.patch('/:id/leer', notificacionController.marcarLeida);

module.exports = router;
