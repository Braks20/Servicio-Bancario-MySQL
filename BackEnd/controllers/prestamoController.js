const { Prestamo, Cuenta, Cliente, Transaccion, sequelize, Sequelize } = require('../models');
const { registrarAuditoria } = require('../middlewares/auditoria');
const crypto = require('crypto');

const calcularCuotaMensual = (monto, tasaAnual, plazoMeses) => {
  // Fórmula: cuota = P * (r * (1 + r)^n) / ((1 + r)^n - 1)
  // donde P = monto, r = tasa mensual, n = plazo en meses
  const tasaMensual = parseFloat(tasaAnual) / 12;
  if (tasaMensual === 0) return monto / plazoMeses;
  
  const factor = Math.pow(1 + tasaMensual, plazoMeses);
  const cuota = monto * (tasaMensual * factor) / (factor - 1);
  return parseFloat(cuota.toFixed(2));
};

const prestamoController = {
  // GET /api/prestamos
  listar: async (req, res) => {
    try {
      const { cliente_id, estado, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = {};
      if (cliente_id) whereClause.cliente_id = cliente_id;
      if (estado) whereClause.estado = estado;

      const { count, rows: prestamos } = await Prestamo.findAndCountAll({
        where: whereClause,
        include: [
          { model: Cliente, as: 'cliente', attributes: ['nombre', 'apellido', 'dpi'] },
          { model: Cuenta, as: 'cuenta', attributes: ['numero_cuenta'] }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      return res.status(200).json({
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit),
        data: prestamos
      });
    } catch (error) {
      console.error('Error al listar préstamos:', error);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
  },

  // GET /api/prestamos/:id
  obtener: async (req, res) => {
    try {
      const { id } = req.params;
      const prestamo = await Prestamo.findByPk(id, {
        include: [
          { model: Cliente, as: 'cliente', attributes: ['nombre', 'apellido', 'dpi'] },
          { model: Cuenta, as: 'cuenta', attributes: ['numero_cuenta', 'moneda'] }
        ]
      });

      if (!prestamo) {
        return res.status(404).json({ error: 'Préstamo no encontrado.' });
      }

      return res.status(200).json(prestamo);
    } catch (error) {
      console.error('Error al obtener préstamo:', error);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
  },

  // POST /api/prestamos
  solicitar: async (req, res) => {
    try {
      const { cliente_id, cuenta_id, monto_aprobado, tasa_interes, plazo_meses } = req.body;

      if (!cliente_id || !cuenta_id || !monto_aprobado || !tasa_interes || !plazo_meses) {
        return res.status(400).json({ error: 'Todos los campos son requeridos para solicitar un préstamo.' });
      }

      const cuenta = await Cuenta.findByPk(cuenta_id);
      if (!cuenta || cuenta.cliente_id !== parseInt(cliente_id)) {
        return res.status(400).json({ error: 'Cuenta inválida o no pertenece al cliente.' });
      }

      const cuota_mensual = calcularCuotaMensual(parseFloat(monto_aprobado), parseFloat(tasa_interes), parseInt(plazo_meses));

      const nuevoPrestamo = await Prestamo.create({
        cliente_id,
        cuenta_id,
        monto_aprobado,
        monto_pendiente: monto_aprobado, // Al inicio se debe todo el capital
        tasa_interes,
        plazo_meses,
        cuota_mensual,
        estado: 'solicitado'
      });

      await registrarAuditoria(req, 'SOLICITAR_PRESTAMO', 'Prestamos', nuevoPrestamo.id, null, nuevoPrestamo.toJSON());

      return res.status(201).json({ mensaje: 'Préstamo solicitado exitosamente', prestamo: nuevoPrestamo });
    } catch (error) {
      console.error('Error al solicitar préstamo:', error);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
  },

  // PATCH /api/prestamos/:id/aprobar
  aprobar: async (req, res) => {
    try {
      const { id } = req.params;
      
      const prestamo = await Prestamo.findByPk(id);
      if (!prestamo) return res.status(404).json({ error: 'Préstamo no encontrado.' });
      
      if (prestamo.estado !== 'solicitado') {
        return res.status(400).json({ error: `El préstamo no puede ser aprobado desde el estado: ${prestamo.estado}` });
      }

      const datosAnteriores = prestamo.toJSON();
      
      await prestamo.update({ 
        estado: 'aprobado',
        fecha_aprobacion: new Date()
      });

      await registrarAuditoria(req, 'APROBAR_PRESTAMO', 'Prestamos', prestamo.id, datosAnteriores, prestamo.toJSON());

      return res.status(200).json({ mensaje: 'Préstamo aprobado.', prestamo });
    } catch (error) {
      console.error('Error al aprobar préstamo:', error);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
  },

  // PATCH /api/prestamos/:id/activar
  activar: async (req, res) => {
    const t = await sequelize.transaction();

    try {
      const { id } = req.params;
      
      const prestamo = await Prestamo.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
      if (!prestamo) {
        await t.rollback();
        return res.status(404).json({ error: 'Préstamo no encontrado.' });
      }
      
      if (prestamo.estado !== 'aprobado') {
        await t.rollback();
        return res.status(400).json({ error: `El préstamo debe estar aprobado para ser desembolsado. Estado actual: ${prestamo.estado}` });
      }

      const cuenta = await Cuenta.findByPk(prestamo.cuenta_id, { transaction: t, lock: t.LOCK.UPDATE });
      if (!cuenta || cuenta.estado !== 'activa') {
        await t.rollback();
        return res.status(400).json({ error: 'La cuenta asociada no está activa o no existe.' });
      }

      // 1. Crear transacción de depósito por desembolso
      const montoDesembolso = parseFloat(prestamo.monto_aprobado);
      
      const transaccion = await Transaccion.create({
        uuid: crypto.randomUUID(),
        cuenta_destino: cuenta.id,
        tipo: 'deposito',
        monto: montoDesembolso,
        moneda: cuenta.moneda,
        descripcion: `Desembolso de Préstamo ID ${prestamo.id}`,
        estado: 'completada',
        canal: 'sucursal',
        ip_origen: req.ip,
        usuario_id: req.usuario ? req.usuario.id : null
      }, { transaction: t });

      // 2. Sumar a la cuenta
      await cuenta.update({
        saldo: parseFloat(cuenta.saldo) + montoDesembolso,
        saldo_disponible: parseFloat(cuenta.saldo_disponible) + montoDesembolso
      }, { transaction: t });

      // 3. Actualizar préstamo
      const fechaVencimiento = new Date();
      fechaVencimiento.setMonth(fechaVencimiento.getMonth() + prestamo.plazo_meses);

      const datosAnteriores = prestamo.toJSON();

      await prestamo.update({
        estado: 'activo',
        fecha_vencimiento: fechaVencimiento
      }, { transaction: t });

      await t.commit();

      await registrarAuditoria(req, 'ACTIVAR_PRESTAMO', 'Prestamos', prestamo.id, datosAnteriores, prestamo.toJSON());

      return res.status(200).json({ mensaje: 'Préstamo desembolsado exitosamente.', prestamo });
    } catch (error) {
      await t.rollback();
      console.error('Error al activar préstamo:', error);
      return res.status(500).json({ error: 'Error interno al activar el préstamo.' });
    }
  },

  // POST /api/prestamos/:id/pagar
  pagarCuota: async (req, res) => {
    const t = await sequelize.transaction();

    try {
      const { id } = req.params;
      const { monto_pago } = req.body;
      const monto = parseFloat(monto_pago);

      if (isNaN(monto) || monto <= 0) {
        await t.rollback();
        return res.status(400).json({ error: 'Monto de pago inválido.' });
      }

      const prestamo = await Prestamo.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
      if (!prestamo || prestamo.estado !== 'activo') {
        await t.rollback();
        return res.status(400).json({ error: 'El préstamo no existe o no está activo.' });
      }

      const cuenta = await Cuenta.findByPk(prestamo.cuenta_id, { transaction: t, lock: t.LOCK.UPDATE });
      
      if (parseFloat(cuenta.saldo_disponible) < monto) {
        await t.rollback();
        return res.status(400).json({ error: 'Fondos insuficientes en la cuenta para realizar el pago.' });
      }

      // 1. Descontar de la cuenta
      await cuenta.update({
        saldo: parseFloat(cuenta.saldo) - monto,
        saldo_disponible: parseFloat(cuenta.saldo_disponible) - monto
      }, { transaction: t });

      // 2. Crear transacción de pago
      const transaccion = await Transaccion.create({
        uuid: crypto.randomUUID(),
        cuenta_origen: cuenta.id,
        tipo: 'pago',
        monto: monto,
        moneda: cuenta.moneda,
        descripcion: `Pago de cuota - Préstamo ID ${prestamo.id}`,
        estado: 'completada',
        canal: 'web',
        ip_origen: req.ip,
        usuario_id: req.usuario ? req.usuario.id : null
      }, { transaction: t });

      // 3. Actualizar saldo del préstamo
      // Nota: En un sistema real se calcularía cuánto es a capital y cuánto a interés.
      // Para esta base, descontamos directo del monto pendiente.
      const datosAnteriores = prestamo.toJSON();
      let nuevoMontoPendiente = parseFloat(prestamo.monto_pendiente) - monto;
      let nuevoEstado = prestamo.estado;

      if (nuevoMontoPendiente <= 0) {
        nuevoMontoPendiente = 0;
        nuevoEstado = 'pagado';
      }

      await prestamo.update({
        monto_pendiente: nuevoMontoPendiente,
        estado: nuevoEstado
      }, { transaction: t });

      await t.commit();

      await registrarAuditoria(req, 'PAGO_PRESTAMO', 'Prestamos', prestamo.id, datosAnteriores, prestamo.toJSON());

      return res.status(200).json({ mensaje: 'Pago registrado exitosamente.', prestamo });
    } catch (error) {
      await t.rollback();
      console.error('Error al pagar préstamo:', error);
      return res.status(500).json({ error: 'Error interno al procesar el pago del préstamo.' });
    }
  }
};

module.exports = prestamoController;
