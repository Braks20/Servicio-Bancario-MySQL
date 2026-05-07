const { TarjetaCredito, Cliente, Cuenta, Transaccion, sequelize } = require('../models');
const { registrarAuditoria } = require('../middlewares/auditoria');
const crypto = require('crypto');

// Generador simplificado de número de tarjeta
const generarNumeroTarjeta = () => {
  // Ej: 4532 (Visa) + 12 dígitos aleatorios
  const prefijo = '4532';
  let numero = prefijo;
  for (let i = 0; i < 12; i++) {
    numero += Math.floor(Math.random() * 10).toString();
  }
  return numero;
};

// Enmascarar tarjeta: **** **** **** 1234
const enmascararTarjeta = (numero) => {
  if (!numero || numero.length < 16) return numero;
  const ultimos4 = numero.slice(-4);
  return `**** **** **** ${ultimos4}`;
};

const tarjetaCreditoController = {
  // GET /api/tarjetas
  listar: async (req, res) => {
    try {
      const { cliente_id, estado, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = {};
      if (cliente_id) whereClause.cliente_id = cliente_id;
      if (estado) whereClause.estado = estado;

      const { count, rows: tarjetas } = await TarjetaCredito.findAndCountAll({
        where: whereClause,
        include: [
          { model: Cliente, as: 'cliente', attributes: ['nombre', 'apellido', 'dpi'] }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      // Enmascarar números antes de enviar
      const tarjetasEnmascaradas = tarjetas.map(t => {
        const tJson = t.toJSON();
        tJson.numero_tarjeta = enmascararTarjeta(tJson.numero_tarjeta);
        return tJson;
      });

      return res.status(200).json({
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit),
        data: tarjetasEnmascaradas
      });
    } catch (error) {
      console.error('Error al listar tarjetas:', error);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
  },

  // GET /api/tarjetas/:id
  obtener: async (req, res) => {
    try {
      const { id } = req.params;
      const tarjeta = await TarjetaCredito.findByPk(id, {
        include: [
          { model: Cliente, as: 'cliente', attributes: ['nombre', 'apellido'] }
        ]
      });

      if (!tarjeta) {
        return res.status(404).json({ error: 'Tarjeta no encontrada.' });
      }

      const tarjetaJson = tarjeta.toJSON();
      tarjetaJson.numero_tarjeta = enmascararTarjeta(tarjetaJson.numero_tarjeta);

      return res.status(200).json(tarjetaJson);
    } catch (error) {
      console.error('Error al obtener tarjeta:', error);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
  },

  // POST /api/tarjetas
  crear: async (req, res) => {
    try {
      const { cliente_id, tipo, limite_credito, dia_corte, dia_pago } = req.body;

      if (!cliente_id || !limite_credito || !dia_corte || !dia_pago) {
        return res.status(400).json({ error: 'Faltan campos obligatorios para emitir la tarjeta.' });
      }

      // Validar si el cliente ya tiene una tarjeta
      const tarjetaExistente = await TarjetaCredito.findOne({ where: { cliente_id } });
      if (tarjetaExistente) {
        return res.status(400).json({ error: 'El cliente ya posee una tarjeta de crédito. Límite máximo: 1.' });
      }

      const numero_tarjeta = generarNumeroTarjeta();
      
      const nuevaTarjeta = await TarjetaCredito.create({
        cliente_id,
        numero_tarjeta,
        limite_credito,
        saldo_utilizado: 0.00,
        fecha_corte: dia_corte,
        fecha_pago: dia_pago,
        estado: 'activa'
      });

      const tarjetaRespuesta = nuevaTarjeta.toJSON();
      tarjetaRespuesta.numero_tarjeta = enmascararTarjeta(tarjetaRespuesta.numero_tarjeta);

      await registrarAuditoria(req, 'EMITIR_TARJETA', 'TarjetasCredito', nuevaTarjeta.id, null, nuevaTarjeta.toJSON());

      return res.status(201).json({ mensaje: 'Tarjeta emitida exitosamente', tarjeta: tarjetaRespuesta });
    } catch (error) {
      console.error('Error al emitir tarjeta:', error);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
  },

  // PATCH /api/tarjetas/:id/estado
  actualizarEstado: async (req, res) => {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      if (!['activa', 'bloqueada', 'cancelada'].includes(estado)) {
        return res.status(400).json({ error: 'Estado no válido.' });
      }

      const tarjeta = await TarjetaCredito.findByPk(id);
      if (!tarjeta) return res.status(404).json({ error: 'Tarjeta no encontrada.' });

      if (estado === 'cancelada' && parseFloat(tarjeta.saldo_utilizado) > 0) {
        return res.status(400).json({ error: 'No se puede cancelar una tarjeta con saldo pendiente.' });
      }

      const datosAnteriores = tarjeta.toJSON();
      
      await tarjeta.update({ estado });

      await registrarAuditoria(req, 'CAMBIO_ESTADO_TARJETA', 'TarjetasCredito', tarjeta.id, datosAnteriores, tarjeta.toJSON());

      return res.status(200).json({ mensaje: `Estado de tarjeta cambiado a ${estado}.` });
    } catch (error) {
      console.error('Error al actualizar estado de tarjeta:', error);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
  },

  // POST /api/tarjetas/:id/pagar
  pagarSaldo: async (req, res) => {
    const t = await sequelize.transaction();

    try {
      const { id } = req.params;
      const { cuenta_origen, monto_pago } = req.body;
      const monto = parseFloat(monto_pago);

      if (!cuenta_origen || isNaN(monto) || monto <= 0) {
        await t.rollback();
        return res.status(400).json({ error: 'Cuenta de origen y monto válido son requeridos.' });
      }

      const tarjeta = await TarjetaCredito.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
      if (!tarjeta) {
        await t.rollback();
        return res.status(404).json({ error: 'Tarjeta no encontrada.' });
      }

      if (tarjeta.estado !== 'activa' && tarjeta.estado !== 'bloqueada') {
        await t.rollback();
        return res.status(400).json({ error: 'No se admiten pagos a tarjetas canceladas.' });
      }

      if (parseFloat(tarjeta.saldo_utilizado) <= 0) {
        return res.status(400).json({ error: 'La tarjeta no presenta saldo adeudado.' });
      }

      const cuenta = await Cuenta.findByPk(cuenta_origen, { transaction: t, lock: t.LOCK.UPDATE });
      if (!cuenta || cuenta.estado !== 'activa') {
        await t.rollback();
        return res.status(400).json({ error: 'Cuenta de origen inválida o inactiva.' });
      }

      if (parseFloat(cuenta.saldo_disponible) < monto) {
        await t.rollback();
        return res.status(400).json({ error: 'Fondos insuficientes en la cuenta para el pago.' });
      }

      // 1. Descontar de la cuenta
      await cuenta.update({
        saldo: parseFloat(cuenta.saldo) - monto,
        saldo_disponible: parseFloat(cuenta.saldo_disponible) - monto
      }, { transaction: t });

      // 2. Crear transacción
      const transaccion = await Transaccion.create({
        uuid: crypto.randomUUID(),
        cuenta_origen: cuenta.id,
        tipo: 'pago',
        monto: monto,
        moneda: cuenta.moneda,
        descripcion: `Pago de Tarjeta de Crédito (ID: ${tarjeta.id})`,
        estado: 'completada',
        canal: 'web',
        ip_origen: req.ip,
        usuario_id: req.usuario ? req.usuario.id : null
      }, { transaction: t });

      // 3. Disminuir saldo adeudado de la tarjeta
      const datosAnteriores = tarjeta.toJSON();
      let nuevoSaldoTarjeta = parseFloat(tarjeta.saldo_utilizado) - monto;
      if (nuevoSaldoTarjeta < 0) nuevoSaldoTarjeta = 0; // Evitar saldo negativo

      await tarjeta.update({ saldo_utilizado: nuevoSaldoTarjeta }, { transaction: t });

      await t.commit();

      await registrarAuditoria(req, 'PAGO_TARJETA', 'TarjetasCredito', tarjeta.id, datosAnteriores, tarjeta.toJSON());

      return res.status(200).json({ mensaje: 'Pago de tarjeta procesado exitosamente.' });
    } catch (error) {
      await t.rollback();
      console.error('Error al pagar tarjeta:', error);
      return res.status(500).json({ error: 'Error interno al procesar el pago de la tarjeta.' });
    }
  }
};

module.exports = tarjetaCreditoController;
