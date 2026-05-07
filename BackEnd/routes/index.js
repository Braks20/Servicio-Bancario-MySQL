const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const clienteRoutes = require('./clienteRoutes');
const cuentaRoutes = require('./cuentaRoutes');
const transaccionRoutes = require('./transaccionRoutes');
const prestamoRoutes = require('./prestamoRoutes');
const tarjetaCreditoRoutes = require('./tarjetaCreditoRoutes');
const auditoriaRoutes = require('./auditoriaRoutes');
const solicitudRoutes = require('./solicitudRoutes');
const notificacionRoutes = require('./notificacionRoutes');
const usuarioRoutes = require('./usuarioRoutes');
const statsRoutes = require('./statsRoutes');

router.use('/auth', authRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/clientes', clienteRoutes);
router.use('/cuentas', cuentaRoutes);
router.use('/transacciones', transaccionRoutes);
router.use('/prestamos', prestamoRoutes);
router.use('/tarjetas', tarjetaCreditoRoutes);
router.use('/auditoria', auditoriaRoutes);
router.use('/solicitudes', solicitudRoutes);
router.use('/notificaciones', notificacionRoutes);
router.use('/stats', statsRoutes);

module.exports = router;
