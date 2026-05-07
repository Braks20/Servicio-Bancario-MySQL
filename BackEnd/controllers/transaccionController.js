const { Transaccion, Cuenta, Usuario, Sequelize, sequelize } = require('../models');
const { registrarAuditoria } = require('../middlewares/auditoria');
const crypto = require('crypto');

const transaccionController = {
  // GET /api/transacciones
  listar: async (req, res) => {
    try {
      const { cuenta_id, tipo, estado, fecha_inicio, fecha_fin, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = {};
      
      if (cuenta_id) {
        whereClause[Sequelize.Op.or] = [
          { cuenta_origen: cuenta_id },
          { cuenta_destino: cuenta_id }
        ];
      }
      if (tipo) whereClause.tipo = tipo;
      if (estado) whereClause.estado = estado;
      
      if (fecha_inicio && fecha_fin) {
        whereClause.created_at = {
          [Sequelize.Op.between]: [new Date(fecha_inicio), new Date(fecha_fin)]
        };
      }

      const { count, rows: transacciones } = await Transaccion.findAndCountAll({
        where: whereClause,
        include: [
          { model: Usuario, as: 'usuario', attributes: ['username'] }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      return res.status(200).json({
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit),
        data: transacciones
      });
    } catch (error) {
      console.error('Error al listar transacciones:', error);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
  },

  // GET /api/transacciones/:id
  obtener: async (req, res) => {
    try {
      const { id } = req.params;
      const transaccion = await Transaccion.findByPk(id, {
        include: [
          { model: Cuenta, as: 'origen', attributes: ['numero_cuenta', 'tipo'] },
          { model: Cuenta, as: 'destino', attributes: ['numero_cuenta', 'tipo'] },
          { model: Usuario, as: 'usuario', attributes: ['username'] }
        ]
      });

      if (!transaccion) {
        return res.status(404).json({ error: 'Transacción no encontrada.' });
      }

      return res.status(200).json(transaccion);
    } catch (error) {
      console.error('Error al obtener transacción:', error);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
  },

  // POST /api/transacciones/deposito
  deposito: async (req, res) => {
    // Iniciar transacción de base de datos para garantizar atomicidad
    const t = await sequelize.transaction();

    try {
      const { cuenta_destino, monto, descripcion, referencia, canal } = req.body;
      const montoDecimal = parseFloat(monto);

      if (!cuenta_destino || isNaN(montoDecimal) || montoDecimal <= 0) {
        await t.rollback();
        return res.status(400).json({ error: 'Cuenta destino y un monto válido y mayor a cero son obligatorios.' });
      }

      const cuenta = await Cuenta.findByPk(cuenta_destino, { transaction: t, lock: t.LOCK.UPDATE });
      
      if (!cuenta) {
        await t.rollback();
        return res.status(404).json({ error: 'Cuenta destino no encontrada.' });
      }

      if (cuenta.estado !== 'activa') {
        await t.rollback();
        return res.status(400).json({ error: `La cuenta destino está ${cuenta.estado}.` });
      }

      // Validar límite de depósito: $10,000 por minuto
      const haceUnMinuto = new Date(Date.now() - 60 * 1000);
      const depositosRecientes = await Transaccion.sum('monto', {
        where: {
          cuenta_destino,
          tipo: 'deposito',
          created_at: { [Sequelize.Op.gte]: haceUnMinuto },
          estado: 'completada'
        },
        transaction: t
      }) || 0;

      if (parseFloat(depositosRecientes) + montoDecimal > 10000) {
        await t.rollback();
        return res.status(400).json({ error: 'Límite de depósito excedido: Máximo $10,000 por minuto.' });
      }

      // 1. Crear el registro de la transacción
      const transaccion = await Transaccion.create({
        uuid: crypto.randomUUID(),
        cuenta_destino,
        tipo: 'deposito',
        monto: montoDecimal,
        moneda: cuenta.moneda,
        descripcion: descripcion || 'Depósito en efectivo/cheque',
        referencia,
        estado: 'completada',
        canal: canal || 'sucursal',
        ip_origen: req.ip,
        usuario_id: req.usuario ? req.usuario.id : null
      }, { transaction: t });

      // 2. Actualizar el saldo de la cuenta
      const nuevoSaldo = parseFloat(cuenta.saldo) + montoDecimal;
      const nuevoSaldoDisponible = parseFloat(cuenta.saldo_disponible) + montoDecimal;

      await cuenta.update({
        saldo: nuevoSaldo,
        saldo_disponible: nuevoSaldoDisponible
      }, { transaction: t });

      // 3. Confirmar la transacción (commit)
      await t.commit();

      await registrarAuditoria(req, 'DEPOSITO', 'Transacciones', transaccion.id, null, transaccion.toJSON());

      return res.status(201).json({ mensaje: 'Depósito realizado exitosamente', transaccion });
    } catch (error) {
      // Si hay cualquier error, revertir todos los cambios
      await t.rollback();
      console.error('Error en depósito:', error);
      return res.status(500).json({ error: 'Error interno al procesar el depósito.' });
    }
  },

  // POST /api/transacciones/retiro
  retiro: async (req, res) => {
    const t = await sequelize.transaction();

    try {
      const { cuenta_origen, monto, descripcion, referencia, canal } = req.body;
      const montoDecimal = parseFloat(monto);

      if (!cuenta_origen || isNaN(montoDecimal) || montoDecimal <= 0) {
        await t.rollback();
        return res.status(400).json({ error: 'Cuenta origen y un monto válido mayor a cero son obligatorios.' });
      }

      const cuenta = await Cuenta.findByPk(cuenta_origen, { transaction: t, lock: t.LOCK.UPDATE });
      
      if (!cuenta) {
        await t.rollback();
        return res.status(404).json({ error: 'Cuenta origen no encontrada.' });
      }

      if (cuenta.estado !== 'activa') {
        await t.rollback();
        return res.status(400).json({ error: `La cuenta origen está ${cuenta.estado}.` });
      }

      if (parseFloat(cuenta.saldo_disponible) < montoDecimal) {
        await t.rollback();
        return res.status(400).json({ error: 'Fondos insuficientes.' });
      }

      const transaccion = await Transaccion.create({
        uuid: crypto.randomUUID(),
        cuenta_origen,
        tipo: 'retiro',
        monto: montoDecimal,
        moneda: cuenta.moneda,
        descripcion: descripcion || 'Retiro de fondos',
        referencia,
        estado: 'completada',
        canal: canal || 'cajero',
        ip_origen: req.ip,
        usuario_id: req.usuario ? req.usuario.id : null
      }, { transaction: t });

      const nuevoSaldo = parseFloat(cuenta.saldo) - montoDecimal;
      const nuevoSaldoDisponible = parseFloat(cuenta.saldo_disponible) - montoDecimal;

      await cuenta.update({
        saldo: nuevoSaldo,
        saldo_disponible: nuevoSaldoDisponible
      }, { transaction: t });

      await t.commit();

      await registrarAuditoria(req, 'RETIRO', 'Transacciones', transaccion.id, null, transaccion.toJSON());

      return res.status(201).json({ mensaje: 'Retiro procesado exitosamente', transaccion });
    } catch (error) {
      await t.rollback();
      console.error('Error en retiro:', error);
      return res.status(500).json({ error: 'Error interno al procesar el retiro.' });
    }
  },

  // POST /api/transacciones/transferencia
  transferencia: async (req, res) => {
    const t = await sequelize.transaction();

    try {
      const { cuenta_origen, cuenta_destino, numero_destino, monto, descripcion, referencia, canal } = req.body;
      const montoDecimal = parseFloat(monto);
      
      let target_destino_id = cuenta_destino;

      // Si no viene ID pero sí número, buscarlo
      if (!target_destino_id && numero_destino) {
        const cDest = await Cuenta.findOne({ where: { numero_cuenta: numero_destino }, transaction: t });
        if (cDest) target_destino_id = cDest.id;
      }

      if (!cuenta_origen || !target_destino_id || isNaN(montoDecimal) || montoDecimal <= 0) {
        await t.rollback();
        return res.status(400).json({ error: 'Cuentas de origen/destino y un monto válido son obligatorios.' });
      }

      if (cuenta_origen == target_destino_id) {
        await t.rollback();
        return res.status(400).json({ error: 'La cuenta origen y destino no pueden ser la misma.' });
      }

      // Bloquear las filas en un orden específico
      const idMenor = Math.min(cuenta_origen, target_destino_id);
      const idMayor = Math.max(cuenta_origen, target_destino_id);

      await Cuenta.findByPk(idMenor, { transaction: t, lock: t.LOCK.UPDATE });
      await Cuenta.findByPk(idMayor, { transaction: t, lock: t.LOCK.UPDATE });

      // Ahora que están bloqueadas, las obtenemos
      const cOrigen = await Cuenta.findByPk(cuenta_origen, { transaction: t });
      const cDestino = await Cuenta.findByPk(target_destino_id, { transaction: t });

      if (!cOrigen || !cDestino) {
        await t.rollback();
        return res.status(404).json({ error: 'Una o ambas cuentas no existen.' });
      }

      // Si es un cliente (rol usuario), validar que la cuenta origen sea suya
      if (req.usuario.rol_nombre === 'usuario' && cOrigen.cliente_id !== req.usuario.cliente_id) {
        await t.rollback();
        return res.status(403).json({ error: 'No tienes permiso para realizar transferencias desde esta cuenta.' });
      }

      if (cOrigen.estado !== 'activa' || cDestino.estado !== 'activa') {
        await t.rollback();
        return res.status(400).json({ error: 'Ambas cuentas deben estar activas.' });
      }

      if (cOrigen.moneda !== cDestino.moneda) {
        // Para simplificar, no manejamos cambio de divisa en este sistema base
        await t.rollback();
        return res.status(400).json({ error: 'No se soportan transferencias entre cuentas de diferente moneda actualmente.' });
      }

      if (parseFloat(cOrigen.saldo_disponible) < montoDecimal) {
        await t.rollback();
        return res.status(400).json({ error: 'Fondos insuficientes en la cuenta origen.' });
      }

      // 1. Crear Transacción
      const transaccion = await Transaccion.create({
        uuid: crypto.randomUUID(),
        cuenta_origen,
        cuenta_destino: target_destino_id,
        tipo: 'transferencia',
        monto: montoDecimal,
        moneda: cOrigen.moneda,
        descripcion: descripcion || 'Transferencia de fondos',
        referencia,
        estado: 'completada',
        canal: canal || 'web',
        ip_origen: req.ip,
        usuario_id: req.usuario ? req.usuario.id : null
      }, { transaction: t });

      // 2. Restar origen
      await cOrigen.update({
        saldo: parseFloat(cOrigen.saldo) - montoDecimal,
        saldo_disponible: parseFloat(cOrigen.saldo_disponible) - montoDecimal
      }, { transaction: t });

      // 3. Sumar destino
      await cDestino.update({
        saldo: parseFloat(cDestino.saldo) + montoDecimal,
        saldo_disponible: parseFloat(cDestino.saldo_disponible) + montoDecimal
      }, { transaction: t });

      await t.commit();

      await registrarAuditoria(req, 'TRANSFERENCIA', 'Transacciones', transaccion.id, null, transaccion.toJSON());

      return res.status(201).json({ mensaje: 'Transferencia realizada con éxito', transaccion });
    } catch (error) {
      await t.rollback();
      console.error('Error en transferencia:', error);
      return res.status(500).json({ error: 'Error interno al procesar la transferencia.' });
    }
  },

  // POST /api/transacciones/:id/revertir
  revertir: async (req, res) => {
    // Las transacciones nunca se eliminan físicamente. 
    // Para revertir, se genera una transacción inversa que contrarresta los efectos.
    const t = await sequelize.transaction();

    try {
      const { id } = req.params;
      const transaccionOriginal = await Transaccion.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });

      if (!transaccionOriginal) {
        await t.rollback();
        return res.status(404).json({ error: 'Transacción no encontrada.' });
      }

      if (transaccionOriginal.estado !== 'completada') {
        await t.rollback();
        return res.status(400).json({ error: 'Solo se pueden revertir transacciones completadas.' });
      }

      // Marcar original como revertida
      await transaccionOriginal.update({ estado: 'revertida' }, { transaction: t });

      let cOrigen, cDestino;
      const montoDec = parseFloat(transaccionOriginal.monto);

      // Crear transacción de ajuste que revierte la original
      const transaccionReversion = await Transaccion.create({
        uuid: crypto.randomUUID(),
        cuenta_origen: transaccionOriginal.cuenta_destino, // Invertimos
        cuenta_destino: transaccionOriginal.cuenta_origen, // Invertimos
        tipo: 'ajuste',
        monto: montoDec,
        moneda: transaccionOriginal.moneda,
        descripcion: `Reversión de TRX: ${transaccionOriginal.uuid}`,
        estado: 'completada',
        canal: 'api',
        ip_origen: req.ip,
        usuario_id: req.usuario ? req.usuario.id : null
      }, { transaction: t });

      // Revertir saldos según el tipo original
      if (transaccionOriginal.tipo === 'deposito') {
         cDestino = await Cuenta.findByPk(transaccionOriginal.cuenta_destino, { transaction: t, lock: t.LOCK.UPDATE });
         await cDestino.update({
           saldo: parseFloat(cDestino.saldo) - montoDec,
           saldo_disponible: parseFloat(cDestino.saldo_disponible) - montoDec
         }, { transaction: t });
      } 
      else if (transaccionOriginal.tipo === 'retiro') {
         cOrigen = await Cuenta.findByPk(transaccionOriginal.cuenta_origen, { transaction: t, lock: t.LOCK.UPDATE });
         await cOrigen.update({
           saldo: parseFloat(cOrigen.saldo) + montoDec,
           saldo_disponible: parseFloat(cOrigen.saldo_disponible) + montoDec
         }, { transaction: t });
      }
      else if (transaccionOriginal.tipo === 'transferencia') {
         // Bloqueo ordenado
         const id1 = Math.min(transaccionOriginal.cuenta_origen, transaccionOriginal.cuenta_destino);
         const id2 = Math.max(transaccionOriginal.cuenta_origen, transaccionOriginal.cuenta_destino);
         
         await Cuenta.findByPk(id1, { transaction: t, lock: t.LOCK.UPDATE });
         await Cuenta.findByPk(id2, { transaction: t, lock: t.LOCK.UPDATE });

         cOrigen = await Cuenta.findByPk(transaccionOriginal.cuenta_origen, { transaction: t });
         cDestino = await Cuenta.findByPk(transaccionOriginal.cuenta_destino, { transaction: t });

         // Devolver dinero al origen
         await cOrigen.update({
           saldo: parseFloat(cOrigen.saldo) + montoDec,
           saldo_disponible: parseFloat(cOrigen.saldo_disponible) + montoDec
         }, { transaction: t });

         // Quitar dinero del destino
         await cDestino.update({
           saldo: parseFloat(cDestino.saldo) - montoDec,
           saldo_disponible: parseFloat(cDestino.saldo_disponible) - montoDec
         }, { transaction: t });
      }

      await t.commit();
      
      await registrarAuditoria(req, 'REVERSION', 'Transacciones', transaccionReversion.id, transaccionOriginal.toJSON(), transaccionReversion.toJSON());

      return res.status(200).json({ mensaje: 'Transacción revertida con éxito.', reversion: transaccionReversion });
    } catch (error) {
      await t.rollback();
      console.error('Error al revertir transacción:', error);
      return res.status(500).json({ error: 'Error interno al revertir la transacción.' });
    }
  }
};

module.exports = transaccionController;
