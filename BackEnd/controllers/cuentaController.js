const { Cuenta, Cliente, Transaccion, Sequelize } = require('../models');
const { registrarAuditoria } = require('../middlewares/auditoria');
const { Op } = Sequelize;

// Helper para generar número de cuenta único (ej. 10 digitos: 20xxxxxxxx)
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
    if (!cuenta) {
      existe = false;
    }
  }

  return numeroGenerado;
};

const cuentaController = {
  // GET /api/cuentas
  listar: async (req, res) => {
    try {
      const { cliente_id, tipo, estado, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = {};
      if (cliente_id) whereClause.cliente_id = cliente_id;
      if (tipo) whereClause.tipo = tipo;
      if (estado) whereClause.estado = estado;

      const { count, rows: cuentas } = await Cuenta.findAndCountAll({
        where: whereClause,
        include: [{ model: Cliente, as: 'cliente', attributes: ['nombre', 'apellido', 'dpi'] }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      return res.status(200).json({
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit),
        data: cuentas
      });
    } catch (error) {
      console.error('Error al listar cuentas:', error);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
  },

  // GET /api/cuentas/:id
  obtener: async (req, res) => {
    try {
      const { id } = req.params;
      const cuenta = await Cuenta.findByPk(id, {
        include: [
          { model: Cliente, as: 'cliente', attributes: ['nombre', 'apellido'] },
          { model: Transaccion, as: 'transacciones_enviadas', limit: 10, order: [['created_at', 'DESC']] },
          { model: Transaccion, as: 'transacciones_recibidas', limit: 10, order: [['created_at', 'DESC']] }
        ]
      });

      if (!cuenta) {
        return res.status(404).json({ error: 'Cuenta no encontrada.' });
      }

      return res.status(200).json(cuenta);
    } catch (error) {
      console.error('Error al obtener cuenta:', error);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
  },

  // POST /api/cuentas
  crear: async (req, res) => {
    try {
      const { cliente_id, tipo, moneda = 'GTQ' } = req.body;

      if (!cliente_id || !tipo) {
        return res.status(400).json({ error: 'cliente_id y tipo son obligatorios.' });
      }

      const cliente = await Cliente.findByPk(cliente_id);
      if (!cliente) {
        return res.status(404).json({ error: 'Cliente no encontrado.' });
      }

      const numero_cuenta = await generarNumeroCuenta(tipo);

      const nuevaCuenta = await Cuenta.create({
        numero_cuenta,
        cliente_id,
        tipo,
        moneda,
        saldo: 0.00,
        saldo_disponible: 0.00,
        estado: 'activa',
        fecha_apertura: new Date()
      });

      await registrarAuditoria(req, 'CREAR_CUENTA', 'Cuentas', nuevaCuenta.id, null, nuevaCuenta.toJSON());

      return res.status(201).json({ mensaje: 'Cuenta creada exitosamente.', cuenta: nuevaCuenta });
    } catch (error) {
      console.error('Error al crear cuenta:', error);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
  },

  // PATCH /api/cuentas/:id/estado
  actualizarEstado: async (req, res) => {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      if (!['activa', 'inactiva', 'congelada', 'cerrada'].includes(estado)) {
        return res.status(400).json({ error: 'Estado no válido.' });
      }

      const cuenta = await Cuenta.findByPk(id);
      if (!cuenta) {
        return res.status(404).json({ error: 'Cuenta no encontrada.' });
      }

      if (estado === 'cerrada' && parseFloat(cuenta.saldo) > 0) {
        return res.status(400).json({ error: 'No se puede cerrar una cuenta con saldo mayor a cero.' });
      }

      const datosAnteriores = cuenta.toJSON();
      cuenta.estado = estado;
      await cuenta.save();

      await registrarAuditoria(req, 'CAMBIO_ESTADO_CUENTA', 'Cuentas', cuenta.id, datosAnteriores, cuenta.toJSON());

      return res.status(200).json({ mensaje: `Estado de la cuenta cambiado a ${estado}.`, cuenta });
    } catch (error) {
      console.error('Error al actualizar estado de cuenta:', error);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
  },

  // GET /api/cuentas/:id/saldo
  consultarSaldo: async (req, res) => {
    try {
      const { id } = req.params;
      // Optimización: solo traer los campos necesarios
      const cuenta = await Cuenta.findByPk(id, {
        attributes: ['id', 'numero_cuenta', 'moneda', 'saldo', 'saldo_disponible', 'estado']
      });

      if (!cuenta) {
        return res.status(404).json({ error: 'Cuenta no encontrada.' });
      }

      // Solo el propietario o empleados pueden consultar saldo
      // Asumiendo que `req.usuario.cliente_id` es el cliente autenticado
      if (req.usuario.rol_nombre === 'cliente' && req.usuario.cliente_id !== cuenta.cliente_id) {
         return res.status(403).json({ error: 'No tiene permiso para ver esta cuenta.' });
      }

      return res.status(200).json(cuenta);
    } catch (error) {
      console.error('Error al consultar saldo:', error);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
  }
};

module.exports = cuentaController;
