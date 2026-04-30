const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verificarToken } = require('../middlewares/auth');

router.post('/login', authController.login);
router.post('/logout', verificarToken, authController.logout);
router.put('/cambiar-password', verificarToken, authController.cambiarPassword);
router.get('/perfil', verificarToken, authController.perfil);

module.exports = router;
