const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const clienteRoutes = require('./clienteRoutes');
const cuentaRoutes = require('./cuentaRoutes');
const transaccionRoutes = require('./transaccionRoutes');
const prestamoRoutes = require('./prestamoRoutes');
const tarjetaCreditoRoutes = require('./tarjetaCreditoRoutes');
const auditoriaRoutes = require('./auditoriaRoutes');

router.use('/auth', authRoutes);
router.use('/clientes', clienteRoutes);
router.use('/cuentas', cuentaRoutes);
router.use('/transacciones', transaccionRoutes);
router.use('/prestamos', prestamoRoutes);
router.use('/tarjetas', tarjetaCreditoRoutes);
router.use('/auditoria', auditoriaRoutes);

module.exports = router;
