const { SolicitudCuenta, Cliente, Cuenta, Notificacion, sequelize } = require('../models');
const { registrarAuditoria } = require('../middlewares/auditoria');

// Helper para generar número de cuenta (copiado de cuentaController por simplicidad)
const generarNumeroCuenta = async (tipo) => {
  let prefijo = '20'; // Ahorro
  if (tipo === 'corriente') prefijo = '30';
  if (tipo === 'plazo_fijo') prefijo = '40';
  if (tipo === 'empresarial') prefijo = '50';

  let numeroGenerado;
  let existe = true;
  while (existe) {
    const random8 = Math.floor(10000000 + Math.random() * 90000000).toString();
    numeroGenerado = `${prefijo}${random8}`;
    const cuenta = await Cuenta.findOne({ where: { numero_cuenta: numeroGenerado } });
    if (!cuenta) existe = false;
  }
  return numeroGenerado;
};

const solicitudController = {
  // POST /api/solicitudes
  crear: async (req, res) => {
    try {
      const { tipo_cuenta, moneda, observaciones } = req.body;
      const cliente_id = req.usuario.cliente_id;

      if (!cliente_id) {
        return res.status(403).json({ error: 'Usuario no tiene perfil de cliente vinculado.' });
      }

      const solicitud = await SolicitudCuenta.create({
        cliente_id,
        tipo_cuenta,
        moneda: moneda || 'GTQ',
        observaciones,
        estado: 'pendiente'
      });

      await registrarAuditoria(req, 'SOLICITUD_CUENTA', 'SolicitudesCuentas', solicitud.id);

      return res.status(201).json({ mensaje: 'Solicitud enviada exitosamente.', solicitud });
    } catch (error) {
      console.error('Error al crear solicitud:', error);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
  },

  // GET /api/solicitudes
  listar: async (req, res) => {
    try {
      let whereClause = {};
      
      // Si es usuario normal, solo ve sus propias solicitudes
      if (req.usuario.rol_nombre === 'usuario') {
        whereClause.cliente_id = req.usuario.cliente_id;
      }

      const solicitudes = await SolicitudCuenta.findAll({
        where: whereClause,
        include: [{ model: Cliente, as: 'cliente', attributes: ['nombre', 'apellido', 'dpi'] }],
        order: [['created_at', 'DESC']]
      });
      return res.status(200).json(solicitudes);
    } catch (error) {
      console.error('Error al listar solicitudes:', error);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
  },

  // PATCH /api/solicitudes/:id/procesar
  procesar: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const { estado, motivo_rechazo } = req.body;

      if (!['aprobada', 'denegada'].includes(estado)) {
        await t.rollback();
        return res.status(400).json({ error: 'Estado no válido.' });
      }

      const solicitud = await SolicitudCuenta.findByPk(id, { transaction: t });
      if (!solicitud) {
        await t.rollback();
        return res.status(404).json({ error: 'Solicitud no encontrada.' });
      }

      if (solicitud.estado !== 'pendiente') {
        await t.rollback();
        return res.status(400).json({ error: 'Esta solicitud ya ha sido procesada.' });
      }

      await solicitud.update({ estado, motivo_rechazo }, { transaction: t });

      let mensajeNotificacion = '';

      if (estado === 'aprobada') {
        // Crear la cuenta bancaria
        const numero_cuenta = await generarNumeroCuenta(solicitud.tipo_cuenta);
        const nuevaCuenta = await Cuenta.create({
          numero_cuenta,
          cliente_id: solicitud.cliente_id,
          tipo: solicitud.tipo_cuenta,
          moneda: solicitud.moneda,
          saldo: 0,
          saldo_disponible: 0,
          estado: 'activa',
          fecha_apertura: new Date()
        }, { transaction: t });

        mensajeNotificacion = `¡Felicidades! Tu solicitud de cuenta ${solicitud.tipo_cuenta} ha sido aprobada. Tu nuevo número de cuenta es: ${numero_cuenta}`;
      } else {
        mensajeNotificacion = `Lo sentimos, tu solicitud de cuenta ha sido denegada. Motivo: ${motivo_rechazo || 'No especificado'}.`;
      }

      // Crear notificación para el cliente
      await Notificacion.create({
        cliente_id: solicitud.cliente_id,
        tipo: 'push',
        titulo: estado === 'aprobada' ? 'Cuenta Aprobada' : 'Cuenta Denegada',
        mensaje: mensajeNotificacion,
        leida: false,
        enviada: true
      }, { transaction: t });

      await t.commit();
      
      await registrarAuditoria(req, 'PROCESAR_SOLICITUD', 'SolicitudesCuentas', solicitud.id);

      return res.status(200).json({ mensaje: `Solicitud ${estado} con éxito.`, solicitud });
    } catch (error) {
      await t.rollback();
      console.error('Error al procesar solicitud:', error);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
  }
};

module.exports = solicitudController;
